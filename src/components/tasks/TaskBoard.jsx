import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KanbanView } from './KanbanView';
import { ListView } from './ListView';
import { GanttView } from './GanttView';
import { TaskDetailModal } from './TaskDetailModal';
import { CreateTaskModal } from './CreateTaskModal';
import { SubmitDeliverableModal } from './SubmitDeliverableModal';
import {
  LayoutGrid,
  List,
  Milestone,
  Plus,
  Filter,
  FolderKanban,
  Sparkles
} from 'lucide-react';

export const TaskBoard = ({ selectedTaskId, onClearSelectedTask }) => {
  const {
    getScopedTasks,
    getScopedProjects,
    isSuperAdmin,
    isPM,
    tasks
  } = useApp();

  const [viewMode, setViewMode] = useState('kanban'); // kanban, list, gantt
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTaskForModal, setActiveTaskForModal] = useState(null);
  const [activeTaskForDeliverable, setActiveTaskForDeliverable] = useState(null);

  const scopedProjects = getScopedProjects();
  const scopedTasks = getScopedTasks();

  const displayedTasks = selectedProjectId === 'ALL'
    ? scopedTasks
    : scopedTasks.filter(t => t.projectId === selectedProjectId);

  // If a selectedTaskId prop is passed from outside, open it
  React.useEffect(() => {
    if (selectedTaskId) {
      const target = tasks.find(t => t.id === selectedTaskId);
      if (target) setActiveTaskForModal(target);
    }
  }, [selectedTaskId, tasks]);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FolderKanban className="w-6 h-6 text-indigo-400" />
            Operational Task & Sprint Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic Kanban, List, and Gantt views with granular verification checklists.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Project Filter */}
          <div className="flex items-center gap-2 bg-[#182234] px-3 py-1.5 rounded-xl border border-slate-700/80">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs text-white font-semibold focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900">All Scoped Projects</option>
              {scopedProjects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#182234] p-1 rounded-xl border border-slate-700/80">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'gantt'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Milestone className="w-3.5 h-3.5" /> Gantt
            </button>
          </div>

          {/* Create Task Button (Super Admin & PM) */}
          {(isSuperAdmin() || isPM()) && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" /> New Task
            </button>
          )}
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'kanban' && (
        <KanbanView
          tasks={displayedTasks}
          onSelectTask={(task) => setActiveTaskForModal(task)}
          onOpenCreateTask={() => setIsCreateModalOpen(true)}
        />
      )}

      {viewMode === 'list' && (
        <ListView
          tasks={displayedTasks}
          onSelectTask={(task) => setActiveTaskForModal(task)}
        />
      )}

      {viewMode === 'gantt' && (
        <GanttView
          tasks={displayedTasks}
          onSelectTask={(task) => setActiveTaskForModal(task)}
        />
      )}

      {/* Task Detail Modal */}
      {activeTaskForModal && (
        <TaskDetailModal
          isOpen={!!activeTaskForModal}
          onClose={() => {
            setActiveTaskForModal(null);
            if (onClearSelectedTask) onClearSelectedTask();
          }}
          task={activeTaskForModal}
        />
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Submit Deliverable Modal */}
      {activeTaskForDeliverable && (
        <SubmitDeliverableModal
          isOpen={!!activeTaskForDeliverable}
          onClose={() => setActiveTaskForDeliverable(null)}
          task={activeTaskForDeliverable}
        />
      )}

    </div>
  );
};
