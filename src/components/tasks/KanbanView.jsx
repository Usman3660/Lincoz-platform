import React from 'react';
import { useApp } from '../../context/AppContext';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import {
  CheckSquare,
  AlertTriangle,
  Clock,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  User,
  Calendar,
  Layers,
  Flame,
  CheckCircle2,
  FolderKanban,
  FileCheck2
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

  const getPrevStatus = (current) => {
    switch (current) {
      case 'COMPLETED': return 'PENDING_REVIEW';
      case 'PENDING_REVIEW': return 'IN_PROGRESS';
      case 'IN_PROGRESS': return 'ASSIGNED';
      case 'ASSIGNED': return 'BACKLOG';
      default: return null;
    }
  };

  const handleDelete = (e, task) => {
    e.stopPropagation();
    if (window.confirm(`Delete task "${task.title}"? This cannot be undone.`)) {
      deleteTask(task.id);
    }
  };

  return (
    <div className="flex items-start gap-4 overflow-x-auto pb-6 pt-1 px-1 custom-scrollbar min-h-[620px]">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);
        const IconComponent = col.icon;

        return (
          <div
            key={col.id}
            className={`kanban-column rounded-2xl p-3.5 flex flex-col shrink-0 w-[310px] min-h-[580px] border border-t-4 ${col.accentBorder} transition-all`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor} shrink-0`} />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                  <IconComponent className="w-3.5 h-3.5 text-slate-400" />
                  {col.title}
                </span>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold border ${col.badgeColor}`}>
                  {columnTasks.length}
                </span>
              </div>

              {canManage && col.id === 'BACKLOG' && (
                <button
                  onClick={onOpenCreateTask}
                  className="p-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white transition-colors border border-indigo-500/30"
                  title="Add Task to Backlog"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Task Cards Column Body */}
            <div className="flex-1 space-y-3">
              {columnTasks.length === 0 ? (
                <div className="h-36 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-700/60 rounded-xl">
                  <IconComponent className="w-6 h-6 text-slate-500/60 mb-1" />
                  <span className="text-xs font-semibold text-slate-400">No tasks in {col.title.toLowerCase()}</span>
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
                      className={`kanban-card rounded-xl p-4 border transition-all duration-200 space-y-3 cursor-pointer relative group ${
                        t.isBlocked ? 'ring-2 ring-rose-500/70' : ''
                      }`}
                      onClick={() => onSelectTask(t)}
                    >
                      {/* Top Meta: Project Tag + Priority Badge + Hover Actions */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          {project && (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                              {project.name}
                            </span>
                          )}
                          <div className="flex items-center gap-1.5">
                            <PriorityBadge priority={t.priority} />
                          </div>
                        </div>

                        {/* Hover Actions: Edit & Delete for PM/Super Admin */}
                        {canManage ? (
                          <div
                            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => onSelectTask(t, true)}
                              className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors shadow-sm"
                              title="Edit Task"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(e, t)}
                              className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors shadow-sm"
                              title="Delete Task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : null}
                      </div>

                      {/* Blocker Alert Banner (if task is blocked) */}
                      {t.isBlocked && (
                        <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />
                          <span className="text-[11px] font-bold text-rose-400 truncate">
                            Blocked: {t.blockReason || 'Action required'}
                          </span>
                        </div>
                      )}

                      {/* Title */}
                      <h4 className="kanban-card-title text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                        {t.title}
                      </h4>

                      {/* Description Snippet */}
                      {t.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {t.description}
                        </p>
                      )}

                      {/* Checklist Progress Bar */}
                      {totalChecklists > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span className="flex items-center gap-1">
                              <CheckSquare className="w-3 h-3 text-indigo-400" />
                              {completedChecklists}/{totalChecklists} criteria
                            </span>
                            <span className="font-bold text-indigo-400">{completionPercentage}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
                              style={{ width: `${completionPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Card Footer: Assignee Avatar + Due Date + Counters */}
                      <div className="pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                        {/* Assignee & Date */}
                        <div className="flex items-center gap-2 min-w-0">
                          {assignee ? (
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              title={`Assigned to: ${assignee.name} (${assignee.role})`}
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-600 shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 text-[10px] font-mono shrink-0">
                              ?
                            </div>
                          )}

                          {t.dueDate && (
                            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {t.dueDate}
                            </span>
                          )}
                        </div>

                        {/* Comments and Deliverables Counters */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          {t.deliverables && t.deliverables.length > 0 && (
                            <span className="flex items-center gap-0.5 text-cyan-400 font-mono" title={`${t.deliverables.length} Deliverables attached`}>
                              <FileCheck2 className="w-3 h-3" />
                              {t.deliverables.length}
                            </span>
                          )}
                          {t.comments && t.comments.length > 0 && (
                            <span className="flex items-center gap-0.5 text-slate-400 font-mono" title={`${t.comments.length} Comments`}>
                              <MessageSquare className="w-3 h-3" />
                              {t.comments.length}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Status Shift Controls (Footer) */}
                      <div
                        className="pt-2 flex items-center justify-between border-t border-slate-700/40 opacity-80 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {prev ? (
                          <button
                            onClick={() => updateTaskStatus(t.id, prev)}
                            className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                            title={`Move back to ${prev.replace('_', ' ')}`}
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span>{prev.replace('_', ' ')}</span>
                          </button>
                        ) : <div />}

                        {next ? (
                          <button
                            onClick={() => updateTaskStatus(t.id, next)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold flex items-center gap-1 transition-all shadow-sm"
                            title={`Advance to ${next.replace('_', ' ')}`}
                          >
                            <span>{next.replace('_', ' ')}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : <div />}
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
