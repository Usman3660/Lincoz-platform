/**
 * Lincoz Enterprise - Users Module Routes
 * Reads active users directly from PostgreSQL via Prisma ORM.
 */

import { Router } from 'express';
import { prisma } from '../../infrastructure/database/client.js';
import { authenticate } from '../../middleware/authenticate.js';

export const usersRouter = Router();

/**
 * GET /api/users
 * Returns list of team members for current tenant organization
 */
usersRouter.get('/', authenticate, async (req, res, next) => {
  try {
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
