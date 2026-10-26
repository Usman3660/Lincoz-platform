import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderKanban,
  Banknote,
  History,
  Lock,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  ChevronRight,
  KeyRound,
  Sun,
  Moon
} from 'lucide-react';
import { RoleBadge } from '../common/Badge';

export const LandingPage = ({ onNavigateToAuth }) => {
  const { theme, toggleTheme } = useApp();

  const roles = [
    {
      id: 'usr-admin',
      role: 'SUPER_ADMIN',
      title: 'Super Admin (Owner)',
      name: 'Alexander Wright',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      description: 'TCV financial governance, employee compensation structures, PM provisioning, and 2-step disbursement sign-off.',
    },
    {
      id: 'usr-pm',
      role: 'PROJECT_MANAGER',
      title: 'Project Manager',
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      description: 'Sprint lifecycles, on-site & remote staff provisioning, deliverable reviews, and Step-1 verification.',
    },
    {
      id: 'usr-eng',
      role: 'ONSITE_MEMBER',
      title: 'On-Site Engineer (Salaried)',
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      description: 'Granular verification checklist execution with sub-250ms latency, internal comments, and PR submissions.',
    },
    {
      id: 'usr-partner-1',
      role: 'ONSITE_MEMBER',
      title: 'Remote Architect (% Share)',
      name: 'David Vance',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      description: 'Remote engineering delivery with real-time percentage project earnings and transparent ledger calculation.',
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#0B0F17]/90 backdrop-blur-xl border-b border-slate-800/80 transition-colors">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center">
                  <Layers className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white font-sans">
                  LINCOZ
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono font-bold uppercase tracking-wider border border-indigo-500/30">
                  ENTERPRISE
                </span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                className="p-2.5 rounded-xl bg-[#182234] hover:bg-[#202d44] border border-slate-700/80 text-slate-300 hover:text-white transition-all shadow-sm flex items-center justify-center"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
                )}
              </button>
              
              <button
                onClick={() => onNavigateToAuth('login')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" /> Sign In
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-6">
        
        {/* Soft Background Accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Enterprise Project & Financial Governance
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Unified Operations & Financial Ledger for <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">Blended Teams</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Manage on-site and remote employees (salaried and project percentage share) in one place. Enforce hierarchical user provisioning, project data isolation, 2-step payout sign-offs, and immutable audit logs.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
          <button
            onClick={() => onNavigateToAuth('login')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            Sign In to Workspace <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Key Features Pills */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5 bg-[#182234]/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sub-250ms Reactive Latency
          </span>
          <span className="flex items-center gap-1.5 bg-[#182234]/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 2-Step Payout Authorization
          </span>
          <span className="flex items-center gap-1.5 bg-[#182234]/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Super Admin &rarr; PM &rarr; Team Provisioning
          </span>
          <span className="flex items-center gap-1.5 bg-[#182234]/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> On-Site & Remote Workflows
          </span>
        </div>

      </section>

      {/* Stakeholder Architecture & Role RBAC Matrix */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Role-Based Access Architecture
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Explore the tailored operational security tiers designed for high-velocity enterprise teams.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-[#111827] border border-slate-800 hover:border-indigo-500/40 transition-all duration-200 shadow-sm flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <img
                    src={r.avatar}
                    alt={r.name}
                    loading="lazy"
                    decoding="async"
                    width="44"
                    height="44"
                    className="w-11 h-11 rounded-xl object-cover ring-1 ring-indigo-500/30"
                  />
                  <RoleBadge role={r.role} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">
                    {r.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Sample Identity: {r.name}
                  </p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-[#182234]/70 p-3 rounded-xl border border-slate-800/80">
                  {r.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => onNavigateToAuth('login')}
                  className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Sign In as {r.role.replace('_', ' ')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Four Core Pillars */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2.5">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 w-fit border border-rose-500/20">
              <Banknote className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">2-Step Disbursement</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Step 1 verification by Project Manager &rarr; Step 2 cryptographic authorization by Super Admin.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 w-fit border border-amber-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Project Share Ledger</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Percentage-based partners track real-time project share commissions with transparent formula calculations.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit border border-indigo-500/20">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Multi-View Task Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Kanban, filterable List, and Gantt roadmap views mapped directly to project tasks and deliverables.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit border border-emerald-500/20">
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Immutable Audit Diffs</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Append-only audit trail capturing UUIDv4, actor, client IP, UTC timestamp, and side-by-side JSON deltas.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-6 px-4 sm:px-6 lg:px-8 bg-[#0e1420]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">LINCOZ PLATFORM</span> &bull; Internal Hybrid Project & Financial Management System
          </div>
          <div>
            Enterprise RBAC Architecture
          </div>
        </div>
      </footer>

    </div>
  );
};
