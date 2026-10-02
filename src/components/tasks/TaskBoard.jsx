import React, { useState, useMemo } from 'react';
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
  Search,
  CheckCircle2,
  Clock,
  Flame,
  AlertTriangle,
  Layers,
  X
} from 'lucide-react';

export const TaskBoard = ({ selectedTaskId, onClearSelectedTask }) => {
  const {
    getScopedTasks,
    getScopedProjects,
    isSuperAdmin,
    isPM,
    tasks
  } = useApp();

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban', 'list', 'gantt'
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBlockedOnly, setFilterBlockedOnly] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTaskForModal, setActiveTaskForModal] = useState(null);
  const [isModalEditMode, setIsModalEditMode] = useState(false);
  const [activeTaskForDeliverable, setActiveTaskForDeliverable] = useState(null);

  const scopedProjects = getScopedProjects();
  const scopedTasks = getScopedTasks();

  // Filter tasks based on project, priority, search keyword, and blocker filter
  const displayedTasks = useMemo(() => {
    return scopedTasks.filter((t) => {
      const matchProject = selectedProjectId === 'ALL' || t.projectId === selectedProjectId;
      const matchPriority = selectedPriority === 'ALL' || t.priority === selectedPriority;
      const matchBlocked = !filterBlockedOnly || t.isBlocked;
      const matchSearch = !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchProject && matchPriority && matchBlocked && matchSearch;
    });
  }, [scopedTasks, selectedProjectId, selectedPriority, filterBlockedOnly, searchQuery]);

  // Metric stats calculated from scoped tasks
  const stats = useMemo(() => {
    const total = scopedTasks.length;
    const inProgress = scopedTasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length;
    const inReview = scopedTasks.filter(t => t.status === 'PENDING_REVIEW').length;
    const completed = scopedTasks.filter(t => t.status === 'COMPLETED').length;
    const blocked = scopedTasks.filter(t => t.isBlocked).length;
    return { total, inProgress, inReview, completed, blocked };
  }, [scopedTasks]);

  // If a selectedTaskId prop is passed from outside, open it
  React.useEffect(() => {
    if (selectedTaskId) {
      const target = tasks.find(t => t.id === selectedTaskId);
      if (target) {
        setActiveTaskForModal(target);
        setIsModalEditMode(false);
      }
    }
  }, [selectedTaskId, tasks]);

  const handleOpenTask = (task, editMode = false) => {
    setActiveTaskForModal(task);
    setIsModalEditMode(editMode);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* Top Header & View Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Operational Task & Sprint Engine
              </h1>
              <p className="text-xs text-slate-400">
                Interactive Kanban, Granular Verification Checklists, and Milestone Roadmap.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher & Create Task Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#182234] p-1 rounded-xl border border-slate-700/80 shadow-inner">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'gantt'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Milestone className="w-3.5 h-3.5" /> Gantt
            </button>
          </div>

          {/* Create Task Action (PM & Super Admin) */}
          {(isSuperAdmin() || isPM()) && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 shrink-0"
            >
              <Plus className="w-4 h-4" /> New Task
            </button>
          )}
        </div>
      </div>

      {/* Filter & Metric Summary Command Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#111827] border border-slate-800 text-xs">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, deliverables, criteria..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#182234] border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Project Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#182234] px-3 py-1.5 rounded-xl border border-slate-700/80">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Projects ({scopedProjects.length})</option>
              {scopedProjects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-[#182234] px-3 py-1.5 rounded-xl border border-slate-700/80">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Priorities</option>
              <option value="Urgent" className="bg-slate-900 text-rose-400 font-bold">Urgent</option>
              <option value="High" className="bg-slate-900 text-amber-400 font-bold">High</option>
              <option value="Medium" className="bg-slate-900 text-blue-400">Medium</option>
              <option value="Low" className="bg-slate-900 text-slate-400">Low</option>
            </select>
          </div>

          {/* Blocker Quick Toggle Pill */}
          {stats.blocked > 0 && (
            <button
              onClick={() => setFilterBlockedOnly(!filterBlockedOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                filterBlockedOnly
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
              }`}
              title="Show only blocked tasks"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{stats.blocked} Blocked</span>
            </button>
          )}
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'kanban' && (
        <KanbanView
          tasks={displayedTasks}
          onSelectTask={handleOpenTask}
          onOpenCreateTask={() => setIsCreateModalOpen(true)}
        />
      )}

      {viewMode === 'list' && (
        <ListView
          tasks={displayedTasks}
          onSelectTask={handleOpenTask}
        />
      )}

      {viewMode === 'gantt' && (
        <GanttView
          tasks={displayedTasks}
          onSelectTask={handleOpenTask}
        />
      )}

      {/* Task Detail Modal */}
      {activeTaskForModal && (
        <TaskDetailModal
          isOpen={!!activeTaskForModal}
          initialEditMode={isModalEditMode}
          onClose={() => {
            setActiveTaskForModal(null);
            setIsModalEditMode(false);
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
