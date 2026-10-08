import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { AddClientModal } from '../clients/AddClientModal';
import { DollarSign } from 'lucide-react';

export const CreateProjectModal = ({ isOpen, onClose }) => {
  const { createProject, users, clients = [] } = useApp();

  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [totalContractValue, setTotalContractValue] = useState(75000);
  const [priority, setPriority] = useState('High');
  const [targetDeliveryDate, setTargetDeliveryDate] = useState('2026-12-31');
  const [projectManagerId, setProjectManagerId] = useState('usr-pm');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !clientName.trim()) return;

    createProject({
      name: name.trim(),
      clientName: clientName.trim(),
      clientContact: clientContact.trim(),
      description: description.trim(),
      totalContractValue: Number(totalContractValue) || 50000,
      priority,
      startDate: new Date().toISOString().split('T')[0],
      targetDeliveryDate,
      projectManagerId
    });

    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Provision New Client Project"
        subtitle="Define commercial contract value, target delivery roadmap, and project scope."
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
                Client / Organization / Source *
              </label>
              <select
                value={clientName}
                onChange={(e) => {
                  if (e.target.value === '__NEW__') {
                    setIsAddClientOpen(true);
                  } else {
                    setClientName(e.target.value);
                    const selected = clients.find(c => c.name === e.target.value);
                    if (selected) setClientContact(`${selected.email} | ${selected.contactNumber}`);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              >
                <option value="">Select a Client or Source</option>
                {clients.filter(c => c.category === 'CLIENT').length > 0 && (
                  <optgroup label="Corporate Clients">
                    {clients.filter(c => c.category === 'CLIENT').map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.country})
                      </option>
                    ))}
                  </optgroup>
                )}
                {clients.filter(c => c.category === 'FREELANCER').length > 0 && (
                  <optgroup label="Sources">
                    {clients.filter(c => c.category === 'FREELANCER').map(c => (
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
              rows={3}
              placeholder="High-level engineering deliverable goals and requirements..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
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
