import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RoleBadge } from '../common/Badge';
import {
  Bell,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  Lock,
  LogOut,
  Sun,
  Moon,
  User,
  ShieldCheck,
  Settings
} from 'lucide-react';

export const Header = ({ onLogout }) => {
  const {
    currentUser,
    notifications,
    pushNotification,
    theme,
    toggleTheme,
    openProfileModal
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0F17]/90 backdrop-blur-xl border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-sm flex items-center justify-center">
              <div className="w-full h-full bg-[#0B0F17] rounded-[9px] flex items-center justify-center">
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-sans">
                LINCOZ
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono font-bold uppercase tracking-wider border border-indigo-500/25">
                Enterprise
              </span>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[#182234] hover:bg-[#202d44] border border-slate-700/70 text-slate-300 hover:text-white transition-all shadow-sm"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Notification Center */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="relative p-2 rounded-xl bg-[#182234] hover:bg-[#202d44] border border-slate-700/70 text-slate-300 hover:text-white transition-all shadow-sm"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-[#0B0F17]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#111827] border border-slate-700/80 shadow-2xl p-3 z-50 animate-scaleUp">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Activity Stream
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {notifications.length} updates
                    </span>
                  </div>

                  <div className="mt-2 space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-xl bg-[#182234]/70 border border-slate-800 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          {n.type === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          ) : n.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white">
                              {n.title}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {n.message}
                            </p>
                            <span className="text-[9px] text-slate-500 mt-1 block font-mono">
                              {new Date(n.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Enterprise User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#182234] hover:bg-[#202d44] border border-slate-700/80 transition-all text-left group shadow-sm"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/40"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#182234]" />
                </div>

                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {currentUser.name}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#111827] border border-slate-700/80 shadow-2xl p-2 z-50 animate-scaleUp">
                  {/* User Profile Header */}
                  <div className="p-3 border-b border-slate-800 bg-[#182234]/50 rounded-xl mb-1">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-indigo-500/50"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {currentUser.email}
                        </p>
                        <div className="mt-1">
                          <RoleBadge role={currentUser.role} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        openProfileModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                    >
                      <User className="w-4 h-4 text-indigo-400" />
                      <span>Edit Account & Profile</span>
                    </button>

                    <div className="px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Security Status
                      </span>
                      <span className="text-emerald-400 font-mono font-bold">
                        {currentUser.role === 'SUPER_ADMIN' ? 'MFA Protected' : 'RBAC Standard'}
                      </span>
                    </div>

                    <div className="pt-1 border-t border-slate-800/80">
                      {onLogout && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
