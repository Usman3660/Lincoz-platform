import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Plus, Trash2, CheckSquare, Sparkles, Repeat } from 'lucide-react';

export const CreateTaskModal = ({ isOpen, onClose }) => {
  const { projects, users, createTask, getScopedProjects } = useApp();
  const availableProjects = getScopedProjects().filter(p => p.status !== 'COMPLETED');

  const [projectId, setProjectId] = useState(availableProjects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assigneeId, setAssigneeId] = useState(users[0]?.id || '');
  const [dueDate, setDueDate] = useState('2026-10-30');
  const [estimatedHours, setEstimatedHours] = useState(20);
  const [repeatFrequency, setRepeatFrequency] = useState('NONE');

  // Dynamic checklists builder
  const [checklistItems, setChecklistItems] = useState([
    'Define implementation architecture and database schema',
    'Write unit and integration tests',
    'Verify sub-250ms latency benchmarking'
  ]);
  const [newChecklistText, setNewChecklistText] = useState('');

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklistItems([...checklistItems, newChecklistText.trim()]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (idx) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    const formattedChecklists = checklistItems.map((text, idx) => ({
      id: `chk-${Date.now()}-${idx}`,
      text,
      isCompleted: false,
    }));

    createTask({
      projectId,
      title: title.trim(),
      description: description.trim(),
      priority,
      assigneeId,
      dueDate,
      estimatedHours: Number(estimatedHours) || 10,
      status: 'BACKLOG',
      repeatFrequency,
      checklists: formattedChecklists,
      deliverables: [],
      comments: [],
    });

    setRepeatFrequency('NONE');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Operational Task"
      subtitle="Provision task with granular verification checklist criteria and deliverable specs."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Project Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Target Project *
          </label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            required
          >
            {availableProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Task Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Task Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Implement WebRTC SFU Mesh Encryption"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        {/* Task Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Description & Requirements Specification
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Detailed technical deliverables, acceptance criteria..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Priority, Assignee, Due Date, Est Hours */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              Assignee
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Est. Hours
            </label>
            <input
              type="number"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              min={1}
              className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Repeat Task Schedule Option */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Repeat className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-200">
                Repeat Task Schedule
              </label>
              <p className="text-[11px] text-slate-400">
                Automatically recreates task upon completion with advanced due date
              </p>
            </div>
          </div>
          <select
            value={repeatFrequency}
            onChange={(e) => setRepeatFrequency(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs font-medium text-white focus:outline-none focus:border-indigo-500 sm:w-48 shrink-0"
          >
            <option value="NONE">Does Not Repeat</option>
            <option value="DAILY">Daily (+1 Day)</option>
            <option value="WEEKLY">Weekly (+7 Days)</option>
            <option value="MONTHLY">Monthly (+1 Month)</option>
          </select>
        </div>

        {/* Checklist Criteria Builder */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Granular Verification Checklists ({checklistItems.length})
          </label>

          <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
            {checklistItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-[#182234] border border-slate-700/80 text-xs text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{item}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveChecklistItem(idx)}
                  className="text-slate-400 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddChecklistItem();
                }
              }}
              placeholder="Add verification criteria..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddChecklistItem}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Add
            </button>
          </div>
        </div>

        {/* Submit Footer */}
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
            Create Task & Log Audit
          </button>
        </div>

      </form>
    </Modal>
  );
};
