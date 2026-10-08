import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Percent, ShieldCheck, Sparkles, Building } from 'lucide-react';

export const ContractorAgreementModal = ({ isOpen, onClose, contractor }) => {
  const { projects, updateContractorAgreement, users } = useApp();

  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [model, setModel] = useState('PROJECT_DIRECT_SHARE');
  const [sharePercentage, setSharePercentage] = useState(15);
  const [notes, setNotes] = useState('Commission allocation agreed on master service agreement');

  if (!contractor) return null;

  const user = users.find((u) => u.id === contractor.userId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!projectId) return;

    updateContractorAgreement(contractor.userId, projectId, {
      model,
      sharePercentage: Number(sharePercentage) || 10,
      notes: notes.trim(),
      contractSignedDate: new Date().toISOString().split('T')[0]
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Project Partnership Model"
      subtitle={`Set up legal commission terms and percentage allocation for ${user?.name || contractor.legalName}.`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Target Project *
          </label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            required
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Client: {p.clientName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Partnership Agreement Model *
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="PROJECT_DIRECT_SHARE">
              Project Direct Share (Direct % tied to total project value)
            </option>
            <option value="GROSS_CONTRACT_SHARE">
              Gross Contract Share (% calculated against total client invoice)
            </option>
            <option value="NET_REVENUE_SHARE">
              Net Revenue Share (% calculated after direct project expenses)
            </option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Contractor Agreement Share (%) *
          </label>
          <div className="relative">
            <input
              type="number"
              value={sharePercentage}
              onChange={(e) => setSharePercentage(e.target.value)}
              step="0.5"
              min="1"
              max="90"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
              required
            />
            <Percent className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Agreement Notes & Governance Terms
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. 15% direct allocation for project engineering deliverables..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>
            Changes will automatically recompute contractor commission ledgers and record an immutable audit trail entry.
          </span>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
          >
            Save Agreement Terms
          </button>
        </div>
      </form>
    </Modal>
  );
};
