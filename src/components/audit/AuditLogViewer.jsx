import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RoleBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle2,
  Sparkles,
  Lock,
  User,
  Building,
  Activity,
  Globe,
  Monitor
} from 'lucide-react';

export const AuditLogViewer = () => {
  const { getScopedAuditLogs, isSuperAdmin, isPM, isPartner, isOnsiteMember, currentUser } = useApp();

  const [selectedLogForDetails, setSelectedLogForDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const scopedLogs = getScopedAuditLogs();

  const filteredLogs = scopedLogs.filter((log) => {
    const matchesSearch = (log.itemText || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.actorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.taskTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.actionType === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <History className="w-6 h-6 text-indigo-400" />
              Immutable Audit Trail & System Event Ledger
            </h1>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase font-bold">
              Append-Only (WORM)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isSuperAdmin()
              ? 'Global cryptographic audit log capturing every state change, IP, user-agent, and state delta with millisecond timestamp.'
              : isPM()
              ? 'Project-scoped audit stream for deliverables, checklists, and sprint transitions.'
              : 'Personal activity log tracking your interactions and checklist completions.'}
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by actor, task, UUIDv4..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Action Types</option>
            <option value="ITEM_CHECKED">ITEM_CHECKED</option>
            <option value="ITEM_UNCHECKED">ITEM_UNCHECKED</option>
            <option value="STATUS_CHANGED">STATUS_CHANGED</option>
            <option value="PM_REASSIGNED">PM_REASSIGNED</option>
            <option value="CONTRACTOR_ONBOARDED">CONTRACTOR_ONBOARDED</option>
            <option value="PAYOUT_VERIFIED">PAYOUT_VERIFIED</option>
            <option value="PAYOUT_DISBURSED">PAYOUT_DISBURSED</option>
            <option value="DELIVERABLE_SUBMITTED">DELIVERABLE_SUBMITTED</option>
            <option value="BLOCKED">BLOCKED</option>
            <option value="CREATED">CREATED</option>
          </select>

          <span className="text-xs font-mono text-slate-400">
            {filteredLogs.length} Events
          </span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-[#111827] border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#182234]/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Context / Project</th>
                <th className="py-3 px-4">Event Description</th>
                <th className="py-3 px-4">Client IP</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500 font-sans">
                    No matching audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-[#182234]/50 transition-colors">
                      {/* UUID */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        <span className="text-indigo-400" title={log.id}>
                          {log.id.substring(0, 8)}...
                        </span>
                      </td>

                      {/* Action Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold">
                          {log.actionType}
                        </span>
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-sans">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs">{log.actorName}</span>
                          <RoleBadge role={log.actorRole} />
                        </div>
                      </td>

                      {/* Context */}
                      <td className="py-3.5 px-4 max-w-xs font-sans truncate text-slate-300">
                        {log.projectName || 'System'}
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 max-w-sm font-sans text-slate-200">
                        <span className="line-clamp-2">{log.itemText || log.actionType}</span>
                      </td>

                      {/* IP */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {log.clientIp}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-slate-400 text-[10px] whitespace-nowrap">
                        {log.timestamp}
                      </td>

                      {/* Details Button */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-sans">
                        <button
                          onClick={() => setSelectedLogForDetails(log)}
                          className="px-3 py-1.5 rounded-xl bg-[#182234] hover:bg-indigo-600 text-indigo-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Event Details Modal */}
      {selectedLogForDetails && (
        <AuditDetailsModal
          isOpen={!!selectedLogForDetails}
          onClose={() => setSelectedLogForDetails(null)}
          log={selectedLogForDetails}
        />
      )}

    </div>
  );
};

// Clean Human-Readable Audit Event Details Modal
const AuditDetailsModal = ({ isOpen, onClose, log }) => {
  const [showRawPayload, setShowRawPayload] = useState(false);

  if (!log) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Audit Event Details"
      subtitle={`Event UUID: ${log.id} • ${log.timestamp}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        
        {/* Event Summary Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-[#182234] border border-indigo-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold shadow-sm">
              {log.actionType}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {log.timestamp}
            </span>
          </div>
          <h3 className="text-sm font-bold text-white leading-relaxed">
            {log.itemText || `Recorded ${log.actionType} event in system.`}
          </h3>
        </div>

        {/* Actor & Execution Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          <div className="p-3.5 rounded-xl bg-[#182234] border border-slate-700/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-indigo-400" /> Executed By
            </div>
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs font-bold text-white">{log.actorName}</p>
                <p className="text-[10px] text-slate-400 font-mono">ID: {log.actorId || 'system'}</p>
              </div>
              <RoleBadge role={log.actorRole} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#182234] border border-slate-700/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
              <Building className="w-3.5 h-3.5 text-emerald-400" /> Context & Project
            </div>
            <div className="pt-1">
              <p className="text-xs font-bold text-white">{log.projectName || 'Global System'}</p>
              {log.taskTitle && (
                <p className="text-[11px] text-indigo-300 truncate">Task: {log.taskTitle}</p>
              )}
            </div>
          </div>

        </div>

        {/* Network & Device Provenance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#182234] border border-slate-700/80">
            <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-400" /> Client IP Address
            </span>
            <span className="font-mono text-white font-bold">{log.clientIp}</span>
          </div>

          <div className="sm:col-span-2 p-3 rounded-xl bg-[#182234] border border-slate-700/80">
            <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
              <Monitor className="w-3 h-3 text-slate-400" /> User Agent / Browser Runtime
            </span>
            <span className="font-mono text-slate-300 text-[11px] truncate block">{log.userAgent}</span>
          </div>
        </div>

        {/* State Mutation Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-400" /> State Transition Summary
            </span>

            <button
              onClick={() => setShowRawPayload(!showRawPayload)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline"
            >
              {showRawPayload ? 'Show Human Summary' : 'View Raw JSON Payload'}
            </button>
          </div>

          {!showRawPayload ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Previous State Card */}
              <div className="p-3.5 rounded-xl bg-[#182234] border border-slate-700/80 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" /> State Before Action
                </span>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-sans">
                  {log.previousState ? (
                    <div className="space-y-1">
                      {Object.entries(log.previousState).map(([k, v]) => (
                        <div key={k} className="flex items-start justify-between gap-2 text-[11px]">
                          <span className="text-slate-400 font-mono">{k}:</span>
                          <span className="font-medium text-slate-200 truncate max-w-[200px]">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500 italic text-[11px]">Initial State / None</span>
                  )}
                </div>
              </div>

              {/* Mutated State Card */}
              <div className="p-3.5 rounded-xl bg-[#182234] border border-slate-700/80 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> State After Action
                </span>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-sans">
                  {log.newState ? (
                    <div className="space-y-1">
                      {Object.entries(log.newState).slice(0, 6).map(([k, v]) => (
                        <div key={k} className="flex items-start justify-between gap-2 text-[11px]">
                          <span className="text-slate-400 font-mono">{k}:</span>
                          <span className="font-medium text-emerald-300 truncate max-w-[200px]">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500 italic text-[11px]">Deleted / Void</span>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <pre className="p-3 rounded-xl bg-slate-950 border border-rose-500/20 text-[11px] font-mono text-rose-200 overflow-x-auto max-h-48 custom-scrollbar">
                {JSON.stringify(log.previousState || { state: 'NULL / INITIAL' }, null, 2)}
              </pre>
              <pre className="p-3 rounded-xl bg-slate-950 border border-emerald-500/20 text-[11px] font-mono text-emerald-200 overflow-x-auto max-h-48 custom-scrollbar">
                {JSON.stringify(log.newState || { state: 'VOID' }, null, 2)}
              </pre>
            </div>
          )}

        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Close Details
          </button>
        </div>

      </div>
    </Modal>
  );
};
