import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { RoleBadge } from '../common/Badge';
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
  CreditCard,
  DollarSign
} from 'lucide-react';

export const EditProfileModal = ({ isOpen, onClose, userToEdit = null }) => {
  const {
    currentUser,
    updateUser,
    isSuperAdmin,
    contractors,
    setContractors,
    pushNotification,
    recordAuditLog,
    closeProfileModal
  } = useApp();

  const fileInputRef = useRef(null);

  // Target user is either passed userToEdit (e.g. from admin) or currently active user
  const targetUser = userToEdit || currentUser;

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [skills, setSkills] = useState('');
  const [salary, setSalary] = useState('');

  // Contractor-specific fields (if role is PARTNER)
  const [legalName, setLegalName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [taxClassification, setTaxClassification] = useState('Individual / Contractor');
  const [payoutChannel, setPayoutChannel] = useState('Wise Wire Transfer');
  const [payoutDetails, setPayoutDetails] = useState('');

  // Sync state whenever modal opens or targetUser changes
  useEffect(() => {
    if (targetUser && isOpen) {
      setName(targetUser.name || '');
      setEmail(targetUser.email || '');
      setTitle(targetUser.title || '');
      setDepartment(targetUser.department || targetUser.organization || '');
      setPhone(targetUser.phone || '+1 (555) 019-2834');
      setLocation(targetUser.location || 'San Francisco, CA (UTC-7)');
      setBio(targetUser.bio || 'Passionate software and engineering professional contributing to high-velocity delivery.');
      setAvatar(targetUser.avatar || '');
      setSkills(targetUser.skills ? targetUser.skills.join(', ') : 'React, Node.js, TypeScript, Cloud Architecture');
      setSalary(targetUser.salary !== undefined && targetUser.salary !== null ? String(targetUser.salary) : '');

      const cRec = (contractors || []).find(c => c.userId === targetUser.id);
      setLegalName(cRec?.legalName || `${targetUser.name} LLC`);
      setTaxId(cRec?.taxId || 'US-EIN-992019');
      setTaxClassification(cRec?.taxClassification || 'Individual / Contractor');
      setPayoutChannel(cRec?.defaultPayoutChannel || 'Wise Wire Transfer');
      setPayoutDetails(cRec?.payoutDetails || 'wise://account/contractor');
    }
  }, [targetUser, isOpen, contractors]);

  if (!isOpen || !targetUser) return null;

  // Security barrier: non-Super Admins cannot view or edit Super Admin or other Project Managers
  if (currentUser.role !== 'SUPER_ADMIN' && targetUser.id !== currentUser.id) {
    if (targetUser.role === 'SUPER_ADMIN' || targetUser.role === 'PROJECT_MANAGER') {
      return null;
    }
  }

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
    if (typeof closeProfileModal === 'function') {
      closeProfileModal();
    }
  };

  // File upload handler (from PC / mobile device)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WEBP, GIF, SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please choose a smaller image.');
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

  // Preset avatar samples for fast picking
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

    if (currentUser.role !== 'SUPER_ADMIN' && targetUser.id !== currentUser.id) {
      if (targetUser.role === 'SUPER_ADMIN' || targetUser.role === 'PROJECT_MANAGER') {
        alert('Security Policy Violation: You do not have authorization to edit other managers or Super Admin accounts.');
        return;
      }
    }

    if (!name.trim()) {
      alert('Please provide a valid name.');
      return;
    }

    const parsedSkills = typeof skills === 'string'
      ? skills.split(',').map(s => s.trim()).filter(Boolean)
      : Array.isArray(skills) ? skills : [];

    const updatedData = {
      name: name.trim(),
      email: email.trim(),
      title: title.trim(),
      department: department.trim(),
      organization: department.trim(),
      phone: phone.trim(),
      location: location.trim(),
      bio: bio.trim(),
      avatar: avatar || targetUser.avatar,
      skills: parsedSkills,
      salary: isSuperAdmin() && (targetUser.role === 'ONSITE_MEMBER' || targetUser.role === 'PROJECT_MANAGER')
        ? (salary ? Number(salary) : undefined)
        : targetUser.salary
    };

    try {
      updateUser(targetUser.id, updatedData);

      // Update contractor records if partner
      if (targetUser.role === 'PARTNER' && setContractors) {
        setContractors(prev => prev.map(c => {
          if (c.userId === targetUser.id) {
            return {
              ...c,
              legalName,
              taxId,
              taxClassification,
              defaultPayoutChannel: payoutChannel,
              payoutDetails
            };
          }
          return c;
        }));
      }

      recordAuditLog({
        actionType: 'USER_PROVISIONED',
        itemText: `User ${targetUser.name} updated profile information and avatar photo.`,
        previousState: null,
        newState: null
      });

      pushNotification(
        'Profile Updated',
        `Profile information for ${name.trim()} was updated successfully.`,
        'success'
      );
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Clickable Backdrop */}
      <div className="fixed inset-0" onClick={handleClose} />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl bg-[#111827] border border-slate-700 rounded-3xl shadow-2xl z-10 my-auto overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header (Pinned) */}
        <div className="shrink-0 bg-gradient-to-r from-indigo-950 via-slate-900 to-[#182234] px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Edit User Profile
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300">
                Update personal details, contact information, and profile picture.
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
          
          {/* Avatar Upload Section */}
          <div className="p-4 rounded-2xl bg-[#182234] border border-slate-700/80 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Profile Photo & Device Upload
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Photo Preview */}
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

              {/* Upload Controls */}
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

                <p className="text-[11px] text-slate-400">
                  Select any PNG, JPG, JPEG, WEBP or SVG image file from your PC or device.
                </p>

                {/* Preset Avatars */}
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

          {/* Primary Profile Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Full Name */}
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

            {/* Email Address */}
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

            {/* Job Title */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">
                Job Title & Role Headline
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lead Technical Project Manager"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Department / Company */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">
                Department / Company
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Engineering Operations"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Phone Number */}
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

            {/* Location & Timezone */}
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

            {/* Base Salary (Super Admin exclusive) */}
            {isSuperAdmin() && (targetUser.role === 'ONSITE_MEMBER' || targetUser.role === 'PROJECT_MANAGER') && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Annual Base Salary (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g. 120000"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Skills */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-300">
              Skills & Expertise (Comma separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, Node.js, Python, Agile Scrum, System Architecture"
              className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Bio Statement */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-300">
              Professional Bio & Summary
            </label>
            <textarea
              rows="2"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief summary about your role, background, and responsibilities..."
              className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Security Clearance Display */}
          <div className="p-3.5 rounded-2xl bg-[#182234]/70 border border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Assigned Security Clearance
                </span>
                <span className="text-[10px] text-slate-400">
                  Role permissions are governed via system RBAC matrix.
                </span>
              </div>
            </div>
            <RoleBadge role={targetUser.role} />
          </div>

          {/* Contractor Legal & Payout Settings (Visible for Partner role) */}
          {targetUser.role === 'PARTNER' && (
            <div className="p-4 rounded-2xl bg-[#182234] border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Contractor Legal & Disbursement Setup
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Legal Entity Name
                  </label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Tax ID / EIN / VAT
                  </label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Default Payout Channel
                  </label>
                  <select
                    value={payoutChannel}
                    onChange={(e) => setPayoutChannel(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Wise Wire Transfer">Wise Wire Transfer</option>
                    <option value="Direct ACH / Bank Wire">Direct ACH / Bank Wire</option>
                    <option value="Stripe Connect Express">Stripe Connect Express</option>
                    <option value="USDC Polygon Crypto">USDC Polygon Crypto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Payout Details / Account Ref
                  </label>
                  <input
                    type="text"
                    value={payoutDetails}
                    onChange={(e) => setPayoutDetails(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions (Pinned inside form) */}
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
              <CheckCircle2 className="w-4 h-4" /> Save Profile Changes
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
