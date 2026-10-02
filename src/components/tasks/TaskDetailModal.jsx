import React, { useState, useEffect } from 'react';
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
  Lock,
  Edit3,
  Save,
  X,
  User,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';

export const TaskDetailModal = ({ isOpen, onClose, task, initialEditMode = false }) => {
  const {
    currentUser,
    users,
    projects,
    tasks,
    toggleChecklistItem,
    updateTaskStatus,
    updateTask,
    toggleTaskBlock,
    addComment,
    addDeliverable,
    deleteTask,
    auditLogs,
    isSuperAdmin,
    isPM,
    getScopedProjects
  } = useApp();

  // Find latest live task from global state
  const liveTask = tasks?.find((t) => t.id === task?.id) || task;

  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [commentText, setCommentText] = useState('');
  const [newDeliverableTitle, setNewDeliverableTitle] = useState('');
  const [newDeliverableUrl, setNewDeliverableUrl] = useState('');
  const [newDeliverableType, setNewDeliverableType] = useState('GIT_PR');
  const [blockerReasonInput, setBlockerReasonInput] = useState('');
  const [showBlockerInput, setShowBlockerInput] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('Medium');
  const [editStatus, setEditStatus] = useState('BACKLOG');
  const [editAssigneeId, setEditAssigneeId] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editEstimatedHours, setEditEstimatedHours] = useState(10);
  const [editProjectId, setEditProjectId] = useState('');
  const [editMilestoneId, setEditMilestoneId] = useState('');
  const [editChecklists, setEditChecklists] = useState([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  const canManageTask = isSuperAdmin() || isPM();

  // Populate edit form whenever liveTask changes or modal opens
  useEffect(() => {
    if (liveTask) {
      setEditTitle(liveTask.title || '');
      setEditDescription(liveTask.description || '');
      setEditPriority(liveTask.priority || 'Medium');
      setEditStatus(liveTask.status || 'BACKLOG');
      setEditAssigneeId(liveTask.assigneeId || '');
      setEditDueDate(liveTask.dueDate || '');
      setEditEstimatedHours(liveTask.estimatedHours || 10);
      setEditProjectId(liveTask.projectId || '');
      setEditMilestoneId(liveTask.milestoneId || '');
      setEditChecklists(liveTask.checklists ? JSON.parse(JSON.stringify(liveTask.checklists)) : []);
    }
  }, [liveTask, isOpen]);

  useEffect(() => {
    setIsEditing(initialEditMode);
  }, [initialEditMode, isOpen]);

  if (!liveTask) return null;

  const scopedProjects = getScopedProjects ? getScopedProjects() : projects;
  const project = projects.find((p) => p.id === (isEditing ? editProjectId : liveTask.projectId));
  const milestone = project?.milestones?.find((m) => m.id === (isEditing ? editMilestoneId : liveTask.milestoneId));
  const assignee = users.find((u) => u.id === liveTask.assigneeId);

  // Filter audit logs strictly for this task
  const taskAuditStream = (auditLogs || []).filter((log) => log.taskId === liveTask.id);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(liveTask.id, commentText);
    setCommentText('');
  };

  const handleAddDeliverable = (e) => {
    e.preventDefault();
    if (!newDeliverableTitle.trim() || !newDeliverableUrl.trim()) return;
    addDeliverable(liveTask.id, {
      title: newDeliverableTitle.trim(),
      url: newDeliverableUrl.trim(),
      type: newDeliverableType,
    });
    setNewDeliverableTitle('');
    setNewDeliverableUrl('');
  };

  const handleToggleBlock = () => {
    if (liveTask.isBlocked) {
      toggleTaskBlock(liveTask.id, '');
      setShowBlockerInput(false);
    } else {
      if (!blockerReasonInput.trim()) {
        setShowBlockerInput(true);
        return;
      }
      toggleTaskBlock(liveTask.id, blockerReasonInput.trim());
      setBlockerReasonInput('');
      setShowBlockerInput(false);
    }
  };

  const handleDeleteTask = () => {
    if (!canManageTask) return;
    if (window.confirm(`Are you sure you want to delete the task "${liveTask.title}"? This action cannot be undone.`)) {
      deleteTask(liveTask.id);
      onClose();
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    updateTask(liveTask.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      priority: editPriority,
      status: editStatus,
      assigneeId: editAssigneeId,
      dueDate: editDueDate,
      estimatedHours: Number(editEstimatedHours) || 0,
      projectId: editProjectId || liveTask.projectId,
      milestoneId: editMilestoneId || liveTask.milestoneId,
      checklists: editChecklists
    });

    setIsEditing(false);
  };

  const handleAddEditChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setEditChecklists([
      ...editChecklists,
      {
        id: `chk-${Date.now()}-${editChecklists.length}`,
        text: newChecklistText.trim(),
        isCompleted: false
      }
    ]);
    setNewChecklistText('');
  };

  const handleRemoveEditChecklistItem = (idx) => {
    setEditChecklists(editChecklists.filter((_, i) => i !== idx));
  };

  const handleUpdateEditChecklistItemText = (idx, text) => {
    const updated = [...editChecklists];
    updated[idx].text = text;
    setEditChecklists(updated);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Task: ${liveTask.title}` : liveTask.title}
      subtitle={`${project?.name || 'Project'} • ${milestone?.title || 'Milestone'}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        
        {/* Top Header / Management Actions Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#182234] border border-slate-700/80">
          <div className="flex flex-wrap items-center gap-2">
            {!isEditing && (
              <>
                <PriorityBadge priority={liveTask.priority} />
                <StatusBadge status={liveTask.status} />
                {liveTask.isBlocked && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <AlertTriangle className="w-3.5 h-3.5" /> Blocked
                  </span>
                )}
              </>
            )}
            {isEditing && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Edit3 className="w-3.5 h-3.5" /> Editing Task Details
              </span>
            )}
          </div>

          {/* Action Buttons for Super Admin & Project Manager */}
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                {/* Quick Status Dropdown */}
                <div className="flex items-center gap-1.5 mr-1">
                  <span className="text-xs text-slate-400 font-medium">Status:</span>
                  <select
                    value={liveTask.status}
                    onChange={(e) => updateTaskStatus(liveTask.id, e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="BACKLOG">Backlog</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="PENDING_REVIEW">Pending Review</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                {canManageTask && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold transition-all shadow-sm"
                      title="Edit Task Specification & Checklist"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Task
                    </button>
                    <button
                      onClick={handleDeleteTask}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold transition-all shadow-sm"
                      title="Delete this Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        {/* ================= EDIT MODE VIEW ================= */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Task Title *
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter task title..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-semibold"
                required
              />
            </div>

            {/* Project & Milestone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Project
                </label>
                <select
                  value={editProjectId}
                  onChange={(e) => {
                    setEditProjectId(e.target.value);
                    const p = projects.find((x) => x.id === e.target.value);
                    if (p?.milestones?.length) setEditMilestoneId(p.milestones[0].id);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {scopedProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Milestone Tranche
                </label>
                <select
                  value={editMilestoneId}
                  onChange={(e) => setEditMilestoneId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {(project?.milestones || []).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Task Specification & Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                placeholder="Detailed deliverables, technical acceptance criteria, architecture..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>

            {/* Attributes Grid: Priority, Status, Assignee, Due Date, Est Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 rounded-xl bg-[#182234]/60 border border-slate-800">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Priority
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="BACKLOG">Backlog</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Assignee
                </label>
                <select
                  value={editAssigneeId}
                  onChange={(e) => setEditAssigneeId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Est. Hours
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={editEstimatedHours}
                  onChange={(e) => setEditEstimatedHours(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Checklist Manager */}
            <div className="p-4 rounded-xl bg-[#182234]/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-indigo-400" />
                  Granular Verification Checklist Items ({editChecklists.length})
                </label>
              </div>

              {/* Existing items list */}
              <div className="space-y-2">
                {editChecklists.map((chk, idx) => (
                  <div key={chk.id || idx} className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <input
                      type="checkbox"
                      checked={chk.isCompleted}
                      onChange={(e) => {
                        const updated = [...editChecklists];
                        updated[idx].isCompleted = e.target.checked;
                        setEditChecklists(updated);
                      }}
                      className="rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 bg-slate-950 w-4 h-4"
                    />
                    <input
                      type="text"
                      value={chk.text}
                      onChange={(e) => handleUpdateEditChecklistItemText(idx, e.target.value)}
                      placeholder="Checklist step description..."
                      className="flex-1 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveEditChecklistItem(idx)}
                      className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add new checklist item input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEditChecklistItem();
                    }
                  }}
                  placeholder="Add new granular verification criterion..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddEditChecklistItem}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Step
                </button>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Task Changes
              </button>
            </div>
          </form>
        ) : (
          /* ================= VIEW MODE ================= */
          <>
            {/* Blocker Alert Banner (if blocked or editing) */}
            {liveTask.isBlocked && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start justify-between gap-4">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                      Active Blocker Flagged
                    </h4>
                    <p className="text-xs text-rose-200 mt-0.5">
                      {liveTask.blockReason}
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

            {showBlockerInput && !liveTask.isBlocked && (
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
                    {liveTask.description || <span className="text-slate-500 italic">No description provided.</span>}
                  </div>
                </div>

                {/* Granular Checklist Items (SRS 3.4 Verification) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-indigo-400" />
                      Granular Verification Checklist ({(liveTask.checklists || []).filter(c => c.isCompleted).length}/{(liveTask.checklists || []).length})
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Real-time Immutable Audit on Toggle
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(!liveTask.checklists || liveTask.checklists.length === 0) ? (
                      <div className="p-3 text-center text-xs text-slate-500 bg-[#182234]/40 rounded-xl border border-slate-800">
                        No checklist items configured.
                      </div>
                    ) : (
                      liveTask.checklists.map((item) => (
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
                            onChange={() => toggleChecklistItem(liveTask.id, item.id)}
                            className="mt-0.5 rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 bg-slate-900 w-4 h-4"
                          />
                          <span className="text-xs select-none leading-relaxed">
                            {item.text}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* Submitted Deliverables & PR Links */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4 text-cyan-400" />
                    Submitted Deliverables & Proof of Work
                  </h4>

                  {liveTask.deliverables && liveTask.deliverables.length > 0 ? (
                    <div className="space-y-2">
                      {liveTask.deliverables.map((d, i) => (
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
                      <span className="text-white font-mono">{liveTask.dueDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Est. Hours</span>
                      <span className="text-white font-mono">{liveTask.estimatedHours} hrs</span>
                    </div>
                  </div>

                  {/* Block/Unblock action trigger */}
                  <div className="pt-2 border-t border-slate-800">
                    {!liveTask.isBlocked && !showBlockerInput && (
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
                    Comments & Discussion ({liveTask.comments?.length || 0})
                  </span>

                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {liveTask.comments && liveTask.comments.map((cm) => {
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
          </>
        )}

      </div>
    </Modal>
  );
};
