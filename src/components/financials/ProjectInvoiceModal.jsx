import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import {
  FileText,
  DollarSign,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export const ProjectInvoiceModal = ({ isOpen, onClose, project, onSuccess }) => {
  const { addClientInvoice, clientInvoices = [], selectedMonth, setSelectedMonth } = useApp();

  const [invoiceNumber, setInvoiceNumber] = useState(
    () => `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [amount, setAmount] = useState('');
  
  const defaultMonth = (selectedMonth && selectedMonth !== 'ALL') ? selectedMonth : '2026-10';
  const [issueDate, setIssueDate] = useState(`${defaultMonth}-15`);
  const [dueDate, setDueDate] = useState(`${defaultMonth}-30`);
  const [status, setStatus] = useState('PENDING');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate Cap Metrics for this specific project
  const tcv = Number(project?.totalContractValue) || 0;
  
  const alreadyInvoiced = useMemo(() => {
    if (!project?.id) return 0;
    return (clientInvoices || [])
      .filter(i => i.projectId === project.id)
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  }, [clientInvoices, project?.id]);

  const remainingCap = Math.max(0, tcv - alreadyInvoiced);
  const numAmount = Number(amount) || 0;
  const isExceedingCap = tcv > 0 && numAmount > remainingCap;
  const isFullyInvoiced = tcv > 0 && remainingCap === 0;
  const percentInvoiced = tcv > 0 ? Math.round((alreadyInvoiced / tcv) * 100) : 0;
  const projectedPercent = tcv > 0 ? Math.min(100, Math.round(((alreadyInvoiced + numAmount) / tcv) * 100)) : 0;

  if (!project) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!amount || numAmount <= 0) {
      setErrorMsg('Please enter a valid positive invoice amount.');
      return;
    }

    if (tcv > 0 && numAmount > remainingCap) {
      setErrorMsg(
        `Total invoice of $${numAmount.toLocaleString()} exceeds the remaining project cap of $${remainingCap.toLocaleString()}. Total project contract value is $${tcv.toLocaleString()}.`
      );
      return;
    }

    const res = addClientInvoice({
      projectId: project.id,
      projectName: project.name,
      clientName: project.clientName || 'Client Organization',
      invoiceNumber: invoiceNumber.trim() || `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      amount: numAmount,
      issueDate,
      dueDate,
      status,
      notes: notes.trim() || 'Milestone project delivery invoice.'
    });

    if (res && res.success === false) {
      setErrorMsg(res.error || 'Failed to record invoice.');
      return;
    }

    // Auto-switch month filter if needed so the invoice is instantly visible
    if (issueDate && selectedMonth !== 'ALL' && !issueDate.startsWith(selectedMonth)) {
      setSelectedMonth(issueDate.slice(0, 7));
    }

    if (onSuccess) {
      onSuccess(res?.invoice);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Issue Invoice: ${project.name}`}
      subtitle={`Client: ${project.clientName || 'Client Organization'} • Contract Governance & Billing`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Contract Limit Governance Card */}
        <div className={`p-4 rounded-2xl border transition-all shadow-sm ${
          isExceedingCap
            ? 'bg-rose-950/20 border-rose-800/60'
            : isFullyInvoiced
            ? 'bg-amber-950/20 border-amber-800/60'
            : 'bg-[#151f32] border-indigo-500/30'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Project Contract Limit</span>
                <span className="text-[11px] text-slate-400">Total Contract Value (TCV)</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">TCV Cap</span>
              <span className="font-mono text-sm font-extrabold text-indigo-300">
                ${tcv.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="py-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-medium">
              <span className="text-slate-300">
                Invoiced: <strong className="text-white font-mono">{percentInvoiced}%</strong>
              </span>
              <span className="font-mono text-[11px]">
                {remainingCap > 0 ? (
                  <span className="text-emerald-400 font-bold">${remainingCap.toLocaleString()} remaining allowance</span>
                ) : (
                  <span className="text-amber-400 font-bold">100% Contract Cap Reached</span>
                )}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isExceedingCap
                    ? 'bg-rose-500'
                    : percentInvoiced >= 100
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, numAmount > 0 ? projectedPercent : percentInvoiced))}%` }}
              />
            </div>
          </div>

          {/* Metrics Dual Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-[#182234] border border-slate-700/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Already Invoiced</span>
              <div className="text-sm font-extrabold font-mono text-white mt-0.5">
                ${alreadyInvoiced.toLocaleString()}
              </div>
            </div>
            <div className={`p-3 rounded-xl border ${
              remainingCap > 0 ? 'bg-emerald-950/25 border-emerald-800/60' : 'bg-amber-950/25 border-amber-800/60'
            }`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                remainingCap > 0 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                Remaining Cap
              </span>
              <div className={`text-sm font-extrabold font-mono mt-0.5 ${
                remainingCap > 0 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                ${remainingCap.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Number & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Invoice Number *
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="e.g. INV-2026-101"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500 font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Payment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
            >
              <option value="PENDING">Pending Payment (AR)</option>
              <option value="PARTIAL">Partial Payment</option>
              <option value="PAID">Paid / Cleared</option>
            </select>
          </div>
        </div>

        {/* Invoice Amount */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Invoice Amount (USD) *
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              min="0.01"
              step="any"
              max={tcv > 0 ? remainingCap : undefined}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder={remainingCap > 0 ? `e.g. 12001 (Max: $${remainingCap.toLocaleString()})` : "Cap reached"}
              disabled={isFullyInvoiced}
              className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#182234] border text-sm text-white font-mono font-bold focus:outline-none transition-colors ${
                isExceedingCap
                  ? 'border-rose-500 text-rose-300 focus:border-rose-500'
                  : 'border-slate-700 focus:border-emerald-500'
              }`}
              required
            />
          </div>

          {/* Validation Feedback */}
          {isExceedingCap && (
            <div className="mt-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                Amount exceeds remaining cap by <strong>${(numAmount - remainingCap).toLocaleString()}</strong>. Max allowed: <strong>${remainingCap.toLocaleString()}</strong>.
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="mt-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Issue Date *
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Due Date
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Deliverable Notes / Statement Details
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Milestone 1 Architecture settlement & frontend delivery"
            rows="2"
            className="w-full px-3.5 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isExceedingCap || isFullyInvoiced}
            className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
              isExceedingCap || isFullyInvoiced
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> Save & Record Invoice
          </button>
        </div>
      </form>
    </Modal>
  );
};
