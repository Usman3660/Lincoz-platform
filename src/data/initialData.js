/**
 * Lincoz Enterprise - Clean Production Initial State
 * Configured with Super Admin (Irfan) and zero historical/demo data.
 */

const defaultAdminPass = 'Pass#123';

export const INITIAL_USERS = [
  {
    id: 'usr-admin',
    name: 'Irfan',
    email: 'lincoztech@gmail.com',
    password: defaultAdminPass,
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Founder & Super Admin',
    department: 'Executive Governance',
    workMode: 'ONSITE',
    compensationType: 'SALARIED',
    salary: 180000,
    isMfaEnabled: true,
    mfaKey: '9988',
  },
];

export const INITIAL_CONTRACTORS = [];

export const INITIAL_PROJECTS = [];

export const INITIAL_TASKS = [];

export const INITIAL_CLIENTS_DIRECTORY = [];

export const INITIAL_CLIENT_INVOICES = [];

export const INITIAL_CLIENT_PAYMENTS = [];

export const INITIAL_SOURCE_PAYOUTS = [];

export const INITIAL_EXPENSE_CATEGORIES = [
  {
    id: 'exp-cat-1',
    name: 'Software Subscriptions',
    description: 'SaaS licenses, developer tools, and productivity applications.',
    createdAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'exp-cat-2',
    name: 'Hardware & Infrastructure',
    description: 'Workstations, hardware procurement, networking gear, and lab equipment.',
    createdAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'exp-cat-3',
    name: 'Cloud Hosting',
    description: 'AWS, GCP, Supabase PostgreSQL, and cloud compute nodes.',
    createdAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'exp-cat-4',
    name: 'Legal & Professional',
    description: 'Corporate filings, compliance audits, and legal counsel fees.',
    createdAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'exp-cat-5',
    name: 'Office & Utilities',
    description: 'Physical workspace rent, broadband fiber, and power utilities.',
    createdAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'exp-cat-6',
    name: 'Marketing & Sales',
    description: 'Digital advertising, client presentations, and brand materials.',
    createdAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'exp-cat-7',
    name: 'Travel & Entertainment',
    description: 'Client on-site travel, team dinners, and conference attendance.',
    createdAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'exp-cat-8',
    name: 'Miscellaneous',
    description: 'General uncategorized operational expenditures.',
    createdAt: '2026-08-01T08:00:00.000Z'
  }
];

export const INITIAL_DIRECT_EXPENSES = [];

export const INITIAL_PAYOUT_LEDGER = [];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'audit-init-01',
    timestamp: new Date().toISOString(),
    actorId: 'usr-admin',
    actorName: 'Irfan',
    actorRole: 'SUPER_ADMIN',
    actionType: 'PLATFORM_INITIALIZED',
    targetEntity: 'SYSTEM',
    targetId: 'sys-primary',
    clientIp: '127.0.0.1',
    userAgent: 'Lincoz Enterprise Engine / Clean State',
    previousState: null,
    newState: {
      status: 'INITIALIZED',
      superAdmin: 'lincoztech@gmail.com',
      database: 'Supabase Cloud PostgreSQL',
    },
  },
];

export const INITIAL_ATTENDANCE = [];
