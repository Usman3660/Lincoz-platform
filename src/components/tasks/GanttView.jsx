import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { Calendar, Clock, Layers, CheckCircle2 } from 'lucide-react';

export const GanttView = ({ tasks, onSelectTask }) => {
  const { projects, users } = useApp();

  const months = ['Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026', 'Jan 2027'];

  // Helper to compute a visual left % and width % for a task
  const calculateTaskSpan = (dueDate) => {
    // Basic date parsing relative to 2026-08-01 -> 2027-01-31 (approx 180 days)
    const baseDate = new Date('2026-08-01').getTime();
    const endDate = new Date('2027-01-31').getTime();
    const totalDuration = endDate - baseDate;

    const taskEnd = new Date(dueDate || '2026-10-15').getTime();
    const taskStart = taskEnd - (14 * 24 * 60 * 60 * 1000); // assume 2 week window

    let leftPercent = ((taskStart - baseDate) / totalDuration) * 100;
    let widthPercent = ((taskEnd - taskStart) / totalDuration) * 100;

    leftPercent = Math.max(2, Math.min(leftPercent, 80));
    widthPercent = Math.max(12, Math.min(widthPercent, 35));

    return { leftPercent, widthPercent };
  };

  return (
    <div className="rounded-2xl bg-[#111827] border border-slate-800 p-5 space-y-6 shadow-xl overflow-hidden">
      {/* Gantt Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Project & Task Delivery Roadmap (Aug 2026 &ndash; Jan 2027)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Visual delivery timeline with direct project tasks and progress tracking.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block" /> In Progress
          <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block ml-2" /> Completed
          <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block ml-2" /> Pending Review
        </div>
      </div>

      {/* Timeline Grid Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px] space-y-6">
          
          {/* Months Axis */}
          <div className="grid grid-cols-6 border-b border-slate-800 pb-2 text-center text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            {months.map((m, idx) => (
              <div key={idx} className="border-r border-slate-800/60 last:border-none">
                {m}
              </div>
            ))}
          </div>

          {/* Projects and their tasks */}
          <div className="space-y-6">
            {projects.map((proj) => {
              const projectTasks = tasks.filter((t) => t.projectId === proj.id);

              return (
                <div key={proj.id} className="space-y-3">
                  {/* Project Section Header */}
                  <div className="flex items-center justify-between bg-[#182234] px-4 py-2.5 rounded-xl border border-slate-700/80">
                    <span className="text-xs font-extrabold text-white">
                      {proj.name} &bull; <span className="text-slate-400 font-normal">Client: {proj.clientName}</span>
                    </span>
                    <span className="text-xs font-mono text-indigo-300 font-semibold">
                      Target Delivery: {proj.targetDeliveryDate}
                    </span>
                  </div>

                  {/* Tasks under this project directly */}
                  <div className="space-y-2 pl-2">
                    {projectTasks.length === 0 ? (
                      <div className="text-[11px] text-slate-500 italic py-2 pl-3">
                        No tasks created under this project yet.
                      </div>
                    ) : (
                      projectTasks.map((task) => {
                        const { leftPercent, widthPercent } = calculateTaskSpan(task.dueDate);
                        const totalChecklists = task.checklists?.length || 0;
                        const doneChecklists = task.checklists?.filter((c) => c.isCompleted).length || 0;
                        const pct = totalChecklists > 0 ? Math.round((doneChecklists / totalChecklists) * 100) : 0;

                        let barColor = 'from-indigo-600 to-indigo-500 border-indigo-400';
                        if (task.status === 'COMPLETED') barColor = 'from-emerald-600 to-emerald-500 border-emerald-400';
                        if (task.status === 'PENDING_REVIEW') barColor = 'from-amber-600 to-amber-500 border-amber-400';

                        return (
                          <div
                            key={task.id}
                            className="relative h-10 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center hover:bg-slate-900 transition-colors group cursor-pointer"
                            onClick={() => onSelectTask(task)}
                          >
                            {/* Task Title Overlay */}
                            <div className="absolute left-3 z-10 text-xs font-semibold text-white pointer-events-none truncate max-w-[240px]">
                              {task.title}
                            </div>

                            {/* Gantt Bar */}
                            <div
                              className={`absolute h-7 rounded-lg bg-gradient-to-r ${barColor} border shadow-md flex items-center justify-between px-2 text-[10px] font-bold text-white transition-all group-hover:brightness-110`}
                              style={{
                                left: `${leftPercent}%`,
                                width: `${widthPercent}%`,
                              }}
                            >
                              <span className="truncate">{task.dueDate}</span>
                              <span className="font-mono bg-black/30 px-1 rounded ml-1">
                                {pct}%
                              </span>
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

        </div>
      </div>
    </div>
  );
};
