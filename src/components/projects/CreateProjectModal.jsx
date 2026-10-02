import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Plus, Trash2, Milestone, DollarSign } from 'lucide-react';

export const CreateProjectModal = ({ isOpen, onClose }) => {
  const { createProject, users } = useApp();

  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [description, setDescription] = useState('');
  const [totalContractValue, setTotalContractValue] = useState(75000);
  const [directExpenses, setDirectExpenses] = useState(3000);
  const [priority, setPriority] = useState('High');
  const [targetDeliveryDate, setTargetDeliveryDate] = useState('2026-12-31');
  const [projectManagerId, setProjectManagerId] = useState('usr-pm');

  // Milestone tranches builder
  const [milestones, setMilestones] = useState([
    { id: 'ms-new-1', title: 'Milestone 1: Core Architecture & Setup', trancheAmount: 30000, dueDate: '2026-10-31', status: 'IN_PROGRESS', billedAmount: 0, isBilledToClient: false },
    { id: 'ms-new-2', title: 'Milestone 2: Feature Engine & API Gateway', trancheAmount: 25000, dueDate: '2026-11-30', status: 'PLANNING', billedAmount: 0, isBilledToClient: false },
    { id: 'ms-new-3', title: 'Milestone 3: Production Rollout & Security Signoff', trancheAmount: 20000, dueDate: '2026-12-31', status: 'PLANNING', billedAmount: 0, isBilledToClient: false },
  ]);

  const [newMsTitle, setNewMsTitle] = useState('');
  const [newMsAmount, setNewMsAmount] = useState(15000);
  const [newMsDate, setNewMsDate] = useState('2026-12-15');

  const handleAddMilestone = () => {
    if (!newMsTitle.trim()) return;
    setMilestones([
      ...milestones,
      {
        id: `ms-${Date.now()}`,
        title: newMsTitle.trim(),
        trancheAmount: Number(newMsAmount) || 10000,
        dueDate: newMsDate,
        status: 'PLANNING',
        billedAmount: 0,
        isBilledToClient: false
      }
    ]);
    setNewMsTitle('');
  };

  const handleRemoveMilestone = (idx) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !clientName.trim()) return;

    createProject({
      name: name.trim(),
      clientName: clientName.trim(),
      clientContact: clientContact.trim(),
      description: description.trim(),
      totalContractValue: Number(totalContractValue) || 50000,
      directExpenses: Number(directExpenses) || 0,
      priority,
      startDate: new Date().toISOString().split('T')[0],
      targetDeliveryDate,
      projectManagerId,
      milestones,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Provision New Client Project"
      subtitle="Define commercial contract value, target delivery roadmap, and discrete milestone tranches."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Core Cloud Mesh"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Client Organization *
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Apex Global Bank"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Total Contract Value (USD) *
            </label>
            <input
              type="number"
              value={totalContractValue}
              onChange={(e) => setTotalContractValue(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Direct Expenses (USD)
            </label>
            <input
              type="number"
              value={directExpenses}
              onChange={(e) => setDirectExpenses(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Project Manager
            </label>
            <select
              value={projectManagerId}
              onChange={(e) => setProjectManagerId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {users.filter(u => u.role === 'PROJECT_MANAGER' || u.role === 'SUPER_ADMIN').map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Target Delivery Date
            </label>
            <input
              type="date"
              value={targetDeliveryDate}
              onChange={(e) => setTargetDeliveryDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Project Scope & Objective
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="High-level engineering deliverable goals..."
            className="w-full px-3.5 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Milestone Tranches Builder */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Discrete Milestone Tranches ({milestones.length})
          </label>

          <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#182234] border border-slate-700 text-xs text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <Milestone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="font-semibold">{m.title}</span>
                  <span className="text-emerald-400 font-mono font-bold">${m.trancheAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{m.dueDate}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(idx)}
                    className="text-slate-400 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input
              type="text"
              value={newMsTitle}
              onChange={(e) => setNewMsTitle(e.target.value)}
              placeholder="Milestone title..."
              className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
            />
            <input
              type="number"
              value={newMsAmount}
              onChange={(e) => setNewMsAmount(e.target.value)}
              placeholder="Amount ($)"
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
            />
            <button
              type="button"
              onClick={handleAddMilestone}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              + Add Tranche
            </button>
          </div>
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
            Provision Project
          </button>
        </div>
      </form>
    </Modal>
  );
};
