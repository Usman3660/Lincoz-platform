import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Building2,
  UserCheck,
  Globe,
  Phone,
  Mail,
  Percent,
  FolderKanban,
  FileText,
  Save,
  Trash2,
  Edit2
} from 'lucide-react';

export const ClientDetailModal = ({ isOpen, onClose, client }) => {
  const { updateClient, deleteClient, projects, isSuperAdmin } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    contactNumber: '',
    email: '',
    percentage: '',
    skills: '',
    notes: '',
    associatedProjects: []
  });
  const [errors, setErrors] = useState({});
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        country: client.country || '',
        contactNumber: client.contactNumber || '',
        email: client.email || '',
        percentage: client.percentage !== null && client.percentage !== undefined ? String(client.percentage) : '15.0',
        skills: client.skills || '',
        notes: client.notes || '',
        associatedProjects: client.associatedProjects || []
      });
      setIsEditing(false);
      setIsConfirmingDelete(false);
      setErrors({});
    }
  }, [client]);

  if (!isOpen || !client) return null;

  const isFreelancer = client.category === 'FREELANCER';

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (isFreelancer) {
      const pct = parseFloat(formData.percentage);
      if (isNaN(pct) || pct < 0 || pct > 100) {
        newErrors.percentage = 'Percentage must be between 0.0% and 100.0%';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    updateClient(client.id, {
      name: formData.name.trim(),
      country: formData.country.trim(),
      contactNumber: formData.contactNumber.trim(),
      email: formData.email.trim(),
      percentage: isFreelancer ? parseFloat(formData.percentage) : null,
      skills: formData.skills.trim(),
      notes: formData.notes.trim(),
      associatedProjects: formData.associatedProjects
    });

    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteClient(client.id);
    onClose();
  };

  const toggleProject = (projectId) => {
    setFormData(prev => {
      const exists = prev.associatedProjects.includes(projectId);
      return {
        ...prev,
        associatedProjects: exists
          ? prev.associatedProjects.filter(id => id !== projectId)
          : [...prev.associatedProjects, projectId]
      };
    });
  };

  const associatedProjectObjs = (projects || []).filter(p => (formData.associatedProjects || []).includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto custom-scrollbar">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fadeIn" onClick={onClose} />
      
      <div className="min-h-full flex items-start justify-center p-3 sm:p-5 pt-8 sm:pt-12 md:pt-14 pb-12">
        <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col bg-[#111827] border border-slate-700/80 rounded-3xl shadow-2xl z-10 overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#182234]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#182234] border border-slate-700/80 text-indigo-400 flex items-center justify-center">
              {isFreelancer ? <UserCheck className="w-5 h-5 text-emerald-400" /> : <Building2 className="w-5 h-5 text-indigo-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white truncate max-w-xs">
                  {client.name}
                </h2>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  isFreelancer
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                }`}>
                  {isFreelancer ? 'Source' : 'Client'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Globe className="w-3 h-3 text-slate-400" /> {client.country}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSuperAdmin() && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded-lg bg-[#182234] hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-indigo-400" /> Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          
          {/* Details Form / View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {isFreelancer ? 'Source Name' : 'Client Name'}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#182234] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <p className="text-xs font-semibold text-white bg-[#182234] p-2.5 rounded-xl border border-slate-700/80">
                  {client.name}
                </p>
              )}
              {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" /> Country
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full bg-[#182234] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <p className="text-xs font-semibold text-white bg-[#182234] p-2.5 rounded-xl border border-slate-700/80">
                  {client.country}
                </p>
              )}
              {errors.country && <p className="text-[11px] text-rose-400 mt-1">{errors.country}</p>}
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Contact Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="w-full bg-[#182234] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <p className="text-xs font-semibold text-slate-200 bg-[#182234] p-2.5 rounded-xl border border-slate-700/80 font-mono">
                  {client.contactNumber}
                </p>
              )}
              {errors.contactNumber && <p className="text-[11px] text-rose-400 mt-1">{errors.contactNumber}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#182234] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <p className="text-xs font-semibold text-slate-200 bg-[#182234] p-2.5 rounded-xl border border-slate-700/80 font-mono truncate">
                  {client.email}
                </p>
              )}
              {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Freelancer Commission Rate & Skills */}
          {isFreelancer && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-emerald-400" /> Project Share Percentage
                </label>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.percentage}
                      onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                      className="w-full bg-[#182234] border border-slate-700/80 rounded-xl pl-3.5 pr-8 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">%</span>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-emerald-400 bg-[#182234] p-2.5 rounded-xl border border-slate-700/80 font-mono">
                    {client.percentage}%
                  </p>
                )}
                {errors.percentage && <p className="text-[11px] text-rose-400 mt-1">{errors.percentage}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Skills & Expertise
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    className="w-full bg-[#182234] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                ) : (
                  <p className="text-xs text-slate-300 bg-[#182234] p-2.5 rounded-xl border border-slate-700/80 truncate">
                    {client.skills || 'None specified'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Associated Projects */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5 text-slate-400" /> Associated Projects
            </label>
            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-[#182234] border border-slate-700/80 rounded-xl custom-scrollbar">
                {projects.map((proj) => {
                  const isSelected = formData.associatedProjects.includes(proj.id);
                  return (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => toggleProject(proj.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                          : 'bg-[#111827] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                      />
                      <span className="truncate">{proj.name}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {associatedProjectObjs.length > 0 ? (
                  associatedProjectObjs.map(p => (
                    <span
                      key={p.id}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#182234] border border-slate-700/80 text-slate-300"
                    >
                      {p.name}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No projects linked.</p>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Notes
            </label>
            {isEditing ? (
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-[#182234] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 custom-scrollbar"
              />
            ) : (
              <p className="text-xs text-slate-300 bg-[#182234] p-3 rounded-xl border border-slate-700/80">
                {client.notes || 'No notes provided.'}
              </p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-[#182234]/50">
          <div>
            {isSuperAdmin() && (
              isConfirmingDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400 font-medium">Delete record?</span>
                  <button
                    onClick={handleDelete}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2.5 py-1 bg-slate-800 text-slate-400 text-xs rounded-lg hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsConfirmingDelete(true)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 text-xs font-semibold text-white rounded-xl bg-indigo-600 hover:bg-indigo-500 shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-[#182234] hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  </div>
  );
};
