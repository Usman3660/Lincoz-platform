/**
 * Lincoz Enterprise - Attendance Roster Module Routes (PostgreSQL Connected)
 * Role Check: Project Manager & Super Admin governance.
 * Scoped to organizationId for Multi-Tenant SaaS isolation.
 */

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../infrastructure/database/client.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRoles } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { logger } from '../../infrastructure/logger/logger.js';

export const attendanceRouter = Router();

const bulkAttendanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  entries: z.array(
    z.object({
      userId: z.string().min(1),
      status: z.enum(['PRESENT', 'ABSENT', 'ON_LEAVE']),
      workMode: z.enum(['ONSITE', 'REMOTE', 'HYBRID']).default('ONSITE'),
      remarks: z.string().max(250).optional(),
    })
  ).min(1, 'At least one employee attendance entry must be provided'),
});

/**
 * GET /api/attendance
 * Reads attendance records directly from PostgreSQL
 */
attendanceRouter.get('/', authenticate, async (req, res, next) => {
  try {
    const { date, userId } = req.query;
    const tenantId = req.tenantId;

    const where = { organizationId: tenantId };
    if (date) where.date = String(date);
    if (userId) where.userId = String(userId);

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json({
      success: true,
      data: records.map((r) => ({
        id: r.id,
        userId: r.userId,
        userName: r.user?.name || '',
        userRole: r.user?.role || '',
        avatar: r.user?.avatarUrl || '',
        date: r.date,
        status: r.status,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        workMode: r.workMode,
        remarks: r.remarks,
        verifiedBy: r.verifiedBy,
      })),
      count: records.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/attendance/bulk
 * Bulk submit daily attendance roster directly to PostgreSQL with atomic transaction.
 */
attendanceRouter.post(
  '/bulk',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'PROJECT_MANAGER'),
  validate(bulkAttendanceSchema),
  async (req, res, next) => {
    try {
      const { date, entries } = req.body;
      const tenantId = req.tenantId;
      const actorId = req.user.id;

      const updatedRecords = await prisma.$transaction(async (tx) => {
        const results = [];
        for (const entry of entries) {
          const record = await tx.attendanceRecord.upsert({
            where: {
              organizationId_userId_date: {
                organizationId: tenantId,
                userId: entry.userId,
                date,
              },
            },
            update: {
              status: entry.status,
              workMode: entry.workMode,
              remarks: entry.remarks || '',
              verifiedBy: actorId,
            },
            create: {
              organizationId: tenantId,
              userId: entry.userId,
              date,
              status: entry.status,
              workMode: entry.workMode,
              remarks: entry.remarks || '',
              verifiedBy: actorId,
            },
          });
          results.push(record);
        }

        // Record audit trail in PostgreSQL
        await tx.auditLog.create({
          data: {
            organizationId: tenantId,
            actorId,
            action: 'ATTENDANCE_ROSTER_RECORDED',
            resourceType: 'ATTENDANCE',
            resourceId: date,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || '',
            metadata: {
              date,
              staffCount: entries.length,
            },
          },
        });

        return results;
      });

      logger.info('Attendance saved to PostgreSQL', { date, count: entries.length, actorId });

      res.json({
        success: true,
        message: `Successfully saved attendance roster for ${entries.length} staff members to PostgreSQL.`,
        date,
        records: updatedRecords,
      });
    } catch (error) {
      next(error);
    }
  }
);
