import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { ShieldCheck, CheckCircle2, Lock, Key, CreditCard, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { secureRandomString } from '../../utils/cryptoUtils';

export const DisbursementModal = ({ isOpen, onClose, payoutItem }) => {
  const { authorizeDisbursementStep2, currentUser } = useApp();

  const [customRef, setCustomRef] = useState(`TX-WIRE-${secureRandomString(6).toUpperCase()}`);
  const [authPin, setAuthPin] = useState('7792');
  const [confirmed, setConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!payoutItem) return null;

  const handleAuthorize = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const success = authorizeDisbursementStep2(payoutItem.id, customRef, authPin, payoutItem);
      setIsProcessing(false);
      if (success) {
        void confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        }).catch(() => {});
        onClose();
      }
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Step 2: Record Payment Settlement"
      subtitle="Record external bank wire, ACH, or check settlement reference into the company ledger."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleAuthorize} className="space-y-5">
        
        {/* Verification Summary Card */}
        <div className="p-4 rounded-2xl bg-[#182234] border border-amber-500/40 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                Payee / Recipient
              </span>
              <h4 className="text-sm font-bold text-white">{payoutItem.contractorName}</h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Settlement Amount</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono"> Rs {payoutItem.calculatedPayoutAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Project & Deliverable</span>
              <span className="text-white font-medium">{payoutItem.projectName}</span>
              <span className="text-slate-400 block text-[11px] truncate">{payoutItem.deliverableTitle || 'Project Deliverable'}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Settlement Channel</span>
              <span className="text-white font-medium">{payoutItem.disbursementChannel}</span>
              <span className="text-indigo-300 text-[10px] font-mono">Step 1 Verified by PM</span>
            </div>
          </div>
        </div>

        {/* Transaction Reference & Sign-off Details */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              External Settlement Reference (Bank Wire / ACH / Check No.) *
            </label>
            <input
              type="text"
              value={customRef}
              onChange={(e) => setCustomRef(e.target.value)}
              placeholder="e.g. WIRE-REF-98421 or CHK-4091"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Super Admin Authorization Passcode *
            </label>
            <div className="relative">
              <input
                type="password"
                value={authPin}
                onChange={(e) => setAuthPin(e.target.value)}
                placeholder="Enter Master Passcode"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white font-mono tracking-widest focus:outline-none focus:border-amber-500"
                required
              />
              <Key className="w-4 h-4 text-amber-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-950 w-4 h-4"
            required
          />
          <span className="text-xs text-slate-300 leading-snug select-none">
            I, <strong>{currentUser.name} (Super Admin)</strong>, confirm that the external payment of ${payoutItem.calculatedPayoutAmount.toLocaleString()} has been executed outside the platform and authorize logging this settlement into the permanent ledger.
          </span>
        </label>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!confirmed || isProcessing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-extrabold shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShieldCheck className="w-4 h-4" />
            {isProcessing ? 'Logging Record...' : 'Log & Finalize Settlement Record'}
          </button>
        </div>

      </form>
    </Modal>
  );
};
