import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { AddClientModal } from '../clients/AddClientModal';
import { DollarSign, UploadCloud, FileText, X, Lock, CheckCircle2, Link as LinkIcon } from 'lucide-react';

export const CreateProjectModal = ({ isOpen, onClose }) => {
  const { createProject, users = [], clients = [] } = useApp();
  const safeUsers = Array.isArray(users) ? users : [];
  const safeClients = Array.isArray(clients) ? clients : [];

  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [totalContractValue, setTotalContractValue] = useState(75000);
  const [priority, setPriority] = useState('High');
  const [targetDeliveryDate, setTargetDeliveryDate] = useState('2026-12-31');
  const [projectManagerId, setProjectManagerId] = useState('usr-pm');
  const [requirementDoc, setRequirementDoc] = useState(null);
  const [docUrlInput, setDocUrlInput] = useState('');
  const [docNotesInput, setDocNotesInput] = useState('');
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setName('');
    setClientName('');
    setClientContact('');
    setDescription('');
    setTotalContractValue(75000);
    setPriority('High');
    setTargetDeliveryDate('2026-12-31');
    setProjectManagerId('usr-pm');
    setRequirementDoc(null);
    setDocUrlInput('');
    setDocNotesInput('');
  };

  const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'md', 'zip'];
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
      alert('Invalid file format. Only PDF, DOC, MD, and ZIP files are allowed.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert('File size exceeds the 2MB limit. Please upload a file smaller than 2MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      let sizeStr = '';
      if (file.size < 1024) sizeStr = `${file.size} B`;
      else if (file.size < 1024 * 1024) sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      else sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      setRequirementDoc({
        name: file.name,
        size: sizeStr,
        type: file.type || 'application/octet-stream',
        dataUrl: reader.result,
        uploadedAt: new Date().toISOString()
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !clientName.trim()) return;

    let finalDoc = null;
    if (requirementDoc) {
      finalDoc = {
        ...requirementDoc,
        docUrl: docUrlInput.trim() || undefined,
        notes: docNotesInput.trim() || undefined
      };
    } else if (docUrlInput.trim()) {
      finalDoc = {
        name: 'Requirement Spec (External Link)',
        docUrl: docUrlInput.trim(),
        notes: docNotesInput.trim() || undefined,
        uploadedAt: new Date().toISOString()
      };
    }

    createProject({
      name: name.trim(),
      clientName: clientName.trim(),
      clientContact: clientContact.trim(),
      description: description.trim(),
      totalContractValue: Number(totalContractValue) || 50000,
      priority,
      startDate: new Date().toISOString().split('T')[0],
      targetDeliveryDate,
      projectManagerId,
      requirementDoc: finalDoc
    });

    resetForm();
    onClose();
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleModalClose}
        title="Provision New Client Project"
        subtitle="Define commercial contract value, target delivery roadmap, and project scope."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 font-bold mb-1">
                Project Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Core Cloud Mesh"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 font-bold mb-1">
                Client / Organization / Source *
              </label>
              <select
                value={clientName}
                onChange={(e) => {
                  if (e.target.value === '__NEW__') {
                    setIsAddClientOpen(true);
                  } else {
                    setClientName(e.target.value);
                    const selected = safeClients.find(c => c.name === e.target.value);
                    if (selected) setClientContact(`${selected.email} | ${selected.contactNumber}`);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                required
              >
                <option value="">Select a Client or Source</option>
                {safeClients.filter(c => c.category === 'CLIENT').length > 0 && (
                  <optgroup label="Corporate Clients">
                    {safeClients.filter(c => c.category === 'CLIENT').map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.country})
                      </option>
                    ))}
                  </optgroup>
                )}
                {safeClients.filter(c => c.category === 'FREELANCER').length > 0 && (
                  <optgroup label="Sources">
                    {safeClients.filter(c => c.category === 'FREELANCER').map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.percentage}% share • {c.country})
                      </option>
                    ))}
                  </optgroup>
                )}
                <option value="__NEW__">+ Add New Client / Source...</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 font-bold mb-1">
                Total Contract Value (USD) *
              </label>
              <input
                type="number"
                value={totalContractValue}
                onChange={(e) => setTotalContractValue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 font-bold mb-1">
                Project Manager
              </label>
              <select
                value={projectManagerId}
                onChange={(e) => setProjectManagerId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                {safeUsers.filter(u => u.role === 'PROJECT_MANAGER' || u.role === 'SUPER_ADMIN').map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 font-bold mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 font-bold mb-1">
                Target Delivery Date
              </label>
              <input
                type="date"
                value={targetDeliveryDate}
                onChange={(e) => setTargetDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 font-bold mb-1">
              Project Scope & Objective
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="High-level engineering deliverable goals and requirements..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Requirement Document Section */}
          <div className="p-4 rounded-2xl bg-[#182234] border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-400" /> Project Requirement Document
              </label>
              <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <Lock className="w-3 h-3" /> Visible to Admin & PM Only
              </span>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.md,.zip"
              className="hidden"
            />

            {requirementDoc ? (
              <div className="p-3 rounded-xl bg-[#0e1420] border border-indigo-500/40 flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{requirementDoc.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{requirementDoc.size} • Attached</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequirementDoc(null)}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/60 bg-[#0e1420]/50 hover:bg-[#0e1420] cursor-pointer transition-all flex flex-col items-center justify-center text-center group"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500/20 flex items-center justify-center mb-2 transition-colors">
                  <UploadCloud className="w-5 h-5 text-indigo-400" />
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-white">
                  Click to attach Requirement Document
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                  PDF, DOC, MD, ZIP (Max 2MB)
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>
                <input
                  type="url"
                  value={docUrlInput}
                  onChange={(e) => setDocUrlInput(e.target.value)}
                  placeholder="Or external URL (e.g. Google Docs / Notion PRD)"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0e1420] border border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={docNotesInput}
                  onChange={(e) => setDocNotesInput(e.target.value)}
                  placeholder="Optional document notes or version tag"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0e1420] border border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
            >
              Provision Project
            </button>
          </div>
        </form>
      </Modal>

      {isAddClientOpen && (
        <AddClientModal
          isOpen={isAddClientOpen}
          onClose={() => setIsAddClientOpen(false)}
          initialCategory="CLIENT"
        />
      )}
    </>
  );
};
