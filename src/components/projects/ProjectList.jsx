import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { PriorityBadge, StatusBadge, RoleBadge } from '../common/Badge';
import { CreateProjectModal } from './CreateProjectModal';
import { ProjectInvoiceModal } from '../financials/ProjectInvoiceModal';
import {
  Briefcase,
  Plus,
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
  Layers,
  Download,
  ExternalLink,
  UploadCloud,
  RotateCcw
} from 'lucide-react';

export const ProjectList = () => {
  const {
    getScopedProjects,
    projects,
    users,
    tasks,
    updateProject,
    isSuperAdmin,
    isPM,
    isPartner
  } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectForInvoice, setProjectForInvoice] = useState(null);

  const scopedProjects = getScopedProjects();
  // Find current live project data from state
  const selectedProject = scopedProjects.find(p => p.id === selectedProjectId) || null;

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            Projects
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hierarchy: Client Portfolio &rarr; Project &rarr; Tasks &rarr; Checklists & Deliverables.
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
          const projectTasks = tasks.filter((t) => t.projectId === proj.id && (isSuperAdmin() || isPM() ? true : t.status !== 'BACKLOG'));
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
                    {isSuperAdmin() && proj.clientName && (
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                        {proj.clientName}
                      </span>
                    )}
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

                {(isSuperAdmin() || isPM()) && proj.requirementDoc && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-[11px] font-semibold text-indigo-300">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      PRD Attached
                    </span>
                  </div>
                )}

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
                      <span>{projectTasks.length} Tasks</span>
                    </div>
                  </div>
                )}

                {/* Project Tasks Overview */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-indigo-400" /> Project Tasks ({projectTasks.length})
                  </span>
                  <div className="space-y-1">
                    {projectTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-[#182234]/50 border border-slate-800/80"
                      >
                        <span className="text-slate-300 truncate max-w-[180px]">{t.title}</span>
                        <StatusBadge status={t.status} />
                      </div>
                    ))}
                    {projectTasks.length > 2 && (
                      <span className="text-[10px] text-slate-500 block italic text-center">
                        +{projectTasks.length - 2} more tasks
                      </span>
                    )}
                    {projectTasks.length === 0 && (
                      <span className="text-[10px] text-slate-500 block italic text-center">
                        No tasks created yet
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

                <div className="flex items-center gap-2">
                  {(isSuperAdmin() || isPM()) && proj.status !== 'COMPLETED' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Mark project "${proj.name}" as Completed?`)) {
                          updateProject(proj.id, { status: 'COMPLETED' });
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                      title="Mark Project as Completed"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                    </button>
                  )}

                  {isSuperAdmin() && !isConfidential && (
                    <button
                      onClick={() => setProjectForInvoice(proj)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                      title={`Issue invoice for ${proj.name}`}
                    >
                      <Plus className="w-3.5 h-3.5" /> Invoice
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedProjectId(proj.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    View Details &rarr;
                  </button>
                </div>
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

      {/* Direct Project Invoice Modal */}
      {projectForInvoice && (
        <ProjectInvoiceModal
          isOpen={!!projectForInvoice}
          onClose={() => setProjectForInvoice(null)}
          project={projectForInvoice}
        />
      )}

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
  const { users, tasks, isSuperAdmin, isPM, updateProject, clients = [] } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingManager, setIsChangingManager] = useState(false);
  const [isDetailInvoiceOpen, setIsDetailInvoiceOpen] = useState(false);
  const [selectedNewPmId, setSelectedNewPmId] = useState(project.projectManagerId || 'usr-pm');
  const editFileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: project.name || '',
    clientName: project.clientName || '',
    clientContact: project.clientContact || '',
    description: project.description || '',
    status: project.status || 'ACTIVE',
    priority: project.priority || 'High',
    totalContractValue: project.totalContractValue || 0,
    targetDeliveryDate: project.targetDeliveryDate || '',
    projectManagerId: project.projectManagerId || 'usr-pm',
    requirementDoc: project.requirementDoc || null
  });

  if (!project) return null;

  const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'md', 'zip'];
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  const handleEditFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
      alert('Invalid file format. Only PDF, DOC, MD, and ZIP files are allowed.');
      if (editFileInputRef.current) editFileInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert('File size exceeds the 2MB limit. Please upload a file smaller than 2MB.');
      if (editFileInputRef.current) editFileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      let sizeStr = '';
      if (file.size < 1024) sizeStr = `${file.size} B`;
      else if (file.size < 1024 * 1024) sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      else sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      setForm(prev => ({
        ...prev,
        requirementDoc: {
          name: file.name,
          size: sizeStr,
          type: file.type || 'application/octet-stream',
          dataUrl: reader.result,
          uploadedAt: new Date().toISOString()
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const projectTasks = tasks.filter((t) => t.projectId === project.id && (isSuperAdmin() || isPM() ? true : t.status !== 'BACKLOG'));
  const completedTasks = projectTasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgressTasks = projectTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const inReviewTasks = projectTasks.filter((t) => t.status === 'PENDING_REVIEW').length;
  const blockedTasks = projectTasks.filter((t) => t.isBlocked).length;

  const currentPm = users.find((u) => u.id === project.projectManagerId);
  const availablePMs = users.filter((u) => u.role === 'PROJECT_MANAGER' || u.role === 'SUPER_ADMIN');

  // Assigned team members
  const assignedTeamMembers = users.filter((u) => project.assignedTeamIds?.includes(u.id));

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
    const newTcv = Number(form.totalContractValue) || 0;
    const currentGross = typeof project.grossInvoiced === 'number' ? project.grossInvoiced : 0;
    if (newTcv < currentGross) {
      alert(`Total Contract Value ($${newTcv.toLocaleString()}) cannot be less than the already invoiced amount of $${currentGross.toLocaleString()}.`);
      return;
    }

    updateProject(project.id, {
      name: form.name.trim(),
      clientName: form.clientName.trim(),
      clientContact: form.clientContact.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      totalContractValue: newTcv,
      targetDeliveryDate: form.targetDeliveryDate,
      projectManagerId: form.projectManagerId,
      requirementDoc: form.requirementDoc || null
    });
    setIsEditing(false);
  };

  const isConfidential = project.totalContractValue === 'CONFIDENTIAL';
  const tcv = typeof project.totalContractValue === 'number' ? project.totalContractValue : 0;
  const grossInvoiced = typeof project.grossInvoiced === 'number' ? project.grossInvoiced : 0;
  const ar = typeof project.accountsReceivable === 'number' ? project.accountsReceivable : 0;
  const remainingCap = Math.max(0, tcv - grossInvoiced);
  const percentInvoiced = tcv > 0 ? Math.round((grossInvoiced / tcv) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto custom-scrollbar">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fadeIn" onClick={onClose} />

      <div className="min-h-full flex items-start justify-center p-3 sm:p-5 pt-8 sm:pt-12 md:pt-14 pb-12">
        <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-[#111827] border border-slate-700/80 rounded-3xl shadow-2xl z-10 overflow-hidden animate-scaleUp text-slate-200">

          {/* Header with Client Info and Project Title */}
          <div className="shrink-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 p-6 sm:p-7 bg-[#182234]/50">
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

              {isSuperAdmin() && project.clientContact && (
                <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Client Contact: <span className="text-slate-200">{project.clientContact}</span>
                </p>
              )}

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl pt-1">
                {project.description}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start flex-wrap justify-end">
              {(isSuperAdmin() || isPM()) && !isEditing && (
                project.status !== 'COMPLETED' ? (
                  <button
                    onClick={() => {
                      if (window.confirm(`Mark project "${project.name}" as Completed?`)) {
                        updateProject(project.id, { status: 'COMPLETED' });
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/30"
                    title="Mark Project as Completed"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark Completed
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (window.confirm(`Reopen "${project.name}" and mark as Active?`)) {
                        updateProject(project.id, { status: 'ACTIVE' });
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
                    title="Reopen Project"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reopen Project
                  </button>
                )
              )}

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
                      targetDeliveryDate: project.targetDeliveryDate || '',
                      projectManagerId: project.projectManagerId || 'usr-pm',
                      requirementDoc: project.requirementDoc || null
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
                className="p-1.5 rounded-xl bg-[#182234] hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-700"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
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

                {/* Requirement Document Field in Edit Mode */}
                <div className="p-3.5 rounded-xl bg-[#0e1420] border border-slate-700/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" /> Requirement Document
                    </label>
                    <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <Lock className="w-3 h-3" /> Admin & PM Access Only
                    </span>
                  </div>

                  <input
                    type="file"
                    ref={editFileInputRef}
                    onChange={handleEditFileUpload}
                    accept=".pdf,.doc,.docx,.md,.zip"
                    className="hidden"
                  />

                  {form.requirementDoc ? (
                    <div className="p-3 rounded-lg bg-[#141d2c] border border-indigo-500/30 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{form.requirementDoc.name}</p>
                          <p className="text-[10px] text-slate-400">{form.requirementDoc.size || 'Document attached'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => editFileInputRef.current?.click()}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, requirementDoc: null })}
                          className="p-1 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Remove requirement doc"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => editFileInputRef.current?.click()}
                      className="p-3 rounded-lg border border-dashed border-slate-700 hover:border-indigo-500/60 cursor-pointer text-center bg-[#141d2c]/50 hover:bg-[#141d2c] transition-all"
                    >
                      <p className="text-xs font-medium text-slate-300">Click to upload requirement document (PDF, DOC, MD, ZIP)</p>
                      <p className="text-[10px] text-slate-400 font-medium">Max size: 2MB</p>
                    </div>
                  )}

                  <input
                    type="url"
                    value={form.requirementDoc?.docUrl || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm(prev => ({
                        ...prev,
                        requirementDoc: prev.requirementDoc
                          ? { ...prev.requirementDoc, docUrl: val }
                          : val ? { name: 'External Requirement Spec', docUrl: val, uploadedAt: new Date().toISOString() } : null
                      }));
                    }}
                    placeholder="Or external document URL (e.g. Google Docs / Notion PRD)"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#141d2c] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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

            {/* 1. PROJECT MANAGER SECTION */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-400" /> Assigned Project Manager
                </h3>

                {isSuperAdmin() && !isChangingManager && (
                  <button
                    onClick={() => {
                      setSelectedNewPmId(project.projectManagerId || 'usr-pm');
                      setIsChangingManager(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-bold transition-all border border-indigo-500/30 flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Reassign Project Manager
                  </button>
                )}
              </div>

              {!isChangingManager ? (
                <div className="p-4 rounded-xl bg-[#182234] border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={currentPm?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'}
                      alt={currentPm?.name || 'Project Manager'}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/40"
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

                  <div className="text-left sm:text-right sm:border-l sm:border-slate-700/60 sm:pl-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Department</span>
                    <span className="text-xs font-bold text-white">{currentPm?.department || 'Operations'}</span>
                    <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">● Active Lead</span>
                  </div>
                </div>
              ) : (
                /* Super Admin PM Reassignment Selector Form */
                <div className="p-4 rounded-xl bg-[#182234] border border-indigo-500/50 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-indigo-400">
                      Select New Project Manager for &quot;{project.name}&quot;:
                    </label>
                    <span className="text-[10px] text-amber-400 font-mono">Super Admin Action</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <select
                        value={selectedNewPmId}
                        onChange={(e) => setSelectedNewPmId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1420] border border-indigo-500/50 text-xs text-white font-semibold focus:outline-none focus:border-indigo-400"
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

            {/* Requirement Document Section - Executive & PM Access Only */}
            {(isSuperAdmin() || isPM()) && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-400" /> Project Requirement Document
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-500/20 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Admin & PM Only
                    </span>
                  </div>

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
                          targetDeliveryDate: project.targetDeliveryDate || '',
                          projectManagerId: project.projectManagerId || 'usr-pm',
                          requirementDoc: project.requirementDoc || null
                        });
                        setIsEditing(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-bold transition-all border border-indigo-500/30 flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> {project.requirementDoc ? 'Update Requirement Doc' : 'Attach Requirement Doc'}
                    </button>
                  )}
                </div>

                {project.requirementDoc ? (
                  <div className="p-4 rounded-xl bg-[#182234] border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-indigo-500/40 transition-colors">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center shrink-0 text-indigo-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white truncate font-mono">
                            {project.requirementDoc.name || 'Requirement Specification'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-bold font-mono border border-emerald-500/20">
                            SPEC CONFIDENTIAL
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          {project.requirementDoc.size && <span className="font-mono">{project.requirementDoc.size}</span>}
                          {project.requirementDoc.uploadedAt && (
                            <span>• Uploaded {new Date(project.requirementDoc.uploadedAt).toLocaleDateString()}</span>
                          )}
                        </p>
                        {project.requirementDoc.notes && (
                          <p className="text-xs text-slate-300 mt-1 italic">
                            &quot;{project.requirementDoc.notes}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      {project.requirementDoc.dataUrl && (
                        <a
                          href={project.requirementDoc.dataUrl}
                          download={project.requirementDoc.name || 'Project_Requirements.pdf'}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                        >
                          <Download className="w-3.5 h-3.5" /> Download / View
                        </a>
                      )}
                      {project.requirementDoc.docUrl && (
                        <a
                          href={project.requirementDoc.docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Open Link
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#182234] border border-dashed border-slate-700/80 text-center">
                    <p className="text-xs text-slate-400">
                      No requirement document has been uploaded for this project yet.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 2. FINANCIAL METRICS & GOVERNANCE (Super Admin only) */}
            {isSuperAdmin() && !isConfidential && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" /> Commercial Financial Governance (TCV)
                  </h3>
                  {remainingCap > 0 && (
                    <button
                      onClick={() => setIsDetailInvoiceOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Invoice Client
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Remaining Cap</span>
                    <span className="text-base font-extrabold text-cyan-400 font-mono">${remainingCap.toLocaleString()}</span>
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

            {/* 4. ASSIGNED TEAM MEMBERS & PARTNERS */}
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
      </div>

      {/* Direct Invoicing Modal for Project */}
      {isDetailInvoiceOpen && (
        <ProjectInvoiceModal
          isOpen={isDetailInvoiceOpen}
          onClose={() => setIsDetailInvoiceOpen(false)}
          project={project}
        />
      )}
    </div>
  );
};
