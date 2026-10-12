import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../common/StatsCard';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import {
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckSquare,
  Eye,
  Users
} from 'lucide-react';

export const ProjectManagerDashboard = ({ setActiveTab, onSelectTask, onOpenCreateTask }) => {
  const {
    getScopedProjects,
    getScopedTasks,
    updateProject,
    users
  } = useApp();

  const scopedProjects = getScopedProjects();
  const scopedTasks = getScopedTasks();

  const totalTasks = scopedTasks.length;
  const completedTasks = scopedTasks.filter(t => t.status === 'COMPLETED').length;
  const inReviewTasks = scopedTasks.filter(t => t.status === 'PENDING_REVIEW');
  const blockedTasks = scopedTasks.filter(t => t.isBlocked);
  const inProgressTasks = scopedTasks.filter(t => t.status === 'IN_PROGRESS');

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* PM Banner */}
      <div className="dashboard-hero-banner pm-banner relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-[#111827] border border-indigo-500/20 p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
              <FolderKanban className="w-3.5 h-3.5" /> Project Operations & Delivery Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sprint Velocity & Delivery Orchestration
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Track project delivery timelines, review engineering pull requests, provision team members, and monitor task execution progression.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('users')}
              className="px-4 py-2.5 rounded-xl bg-[#182234] hover:bg-[#202d44] text-indigo-300 hover:text-white text-xs font-bold transition-all border border-indigo-500/30 flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" /> Provision Team
            </button>
            <button
              onClick={onOpenCreateTask}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
            >
              + New Task
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
            >
              Open Kanban
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Sprint Task Velocity"
          value={`${completedTasks}/${totalTasks}`}
          subtitle={`${Math.round((completedTasks / (totalTasks || 1)) * 100)}% Execution Rate`}
          icon={CheckCircle2}
          colorScheme="indigo"
          badgeText="Active Sprint"
        />
        <StatsCard
          title="Pending Reviews"
          value={inReviewTasks.length}
          subtitle="Deliverables awaiting sign-off"
          icon={Clock}
          colorScheme="amber"
          badgeText={inReviewTasks.length > 0 ? "Review Needed" : "Clear"}
        />
        <StatsCard
          title="Flagged Blockers"
          value={blockedTasks.length}
          subtitle={blockedTasks.length > 0 ? "Requires unblocking" : "All paths clear"}
          icon={AlertTriangle}
          colorScheme="rose"
        />
        <StatsCard
          title="Active Projects"
          value={scopedProjects.length}
          subtitle="Under your operational management"
          icon={FolderKanban}
          colorScheme="cyan"
        />
      </div>

      {/* Review Queue & Blocker Register Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Deliverable Review Queue */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-amber-500/30 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Deliverable Review Queue ({inReviewTasks.length})
              </h3>
            </div>
          </div>

          {inReviewTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-[#182234]/40 rounded-xl border border-slate-800">
              No tasks currently pending review. All submissions are up to date.
            </div>
          ) : (
            <div className="space-y-3">
              {inReviewTasks.map((t) => {
                const assignee = users.find(u => u.id === t.assigneeId);
                const proj = scopedProjects.find(p => p.id === t.projectId);
                return (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl bg-[#182234] border border-slate-700/80 hover:border-indigo-500/40 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">
                            {t.title}
                          </h4>
                          <PriorityBadge priority={t.priority} />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {proj?.name} &bull; Assignee: <span className="text-slate-200 font-semibold">{assignee?.name}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => onSelectTask(t)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </button>
                    </div>

                    {/* Deliverable links */}
                    {t.deliverables && t.deliverables.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">
                          Submitted Attachments & PRs:
                        </span>
                        {t.deliverables.map((d, i) => (
                          <a
                            key={i}
                            href={d.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-1.5 underline underline-offset-2"
                          >
                            <ExternalLink className="w-3 h-3 text-indigo-400" />
                            {d.title} ({d.type})
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Flagged Blockers */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-rose-500/30 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Active Blocker Register ({blockedTasks.length})
              </h3>
            </div>
          </div>

          {blockedTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-[#182234]/40 rounded-xl border border-slate-800">
              Zero blockers reported across all active projects.
            </div>
          ) : (
            <div className="space-y-3">
              {blockedTasks.map((t) => {
                const assignee = users.find(u => u.id === t.assigneeId);
                return (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl bg-[#182234] border border-rose-500/40 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-white">
                          {t.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Owner: {assignee?.name} &bull; Due: {t.dueDate}
                        </p>
                      </div>
                      <button
                        onClick={() => onSelectTask(t)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
                      >
                        Details
                      </button>
                    </div>

                    <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300">
                      <span className="font-bold block text-[10px] uppercase tracking-wider text-rose-400">
                        Blocker Detail:
                      </span>
                      {t.blockReason}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Project Delivery Progress (Pure Operational) */}
      <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-400" />
              Project Delivery Roadmap & Task Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Track operational deliverable tasks and target completion dates across assigned projects.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('projects')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            All Projects <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scopedProjects.map((proj) => {
            const projectTasks = scopedTasks.filter(t => t.projectId === proj.id);
            const totalProjTasks = projectTasks.length;
            const completedProjTasks = projectTasks.filter(t => t.status === 'COMPLETED').length;
            const taskPct = totalProjTasks > 0 ? Math.round((completedProjTasks / totalProjTasks) * 100) : 0;

            return (
              <div
                key={proj.id}
                className="p-4 rounded-xl bg-[#182234] border border-slate-700/80 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                      {proj.clientName}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate max-w-[180px]">
                      {proj.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusBadge status={proj.status} />
                    {proj.status !== 'COMPLETED' ? (
                      <button
                        onClick={() => {
                          if (window.confirm(`Mark project "${proj.name}" as Completed?`)) {
                            updateProject(proj.id, { status: 'COMPLETED' });
                          }
                        }}
                        className="px-2 py-0.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm"
                        title="Mark Project as Completed"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Complete
                      </button>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Done
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Task Completion</span>
                    <span className="font-mono text-emerald-400 font-bold">{completedProjTasks}/{totalProjTasks} ({taskPct}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                      style={{ width: `${taskPct}%` }}
                    />
                  </div>
                </div>

                {/* Active Tasks Preview */}
                <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Active Tasks ({projectTasks.length}):
                  </span>
                  {projectTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="truncate max-w-[140px]">{task.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">{task.dueDate || task.status}</span>
                    </div>
                  ))}
                  {projectTasks.length > 3 && (
                    <span className="text-[10px] text-slate-500 block italic">+{projectTasks.length - 3} more tasks</span>
                  )}
                  {projectTasks.length === 0 && (
                    <span className="text-[11px] text-slate-500 italic block">No tasks assigned yet.</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
