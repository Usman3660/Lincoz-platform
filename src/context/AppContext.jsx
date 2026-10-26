import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  INITIAL_USERS,
  INITIAL_CONTRACTORS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_PAYOUT_LEDGER,
  INITIAL_AUDIT_LOGS,
  INITIAL_CLIENTS_DIRECTORY,
  INITIAL_CLIENT_INVOICES,
  INITIAL_CLIENT_PAYMENTS,
  INITIAL_SOURCE_PAYOUTS,
  INITIAL_DIRECT_EXPENSES,
  INITIAL_EXPENSE_CATEGORIES,
  INITIAL_ATTENDANCE
} from '../data/initialData';
import { api } from '../services/apiClient';
import { secureRandomId, secureRandomDigits, secureRandomString, secureRandomInt } from '../utils/cryptoUtils';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Automatic clean state migration check (Wipes legacy demo data from client localStorage)
  const SCHEMA_VERSION = 'lincoz_v12_live_db_expenses_categories';
  try {
    const currentVersion = localStorage.getItem('lincoz_schema_version');
    if (currentVersion !== SCHEMA_VERSION) {
      localStorage.setItem('lincoz_schema_version', SCHEMA_VERSION);
      localStorage.removeItem('lincoz_users');
      localStorage.removeItem('lincoz_projects');
      localStorage.removeItem('lincoz_tasks');
      localStorage.removeItem('lincoz_clients');
      localStorage.removeItem('lincoz_contractors');
      localStorage.removeItem('lincoz_payout_ledger');
      localStorage.removeItem('lincoz_attendance');
      localStorage.removeItem('lincoz_direct_expenses');
      localStorage.removeItem('lincoz_expense_categories');
      localStorage.removeItem('lincoz_client_invoices');
      localStorage.removeItem('lincoz_audit_logs');
      localStorage.removeItem('lincoz_current_user_id');
    }
  } catch (e) {}

  // Theme state ('dark' | 'light') - Default to white / light
  const [theme, setTheme] = useState(() => {
    try {
      const hasThemePreference = localStorage.getItem('lincoz_theme_set_by_user');
      if (!hasThemePreference) {
        localStorage.setItem('lincoz_theme', 'light');
        localStorage.setItem('lincoz_theme_set_by_user', 'true');
        return 'light';
      }
      const saved = localStorage.getItem('lincoz_theme');
      return saved || 'light';
    } catch (e) {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lincoz_theme', theme);
      const root = document.documentElement;
      if (theme === 'light') {
        root.classList.remove('dark');
        root.classList.add('light');
      } else {
        root.classList.remove('light');
        root.classList.add('dark');
      }
    } catch (e) {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Safe localStorage persistence with fallback and intelligent roster sync
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('lincoz_users');
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge missing users from INITIAL_USERS and ensure defaults
        const existingIds = new Set(parsed.map(u => u.id));
        const missingUsers = INITIAL_USERS.filter(u => !existingIds.has(u.id));
        const merged = [...parsed, ...missingUsers].map(u => {
          const initUser = INITIAL_USERS.find(iu => iu.id === u.id);
          const isPercentage = u.compensationType === 'PERCENTAGE' || u.role === 'PARTNER';
          const defaultSalary = u.role === 'SUPER_ADMIN' ? 180000 : u.role === 'PROJECT_MANAGER' ? 135000 : 120000;
          return {
            ...u,
            email: u.email || initUser?.email,
            isMfaEnabled: false,
            workMode: u.workMode || (u.role === 'ONSITE_MEMBER' ? 'ONSITE' : 'REMOTE'),
            compensationType: isPercentage ? 'PERCENTAGE' : 'SALARIED',
            salary: !isPercentage ? ((u.salary !== undefined && u.salary !== null && !isNaN(Number(u.salary))) ? Number(u.salary) : defaultSalary) : undefined,
            percentage: isPercentage ? (u.percentage || 15.0) : undefined
          };
        });
        return merged;
      }
      return INITIAL_USERS;
    } catch (e) {
      return INITIAL_USERS;
    }
  });

  const [currentUserId, setCurrentUserId] = useState(() => {
    try {
      const saved = localStorage.getItem('lincoz_current_user_id');
      return saved || '';
    } catch (e) {
      return '';
    }
  });

  const [contractors, setContractors] = useState(() => {
    try {
      const saved = localStorage.getItem('lincoz_contractors');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CONTRACTORS;
    } catch (e) {
      return INITIAL_CONTRACTORS;
    }
  });

  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('lincoz_projects');
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map(p => p.id));
        const missing = INITIAL_PROJECTS.filter(p => !existingIds.has(p.id));
        const combined = missing.length > 0 ? [...parsed, ...missing] : parsed;
        return combined.map(p => {
          const init = INITIAL_PROJECTS.find(ip => ip.id === p.id);
          const reqDoc = (init?.requirementDoc && !p.requirementDoc) ? init.requirementDoc : p.requirementDoc;
          const activePmId = p.projectManagerId;
          // Filter out other PMs from assignedTeamIds so only current PM remains
          const otherPmIds = new Set(INITIAL_USERS.filter(u => u.role === 'PROJECT_MANAGER' && u.id !== activePmId).map(u => u.id));
          const cleanedTeam = (p.assignedTeamIds || []).filter(id => !otherPmIds.has(id));
          if (activePmId && !cleanedTeam.includes(activePmId)) {
            cleanedTeam.push(activePmId);
          }
          return {
            ...p,
            requirementDoc: reqDoc,
            assignedTeamIds: cleanedTeam
          };
        });
      }
      return INITIAL_PROJECTS;
    } catch (e) {
      return INITIAL_PROJECTS;
    }
  });

  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('lincoz_tasks');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TASKS;
    } catch (e) {
      return INITIAL_TASKS;
    }
  });

  const [payoutLedger, setPayoutLedger] = useState(() => {
    try {
      const saved = localStorage.getItem('lincoz_payout_ledger');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PAYOUT_LEDGER;
    } catch (e) {
      return INITIAL_PAYOUT_LEDGER;
    }
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('lincoz_audit_logs');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_AUDIT_LOGS;
    } catch (e) {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [clientInvoices, setClientInvoices] = useState(() => {
    try {
      const saved = localStorage.getItem('lincoz_client_invoices');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CLIENT_INVOICES;
    } catch (e) {
      return INITIAL_CLIENT_INVOICES;
    }
  });

  const [clientPayments, setClientPayments] = useState(() => {
    try {
      const saved = localStorage.getItem('lincoz_client_payments');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CLIENT_PAYMENTS;
    } catch (e) {
      return INITIAL_CLIENT_PAYMENTS;
    }
  });

  const [sourcePayouts, setSourcePayouts] = useState(() => {
    try {
      const saved = localStorage.getItem('lincoz_source_payouts');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SOURCE_PAYOUTS;
    } catch (e) {
      return INITIAL_SOURCE_PAYOUTS;
    }
  });

  const [directExpensesList, setDirectExpensesList] = useState(() => {
    try {
      const saved = localStorage.getItem('lincoz_direct_expenses');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  const [expenseCategories, setExpenseCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('lincoz_expense_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
            .map((item, idx) => {
              if (typeof item === 'string') {
                return {
                  id: `exp-cat-${idx + 1}-${item.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                  name: item,
                  description: '',
                  createdAt: new Date().toISOString()
                };
              }
              return {
                id: item.id || `exp-cat-${idx + 1}`,
                name: item.name || '',
                description: item.description || '',
                createdAt: item.createdAt || new Date().toISOString()
              };
            })
            .filter(c => c && typeof c.name === 'string' && c.name.trim().length > 0);
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('lincoz_attendance');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ATTENDANCE;
    } catch (e) {
      return INITIAL_ATTENDANCE;
    }
  });

  const INITIAL_NOTIFICATIONS = [
    {
      id: 'notif-1',
      title: 'Disbursement Authorization Pending',
      message: 'Deliverable payout for David Vance (Rs 6,000.00) requires Super Admin Step-2 signature.',
      type: 'warning',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
      targetRoles: ['SUPER_ADMIN'],
      targetUserId: 'usr-admin'
    },
    {
      id: 'notif-2',
      title: 'Project Deliverable Nearing Due Date',
      message: 'Deliverables for Quantum Ledger Node are scheduled for review.',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      read: false,
      projectId: 'proj-1',
      targetRoles: ['SUPER_ADMIN', 'PROJECT_MANAGER']
    },
    {
      id: 'notif-3',
      title: 'Task Assigned: WebRTC SFU Media Relay',
      message: 'You have been assigned to task "Implement WebRTC SFU Media Relay Engine".',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      read: false,
      projectId: 'proj-1',
      targetUserId: 'usr-eng-1',
      targetRoles: ['ONSITE_MEMBER']
    },
    {
      id: 'notif-4',
      title: 'Contractor Commission Agreement Active',
      message: 'Your 22.5% direct project commission model for Decentralized Identity Vault is active.',
      type: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      read: false,
      projectId: 'proj-2',
      targetUserId: 'usr-partner-1',
      targetRoles: ['PARTNER']
    }
  ];

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('lincoz_notifications');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_NOTIFICATIONS;
    } catch (e) {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [clients, setClients] = useState(() => {
    try {
      const saved = localStorage.getItem('lincoz_clients_directory');
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(c => {
          const init = INITIAL_CLIENTS_DIRECTORY.find(ic => ic.id === c.id);
          if (init && Array.isArray(init.associatedProjects)) {
            const merged = Array.from(new Set([...(c.associatedProjects || []), ...init.associatedProjects]));
            return { ...c, associatedProjects: merged };
          }
          return c;
        });
      }
      return INITIAL_CLIENTS_DIRECTORY;
    } catch (e) {
      return INITIAL_CLIENTS_DIRECTORY;
    }
  });

  // Live PostgreSQL Database Synchronization (Real-Time DB Connection)
  const syncFromDatabase = useCallback(async () => {
    try {
      const token = localStorage.getItem('lincoz_auth_token');
      if (!token) return;

      // 0. Fetch live users from PostgreSQL
      const usersRes = await api.get('/users').catch(() => null);
      if (usersRes?.data && Array.isArray(usersRes.data)) {
        setUsers(usersRes.data);
        try {
          localStorage.setItem('lincoz_users', JSON.stringify(usersRes.data));
        } catch (e) {}
      }

      // 1. Fetch live clients directory from PostgreSQL
      const clientsRes = await api.get('/clients').catch(() => null);
      if (clientsRes?.data && Array.isArray(clientsRes.data)) {
        setClients(clientsRes.data);
        try {
          localStorage.setItem('lincoz_clients_directory', JSON.stringify(clientsRes.data));
        } catch (e) {}
      }

      // 2. Fetch live projects from PostgreSQL
      const projRes = await api.get('/projects').catch(() => null);
      if (projRes?.data && Array.isArray(projRes.data)) {
        setProjects(projRes.data);
        try {
          localStorage.setItem('lincoz_projects', JSON.stringify(projRes.data));
        } catch (e) {}
      }

      // 3. Fetch live sprint tasks from PostgreSQL
      const tasksRes = await api.get('/projects/tasks').catch(() => null);
      if (tasksRes?.data && Array.isArray(tasksRes.data)) {
        setTasks(tasksRes.data);
        try {
          localStorage.setItem('lincoz_tasks', JSON.stringify(tasksRes.data));
        } catch (e) {}
      }

      // 4. Fetch live attendance records from PostgreSQL
      const attRes = await api.get('/attendance').catch(() => null);
      if (attRes?.data && Array.isArray(attRes.data)) {
        setAttendanceRecords(attRes.data);
        try {
          localStorage.setItem('lincoz_attendance', JSON.stringify(attRes.data));
        } catch (e) {}
      }

      // 5. Fetch live payouts from PostgreSQL
      const payRes = await api.get('/financials/payouts').catch(() => null);
      if (payRes?.data && Array.isArray(payRes.data)) {
        setPayoutLedger(payRes.data);
        try {
          localStorage.setItem('lincoz_payout_ledger', JSON.stringify(payRes.data));
        } catch (e) {}
      }

      // 6. Fetch live direct expenses from PostgreSQL
      const expRes = await api.get('/financials/expenses').catch(() => null);
      if (expRes?.success && Array.isArray(expRes.data)) {
        setDirectExpensesList(expRes.data);
        try {
          localStorage.setItem('lincoz_direct_expenses', JSON.stringify(expRes.data));
        } catch (e) {}
      }

      // 7. Fetch live expense categories from PostgreSQL
      const catRes = await api.get('/financials/expense-categories').catch(() => null);
      if (catRes?.success && Array.isArray(catRes.data)) {
        setExpenseCategories(catRes.data);
        try {
          localStorage.setItem('lincoz_expense_categories', JSON.stringify(catRes.data));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('[PostgreSQL Sync] Error syncing data from database:', err.message);
    }
  }, []);

  // Trigger real-time database sync on mount and whenever session is active
  useEffect(() => {
    const token = localStorage.getItem('lincoz_auth_token');
    if (token || currentUserId) {
      syncFromDatabase();
    }
  }, [currentUserId, syncFromDatabase]);

  // Selected Month Filter for Global Monthly Financial Calculations
  const [selectedMonth, setSelectedMonth] = useState(() => {
    try {
      const saved = localStorage.getItem('lincoz_selected_month');
      return (saved && saved !== 'undefined') ? saved : '2026-10';
    } catch (e) {
      return '2026-10';
    }
  });

  const availableMonths = useMemo(() => {
    const monthSet = new Set(['2026-10', '2026-09', '2026-08', '2026-07', '2026-06']);
    
    // Scan all transactions
    (clientInvoices || []).forEach(i => {
      const d = i.issueDate || i.date;
      if (d && d.length >= 7) monthSet.add(d.slice(0, 7));
    });
    (clientPayments || []).forEach(p => {
      const d = p.paymentDate || p.date;
      if (d && d.length >= 7) monthSet.add(d.slice(0, 7));
    });
    (sourcePayouts || []).forEach(s => {
      const d = s.payoutDate || s.date;
      if (d && d.length >= 7) monthSet.add(d.slice(0, 7));
    });
    (directExpensesList || []).forEach(e => {
      const d = e.expenseDate || e.date;
      if (d && d.length >= 7) monthSet.add(d.slice(0, 7));
    });
    (payoutLedger || []).forEach(pl => {
      const d = pl.step2AuthorizedAt ? pl.step2AuthorizedAt.split('T')[0] : (pl.date || pl.createdAt);
      if (d && d.length >= 7) monthSet.add(d.slice(0, 7));
    });

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const sorted = Array.from(monthSet).sort((a, b) => b.localeCompare(a));
    const list = [
      { id: 'ALL', value: 'ALL', label: 'All Time (Full Ledger History)' }
    ];

    sorted.forEach(m => {
      const parts = m.split('-');
      if (parts.length === 2) {
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const name = monthNames[monthIndex] || parts[1];
        const isCurrent = m === '2026-10';
        list.push({
          id: m,
          value: m,
          label: `${name} ${year}${isCurrent ? ' (Current Month)' : ''}`
        });
      }
    });

    return list;
  }, [clientInvoices, clientPayments, sourcePayouts, directExpensesList, payoutLedger]);

  useEffect(() => {
    try {
      if (selectedMonth) {
        localStorage.setItem('lincoz_selected_month', selectedMonth);
      }
    } catch (e) {}
  }, [selectedMonth]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('lincoz_users', JSON.stringify(users));
    } catch (e) {}
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('lincoz_current_user_id', currentUserId);
    } catch (e) {}
  }, [currentUserId]);

  useEffect(() => {
    try {
      localStorage.setItem('lincoz_contractors', JSON.stringify(contractors));
    } catch (e) {}
  }, [contractors]);

  useEffect(() => {
    try {
      localStorage.setItem('lincoz_projects', JSON.stringify(projects));
    } catch (e) {}
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem('lincoz_tasks', JSON.stringify(tasks));
    } catch (e) {}
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('lincoz_payout_ledger', JSON.stringify(payoutLedger));
    } catch (e) {}
  }, [payoutLedger]);

  useEffect(() => {
    try {
      localStorage.setItem('lincoz_audit_logs', JSON.stringify(auditLogs));
    } catch (e) {}
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('lincoz_notifications', JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('lincoz_clients_directory', JSON.stringify(clients));
    } catch (e) {}
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem('lincoz_client_invoices', JSON.stringify(clientInvoices));
    } catch (e) {}
  }, [clientInvoices]);

  useEffect(() => {
    try {
      localStorage.setItem('lincoz_client_payments', JSON.stringify(clientPayments));
    } catch (e) {}
  }, [clientPayments]);

  useEffect(() => {
    try {
      localStorage.setItem('lincoz_source_payouts', JSON.stringify(sourcePayouts));
    } catch (e) {}
  }, [sourcePayouts]);

  useEffect(() => {
    try {
      localStorage.setItem('lincoz_direct_expenses', JSON.stringify(directExpensesList));
    } catch (e) {}
  }, [directExpensesList]);

  useEffect(() => {
    try {
      localStorage.setItem('lincoz_attendance', JSON.stringify(attendanceRecords));
    } catch (e) {}
  }, [attendanceRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('lincoz_expense_categories', JSON.stringify(expenseCategories));
    } catch (e) {}
  }, [expenseCategories]);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('lincoz_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (currentUserId) {
      const found = users.find(u => u.id === currentUserId);
      if (found) {
        setCurrentUser(found);
        try {
          localStorage.setItem('lincoz_user', JSON.stringify(found));
        } catch (e) {}
      }
    } else {
      setCurrentUser(null);
      try {
        localStorage.removeItem('lincoz_user');
      } catch (e) {}
    }
  }, [currentUserId, users]);

  const pushNotification = (title, message, type = 'info', meta = {}) => {
    const newNotif = {
      id: 'notif-' + Date.now() + secureRandomString(4),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      actorId: currentUser?.id,
      actorName: currentUser?.name,
      ...meta
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 49)]);
  };

  const generateUUID = () => {
    return secureRandomId('');
  };

  const recordAuditLog = ({
    taskId = null,
    taskTitle = null,
    projectId = null,
    projectName = null,
    actionType,
    itemText,
    previousState,
    newState
  }) => {
    const proj = projectId ? projects.find(p => p.id === projectId) : null;
    const tsk = taskId ? tasks.find(t => t.id === taskId) : null;

    const logEntry = {
      id: generateUUID(),
      taskId: taskId || (tsk ? tsk.id : null),
      taskTitle: taskTitle || (tsk ? tsk.title : null),
      projectId: projectId || (proj ? proj.id : (tsk ? tsk.projectId : null)),
      projectName: projectName || (proj ? proj.name : 'System Governance'),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actionType,
      itemText,
      previousState: previousState ? JSON.parse(JSON.stringify(previousState)) : null,
      newState: newState ? JSON.parse(JSON.stringify(newState)) : null,
      clientIp: '192.168.1.' + secureRandomInt(100, 180),
      userAgent: window.navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    setAuditLogs(prev => [logEntry, ...prev]);
    return logEntry;
  };

  const toggleChecklistItem = (taskId, checklistId) => {
    let oldStateVal = false;
    let newStateVal = true;
    let checklistItemText = '';
    let updatedTaskRef = null;

    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id !== taskId) return task;
        const updatedChecklists = (task.checklists || []).map(item => {
          if (item.id === checklistId) {
            oldStateVal = item.isCompleted;
            newStateVal = !item.isCompleted;
            checklistItemText = item.text;
            return { ...item, isCompleted: newStateVal };
          }
          return item;
        });
        const updated = { ...task, checklists: updatedChecklists };
        updatedTaskRef = updated;
        return updated;
      });
    });

    if (updatedTaskRef) {
      recordAuditLog({
        taskId,
        taskTitle: updatedTaskRef.title,
        projectId: updatedTaskRef.projectId,
        actionType: newStateVal ? 'ITEM_CHECKED' : 'ITEM_UNCHECKED',
        itemText: checklistItemText,
        previousState: { isCompleted: oldStateVal },
        newState: { isCompleted: newStateVal }
      });

      pushNotification(
        `Checklist Item ${newStateVal ? 'Completed' : 'Reopened'}`,
        `${currentUser.name} marked "${checklistItemText}" as ${newStateVal ? 'completed' : 'incomplete'}.`,
        'success',
        {
          projectId: updatedTaskRef.projectId,
          taskId,
          targetRoles: ['SUPER_ADMIN', 'PROJECT_MANAGER'],
          targetUserId: updatedTaskRef.assigneeId
        }
      );
    }
  };

  const calculateNextDueDate = (currentDueDate, frequency) => {
    const freq = (frequency || '').toUpperCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let baseDate = today;
    if (currentDueDate && typeof currentDueDate === 'string') {
      const parts = currentDueDate.trim().split('-');
      if (parts.length === 3) {
        const parsed = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (!isNaN(parsed.getTime())) {
          baseDate = parsed;
        }
      }
    }

    const next = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());

    if (freq === 'DAILY') {
      next.setDate(next.getDate() + 1);
    } else if (freq === 'WEEKLY') {
      next.setDate(next.getDate() + 7);
    } else if (freq === 'MONTHLY') {
      const currentMonth = next.getMonth();
      next.setMonth(currentMonth + 1);
      if (next.getMonth() > (currentMonth + 1) % 12) {
        next.setDate(0);
      }
    }

    // If extending from an old past due date still results in a past date,
    // advance starting from today so the new task has a forward-looking deadline
    if (next < today) {
      const fresh = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (freq === 'DAILY') {
        fresh.setDate(fresh.getDate() + 1);
      } else if (freq === 'WEEKLY') {
        fresh.setDate(fresh.getDate() + 7);
      } else if (freq === 'MONTHLY') {
        const cm = fresh.getMonth();
        fresh.setMonth(cm + 1);
        if (fresh.getMonth() > (cm + 1) % 12) {
          fresh.setDate(0);
        }
      }
      const y = fresh.getFullYear();
      const m = String(fresh.getMonth() + 1).padStart(2, '0');
      const d = String(fresh.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    const y = next.getFullYear();
    const m = String(next.getMonth() + 1).padStart(2, '0');
    const d = String(next.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const createTask = (taskData) => {
    const newTask = {
      id: 'task-' + Date.now() + '-' + secureRandomInt(0, 999),
      createdById: currentUser?.id || 'usr-pm',
      status: taskData.status || 'BACKLOG',
      repeatFrequency: taskData.repeatFrequency || 'NONE',
      recurrenceSpawned: false,
      checklists: taskData.checklists || [],
      deliverables: taskData.deliverables || [],
      comments: taskData.comments || [],
      isBlocked: false,
      blockReason: '',
      ...taskData,
    };

    setTasks(prev => [newTask, ...prev]);

    // Persist to PostgreSQL in background
    api.post('/projects/tasks', newTask)
      .then(res => {
        if (res?.data) {
          setTasks(prev => prev.map(t => t.id === newTask.id ? { ...t, ...res.data } : t));
        }
      })
      .catch(err => {
        console.warn('[DB Task Create] PostgreSQL sync notice:', err.message);
      });

    recordAuditLog({
      taskId: newTask.id,
      taskTitle: newTask.title,
      projectId: newTask.projectId,
      actionType: 'CREATED',
      itemText: `Created task "${newTask.title}" (Priority: ${newTask.priority}${newTask.repeatFrequency && newTask.repeatFrequency !== 'NONE' ? `, Repeats: ${newTask.repeatFrequency}` : ''})`,
      previousState: null,
      newState: newTask
    });

    pushNotification(
      'New Task Created',
      `"${newTask.title}" was added to project backlog.`,
      'success',
      {
        projectId: newTask.projectId,
        taskId: newTask.id,
        targetRoles: ['SUPER_ADMIN', 'PROJECT_MANAGER'],
        targetUserId: newTask.assigneeId
      }
    );
    return newTask;
  };

  const triggerRecurrenceIfEligible = (completedTask) => {
    if (!completedTask) return;

    const freq = (completedTask.repeatFrequency || '').toUpperCase();
    if (!freq || freq === 'NONE') return;

    // Prevent double execution on the same completed task
    if (completedTask.recurrenceSpawned) return;

    const nextDueDate = calculateNextDueDate(completedTask.dueDate, freq);

    // Reset checklist verification criteria for the new task
    const resetChecklists = (completedTask.checklists || []).map((chk, idx) => ({
      id: `chk-${Date.now()}-${idx}-${secureRandomInt(0, 999)}`,
      text: chk.text,
      isCompleted: false,
    }));

    const newTask = {
      id: 'task-' + Date.now() + '-' + secureRandomInt(0, 999),
      createdById: currentUser?.id || 'usr-pm',
      projectId: completedTask.projectId,
      title: completedTask.title,
      description: completedTask.description || '',
      priority: completedTask.priority || 'Medium',
      assigneeId: completedTask.assigneeId || '',
      dueDate: nextDueDate,
      estimatedHours: completedTask.estimatedHours || 10,
      status: completedTask.assigneeId ? 'ASSIGNED' : 'BACKLOG',
      repeatFrequency: completedTask.repeatFrequency,
      checklists: resetChecklists,
      deliverables: [],
      comments: [],
      isBlocked: false,
      blockReason: '',
      recurrenceSpawned: false,
    };

    // Mark completed task as recurrenceSpawned and prepend the newly created task atomically
    setTasks(prev => {
      const updatedPrev = prev.map(t =>
        t.id === completedTask.id ? { ...t, recurrenceSpawned: true } : t
      );
      return [newTask, ...updatedPrev];
    });

    recordAuditLog({
      taskId: newTask.id,
      taskTitle: newTask.title,
      projectId: newTask.projectId,
      actionType: 'CREATED',
      itemText: `Auto-scheduled recurring task "${newTask.title}" for ${freq.toLowerCase()} cycle (Due: ${nextDueDate})`,
      previousState: { sourceTaskId: completedTask.id },
      newState: newTask
    });

    pushNotification(
      'Recurring Task Re-Created',
      `"${completedTask.title}" re-created with deadline extended to ${nextDueDate} (${freq.toLowerCase()} repeat).`,
      'success',
      {
        projectId: completedTask.projectId,
        taskId: newTask.id,
        targetRoles: ['SUPER_ADMIN', 'PROJECT_MANAGER'],
        targetUserId: completedTask.assigneeId
      }
    );
  };

  const updateTaskStatus = (taskId, newStatus) => {
    const isManagerOrAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'PROJECT_MANAGER';

    // Only Project Managers and Super Admins can verify and move tasks to COMPLETED
    if (newStatus === 'COMPLETED' && !isManagerOrAdmin) {
      pushNotification(
        'Action Restricted',
        'Only Project Managers and Super Admins can verify and mark tasks as Completed.',
        'warning'
      );
      return;
    }

    // Only Project Managers and Super Admins can move tasks into BACKLOG
    if (newStatus === 'BACKLOG' && !isManagerOrAdmin) {
      pushNotification(
        'Action Restricted',
        'Only Project Managers and Super Admins can move tasks to Backlog.',
        'warning'
      );
      return;
    }

    let oldStatus = '';
    let taskRef = null;

    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id !== taskId) return task;
        // Non-managers cannot alter already COMPLETED tasks
        if (task.status === 'COMPLETED' && !isManagerOrAdmin && newStatus !== 'COMPLETED') {
          return task;
        }
        // Non-managers cannot move tasks from BACKLOG to ASSIGNED or any other status
        if (task.status === 'BACKLOG' && !isManagerOrAdmin) {
          pushNotification(
            'Action Restricted',
            'Only Project Managers and Super Admins can move tasks from the Backlog to Assigned.',
            'warning'
          );
          return task;
        }
        oldStatus = task.status;
        taskRef = {
          ...task,
          status: newStatus
        };
        return taskRef;
      });
    });

    if (taskRef && oldStatus !== newStatus) {
      recordAuditLog({
        taskId,
        taskTitle: taskRef.title,
        projectId: taskRef.projectId,
        actionType: 'STATUS_CHANGED',
        itemText: `Transitioned status from ${oldStatus} to ${newStatus}`,
        previousState: { status: oldStatus },
        newState: { status: newStatus }
      });

      pushNotification(
        'Task Status Changed',
        `"${taskRef.title}" moved to ${newStatus.replace('_', ' ')} by ${currentUser.name}.`,
        'info',
        {
          projectId: taskRef.projectId,
          taskId,
          targetRoles: ['SUPER_ADMIN', 'PROJECT_MANAGER'],
          targetUserId: taskRef.assigneeId
        }
      );

      // Automatically trigger repeating task generation if completed
      if (newStatus === 'COMPLETED' && oldStatus !== 'COMPLETED') {
        triggerRecurrenceIfEligible(taskRef);
      }

      api.patch(`/projects/tasks/${taskId}`, { status: newStatus }).catch(err => {
        console.warn('[DB Task Status] PostgreSQL sync notice:', err.message);
      });
    }
  };

  const toggleTaskBlock = (taskId, blockReason = '') => {
    let oldBlock = false;
    let newBlock = true;
    let taskRef = null;

    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id !== taskId) return task;
        oldBlock = task.isBlocked;
        newBlock = !task.isBlocked;
        taskRef = {
          ...task,
          isBlocked: newBlock,
          blockReason: newBlock ? (blockReason || 'Flagged by team member') : ''
        };
        return taskRef;
      });
    });

    if (taskRef) {
      recordAuditLog({
        taskId,
        taskTitle: taskRef.title,
        projectId: taskRef.projectId,
        actionType: newBlock ? 'BLOCKED' : 'UNBLOCKED',
        itemText: newBlock ? `Task flagged blocked: ${blockReason}` : 'Task unblocked',
        previousState: { isBlocked: oldBlock },
        newState: { isBlocked: newBlock, blockReason }
      });

      pushNotification(
        newBlock ? 'Task Blocked' : 'Task Unblocked',
        `"${taskRef.title}" was ${newBlock ? 'flagged as blocked' : 'cleared'} by ${currentUser.name}.`,
        newBlock ? 'warning' : 'success',
        {
          projectId: taskRef.projectId,
          taskId,
          targetRoles: ['SUPER_ADMIN', 'PROJECT_MANAGER'],
          targetUserId: taskRef.assigneeId
        }
      );
    }
  };

  const updateTask = (taskId, updates) => {
    const isManagerOrAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'PROJECT_MANAGER';
    if (updates.status === 'COMPLETED' && !isManagerOrAdmin) {
      pushNotification(
        'Action Restricted',
        'Only Project Managers and Super Admins can verify and mark tasks as Completed.',
        'warning'
      );
      delete updates.status;
      if (Object.keys(updates).length === 0) return;
    }
    if (updates.status === 'BACKLOG' && !isManagerOrAdmin) {
      pushNotification(
        'Action Restricted',
        'Only Project Managers and Super Admins can manage tasks in the Backlog.',
        'warning'
      );
      delete updates.status;
      if (Object.keys(updates).length === 0) return;
    }

    let oldTask = null;
    let updatedTask = null;

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        oldTask = t;
        if (t.status === 'COMPLETED' && !isManagerOrAdmin && updates.status && updates.status !== 'COMPLETED') {
          delete updates.status;
        }
        updatedTask = {
          ...t,
          ...updates
        };
        return updatedTask;
      }
      return t;
    }));

    if (updatedTask) {
      recordAuditLog({
        taskId,
        taskTitle: updatedTask.title,
        projectId: updatedTask.projectId,
        actionType: 'MODIFIED',
        itemText: `Updated properties for task "${updatedTask.title}"`,
        previousState: oldTask,
        newState: updatedTask
      });

      pushNotification(
        'Task Updated',
        `"${updatedTask.title}" specifications updated by ${currentUser.name}.`,
        'info',
        {
          projectId: updatedTask.projectId,
          taskId,
          targetRoles: ['SUPER_ADMIN', 'PROJECT_MANAGER'],
          targetUserId: updatedTask.assigneeId
        }
      );

      // Trigger repeating task if updated to COMPLETED
      if (oldTask && oldTask.status !== 'COMPLETED' && updatedTask.status === 'COMPLETED') {
        triggerRecurrenceIfEligible(updatedTask);
      }

      api.patch(`/projects/tasks/${taskId}`, updates).catch(err => {
        console.warn('[DB Task Update] PostgreSQL sync notice:', err.message);
      });
    }
  };

  const deleteTask = (taskId) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    setTasks(prev => prev.filter(t => t.id !== taskId));
    api.delete(`/projects/tasks/${taskId}`).catch(err => {
      console.warn('[DB Task Delete] PostgreSQL sync notice:', err.message);
    });

    recordAuditLog({
      taskId,
      taskTitle: taskToDelete.title,
      projectId: taskToDelete.projectId,
      actionType: 'DELETED',
      itemText: `Deleted task "${taskToDelete.title}"`,
      previousState: taskToDelete,
      newState: null
    });

    pushNotification(
      'Task Deleted',
      `"${taskToDelete.title}" was deleted by ${currentUser.name}.`,
      'info',
      {
        projectId: taskToDelete.projectId,
        taskId,
        targetRoles: ['SUPER_ADMIN', 'PROJECT_MANAGER'],
        targetUserId: taskToDelete.assigneeId
      }
    );
  };

  const addComment = (taskId, text) => {
    if (!text || !text.trim()) return;
    const newComment = {
      id: 'cm-' + Date.now(),
      userId: currentUser.id,
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    let targetTask = null;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        targetTask = t;
        return { ...t, comments: [...(t.comments || []), newComment] };
      }
      return t;
    }));

    if (targetTask) {
      pushNotification(
        'New Comment on Task',
        `${currentUser.name} commented on "${targetTask.title}".`,
        'info',
        {
          projectId: targetTask.projectId,
          taskId,
          targetRoles: ['SUPER_ADMIN', 'PROJECT_MANAGER'],
          targetUserId: targetTask.assigneeId
        }
      );
    }
  };

  const addDeliverable = (taskId, deliverable) => {
    let taskRef = null;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        taskRef = {
          ...t,
          deliverables: [...(t.deliverables || []), deliverable],
          status: t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED' ? 'PENDING_REVIEW' : t.status
        };
        return taskRef;
      }
      return t;
    }));

    if (taskRef) {
      recordAuditLog({
        taskId,
        taskTitle: taskRef.title,
        projectId: taskRef.projectId,
        actionType: 'DELIVERABLE_SUBMITTED',
        itemText: `Submitted deliverable "${deliverable.title}" (${deliverable.type}) and requested review`,
        previousState: { deliverablesCount: ((taskRef.deliverables || []).length - 1) },
        newState: { deliverable }
      });

      pushNotification(
        'Deliverable Submitted',
        `New deliverable "${deliverable.title}" submitted by ${currentUser.name}.`,
        'info',
        {
          projectId: taskRef.projectId,
          taskId,
          targetRoles: ['SUPER_ADMIN', 'PROJECT_MANAGER']
        }
      );
    }
  };

  const createProject = (projectData) => {
    const assignedPm = projectData.projectManagerId || 'usr-pm';
    const initialTeam = [assignedPm];
    if (currentUser?.id && !initialTeam.includes(currentUser.id)) {
      initialTeam.push(currentUser.id);
    }

    const newProject = {
      id: 'proj-' + Date.now(),
      status: 'ACTIVE',
      grossInvoiced: 0,
      accountsReceivable: 0,
      directExpenses: 0,
      assignedTeamIds: initialTeam,
      ...projectData
    };

    setProjects(prev => [newProject, ...prev]);

    // Persist to PostgreSQL in background
    api.post('/projects', newProject)
      .then(res => {
        if (res?.data) {
          setProjects(prev => prev.map(p => p.id === newProject.id ? { ...p, ...res.data } : p));
        }
      })
      .catch(err => {
        console.warn('[DB Project Create] PostgreSQL sync notice:', err.message);
      });

    recordAuditLog({
      projectId: newProject.id,
      projectName: newProject.name,
      actionType: 'PROJECT_CREATED',
      itemText: `Created new project "${newProject.name}" (TCV: Rs ${(newProject.totalContractValue || 0).toLocaleString()})`,
      previousState: null,
      newState: newProject
    });

    pushNotification(
      'Project Created',
      `Project "${newProject.name}" successfully provisioned.`,
      'success',
      {
        projectId: newProject.id,
        targetRoles: ['SUPER_ADMIN'],
        targetUserId: newProject.projectManagerId
      }
    );
    return newProject;
  };

  const updateProject = (projectId, updates) => {
    let oldProj = null;
    let newProj = null;

    if (updates.status && currentUser?.role !== 'SUPER_ADMIN' && currentUser?.role !== 'PROJECT_MANAGER') {
      pushNotification(
        'Action Restricted',
        'Only Project Managers and Super Admins can update project status.',
        'warning'
      );
      return false;
    }

    if (updates.totalContractValue !== undefined) {
      const existing = projects.find(p => p.id === projectId);
      const newTcv = Number(updates.totalContractValue) || 0;
      const currentGross = Number(existing?.grossInvoiced) || 0;
      if (newTcv < currentGross) {
        pushNotification(
          'Invalid Contract Value',
          `Total contract value (Rs ${newTcv.toLocaleString()}) cannot be less than already invoiced amount (Rs ${currentGross.toLocaleString()}).`,
          'error'
        );
        return false;
      }
    }

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        oldProj = p;
        const targetPmId = updates.projectManagerId || p.projectManagerId;
        let assignedTeam = updates.assignedTeamIds ? [...updates.assignedTeamIds] : [...(p.assignedTeamIds || [])];

        if (updates.projectManagerId && updates.projectManagerId !== p.projectManagerId) {
          // Remove previous project manager from team list
          assignedTeam = assignedTeam.filter(id => id !== p.projectManagerId);
        }

        // Clean out any former/other project managers so only the current active PM is in team
        const otherPmIds = new Set(users.filter(u => u.role === 'PROJECT_MANAGER' && u.id !== targetPmId).map(u => u.id));
        assignedTeam = assignedTeam.filter(id => !otherPmIds.has(id));

        if (targetPmId && !assignedTeam.includes(targetPmId)) {
          assignedTeam.push(targetPmId);
        }

        newProj = { ...p, ...updates, assignedTeamIds: assignedTeam };
        return newProj;
      }
      return p;
    }));

    if (newProj) {
      const isPmChanged = oldProj && updates.projectManagerId && oldProj.projectManagerId !== updates.projectManagerId;
      const oldPm = isPmChanged ? users.find(u => u.id === oldProj.projectManagerId) : null;
      const newPm = isPmChanged ? users.find(u => u.id === updates.projectManagerId) : null;
      const isStatusChanged = oldProj && updates.status && oldProj.status !== updates.status;
      const isCompleted = isStatusChanged && updates.status === 'COMPLETED';

      // When the project is marked completed, remove all tasks related to it from the task list
      if (updates.status === 'COMPLETED') {
        setTasks(prevTasks => prevTasks.filter(t => t.projectId !== projectId));
      }

      const actionType = isPmChanged
        ? 'PM_REASSIGNED'
        : isCompleted
        ? 'PROJECT_COMPLETED'
        : isStatusChanged
        ? 'PROJECT_STATUS_CHANGED'
        : 'PROJECT_UPDATED';

      const itemText = isPmChanged
        ? `Reassigned Project Manager for "${newProj.name}" from ${oldPm?.name || 'Unassigned'} to ${newPm?.name || 'New Manager'}`
        : isCompleted
        ? `Marked project "${newProj.name}" as Completed and removed all associated tasks from task list`
        : isStatusChanged
        ? `Updated project status to ${updates.status}`
        : `Updated project configuration for "${newProj.name}"`;

      recordAuditLog({
        projectId,
        projectName: newProj.name,
        actionType,
        itemText,
        previousState: oldProj,
        newState: newProj
      });

      if (isPmChanged) {
        pushNotification(
          'Project Manager Reassigned',
          `"${newProj.name}" is now managed by ${newPm?.name || 'Assigned Manager'}.`,
          'success',
          {
            projectId: newProj.id,
            targetRoles: ['SUPER_ADMIN'],
            targetUserIds: [oldPm?.id, newPm?.id].filter(Boolean)
          }
        );
      } else if (isCompleted) {
        pushNotification(
          'Project Completed',
          `"${newProj.name}" was marked as Completed by ${currentUser.name}. All associated tasks have been removed from the task list.`,
          'success',
          {
            projectId: newProj.id,
            targetRoles: ['SUPER_ADMIN', 'PROJECT_MANAGER'],
            isGlobal: true
          }
        );
      } else {
        pushNotification(
          'Project Updated',
          `Project "${newProj.name}" configuration was updated.`,
          'info',
          {
            projectId: newProj.id,
            targetRoles: ['SUPER_ADMIN', 'PROJECT_MANAGER']
          }
        );
      }

      api.patch(`/projects/${projectId}`, updates).catch(err => {
        console.warn('[DB Project Update] PostgreSQL sync notice:', err.message);
      });
    }
  };

  const deleteProject = (projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setTasks(prev => prev.filter(t => t.projectId !== projectId));
    api.delete(`/projects/${projectId}`).catch(err => {
      console.warn('[DB Project Delete] PostgreSQL sync notice:', err.message);
    });
  };

  const updateContractorAgreement = (contractorUserId, projectId, agreementData) => {
    setContractors(prev => prev.map(c => {
      if (c.userId !== contractorUserId) return c;
      const existingAgreements = c.agreements || [];
      const index = existingAgreements.findIndex(a => a.projectId === projectId);
      let updatedAgreements;
      if (index >= 0) {
        updatedAgreements = existingAgreements.map((a, i) => i === index ? { ...a, ...agreementData } : a);
      } else {
        updatedAgreements = [...existingAgreements, { projectId, ...agreementData }];
      }
      return { ...c, agreements: updatedAgreements };
    }));

    const targetUser = users.find(u => u.id === contractorUserId);
    const targetProject = projects.find(p => p.id === projectId);

    recordAuditLog({
      projectId,
      projectName: targetProject ? targetProject.name : 'Contractor Agreement',
      actionType: 'AGREEMENT_UPDATED',
      itemText: `Updated % agreement for ${targetUser ? targetUser.name : 'Contractor'} (${agreementData.model} - ${agreementData.sharePercentage}%)`,
      previousState: null,
      newState: agreementData
    });

    pushNotification(
      'Contractor Agreement Updated',
      `Commission model configured for ${targetUser?.name || 'Partner'}.`,
      'success',
      {
        projectId,
        targetUserId: contractorUserId,
        targetRoles: ['SUPER_ADMIN']
      }
    );
  };

  const approvePayoutStep1 = (payoutId) => {
    let updatedItem = null;
    setPayoutLedger(prev => prev.map(p => {
      if (p.id === payoutId) {
        updatedItem = {
          ...p,
          status: 'APPROVED',
          step1ApprovedBy: currentUser.id,
          step1ApprovedAt: new Date().toISOString()
        };
        return updatedItem;
      }
      return p;
    }));

    if (updatedItem) {
      recordAuditLog({
        projectId: updatedItem.projectId,
        projectName: updatedItem.projectName,
        actionType: 'PAYOUT_VERIFIED',
        itemText: `Step 1 Verification passed for ${updatedItem.contractorName} (Rs ${(updatedItem.calculatedPayoutAmount || 0).toLocaleString()})`,
        previousState: { status: 'INVOICED' },
        newState: { status: 'APPROVED', step1ApprovedBy: currentUser.name }
      });

      pushNotification(
        'Step 1 Verification Complete',
        `Payout for ${updatedItem.contractorName} (Rs ${(updatedItem.calculatedPayoutAmount || 0).toLocaleString()}) is now APPROVED and awaiting Super Admin Step-2 sign-off.`,
        'info',
        {
          projectId: updatedItem.projectId,
          targetRoles: ['SUPER_ADMIN'],
          targetUserId: updatedItem.contractorId
        }
      );
    }
  };

  const authorizeDisbursementStep2 = (payoutId, customRef, authPasscode, payoutItemMeta = null) => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      alert('Security Policy Violation: Only Super Admin (Owner) has authorization to sign-off and record settlements.');
      return false;
    }

    const txRef = customRef || `TX-AUTH-${secureRandomString(7).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    let updatedItem = null;

    setPayoutLedger(prev => {
      const exists = prev.some(p => p.id === payoutId);
      if (exists) {
        return prev.map(p => {
          if (p.id === payoutId) {
            updatedItem = {
              ...p,
              status: 'DISBURSED',
              step2AuthorizedBy: currentUser.id,
              step2AuthorizedAt: new Date().toISOString(),
              disbursementRef: txRef
            };
            return updatedItem;
          }
          return p;
        });
      } else {
        const payeeName = payoutItemMeta?.contractorName || payoutItemMeta?.employeeName || 'Staff Member';
        const amount = payoutItemMeta?.calculatedPayoutAmount || payoutItemMeta?.monthlyAmount || 10000;
        const projName = payoutItemMeta?.projectName || 'Company Payroll';
        const channel = payoutItemMeta?.disbursementChannel || 'Direct Deposit / Bank ACH';

        const isSalariedPayout = Boolean(
          payoutItemMeta?.isSalaried ||
          payoutItemMeta?.agreementModel === 'FIXED_SALARY' ||
          payoutItemMeta?.projectName === 'Company Payroll'
        );

        updatedItem = {
          id: payoutId,
          contractorId: payoutItemMeta?.employeeId || payoutItemMeta?.contractorId || 'usr-staff',
          contractorName: payeeName,
          projectId: payoutItemMeta?.projectId || 'payroll',
          projectName: projName,
          deliverableTitle: payoutItemMeta?.deliverableTitle || payoutItemMeta?.period || 'Project Deliverable Settlement',
          calculatedPayoutAmount: amount,
          status: 'DISBURSED',
          isSalaried: isSalariedPayout,
          agreementModel: isSalariedPayout ? 'FIXED_SALARY' : 'PERCENTAGE_PROFIT_SHARE',
          payoutType: isSalariedPayout ? 'SALARIED' : 'PERCENTAGE',
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          step1ApprovedBy: currentUser.id,
          step1ApprovedAt: new Date().toISOString(),
          step2AuthorizedBy: currentUser.id,
          step2AuthorizedAt: new Date().toISOString(),
          disbursementRef: txRef,
          disbursementChannel: channel
        };
        return [updatedItem, ...prev];
      }
    });

    const payeeName = payoutItemMeta?.contractorName || payoutItemMeta?.employeeName || 'Staff Member';
    const amount = payoutItemMeta?.calculatedPayoutAmount || payoutItemMeta?.monthlyAmount || 0;
    const channel = payoutItemMeta?.disbursementChannel || 'Bank Wire';

    recordAuditLog({
      projectId: payoutItemMeta?.projectId || null,
      projectName: payoutItemMeta?.projectName || 'Company Financial Settlement',
      actionType: 'PAYOUT_DISBURSED',
      itemText: `Super Admin logged payment settlement for ${payeeName} (Rs ${Number(amount).toLocaleString()}) [Ref: ${txRef}]`,
      previousState: { status: 'APPROVED' },
      newState: { status: 'DISBURSED', disbursementRef: txRef, authorizedBy: currentUser.name }
    });

    pushNotification(
      'Payment Settlement Logged',
      `Payment (Rs ${Number(amount).toLocaleString()}) logged for ${payeeName} via ${channel}. Reference: ${txRef}`,
      'success',
      {
        targetRoles: ['SUPER_ADMIN', 'PROJECT_MANAGER'],
        targetUserId: payoutItemMeta?.employeeId || payoutItemMeta?.contractorId
      }
    );

    return true;
  };

  const addClientInvoice = (invoiceData) => {
    const project = projects.find(p => p.id === invoiceData.projectId);
    const amount = Number(invoiceData.amount) || 0;

    if (amount <= 0) {
      pushNotification('Invalid Amount', 'Invoice amount must be greater than zero.', 'error');
      return { success: false, error: 'Invoice amount must be greater than zero.' };
    }

    // Commercial Rule: Cumulative invoices must not exceed the project's total contract value
    const totalContractValue = Number(project?.totalContractValue) || 0;
    const currentTotalInvoiced = (clientInvoices || [])
      .filter(i => i.projectId === invoiceData.projectId)
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    const projectedTotal = currentTotalInvoiced + amount;

    if (totalContractValue > 0 && projectedTotal > totalContractValue) {
      const remainingAllowed = Math.max(0, totalContractValue - currentTotalInvoiced);
      pushNotification(
        'Invoice Cap Exceeded',
        `Invoice for Rs ${amount.toLocaleString()} rejected. Total invoiced would reach Rs ${projectedTotal.toLocaleString()}, exceeding the project contract value of Rs ${totalContractValue.toLocaleString()}. Remaining allowance: Rs ${remainingAllowed.toLocaleString()}.`,
        'error'
      );
      return {
        success: false,
        error: `Total invoice amount (Rs ${projectedTotal.toLocaleString()}) would exceed the project's total value (Rs ${totalContractValue.toLocaleString()}). Maximum remaining allowed: Rs ${remainingAllowed.toLocaleString()}.`
      };
    }

    const newInvoice = {
      id: 'inv-' + Date.now(),
      _createdTimestamp: Date.now(),
      createdAt: new Date().toISOString(),
      projectId: invoiceData.projectId,
      projectName: invoiceData.projectName || project?.name || 'Client Project',
      clientName: invoiceData.clientName || project?.clientName || 'Client Organization',
      invoiceNumber: invoiceData.invoiceNumber || `INV-${new Date().getFullYear()}-${secureRandomInt(100, 999)}`,
      amount,
      issueDate: invoiceData.issueDate || new Date().toISOString().split('T')[0],
      dueDate: invoiceData.dueDate || '2026-11-30',
      status: invoiceData.status || 'PENDING',
      notes: invoiceData.notes || 'Invoiced client for project deliverables.'
    };

    setClientInvoices(prev => [newInvoice, ...prev]);

    setProjects(prev => prev.map(p => {
      if (p.id === newInvoice.projectId) {
        const updatedGross = (p.grossInvoiced || 0) + amount;
        const updatedAR = (p.accountsReceivable || 0) + amount;
        return { ...p, grossInvoiced: updatedGross, accountsReceivable: updatedAR };
      }
      return p;
    }));

    recordAuditLog({
      projectId: newInvoice.projectId,
      projectName: newInvoice.projectName,
      actionType: 'INVOICE_GENERATED',
      itemText: `Logged Client Invoice ${newInvoice.invoiceNumber} for Rs ${amount.toLocaleString()} on ${newInvoice.projectName}`,
      previousState: null,
      newState: newInvoice
    });

    pushNotification(
      'Client Invoice Recorded',
      `Invoice ${newInvoice.invoiceNumber} (Rs ${amount.toLocaleString()}) recorded for ${newInvoice.projectName}.`,
      'success'
    );

    return { success: true, invoice: newInvoice };
  };

  const addClientPayment = (paymentData) => {
    const project = projects.find(p => p.id === paymentData.projectId);
    const amount = Number(paymentData.amount) || 0;
    const newPayment = {
      id: 'payin-' + Date.now(),
      _createdTimestamp: Date.now(),
      createdAt: new Date().toISOString(),
      projectId: paymentData.projectId,
      projectName: paymentData.projectName || project?.name || 'Client Project',
      clientName: paymentData.clientName || project?.clientName || 'Client Organization',
      amount,
      paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: paymentData.paymentMethod || 'Bank Wire Transfer',
      referenceNumber: paymentData.referenceNumber || `TX-IN-${secureRandomString(6).toUpperCase()}`,
      notes: paymentData.notes || 'Received client payment towards project delivery.'
    };

    setClientPayments(prev => [newPayment, ...prev]);

    setProjects(prev => prev.map(p => {
      if (p.id === newPayment.projectId) {
        const updatedAR = Math.max(0, (p.accountsReceivable || 0) - amount);
        return { ...p, accountsReceivable: updatedAR };
      }
      return p;
    }));

    recordAuditLog({
      projectId: newPayment.projectId,
      projectName: newPayment.projectName,
      actionType: 'PAYMENT_RECEIVED',
      itemText: `Received Client Payment (Pay-In) of Rs ${amount.toLocaleString()} for ${newPayment.projectName} [Ref: ${newPayment.referenceNumber}]`,
      previousState: null,
      newState: newPayment
    });

    pushNotification(
      'Client Payment Received (Pay-In)',
      `Pay-In of Rs ${amount.toLocaleString()} received from ${newPayment.clientName} for ${newPayment.projectName}.`,
      'success'
    );
  };

  const addSourcePayout = (payoutData) => {
    const project = projects.find(p => p.id === payoutData.projectId);
    const amount = Number(payoutData.amount) || 0;
    const pDate = payoutData.payoutDate || payoutData.paymentDate || payoutData.date || new Date().toISOString().split('T')[0];
    const newPayout = {
      id: 'src-' + Date.now(),
      _createdTimestamp: Date.now(),
      createdAt: new Date().toISOString(),
      projectId: payoutData.projectId,
      projectName: payoutData.projectName || project?.name || 'Project',
      sourceName: payoutData.sourceName || 'Source / Referral Partner',
      amount,
      payoutDate: pDate,
      date: pDate,
      status: payoutData.status || 'DISBURSED',
      paymentMethod: payoutData.paymentMethod || 'Direct Wire Transfer',
      referenceNumber: payoutData.referenceNumber || `SRC-TX-${Date.now().toString().slice(-4)}`,
      notes: payoutData.notes || 'Origination / referral commission for project.'
    };

    setSourcePayouts(prev => [newPayout, ...prev]);

    recordAuditLog({
      projectId: newPayout.projectId,
      projectName: newPayout.projectName,
      actionType: 'SOURCE_PAYOUT_LOGGED',
      itemText: `Disbursed Rs ${amount.toLocaleString()} Source Referral Fee to ${newPayout.sourceName} on ${newPayout.projectName}`,
      previousState: null,
      newState: newPayout
    });

    pushNotification(
      'Source Payout Logged',
      `Source fee of Rs ${amount.toLocaleString()} disbursed to ${newPayout.sourceName}.`,
      'success'
    );
  };

  const addPercentagePayout = (payoutData) => {
    const isSalaried = payoutData.isSalaried || payoutData.payoutType === 'SALARIED' || payoutData.agreementModel === 'FIXED_SALARY';
    const project = projects.find(p => p.id === payoutData.projectId);
    const contractor = users.find(u => u.id === payoutData.contractorId);
    const amount = Number(payoutData.amount) || 0;
    const projectTcv = payoutData.projectTotalValue || project?.totalContractValue || (isSalaried ? 0 : 100000);
    const sharePercentage = isSalaried ? 0 : (payoutData.agreementPercentage || contractor?.percentage || 15.0);
    const pDate = payoutData.payoutDate || payoutData.paymentDate || payoutData.date || new Date().toISOString().split('T')[0];

    const newRecord = {
      id: (isSalaried ? 'salary-' : 'payout-') + Date.now(),
      _createdTimestamp: Date.now(),
      contractorId: payoutData.contractorId || contractor?.id || (isSalaried ? 'usr-staff' : 'usr-partner-1'),
      contractorName: payoutData.contractorName || contractor?.name || (isSalaried ? 'Salaried Employee' : 'Percentage-Based Employee'),
      employeeId: payoutData.contractorId || contractor?.id,
      employeeName: payoutData.contractorName || contractor?.name,
      projectId: payoutData.projectId || (isSalaried ? 'INTERNAL' : undefined),
      projectName: payoutData.projectName || (isSalaried ? 'Company Payroll' : project?.name || 'Project'),
      deliverableTitle: payoutData.deliverableTitle || (isSalaried ? 'Monthly Payroll Settlement' : 'Project Share Payout'),
      agreementModel: isSalaried ? 'FIXED_SALARY' : (payoutData.agreementModel || 'PROJECT_DIRECT_SHARE'),
      agreementPercentage: sharePercentage,
      projectTotalValue: projectTcv,
      calculatedPayoutAmount: amount,
      amount,
      payoutDate: pDate,
      date: pDate,
      month: payoutData.month || pDate.slice(0, 7),
      totalProjectShare: isSalaried ? amount : (payoutData.totalProjectShare || Math.round(projectTcv * (sharePercentage / 100))),
      status: payoutData.status || 'DISBURSED',
      step1ApprovedBy: currentUser.id,
      step1ApprovedAt: `${pDate}T12:00:00.000Z`,
      step2AuthorizedBy: currentUser.id,
      step2AuthorizedAt: `${pDate}T12:00:00.000Z`,
      createdAt: new Date().toISOString(),
      disbursementRef: payoutData.disbursementRef || `${isSalaried ? 'ACH-PAYROLL' : 'TX-SHARE'}-${Date.now().toString().slice(-4)}`,
      disbursementChannel: payoutData.disbursementChannel || (isSalaried ? 'Direct Deposit / Bank ACH' : 'Wise Multi-Currency Wire'),
      notes: payoutData.notes || (isSalaried ? 'Fixed monthly salary payroll settlement.' : 'Project percentage share settlement.'),
      isSalaried: !!isSalaried,
      payoutType: isSalaried ? 'SALARIED' : 'PERCENTAGE'
    };

    setPayoutLedger(prev => [newRecord, ...prev]);

    recordAuditLog({
      projectId: newRecord.projectId,
      projectName: newRecord.projectName,
      actionType: 'PAYOUT_DISBURSED',
      itemText: isSalaried
        ? `Disbursed Monthly Salary Payout of Rs ${amount.toLocaleString()} to ${newRecord.contractorName}`
        : `Disbursed Project Share Payout of Rs ${amount.toLocaleString()} to ${newRecord.contractorName} for ${newRecord.projectName}`,
      previousState: null,
      newState: newRecord
    });

    pushNotification(
      isSalaried ? 'Monthly Salary Logged' : 'Percentage Share Payout Logged',
      `Disbursed Rs ${amount.toLocaleString()} to ${newRecord.contractorName} (${isSalaried ? 'Fixed Salary' : newRecord.projectName}).`,
      'success'
    );
  };

  const addDirectExpense = (expenseData) => {
    const amount = Number(expenseData.amount) || 0;
    const expDate = expenseData.expenseDate || expenseData.date || (expenseData.month ? `${expenseData.month}-15` : new Date().toISOString().split('T')[0]);
    const expMonth = expenseData.month || expDate.slice(0, 7);

    const newExpense = {
      id: 'exp-' + Date.now(),
      _createdTimestamp: Date.now(),
      createdAt: new Date().toISOString(),
      month: expMonth,
      category: expenseData.category || 'Cloud Infrastructure & Security',
      vendor: expenseData.vendor || 'Infrastructure Vendor',
      amount,
      expenseDate: expDate,
      date: expDate,
      projectName: expenseData.projectName || 'General Operations',
      projectId: expenseData.projectId || 'GENERAL',
      receiptRef: expenseData.receiptRef || `REC-${secureRandomInt(1000, 9999)}`,
      status: expenseData.status || 'PAID',
      notes: expenseData.notes || 'Monthly operational infrastructure expense.'
    };

    setDirectExpensesList(prev => [newExpense, ...prev]);

    // Persist to PostgreSQL backend
    api.post('/financials/expenses', {
      projectId: newExpense.projectId,
      category: newExpense.category,
      amount: newExpense.amount,
      description: newExpense.notes || newExpense.vendor,
      vendor: newExpense.vendor,
      expenseDate: newExpense.expenseDate,
      receiptRef: newExpense.receiptRef
    }).then(res => {
      if (res?.data?.id) {
        setDirectExpensesList(prev => prev.map(e => e.id === newExpense.id ? { ...e, id: res.data.id } : e));
      }
    }).catch(err => {
      console.warn('[PostgreSQL DirectExpense] Stored locally:', err.message);
    });

    recordAuditLog({
      actionType: 'DIRECT_EXPENSE_LOGGED',
      itemText: `Recorded Monthly Expense of Rs ${amount.toLocaleString()} (${newExpense.category} - ${newExpense.vendor}) for ${newExpense.month}`,
      previousState: null,
      newState: newExpense
    });

    pushNotification(
      'Monthly Expense Recorded',
      `Expense of Rs ${amount.toLocaleString()} recorded for ${newExpense.month} (${newExpense.category}).`,
      'success'
    );
  };

  const deleteTransaction = (type, id) => {
    if (type === 'INVOICE') {
      const invToDelete = clientInvoices.find(i => i.id === id);
      if (invToDelete) {
        setClientInvoices(prev => prev.filter(i => i.id !== id));
        setProjects(prev => prev.map(p => {
          if (p.id === invToDelete.projectId) {
            const arDecrease = invToDelete.status === 'PAID' ? 0 : (invToDelete.amount || 0);
            return {
              ...p,
              grossInvoiced: Math.max(0, (p.grossInvoiced || 0) - (invToDelete.amount || 0)),
              accountsReceivable: Math.max(0, (p.accountsReceivable || 0) - arDecrease)
            };
          }
          return p;
        }));
      }
    } else if (type === 'PAYMENT' || type === 'PAYMENT_IN') {
      const payToDelete = clientPayments.find(p => p.id === id);
      if (payToDelete) {
        setClientPayments(prev => prev.filter(p => p.id !== id));
        setProjects(prev => prev.map(p => {
          if (p.id === payToDelete.projectId) {
            return {
              ...p,
              accountsReceivable: (p.accountsReceivable || 0) + (payToDelete.amount || 0)
            };
          }
          return p;
        }));
      }
    } else if (type === 'SOURCE' || type === 'SOURCE_PAYOUT') {
      setSourcePayouts(prev => prev.filter(s => s.id !== id));
    } else if (type === 'EXPENSE' || type === 'DIRECT_EXPENSE') {
      const expToDelete = directExpensesList.find(e => e.id === id);
      if (expToDelete) {
        setDirectExpensesList(prev => prev.filter(e => e.id !== id));
        api.delete(`/financials/expenses/${id}`).catch(() => {});
      }
    } else if (type === 'PERCENTAGE' || type === 'PERCENTAGE_PAYOUT' || type === 'EMPLOYEE' || type === 'SALARIED' || type === 'SALARIED_PAYOUT') {
      setPayoutLedger(prev => prev.filter(p => p.id !== id));
    }
  };

  const createUser = (userData) => {
    const newUser = {
      id: 'usr-' + Date.now(),
      avatar: `https://images.unsplash.com/photo-${1530000000000 + secureRandomInt(0, 900000)}?w=150&auto=format&fit=crop&q=80`,
      isMfaEnabled: false,
      workMode: userData.workMode || 'ONSITE',
      compensationType: userData.compensationType || 'SALARIED',
      ...userData
    };

    setUsers(prev => [...prev, newUser]);

    // Persist to PostgreSQL in background
    api.post('/users', newUser)
      .then(res => {
        if (res?.data) {
          setUsers(prev => prev.map(u => u.id === newUser.id ? { ...u, ...res.data } : u));
        }
      })
      .catch(err => {
        console.warn('[DB User Create] PostgreSQL sync notice:', err.message);
      });

    const compSummary = newUser.compensationType === 'PERCENTAGE'
      ? `${newUser.percentage || 15}% Share`
      : newUser.salary ? `Rs ${Number(newUser.salary).toLocaleString()}/yr` : 'Salaried';

    recordAuditLog({
      actionType: 'USER_PROVISIONED',
      itemText: `Provisioned new employee "${newUser.name}" (${newUser.workMode === 'REMOTE' ? 'Remote' : 'On-Site'}, ${compSummary})`,
      previousState: null,
      newState: newUser
    });

    pushNotification(
      'Employee Provisioned',
      `New employee "${newUser.name}" (${newUser.workMode === 'REMOTE' ? 'Remote' : 'On-Site'}, ${compSummary}) added to the platform.`,
      'success',
      {
        targetRoles: ['SUPER_ADMIN'],
        targetUserId: newUser.id
      }
    );
    return newUser;
  };

  const updateUser = (userId, updates) => {
    // If password is being updated, verify Super Admin
    if (updates.password && !isSuperAdmin()) {
      pushNotification(
        'Action Restricted',
        'Only Super Admins can change employee passwords.',
        'warning'
      );
      delete updates.password;
    }

    setUsers(prev => {
      const nextUsers = prev.map(u => u.id === userId ? { ...u, ...updates } : u);
      try {
        localStorage.setItem('lincoz_users', JSON.stringify(nextUsers));
      } catch (e) {}
      return nextUsers;
    });

    api.patch(`/users/${userId}`, updates)
      .then(res => {
        if (res?.data) {
          setUsers(prev => {
            const next = prev.map(u => u.id === userId ? { ...u, ...res.data } : u);
            try {
              localStorage.setItem('lincoz_users', JSON.stringify(next));
            } catch (e) {}
            return next;
          });
        }
      })
      .catch(err => {
        console.warn('[DB User Sync] Live database update fallback:', err.message);
      });

    pushNotification('User Updated', 'User profile details were updated.', 'info', {
      targetRoles: ['SUPER_ADMIN'],
      targetUserId: userId
    });
  };

  const updateUserPassword = (userId, newPassword) => {
    if (!isSuperAdmin()) {
      pushNotification(
        'Action Restricted',
        'Only Super Admins can change employee passwords.',
        'warning'
      );
      return false;
    }

    const cleanPass = (newPassword || '').trim();
    if (cleanPass.length < 6) {
      pushNotification(
        'Invalid Password',
        'Password must be at least 6 characters long.',
        'error'
      );
      return false;
    }

    let targetUser = null;
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        targetUser = u;
        return {
          ...u,
          password: cleanPass,
          passwordUpdatedAt: new Date().toISOString()
        };
      }
      return u;
    }));
    api.patch(`/users/${userId}/password`, { password: cleanPass }).catch(err => {
      console.warn('[DB User Sync] Live database password update fallback:', err.message);
    });

    if (targetUser) {
      recordAuditLog({
        actionType: 'PASSWORD_RESET',
        itemText: `Super Admin reset password for "${targetUser.name}" (${targetUser.email})`,
        previousState: null,
        newState: { userId, passwordUpdatedAt: new Date().toISOString() }
      });

      pushNotification(
        'Password Updated Successfully',
        `Password for "${targetUser.name}" was successfully changed by Super Admin.`,
        'success',
        {
          targetRoles: ['SUPER_ADMIN'],
          targetUserId: userId
        }
      );
      return true;
    }
    return false;
  };

  const updateUserMfaKey = () => {
    return true;
  };

  const deleteUser = (userId) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    if (target.role === 'SUPER_ADMIN' && target.id === currentUser?.id) {
      pushNotification('Action Restricted', 'Cannot delete active Super Admin account.', 'warning');
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    api.delete(`/users/${userId}`).catch(err => {
      console.warn('[DB User Delete] PostgreSQL sync notice:', err.message);
    });
  };

  const createClient = (clientData) => {
    const isFreelancer = clientData.category === 'FREELANCER';
    const newClient = {
      id: (isFreelancer ? 'fl-' : 'cli-') + Date.now(),
      category: clientData.category || 'CLIENT',
      name: clientData.name?.trim() || '',
      company: clientData.company?.trim() || clientData.name?.trim() || '',
      email: clientData.email?.trim() || '',
      contactNumber: clientData.contactNumber?.trim() || '',
      country: clientData.country?.trim() || 'United States',
      percentage: isFreelancer ? (Number(clientData.percentage) || 0) : null,
      associatedProjects: clientData.associatedProjects || [],
      skills: clientData.skills || '',
      notes: clientData.notes || '',
      status: clientData.status || 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    setClients(prev => [newClient, ...prev]);

    // Persist to PostgreSQL in background
    api.post('/clients', newClient)
      .then(res => {
        if (res?.data) {
          setClients(prev => prev.map(c => c.id === newClient.id ? { ...c, ...res.data } : c));
        }
      })
      .catch(err => {
        console.warn('[DB Client Create] PostgreSQL sync notice:', err.message);
      });

    recordAuditLog({
      actionType: isFreelancer ? 'SOURCE_CREATED' : 'CLIENT_CREATED',
      itemText: isFreelancer
        ? `Added Source "${newClient.name}" (${newClient.percentage}% Project Commission, ${newClient.country})`
        : `Added Client "${newClient.name}" (${newClient.country}, ${newClient.email})`,
      previousState: null,
      newState: newClient
    });

    pushNotification(
      isFreelancer ? 'New Source Added' : 'New Client Added',
      `"${newClient.name}" (${isFreelancer ? `${newClient.percentage}% Commission` : newClient.country}) was added to the platform.`,
      'success',
      { targetRoles: ['SUPER_ADMIN'] }
    );

    return newClient;
  };

  const updateClient = (clientId, updates) => {
    let oldClient = null;
    let updatedClient = null;

    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        oldClient = c;
        const isFreelancer = updates.category ? updates.category === 'FREELANCER' : c.category === 'FREELANCER';
        updatedClient = {
          ...c,
          ...updates,
          percentage: isFreelancer
            ? (updates.percentage !== undefined ? Number(updates.percentage) : c.percentage)
            : null
        };
        return updatedClient;
      }
      return c;
    }));

    if (updatedClient) {
      api.patch(`/clients/${clientId}`, updates).catch(err => {
        console.warn('[DB Client Update] PostgreSQL sync notice:', err.message);
      });

      const isFreelancer = updatedClient.category === 'FREELANCER';
      recordAuditLog({
        actionType: isFreelancer ? 'SOURCE_UPDATED' : 'CLIENT_UPDATED',
        itemText: `Updated profile details for ${isFreelancer ? 'Source' : 'Client'} "${updatedClient.name}"`,
        previousState: oldClient,
        newState: updatedClient
      });

      pushNotification(
        isFreelancer ? 'Source Profile Updated' : 'Client Profile Updated',
        `Details for "${updatedClient.name}" were updated.`,
        'info',
        { targetRoles: ['SUPER_ADMIN'] }
      );
    }
  };

  const deleteClient = (clientId) => {
    const target = clients.find(c => c.id === clientId);
    if (!target) return;

    setClients(prev => prev.filter(c => c.id !== clientId));
    api.delete(`/clients/${clientId}`).catch(err => {
      console.warn('[DB Client Delete] PostgreSQL sync notice:', err.message);
    });

    const isFreelancer = target.category === 'FREELANCER';
    recordAuditLog({
      actionType: isFreelancer ? 'SOURCE_DELETED' : 'CLIENT_DELETED',
      itemText: `Deleted ${isFreelancer ? 'Source' : 'Client'} "${target.name}" from directory`,
      previousState: target,
      newState: null
    });

    pushNotification(
      isFreelancer ? 'Source Deleted' : 'Client Deleted',
      `"${target.name}" was removed from the directory.`,
      'info',
      { targetRoles: ['SUPER_ADMIN'] }
    );
  };

  const getScopedClients = () => {
    if (isSuperAdmin()) return clients || [];
    return [];
  };

  const addExpenseCategory = (catData) => {
    if (!catData || !catData.name) return null;
    const newCat = {
      id: 'exp-cat-' + Date.now(),
      name: catData.name.trim(),
      description: catData.description ? catData.description.trim() : '',
      createdAt: new Date().toISOString()
    };
    setExpenseCategories(prev => [newCat, ...prev]);

    // Persist to PostgreSQL backend
    api.post('/financials/expense-categories', {
      name: newCat.name,
      description: newCat.description
    }).then(res => {
      if (res?.data?.id) {
        setExpenseCategories(prev => prev.map(c => c.id === newCat.id ? { ...c, id: res.data.id } : c));
      }
    }).catch(err => {
      console.warn('[PostgreSQL ExpenseCategory] Stored locally:', err.message);
    });

    recordAuditLog({
      actionType: 'CREATED',
      itemText: `Created Expense Category "${newCat.name}"`,
      previousState: null,
      newState: newCat
    });
    pushNotification(
      'Expense Created',
      `Expense "${newCat.name}" added to system categories.`,
      'success'
    );
    return newCat;
  };

  const updateExpenseCategory = (id, updates) => {
    let updated = null;
    let old = null;
    setExpenseCategories(prev => prev.map(c => {
      if (c.id === id) {
        old = c;
        updated = { ...c, ...updates };
        return updated;
      }
      return c;
    }));
    if (updated) {
      api.put(`/financials/expense-categories/${id}`, updates).catch(err => {
        console.warn('[PostgreSQL ExpenseCategory] Update error:', err.message);
      });

      recordAuditLog({
        actionType: 'MODIFIED',
        itemText: `Updated Expense Category "${updated.name}"`,
        previousState: old,
        newState: updated
      });
      pushNotification(
        'Expense Updated',
        `Expense "${updated.name}" was updated.`,
        'info'
      );
    }
  };

  const deleteExpenseCategory = (id) => {
    const target = expenseCategories.find(c => c.id === id || c.name === id);
    setExpenseCategories(prev => prev.filter(c => c.id !== id && c.name !== id && c.id !== target?.id));
    if (!target) return;

    api.delete(`/financials/expense-categories/${id}`).catch(err => {
      console.warn('[PostgreSQL ExpenseCategory] Delete error:', err.message);
    });

    recordAuditLog({
      actionType: 'DELETED',
      itemText: `Deleted Expense Category "${target.name}"`,
      previousState: target,
      newState: null
    });
    pushNotification(
      'Expense Deleted',
      `Expense "${target.name}" removed from categories.`,
      'info'
    );
  };

  const resetToDefaults = () => {
    try {
      localStorage.clear();
    } catch (e) {}
    setUsers(INITIAL_USERS);
    setCurrentUserId('usr-admin');
    setContractors(INITIAL_CONTRACTORS);
    setProjects(INITIAL_PROJECTS);
    setTasks(INITIAL_TASKS);
    setPayoutLedger(INITIAL_PAYOUT_LEDGER);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setClients(INITIAL_CLIENTS_DIRECTORY);
    setClientInvoices(INITIAL_CLIENT_INVOICES);
    setClientPayments(INITIAL_CLIENT_PAYMENTS);
    setSourcePayouts(INITIAL_SOURCE_PAYOUTS);
    setDirectExpensesList(INITIAL_DIRECT_EXPENSES);
    setExpenseCategories(INITIAL_EXPENSE_CATEGORIES);
    pushNotification('System Reset', 'All data restored to default initial state.', 'info', { isGlobal: true });
  };

  const isSuperAdmin = () => currentUser?.role === 'SUPER_ADMIN';
  const isPM = () => currentUser?.role === 'PROJECT_MANAGER';
  const isOnsiteMember = () => currentUser?.role === 'ONSITE_MEMBER';
  const isPartner = () => currentUser?.role === 'PARTNER';

  const getScopedProjects = () => {
    if (!currentUser) return [];
    if (isSuperAdmin()) return projects || [];
    if (isPM()) {
      return (projects || [])
        .filter(p => !p.projectManagerId || p.projectManagerId === currentUser?.id || (p.assignedTeamIds && p.assignedTeamIds.includes(currentUser?.id)))
        .map(p => ({
          ...p,
          totalContractValue: 'CONFIDENTIAL',
          grossInvoiced: 'CONFIDENTIAL',
          accountsReceivable: 'CONFIDENTIAL',
          directExpenses: 'CONFIDENTIAL',
        }));
    }
    if (isOnsiteMember()) {
      return (projects || [])
        .filter(p => p.assignedTeamIds && p.assignedTeamIds.includes(currentUser?.id))
        .map(p => {
          const { requirementDoc, ...rest } = p;
          return rest;
        });
    }
    if (isPartner()) {
      const partnerTaskProjectIds = (tasks || []).filter(t => t.assigneeId === currentUser.id).map(t => t.projectId);
      const contractorRecord = (contractors || []).find(c => c.userId === currentUser.id);
      const agreementProjectIds = contractorRecord ? (contractorRecord.agreements || []).map(a => a.projectId) : [];
      const allowedIds = new Set([...partnerTaskProjectIds, ...agreementProjectIds]);
      
      return (projects || []).filter(p => allowedIds.has(p.id)).map(p => {
        const { requirementDoc, ...rest } = p;
        return {
          ...rest,
          totalContractValue: 'CONFIDENTIAL',
          grossInvoiced: 'CONFIDENTIAL',
          accountsReceivable: 'CONFIDENTIAL',
          directExpenses: 'CONFIDENTIAL',
        };
      });
    }
    return [];
  };

  const getScopedTasks = (projectId = null) => {
    let filtered = tasks || [];

    // Exclude all tasks belonging to completed projects from the active task list
    const completedProjectIds = new Set(
      (projects || []).filter(p => p.status === 'COMPLETED').map(p => p.id)
    );
    filtered = filtered.filter(t => !completedProjectIds.has(t.projectId));

    if (projectId) {
      filtered = filtered.filter(t => t.projectId === projectId);
    }
    if (isSuperAdmin() || isPM()) return filtered;
    // Employees should only see tasks assigned to them, and backlogs are strictly hidden
    return filtered.filter(t => t.assigneeId === currentUser.id && t.status !== 'BACKLOG');
  };

  const getScopedFinancials = (monthFilter = selectedMonth) => {
    if (isSuperAdmin()) {
      const isAllMonths = !monthFilter || monthFilter === 'ALL';

      const matchesMonth = (dateStr, monthStr) => {
        if (isAllMonths) return true;
        if (monthStr && monthStr === monthFilter) return true;
        if (!dateStr) return false;
        return dateStr.startsWith(monthFilter);
      };

      const filteredInvoices = (clientInvoices || []).filter(i => matchesMonth(i.issueDate || i.date || i.invoiceDate));
      const filteredPayments = (clientPayments || []).filter(p => matchesMonth(p.paymentDate || p.date));
      const filteredSourcePayouts = (sourcePayouts || []).filter(s => matchesMonth(s.payoutDate || s.date));
      const filteredDirectExpenses = (directExpensesList || []).filter(e => matchesMonth(e.expenseDate || e.date, e.month));
      const filteredPayoutLedger = (payoutLedger || []).filter(p => {
        const dateStr = p.step2AuthorizedAt ? p.step2AuthorizedAt.split('T')[0] : (p.date || p.createdAt || '2026-10-01');
        return matchesMonth(dateStr);
      });

      const totalContractValue = (projects || []).reduce((sum, p) => sum + (p.totalContractValue || 0), 0);
      const grossInvoiced = filteredInvoices.reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalCollected = filteredPayments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
      const accountsReceivable = filteredInvoices.filter(i => i.status !== 'PAID').reduce((sum, i) => sum + (i.amount || 0), 0);
      const directExpenses = filteredDirectExpenses.reduce((sum, p) => sum + (p.amount || 0), 0);

      const totalSourcePayouts = filteredSourcePayouts.reduce((sum, src) => sum + (src.amount || 0), 0);
      const totalPercentagePayouts = filteredPayoutLedger.reduce((sum, p) => sum + (p.calculatedPayoutAmount || 0), 0);

      const accruedLiabilities = filteredPayoutLedger
        .filter(p => p.status === 'ACCRUING' || p.status === 'INVOICED' || p.status === 'APPROVED')
        .reduce((sum, p) => sum + (p.calculatedPayoutAmount || 0), 0);

      const totalDisbursed = filteredPayoutLedger
        .filter(p => p.status === 'DISBURSED')
        .reduce((sum, p) => sum + (p.calculatedPayoutAmount || 0), 0) +
        filteredSourcePayouts.filter(s => s.status === 'DISBURSED').reduce((sum, s) => sum + (s.amount || 0), 0);

      // Actual employee payouts added/disbursed by admin for this month
      const actualSalariedPayouts = filteredPayoutLedger
        .filter(p => (p.isSalaried || p.payoutType === 'SALARIED' || p.agreementModel === 'FIXED_SALARY') && p.status === 'DISBURSED')
        .reduce((sum, p) => sum + (Number(p.calculatedPayoutAmount || p.amount) || 0), 0);

      const actualPercentagePayouts = filteredPayoutLedger
        .filter(p => !(p.isSalaried || p.payoutType === 'SALARIED' || p.agreementModel === 'FIXED_SALARY') && p.status === 'DISBURSED')
        .reduce((sum, p) => sum + (Number(p.calculatedPayoutAmount || p.amount) || 0), 0);

      // Rule: Monthly payroll is strictly NOT added to finance until added by admin through employee payout
      const totalPayroll = actualSalariedPayouts + actualPercentagePayouts;

      const totalOutflows = directExpenses + totalSourcePayouts + totalPayroll;
      const netMonthlyCashflow = totalCollected - totalOutflows;
      const totalMonthlyProfit = grossInvoiced - directExpenses - totalSourcePayouts - totalPayroll;
      const totalProfitMarginPercent = grossInvoiced > 0 ? Math.round((totalMonthlyProfit / grossInvoiced) * 100) : 0;
      const netProjectGrossProfit = grossInvoiced - directExpenses - totalSourcePayouts - totalPayroll;
      const netOperatingMargin = grossInvoiced > 0 ? Math.round((netProjectGrossProfit / grossInvoiced) * 100) : 0;

      // Committed contractual salary baseline (for HR reference only, NOT financial outflow until added by admin)
      const salariedStaff = (users || []).filter(u => u.compensationType !== 'PERCENTAGE' && u.role !== 'PARTNER');
      const totalCommittedSalaries = salariedStaff.reduce((sum, u) => {
        const annualSalary = (u.salary !== undefined && u.salary !== null && !isNaN(Number(u.salary))) ? Number(u.salary) : 0;
        return sum + Math.round(annualSalary / 12);
      }, 0);

      return {
        roleAllowed: true,
        canAuthorizeDisbursement: true,
        canEditCalculations: true,
        selectedMonth: monthFilter,
        totalContractValue,
        // Overall Company Financials Core Indicators
        totalIncome: totalCollected,
        monthlyInvoiced: grossInvoiced,
        monthlyExpense: directExpenses,
        payroll: totalPayroll,
        fixedPayroll: actualSalariedPayouts,
        variablePayroll: actualPercentagePayouts,
        totalPayroll,
        netCashFlow: netMonthlyCashflow,
        totalMonthlyProfit,
        totalProfitMarginPercent,
        // Legacy / Component keys
        grossInvoiced,
        totalCollected,
        accountsReceivable,
        directExpenses,
        totalSourcePayouts,
        totalPercentagePayouts: actualPercentagePayouts,
        totalMonthlySalaries: actualSalariedPayouts,
        totalCommittedSalaries,
        totalOutflows,
        accruedLiabilities,
        totalDisbursed,
        netProjectGrossProfit,
        netOperatingMargin,
        netMonthlyCashflow,
        invoices: filteredInvoices,
        payments: filteredPayments,
        sourcePayouts: filteredSourcePayouts,
        directExpensesList: filteredDirectExpenses,
        ledger: filteredPayoutLedger,
        allInvoices: clientInvoices || [],
        allPayments: clientPayments || [],
        allSourcePayouts: sourcePayouts || [],
        allDirectExpenses: directExpensesList || [],
        allLedger: payoutLedger || []
      };
    }

    if (isPartner()) {
      const partnerLedger = (payoutLedger || []).filter(p => p.contractorId === currentUser.id);
      const isAllMonths = !monthFilter || monthFilter === 'ALL';
      const filteredPartnerLedger = isAllMonths
        ? partnerLedger
        : partnerLedger.filter(p => {
            const dateStr = p.step2AuthorizedAt ? p.step2AuthorizedAt.split('T')[0] : (p.date || p.createdAt || '2026-10-01');
            return dateStr.startsWith(monthFilter);
          });

      const totalEarned = filteredPartnerLedger.reduce((sum, p) => sum + (p.calculatedPayoutAmount || 0), 0);
      const totalDisbursed = filteredPartnerLedger.filter(p => p.status === 'DISBURSED').reduce((sum, p) => sum + (p.calculatedPayoutAmount || 0), 0);
      const pendingDisbursement = filteredPartnerLedger.filter(p => p.status === 'APPROVED').reduce((sum, p) => sum + (p.calculatedPayoutAmount || 0), 0);
      const unbilledAccruing = filteredPartnerLedger.filter(p => p.status === 'ACCRUING' || p.status === 'INVOICED').reduce((sum, p) => sum + (p.calculatedPayoutAmount || 0), 0);

      return {
        roleAllowed: true,
        isPartnerIsolated: true,
        canAuthorizeDisbursement: false,
        canEditCalculations: false,
        selectedMonth: monthFilter,
        totalEarned,
        totalDisbursed,
        pendingDisbursement,
        unbilledAccruing,
        ledger: filteredPartnerLedger,
        allLedger: partnerLedger
      };
    }

    return {
      roleAllowed: false,
      message: 'Financials, billing ledgers, and contractor rates are restricted to Super Admin governance.'
    };
  };

  const getScopedAuditLogs = () => {
    if (isSuperAdmin()) return auditLogs || [];
    if (isPM()) {
      const pmProjectIds = new Set((projects || []).filter(p => p.projectManagerId === currentUser.id).map(p => p.id));
      const financialActionTypes = new Set(['AGREEMENT_UPDATED', 'PAYOUT_VERIFIED', 'PAYOUT_DISBURSED']);
      return (auditLogs || []).filter(log => (!log.projectId || pmProjectIds.has(log.projectId)) && !financialActionTypes.has(log.actionType));
    }
    return (auditLogs || []).filter(log => log.actorId === currentUser.id);
  };

  /**
   * Smart Scoped Notification Filter:
   * Delivers strictly the notifications relevant to the authenticated user profile.
   */
  const getScopedNotifications = () => {
    if (!currentUser) return [];

    return (notifications || []).filter((notif) => {
      // 1. Explicit direct recipient(s)
      if (notif.targetUserId && notif.targetUserId === currentUser.id) return true;
      if (Array.isArray(notif.targetUserIds) && notif.targetUserIds.includes(currentUser.id)) return true;

      // 2. Direct action triggered by the current user
      if (notif.actorId && notif.actorId === currentUser.id) return true;

      // 3. Super Admin governance (sees all governance, disbursements, system, and scoped project logs)
      if (currentUser.role === 'SUPER_ADMIN') {
        if (!notif.targetRoles || notif.targetRoles.includes('SUPER_ADMIN')) return true;
        if (notif.isGlobal) return true;
      }

      // 4. Role-based matching with project isolation
      if (Array.isArray(notif.targetRoles) && notif.targetRoles.includes(currentUser.role)) {
        if (notif.projectId) {
          if (currentUser.role === 'PROJECT_MANAGER') {
            const proj = (projects || []).find(p => p.id === notif.projectId);
            return proj && (proj.projectManagerId === currentUser.id || (proj.assignedTeamIds && proj.assignedTeamIds.includes(currentUser.id)));
          }
          if (currentUser.role === 'ONSITE_MEMBER' || currentUser.role === 'PARTNER') {
            const proj = (projects || []).find(p => p.id === notif.projectId);
            const hasTask = (tasks || []).some(t => t.projectId === notif.projectId && t.assigneeId === currentUser.id);
            const isAssigned = proj?.assignedTeamIds?.includes(currentUser.id);
            return hasTask || isAssigned;
          }
        }
        return true;
      }

      // 5. Project-specific notification without explicit targetRoles
      if (notif.projectId && !notif.targetUserId && !notif.targetRoles) {
        if (currentUser.role === 'PROJECT_MANAGER') {
          const proj = (projects || []).find(p => p.id === notif.projectId);
          return proj && (proj.projectManagerId === currentUser.id || (proj.assignedTeamIds && proj.assignedTeamIds.includes(currentUser.id)));
        }
        if (currentUser.role === 'ONSITE_MEMBER' || currentUser.role === 'PARTNER') {
          const proj = (projects || []).find(p => p.id === notif.projectId);
          const hasTask = (tasks || []).some(t => t.projectId === notif.projectId && t.assigneeId === currentUser.id);
          return hasTask || proj?.assignedTeamIds?.includes(currentUser.id);
        }
      }

      // 6. Global broadcast
      if (notif.isGlobal) return true;

      // 7. General untargeted notifications fallback
      if (!notif.targetUserId && !notif.targetUserIds && !notif.targetRoles && !notif.projectId && !notif.actorId) {
        return true;
      }

      return false;
    });
  };

  const markNotificationAsRead = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    const scopedIds = new Set(getScopedNotifications().map(n => n.id));
    setNotifications(prev => prev.map(n => scopedIds.has(n.id) ? { ...n, read: true } : n));
  };

  const deleteNotification = (notifId) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
  };

  const clearNotifications = () => {
    const scopedIds = new Set(getScopedNotifications().map(n => n.id));
    setNotifications(prev => prev.filter(n => !scopedIds.has(n.id)));
  };

  // Global Edit Profile Modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalUser, setProfileModalUser] = useState(null);

  const openProfileModal = (user = null) => {
    const target = user || currentUser;
    // Non-Super Admins can only edit themselves, onsite members, or partner contractors
    if (currentUser.role !== 'SUPER_ADMIN' && target.id !== currentUser.id) {
      if (target.role === 'SUPER_ADMIN' || target.role === 'PROJECT_MANAGER') {
        pushNotification('Security Violation', 'Access Denied: You do not have authorization to view or edit other managers or Super Admin accounts.', 'warning', { targetUserId: currentUser.id });
        return;
      }
    }
    setProfileModalUser(target);
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setProfileModalUser(null);
  };

  // Personal To-Do list state (Private per user, completely decoupled from projects)
  const [personalTodos, setPersonalTodos] = useState(() => {
    try {
      const saved = localStorage.getItem('lincoz_personal_todos');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'todo-1',
        userId: 'usr-eng',
        text: 'Review TypeScript 5.4 release notes for personal study',
        isCompleted: true,
        priority: 'Medium',
        dueDate: '2026-10-10',
        createdAt: '2026-10-08T10:00:00.000Z'
      },
      {
        id: 'todo-2',
        userId: 'usr-eng',
        text: 'Clean up local Docker containers and cache',
        isCompleted: false,
        priority: 'Low',
        dueDate: '2026-10-12',
        createdAt: '2026-10-09T08:30:00.000Z'
      },
      {
        id: 'todo-3',
        userId: 'usr-eng',
        text: 'Prepare personal questions for Friday 1-on-1 meeting',
        isCompleted: false,
        priority: 'High',
        dueDate: '2026-10-10',
        createdAt: '2026-10-09T09:15:00.000Z'
      },
      {
        id: 'todo-4',
        userId: 'usr-partner-1',
        text: 'Submit updated tax invoice details',
        isCompleted: false,
        priority: 'High',
        dueDate: '2026-10-15',
        createdAt: '2026-10-09T09:00:00.000Z'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('lincoz_personal_todos', JSON.stringify(personalTodos));
    } catch (e) {}
  }, [personalTodos]);

  const getMyPersonalTodos = useCallback(() => {
    if (!currentUser?.id) return [];
    return personalTodos.filter(t => t.userId === currentUser.id);
  }, [personalTodos, currentUser?.id]);

  const addPersonalTodo = useCallback((text, priority = 'Medium', dueDate = '') => {
    if (!text || !text.trim() || !currentUser?.id) return null;
    const newTodo = {
      id: `todo-${Date.now()}-${secureRandomString(4)}`,
      userId: currentUser.id,
      text: text.trim(),
      isCompleted: false,
      priority,
      dueDate,
      createdAt: new Date().toISOString()
    };
    setPersonalTodos(prev => [newTodo, ...prev]);
    return newTodo;
  }, [currentUser?.id]);

  const togglePersonalTodo = useCallback((id) => {
    setPersonalTodos(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  }, []);

  const deletePersonalTodo = useCallback((id) => {
    setPersonalTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearCompletedPersonalTodos = useCallback(() => {
    if (!currentUser?.id) return;
    setPersonalTodos(prev => prev.filter(t => !(t.userId === currentUser.id && t.isCompleted)));
  }, [currentUser?.id]);

  const recordAttendance = useCallback((entry) => {
    const isManagerOrAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'PROJECT_MANAGER';
    if (!isManagerOrAdmin) {
      pushNotification(
        'Action Restricted',
        'Only Project Managers and Super Admins can record employee attendance.',
        'warning'
      );
      return false;
    }

    if (!entry.userId || !entry.date) {
      pushNotification('Missing Information', 'Employee and Date are required.', 'error');
      return false;
    }

    const employee = users.find(u => u.id === entry.userId);

    setAttendanceRecords(prev => {
      const existingIndex = prev.findIndex(
        r => r.userId === entry.userId && r.date === entry.date
      );

      if (existingIndex >= 0) {
        const recordSaved = {
          ...prev[existingIndex],
          ...entry,
          status: entry.status || prev[existingIndex].status || 'PRESENT',
          markedById: currentUser?.id,
          markedByName: currentUser?.name,
          updatedAt: new Date().toISOString()
        };
        const updated = [...prev];
        updated[existingIndex] = recordSaved;
        return updated;
      } else {
        const recordSaved = {
          id: 'att-' + Date.now() + '-' + secureRandomInt(0, 999),
          status: 'PRESENT',
          workMode: employee?.workMode || 'ON_SITE',
          checkIn: '09:00 AM',
          checkOut: '06:00 PM',
          hoursWorked: 8.5,
          notes: '',
          ...entry,
          markedById: currentUser?.id,
          markedByName: currentUser?.name,
          createdAt: new Date().toISOString()
        };
        return [recordSaved, ...prev];
      }
    });

    recordAuditLog({
      actionType: 'ATTENDANCE_RECORDED',
      itemText: `Recorded attendance for ${employee?.name || 'Staff'} on ${entry.date}: ${entry.status || 'PRESENT'}`,
      previousState: null,
      newState: entry
    });

    pushNotification(
      'Attendance Recorded',
      `Attendance for ${employee?.name || 'Employee'} on ${entry.date} was marked as ${(entry.status || 'PRESENT').replace('_', ' ')}.`,
      'success',
      {
        targetUserId: entry.userId,
        targetRoles: ['SUPER_ADMIN', 'PROJECT_MANAGER']
      }
    );

    return true;
  }, [currentUser, users, pushNotification, recordAuditLog]);

  const updateAttendance = useCallback((recordId, updates) => {
    const isManagerOrAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'PROJECT_MANAGER';
    if (!isManagerOrAdmin) {
      pushNotification(
        'Action Restricted',
        'Only Project Managers and Super Admins can update attendance records.',
        'warning'
      );
      return false;
    }

    let updatedRecord = null;
    let oldRecord = null;

    setAttendanceRecords(prev => prev.map(r => {
      if (r.id === recordId) {
        oldRecord = r;
        updatedRecord = {
          ...r,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        return updatedRecord;
      }
      return r;
    }));

    if (updatedRecord) {
      const employee = users.find(u => u.id === updatedRecord.userId);
      recordAuditLog({
        actionType: 'ATTENDANCE_UPDATED',
        itemText: `Updated attendance for ${employee?.name || 'Staff'} on ${updatedRecord.date}`,
        previousState: oldRecord,
        newState: updatedRecord
      });
      pushNotification('Attendance Updated', 'Attendance record was updated successfully.', 'success');
      return true;
    }
    return false;
  }, [currentUser, users, pushNotification, recordAuditLog]);

  const deleteAttendance = useCallback((recordId) => {
    const isManagerOrAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'PROJECT_MANAGER';
    if (!isManagerOrAdmin) {
      pushNotification(
        'Action Restricted',
        'Only Project Managers and Super Admins can delete attendance records.',
        'warning'
      );
      return false;
    }

    const recordToDelete = attendanceRecords.find(r => r.id === recordId);
    if (!recordToDelete) return false;

    setAttendanceRecords(prev => prev.filter(r => r.id !== recordId));

    recordAuditLog({
      actionType: 'ATTENDANCE_DELETED',
      itemText: `Deleted attendance log for ${recordToDelete.date}`,
      previousState: recordToDelete,
      newState: null
    });

    pushNotification('Attendance Record Removed', 'Attendance entry has been deleted.', 'info');
    return true;
  }, [currentUser, attendanceRecords, pushNotification, recordAuditLog]);

  const bulkMarkAttendance = useCallback(({ userIds = [], date, status = 'PRESENT', workMode = 'ON_SITE', checkIn = '09:00 AM', checkOut = '06:00 PM', notes = '' }) => {
    const isManagerOrAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'PROJECT_MANAGER';
    if (!isManagerOrAdmin) {
      pushNotification(
        'Action Restricted',
        'Only Project Managers and Super Admins can bulk mark attendance.',
        'warning'
      );
      return false;
    }

    if (!userIds.length || !date) {
      pushNotification('Invalid Batch', 'Please specify at least one staff member and date.', 'error');
      return false;
    }

    const targetIdsSet = new Set(userIds);
    let newEntries = [];

    setAttendanceRecords(prev => {
      const existingMap = new Map();
      prev.forEach(r => {
        if (r.date === date) {
          existingMap.set(r.userId, r);
        }
      });

      const updatedExisting = prev.map(r => {
        if (r.date === date && targetIdsSet.has(r.userId)) {
          return {
            ...r,
            status,
            workMode,
            checkIn: status === 'ON_LEAVE' || status === 'ABSENT' ? '-' : checkIn,
            checkOut: status === 'ON_LEAVE' || status === 'ABSENT' ? '-' : checkOut,
            hoursWorked: status === 'HALF_DAY' ? 4 : status === 'ON_LEAVE' || status === 'ABSENT' ? 0 : 8.5,
            notes: notes || r.notes,
            markedById: currentUser?.id,
            markedByName: currentUser?.name,
            updatedAt: new Date().toISOString()
          };
        }
        return r;
      });

      // Add missing users for this date
      userIds.forEach(uid => {
        if (!existingMap.has(uid)) {
          const emp = users.find(u => u.id === uid);
          newEntries.push({
            id: 'att-' + Date.now() + '-' + secureRandomInt(0, 999) + '-' + uid,
            userId: uid,
            date,
            status,
            workMode: workMode || emp?.workMode || 'ON_SITE',
            checkIn: status === 'ON_LEAVE' || status === 'ABSENT' ? '-' : checkIn,
            checkOut: status === 'ON_LEAVE' || status === 'ABSENT' ? '-' : checkOut,
            hoursWorked: status === 'HALF_DAY' ? 4 : status === 'ON_LEAVE' || status === 'ABSENT' ? 0 : 8.5,
            notes,
            markedById: currentUser?.id,
            markedByName: currentUser?.name,
            createdAt: new Date().toISOString()
          });
        }
      });

      return [...newEntries, ...updatedExisting];
    });

    recordAuditLog({
      actionType: 'BULK_ATTENDANCE_RECORDED',
      itemText: `Bulk marked attendance for ${userIds.length} team members on ${date} as ${status}`,
      previousState: null,
      newState: { count: userIds.length, date, status }
    });

    pushNotification(
      'Bulk Attendance Recorded',
      `Successfully marked ${userIds.length} team members as ${status.replace('_', ' ')} for ${date}.`,
      'success'
    );
    return true;
  }, [currentUser, users, pushNotification, recordAuditLog]);

  const recordRosterAttendance = useCallback(({ date, roster = [] }) => {
    const isManagerOrAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'PROJECT_MANAGER';
    if (!isManagerOrAdmin) {
      pushNotification(
        'Action Restricted',
        'Only Project Managers and Super Admins can record employee attendance.',
        'warning'
      );
      return false;
    }

    if (!date || !roster.length) {
      pushNotification('Missing Data', 'Date and at least one staff entry are required.', 'error');
      return false;
    }

    setAttendanceRecords(prev => {
      const rosterMap = new Map();
      roster.forEach(item => rosterMap.set(item.userId, item));

      // Update existing records for this date
      const updatedExisting = prev.map(r => {
        if (r.date === date && rosterMap.has(r.userId)) {
          const item = rosterMap.get(r.userId);
          const st = item.status || 'PRESENT';
          return {
            ...r,
            status: st,
            workMode: item.workMode || r.workMode || 'ON_SITE',
            checkIn: st === 'ABSENT' || st === 'ON_LEAVE' ? '-' : (item.checkIn || r.checkIn || '09:00 AM'),
            checkOut: st === 'ABSENT' || st === 'ON_LEAVE' ? '-' : (item.checkOut || r.checkOut || '06:00 PM'),
            hoursWorked: st === 'ABSENT' || st === 'ON_LEAVE' ? 0 : (st === 'HALF_DAY' ? 4 : (item.hoursWorked || 8.5)),
            notes: item.notes !== undefined ? item.notes : r.notes,
            markedById: currentUser?.id,
            markedByName: currentUser?.name,
            updatedAt: new Date().toISOString()
          };
        }
        return r;
      });

      // Find users in roster that don't have records for this date yet
      const existingUserIdsOnDate = new Set(prev.filter(r => r.date === date).map(r => r.userId));
      const newEntries = [];

      roster.forEach(item => {
        if (!existingUserIdsOnDate.has(item.userId)) {
          const emp = users.find(u => u.id === item.userId);
          const st = item.status || 'PRESENT';
          newEntries.push({
            id: 'att-' + Date.now() + '-' + secureRandomInt(0, 999) + '-' + item.userId,
            userId: item.userId,
            date,
            status: st,
            workMode: item.workMode || emp?.workMode || 'ON_SITE',
            checkIn: st === 'ABSENT' || st === 'ON_LEAVE' ? '-' : (item.checkIn || '09:00 AM'),
            checkOut: st === 'ABSENT' || st === 'ON_LEAVE' ? '-' : (item.checkOut || '06:00 PM'),
            hoursWorked: st === 'ABSENT' || st === 'ON_LEAVE' ? 0 : (st === 'HALF_DAY' ? 4 : (item.hoursWorked || 8.5)),
            notes: item.notes || '',
            markedById: currentUser?.id,
            markedByName: currentUser?.name,
            createdAt: new Date().toISOString()
          });
        }
      });

      return [...newEntries, ...updatedExisting];
    });

    recordAuditLog({
      actionType: 'ROSTER_ATTENDANCE_RECORDED',
      itemText: `Recorded attendance roster for ${roster.length} staff members on ${date}`,
      previousState: null,
      newState: { date, count: roster.length }
    });

    // Persist live to PostgreSQL database
    api.post('/attendance/bulk', {
      date,
      entries: roster.map(item => ({
        userId: item.userId,
        status: item.status || 'PRESENT',
        workMode: 'ONSITE',
        remarks: item.notes || ''
      }))
    }).catch(e => console.warn('[PostgreSQL Attendance Sync Note]', e.message));

    pushNotification(
      'Attendance Submitted',
      `Attendance for ${roster.length} staff members on ${date} has been recorded successfully.`,
      'success'
    );

    return true;
  }, [currentUser, users, pushNotification, recordAuditLog]);

  const getScopedAttendance = useCallback((dateFilter = null) => {
    let list = attendanceRecords || [];
    if (dateFilter) {
      list = list.filter(r => r.date === dateFilter);
    }

    // Role-based visibility rule:
    // Manager and Admin can see all records
    // Employees can ONLY see their respective attendance records
    if (isSuperAdmin() || isPM()) {
      return list;
    }

    return list.filter(r => r.userId === currentUser?.id);
  }, [attendanceRecords, isSuperAdmin, isPM, currentUser?.id]);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        selectedMonth,
        setSelectedMonth,
        availableMonths,
        users,
        currentUser,
        currentUserId,
        setCurrentUserId,
        contractors,
        setContractors,
        projects,
        tasks,
        clients,
        setClients,
        createClient,
        updateClient,
        deleteClient,
        getScopedClients,
        payoutLedger,
        clientInvoices,
        setClientInvoices,
        clientPayments,
        setClientPayments,
        sourcePayouts,
        setSourcePayouts,
        directExpensesList,
        setDirectExpensesList,
        expenseCategories,
        setExpenseCategories,
        addExpenseCategory,
        updateExpenseCategory,
        deleteExpenseCategory,
        addClientInvoice,
        addClientPayment,
        addSourcePayout,
        addPercentagePayout,
        addDirectExpense,
        deleteTransaction,
        auditLogs,
        recordAuditLog,
        notifications,
        pushNotification,
        getScopedNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearNotifications,
        toggleChecklistItem,
        updateTaskStatus,
        toggleTaskBlock,
        createTask,
        updateTask,
        deleteTask,
        addComment,
        addDeliverable,
        createProject,
        updateProject,
        deleteProject,
        updateContractorAgreement,
        approvePayoutStep1,
        authorizeDisbursementStep2,
        createUser,
        updateUser,
        deleteUser,
        updateUserPassword,
        updateUserMfaKey,
        resetToDefaults,
        isSuperAdmin,
        isPM,
        isOnsiteMember,
        isPartner,
        getScopedProjects,
        getScopedTasks,
        getScopedFinancials,
        getScopedAuditLogs,
        isProfileModalOpen,
        profileModalUser,
        openProfileModal,
        closeProfileModal,
        personalTodos,
        getMyPersonalTodos,
        addPersonalTodo,
        togglePersonalTodo,
        deletePersonalTodo,
        clearCompletedPersonalTodos,
        attendanceRecords,
        recordAttendance,
        recordRosterAttendance,
        updateAttendance,
        deleteAttendance,
        bulkMarkAttendance,
        getScopedAttendance,
        setCurrentUser,
        syncFromDatabase,
        refreshData: syncFromDatabase
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
