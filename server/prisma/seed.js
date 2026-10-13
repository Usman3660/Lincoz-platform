/**
 * Lincoz Enterprise - Full Database Seeder
 * Populates PostgreSQL with complete initial data from initialData.js:
 * Organizations, Users, Clients, Projects, Tasks, Payouts, Expenses, and Attendance.
 */

import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_CLIENTS_DIRECTORY,
  INITIAL_PAYOUT_LEDGER,
  INITIAL_DIRECT_EXPENSES,
  INITIAL_ATTENDANCE
} from '../../src/data/initialData.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting full Lincoz Enterprise PostgreSQL seeding...');

  // 1. Seed Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'lincoz-primary' },
    update: {},
    create: {
      id: 'org_lincoz_primary',
      name: 'Lincoz Digital Group',
      slug: 'lincoz-primary',
      plan: 'ENTERPRISE',
    },
  });
  console.log(`✅ Organization active: ${org.name}`);

  // 2. Hash Default Password (cost factor 12)
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 3. Seed Users
  for (const u of INITIAL_USERS) {
    const role = u.role === 'PARTNER' ? 'PARTNER' 
      : u.role === 'PROJECT_MANAGER' ? 'PROJECT_MANAGER'
      : u.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN'
      : 'ONSITE_MEMBER';

    const compType = u.compensationType === 'PERCENTAGE' ? 'PERCENTAGE' : 'SALARIED';

    await prisma.user.upsert({
      where: { id: u.id },
      update: {
        name: u.name,
        email: u.email,
        role,
        title: u.title,
        department: u.department,
        salary: u.salary || 0,
        sharePercentage: u.percentage || 0,
        isMfaEnabled: !!u.isMfaEnabled,
      },
      create: {
        id: u.id,
        organizationId: org.id,
        name: u.name,
        email: u.email,
        passwordHash,
        role,
        title: u.title,
        department: u.department,
        workMode: u.workMode === 'REMOTE' ? 'REMOTE' : 'ONSITE',
        compensationType: compType,
        salary: u.salary || 0,
        sharePercentage: u.percentage || 0,
        avatarUrl: u.avatar || null,
        isMfaEnabled: !!u.isMfaEnabled,
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_USERS.length} enterprise users.`);

  // 4. Seed Clients
  const seededClients = new Map();
  for (const c of INITIAL_CLIENTS_DIRECTORY.filter(item => item.category === 'CLIENT')) {
    const client = await prisma.client.upsert({
      where: { id: c.id },
      update: { name: c.name, company: c.name, email: c.email },
      create: {
        id: c.id,
        organizationId: org.id,
        name: c.name,
        company: c.name,
        email: c.email,
        phone: c.contactNumber || null,
        status: 'ACTIVE',
        totalTcv: 0,
      },
    });
    seededClients.set(c.id, client.id);
  }
  // Ensure default client exists for projects without explicit client ID
  const defaultClient = await prisma.client.upsert({
    where: { id: 'cli-default' },
    update: {},
    create: {
      id: 'cli-default',
      organizationId: org.id,
      name: 'Apex Global Banking Corp',
      company: 'Apex Global Banking Corp',
      email: 'marcus.v@apexbanking.com',
      status: 'ACTIVE',
      totalTcv: 120000,
    },
  });
  seededClients.set('default', defaultClient.id);
  console.log('✅ Seeded client directory.');

  // 5. Seed Projects
  for (const p of INITIAL_PROJECTS) {
    const clientId = seededClients.get(p.clientId) || defaultClient.id;

    await prisma.project.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        status: p.status,
        tcv: p.totalContractValue || 0,
      },
      create: {
        id: p.id,
        organizationId: org.id,
        clientId,
        name: p.name,
        description: p.description || '',
        status: p.status || 'IN_PROGRESS',
        tcv: p.totalContractValue || 0,
        allocatedBudget: p.grossInvoiced || 0,
        startDate: p.startDate ? new Date(p.startDate) : null,
        endDate: p.targetDeliveryDate ? new Date(p.targetDeliveryDate) : null,
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_PROJECTS.length} projects.`);

  // 6. Seed Tasks
  for (const t of INITIAL_TASKS) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: {
        title: t.title,
        status: t.status,
      },
      create: {
        id: t.id,
        organizationId: org.id,
        projectId: t.projectId,
        assigneeId: t.assigneeId || null,
        title: t.title,
        description: t.description || '',
        status: t.status || 'TODO',
        priority: t.priority?.toUpperCase() || 'MEDIUM',
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_TASKS.length} sprint tasks.`);

  // 7. Seed Payouts
  for (const p of INITIAL_PAYOUT_LEDGER) {
    await prisma.payout.upsert({
      where: { id: p.id },
      update: { status: p.status },
      create: {
        id: p.id,
        organizationId: org.id,
        projectId: p.projectId,
        recipientId: p.contractorId,
        amount: p.calculatedPayoutAmount || 0,
        type: p.agreementModel || 'SALARY',
        status: p.status || 'PENDING',
        verifiedByPmId: p.step1ApprovedBy || null,
        disbursedByAdminId: p.step2AuthorizedBy || null,
        disbursedAt: p.step2AuthorizedAt ? new Date(p.step2AuthorizedAt) : null,
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_PAYOUT_LEDGER.length} payout ledger entries.`);

  // 8. Seed Direct Expenses
  for (const e of INITIAL_DIRECT_EXPENSES) {
    await prisma.directExpense.upsert({
      where: { id: e.id },
      update: {},
      create: {
        id: e.id,
        organizationId: org.id,
        projectId: 'proj-1',
        category: e.category,
        amount: e.amount,
        description: e.notes || e.category,
        expenseDate: e.expenseDate ? new Date(e.expenseDate) : new Date(),
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_DIRECT_EXPENSES.length} direct expenses.`);

  // 9. Seed Attendance Records
  for (const a of INITIAL_ATTENDANCE) {
    await prisma.attendanceRecord.upsert({
      where: {
        organizationId_userId_date: {
          organizationId: org.id,
          userId: a.userId,
          date: a.date,
        },
      },
      update: { status: a.status },
      create: {
        id: a.id,
        organizationId: org.id,
        userId: a.userId,
        date: a.date,
        status: a.status,
        checkIn: a.checkIn || null,
        checkOut: a.checkOut || null,
        workMode: 'ONSITE',
        remarks: a.notes || '',
        verifiedBy: a.markedById || null,
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_ATTENDANCE.length} daily attendance logs.`);

  console.log('🎉 PostgreSQL Enterprise Database fully seeded and ready!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
