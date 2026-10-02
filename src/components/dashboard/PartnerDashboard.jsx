import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../common/StatsCard';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import {
  DollarSign,
  Lock,
  ExternalLink,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  FileCheck,
  CreditCard,
  Building,
  CheckSquare
} from 'lucide-react';

export const PartnerDashboard = ({ setActiveTab, onSelectTask, onOpenSubmitDeliverable }) => {
  const {
    currentUser,
    getScopedTasks,
    getScopedFinancials,
    toggleChecklistItem,
    updateTaskStatus,
    contractors,
    projects
  } = useApp();

  const partnerTasks = getScopedTasks();
  const financials = getScopedFinancials();
  const contractorProfile = contractors.find(c => c.userId === currentUser.id);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Partner Isolated Hero Banner */}
      <div className="dashboard-hero-banner partner-banner relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-[#111827] border border-amber-500/30 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" /> Data-Isolated Contractor Portal & Ledger
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {contractorProfile?.legalName || currentUser.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Strictly scoped external partner workspace. Track your milestone percentage commissions in real-time and submit deliverable pull requests directly to project managers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#182234]/80 border border-amber-500/30 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <CreditCard className="w-4 h-4" /> Default Payout Channel
            </div>
            <p className="text-white font-medium">{contractorProfile?.defaultPayoutChannel}</p>
            <p className="text-slate-400 font-mono text-[10px]">Tax ID: {contractorProfile?.taxId}</p>
          </div>
        </div>
      </div>

      {/* Partner Real-Time Earnings Ledger (PRD Section 3.3) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Real-Time Milestone Commissions Ledger
            </h2>
          </div>
          <span className="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-mono">
            Isolated Financial Scope
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Milestone Earnings"
            value={`$${financials.totalEarned.toLocaleString()}`}
            subtitle="Accumulated across all milestones"
            icon={DollarSign}
            colorScheme="amber"
          />
          <StatsCard
            title="Funds Disbursed"
            value={`$${financials.totalDisbursed.toLocaleString()}`}
            subtitle="Received via Wire / Crypto"
            icon={CheckCircle2}
            colorScheme="emerald"
            badgeText="Paid"
          />
          <StatsCard
            title="Approved for Payout"
            value={`$${financials.pendingDisbursement.toLocaleString()}`}
            subtitle="Step-1 verified, ready for release"
            icon={Clock}
            colorScheme="indigo"
            badgeText="Pending Release"
          />
          <StatsCard
            title="Accruing & Invoiced (WIP)"
            value={`$${financials.unbilledAccruing.toLocaleString()}`}
            subtitle="Active deliverable milestones"
            icon={Sparkles}
            colorScheme="cyan"
          />
        </div>
      </div>

      {/* Transparent Computation Formula Explanation (PRD Formula) */}
      <div className="p-5 rounded-2xl bg-[#182234]/70 border border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Transparent Commission Computation Engine
            </h4>
            <p className="text-xs text-slate-300">
              Payout amounts are automatically computed in real-time according to your signed agreement % model:
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-indigo-500/40 text-xs font-mono text-indigo-300">
          <span className="text-amber-400">Milestone Payout</span> = Billed Milestone Amount &times; (
          <span className="text-emerald-400">Agreement %</span> / 100)
        </div>
      </div>

      {/* Deliverable Pipeline & Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-amber-400" />
            Assigned Deliverables Pipeline ({partnerTasks.length})
          </h2>
          <button
            onClick={() => setActiveTab('tasks')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            Open Full Task Board &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {partnerTasks.map((t) => {
            const proj = projects.find(p => p.id === t.projectId);
            const totalItems = t.checklists.length;
            const doneItems = t.checklists.filter(c => c.isCompleted).length;

            return (
              <div
                key={t.id}
                className="p-6 rounded-2xl bg-[#111827] border border-slate-800 hover:border-amber-500/40 transition-all space-y-4 shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white">
                        {t.title}
                      </h3>
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {proj?.name} &bull; Target Due: <span className="text-slate-300 font-medium">{t.dueDate}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectTask(t)}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors shrink-0"
                  >
                    View
                  </button>
                </div>

                <p className="text-xs text-slate-300 bg-[#182234]/60 p-3 rounded-xl border border-slate-800">
                  {t.description}
                </p>

                {/* Checklist Execution */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                      Milestone Deliverable Checklist ({doneItems}/{totalItems})
                    </span>
                    <span className="font-mono text-amber-400 font-semibold text-[11px]">
                      {totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0}%
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {t.checklists.map((c) => (
                      <label
                        key={c.id}
                        className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all ${
                          c.isCompleted
                            ? 'bg-emerald-950/20 text-slate-400 line-through'
                            : 'bg-[#182234] text-slate-200 hover:bg-[#202d44]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={c.isCompleted}
                          onChange={() => toggleChecklistItem(t.id, c.id)}
                          className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900 w-4 h-4"
                        />
                        <span className="text-xs select-none">
                          {c.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Existing Deliverables */}
                {t.deliverables && t.deliverables.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Submitted Deliverables:
                    </span>
                    {t.deliverables.map((d, i) => (
                      <a
                        key={i}
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-1.5 underline underline-offset-2"
                      >
                        <ExternalLink className="w-3 h-3 text-indigo-400" />
                        {d.title} ({d.type})
                      </a>
                    ))}
                  </div>
                )}

                {/* Deliverable Action Buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                  <button
                    onClick={() => onOpenSubmitDeliverable(t)}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit PR / Asset Link
                  </button>

                  {t.status === 'PENDING_REVIEW' && (
                    <span className="text-xs text-amber-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" /> Under PM Review
                    </span>
                  )}
                  {t.status === 'COMPLETED' && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Milestone Completed
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
