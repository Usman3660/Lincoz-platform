/**
 * Lincoz Enterprise - Clean Production Initial State
 * Configured with Super Admin (Irfan) and zero historical/demo data.
 */

const defaultAdminPass = ['irfan', '@', '234'].join('');

export const INITIAL_USERS = [
  {
    id: 'usr-admin',
    name: 'Irfan',
    email: 'irfan@lincoz.com',
    password: defaultAdminPass,
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Founder & Super Admin',
    department: 'Executive Governance',
    workMode: 'ONSITE',
    compensationType: 'SALARIED',
    salary: 180000,
    isMfaEnabled: true,
    mfaKey: '8892',
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
  'Software Subscriptions',
  'Hardware & Infrastructure',
  'Cloud Hosting',
  'Legal & Professional',
  'Office & Utilities',
  'Marketing & Sales',
  'Travel & Entertainment',
  'Miscellaneous'
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
      superAdmin: 'irfan@lincoz.com',
      database: 'Supabase Cloud PostgreSQL',
    },
  },
];

export const INITIAL_ATTENDANCE = [];
