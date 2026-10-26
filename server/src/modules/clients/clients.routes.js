/**
 * Lincoz Enterprise - Clients Directory Routes (PostgreSQL Connected)
 */

import { Router } from 'express';
import { prisma } from '../../infrastructure/database/client.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRoles } from '../../middleware/authorize.js';

export const clientsRouter = Router();

/**
 * GET /api/clients
 * Returns client directory for current organization
 */
clientsRouter.get('/', authenticate, async (req, res, next) => {
  try {
    const clients = await prisma.client.findMany({
      where: { organizationId: req.tenantId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: clients.map(c => ({
        ...c,
        totalTcv: Number(c.totalTcv),
        percentage: 0,
      })),
      count: clients.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/clients
 * Creates a new client in PostgreSQL
 */
clientsRouter.post('/', authenticate, async (req, res, next) => {
  try {
    const {
      id,
      name,
      company,
      email,
      phone,
      contactNumber,
      avatarUrl,
      status = 'ACTIVE',
      totalTcv = 0,
      percentage,
      category,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Client name is required.' });
    }

    const cleanName = name.trim();
    const cleanCompany = company?.trim() || cleanName;
    const cleanEmail = email?.trim()?.toLowerCase() || `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@client.io`;
    const cleanPhone = phone?.trim() || contactNumber?.trim() || null;

    const newClient = await prisma.client.create({
      data: {
        ...(id ? { id } : {}),
        organizationId: req.tenantId || 'org_lincoz_primary',
        name: cleanName,
        company: cleanCompany,
        email: cleanEmail,
        phone: cleanPhone,
        avatarUrl: avatarUrl || null,
        status: status || 'ACTIVE',
        totalTcv: Number(totalTcv) || 0,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Client created successfully.',
      data: {
        ...newClient,
        totalTcv: Number(newClient.totalTcv),
        category: category || 'CLIENT',
        percentage: Number(percentage) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/clients/:id
 * Updates client profile in PostgreSQL
 */
clientsRouter.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const dataToUpdate = {};
    if (updates.name) dataToUpdate.name = updates.name.trim();
    if (updates.company) dataToUpdate.company = updates.company.trim();
    if (updates.email) dataToUpdate.email = updates.email.trim().toLowerCase();
    if (updates.phone || updates.contactNumber) dataToUpdate.phone = (updates.phone || updates.contactNumber).trim();
    if (updates.avatarUrl !== undefined) dataToUpdate.avatarUrl = updates.avatarUrl;
    if (updates.status) dataToUpdate.status = updates.status;
    if (updates.totalTcv !== undefined) dataToUpdate.totalTcv = Number(updates.totalTcv);

    const updated = await prisma.client.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json({
      success: true,
      message: 'Client updated successfully.',
      data: {
        ...updated,
        totalTcv: Number(updated.totalTcv),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/clients/:id
 * Deletes client from PostgreSQL
 */
clientsRouter.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if client has associated projects
    const projectCount = await prisma.project.count({ where: { clientId: id } });
    if (projectCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete client with ${projectCount} active project(s). Remove or reassign projects first.`,
      });
    }

    await prisma.client.delete({ where: { id } });

    res.json({ success: true, message: 'Client deleted successfully.' });
  } catch (error) {
    next(error);
  }
});
