import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FolderKanban,
  DollarSign,
  Users,
  ShieldCheck,
  Briefcase,
  History,
  Lock,
  KeyRound,
  Edit3,
  Building2
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { currentUser, isSuperAdmin, isPM, isOnsiteMember, isPartner, openProfileModal } = useApp();

  const getNavItems = () => {
    if (isSuperAdmin()) {
      return [
        { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
        { id: 'projects', label: 'Client Projects', icon: Briefcase },
        { id: 'clients', label: 'Clients & Sources', icon: Building2 },
        { id: 'tasks', label: 'Task Engine', icon: FolderKanban },
        { id: 'financials', label: 'Financials & Payouts', icon: DollarSign },
        { id: 'contractors', label: 'Contractors & % Setup', icon: Users },
        { id: 'audit', label: 'Audit Trail & Logs', icon: History },
        { id: 'users', label: 'User Provisioning', icon: KeyRound },
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

    if (isOnsiteMember()) {
      return [
        { id: 'dashboard', label: 'Engineering Workspace', icon: LayoutDashboard },
        { id: 'tasks', label: 'My Assigned Tasks', icon: FolderKanban },
        { id: 'audit', label: 'My Activity Stream', icon: History },
      ];
    }

    if (isPartner()) {
      return [
        { id: 'dashboard', label: 'Contractor Portal', icon: LayoutDashboard },
        { id: 'tasks', label: 'Deliverable Pipeline', icon: FolderKanban },
        { id: 'financials', label: 'My Earnings Ledger', icon: DollarSign },
        { id: 'audit', label: 'My Audit History', icon: History },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-60 bg-[#0e1420]/80 backdrop-blur-xl border-r border-slate-800/80 flex flex-col shrink-0 min-h-[calc(100vh-64px)] transition-colors">
      
      {/* Active Role Card */}
      <div className="p-3.5 border-b border-slate-800/80">
        <div className="p-3 rounded-xl bg-[#182234] border border-slate-700/60 relative group">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Security Tier
              </span>
            </div>
            
            <button
              onClick={() => openProfileModal()}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold hover:underline"
              title="Edit Profile"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          </div>
          <p className="text-xs font-bold text-white truncate">
            {currentUser.name}
          </p>
          <p className="text-[10px] text-indigo-400 font-mono mt-0.5">
            {currentUser.role.replace('_', ' ')}
          </p>
          {isPartner() && (
            <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center gap-1.5 text-[10px] text-amber-400 font-mono">
              <Lock className="w-3 h-3" /> Data Isolated
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              <span className="truncate transition-colors">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-3.5 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono space-y-1">
        <div className="flex items-center justify-between">
          <span>Engine Status:</span>
          <span className="text-emerald-400 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Sub-250ms OK
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Audit Stream:</span>
          <span className="text-indigo-400">WORM Active</span>
        </div>
      </div>
    </aside>
  );
};
