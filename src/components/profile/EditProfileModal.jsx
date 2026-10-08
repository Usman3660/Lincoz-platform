import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { RoleBadge, WorkModeBadge, CompBadge } from '../common/Badge';
import {
  User,
  Upload,
  Camera,
  Mail,
  Briefcase,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  Building,
  DollarSign,
  Percent,
  Laptop,
  Lock,
  Info
} from 'lucide-react';

export const EditProfileModal = ({ isOpen, onClose, userToEdit = null }) => {
  const {
    currentUser,
    updateUser,
    isSuperAdmin,
    pushNotification,
    recordAuditLog,
    closeProfileModal
  } = useApp();

  const fileInputRef = useRef(null);
  const targetUser = userToEdit || currentUser;
  const isEditingOther = isSuperAdmin() && targetUser?.id !== currentUser?.id;

  // Basic Info (Super Admin editable for other employees + Self editable)
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState('ONSITE');
  const [compensationType, setCompensationType] = useState('SALARIED');
  const [salary, setSalary] = useState('');
  const [percentage, setPercentage] = useState('');

  // Personal Info (Self-managed only)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [skills, setSkills] = useState('');

  useEffect(() => {
    if (targetUser && isOpen) {
      // Basic / Org info
      setTitle(targetUser.title || '');
      setDepartment(targetUser.department || '');
      setLocation(targetUser.location || 'San Francisco, CA (UTC-7)');
      setWorkMode(targetUser.workMode || 'ONSITE');
      setCompensationType(targetUser.compensationType || 'SALARIED');
      setSalary(targetUser.salary !== undefined && targetUser.salary !== null ? String(targetUser.salary) : '');
      setPercentage(targetUser.percentage !== undefined && targetUser.percentage !== null ? String(targetUser.percentage) : '');

      // Personal info
      setName(targetUser.name || '');
      setEmail(targetUser.email || '');
      setPhone(targetUser.phone || '+1 (555) 019-2834');
      setBio(targetUser.bio || 'Passionate software and engineering professional contributing to high-velocity delivery.');
      setAvatar(targetUser.avatar || '');
      setSkills(targetUser.skills ? targetUser.skills.join(', ') : 'React, Node.js, TypeScript, Cloud Architecture');
    }
  }, [targetUser, isOpen]);

  if (!isOpen || !targetUser) return null;

  // Security gate: non-super admin cannot edit other users
  if (!isSuperAdmin() && targetUser.id !== currentUser.id) {
    return null;
  }

  const handleClose = () => {
    if (typeof onClose === 'function') onClose();
    if (typeof closeProfileModal === 'function') closeProfileModal();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target?.result;
      if (typeof base64Data === 'string') {
        setAvatar(base64Data);
      }
    };
    reader.readAsDataURL(file);
  };

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  ];

  const handleSave = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    let updatedData = {};

    if (isEditingOther) {
      // Super Admin editing other employees: strictly update Department, Title, Location, and Compensation
      if (!title.trim() || !department.trim()) {
        alert('Please provide valid Department and Job Title.');
        return;
      }

      updatedData = {
        title: title.trim(),
        department: department.trim(),
        location: location.trim(),
        workMode,
        compensationType,
        salary: compensationType === 'SALARIED' && salary ? Number(salary) : undefined,
        percentage: compensationType === 'PERCENTAGE' && percentage ? Number(percentage) : undefined,
      };

      recordAuditLog({
        actionType: 'USER_PROVISIONED',
        itemText: `Super Admin updated organizational profile for ${targetUser.name} (${department.trim()} • ${title.trim()}).`,
        previousState: {
          title: targetUser.title,
          department: targetUser.department,
          location: targetUser.location,
          compensationType: targetUser.compensationType,
          salary: targetUser.salary,
          percentage: targetUser.percentage,
          workMode: targetUser.workMode
        },
        newState: {
          title: title.trim(),
          department: department.trim(),
          location: location.trim(),
          compensationType,
          salary: compensationType === 'SALARIED' && salary ? Number(salary) : undefined,
          percentage: compensationType === 'PERCENTAGE' && percentage ? Number(percentage) : undefined,
          workMode
        }
      });
    } else {
      // User editing their own profile
      if (!name.trim()) {
        alert('Please provide a valid name.');
        return;
      }

      const parsedSkills = typeof skills === 'string'
        ? skills.split(',').map(s => s.trim()).filter(Boolean)
        : Array.isArray(skills) ? skills : [];

      updatedData = {
        name: name.trim(),
        email: email.trim(),
        title: title.trim(),
        department: department.trim(),
        phone: phone.trim(),
        location: location.trim(),
        bio: bio.trim(),
        avatar: avatar || targetUser.avatar,
        skills: parsedSkills,
        workMode: isSuperAdmin() ? workMode : (targetUser.workMode || 'ONSITE'),
        compensationType: isSuperAdmin() ? compensationType : (targetUser.compensationType || 'SALARIED'),
        salary: isSuperAdmin()
          ? (compensationType === 'SALARIED' && salary ? Number(salary) : undefined)
          : targetUser.salary,
        percentage: isSuperAdmin()
          ? (compensationType === 'PERCENTAGE' && percentage ? Number(percentage) : undefined)
          : targetUser.percentage
      };

      recordAuditLog({
        actionType: 'USER_PROVISIONED',
        itemText: `User ${targetUser.name} updated their personal profile information.`,
        previousState: null,
        newState: null
      });
    }

    try {
      updateUser(targetUser.id, updatedData);

      pushNotification(
        'Profile Saved',
        isEditingOther
          ? `Organizational terms for ${targetUser.name} were updated successfully.`
          : `Your profile details have been saved.`,
        'success'
      );
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto custom-scrollbar">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={handleClose} />

      <div className="min-h-full flex items-start justify-center p-3 sm:p-5 pt-8 sm:pt-12 md:pt-14 pb-12">
        <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#111827] border border-slate-700 rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col animate-scaleUp">
        
        {/* Header */}
        <div className="shrink-0 bg-[#182234]/60 px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              {isEditingOther ? <Building className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                {isEditingOther ? `Edit Employee Record: ${targetUser.name}` : 'My Profile Settings'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300">
                {isEditingOther
                  ? 'Super Admin Administration: Update department, title, location, and compensation.'
                  : 'Update your personal details, contact info, and profile avatar.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
          
          {/* ============================================================== */}
          {/* CASE 1: SUPER ADMIN EDITING ANOTHER EMPLOYEE                   */}
          {/* Only Department, Title, Location, and Compensation are editable */}
          {/* ============================================================== */}
          {isEditingOther ? (
            <>
              {/* Employee Identity Read-Only Card */}
              <div className="p-4 rounded-2xl bg-[#182234] border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={targetUser.avatar}
                    alt={targetUser.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-md shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{targetUser.name}</h3>
                      <RoleBadge role={targetUser.role} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{targetUser.email}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-800">
                        <Lock className="w-3 h-3 text-slate-400" /> Identity & personal info managed by employee
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Current Status</span>
                  <div className="flex items-center gap-1.5">
                    <WorkModeBadge mode={targetUser.workMode || 'ONSITE'} />
                    <CompBadge
                      type={targetUser.compensationType || 'SALARIED'}
                      salary={targetUser.salary}
                      percentage={targetUser.percentage}
                    />
                  </div>
                </div>
              </div>

              {/* Info Notice */}
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Super Admin Governance:</strong> You have administrative rights to adjust this employee&apos;s <strong>Department</strong>, <strong>Job Title</strong>, <strong>Location</strong>, and <strong>Compensation Terms</strong>.
                </span>
              </div>

              {/* Basic Info: Department, Title, Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Department / Team <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Core Engineering, Product, DevOps"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Job Title <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Senior Backend Architect"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Assigned Location & Timezone
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. San Francisco, CA (UTC-7) or London, UK (UTC+0)"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Workplace Mode & Compensation Governance */}
              <div className="p-4 rounded-2xl bg-[#182234] border border-indigo-500/30 space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-indigo-400" /> Workplace & Compensation Governance
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Work Location
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setWorkMode('ONSITE')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                          workMode === 'ONSITE'
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <Building className="w-3.5 h-3.5" /> On-Site
                      </button>
                      <button
                        type="button"
                        onClick={() => setWorkMode('REMOTE')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                          workMode === 'REMOTE'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <Laptop className="w-3.5 h-3.5" /> Remote
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Compensation Model
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCompensationType('SALARIED')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                          compensationType === 'SALARIED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <DollarSign className="w-3.5 h-3.5" /> Salaried
                      </button>
                      <button
                        type="button"
                        onClick={() => setCompensationType('PERCENTAGE')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                          compensationType === 'PERCENTAGE'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <Percent className="w-3.5 h-3.5" /> % Share
                      </button>
                    </div>
                  </div>
                </div>

                {compensationType === 'SALARIED' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Annual Salary (USD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="e.g. 120000"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-amber-400" /> Project Share Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      max="100"
                      step="0.5"
                      value={percentage}
                      onChange={(e) => setPercentage(e.target.value)}
                      placeholder="e.g. 15.0"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ============================================================== */
            /* CASE 2: USER EDITING THEIR OWN PROFILE                          */
            /* ============================================================== */
            <>
              {/* Avatar Section */}
              <div className="p-4 rounded-2xl bg-[#182234] border border-slate-700/80 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Profile Photo & Device Upload
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group shrink-0">
                    <img
                      src={avatar || targetUser.avatar}
                      alt={name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-indigo-500/50 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1"
                    >
                      <Camera className="w-4 h-4" /> Change
                    </button>
                  </div>

                  <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload from PC / Device
                      </button>

                      <button
                        type="button"
                        onClick={() => setAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || 'user')}`)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all border border-slate-700 flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Generate Avatar
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-700/60">
                      <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                        Or select a preset avatar:
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        {presetAvatars.map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setAvatar(url)}
                            className={`shrink-0 w-7 h-7 rounded-xl overflow-hidden ring-2 transition-transform hover:scale-105 ${
                              avatar === url ? 'ring-indigo-500 scale-105' : 'ring-transparent opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sarah@lincoz.com"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Job Title
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Department / Team
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Core Engineering"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Location & Timezone
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. San Francisco, CA (UTC-7)"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Super Admin editing own compensation */}
              {isSuperAdmin() && (
                <div className="p-4 rounded-2xl bg-[#182234] border border-indigo-500/30 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Workplace & Compensation Governance (Admin)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Work Location
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setWorkMode('ONSITE')}
                          className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                            workMode === 'ONSITE'
                              ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                              : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          <Building className="w-3 h-3" /> On-Site
                        </button>
                        <button
                          type="button"
                          onClick={() => setWorkMode('REMOTE')}
                          className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                            workMode === 'REMOTE'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                              : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          <Laptop className="w-3 h-3" /> Remote
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Compensation Model
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setCompensationType('SALARIED')}
                          className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                            compensationType === 'SALARIED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                              : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          <DollarSign className="w-3 h-3" /> Salaried
                        </button>
                        <button
                          type="button"
                          onClick={() => setCompensationType('PERCENTAGE')}
                          className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                            compensationType === 'PERCENTAGE'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                              : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          <Percent className="w-3 h-3" /> % Share
                        </button>
                      </div>
                    </div>
                  </div>

                  {compensationType === 'SALARIED' ? (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-400" /> Annual Salary (USD)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        placeholder="e.g. 120000"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                        <Percent className="w-3 h-3 text-amber-400" /> Project Share Percentage (%)
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        max="100"
                        step="0.5"
                        value={percentage}
                        onChange={(e) => setPercentage(e.target.value)}
                        placeholder="e.g. 15.0"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Skills */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  Skills & Expertise (Comma separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. React, Node.js, Python, System Architecture"
                  className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  Professional Bio & Summary
                </label>
                <textarea
                  rows="2"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief summary about your role and responsibilities..."
                  className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

          {/* Security Clearance & Role Badge */}
          <div className="p-3.5 rounded-2xl bg-[#182234]/70 border border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Security Clearance & Tier
                </span>
                <span className="text-[10px] text-slate-400">
                  Role permissions governed via system RBAC matrix.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WorkModeBadge mode={targetUser.workMode || 'ONSITE'} />
              <RoleBadge role={targetUser.role} />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Save {isEditingOther ? 'Record Changes' : 'Profile Changes'}
            </button>
          </div>

        </form>

      </div>
    </div>
  </div>
  );
};
