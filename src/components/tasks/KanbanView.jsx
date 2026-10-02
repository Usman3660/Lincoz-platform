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
  Plus
} from 'lucide-react';

const COLUMNS = [
  { id: 'BACKLOG', title: 'Backlog', color: 'border-slate-700', bg: 'bg-slate-800/30' },
  { id: 'ASSIGNED', title: 'Assigned', color: 'border-purple-500/40', bg: 'bg-purple-950/20' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-indigo-500/40', bg: 'bg-indigo-950/20' },
  { id: 'PENDING_REVIEW', title: 'Pending Review', color: 'border-amber-500/40', bg: 'bg-amber-950/20' },
  { id: 'COMPLETED', title: 'Completed', color: 'border-emerald-500/40', bg: 'bg-emerald-950/20' }
];

export const KanbanView = ({ tasks, onSelectTask, onOpenCreateTask }) => {
  const { users, updateTaskStatus, isSuperAdmin, isPM, currentUser } = useApp();

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div
            key={col.id}
            className={`flex flex-col rounded-2xl bg-[#111827] border ${col.color} p-3.5 min-w-[280px] shadow-lg`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  {col.title}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                  {columnTasks.length}
                </span>
              </div>

              {(isSuperAdmin() || isPM()) && col.id === 'BACKLOG' && (
                <button
                  onClick={onOpenCreateTask}
                  className="p-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 hover:text-white transition-colors"
                  title="Add Task"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Task Cards */}
            <div className="flex-1 space-y-3 min-h-[450px]">
              {columnTasks.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-[11px] text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No tasks
                </div>
              ) : (
                columnTasks.map((t) => {
                  const assignee = users.find((u) => u.id === t.assigneeId);
                  const totalChecklists = t.checklists?.length || 0;
                  const completedChecklists = t.checklists?.filter((c) => c.isCompleted).length || 0;
                  const next = getNextStatus(t.status);
                  const prev = getPrevStatus(t.status);

                  return (
                    <div
                      key={t.id}
                      className={`p-3.5 rounded-xl bg-[#182234] border ${
                        t.isBlocked ? 'border-rose-500/60 bg-rose-950/10' : 'border-slate-700/80 hover:border-indigo-500/50'
                      } transition-all duration-200 space-y-2.5 shadow-md hover:-translate-y-0.5 group cursor-pointer`}
                      onClick={() => onSelectTask(t)}
                    >
                      {/* Priority & Blocker Header */}
                      <div className="flex items-center justify-between gap-1">
                        <PriorityBadge priority={t.priority} />
                        {t.isBlocked && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> BLOCKED
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                        {t.title}
                      </h4>

                      {/* Checklists progress badge */}
                      {totalChecklists > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-indigo-400 rounded-full"
                              style={{ width: `${(completedChecklists / totalChecklists) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5">
                            <CheckSquare className="w-2.5 h-2.5 text-indigo-400" />
                            {completedChecklists}/{totalChecklists}
                          </span>
                        </div>
                      )}

                      {/* Footer Info: Assignee + Date + Comments */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          {assignee ? (
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              title={`Assignee: ${assignee.name} (${assignee.role})`}
                              className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-700"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">Unassigned</span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">
                            {t.dueDate}
                          </span>
                        </div>

                        {t.comments && t.comments.length > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                            <MessageSquare className="w-2.5 h-2.5" />
                            {t.comments.length}
                          </span>
                        )}
                      </div>

                      {/* Quick Move Buttons */}
                      <div
                        className="pt-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {prev ? (
                          <button
                            onClick={() => updateTaskStatus(t.id, prev)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-0.5"
                            title={`Move back to ${prev}`}
                          >
                            <ArrowLeft className="w-2.5 h-2.5" />
                          </button>
                        ) : <div />}

                        {next ? (
                          <button
                            onClick={() => updateTaskStatus(t.id, next)}
                            className="p-1 px-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold flex items-center gap-0.5"
                            title={`Move to ${next}`}
                          >
                            <span>Move</span>
                            <ArrowRight className="w-2.5 h-2.5" />
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
