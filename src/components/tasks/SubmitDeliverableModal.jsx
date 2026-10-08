import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Send, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

export const SubmitDeliverableModal = ({ isOpen, onClose, task }) => {
  const { addDeliverable, updateTaskStatus } = useApp();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('GIT_PR');
  const [notes, setNotes] = useState('');

  if (!task) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    addDeliverable(task.id, {
      title: title.trim(),
      url: url.trim(),
      type,
      notes: notes.trim(),
      submittedAt: new Date().toISOString()
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Task Deliverable"
      subtitle={`Submit proof of work for "${task.title}". This will transition task to Pending Review.`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Deliverable Category *
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="GIT_PR">GitHub Pull Request (PR)</option>
            <option value="FIGMA">Figma UI/UX Mockup</option>
            <option value="DEMO">Staging Server Demo URL</option>
            <option value="DOC">Technical Specification Document</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Deliverable Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. PR #204: WebRTC SFU Mesh Encryption Implementation"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Resource URL *
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/lincoz/... or https://figma.com/..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Hand-off Notes for Project Manager
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Brief instructions, test credentials, or deployment notes for PM review..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
          />
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Upon submission, the Project Manager will be notified and your task will move to <strong>Pending Review</strong> status.
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
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" /> Submit Deliverable
          </button>
        </div>
      </form>
    </Modal>
  );
};
