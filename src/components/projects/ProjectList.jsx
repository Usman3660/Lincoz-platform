import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PriorityBadge, StatusBadge, RoleBadge } from '../common/Badge';
import { CreateProjectModal } from './CreateProjectModal';
import {
  Briefcase,
  Plus,
  Milestone,
  DollarSign,
  Users,
  Calendar,
  Lock,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserCheck,
  Edit3,
  Mail,
  AlertTriangle,
  Building,
  Check,
  X,
  FileText,
  TrendingUp,
  Layers
} from 'lucide-react';

export const ProjectList = () => {
  const {
    getScopedProjects,
    projects,
    users,
    tasks,
    isSuperAdmin,
    isPartner
  } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const scopedProjects = getScopedProjects();
  // Find current live project data from state
  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            Client Portfolios & Projects
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hierarchy: Client Portfolio &rarr; Project &rarr; Milestones &rarr; Tasks &rarr; Checklists.
          </p>
        </div>

        {isSuperAdmin() && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 shrink-0"
          >
            <Plus className="w-4 h-4" /> Provision New Project
          </button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scopedProjects.map((proj) => {
          const projectTasks = tasks.filter((t) => t.projectId === proj.id);
          const completedTasks = projectTasks.filter((t) => t.status === 'COMPLETED').length;
          const blockedTasks = projectTasks.filter((t) => t.isBlocked).length;
          const pm = users.find((u) => u.id === proj.projectManagerId);

          const isConfidential = proj.totalContractValue === 'CONFIDENTIAL';
          const percentInvoiced = isConfidential
            ? null
            : Math.round(((proj.grossInvoiced || 0) / (proj.totalContractValue || 1)) * 100);

          return (
            <div
              key={proj.id}
              className="p-6 rounded-2xl bg-[#111827] border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-4">
                {/* Top badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                      {proj.clientName}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {proj.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={proj.status} />
                    <PriorityBadge priority={proj.priority} />
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>

                {/* Assigned Project Manager Card on Grid */}
                <div className="p-3 rounded-xl bg-[#182234]/70 border border-slate-700/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={pm?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'}
                      alt={pm?.name || 'Project Manager'}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/40"
                    />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                        Project Manager
                      </span>
                      <p className="text-xs font-bold text-white truncate max-w-[150px]">
                        {pm?.name || 'Unassigned PM'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                    {pm?.title?.split(' ')[0] || 'Lead'}
                  </span>
                </div>

                {/* Financial Progress Box (Super Admin) or Operational Task Velocity (PM & Members) */}
                {isSuperAdmin() ? (
                  <div className="p-3.5 rounded-xl bg-[#182234]/80 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1 font-medium">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Contract Valuation
                      </span>
                      <span className="font-mono text-white font-extrabold">
                        ${typeof proj.totalContractValue === 'number' ? proj.totalContractValue.toLocaleString() : 'N/A'}
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                        style={{ width: `${percentInvoiced || 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Invoiced: ${typeof proj.grossInvoiced === 'number' ? proj.grossInvoiced.toLocaleString() : 0}</span>
                      <span>AR: ${typeof proj.accountsReceivable === 'number' ? proj.accountsReceivable.toLocaleString() : 0}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#182234]/80 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Task Completion Rate
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {completedTasks}/{projectTasks.length} ({projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                        style={{ width: `${projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Target: {proj.targetDeliveryDate}</span>
                      <span>{proj.milestones?.length || 0} Milestones</span>
                    </div>
                  </div>
                )}

                {/* Milestone Tranches Counter */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                    <Milestone className="w-3 h-3 text-indigo-400" /> Milestone Roadmap ({proj.milestones?.length || 0})
                  </span>
                  <div className="space-y-1">
                    {proj.milestones?.slice(0, 2).map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-[#182234]/50 border border-slate-800/80"
                      >
                        <span className="text-slate-300 truncate max-w-[180px]">{m.title}</span>
                        <StatusBadge status={m.status} />
                      </div>
                    ))}
                    {(proj.milestones?.length || 0) > 2 && (
                      <span className="text-[10px] text-slate-500 block italic text-center">
                        +{proj.milestones.length - 2} more milestones
                      </span>
                    )}
                  </div>
                </div>

                {blockedTasks > 0 && (
                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{blockedTasks} task(s) currently blocked</span>
                  </div>
                )}

              </div>

              {/* Card Footer: Target Date & Detail Action */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Due: {proj.targetDeliveryDate}</span>
                </div>

                <button
                  onClick={() => setSelectedProjectId(proj.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  View Details &rarr;
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProjectId(null)}
          project={selectedProject}
        />
      )}

    </div>
  );
};

// Comprehensive Client Project Detail View
const ProjectDetailModal = ({ isOpen, onClose, project }) => {
  const { users, tasks, isSuperAdmin, updateProject, clients = [] } = useApp();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingManager, setIsChangingManager] = useState(false);
  const [selectedNewPmId, setSelectedNewPmId] = useState(project.projectManagerId || 'usr-pm');

  // Milestone editing state
  const [editingMilestoneId, setEditingMilestoneId] = useState(null);
  const [msEditForm, setMsEditForm] = useState({ title: '', dueDate: '', status: 'PLANNING', trancheAmount: 0, isBilledToClient: false });
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMs, setNewMs] = useState({ title: '', dueDate: new Date().toISOString().split('T')[0], status: 'PLANNING', trancheAmount: 10000, isBilledToClient: false });

  const [form, setForm] = useState({
    name: project.name || '',
    clientName: project.clientName || '',
    clientContact: project.clientContact || '',
    description: project.description || '',
    status: project.status || 'ACTIVE',
    priority: project.priority || 'High',
    totalContractValue: project.totalContractValue || 0,
    directExpenses: project.directExpenses || 0,
    targetDeliveryDate: project.targetDeliveryDate || '',
    projectManagerId: project.projectManagerId || 'usr-pm'
  });

  if (!project) return null;

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const completedTasks = projectTasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgressTasks = projectTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const inReviewTasks = projectTasks.filter((t) => t.status === 'PENDING_REVIEW').length;
  const blockedTasks = projectTasks.filter((t) => t.isBlocked).length;

  const currentPm = users.find((u) => u.id === project.projectManagerId);
  const availablePMs = users.filter((u) => u.role === 'PROJECT_MANAGER' || u.role === 'SUPER_ADMIN');

  // Assigned team members
  const assignedTeamMembers = users.filter((u) => project.assignedTeamIds?.includes(u.id));

  const handleStartEditMilestone = (m) => {
    setMsEditForm({
      title: m.title || '',
      dueDate: m.dueDate || '',
      status: m.status || 'PLANNING',
      trancheAmount: typeof m.trancheAmount === 'number' ? m.trancheAmount : 0,
      isBilledToClient: !!m.isBilledToClient
    });
    setEditingMilestoneId(m.id);
  };

  const handleSaveMilestone = (mId) => {
    const updated = (project.milestones || []).map(m => {
      if (m.id === mId) {
        return {
          ...m,
          title: msEditForm.title.trim() || m.title,
          dueDate: msEditForm.dueDate || m.dueDate,
          status: msEditForm.status,
          trancheAmount: Number(msEditForm.trancheAmount) || 0,
          isBilledToClient: msEditForm.isBilledToClient
        };
      }
      return m;
    });
    updateProject(project.id, { milestones: updated });
    setEditingMilestoneId(null);
  };

  const handleDeleteMilestone = (mId) => {
    const updated = (project.milestones || []).filter(m => m.id !== mId);
    updateProject(project.id, { milestones: updated });
    setEditingMilestoneId(null);
  };

  const handleCreateMilestone = () => {
    if (!newMs.title.trim()) return;
    const newEntry = {
      id: `ms-${Date.now()}`,
      title: newMs.title.trim(),
      dueDate: newMs.dueDate || new Date().toISOString().split('T')[0],
      status: newMs.status || 'PLANNING',
      trancheAmount: Number(newMs.trancheAmount) || 0,
      billedAmount: newMs.isBilledToClient ? Number(newMs.trancheAmount) || 0 : 0,
      isBilledToClient: !!newMs.isBilledToClient
    };
    updateProject(project.id, { milestones: [...(project.milestones || []), newEntry] });
    setIsAddingMilestone(false);
  };

  const handleSaveNewManager = () => {
    if (!selectedNewPmId || selectedNewPmId === project.projectManagerId) {
      setIsChangingManager(false);
      return;
    }

    updateProject(project.id, { projectManagerId: selectedNewPmId });
    setIsChangingManager(false);
  };

  const handleSaveProjectDetails = (e) => {
    e?.preventDefault?.();
    updateProject(project.id, {
      name: form.name.trim(),
      clientName: form.clientName.trim(),
      clientContact: form.clientContact.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      totalContractValue: Number(form.totalContractValue) || 0,
      directExpenses: Number(form.directExpenses) || 0,
      targetDeliveryDate: form.targetDeliveryDate,
      projectManagerId: form.projectManagerId
    });
    setIsEditing(false);
  };

  const isConfidential = project.totalContractValue === 'CONFIDENTIAL';
  const tcv = typeof project.totalContractValue === 'number' ? project.totalContractValue : 0;
  const grossInvoiced = typeof project.grossInvoiced === 'number' ? project.grossInvoiced : 0;
  const ar = typeof project.accountsReceivable === 'number' ? project.accountsReceivable : 0;
  const expenses = typeof project.directExpenses === 'number' ? project.directExpenses : 0;
  const netEstimatedProfit = tcv - expenses;
  const profitMargin = tcv > 0 ? Math.round((netEstimatedProfit / tcv) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-[#111827] border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar animate-scaleUp text-slate-200">
        
        {/* Header with Client Info and Project Title */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold text-xs uppercase tracking-wider border border-indigo-500/30 flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> {project.clientName}
              </span>
              <StatusBadge status={project.status} />
              <PriorityBadge priority={project.priority} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {project.name}
            </h2>

            {project.clientContact && (
              <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Client Contact: <span className="text-slate-200">{project.clientContact}</span>
              </p>
            )}

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl pt-1">
              {project.description}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start">
            {isSuperAdmin() && !isEditing && (
              <button
                onClick={() => {
                  setForm({
                    name: project.name || '',
                    clientName: project.clientName || '',
                    clientContact: project.clientContact || '',
                    description: project.description || '',
                    status: project.status || 'ACTIVE',
                    priority: project.priority || 'High',
                    totalContractValue: project.totalContractValue || 0,
                    directExpenses: project.directExpenses || 0,
                    targetDeliveryDate: project.targetDeliveryDate || '',
                    projectManagerId: project.projectManagerId || 'usr-pm'
                  });
                  setIsEditing(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/40 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Project
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#182234] hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Super Admin Full Project Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveProjectDetails} className="p-5 rounded-2xl bg-[#182234] border border-indigo-500/40 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" /> Edit Project Specifications
              </h3>
              <span className="text-[10px] text-amber-400 font-mono">Super Admin Action</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0e1420] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Client / Organization / Freelancer *</label>
                <select
                  value={form.clientName}
                  onChange={(e) => {
                    const val = e.target.value;
                    const selected = clients.find(c => c.name === val);
                    setForm({
                      ...form,
                      clientName: val,
                      clientContact: selected ? `${selected.email} | ${selected.contactNumber}` : form.clientContact
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#0e1420] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value={form.clientName}>{form.clientName}</option>
                  {clients.filter(c => c.name !== form.clientName).map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.category === 'FREELANCER' ? `${c.percentage}% share` : c.country})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0e1420] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PLANNING">Planning</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0e1420] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Total Contract Value ($)</label>
                <input
                  type="number"
                  value={form.totalContractValue}
                  onChange={(e) => setForm({ ...form, totalContractValue: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0e1420] border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Direct Expenses ($)</label>
                <input
                  type="number"
                  value={form.directExpenses}
                  onChange={(e) => setForm({ ...form, directExpenses: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0e1420] border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Delivery Date</label>
                <input
                  type="date"
                  value={form.targetDeliveryDate}
                  onChange={(e) => setForm({ ...form, targetDeliveryDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0e1420] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Manager</label>
                <select
                  value={form.projectManagerId}
                  onChange={(e) => setForm({ ...form, projectManagerId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0e1420] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {availablePMs.map((pm) => (
                    <option key={pm.id} value={pm.id}>{pm.name} ({pm.role})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#0e1420] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 custom-scrollbar"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-700/80">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-sm transition-all"
              >
                Save Project Changes
              </button>
            </div>
          </form>
        )}

        {/* 1. PROJECT MANAGER SECTION (Highlighted & Changeable by Super Admin) */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#182234] to-[#121c2e] border border-indigo-500/30 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Assigned Project Manager
              </h3>
            </div>

            {isSuperAdmin() && !isChangingManager && (
              <button
                onClick={() => {
                  setSelectedNewPmId(project.projectManagerId || 'usr-pm');
                  setIsChangingManager(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold transition-all border border-indigo-500/40 flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" /> Reassign Project Manager
              </button>
            )}
          </div>

          {!isChangingManager ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0e1420]/80 border border-slate-700/80">
              <div className="flex items-center gap-3.5">
                <img
                  src={currentPm?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'}
                  alt={currentPm?.name || 'Project Manager'}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/50"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{currentPm?.name || 'Unassigned Project Manager'}</h4>
                    <RoleBadge role={currentPm?.role || 'PROJECT_MANAGER'} />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{currentPm?.title || 'Lead Technical Project Manager'}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{currentPm?.email || 'pm@lincoz.internal'}</p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Department</span>
                <span className="text-xs font-bold text-white">{currentPm?.department || 'Operations'}</span>
                <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">● Active Lead</span>
              </div>
            </div>
          ) : (
            /* Super Admin PM Reassignment Selector Form */
            <div className="p-4 rounded-xl bg-[#0e1420] border border-indigo-500/50 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-indigo-300">
                  Select New Project Manager for &quot;{project.name}&quot;:
                </label>
                <span className="text-[10px] text-amber-400 font-mono">Super Admin Action</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <select
                    value={selectedNewPmId}
                    onChange={(e) => setSelectedNewPmId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-indigo-500/50 text-xs text-white font-semibold focus:outline-none focus:border-indigo-400"
                  >
                    {availablePMs.map((pmOption) => (
                      <option key={pmOption.id} value={pmOption.id}>
                        {pmOption.name} — {pmOption.title} ({pmOption.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveNewManager}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Confirm Change
                  </button>
                  <button
                    onClick={() => setIsChangingManager(false)}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. FINANCIAL METRICS & GOVERNANCE (Super Admin only) */}
        {isSuperAdmin() && !isConfidential && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Commercial Financial Governance (TCV)
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl bg-[#182234] border border-slate-700/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Contract Value</span>
                <span className="text-base font-extrabold text-white font-mono">${tcv.toLocaleString()}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#182234] border border-slate-700/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Gross Invoiced</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">${grossInvoiced.toLocaleString()}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#182234] border border-slate-700/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Accounts Receivable</span>
                <span className="text-base font-extrabold text-indigo-300 font-mono">${ar.toLocaleString()}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#182234] border border-slate-700/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Direct Expenses</span>
                <span className="text-base font-extrabold text-rose-300 font-mono">${expenses.toLocaleString()}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#182234] border border-slate-700/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Gross Margin</span>
                <span className="text-base font-extrabold text-cyan-400 font-mono">{profitMargin}%</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. OPERATIONAL ROADMAP & TASK METRICS */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-400" /> Operational Delivery Timeline & Velocity
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#182234] border border-slate-700 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Start Date</span>
              <span className="text-xs font-bold text-white font-mono">{project.startDate || '2026-08-01'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Delivery</span>
              <span className="text-xs font-bold text-indigo-300 font-mono">{project.targetDeliveryDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Task Completion</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {completedTasks}/{projectTasks.length} ({projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0}%)
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">In-Progress / Review</span>
              <span className="text-xs font-bold text-amber-300 font-mono">{inProgressTasks + inReviewTasks} Tasks</span>
            </div>
          </div>
        </div>

        {/* 4. DISCRETE MILESTONE ROADMAP TRANCHES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Milestone className="w-4 h-4 text-indigo-400" /> Discrete Milestone Roadmap ({project.milestones?.length || 0})
            </h3>
            {isSuperAdmin() && !isAddingMilestone && (
              <button
                onClick={() => {
                  setNewMs({ title: '', dueDate: new Date().toISOString().split('T')[0], status: 'PLANNING', trancheAmount: 10000, isBilledToClient: false });
                  setIsAddingMilestone(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/40 flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> + Add Milestone
              </button>
            )}
          </div>

          {/* Add New Milestone Form */}
          {isAddingMilestone && (
            <div className="p-4 rounded-xl bg-[#182234] border border-indigo-500/40 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300">Add New Milestone Tranche</span>
                <span className="text-[10px] text-slate-400 font-mono">Super Admin</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Milestone 4: Security Audit"
                    value={newMs.title}
                    onChange={(e) => setNewMs({ ...newMs, title: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0e1420] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status</label>
                  <select
                    value={newMs.status}
                    onChange={(e) => setNewMs({ ...newMs, status: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0e1420] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="PENDING_REVIEW">Pending Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newMs.dueDate}
                    onChange={(e) => setNewMs({ ...newMs, dueDate: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0e1420] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Tranche Value ($)</label>
                  <input
                    type="number"
                    value={newMs.trancheAmount}
                    onChange={(e) => setNewMs({ ...newMs, trancheAmount: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0e1420] border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMs.isBilledToClient}
                      onChange={(e) => setNewMs({ ...newMs, isBilledToClient: e.target.checked })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <span>Invoiced to Client</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setIsAddingMilestone(false)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateMilestone}
                  className="px-3.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm"
                >
                  Add Milestone
                </button>
              </div>
            </div>
          )}

          {/* Milestones List */}
          <div className="space-y-2">
            {project.milestones?.map((m) => {
              const isEditingThis = editingMilestoneId === m.id;

              if (isEditingThis) {
                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-[#182234] border border-indigo-500/50 space-y-3 animate-fadeIn text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300 text-xs">Edit Milestone</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteMilestone(m.id)}
                        className="text-rose-400 hover:text-rose-300 text-[11px] font-medium flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Milestone
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Title</label>
                        <input
                          type="text"
                          value={msEditForm.title}
                          onChange={(e) => setMsEditForm({ ...msEditForm, title: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0e1420] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status</label>
                        <select
                          value={msEditForm.status}
                          onChange={(e) => setMsEditForm({ ...msEditForm, status: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0e1420] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="PLANNING">Planning</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="PENDING_REVIEW">Pending Review</option>
                          <option value="APPROVED">Approved</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Due Date</label>
                        <input
                          type="date"
                          value={msEditForm.dueDate}
                          onChange={(e) => setMsEditForm({ ...msEditForm, dueDate: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0e1420] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Tranche Value ($)</label>
                        <input
                          type="number"
                          value={msEditForm.trancheAmount}
                          onChange={(e) => setMsEditForm({ ...msEditForm, trancheAmount: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0e1420] border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-3">
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={msEditForm.isBilledToClient}
                            onChange={(e) => setMsEditForm({ ...msEditForm, isBilledToClient: e.target.checked })}
                            className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                          />
                          <span>Invoiced to Client</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700/80">
                      <button
                        type="button"
                        onClick={() => setEditingMilestoneId(null)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveMilestone(m.id)}
                        className="px-3.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm"
                      >
                        Save Milestone
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-[#182234] border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{m.title}</span>
                      <StatusBadge status={m.status} />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Target Due Date: <span className="text-slate-200 font-mono font-medium">{m.dueDate}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    {isSuperAdmin() && typeof m.trancheAmount === 'number' && (
                      <div className="text-right">
                        <span className="text-slate-400 text-[10px] block">Tranche Value</span>
                        <span className="text-xs font-bold text-emerald-400">${m.trancheAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded ${m.isBilledToClient ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                      {m.isBilledToClient ? 'Invoiced to Client' : 'Pending Milestone Delivery'}
                    </span>

                    {isSuperAdmin() && (
                      <button
                        type="button"
                        onClick={() => handleStartEditMilestone(m)}
                        className="p-1.5 rounded-lg bg-[#0e1420] hover:bg-indigo-600 text-slate-400 hover:text-white border border-slate-700 text-xs transition-colors"
                        title="Edit Milestone"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. ASSIGNED TEAM MEMBERS & PARTNERS */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-400" /> Assigned Team & Contractors ({assignedTeamMembers.length})
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {assignedTeamMembers.map((member) => (
              <div
                key={member.id}
                className="p-3 rounded-xl bg-[#182234] border border-slate-700/80 flex items-center gap-3"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-indigo-500/30"
                />
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-white truncate">{member.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{member.title}</p>
                  <div className="mt-1">
                    <RoleBadge role={member.role} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. ASSIGNED PROJECT TASKS */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-400" /> Project Tasks ({projectTasks.length})
          </h3>
          <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
            {projectTasks.map((t) => {
              const assignee = users.find(u => u.id === t.assigneeId);
              const completedChecks = (t.checklists || []).filter(c => c.isCompleted).length;
              const totalChecks = (t.checklists || []).length;

              return (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-[#182234] border border-slate-700/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    {assignee && (
                      <img
                        src={assignee.avatar}
                        alt={assignee.name}
                        title={`Assignee: ${assignee.name}`}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-indigo-500/30"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{t.title}</span>
                        {t.isBlocked && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold">
                            BLOCKED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>Checklist: {completedChecks}/{totalChecks}</span>
                        <span>&bull;</span>
                        <span>Assignee: {assignee?.name || 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Close Project Details
          </button>
        </div>

      </div>
    </div>
  );
};
