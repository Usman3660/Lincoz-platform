import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FolderKanban,
  DollarSign,
  ArrowLeftRight,
  Receipt,
  Users,
  Briefcase,
  History,
  KeyRound,
  Building2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { currentUser, isSuperAdmin, isPM, isOnsiteMember, isPartner, openProfileModal } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch (e) {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', String(next));
      } catch (e) { }
      return next;
    });
  };

  const getNavItems = () => {
    if (isSuperAdmin()) {
      return [
        { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
        { id: 'projects', label: 'Projects', icon: Briefcase },
        { id: 'clients', label: 'Clients/Sources', icon: Building2 },
        { id: 'tasks', label: 'Task Board', icon: FolderKanban },
        { id: 'payin_payout', label: 'Pay-In & Pay-Out', icon: ArrowLeftRight },
        { id: 'expenses', label: 'Expenses', icon: Receipt },
        { id: 'financials', label: 'Finance & Analytics', icon: DollarSign },
        { id: 'audit', label: 'Audit Trail & Logs', icon: History },
        { id: 'users', label: 'Team & Staff Provisioning', icon: KeyRound },
      ];
    }

    if (isPM()) {
      return [
        { id: 'dashboard', label: 'PM Operations Hub', icon: LayoutDashboard },
        { id: 'projects', label: 'Assigned Projects', icon: Briefcase },
        { id: 'clients', label: 'Clients & Sources', icon: Building2 },
        { id: 'tasks', label: 'Task & Sprint Engine', icon: FolderKanban },
        { id: 'users', label: 'Team Members & Staff', icon: Users },
        { id: 'audit', label: 'Project Audit Trail', icon: History },
      ];
    }

    // On-Site & Remote Employees (Salaried or Percentage-Based)
    return [
      { id: 'dashboard', label: 'Employee Workspace', icon: LayoutDashboard },
      { id: 'tasks', label: 'My Assigned Tasks', icon: FolderKanban },
      ...(currentUser?.compensationType === 'PERCENTAGE' || isPartner() ? [
        { id: 'financials', label: 'My Project Earnings', icon: DollarSign }
      ] : []),
      { id: 'audit', label: 'My Activity Stream', icon: History },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside
      className={`${isCollapsed ? 'w-[72px]' : 'w-60'
        } bg-[#0e1420] border-r border-slate-800/80 flex flex-col shrink-0 min-h-[calc(100vh-64px)] transition-all duration-300 ease-in-out relative z-50`}
    >

      {/* Top Header Toggle Bar */}
      <div className={`p-3 border-b border-slate-800/80 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'}`}>
        {!isCollapsed && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Navigation
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 sm:p-2 rounded-xl bg-[#182234] hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/60 hover:border-indigo-500/50 transition-all shadow-sm flex items-center justify-center"
          title={isCollapsed ? "Expand Sidebar" : "Minimize Sidebar"}
          aria-label={isCollapsed ? "Expand Sidebar" : "Minimize Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-200 hover:text-white" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-200 hover:text-white" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-3 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full group flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'
                } rounded-xl text-xs font-semibold transition-all duration-150 ${isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`}
              />
              {!isCollapsed && <span className="truncate transition-colors">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
