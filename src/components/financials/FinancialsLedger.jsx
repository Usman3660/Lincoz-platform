import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../common/StatsCard';
import { StatusBadge, RoleBadge } from '../common/Badge';
import { DisbursementModal } from './DisbursementModal';
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  FileCheck2,
  Lock,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const FinancialsLedger = ({ onOpenDisbursement }) => {
  const {
    getScopedFinancials,
    approvePayoutStep1,
    isSuperAdmin,
    isPM,
    isPartner,
    isOnsiteMember,
    currentUser
  } = useApp();

  const [selectedPayoutForSignoff, setSelectedPayoutForSignoff] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const financials = getScopedFinancials();

  if (!financials.roleAllowed) {
    return (
      <div className="p-12 rounded-3xl bg-[#111827] border border-slate-800 text-center space-y-4 max-w-lg mx-auto my-12 animate-fadeIn">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-white">Access Restricted by RBAC Policy</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          {financials.message || 'Financials and contractor disbursement ledgers are restricted from this role.'}
        </p>
      </div>
    );
  }

  const ledgerItems = (financials.ledger || []).filter((item) => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            {isPartner() ? 'My Milestone Earnings Ledger' : 'Financial Ledger & 2-Step Disbursements'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isPartner()
              ? 'Real-time computation of your milestone percentage commissions and disbursement records.'
              : 'Governance over Total Contract Values (TCV), Gross Invoiced, Accounts Receivable, and contractor liabilities.'}
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Ledger States</option>
            <option value="ACCRUING">Accruing (WIP)</option>
            <option value="INVOICED">Invoiced to Client</option>
            <option value="APPROVED">Approved for Payout (Step-1 Done)</option>
            <option value="DISBURSED">Disbursed (Step-2 Executed)</option>
          </select>
        </div>
      </div>

      {/* Metrics Cards */}
      {isPartner() ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Earned"
            value={`$${financials.totalEarned.toLocaleString()}`}
            subtitle="Across all project milestones"
            icon={DollarSign}
            colorScheme="amber"
          />
          <StatsCard
            title="Funds Disbursed"
            value={`$${financials.totalDisbursed.toLocaleString()}`}
            subtitle="Processed to default payout channel"
            icon={CheckCircle2}
            colorScheme="emerald"
            badgeText="Paid"
          />
          <StatsCard
            title="Approved (Ready for Release)"
            value={`$${financials.pendingDisbursement.toLocaleString()}`}
            subtitle="Awaiting Super Admin disbursement"
            icon={FileCheck2}
            colorScheme="indigo"
          />
          <StatsCard
            title="Accruing (WIP)"
            value={`$${financials.unbilledAccruing.toLocaleString()}`}
            subtitle="Active deliverable milestones"
            icon={Sparkles}
            colorScheme="cyan"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Contract Value (TCV)"
            value={`$${financials.totalContractValue.toLocaleString()}`}
            subtitle="Scoped client portfolios"
            icon={DollarSign}
            colorScheme="indigo"
          />
          <StatsCard
            title="Gross Invoiced"
            value={`$${financials.grossInvoiced.toLocaleString()}`}
            subtitle={`AR: $${financials.accountsReceivable.toLocaleString()}`}
            icon={TrendingUp}
            colorScheme="emerald"
          />
          <StatsCard
            title="Accrued Contractor Liabilities"
            value={`$${financials.accruedLiabilities.toLocaleString()}`}
            subtitle="Commissions pending release"
            icon={AlertCircle}
            colorScheme="amber"
          />
          <StatsCard
            title="Total Disbursed"
            value={`$${financials.totalDisbursed.toLocaleString()}`}
            subtitle="Executed 2-step disbursements"
            icon={CheckCircle2}
            colorScheme="cyan"
          />
        </div>
      )}

      {/* 2-Step Authorization Explanation Banner */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              2-Step Payout Authorization Lifecycle
            </h4>
            <p className="text-slate-400 mt-0.5">
              <strong>Step 1 (PM / Admin):</strong> Milestone criteria & percentage calculation verification &rarr;{' '}
              <strong>Step 2 (Super Admin):</strong> Cryptographic MFA sign-off and funds release.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 bg-[#182234] px-3 py-1.5 rounded-xl border border-slate-700/60">
          <span className="text-teal-400">Accruing</span> &rarr; <span className="text-blue-400">Invoiced</span> &rarr; <span className="text-amber-400">Approved</span> &rarr; <span className="text-emerald-400 font-bold">Disbursed</span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl bg-[#111827] border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#182234]/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Contractor & Entity</th>
                <th className="py-3.5 px-4">Project & Milestone</th>
                <th className="py-3.5 px-4">Agreement Model</th>
                <th className="py-3.5 px-4">Billed Amount</th>
                <th className="py-3.5 px-4">Computed Payout</th>
                <th className="py-3.5 px-4">State</th>
                <th className="py-3.5 px-4 text-right">Disbursement Authorization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {ledgerItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No ledger records match the selected filter.
                  </td>
                </tr>
              ) : (
                ledgerItems.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-[#182234]/50 transition-colors">
                      
                      {/* Contractor */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div>
                          <span className="font-bold text-white block">
                            {item.contractorName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.disbursementChannel}
                          </span>
                        </div>
                      </td>

                      {/* Project & Milestone */}
                      <td className="py-4 px-4 max-w-xs">
                        <span className="font-semibold text-indigo-300 block truncate">
                          {item.projectName}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {item.milestoneTitle}
                        </span>
                      </td>

                      {/* Model & % */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="text-[11px] text-slate-300 block font-medium">
                          {item.agreementModel.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">
                          {item.agreementPercentage}% Rate
                        </span>
                      </td>

                      {/* Billed */}
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-slate-300">
                        ${item.milestoneBilledAmount.toLocaleString()}
                      </td>

                      {/* Computed Payout */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="text-sm font-extrabold text-emerald-400 font-mono">
                          ${item.calculatedPayoutAmount.toLocaleString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Action / 2-Step Authorization */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        {item.status === 'INVOICED' && (isSuperAdmin() || isPM()) && (
                          <button
                            onClick={() => approvePayoutStep1(item.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
                          >
                            Verify Step 1
                          </button>
                        )}

                        {item.status === 'APPROVED' && isSuperAdmin() && (
                          <button
                            onClick={() => setSelectedPayoutForSignoff(item)}
                            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all flex items-center gap-1 ml-auto"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" /> Step 2 Sign-Off
                          </button>
                        )}

                        {item.status === 'APPROVED' && !isSuperAdmin() && (
                          <span className="text-[11px] text-amber-400/90 font-mono italic">
                            Awaiting Super Admin Sign-Off
                          </span>
                        )}

                        {item.status === 'DISBURSED' && (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Disbursed
                            </span>
                            {item.disbursementRef && (
                              <span className="text-[10px] text-slate-500 block font-mono">
                                Ref: {item.disbursementRef}
                              </span>
                            )}
                          </div>
                        )}

                        {item.status === 'ACCRUING' && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            Milestone in progress
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-Step Disbursement Modal */}
      {selectedPayoutForSignoff && (
        <DisbursementModal
          isOpen={!!selectedPayoutForSignoff}
          onClose={() => setSelectedPayoutForSignoff(null)}
          payoutItem={selectedPayoutForSignoff}
        />
      )}

    </div>
  );
};
