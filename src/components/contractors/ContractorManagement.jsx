import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RoleBadge } from '../common/Badge';
import {
  Users,
  Plus,
  Shield,
  CreditCard,
  Building,
  Edit,
  Percent,
  Layers,
  Sparkles,
  FileCheck2,
  DollarSign,
  UserPlus
} from 'lucide-react';
import { ContractorAgreementModal } from './ContractorAgreementModal';
import { AddContractorModal } from './AddContractorModal';

export const ContractorManagement = () => {
  const {
    contractors,
    users,
    projects,
    isSuperAdmin,
    isPM
  } = useApp();

  const [selectedContractorForAgreement, setSelectedContractorForAgreement] = useState(null);
  const [isAddContractorOpen, setIsAddContractorOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            Contractor Profiles & Percentage Models
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure legal entities, tax classifications, default payout channels, and commission models per project.
          </p>
        </div>

        {isSuperAdmin() && (
          <button
            onClick={() => setIsAddContractorOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 shrink-0"
          >
            <UserPlus className="w-4 h-4" /> Add & Setup New Contractor
          </button>
        )}
      </div>

      {/* Model Descriptions Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
            <Percent className="w-4 h-4" /> Gross Contract Share
          </div>
          <p className="text-[11px] text-slate-300">
            Percentage calculated against the total client invoice for the project.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <Layers className="w-4 h-4" /> Net Revenue Share
          </div>
          <p className="text-[11px] text-slate-300">
            Percentage calculated after deducting defined direct project infrastructure & hardware expenses.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <Sparkles className="w-4 h-4" /> Project Direct Share
          </div>
          <p className="text-[11px] text-slate-300">
            Variable percentage tied directly to project deliverables and client billings.
          </p>
        </div>
      </div>

      {/* Contractor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {contractors.map((c) => {
          const user = users.find((u) => u.id === c.userId);

          return (
            <div
              key={c.userId}
              className="p-6 rounded-2xl bg-[#111827] border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 shadow-xl space-y-5"
            >
              {/* Profile Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'}
                    alt={user?.name || 'Contractor'}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/30"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        {user?.name || 'Partner Contractor'}
                      </h3>
                      <RoleBadge role={user?.role || 'PARTNER'} />
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      {c.legalName} &bull; {c.country}
                    </p>
                  </div>
                </div>

                {isSuperAdmin() && (
                  <button
                    onClick={() => setSelectedContractorForAgreement(c)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" /> Configure Agreements
                  </button>
                )}
              </div>

              {/* Legal & Payout Details Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#182234] border border-slate-700/80 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-400" /> Tax Classification
                  </span>
                  <span className="text-white font-medium">{c.taxClassification}</span>
                  <span className="text-[10px] text-slate-500 block font-mono">Tax ID: {c.taxId}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-emerald-400" /> Default Payout Channel
                  </span>
                  <span className="text-emerald-400 font-medium">{c.defaultPayoutChannel}</span>
                  <span className="text-[10px] text-slate-400 block font-mono truncate">{c.payoutDetails}</span>
                </div>
              </div>

              {/* Active Project Agreements */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <Percent className="w-3 h-3 text-indigo-400" /> Active Project Commission Agreements ({c.agreements?.length || 0})
                </span>

                <div className="space-y-2">
                  {c.agreements && c.agreements.map((a, idx) => {
                    const proj = projects.find((p) => p.id === a.projectId);
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#182234]/70 border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{proj?.name || a.projectId}</p>
                          <p className="text-[11px] text-indigo-300 font-mono">
                            Model: {a.model.replace(/_/g, ' ')}
                          </p>
                          {a.notes && (
                            <p className="text-[10px] text-slate-400 italic mt-0.5">{a.notes}</p>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-extrabold text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            {a.sharePercentage}% Share
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add & Setup Contractor Modal */}
      <AddContractorModal
        isOpen={isAddContractorOpen}
        onClose={() => setIsAddContractorOpen(false)}
      />

      {/* Agreement Configuration Modal */}
      {selectedContractorForAgreement && (
        <ContractorAgreementModal
          isOpen={!!selectedContractorForAgreement}
          onClose={() => setSelectedContractorForAgreement(null)}
          contractor={selectedContractorForAgreement}
        />
      )}

    </div>
  );
};
