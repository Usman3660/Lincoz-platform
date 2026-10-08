import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../common/StatsCard';
import { StatusBadge, PriorityBadge, RoleBadge } from '../common/Badge';
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  FolderKanban,
  Users,
  ArrowRight,
  Clock,
  Sparkles,
  Lock,
  History,
  Briefcase
} from 'lucide-react';

export const SuperAdminDashboard = ({ setActiveTab, onOpenDisbursementModal, onSelectTask }) => {
  const {
    users = [],
    projects = [],
    tasks = [],
    payoutLedger = [],
    contractors = [],
    auditLogs = [],
    getScopedFinancials,
    selectedMonth,
    setSelectedMonth,
    availableMonths = []
  } = useApp();

  const financials = getScopedFinancials() || {
    totalContractValue: 0,
    grossInvoiced: 0,
    accountsReceivable: 0,
    directExpenses: 0,
    accruedLiabilities: 0,
    totalDisbursed: 0,
    ledger: []
  };

  const selectedMonthObj = availableMonths.find(m => m.id === selectedMonth) || { label: 'Current Month' };

  const pendingStep2Disbursements = payoutLedger.filter(p => p.status === 'APPROVED');
  const activeProjectsCount = projects.filter(p => p.status === 'ACTIVE').length;
  const blockedTasks = tasks.filter(t => t.isBlocked);
  const pendingReviews = tasks.filter(t => t.status === 'PENDING_REVIEW');

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner / Hero */}
      <div className="dashboard-hero-banner super-admin-banner relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-[#111827] border border-indigo-500/20 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Executive Governance & Ownership Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Platform Master Ledger & Operations
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Super Admin full-scope visibility: monitor live Total Contract Values (TCV), accounts receivable, contractor liabilities, and authorize 2-step financial disbursements on a monthly basis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Global Month Selector */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#182234] border border-indigo-500/40 shadow-inner">
              <DollarSign className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                {availableMonths.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#182234] text-white">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setActiveTab('financials')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
            >
              <DollarSign className="w-4 h-4" /> Global Financials
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
            >
              <History className="w-4 h-4" /> Audit Trail ({auditLogs.length})
            </button>
          </div>
        </div>
      </div>

      {/* Global Financial Metrics (PRD Section 3.1) */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Financial Overview • {selectedMonthObj.label}
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Direct Expenses Deducted: ${(financials.directExpenses || 0).toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Contract Value (TCV)"
            value={`$${(financials.totalContractValue || 0).toLocaleString()}`}
            subtitle="Whole client project portfolios"
            icon={DollarSign}
            colorScheme="indigo"
          />
          <StatsCard
            title="Monthly Invoiced"
            value={`$${(financials.grossInvoiced || 0).toLocaleString()}`}
            subtitle={`$${(financials.accountsReceivable || 0).toLocaleString()} AR in ${selectedMonthObj.label}`}
            icon={TrendingUp}
            colorScheme="emerald"
          />
          <StatsCard
            title="Accrued Liabilities"
            value={`$${(financials.accruedLiabilities || 0).toLocaleString()}`}
            subtitle={`Staff/Source shares in ${selectedMonthObj.label}`}
            icon={AlertCircle}
            colorScheme="amber"
            badgeText={`${pendingStep2Disbursements.length} Pending Sign-off`}
          />
          <StatsCard
            title="Disbursed / Paid"
            value={`$${(financials.totalDisbursed || 0).toLocaleString()}`}
            subtitle={`Executed in ${selectedMonthObj.label}`}
            icon={CheckCircle2}
            colorScheme="cyan"
          />
        </div>
      </div>

      {/* Actionable Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Pending 2-Step Disbursements & Active Projects */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pending 2-Step Disbursements Authorization Card */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-amber-500/30 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    2-Step Payout Authorization Queue (Super Admin Required)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Step 1 verified by Project Manager. Awaiting Super Admin cryptographic sign-off.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                {pendingStep2Disbursements.length} Action Needed
              </span>
            </div>

            {pendingStep2Disbursements.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-[#182234]/40 rounded-xl border border-slate-800">
                All contractor payouts have been authorized and disbursed.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingStep2Disbursements.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-[#182234] border border-slate-700/80 hover:border-amber-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {item.contractorName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {item.agreementPercentage}% ({item.agreementModel.replace(/_/g, ' ')})
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">
                        {item.projectName} &bull; {item.deliverableTitle || 'Project Share'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Channel: <span className="text-slate-300 font-mono">{item.disbursementChannel}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Payout Amount</span>
                        <span className="text-base font-extrabold text-emerald-400 font-mono">
                          ${(item.calculatedPayoutAmount || 0).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => onOpenDisbursementModal(item)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Authorize & Sign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Client Projects Overview */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                Active Client Portfolios & TCV Progress
              </h3>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                View All Projects <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {projects.map((proj) => {
                const percentInvoiced = Math.round(((proj.grossInvoiced || 0) / (proj.totalContractValue || 1)) * 100);
                return (
                  <div
                    key={proj.id}
                    className="p-4 rounded-xl bg-[#182234]/70 border border-slate-800 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">
                            {proj.name}
                          </h4>
                          <PriorityBadge priority={proj.priority} />
                          <StatusBadge status={proj.status} />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Client: {proj.clientName} &bull; Target: {proj.targetDeliveryDate}
                        </p>
                        {(() => {
                          const pm = users.find(u => u.id === proj.projectManagerId);
                          return (
                            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-indigo-300">
                              <span className="text-slate-400">PM:</span>
                              {pm?.avatar && (
                                <img src={pm.avatar} alt={pm.name} className="w-4 h-4 rounded-full object-cover" />
                              )}
                              <span className="font-semibold">{pm?.name || 'Unassigned'}</span>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase text-slate-400 block font-mono">TCV</span>
                        <span className="text-xs font-bold text-indigo-300 font-mono">
                          ${(proj.totalContractValue || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span>Invoicing & Financial Progress</span>
                        <span className="font-mono text-emerald-400 font-semibold">
                          ${(proj.grossInvoiced || 0).toLocaleString()} / ${(proj.totalContractValue || 0).toLocaleString()} ({percentInvoiced}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${percentInvoiced}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Immutable Audit Stream */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              Live Immutable Audit Trail
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Append-Only
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Real-time capture of all checklist toggles, status changes, and payout authorizations down to millisecond precision.
          </p>

          <div className="space-y-3 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
            {auditLogs.slice(0, 7).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[#182234]/60 border border-slate-800/80 text-xs space-y-1.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] truncate">
                    {log.actorName}
                  </span>
                  <RoleBadge role={log.actorRole} />
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {log.itemText || log.actionType}
                </p>
                {log.taskTitle && (
                  <p className="text-[10px] text-indigo-300/80 font-mono truncate">
                    Task: {log.taskTitle}
                  </p>
                )}
                <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>IP: {log.clientIp}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveTab('audit')}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all text-center block"
          >
            Inspect Global Audit Diffs &rarr;
          </button>
        </div>

      </div>

    </div>
  );
};
