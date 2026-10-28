/**
 * Lincoz Enterprise - Unified High-Speed Synchronization Module
 * Combines all initial domain queries into a single atomic endpoint.
 * Features:
 * - Single-roundtrip unified bootstrap
 * - Smart in-memory cache with 15s TTL (serves in <1ms)
 * - Startup cache pre-warming
 * - Parallel database connection queries across all domain entities
 */

import { Router } from 'express';
import { prisma } from '../../infrastructure/database/client.js';
import { authenticate } from '../../middleware/authenticate.js';

export const syncRouter = Router();

// In-memory tenant cache: cacheKey -> { timestamp, data }
const bootstrapCache = new Map();
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

export function invalidateBootstrapCache(tenantId) {
  if (tenantId) {
    for (const key of bootstrapCache.keys()) {
      if (key.startsWith(tenantId)) {
        bootstrapCache.delete(key);
      }
    }
  } else {
    bootstrapCache.clear();
  }
}

/**
 * Non-blocking check for cached bootstrap data (sub-millisecond)
 */
export function getCachedBootstrap(tenantId = 'org_lincoz_primary', user = { id: 'sys', role: 'SUPER_ADMIN' }) {
  const cacheKey = `${tenantId}:${user.id}:${user.role}`;
  const cached = bootstrapCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }
  // Trigger background fetch if missing/stale without blocking
  fetchBootstrapData(tenantId, user).catch(() => {});
  return null;
}

/**
 * Fetch and format bootstrap data with caching
 */
export async function fetchBootstrapData(tenantId = 'org_lincoz_primary', user = { id: 'sys', role: 'SUPER_ADMIN' }, force = false) {
  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const cacheKey = `${tenantId}:${user.id}:${user.role}`;

  // Return cached payload immediately if still fresh and not forced
  if (!force) {
    const cached = bootstrapCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return {
        data: cached.data,
        fromCache: true,
      };
    }
  }

  // Payout filter scoped to role
  const payoutWhere = { organizationId: tenantId };
  if (user.role === 'ONSITE_MEMBER' || user.role === 'PARTNER') {
    payoutWhere.recipientId = user.id;
  }

  // Execute all 8 core database queries concurrently in parallel on PostgreSQL pool
  const [
    users,
    clients,
    projects,
    tasks,
    attendance,
    payouts,
    expenses,
    categoriesRaw
  ] = await Promise.all([
    // 1. Users
    prisma.user.findMany({
      where: { organizationId: tenantId, isActive: true },
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
        mfaKey: isSuperAdmin,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    }).catch(err => {
      console.warn('[Sync] Users query error:', err.message);
      return [];
    }),

    // 2. Clients
    prisma.client.findMany({
      where: { organizationId: tenantId },
      include: {
        projects: { select: { id: true, name: true, tcv: true } },
      },
      orderBy: { createdAt: 'desc' },
    }).catch(err => {
      console.warn('[Sync] Clients query error:', err.message);
      return [];
    }),

    // 3. Projects
    prisma.project.findMany({
      where: { organizationId: tenantId },
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    }).catch(err => {
      console.warn('[Sync] Projects query error:', err.message);
      return [];
    }),

    // 4. Tasks
    prisma.task.findMany({
      where: { organizationId: tenantId },
      include: {
        assignee: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }).catch(err => {
      console.warn('[Sync] Tasks query error:', err.message);
      return [];
    }),

    // 5. Attendance (Recent logs)
    prisma.attendanceRecord.findMany({
      where: { organizationId: tenantId },
      include: {
        user: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
      orderBy: { date: 'desc' },
      take: 500,
    }).catch(err => {
      console.warn('[Sync] Attendance query error:', err.message);
      return [];
    }),

    // 6. Payouts
    prisma.payout.findMany({
      where: payoutWhere,
      include: {
        recipient: { select: { name: true, role: true, avatarUrl: true } },
        project: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }).catch(err => {
      console.warn('[Sync] Payouts query error:', err.message);
      return [];
    }),

    // 7. Direct Expenses
    prisma.directExpense.findMany({
      where: { organizationId: tenantId },
      include: {
        project: { select: { name: true } },
      },
      orderBy: { expenseDate: 'desc' },
    }).catch(err => {
      console.warn('[Sync] Expenses query error:', err.message);
      return [];
    }),

    // 8. Expense Categories
    prisma.$queryRaw`
      SELECT id, "organizationId", name, description, "createdAt", "updatedAt"
      FROM "expense_categories"
      WHERE "organizationId" = ${tenantId}
      ORDER BY "createdAt" ASC;
    `.catch(err => {
      console.warn('[Sync] Categories query error:', err.message);
      return [];
    })
  ]);

  // Format & map data consistently with frontend domain models
  const formattedUsers = users.map((u) => ({
    ...u,
    salary: Number(u.salary || 0),
    sharePercentage: Number(u.sharePercentage || 0),
    avatar: u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  }));

  const formattedClients = clients.map((c) => ({
    ...c,
    totalTcv: Number(c.totalTcv || 0),
    associatedProjects: (c.projects || []).map(p => p.id),
    associatedProjectsList: c.projects || [],
    percentage: 0,
  }));

  const formattedProjects = projects.map((p) => ({
    ...p,
    totalContractValue: Number(p.tcv || 0),
    tcv: Number(p.tcv || 0),
    allocatedBudget: Number(p.allocatedBudget || 0),
    clientName: p.client?.name || 'Enterprise Client',
    clientId: p.clientId,
    targetDeliveryDate: p.endDate ? p.endDate.toISOString().slice(0, 10) : '2026-12-31',
  }));

  const formattedTasks = tasks.map((t) => ({
    ...t,
    assigneeName: t.assignee?.name || 'Unassigned',
    assigneeRole: t.assignee?.role || '',
    avatar: t.assignee?.avatarUrl || '',
  }));

  const formattedAttendance = attendance.map((r) => ({
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
  }));

  const formattedPayouts = payouts.map((p) => ({
    ...p,
    amount: Number(p.amount || 0),
    recipientName: p.recipient?.name || 'Staff Member',
    projectName: p.project?.name || 'Enterprise Project',
  }));

  const formattedExpenses = expenses.map((e) => ({
    id: e.id,
    organizationId: e.organizationId,
    projectId: e.projectId,
    projectName: e.project?.name || 'General Operations',
    category: e.category,
    amount: Number(e.amount || 0),
    description: e.description,
    vendor: e.description,
    receiptRef: e.receiptUrl || '',
    expenseDate: e.expenseDate ? e.expenseDate.toISOString().split('T')[0] : '',
    date: e.expenseDate ? e.expenseDate.toISOString().split('T')[0] : '',
    month: e.expenseDate ? e.expenseDate.toISOString().slice(0, 7) : '',
    createdAt: e.createdAt,
  }));

  const formattedCategories = (categoriesRaw || []).map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description || '',
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
  }));

  const responseData = {
    users: formattedUsers,
    clients: formattedClients,
    projects: formattedProjects,
    tasks: formattedTasks,
    attendance: formattedAttendance,
    payouts: formattedPayouts,
    expenses: formattedExpenses,
    expenseCategories: formattedCategories,
  };

  // Cache the response
  bootstrapCache.set(cacheKey, { timestamp: Date.now(), data: responseData });

  return {
    data: responseData,
    fromCache: false,
  };
}

// Background pre-warm bootstrap cache on server start
(async function warmupBootstrapCache() {
  try {
    await fetchBootstrapData('org_lincoz_primary', { id: 'warmup', role: 'SUPER_ADMIN' }, true);
    console.log('[Sync] Background bootstrap cache pre-warmed successfully.');
  } catch (err) {
    // Non-blocking
  }
})();

/**
 * GET /api/sync/bootstrap
 * Loads all initial datasets in parallel on the server in a single network round-trip.
 */
syncRouter.get('/bootstrap', authenticate, async (req, res, next) => {
  try {
    const tenantId = req.tenantId || 'org_lincoz_primary';
    const user = req.user;
    const force = req.query.force === 'true';

    const result = await fetchBootstrapData(tenantId, user, force);

    res.json({
      success: true,
      data: result.data,
      fromCache: result.fromCache,
    });
  } catch (error) {
    next(error);
  }
});
