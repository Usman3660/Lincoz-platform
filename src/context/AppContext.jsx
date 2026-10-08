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
  INITIAL_EXPENSE_CATEGORIES
} from '../data/initialData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Theme state ('dark' | 'light')
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('lincoz_theme');
      return saved || 'dark';
    } catch (e) {
      return 'dark';
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
          const isPercentage = u.compensationType === 'PERCENTAGE' || u.role === 'PARTNER';
          const defaultSalary = u.role === 'SUPER_ADMIN' ? 180000 : u.role === 'PROJECT_MANAGER' ? 135000 : 120000;
          return {
            ...u,
            workMode: u.workMode || (u.role === 'ONSITE_MEMBER' ? 'ONSITE' : 'REMOTE'),
            compensationType: isPercentage ? 'PERCENTAGE' : 'SALARIED',
            salary: !isPercentage ? (u.salary || defaultSalary) : undefined,
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
      return saved || 'usr-admin';
    } catch (e) {
      return 'usr-admin';
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
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PROJECTS;
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
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DIRECT_EXPENSES;
    } catch (e) {
      return INITIAL_DIRECT_EXPENSES;
    }
  });

  const [expenseCategories, setExpenseCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('lincoz_expense_categories');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_EXPENSE_CATEGORIES;
    } catch (e) {
      return INITIAL_EXPENSE_CATEGORIES;
    }
  });

  const INITIAL_NOTIFICATIONS = [
    {
      id: 'notif-1',
      title: 'Disbursement Authorization Pending',
      message: 'Deliverable payout for David Vance ($6,000.00) requires Super Admin Step-2 signature.',
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
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CLIENTS_DIRECTORY;
    } catch (e) {
      return INITIAL_CLIENTS_DIRECTORY;
    }
  });

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

    const sorted = Array.from(monthSet).sort().reverse();
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
      localStorage.setItem('lincoz_expense_categories', JSON.stringify(expenseCategories));
    } catch (e) {}
  }, [expenseCategories]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0] || {
    id: 'usr-admin',
    name: 'Alexander Wright',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Founder & Managing Director'
  };

  const pushNotification = (title, message, type = 'info', meta = {}) => {
    const newNotif = {
      id: 'notif-' + Date.now() + Math.random().toString(36).substring(2, 5),
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
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
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
      clientIp: '192.168.1.' + (100 + Math.floor(Math.random() * 80)),
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

  const updateTaskStatus = (taskId, newStatus) => {
    let oldStatus = '';
    let taskRef = null;

    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id !== taskId) return task;
        oldStatus = task.status;
        taskRef = { ...task, status: newStatus };
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

  const createTask = (taskData) => {
    const newTask = {
      id: 'task-' + Date.now(),
      createdById: currentUser.id,
      status: taskData.status || 'BACKLOG',
      checklists: taskData.checklists || [],
      deliverables: taskData.deliverables || [],
      comments: taskData.comments || [],
      isBlocked: false,
      blockReason: '',
      ...taskData,
    };

    setTasks(prev => [newTask, ...prev]);

    recordAuditLog({
      taskId: newTask.id,
      taskTitle: newTask.title,
      projectId: newTask.projectId,
      actionType: 'CREATED',
      itemText: `Created task "${newTask.title}" (Priority: ${newTask.priority})`,
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

  const updateTask = (taskId, updates) => {
    let oldTask = null;
    let updatedTask = null;

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        oldTask = t;
        updatedTask = { ...t, ...updates };
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
    }
  };

  const deleteTask = (taskId) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    setTasks(prev => prev.filter(t => t.id !== taskId));

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
    const newProject = {
      id: 'proj-' + Date.now(),
      status: 'ACTIVE',
      grossInvoiced: 0,
      accountsReceivable: 0,
      directExpenses: 0,
      assignedTeamIds: ['usr-pm', currentUser.id],
      ...projectData
    };

    setProjects(prev => [newProject, ...prev]);

    recordAuditLog({
      projectId: newProject.id,
      projectName: newProject.name,
      actionType: 'PROJECT_CREATED',
      itemText: `Created new project "${newProject.name}" (TCV: $${(newProject.totalContractValue || 0).toLocaleString()})`,
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

    if (updates.totalContractValue !== undefined) {
      const existing = projects.find(p => p.id === projectId);
      const newTcv = Number(updates.totalContractValue) || 0;
      const currentGross = Number(existing?.grossInvoiced) || 0;
      if (newTcv < currentGross) {
        pushNotification(
          'Invalid Contract Value',
          `Total contract value ($${newTcv.toLocaleString()}) cannot be less than already invoiced amount ($${currentGross.toLocaleString()}).`,
          'error'
        );
        return false;
      }
    }

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        oldProj = p;
        const assignedTeam = [...(p.assignedTeamIds || [])];
        if (updates.projectManagerId && !assignedTeam.includes(updates.projectManagerId)) {
          assignedTeam.push(updates.projectManagerId);
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

      recordAuditLog({
        projectId,
        projectName: newProj.name,
        actionType: isPmChanged ? 'PM_REASSIGNED' : 'PROJECT_UPDATED',
        itemText: isPmChanged
          ? `Reassigned Project Manager for "${newProj.name}" from ${oldPm?.name || 'Unassigned'} to ${newPm?.name || 'New Manager'}`
          : `Updated project configuration for "${newProj.name}"`,
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
    }
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
        itemText: `Step 1 Verification passed for ${updatedItem.contractorName} ($${(updatedItem.calculatedPayoutAmount || 0).toLocaleString()})`,
        previousState: { status: 'INVOICED' },
        newState: { status: 'APPROVED', step1ApprovedBy: currentUser.name }
      });

      pushNotification(
        'Step 1 Verification Complete',
        `Payout for ${updatedItem.contractorName} ($${(updatedItem.calculatedPayoutAmount || 0).toLocaleString()}) is now APPROVED and awaiting Super Admin Step-2 sign-off.`,
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

    const txRef = customRef || `TX-AUTH-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-4)}`;
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

        updatedItem = {
          id: payoutId,
          contractorId: payoutItemMeta?.employeeId || payoutItemMeta?.contractorId || 'usr-staff',
          contractorName: payeeName,
          projectId: payoutItemMeta?.projectId || 'payroll',
          projectName: projName,
          deliverableTitle: payoutItemMeta?.deliverableTitle || payoutItemMeta?.period || 'Project Deliverable Settlement',
          calculatedPayoutAmount: amount,
          status: 'DISBURSED',
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
      itemText: `Super Admin logged payment settlement for ${payeeName} ($${Number(amount).toLocaleString()}) [Ref: ${txRef}]`,
      previousState: { status: 'APPROVED' },
      newState: { status: 'DISBURSED', disbursementRef: txRef, authorizedBy: currentUser.name }
    });

    pushNotification(
      'Payment Settlement Logged',
      `Payment ($${Number(amount).toLocaleString()}) logged for ${payeeName} via ${channel}. Reference: ${txRef}`,
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
        `Invoice for $${amount.toLocaleString()} rejected. Total invoiced would reach $${projectedTotal.toLocaleString()}, exceeding the project contract value of $${totalContractValue.toLocaleString()}. Remaining allowance: $${remainingAllowed.toLocaleString()}.`,
        'error'
      );
      return {
        success: false,
        error: `Total invoice amount ($${projectedTotal.toLocaleString()}) would exceed the project's total value ($${totalContractValue.toLocaleString()}). Maximum remaining allowed: $${remainingAllowed.toLocaleString()}.`
      };
    }

    const newInvoice = {
      id: 'inv-' + Date.now(),
      _createdTimestamp: Date.now(),
      createdAt: new Date().toISOString(),
      projectId: invoiceData.projectId,
      projectName: invoiceData.projectName || project?.name || 'Client Project',
      clientName: invoiceData.clientName || project?.clientName || 'Client Organization',
      invoiceNumber: invoiceData.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
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
      itemText: `Logged Client Invoice ${newInvoice.invoiceNumber} for $${amount.toLocaleString()} on ${newInvoice.projectName}`,
      previousState: null,
      newState: newInvoice
    });

    pushNotification(
      'Client Invoice Recorded',
      `Invoice ${newInvoice.invoiceNumber} ($${amount.toLocaleString()}) recorded for ${newInvoice.projectName}.`,
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
      referenceNumber: paymentData.referenceNumber || `TX-IN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
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
      itemText: `Received Client Payment (Pay-In) of $${amount.toLocaleString()} for ${newPayment.projectName} [Ref: ${newPayment.referenceNumber}]`,
      previousState: null,
      newState: newPayment
    });

    pushNotification(
      'Client Payment Received (Pay-In)',
      `Pay-In of $${amount.toLocaleString()} received from ${newPayment.clientName} for ${newPayment.projectName}.`,
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
      itemText: `Disbursed $${amount.toLocaleString()} Source Referral Fee to ${newPayout.sourceName} on ${newPayout.projectName}`,
      previousState: null,
      newState: newPayout
    });

    pushNotification(
      'Source Payout Logged',
      `Source fee of $${amount.toLocaleString()} disbursed to ${newPayout.sourceName}.`,
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
        ? `Disbursed Monthly Salary Payout of $${amount.toLocaleString()} to ${newRecord.contractorName}`
        : `Disbursed Project Share Payout of $${amount.toLocaleString()} to ${newRecord.contractorName} for ${newRecord.projectName}`,
      previousState: null,
      newState: newRecord
    });

    pushNotification(
      isSalaried ? 'Monthly Salary Logged' : 'Percentage Share Payout Logged',
      `Disbursed $${amount.toLocaleString()} to ${newRecord.contractorName} (${isSalaried ? 'Fixed Salary' : newRecord.projectName}).`,
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
      receiptRef: expenseData.receiptRef || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      status: expenseData.status || 'PAID',
      notes: expenseData.notes || 'Monthly operational infrastructure expense.'
    };

    setDirectExpensesList(prev => [newExpense, ...prev]);

    recordAuditLog({
      actionType: 'DIRECT_EXPENSE_LOGGED',
      itemText: `Recorded Monthly Expense of $${amount.toLocaleString()} (${newExpense.category} - ${newExpense.vendor}) for ${newExpense.month}`,
      previousState: null,
      newState: newExpense
    });

    pushNotification(
      'Monthly Expense Recorded',
      `Expense of $${amount.toLocaleString()} recorded for ${newExpense.month} (${newExpense.category}).`,
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
      }
    } else if (type === 'PERCENTAGE' || type === 'PERCENTAGE_PAYOUT' || type === 'EMPLOYEE' || type === 'SALARIED' || type === 'SALARIED_PAYOUT') {
      setPayoutLedger(prev => prev.filter(p => p.id !== id));
    }
  };

  const createUser = (userData) => {
    const newUser = {
      id: 'usr-' + Date.now(),
      avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 900000)}?w=150&auto=format&fit=crop&q=80`,
      isMfaEnabled: userData.role === 'SUPER_ADMIN',
      workMode: userData.workMode || 'ONSITE',
      compensationType: userData.compensationType || 'SALARIED',
      ...userData
    };

    setUsers(prev => [...prev, newUser]);

    const compSummary = newUser.compensationType === 'PERCENTAGE'
      ? `${newUser.percentage || 15}% Share`
      : newUser.salary ? `$${Number(newUser.salary).toLocaleString()}/yr` : 'Salaried';

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
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    pushNotification('User Updated', 'User profile details were updated.', 'info', {
      targetRoles: ['SUPER_ADMIN'],
      targetUserId: userId
    });
  };

  const createClient = (clientData) => {
    const isFreelancer = clientData.category === 'FREELANCER';
    const newClient = {
      id: (isFreelancer ? 'fl-' : 'cli-') + Date.now(),
      category: clientData.category || 'CLIENT',
      name: clientData.name?.trim() || '',
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
    if (isPM()) {
      const pmProjectIds = new Set((projects || []).filter(p => p.projectManagerId === currentUser.id).map(p => p.id));
      return (clients || []).filter(c => (c.associatedProjects || []).some(pId => pmProjectIds.has(pId)));
    }
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
    const target = expenseCategories.find(c => c.id === id);
    if (!target) return;
    setExpenseCategories(prev => prev.filter(c => c.id !== id));
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

  const isSuperAdmin = () => currentUser.role === 'SUPER_ADMIN';
  const isPM = () => currentUser.role === 'PROJECT_MANAGER';
  const isOnsiteMember = () => currentUser.role === 'ONSITE_MEMBER';
  const isPartner = () => currentUser.role === 'PARTNER';

  const getScopedProjects = () => {
    if (isSuperAdmin()) return projects || [];
    if (isPM()) {
      return (projects || [])
        .filter(p => p.projectManagerId === currentUser.id || (p.assignedTeamIds && p.assignedTeamIds.includes(currentUser.id)))
        .map(p => ({
          ...p,
          totalContractValue: 'CONFIDENTIAL',
          grossInvoiced: 'CONFIDENTIAL',
          accountsReceivable: 'CONFIDENTIAL',
          directExpenses: 'CONFIDENTIAL',
        }));
    }
    if (isOnsiteMember()) return (projects || []).filter(p => p.assignedTeamIds && p.assignedTeamIds.includes(currentUser.id));
    if (isPartner()) {
      const partnerTaskProjectIds = (tasks || []).filter(t => t.assigneeId === currentUser.id).map(t => t.projectId);
      const contractorRecord = (contractors || []).find(c => c.userId === currentUser.id);
      const agreementProjectIds = contractorRecord ? (contractorRecord.agreements || []).map(a => a.projectId) : [];
      const allowedIds = new Set([...partnerTaskProjectIds, ...agreementProjectIds]);
      
      return (projects || []).filter(p => allowedIds.has(p.id)).map(p => ({
        ...p,
        totalContractValue: 'CONFIDENTIAL',
        grossInvoiced: 'CONFIDENTIAL',
        accountsReceivable: 'CONFIDENTIAL',
        directExpenses: 'CONFIDENTIAL',
      }));
    }
    return [];
  };

  const getScopedTasks = (projectId = null) => {
    let filtered = tasks || [];
    if (projectId) {
      filtered = filtered.filter(t => t.projectId === projectId);
    }
    if (isSuperAdmin() || isPM()) return filtered;
    return filtered.filter(t => t.assigneeId === currentUser.id);
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

      // Monthly Salaried commitments
      const salariedStaff = (users || []).filter(u => u.compensationType !== 'PERCENTAGE' && u.role !== 'PARTNER');
      const totalMonthlySalaries = salariedStaff.reduce((sum, u) => {
        const defaultSalary = u.role === 'SUPER_ADMIN' ? 180000 : u.role === 'PROJECT_MANAGER' ? 135000 : 120000;
        return sum + Math.round((u.salary || defaultSalary) / 12);
      }, 0);

      const totalOutflows = directExpenses + totalSourcePayouts + totalPercentagePayouts;
      const totalPayroll = totalMonthlySalaries + totalPercentagePayouts;
      const netMonthlyCashflow = totalCollected - totalOutflows - totalMonthlySalaries;
      const totalMonthlyProfit = grossInvoiced - directExpenses - totalMonthlySalaries - totalPercentagePayouts - totalSourcePayouts;
      const totalProfitMarginPercent = grossInvoiced > 0 ? Math.round((totalMonthlyProfit / grossInvoiced) * 100) : 0;
      const netProjectGrossProfit = grossInvoiced - directExpenses - totalSourcePayouts - totalPercentagePayouts;
      const netOperatingMargin = grossInvoiced > 0 ? Math.round((netProjectGrossProfit / grossInvoiced) * 100) : 0;

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
        fixedPayroll: totalMonthlySalaries,
        variablePayroll: totalPercentagePayouts,
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
        totalPercentagePayouts,
        totalMonthlySalaries,
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
        updateContractorAgreement,
        approvePayoutStep1,
        authorizeDisbursementStep2,
        createUser,
        updateUser,
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
        closeProfileModal
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
