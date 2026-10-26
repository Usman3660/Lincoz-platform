/**
 * Lincoz Enterprise - Clean Production Initial State
 * Configured with Super Admin (Irfan) and zero historical/demo data.
 */

export const INITIAL_USERS = [
  {
    id: 'usr-admin',
    name: 'Irfan',
    email: 'lincoztech@gmail.com',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Founder & Super Admin',
    department: 'Executive Governance',
    workMode: 'ONSITE',
    compensationType: 'SALARIED',
    salary: 0,
    isMfaEnabled: false,
  },
];

export const INITIAL_CONTRACTORS = [];

export const INITIAL_PROJECTS = [];

export const INITIAL_TASKS = [];

export const INITIAL_CLIENTS_DIRECTORY = [];

export const INITIAL_CLIENT_INVOICES = [];

export const INITIAL_CLIENT_PAYMENTS = [];

export const INITIAL_SOURCE_PAYOUTS = [];

export const INITIAL_EXPENSE_CATEGORIES = [];

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
