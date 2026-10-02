import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_USERS,
  INITIAL_CONTRACTORS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_PAYOUT_LEDGER,
  INITIAL_AUDIT_LOGS,
  INITIAL_CLIENTS_DIRECTORY
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

  // Safe localStorage persistence with fallback
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('lincoz_users');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_USERS;
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

  const INITIAL_NOTIFICATIONS = [
    {
      id: 'notif-1',
      title: 'Disbursement Authorization Pending',
      message: 'Milestone 2 payout for David Vance ($6,000.00) requires Super Admin Step-2 signature.',
      type: 'warning',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
      targetRoles: ['SUPER_ADMIN'],
      targetUserId: 'usr-admin'
    },
    {
      id: 'notif-2',
      title: 'Project Milestone Nearing Due Date',
      message: 'Milestone 2 for Quantum Ledger Node is scheduled for review.',
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
      message: 'Your 22.5% milestone commission model for Decentralized Identity Vault is active.',
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
      milestones: [],
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

  const authorizeDisbursementStep2 = (payoutId, customRef, authPasscode) => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      alert('Security Policy Violation: Only Super Admin (Owner) has authorization to sign-off and disburse contractor funds.');
      return false;
    }

    let updatedItem = null;
    const txRef = customRef || `TX-AUTH-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    setPayoutLedger(prev => prev.map(p => {
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
    }));

    if (updatedItem) {
      recordAuditLog({
        projectId: updatedItem.projectId,
        projectName: updatedItem.projectName,
        actionType: 'PAYOUT_DISBURSED',
        itemText: `Super Admin executed 2-Step Disbursement Authorization for ${updatedItem.contractorName} ($${(updatedItem.calculatedPayoutAmount || 0).toLocaleString()}) [Ref: ${txRef}]`,
        previousState: { status: 'APPROVED' },
        newState: { status: 'DISBURSED', disbursementRef: txRef, authorizedBy: currentUser.name }
      });

      pushNotification(
        'Disbursement Authorized & Disbursed',
        `Funds ($${(updatedItem.calculatedPayoutAmount || 0).toLocaleString()}) disbursed to ${updatedItem.contractorName} via ${updatedItem.disbursementChannel}. Reference: ${txRef}`,
        'success',
        {
          projectId: updatedItem.projectId,
          targetRoles: ['SUPER_ADMIN', 'PROJECT_MANAGER'],
          targetUserId: updatedItem.contractorId
        }
      );
      return true;
    }
    return false;
  };

  const createUser = (userData) => {
    const newUser = {
      id: 'usr-' + Date.now(),
      avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 900000)}?w=150&auto=format&fit=crop&q=80`,
      isMfaEnabled: userData.role === 'SUPER_ADMIN',
      ...userData
    };

    setUsers(prev => [...prev, newUser]);

    if (userData.role === 'PARTNER') {
      const newContractor = {
        userId: newUser.id,
        legalName: userData.legalName || `${newUser.name} Solutions`,
        taxClassification: userData.taxClassification || 'Individual / Contractor',
        taxId: userData.taxId || 'PENDING-TAX-ID',
        country: userData.country || 'Remote',
        defaultPayoutChannel: userData.payoutChannel || 'Wise Wire Transfer',
        payoutDetails: userData.payoutDetails || 'wise://account',
        agreements: []
      };
      setContractors(prev => [...prev, newContractor]);
    }

    recordAuditLog({
      actionType: 'USER_PROVISIONED',
      itemText: `Provisioned new system user "${newUser.name}" (Role: ${newUser.role}${newUser.salary ? `, Salary: $${Number(newUser.salary).toLocaleString()}/yr` : ''})`,
      previousState: null,
      newState: newUser
    });

    pushNotification(
      'User Provisioned',
      `New user "${newUser.name}" (${newUser.role}) added to the platform.`,
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

  const getScopedFinancials = () => {
    if (isSuperAdmin()) {
      const totalContractValue = (projects || []).reduce((sum, p) => sum + (p.totalContractValue || 0), 0);
      const grossInvoiced = (projects || []).reduce((sum, p) => sum + (p.grossInvoiced || 0), 0);
      const accountsReceivable = (projects || []).reduce((sum, p) => sum + (p.accountsReceivable || 0), 0);
      const directExpenses = (projects || []).reduce((sum, p) => sum + (p.directExpenses || 0), 0);
      
      const accruedLiabilities = (payoutLedger || [])
        .filter(p => p.status === 'ACCRUING' || p.status === 'INVOICED' || p.status === 'APPROVED')
        .reduce((sum, p) => sum + (p.calculatedPayoutAmount || 0), 0);

      const totalDisbursed = (payoutLedger || [])
        .filter(p => p.status === 'DISBURSED')
        .reduce((sum, p) => sum + (p.calculatedPayoutAmount || 0), 0);

      return {
        roleAllowed: true,
        canAuthorizeDisbursement: true,
        canEditCalculations: true,
        totalContractValue,
        grossInvoiced,
        accountsReceivable,
        directExpenses,
        accruedLiabilities,
        totalDisbursed,
        ledger: payoutLedger || []
      };
    }

    if (isPartner()) {
      const partnerLedger = (payoutLedger || []).filter(p => p.contractorId === currentUser.id);
      const totalEarned = partnerLedger.reduce((sum, p) => sum + (p.calculatedPayoutAmount || 0), 0);
      const totalDisbursed = partnerLedger.filter(p => p.status === 'DISBURSED').reduce((sum, p) => sum + (p.calculatedPayoutAmount || 0), 0);
      const pendingDisbursement = partnerLedger.filter(p => p.status === 'APPROVED').reduce((sum, p) => sum + (p.calculatedPayoutAmount || 0), 0);
      const unbilledAccruing = partnerLedger.filter(p => p.status === 'ACCRUING' || p.status === 'INVOICED').reduce((sum, p) => sum + (p.calculatedPayoutAmount || 0), 0);

      return {
        roleAllowed: true,
        isPartnerIsolated: true,
        canAuthorizeDisbursement: false,
        canEditCalculations: false,
        totalEarned,
        totalDisbursed,
        pendingDisbursement,
        unbilledAccruing,
        ledger: partnerLedger
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
