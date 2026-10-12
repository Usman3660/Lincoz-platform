import React from 'react';
import { useApp } from '../../context/AppContext';
import { PriorityBadge } from '../common/Badge';
import {
  CheckSquare,
  AlertTriangle,
  Clock,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  Plus,
  Trash2,
  Edit3,
  User,
  Calendar,
  Flame,
  CheckCircle2,
  FolderKanban,
  FileCheck2,
  Repeat
} from 'lucide-react';

const COLUMNS = [
  {
    id: 'BACKLOG',
    title: 'Backlog',
    icon: FolderKanban,
    accentBorder: 'border-t-slate-500',
    dotColor: 'bg-slate-400',
    badgeColor: 'bg-slate-500/15 text-slate-300 border-slate-500/30'
  },
  {
    id: 'ASSIGNED',
    title: 'Assigned',
    icon: User,
    accentBorder: 'border-t-purple-500',
    dotColor: 'bg-purple-400',
    badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    icon: Flame,
    accentBorder: 'border-t-indigo-500',
    dotColor: 'bg-indigo-400',
    badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
  },
  {
    id: 'PENDING_REVIEW',
    title: 'Pending Review',
    icon: Clock,
    accentBorder: 'border-t-amber-500',
    dotColor: 'bg-amber-400',
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
  },
  {
    id: 'COMPLETED',
    title: 'Completed',
    icon: CheckCircle2,
    accentBorder: 'border-t-emerald-500',
    dotColor: 'bg-emerald-400',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  }
];

export const KanbanView = ({ tasks, onSelectTask, onOpenCreateTask }) => {
  const { users, projects, updateTaskStatus, deleteTask, isSuperAdmin, isPM } = useApp();
  const canManage = isSuperAdmin() || isPM();

  const getNextStatus = (current) => {
    switch (current) {
      case 'BACKLOG': return 'ASSIGNED';
      case 'ASSIGNED': return 'IN_PROGRESS';
      case 'IN_PROGRESS': return 'PENDING_REVIEW';
      case 'PENDING_REVIEW': return 'COMPLETED';
      default: return null;
    }
  };

  const getNextLabel = (status) => {
    switch (status) {
      case 'ASSIGNED': return 'Assign';
      case 'IN_PROGRESS': return 'Start';
      case 'PENDING_REVIEW': return 'Review';
      case 'COMPLETED': return 'Complete';
      default: return status ? status.replace('_', ' ') : 'Next';
    }
  };

  const getPrevStatus = (current) => {
    switch (current) {
      case 'COMPLETED': return 'PENDING_REVIEW';
      case 'PENDING_REVIEW': return 'IN_PROGRESS';
      case 'IN_PROGRESS': return 'ASSIGNED';
      case 'ASSIGNED': return canManage ? 'BACKLOG' : null;
      default: return null;
    }
  };

  const handleDelete = (e, task) => {
    e.stopPropagation();
    if (window.confirm(`Delete task "${task.title}"? This cannot be undone.`)) {
      deleteTask(task.id);
    }
  };

  const visibleColumns = canManage ? COLUMNS : COLUMNS.filter((col) => col.id !== 'BACKLOG');

  return (
    <div className="flex items-start gap-3.5 overflow-x-auto pb-6 pt-1 px-1 custom-scrollbar min-h-[560px]">
      {visibleColumns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);
        const IconComponent = col.icon;

        return (
          <div
            key={col.id}
            className={`kanban-column rounded-xl p-2.5 flex flex-col shrink-0 w-[275px] min-h-[520px] border border-t-[3px] ${col.accentBorder} transition-all`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-700/50">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${col.dotColor} shrink-0`} />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                  <IconComponent className="w-3.5 h-3.5 text-slate-400" />
                  {col.title}
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold border ${col.badgeColor}`}>
                  {columnTasks.length}
                </span>
              </div>

              {canManage && col.id === 'BACKLOG' && (
                <button
                  onClick={onOpenCreateTask}
                  className="p-1 rounded-md bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white transition-colors border border-indigo-500/30"
                  title="Add Task to Backlog"
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Task Cards Column Body */}
            <div className="flex-1 space-y-2.5">
              {columnTasks.length === 0 ? (
                <div className="h-28 flex flex-col items-center justify-center text-center p-3 border border-dashed border-slate-700/50 rounded-lg">
                  <IconComponent className="w-5 h-5 text-slate-500/50 mb-1" />
                  <span className="text-[11px] font-medium text-slate-400">No tasks in {col.title.toLowerCase()}</span>
                </div>
              ) : (
                columnTasks.map((t) => {
                  const assignee = users.find((u) => u.id === t.assigneeId);
                  const project = projects.find((p) => p.id === t.projectId);
                  const totalChecklists = t.checklists?.length || 0;
                  const completedChecklists = t.checklists?.filter((c) => c.isCompleted).length || 0;
                  const completionPercentage = totalChecklists > 0
                    ? Math.round((completedChecklists / totalChecklists) * 100)
                    : 0;

                  const next = getNextStatus(t.status);
                  const prev = getPrevStatus(t.status);

                  return (
                    <div
                      key={t.id}
                      className={`kanban-card rounded-lg p-3 border transition-all duration-150 space-y-2 cursor-pointer relative group ${
                        t.isBlocked ? 'ring-2 ring-rose-500/70' : ''
                      }`}
                      onClick={() => onSelectTask(t)}
                    >
                      {/* Top Meta: Project Tag (Left) + Priority & Hover Actions (Right) */}
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          {project ? (
                            <span className="text-[10px] font-semibold text-slate-400 truncate flex items-center gap-1" title={project.name}>
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                              <span className="truncate">{project.name}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">General</span>
                          )}
                          {t.repeatFrequency && t.repeatFrequency !== 'NONE' && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 flex items-center gap-1 shrink-0"
                              title={`Repeats ${t.repeatFrequency.toLowerCase()} on completion`}
                            >
                              <Repeat className="w-2.5 h-2.5 text-indigo-400" />
                              <span className="capitalize">{t.repeatFrequency.toLowerCase()}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <PriorityBadge priority={t.priority} size="sm" />
                          {canManage && (
                            <div
                              className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => onSelectTask(t, true)}
                                className="p-1 rounded hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors"
                                title="Edit Task"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(e, t)}
                                className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Blocker Alert Banner (if blocked) */}
                      {t.isBlocked && (
                        <div className="px-2 py-1 rounded bg-rose-500/15 border border-rose-500/30 flex items-center gap-1.5 text-[10px] font-semibold text-rose-400 truncate">
                          <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0 animate-pulse" />
                          <span className="truncate">Blocked: {t.blockReason || 'Action required'}</span>
                        </div>
                      )}

                      {/* Title */}
                      <h4 className="kanban-card-title text-[13px] font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                        {t.title}
                      </h4>

                      {/* Checklist Criteria Progress (Compact single line) */}
                      {totalChecklists > 0 && (
                        <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 pt-0.5">
                          <span className="flex items-center gap-1 font-mono text-[10px]">
                            <CheckSquare className="w-2.5 h-2.5 text-indigo-400" />
                            {completedChecklists}/{totalChecklists} criteria
                          </span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-1 rounded-full bg-slate-700/60 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
                                style={{ width: `${completionPercentage}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-[9px] text-indigo-400">{completionPercentage}%</span>
                          </div>
                        </div>
                      )}

                      {/* Single Unified Clean Footer: Assignee & Date (Left) + Minimalist Stepper (Right) */}
                      <div
                        className="pt-2 border-t border-slate-700/40 flex items-center justify-between gap-1.5 text-xs text-slate-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Left: Assignee Avatar + Due Date + Counters */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          {assignee ? (
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              title={`Assigned to: ${assignee.name} (${assignee.role})`}
                              className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-600 shrink-0"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 text-[9px] font-mono shrink-0">
                              ?
                            </div>
                          )}

                          {t.dueDate && (
                            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 truncate" title={`Due Date: ${t.dueDate}`}>
                              <Calendar className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              <span className="truncate">{t.dueDate}</span>
                            </span>
                          )}

                          {/* Badges for deliverables & comments */}
                          {t.deliverables && t.deliverables.length > 0 && (
                            <span className="flex items-center gap-0.5 text-cyan-400 font-mono text-[10px] ml-0.5" title={`${t.deliverables.length} Deliverables attached`}>
                              <FileCheck2 className="w-2.5 h-2.5" />
                              {t.deliverables.length}
                            </span>
                          )}
                          {t.comments && t.comments.length > 0 && (
                            <span className="flex items-center gap-0.5 text-slate-400 font-mono text-[10px]" title={`${t.comments.length} Comments`}>
                              <MessageSquare className="w-2.5 h-2.5" />
                              {t.comments.length}
                            </span>
                          )}
                        </div>

                        {/* Right: Quick Stage Shift Controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          {prev && (t.status !== 'COMPLETED' || canManage) && (
                            <button
                              onClick={() => updateTaskStatus(t.id, prev)}
                              className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[10px] transition-colors"
                              title={`Move back to ${prev.replace('_', ' ')}`}
                            >
                              <ArrowLeft className="w-2.5 h-2.5" />
                            </button>
                          )}

                          {next && (
                            next === 'COMPLETED' && !canManage ? (
                              <span
                                className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-medium flex items-center gap-1"
                                title="Only Project Managers and Super Admins can verify and mark tasks as Completed"
                              >
                                <Clock className="w-2.5 h-2.5" /> PM Sign-off
                              </span>
                            ) : (
                              <button
                                onClick={() => updateTaskStatus(t.id, next)}
                                className="px-2 py-0.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold flex items-center gap-1 transition-all shadow-xs"
                                title={`Advance to ${next.replace('_', ' ')}`}
                              >
                                <span>{getNextLabel(next)}</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
