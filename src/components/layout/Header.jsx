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
  CheckCheck,
  Trash2,
  X,
  Clock,
  FolderKanban
} from 'lucide-react';

export const Header = ({ onLogout }) => {
  const {
    currentUser,
    getScopedNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearNotifications,
    theme,
    toggleTheme,
    openProfileModal
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'

  const scopedNotifications = getScopedNotifications ? getScopedNotifications() : [];
  const unreadCount = scopedNotifications.filter(n => !n.read).length;

  const displayedNotifications = activeTab === 'unread'
    ? scopedNotifications.filter(n => !n.read)
    : scopedNotifications;

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B0F17] border-b border-slate-800 transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8">
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
              aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
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
                aria-label={`Notifications (${unreadCount} unread)`}
                className={`relative p-2 rounded-xl border transition-all shadow-sm ${
                  showNotifications
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400'
                    : 'bg-[#182234] hover:bg-[#202d44] border-slate-700/70 text-slate-300 hover:text-white'
                }`}
                title="Personalized System Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-[#0B0F17] animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-[420px] rounded-2xl bg-[#111827] border border-slate-700/80 shadow-2xl z-50 animate-scaleUp overflow-hidden">
                  
                  {/* Header Bar */}
                  <div className="p-3.5 bg-[#182234]/80 border-b border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            Notifications
                            {unreadCount > 0 && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                                {unreadCount} new
                              </span>
                            )}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[10px] font-bold transition-all border border-indigo-500/30"
                            title="Mark all as read"
                          >
                            <CheckCheck className="w-3 h-3" /> Mark all read
                          </button>
                        )}
                        {scopedNotifications.length > 0 && (
                          <button
                            onClick={clearNotifications}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Clear all notifications"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 border-b border-slate-800/60 pb-1">
                      <button
                        onClick={() => setActiveTab('all')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          activeTab === 'all'
                            ? 'bg-slate-800 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        All ({scopedNotifications.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('unread')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          activeTab === 'unread'
                            ? 'bg-slate-800 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Unread ({unreadCount})
                      </button>
                    </div>
                  </div>

                  {/* Notification Items List */}
                  <div className="p-2 space-y-1.5 max-h-80 overflow-y-auto custom-scrollbar">
                    {displayedNotifications.length === 0 ? (
                      <div className="py-10 text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <p className="text-xs font-bold text-white">All Caught Up!</p>
                        <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto">
                          {activeTab === 'unread'
                            ? 'You have no unread notifications.'
                            : 'No system notifications for your role profile.'}
                        </p>
                      </div>
                    ) : (
                      displayedNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.read && markNotificationAsRead) {
                              markNotificationAsRead(n.id);
                            }
                          }}
                          className={`p-3 rounded-xl border transition-all relative group cursor-pointer ${
                            n.read
                              ? 'bg-[#182234]/40 border-slate-800/70 hover:bg-[#182234]/70 hover:border-slate-700'
                              : 'bg-[#182234] border-indigo-500/40 hover:border-indigo-500 shadow-sm'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {/* Status Icon */}
                            <div className="shrink-0 mt-0.5">
                              {n.type === 'warning' ? (
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                              ) : n.type === 'success' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Info className="w-4 h-4 text-indigo-400" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className={`text-xs font-semibold ${n.read ? 'text-slate-200' : 'text-white font-bold'}`}>
                                  {n.title}
                                </p>
                                {!n.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                                {n.message}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-400 font-mono">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {n.actorName && (
                                  <span>&bull; by {n.actorName}</span>
                                )}
                              </div>
                            </div>

                            {/* Dismiss button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (deleteNotification) deleteNotification(n.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-all absolute top-2.5 right-2.5"
                              title="Dismiss notification"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-2.5 bg-[#0B0F17]/80 border-t border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Role Scoped &bull; {currentUser.role.replace('_', ' ')}
                    </span>
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
                    loading="lazy"
                    decoding="async"
                    width="28"
                    height="28"
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
                        loading="lazy"
                        decoding="async"
                        width="40"
                        height="40"
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
