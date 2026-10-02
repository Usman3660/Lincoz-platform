import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../common/StatsCard';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Play,
  Send,
  Sparkles,
  ExternalLink,
  MessageSquare,
  FolderKanban,
  CheckCircle2
} from 'lucide-react';

export const EngineerDashboard = ({ setActiveTab, onSelectTask }) => {
  const {
    currentUser,
    getScopedTasks,
    toggleChecklistItem,
    updateTaskStatus,
    projects
  } = useApp();

  const myTasks = getScopedTasks();
  const inProgress = myTasks.filter(t => t.status === 'IN_PROGRESS');
  const pendingReview = myTasks.filter(t => t.status === 'PENDING_REVIEW');
  const completed = myTasks.filter(t => t.status === 'COMPLETED');

  // Calculate total checklist items
  let totalChecklists = 0;
  let completedChecklists = 0;
  myTasks.forEach(t => {
    t.checklists.forEach(c => {
      totalChecklists++;
      if (c.isCompleted) completedChecklists++;
    });
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Engineer Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/60 to-[#111827] border border-cyan-500/20 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <CheckSquare className="w-3.5 h-3.5" /> Engineering & Design Execution Station
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Focused sprint queue: complete granular checklist criteria, submit code pull requests, and push milestones to Pending Review with sub-250ms latency.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('tasks')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/30 shrink-0"
          >
            <FolderKanban className="w-4 h-4" /> Full Kanban Board
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Assigned Tasks"
          value={myTasks.length}
          subtitle={`${completed.length} Completed`}
          icon={CheckSquare}
          colorScheme="cyan"
        />
        <StatsCard
          title="Checklist Item Velocity"
          value={`${completedChecklists}/${totalChecklists}`}
          subtitle={`${Math.round((completedChecklists / (totalChecklists || 1)) * 100)}% Items Checked`}
          icon={CheckCircle2}
          colorScheme="emerald"
          badgeText="Verified"
        />
        <StatsCard
          title="In Progress"
          value={inProgress.length}
          subtitle="Currently active"
          icon={Play}
          colorScheme="indigo"
        />
        <StatsCard
          title="In PM Review"
          value={pendingReview.length}
          subtitle="Awaiting sign-off"
          icon={Clock}
          colorScheme="amber"
        />
      </div>

      {/* Main Task List & Interactive Checklists */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-cyan-400" />
            Active Sprint Task Queue
          </h2>
          <span className="text-xs text-slate-400">
            Toggling items dispatches immutable audit entries
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {myTasks.map((t) => {
            const proj = projects.find(p => p.id === t.projectId);
            const totalItems = t.checklists.length;
            const doneItems = t.checklists.filter(c => c.isCompleted).length;
            const progressPercent = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

            return (
              <div
                key={t.id}
                className="p-6 rounded-2xl bg-[#111827] border border-slate-800 hover:border-cyan-500/40 transition-all space-y-4 shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white">
                        {t.title}
                      </h3>
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {proj?.name} &bull; Due: <span className="text-slate-300 font-medium">{t.dueDate}</span> ({t.estimatedHours}h est)
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectTask(t)}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors shrink-0"
                  >
                    Open
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-[#182234]/60 p-3 rounded-xl border border-slate-800/80">
                  {t.description}
                </p>

                {/* Granular Checklists Interactive Component */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                      Task Verification Criteria ({doneItems}/{totalItems})
                    </span>
                    <span className="font-mono text-cyan-400 font-semibold text-[11px]">
                      {progressPercent}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Checklist Items list */}
                  <div className="space-y-1.5 pt-1">
                    {t.checklists.map((c) => (
                      <label
                        key={c.id}
                        className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all ${
                          c.isCompleted
                            ? 'bg-emerald-950/20 text-slate-400 line-through'
                            : 'bg-[#182234] text-slate-200 hover:bg-[#202d44]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={c.isCompleted}
                          onChange={() => toggleChecklistItem(t.id, c.id)}
                          className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900 w-4 h-4"
                        />
                        <span className="text-xs select-none">
                          {c.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Transitions & Deliverable Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {t.status === 'ASSIGNED' && (
                      <button
                        onClick={() => updateTaskStatus(t.id, 'IN_PROGRESS')}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" /> Start Working
                      </button>
                    )}
                    {t.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => updateTaskStatus(t.id, 'PENDING_REVIEW')}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit for Review
                      </button>
                    )}
                    {t.status === 'PENDING_REVIEW' && (
                      <span className="text-xs text-amber-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5" /> In Project Manager Review
                      </span>
                    )}
                    {t.status === 'COMPLETED' && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Completed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" /> {t.comments?.length || 0}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
