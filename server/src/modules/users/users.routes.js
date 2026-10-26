import bcrypt from 'bcryptjs';
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
import { userCache } from '../auth/auth.routes.js';

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

/**
 * PATCH /api/users/:id
 * Updates general user profile details in PostgreSQL
 */
usersRouter.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const isSelf = req.user.id === id;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

    if (!isSelf && !isSuperAdmin) {
      return res.status(403).json({ success: false, error: 'Unauthorized to modify this user account.' });
    }

    const dataToUpdate = {};
    if (updates.name) dataToUpdate.name = updates.name.trim();
    if (updates.email) dataToUpdate.email = updates.email.trim().toLowerCase();
    if (updates.title) dataToUpdate.title = updates.title.trim();
    if (updates.department) dataToUpdate.department = updates.department.trim();
    if (updates.avatar) dataToUpdate.avatarUrl = updates.avatar;
    if (updates.avatarUrl) dataToUpdate.avatarUrl = updates.avatarUrl;
    if (updates.workMode) dataToUpdate.workMode = updates.workMode;
    if (updates.compensationType) dataToUpdate.compensationType = updates.compensationType;
    if (updates.salary !== undefined) dataToUpdate.salary = Number(updates.salary);
    if (updates.percentage !== undefined) dataToUpdate.sharePercentage = Number(updates.percentage);
    if (isSuperAdmin && updates.role) dataToUpdate.role = updates.role;
    if (updates.mfaKey) dataToUpdate.mfaKey = updates.mfaKey.trim();
    if (updates.isMfaEnabled !== undefined) dataToUpdate.isMfaEnabled = !!updates.isMfaEnabled;

    if (updates.password && String(updates.password).trim().length >= 6) {
      const salt = await bcrypt.genSalt(12);
      dataToUpdate.passwordHash = await bcrypt.hash(String(updates.password).trim(), salt);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        title: true,
        department: true,
        avatarUrl: true,
        workMode: true,
        compensationType: true,
        salary: true,
        sharePercentage: true,
      }
    });

    const formattedUser = {
      ...updated,
      salary: Number(updated.salary),
      percentage: Number(updated.sharePercentage),
      avatar: updated.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    };

    // Synchronize auth userCache immediately
    userCache.set(formattedUser.email.toLowerCase().trim(), {
      ...formattedUser,
      passwordHash: dataToUpdate.passwordHash || req.user.passwordHash,
      organizationId: req.tenantId,
    });
    if (req.user?.email && req.user.email.toLowerCase() !== formattedUser.email.toLowerCase()) {
      userCache.delete(req.user.email.toLowerCase().trim());
    }

    res.json({
      success: true,
      message: 'User profile updated successfully.',
      data: formattedUser
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/users/:id/password
 * Updates user password in PostgreSQL with bcrypt hashing
 */
usersRouter.patch('/:id/password', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const isSelf = req.user.id === id;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

    if (!isSelf && !isSuperAdmin) {
      return res.status(403).json({ success: false, error: 'Unauthorized to change this password.' });
    }

    if (!password || password.trim().length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.default.genSalt(12);
    const passwordHash = await bcrypt.default.hash(password.trim(), salt);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { passwordHash }
    });

    if (updatedUser?.email) {
      userCache.delete(updatedUser.email.toLowerCase().trim());
    }

    res.json({
      success: true,
      message: 'Password updated successfully in database.'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users
 * Super Admin: provisions a new team member in PostgreSQL
 */
usersRouter.post('/', authenticate, authorizeRoles('SUPER_ADMIN', 'PROJECT_MANAGER'), async (req, res, next) => {
  try {
    const {
      id,
      name,
      email,
      password,
      role = 'ONSITE_MEMBER',
      title,
      department,
      workMode = 'ONSITE',
      compensationType = 'SALARIED',
      salary = 0,
      percentage = 0,
      avatar,
      avatarUrl,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'A user with this email address already exists.' });
    }

    const rawPass = password && String(password).trim().length >= 6 ? String(password).trim() : 'Pass#123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPass, salt);

    const validRoles = ['SUPER_ADMIN', 'PROJECT_MANAGER', 'ONSITE_MEMBER', 'PARTNER'];
    let assignedRole = validRoles.includes(role) ? role : 'ONSITE_MEMBER';
    if (req.user?.role !== 'SUPER_ADMIN' && assignedRole === 'SUPER_ADMIN') {
      assignedRole = 'ONSITE_MEMBER';
    }
    const validModes = ['ONSITE', 'REMOTE', 'HYBRID'];
    const assignedMode = validModes.includes(workMode) ? workMode : 'ONSITE';
    const validComp = ['SALARIED', 'PERCENTAGE'];
    const assignedComp = validComp.includes(compensationType) ? compensationType : 'SALARIED';

    const created = await prisma.user.create({
      data: {
        ...(id ? { id } : {}),
        organizationId: req.tenantId || 'org_lincoz_primary',
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: assignedRole,
        title: title ? title.trim() : (assignedRole === 'PROJECT_MANAGER' ? 'Project Manager' : 'Team Member'),
        department: department ? department.trim() : 'Core Team',
        workMode: assignedMode,
        compensationType: assignedComp,
        salary: Number(salary) || 0,
        sharePercentage: Number(percentage) || 0,
        avatarUrl: avatar || avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      },
    });

    const formatted = {
      ...created,
      salary: Number(created.salary),
      percentage: Number(created.sharePercentage),
      avatar: created.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    };

    userCache.set(cleanEmail, formatted);

    res.status(201).json({
      success: true,
      message: 'User provisioned successfully.',
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/users/:id
 * Super Admin: deactivate / remove user from PostgreSQL
 */
usersRouter.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (user.role === 'SUPER_ADMIN' && user.id === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot delete the active Super Admin account.' });
    }

    await prisma.user.delete({ where: { id } }).catch(async () => {
      // Fallback: soft delete if foreign key constraints exist
      await prisma.user.update({ where: { id }, data: { isActive: false } });
    });

    if (user.email) {
      userCache.delete(user.email.toLowerCase().trim());
    }

    res.json({ success: true, message: 'User removed successfully.' });
  } catch (error) {
    next(error);
  }
});

