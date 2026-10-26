/**
 * Lincoz Enterprise - Projects & Tasks Module Routes (PostgreSQL Connected)
 */

import { Router } from 'express';
import { prisma } from '../../infrastructure/database/client.js';
import { authenticate } from '../../middleware/authenticate.js';

export const projectsRouter = Router();

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
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: projects.map((p) => ({
        ...p,
        totalContractValue: Number(p.tcv),
        tcv: Number(p.tcv),
        allocatedBudget: Number(p.allocatedBudget),
        clientName: p.client?.name || 'Enterprise Client',
        clientId: p.clientId,
        targetDeliveryDate: p.endDate ? p.endDate.toISOString().slice(0, 10) : '2026-12-31',
      })),
      count: projects.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/projects
 * Creates a project in PostgreSQL, ensuring valid client association
 */
projectsRouter.post('/', authenticate, async (req, res, next) => {
  try {
    const {
      id,
      name,
      clientId,
      clientName,
      description,
      status = 'ACTIVE',
      totalContractValue = 0,
      tcv = 0,
      allocatedBudget = 0,
      targetDeliveryDate,
      endDate,
      startDate,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Project name is required.' });
    }

    const orgId = req.tenantId || 'org_lincoz_primary';
    let targetClientId = clientId;

    // Resolve or provision associated Client
    if (!targetClientId) {
      const cName = (clientName && clientName.trim()) ? clientName.trim() : 'Apex Global Corp';
      let existingClient = await prisma.client.findFirst({
        where: { organizationId: orgId, name: { equals: cName, mode: 'insensitive' } },
      });

      if (!existingClient) {
        existingClient = await prisma.client.create({
          data: {
            organizationId: orgId,
            name: cName,
            company: cName,
            email: `${cName.toLowerCase().replace(/[^a-z0-9]/g, '')}@client.io`,
            status: 'ACTIVE',
            totalTcv: Number(totalContractValue || tcv) || 0,
          },
        });
      }
      targetClientId = existingClient.id;
    } else {
      // Ensure provided clientId exists in DB
      const existingClient = await prisma.client.findUnique({ where: { id: targetClientId } });
      if (!existingClient) {
        const cName = (clientName && clientName.trim()) ? clientName.trim() : 'Client Organization';
        const createdClient = await prisma.client.create({
          data: {
            id: targetClientId,
            organizationId: orgId,
            name: cName,
            company: cName,
            email: `${cName.toLowerCase().replace(/[^a-z0-9]/g, '')}@client.io`,
            status: 'ACTIVE',
            totalTcv: Number(totalContractValue || tcv) || 0,
          },
        });
        targetClientId = createdClient.id;
      }
    }

    const finalTcv = Number(totalContractValue || tcv) || 0;
    const finalEndDate = targetDeliveryDate || endDate ? new Date(targetDeliveryDate || endDate) : null;
    const finalStartDate = startDate ? new Date(startDate) : new Date();

    const newProject = await prisma.project.create({
      data: {
        ...(id ? { id } : {}),
        organizationId: orgId,
        clientId: targetClientId,
        name: name.trim(),
        description: description ? description.trim() : '',
        status: status || 'ACTIVE',
        tcv: finalTcv,
        allocatedBudget: Number(allocatedBudget) || 0,
        startDate: finalStartDate,
        endDate: finalEndDate,
      },
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully in database.',
      data: {
        ...newProject,
        totalContractValue: Number(newProject.tcv),
        tcv: Number(newProject.tcv),
        clientName: newProject.client?.name || clientName || 'Enterprise Client',
        targetDeliveryDate: newProject.endDate ? newProject.endDate.toISOString().slice(0, 10) : '2026-12-31',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/projects/:id
 * Updates project details in PostgreSQL
 */
projectsRouter.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const dataToUpdate = {};
    if (updates.name) dataToUpdate.name = updates.name.trim();
    if (updates.description !== undefined) dataToUpdate.description = updates.description ? updates.description.trim() : '';
    if (updates.status) dataToUpdate.status = updates.status;
    if (updates.totalContractValue !== undefined || updates.tcv !== undefined) {
      dataToUpdate.tcv = Number(updates.totalContractValue !== undefined ? updates.totalContractValue : updates.tcv);
    }
    if (updates.allocatedBudget !== undefined) {
      dataToUpdate.allocatedBudget = Number(updates.allocatedBudget);
    }
    if (updates.targetDeliveryDate || updates.endDate) {
      dataToUpdate.endDate = new Date(updates.targetDeliveryDate || updates.endDate);
    }
    if (updates.startDate) {
      dataToUpdate.startDate = new Date(updates.startDate);
    }

    const updated = await prisma.project.update({
      where: { id },
      data: dataToUpdate,
      include: {
        client: { select: { name: true } },
      },
    });

    res.json({
      success: true,
      message: 'Project updated successfully.',
      data: {
        ...updated,
        totalContractValue: Number(updated.tcv),
        tcv: Number(updated.tcv),
        clientName: updated.client?.name,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/projects/:id
 * Deletes project and associated tasks from PostgreSQL
 */
projectsRouter.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.task.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id } });
    res.json({ success: true, message: 'Project deleted successfully.' });
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
          select: { id: true, name: true, role: true, avatarUrl: true },
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
      count: tasks.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/projects/tasks
 * Creates a task in PostgreSQL
 */
projectsRouter.post('/tasks', authenticate, async (req, res, next) => {
  try {
    const {
      id,
      projectId,
      title,
      description,
      status = 'TODO',
      priority = 'MEDIUM',
      dueDate,
      assigneeId,
      deliverableUrl,
      prLink,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Task title is required.' });
    }

    const orgId = req.tenantId || 'org_lincoz_primary';

    // Ensure target project exists in DB
    let validProjectId = projectId;
    if (validProjectId) {
      const proj = await prisma.project.findUnique({ where: { id: validProjectId } });
      if (!proj) {
        // Create parent project record so foreign key constraint passes
        const defaultClient = await prisma.client.findFirst({ where: { organizationId: orgId } });
        const createdProj = await prisma.project.create({
          data: {
            id: validProjectId,
            organizationId: orgId,
            clientId: defaultClient?.id || 'cli-default',
            name: 'Active Project',
            status: 'ACTIVE',
          },
        });
        validProjectId = createdProj.id;
      }
    } else {
      const firstProj = await prisma.project.findFirst({ where: { organizationId: orgId } });
      validProjectId = firstProj?.id;
    }

    const newTask = await prisma.task.create({
      data: {
        ...(id ? { id } : {}),
        organizationId: orgId,
        projectId: validProjectId,
        title: title.trim(),
        description: description ? description.trim() : '',
        status: status || 'TODO',
        priority: (priority || 'MEDIUM').toUpperCase(),
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
        deliverableUrl: deliverableUrl || null,
        prLink: prLink || null,
      },
      include: {
        assignee: {
          select: { id: true, name: true, role: true, avatarUrl: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully in database.',
      data: {
        ...newTask,
        assigneeName: newTask.assignee?.name || 'Unassigned',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/projects/tasks/:id
 * Updates task state in PostgreSQL
 */
projectsRouter.patch('/tasks/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, title, description, priority, dueDate, assigneeId, deliverableUrl, prLink } = req.body;

    const dataToUpdate = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (title !== undefined) dataToUpdate.title = title.trim();
    if (description !== undefined) dataToUpdate.description = description.trim();
    if (priority !== undefined) dataToUpdate.priority = priority.toUpperCase();
    if (dueDate !== undefined) dataToUpdate.dueDate = dueDate ? new Date(dueDate) : null;
    if (assigneeId !== undefined) dataToUpdate.assigneeId = assigneeId || null;
    if (deliverableUrl !== undefined) dataToUpdate.deliverableUrl = deliverableUrl || null;
    if (prLink !== undefined) dataToUpdate.prLink = prLink || null;

    const updated = await prisma.task.update({
      where: { id },
      data: dataToUpdate,
      include: {
        assignee: {
          select: { id: true, name: true, role: true, avatarUrl: true },
        },
      },
    });

    res.json({
      success: true,
      message: 'Task updated successfully.',
      task: updated,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/projects/tasks/:id/status (legacy backwards compatibility)
 */
projectsRouter.patch('/tasks/:id/status', authenticate, async (req, res, next) => {
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

    res.json({ success: true, task: updated, data: updated });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/projects/tasks/:id
 * Deletes task from PostgreSQL
 */
projectsRouter.delete('/tasks/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
});
