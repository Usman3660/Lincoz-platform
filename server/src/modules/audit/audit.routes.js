/**
 * Lincoz Enterprise - Immutable Audit Governance Module (PostgreSQL Connected)
 */

import { Router } from 'express';
import { prisma } from '../../infrastructure/database/client.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRoles } from '../../middleware/authorize.js';

export const auditRouter = Router();

/**
 * GET /api/audit
 * Reads immutable audit logs from PostgreSQL
 */
auditRouter.get('/', authenticate, authorizeRoles('SUPER_ADMIN', 'PROJECT_MANAGER'), async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { organizationId: req.tenantId },
      include: {
        actor: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Safe pagination window
    });

    res.json({
      success: true,
      data: logs.map((l) => ({
        id: l.id,
        action: l.action,
        resourceType: l.resourceType,
        resourceId: l.resourceId,
        actorId: l.actorId,
        actorName: l.actor?.name || 'System / Automated',
        actorRole: l.actor?.role || '',
        ipAddress: l.ipAddress || '127.0.0.1',
        timestamp: l.createdAt.toISOString(),
        metadata: l.metadata,
      })),
      count: logs.length,
    });
  } catch (error) {
    next(error);
  }
});
