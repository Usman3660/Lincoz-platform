/**
 * Lincoz Enterprise - Users Module Routes
 * Reads active users directly from PostgreSQL via Prisma ORM.
 */

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../infrastructure/database/client.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRoles } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';

export const usersRouter = Router();

const updateMfaSchema = z.object({
  mfaKey: z.string().min(1, '2FA Key cannot be empty').max(50),
  isMfaEnabled: z.boolean().optional(),
});

/**
 * GET /api/users
 * Returns list of team members for current tenant organization
 */
usersRouter.get('/', authenticate, async (req, res, next) => {
  try {
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

    const users = await prisma.user.findMany({
      where: {
        organizationId: req.tenantId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        title: true,
        department: true,
        workMode: true,
        compensationType: true,
        salary: true,
        sharePercentage: true,
        avatarUrl: true,
        isMfaEnabled: true,
        mfaKey: isSuperAdmin, // Only Super Admin can read all users' fixed 2FA keys
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: users.map((u) => ({
        ...u,
        salary: Number(u.salary),
        percentage: Number(u.sharePercentage),
        avatar: u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      })),
      count: users.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/users/:id/mfa-key
 * Super Admin only: update user's fixed 2FA key and status
 */
usersRouter.patch(
  '/:id/mfa-key',
  authenticate,
  authorizeRoles('SUPER_ADMIN'),
  validate(updateMfaSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { mfaKey, isMfaEnabled } = req.body;

      const user = await prisma.user.findFirst({
        where: { id, organizationId: req.tenantId },
      });

      if (!user) {
        return res.status(404).json({ success: false, error: 'User record not found.' });
      }

      const updated = await prisma.user.update({
        where: { id },
        data: {
          mfaKey: mfaKey.trim(),
          ...(isMfaEnabled !== undefined ? { isMfaEnabled } : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isMfaEnabled: true,
          mfaKey: true,
        },
      });

      // Write immutable audit log
      await prisma.auditLog.create({
        data: {
          organizationId: req.tenantId,
          actorId: req.user.id,
          actionType: 'SECURITY_2FA_UPDATED',
          itemText: `Super Admin ${req.user.name} updated 2FA security key for user ${user.name} (${user.email}).`,
        },
      });

      res.json({
        success: true,
        message: `2FA Security Key updated successfully for ${updated.name}.`,
        user: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);
