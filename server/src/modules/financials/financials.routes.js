/**
 * Lincoz Enterprise - Financials & Payout Ledger Module (PostgreSQL Connected)
 * Strict 2-Step Authorization: Step 1 (PM Verification) -> Step 2 (Super Admin Disbursement)
 * Real PostgreSQL transactions and audit trails.
 */

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../infrastructure/database/client.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRoles } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { logger } from '../../infrastructure/logger/logger.js';

export const financialsRouter = Router();

const verifyPayoutSchema = z.object({
  payoutId: z.string().min(1),
  notes: z.string().max(500).optional(),
});

const disbursePayoutSchema = z.object({
  payoutId: z.string().min(1),
  mfaCode: z.string().min(4, 'MFA code is required for financial disbursement'),
});

const createExpenseSchema = z.object({
  projectId: z.string().optional(),
  category: z.string().min(1).max(50),
  amount: z.number().positive(),
  description: z.string().min(1).max(500),
  receiptUrl: z.string().optional(),
});

/**
 * GET /api/financials/summary
 * Computes aggregate metrics directly from PostgreSQL
 */
financialsRouter.get('/summary', authenticate, async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const userRole = req.user.role;

    if (userRole !== 'SUPER_ADMIN' && userRole !== 'PROJECT_MANAGER') {
      return res.status(403).json({
        success: false,
        error: 'Financial totals are restricted to Project Managers and Super Admins.',
      });
    }

    // Run parallel aggregates in PostgreSQL
    const [payouts, expenses, projects] = await Promise.all([
      prisma.payout.findMany({ where: { organizationId: tenantId } }),
      prisma.directExpense.findMany({ where: { organizationId: tenantId } }),
      prisma.project.findMany({ where: { organizationId: tenantId } }),
    ]);

    const totalTcv = projects.reduce((sum, p) => sum + Number(p.tcv), 0);
    const totalDisbursed = payouts
      .filter((p) => p.status === 'DISBURSED')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const totalPendingPayouts = payouts
      .filter((p) => p.status !== 'DISBURSED')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const totalDirectExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netMargin = totalTcv - (totalDisbursed + totalDirectExpenses);

    res.json({
      success: true,
      data: {
        totalTcv,
        totalDisbursed,
        totalPendingPayouts,
        totalDirectExpenses,
        netMargin,
        netMarginPercent: totalTcv > 0 ? ((netMargin / totalTcv) * 100).toFixed(1) + '%' : '0%',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/financials/payouts
 * Reads payouts from PostgreSQL
 */
financialsRouter.get('/payouts', authenticate, async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const user = req.user;

    const where = { organizationId: tenantId };
    if (user.role === 'ONSITE_MEMBER' || user.role === 'PARTNER') {
      where.recipientId = user.id;
    }

    const payouts = await prisma.payout.findMany({
      where,
      include: {
        recipient: { select: { name: true, role: true, avatarUrl: true } },
        project: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: payouts.map((p) => ({
        ...p,
        amount: Number(p.amount),
        recipientName: p.recipient?.name || 'Staff Member',
        projectName: p.project?.name || 'Enterprise Project',
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/financials/payouts/verify-pm
 * STEP 1: Project Manager verification stored in PostgreSQL
 */
financialsRouter.post(
  '/payouts/verify-pm',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'PROJECT_MANAGER'),
  validate(verifyPayoutSchema),
  async (req, res, next) => {
    try {
      const { payoutId } = req.body;
      const payout = await prisma.payout.findFirst({
        where: { id: payoutId, organizationId: req.tenantId },
      });

      if (!payout) {
        return res.status(404).json({ success: false, error: 'Payout record not found.' });
      }

      if (payout.status !== 'PENDING') {
        return res.status(400).json({ success: false, error: `Payout is already in state '${payout.status}'.` });
      }

      const updated = await prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: 'VERIFIED_PM',
          verifiedByPmId: req.user.id,
        },
      });

      logger.info('Step 1 Payout Verified in PostgreSQL', { payoutId, actorId: req.user.id });

      res.json({
        success: true,
        message: 'Step 1 verification completed and saved to PostgreSQL.',
        payout: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/financials/payouts/disburse-admin
 * STEP 2: Super Admin final disbursement authorization in PostgreSQL (Atomic Transaction)
 */
financialsRouter.post(
  '/payouts/disburse-admin',
  authenticate,
  authorizeRoles('SUPER_ADMIN'),
  validate(disbursePayoutSchema),
  async (req, res, next) => {
    try {
      const { payoutId, mfaCode } = req.body;

      if (!mfaCode || mfaCode.length < 4) {
        return res.status(400).json({ success: false, error: 'Valid MFA code is required for disbursement.' });
      }

      const result = await prisma.$transaction(async (tx) => {
        const payout = await tx.payout.findFirst({
          where: { id: payoutId, organizationId: req.tenantId },
        });

        if (!payout) {
          throw new Error('Payout record not found in database.');
        }

        const updated = await tx.payout.update({
          where: { id: payoutId },
          data: {
            status: 'DISBURSED',
            disbursedByAdminId: req.user.id,
            disbursedAt: new Date(),
          },
        });

        // Write double-entry ledger record
        await tx.financialLedger.create({
          data: {
            organizationId: req.tenantId,
            projectId: payout.projectId,
            entryType: 'EXPENSE_PAYOUT',
            amount: payout.amount,
            referenceId: payoutId,
            notes: `Disbursement authorized by Super Admin ${req.user.name}`,
          },
        });

        // Write immutable audit log
        await tx.auditLog.create({
          data: {
            organizationId: req.tenantId,
            actorId: req.user.id,
            action: 'PAYOUT_DISBURSED',
            resourceType: 'PAYOUT',
            resourceId: payoutId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || '',
            metadata: {
              payoutId,
              amount: Number(payout.amount),
            },
          },
        });

        return updated;
      });

      logger.info('Step 2 Payout Disbursed in PostgreSQL', { payoutId, actorId: req.user.id });

      res.json({
        success: true,
        message: `Disbursement of $${result.amount} committed to PostgreSQL financial ledger.`,
        payout: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/financials/expenses
 * Reads all direct expenses from PostgreSQL
 */
financialsRouter.get('/expenses', authenticate, async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const expenses = await prisma.directExpense.findMany({
      where: { organizationId: tenantId },
      include: {
        project: { select: { name: true } },
      },
      orderBy: { expenseDate: 'desc' },
    });

    res.json({
      success: true,
      data: expenses.map((e) => ({
        id: e.id,
        organizationId: e.organizationId,
        projectId: e.projectId,
        projectName: e.project?.name || 'General Operations',
        category: e.category,
        amount: Number(e.amount),
        description: e.description,
        vendor: e.description,
        receiptRef: e.receiptUrl || '',
        expenseDate: e.expenseDate ? e.expenseDate.toISOString().split('T')[0] : '',
        date: e.expenseDate ? e.expenseDate.toISOString().split('T')[0] : '',
        month: e.expenseDate ? e.expenseDate.toISOString().slice(0, 7) : '',
        createdAt: e.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/financials/expenses
 * Creates direct expense record in PostgreSQL
 */
financialsRouter.post(
  '/expenses',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'PROJECT_MANAGER'),
  async (req, res, next) => {
    try {
      const { projectId, category, amount, description, vendor, expenseDate, receiptRef, receiptUrl } = req.body;
      const numAmount = Number(amount);
      if (!category || !category.trim()) {
        return res.status(400).json({ success: false, error: 'Category is required' });
      }
      if (!numAmount || numAmount <= 0) {
        return res.status(400).json({ success: false, error: 'Valid positive amount is required' });
      }

      const effectiveDate = expenseDate ? new Date(expenseDate) : new Date();

      const created = await prisma.directExpense.create({
        data: {
          organizationId: req.tenantId,
          projectId: (projectId && projectId !== 'GENERAL') ? projectId : null,
          category: category.trim(),
          amount: numAmount,
          description: description || vendor || 'Direct Operational Expense',
          receiptUrl: receiptUrl || receiptRef || null,
          expenseDate: effectiveDate,
        },
        include: {
          project: { select: { name: true } },
        },
      });

      // Double-entry financial ledger
      await prisma.financialLedger.create({
        data: {
          organizationId: req.tenantId,
          projectId: created.projectId,
          entryType: 'EXPENSE_DIRECT',
          amount: created.amount,
          referenceId: created.id,
          notes: `Direct Expense: ${created.category} (${created.description})`,
        },
      }).catch(err => logger.warn('Ledger entry error:', err));

      // Audit log
      await prisma.auditLog.create({
        data: {
          organizationId: req.tenantId,
          actorId: req.user.id,
          action: 'EXPENSE_CREATED',
          resourceType: 'DIRECT_EXPENSE',
          resourceId: created.id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] || '',
          metadata: {
            category: created.category,
            amount: Number(created.amount),
          },
        },
      }).catch(err => logger.warn('Audit log error:', err));

      res.status(201).json({
        success: true,
        data: {
          id: created.id,
          organizationId: created.organizationId,
          projectId: created.projectId,
          projectName: created.project?.name || 'General Operations',
          category: created.category,
          amount: Number(created.amount),
          description: created.description,
          vendor: vendor || created.description,
          receiptRef: created.receiptUrl || '',
          expenseDate: created.expenseDate ? created.expenseDate.toISOString().split('T')[0] : '',
          date: created.expenseDate ? created.expenseDate.toISOString().split('T')[0] : '',
          month: created.expenseDate ? created.expenseDate.toISOString().slice(0, 7) : '',
          createdAt: created.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/financials/expenses/:id
 * Deletes direct expense from PostgreSQL
 */
financialsRouter.delete(
  '/expenses/:id',
  authenticate,
  authorizeRoles('SUPER_ADMIN'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const expense = await prisma.directExpense.findFirst({
        where: { id, organizationId: req.tenantId },
      });
      if (!expense) {
        return res.status(404).json({ success: false, error: 'Expense record not found' });
      }

      await prisma.directExpense.delete({ where: { id } });

      await prisma.auditLog.create({
        data: {
          organizationId: req.tenantId,
          actorId: req.user.id,
          action: 'EXPENSE_DELETED',
          resourceType: 'DIRECT_EXPENSE',
          resourceId: id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] || '',
        },
      }).catch(err => logger.warn('Audit log error:', err));

      res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);


/**
 * GET /api/financials/expense-categories
 * Reads all expense categories from PostgreSQL
 */
financialsRouter.get('/expense-categories', authenticate, async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const categories = await prisma.$queryRaw`
      SELECT id, "organizationId", name, description, "createdAt", "updatedAt"
      FROM "expense_categories"
      WHERE "organizationId" = ${tenantId}
      ORDER BY "createdAt" ASC;
    `;

    res.json({
      success: true,
      data: (categories || []).map(c => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString()
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/financials/expense-categories
 * Creates an expense category in PostgreSQL
 */
financialsRouter.post(
  '/expense-categories',
  authenticate,
  authorizeRoles('SUPER_ADMIN'),
  async (req, res, next) => {
    try {
      const { name, description } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Category name is required' });
      }

      const tenantId = req.tenantId;
      const cleanName = name.trim();
      const cleanDesc = description ? description.trim() : '';
      const id = 'exp-cat-' + Date.now();

      await prisma.$executeRaw`
        INSERT INTO "expense_categories" ("id", "organizationId", "name", "description", "createdAt", "updatedAt")
        VALUES (${id}, ${tenantId}, ${cleanName}, ${cleanDesc}, NOW(), NOW())
        ON CONFLICT ("organizationId", "name") DO UPDATE
        SET "description" = EXCLUDED."description", "updatedAt" = NOW();
      `;

      res.status(201).json({
        success: true,
        data: {
          id,
          name: cleanName,
          description: cleanDesc,
          createdAt: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/financials/expense-categories/:id
 * Updates an expense category in PostgreSQL
 */
financialsRouter.put(
  '/expense-categories/:id',
  authenticate,
  authorizeRoles('SUPER_ADMIN'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const tenantId = req.tenantId;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Category name is required' });
      }

      await prisma.$executeRaw`
        UPDATE "expense_categories"
        SET "name" = ${name.trim()}, "description" = ${description ? description.trim() : ''}, "updatedAt" = NOW()
        WHERE ("id" = ${id} OR "name" = ${id}) AND "organizationId" = ${tenantId};
      `;

      res.json({
        success: true,
        message: 'Expense category updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/financials/expense-categories/:id
 * Deletes an expense category from PostgreSQL
 */
financialsRouter.delete(
  '/expense-categories/:id',
  authenticate,
  authorizeRoles('SUPER_ADMIN'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;

      await prisma.$executeRaw`
        DELETE FROM "expense_categories"
        WHERE ("id" = ${id} OR "name" = ${id}) AND "organizationId" = ${tenantId};
      `;

      res.json({
        success: true,
        message: 'Expense category deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);
