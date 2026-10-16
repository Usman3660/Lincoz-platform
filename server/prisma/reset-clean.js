/**
 * Lincoz Enterprise - Database Clean Reset
 * Wipes all demo data and provisions exclusively the Super Admin (Irfan).
 */

import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🧹 Clearing all existing database records from Supabase...');

  // 1. Delete dependent transactional and operational records
  await prisma.attendanceRecord.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.financialLedger.deleteMany({});
  await prisma.payout.deleteMany({});
  await prisma.directExpense.deleteMany({});
  await prisma.clientInvoice.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ All historical and demo records wiped successfully.');

  // 2. Ensure Primary Organization exists
  const org = await prisma.organization.upsert({
    where: { slug: 'lincoz-primary' },
    update: { name: 'Lincoz Digital Group' },
    create: {
      id: 'org_lincoz_primary',
      name: 'Lincoz Digital Group',
      slug: 'lincoz-primary',
      plan: 'ENTERPRISE',
    },
  });
  console.log(`✅ Organization confirmed: ${org.name} (${org.id})`);

  // 3. Hash Super Admin Password (irfan@234 with salt factor 12)
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('irfan@234', salt);

  // 4. Create the Super Admin User
  const superAdmin = await prisma.user.create({
    data: {
      id: 'usr-admin',
      organizationId: org.id,
      name: 'Irfan',
      email: 'irfan@lincoz.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      title: 'Founder & Super Admin',
      department: 'Executive Governance',
      workMode: 'ONSITE',
      compensationType: 'SALARIED',
      salary: 180000,
      isMfaEnabled: true,
      mfaKey: '8892',
    },
  });

  console.log('👑 Super Admin Created Successfully:');
  console.log(`   - Name: ${superAdmin.name}`);
  console.log(`   - Email: ${superAdmin.email}`);
  console.log(`   - Role: ${superAdmin.role}`);
  console.log(`   - Fixed 2FA Key: ${superAdmin.mfaKey}`);

  // 5. Verification Counts
  const counts = {
    users: await prisma.user.count(),
    projects: await prisma.project.count(),
    tasks: await prisma.task.count(),
    clients: await prisma.client.count(),
    payouts: await prisma.payout.count(),
    attendance: await prisma.attendanceRecord.count(),
  };

  console.log('\n📊 Database Status After Reset:');
  console.table(counts);
  console.log('🎉 Clean Supabase database is ready!');
}

resetDatabase()
  .catch((err) => {
    console.error('❌ Reset failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
