import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import {
  Search,
  Filter,
  Eye,
  Trash2,
  AlertTriangle,
  CheckSquare,
  CheckCircle2
} from 'lucide-react';

export const ListView = ({ tasks, onSelectTask }) => {
  const {
    users,
    projects,
    deleteTask,
    toggleTaskBlock,
    updateTaskStatus,
    isSuperAdmin,
    isPM
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, descriptions..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="BACKLOG">Backlog</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Task Table */}
      <div className="rounded-2xl bg-[#111827] border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#182234]/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Task Details</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Checklist</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    No matching tasks found.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const assignee = users.find((u) => u.id === t.assigneeId);
                  const proj = projects.find((p) => p.id === t.projectId);
                  const totalChecklists = t.checklists?.length || 0;
                  const completedChecklists = t.checklists?.filter((c) => c.isCompleted).length || 0;

                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-[#182234]/50 transition-colors ${
                        t.isBlocked ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Task details */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          <span
                            onClick={() => onSelectTask(t)}
                            className="font-bold text-white hover:text-indigo-300 cursor-pointer block truncate"
                          >
                            {t.title}
                          </span>
                          {t.isBlocked && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                              <AlertTriangle className="w-3 h-3" /> Blocked: {t.blockReason}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Project */}
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {proj?.name || 'General'}
                      </td>

                      {/* Assignee */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {assignee ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700"
                            />
                            <div>
                              <p className="text-white font-medium text-xs leading-none">
                                {assignee.name}
                              </p>
                              <span className="text-[10px] text-slate-400">
                                {assignee.role.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono">Unassigned</span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <PriorityBadge priority={t.priority} />
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={t.status} />
                      </td>

                      {/* Checklist */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-mono text-slate-300">
                          <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                          {completedChecklists}/{totalChecklists}
                        </span>
                      </td>

                      {/* Due date */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-400">
                        {t.dueDate}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectTask(t)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white transition-colors"
                            title="Inspect Task"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {(isSuperAdmin() || isPM()) && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete task "${t.title}"?`)) {
                                  deleteTask(t.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/30 text-rose-400 hover:text-rose-300 transition-colors"
                              title="Delete Task"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
