/**
 * Lincoz Enterprise - Projects & Tasks Module Routes (PostgreSQL Connected)
 */

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../infrastructure/database/client.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';

export const projectsRouter = Router();

const updateTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'COMPLETED', 'ASSIGNED', 'BACKLOG']),
  deliverableUrl: z.string().optional(),
  prLink: z.string().optional(),
});

/**
 * GET /api/projects
 * Reads projects from PostgreSQL
 */
projectsRouter.get('/', authenticate, async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { organizationId: req.tenantId },
      include: {
        client: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: projects.map((p) => ({
        ...p,
        tcv: Number(p.tcv),
        allocatedBudget: Number(p.allocatedBudget),
        clientName: p.client?.name || 'Enterprise Client',
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/projects/tasks
 * Reads tasks from PostgreSQL
 */
projectsRouter.get('/tasks', authenticate, async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const where = { organizationId: req.tenantId };
    if (projectId) where.projectId = String(projectId);

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: { name: true, role: true, avatarUrl: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: tasks.map((t) => ({
        ...t,
        assigneeName: t.assignee?.name || 'Unassigned',
        assigneeRole: t.assignee?.role || '',
        avatar: t.assignee?.avatarUrl || '',
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/projects/tasks/:id/status
 * Updates task state in PostgreSQL
 */
projectsRouter.patch(
  '/tasks/:id/status',
  authenticate,
  validate(updateTaskStatusSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, deliverableUrl, prLink } = req.body;

      const updated = await prisma.task.update({
        where: { id },
        data: {
          status,
          deliverableUrl: deliverableUrl || null,
          prLink: prLink || null,
        },
      });

      res.json({ success: true, task: updated });
    } catch (error) {
      next(error);
    }
  }
);
