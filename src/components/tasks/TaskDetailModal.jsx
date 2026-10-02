import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { StatusBadge, PriorityBadge, RoleBadge } from '../common/Badge';
import {
  CheckSquare,
  AlertTriangle,
  Send,
  MessageSquare,
  ExternalLink,
  History,
  Clock,
  Shield,
  Plus,
  Play,
  CheckCircle2,
  Trash2,
  Lock
} from 'lucide-react';

export const TaskDetailModal = ({ isOpen, onClose, task }) => {
  const {
    currentUser,
    users,
    projects,
    toggleChecklistItem,
    updateTaskStatus,
    toggleTaskBlock,
    addComment,
    addDeliverable,
    deleteTask,
    auditLogs,
    isSuperAdmin,
    isPM
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [newDeliverableTitle, setNewDeliverableTitle] = useState('');
  const [newDeliverableUrl, setNewDeliverableUrl] = useState('');
  const [newDeliverableType, setNewDeliverableType] = useState('GIT_PR');
  const [blockerReasonInput, setBlockerReasonInput] = useState('');
  const [showBlockerInput, setShowBlockerInput] = useState(false);

  if (!task) return null;

  const project = projects.find((p) => p.id === task.projectId);
  const milestone = project?.milestones?.find((m) => m.id === task.milestoneId);
  const assignee = users.find((u) => u.id === task.assigneeId);
  const creator = users.find((u) => u.id === task.createdById);

  // Filter audit logs strictly for this task
  const taskAuditStream = auditLogs.filter((log) => log.taskId === task.id);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(task.id, commentText);
    setCommentText('');
  };

  const handleAddDeliverable = (e) => {
    e.preventDefault();
    if (!newDeliverableTitle.trim() || !newDeliverableUrl.trim()) return;
    addDeliverable(task.id, {
      title: newDeliverableTitle.trim(),
      url: newDeliverableUrl.trim(),
      type: newDeliverableType,
    });
    setNewDeliverableTitle('');
    setNewDeliverableUrl('');
  };

  const handleToggleBlock = () => {
    if (task.isBlocked) {
      toggleTaskBlock(task.id, '');
      setShowBlockerInput(false);
    } else {
      if (!blockerReasonInput.trim()) {
        setShowBlockerInput(true);
        return;
      }
      toggleTaskBlock(task.id, blockerReasonInput.trim());
      setBlockerReasonInput('');
      setShowBlockerInput(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      subtitle={`${project?.name || 'Project'} • ${milestone?.title || 'Milestone'}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        
        {/* Top Badges & Status Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#182234] border border-slate-700/80">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
            {task.isBlocked && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-3.5 h-3.5" /> Blocked
              </span>
            )}
          </div>

          {/* Quick status transition dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={task.status}
              onChange={(e) => updateTaskStatus(task.id, e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="BACKLOG">Backlog</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Blocker Alert Banner (if blocked or editing) */}
        {task.isBlocked && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                  Active Blocker Flagged
                </h4>
                <p className="text-xs text-rose-200 mt-0.5">
                  {task.blockReason}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleBlock}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shrink-0"
            >
              Clear Blocker
            </button>
          </div>
        )}

        {showBlockerInput && !task.isBlocked && (
          <div className="p-4 rounded-xl bg-[#182234] border border-rose-500/50 space-y-3">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Specify Blocker Reason
            </h4>
            <input
              type="text"
              value={blockerReasonInput}
              onChange={(e) => setBlockerReasonInput(e.target.value)}
              placeholder="e.g. Awaiting client API credentials or security signoff..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowBlockerInput(false)}
                className="px-3 py-1 rounded bg-slate-800 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleBlock}
                className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirm Block
              </button>
            </div>
          </div>
        )}

        {/* Task Description & Meta Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Description */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Task Specification
              </h4>
              <div className="p-4 rounded-xl bg-[#182234]/70 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </div>
            </div>

            {/* Granular Checklist Items (SRS 3.4 Verification) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-indigo-400" />
                  Granular Verification Checklist ({task.checklists.filter(c => c.isCompleted).length}/{task.checklists.length})
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  Real-time Immutable Audit on Toggle
                </span>
              </div>

              <div className="space-y-2">
                {task.checklists.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                      item.isCompleted
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-400 line-through'
                        : 'bg-[#182234] border-slate-700/80 text-slate-200 hover:bg-[#202d44] hover:border-indigo-500/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={() => toggleChecklistItem(task.id, item.id)}
                      className="mt-0.5 rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 bg-slate-900 w-4 h-4"
                    />
                    <span className="text-xs select-none leading-relaxed">
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submitted Deliverables & PR Links */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-cyan-400" />
                Submitted Deliverables & Proof of Work
              </h4>

              {task.deliverables && task.deliverables.length > 0 ? (
                <div className="space-y-2">
                  {task.deliverables.map((d, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#182234] border border-slate-700/80 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                          {d.type}
                        </span>
                        <span className="text-xs font-semibold text-white">{d.title}</span>
                      </div>
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 underline underline-offset-2 font-medium"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-slate-500 bg-[#182234]/40 rounded-xl border border-slate-800">
                  No deliverables submitted yet.
                </div>
              )}

              {/* Add Deliverable Form */}
              <form onSubmit={handleAddDeliverable} className="p-3.5 rounded-xl bg-[#182234]/60 border border-slate-800 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-300 block">
                  + Attach Deliverable / Pull Request Link
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={newDeliverableType}
                    onChange={(e) => setNewDeliverableType(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="GIT_PR">GitHub Pull Request</option>
                    <option value="FIGMA">Figma Design File</option>
                    <option value="DEMO">Live Staging URL</option>
                    <option value="DOC">Technical Spec / Doc</option>
                  </select>
                  <input
                    type="text"
                    value={newDeliverableTitle}
                    onChange={(e) => setNewDeliverableTitle(e.target.value)}
                    placeholder="Deliverable title (e.g. PR #194)"
                    className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newDeliverableUrl}
                    onChange={(e) => setNewDeliverableUrl(e.target.value)}
                    placeholder="https://github.com/... or https://figma.com/..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0"
                  >
                    Attach
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Right Sidebar: Assignee Info, Blocker Action, Task Audit Feed, and Comments */}
          <div className="space-y-4">
            
            {/* Metadata Card */}
            <div className="p-4 rounded-xl bg-[#182234]/70 border border-slate-800 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Assignee</span>
                {assignee ? (
                  <div className="flex items-center gap-2 mt-1">
                    <img src={assignee.avatar} alt={assignee.name} className="w-6 h-6 rounded-full object-cover" />
                    <div>
                      <p className="text-white font-bold">{assignee.name}</p>
                      <RoleBadge role={assignee.role} />
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-400 font-mono">Unassigned</span>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Due Date</span>
                  <span className="text-white font-mono">{task.dueDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Est. Hours</span>
                  <span className="text-white font-mono">{task.estimatedHours} hrs</span>
                </div>
              </div>

              {/* Block/Unblock action trigger */}
              <div className="pt-2 border-t border-slate-800">
                {!task.isBlocked && !showBlockerInput && (
                  <button
                    onClick={() => setShowBlockerInput(true)}
                    className="w-full py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Flag Task as Blocked
                  </button>
                )}
              </div>
            </div>

            {/* Real-time Embedded Activity / Audit Stream (SRS 3.4) */}
            <div className="p-4 rounded-xl bg-[#182234]/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-indigo-400" />
                  Task Audit Stream
                </span>
                <span className="text-[9px] font-mono text-emerald-400">Append-Only</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {taskAuditStream.length === 0 ? (
                  <div className="text-[11px] text-slate-500 italic">No activity logged yet.</div>
                ) : (
                  taskAuditStream.map((log) => (
                    <div key={log.id} className="p-2 rounded-lg bg-slate-900/70 border border-slate-800 text-[11px] space-y-0.5">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-bold text-indigo-300">{log.actorName}</span>
                        <span className="text-[9px] font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-300 leading-snug">{log.itemText}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Internal Team Comments */}
            <div className="p-4 rounded-xl bg-[#182234]/70 border border-slate-800 space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                Comments & Discussion ({task.comments?.length || 0})
              </span>

              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {task.comments && task.comments.map((cm) => {
                  const author = users.find((u) => u.id === cm.userId);
                  return (
                    <div key={cm.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-[11px]">{author?.name || 'Team Member'}</span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {new Date(cm.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">{cm.text}</p>
                    </div>
                  );
                })}
              </div>

              {/* Add comment input */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Post comment..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
                />
                <button
                  type="submit"
                  className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </Modal>
  );
};
