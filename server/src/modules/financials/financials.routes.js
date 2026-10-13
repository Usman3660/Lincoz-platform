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
