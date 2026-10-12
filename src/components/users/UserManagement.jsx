import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RoleBadge, WorkModeBadge, CompBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Users,
  Plus,
  ShieldCheck,
  KeyRound,
  Mail,
  Building,
  CheckCircle2,
  Lock,
  Sparkles,
  Edit3,
  Filter,
  DollarSign,
  Percent,
  MapPin,
  Laptop,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

export const UserManagement = () => {
  const { users, createUser, updateUserPassword, isSuperAdmin, isPM, openProfileModal, currentUser } = useApp();

  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(isSuperAdmin() ? 'PROJECT_MANAGER' : 'ONSITE_MEMBER');
  const [workMode, setWorkMode] = useState('ONSITE');
  const [compensationType, setCompensationType] = useState('SALARIED');
  const [salary, setSalary] = useState('');
  const [percentage, setPercentage] = useState('15.0');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Core Engineering');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const handleOpenProvisionModal = () => {
    setRole(isSuperAdmin() ? 'PROJECT_MANAGER' : 'ONSITE_MEMBER');
    setName('');
    setEmail('');
    setTitle('');
    setWorkMode('ONSITE');
    setCompensationType('SALARIED');
    setSalary('');
    setPercentage('15.0');
    setIsProvisionModalOpen(true);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    let finalRole = role;
    if (isPM() && finalRole === 'SUPER_ADMIN') {
      finalRole = 'ONSITE_MEMBER';
    }

    createUser({
      name: name.trim(),
      email: email.trim(),
      role: finalRole,
      workMode,
      compensationType,
      salary: compensationType === 'SALARIED' && salary ? Number(salary) : undefined,
      percentage: compensationType === 'PERCENTAGE' && percentage ? Number(percentage) : undefined,
      title: title.trim() || (finalRole === 'PROJECT_MANAGER' ? 'Project Manager' : 'Software Engineer'),
      department: finalRole === 'PROJECT_MANAGER' ? 'Operations' : department
    });

    setIsProvisionModalOpen(false);
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    setPasswordError('');

    const cleanPass = newPassword.trim();
    if (cleanPass.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    if (cleanPass !== confirmPassword.trim()) {
      setPasswordError('Passwords do not match. Please re-enter.');
      return;
    }

    if (passwordModalUser) {
      const ok = updateUserPassword(passwordModalUser.id, cleanPass);
      if (ok) {
        setPasswordModalUser(null);
        setNewPassword('');
        setConfirmPassword('');
      }
    }
  };

  const baseUsers = isSuperAdmin()
    ? users
    : users.filter(u => u.role !== 'SUPER_ADMIN');

  const filteredUsers = baseUsers.filter(u => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ONSITE') return u.workMode === 'ONSITE';
    if (activeFilter === 'REMOTE') return u.workMode === 'REMOTE';
    if (activeFilter === 'SALARIED') return u.compensationType === 'SALARIED';
    if (activeFilter === 'PERCENTAGE') return u.compensationType === 'PERCENTAGE';
    if (activeFilter === 'PROJECT_MANAGER') return u.role === 'PROJECT_MANAGER';
    return true;
  });

  const filterChips = [
    { id: 'ALL', label: 'All Employees' },
    { id: 'ONSITE', label: 'On-Site Staff' },
    { id: 'REMOTE', label: 'Remote Staff' },
    { id: 'SALARIED', label: 'Salaried' },
    { id: 'PERCENTAGE', label: 'Percentage-Based' },
    ...(isSuperAdmin() ? [{ id: 'PROJECT_MANAGER', label: 'Project Managers' }] : [])
  ];

  const canProvision = isSuperAdmin() || isPM();

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <KeyRound className="w-6 h-6 text-indigo-400" />
            {isSuperAdmin() ? 'Employee Record & Hierarchy' : 'Team Members & Staff Provisioning'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isSuperAdmin()
              ? 'Provision on-site and remote employees (salaried or project percentage share). Public registration is disabled.'
              : 'Project Manager permissions: Provision and manage team engineers and product staff.'}
          </p>
        </div>

        {canProvision && (
          <button
            onClick={handleOpenProvisionModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 shrink-0"
          >
            <Plus className="w-4 h-4" />
            {isSuperAdmin() ? 'Provision New Employee' : 'Provision Team Member'}
          </button>
        )}
      </div>

      {/* Permission Matrix */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Hierarchical Roles & Access Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#182234] text-[10px] uppercase font-bold text-slate-400">
                <th className="py-2.5 px-3">Capability</th>
                <th className="py-2.5 px-3">Super Admin</th>
                <th className="py-2.5 px-3">Project Manager</th>
                <th className="py-2.5 px-3">On-Site Employee</th>
                <th className="py-2.5 px-3">Remote Employee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2 px-3 font-semibold text-white">User Provisioning</td>
                <td className="py-2 px-3 text-emerald-400 font-mono font-bold">Full Platform</td>
                <td className="py-2 px-3 text-indigo-400 font-mono font-bold">Team Staff Only</td>
                <td className="py-2 px-3 text-slate-500">None</td>
                <td className="py-2 px-3 text-slate-500">None</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-white">Compensation Model</td>
                <td className="py-2 px-3 text-slate-300">Salaried / Executive</td>
                <td className="py-2 px-3 text-slate-300">Salaried</td>
                <td className="py-2 px-3 text-teal-400 font-medium">Salaried or %-Based</td>
                <td className="py-2 px-3 text-purple-400 font-medium">Salaried or %-Based</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-white">Project Access</td>
                <td className="py-2 px-3 text-emerald-400 font-mono">Full (CRUD)</td>
                <td className="py-2 px-3 text-indigo-400">Assigned Projects</td>
                <td className="py-2 px-3 text-slate-400">Assigned Tasks</td>
                <td className="py-2 px-3 text-slate-400">Assigned Tasks</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-white">Disbursement Sign-Off</td>
                <td className="py-2 px-3 text-emerald-400 font-mono font-bold">Step-2 Authorization</td>
                <td className="py-2 px-3 text-indigo-400 font-mono">Step-1 Verification</td>
                <td className="py-2 px-3 text-slate-500">None</td>
                <td className="py-2 px-3 text-slate-500">None</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {filterChips.map(chip => (
          <button
            key={chip.id}
            onClick={() => setActiveFilter(chip.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${activeFilter === chip.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-[#182234] text-slate-400 hover:text-white border border-slate-700/80'
              }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((u) => {
          const canEditUser = isSuperAdmin() || u.id === currentUser.id;

          return (
            <div
              key={u.id}
              className="p-5 rounded-2xl bg-[#111827] border border-slate-800 hover:border-indigo-500/40 transition-all space-y-4 shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    loading="lazy"
                    decoding="async"
                    width="44"
                    height="44"
                    className="w-11 h-11 rounded-2xl object-cover ring-2 ring-indigo-500/30"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{u.name}</h4>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {canEditUser && (
                    <button
                      onClick={() => openProfileModal(u)}
                      className="p-1.5 rounded-xl bg-[#182234] hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-300 border border-slate-700/80 text-xs font-semibold flex items-center gap-1 transition-all"
                      title="Edit Employee Profile"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Edit</span>
                    </button>
                  )}

                  {isSuperAdmin() && (
                    <button
                      onClick={() => {
                        setPasswordModalUser(u);
                        setNewPassword('');
                        setConfirmPassword('');
                        setPasswordError('');
                        setShowPassword(false);
                      }}
                      className="p-1.5 rounded-xl bg-[#182234] hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border border-slate-700/80 text-xs font-semibold flex items-center gap-1 transition-all"
                      title={`Change Password for ${u.name}`}
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[11px]">Password</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#182234] border border-slate-700/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Type & Location</span>
                  <div className="flex items-center gap-1.5">
                    <WorkModeBadge mode={u.workMode || 'ONSITE'} />
                    <RoleBadge role={u.role} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Title</span>
                  <span className="text-white font-medium truncate max-w-[160px]">{u.title}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Department</span>
                  <span className="text-slate-300 font-medium truncate max-w-[160px]">{u.department || 'Engineering'}</span>
                </div>

                {/* Compensation info */}
                {(isSuperAdmin() || isPM()) && (
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-700/50">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      {u.compensationType === 'PERCENTAGE' ? (
                        <Percent className="w-3 h-3 text-amber-400" />
                      ) : (
                        <DollarSign className="w-3 h-3 text-emerald-400" />
                      )}
                      Compensation
                    </span>
                    <CompBadge
                      type={u.compensationType || 'SALARIED'}
                      salary={u.salary}
                      percentage={u.percentage}
                    />
                  </div>
                )}

                {/* Password / Credentials Status (Super Admin Only) */}
                {isSuperAdmin() && (
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-700/50">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-400" /> Security
                    </span>
                    <span className="font-mono text-[11px] text-slate-300 flex items-center gap-1">
                      <span className="text-amber-400 font-bold">{u.password ? '●●●●●●●●' : 'Default'}</span>
                      {u.passwordUpdatedAt && (
                        <span className="text-[10px] text-slate-500 font-normal">
                          (Set {new Date(u.passwordUpdatedAt).toLocaleDateString()})
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Provision User Modal */}
      <Modal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
        title={isSuperAdmin() ? 'Provision New Employee' : 'Provision Team Member'}
        subtitle="Configure employee role, workplace mode (On-Site / Remote), and compensation structure."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Liam Sterling"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="liam@lincoz.internal"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
              >
                {isSuperAdmin() && (
                  <>
                    <option value="PROJECT_MANAGER">Project Manager</option>
                    <option value="ONSITE_MEMBER">Team Employee</option>
                  </>
                )}
                {isPM() && (
                  <option value="ONSITE_MEMBER">Team Employee</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={role === 'PROJECT_MANAGER' ? 'Project Manager' : 'Software Engineer'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Work Mode & Compensation Type Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Work Location *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWorkMode('ONSITE')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${workMode === 'ONSITE'
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                      : 'bg-[#182234] text-slate-400 border-slate-700'
                    }`}
                >
                  <Building className="w-3.5 h-3.5" /> On-Site
                </button>
                <button
                  type="button"
                  onClick={() => setWorkMode('REMOTE')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${workMode === 'REMOTE'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                      : 'bg-[#182234] text-slate-400 border-slate-700'
                    }`}
                >
                  <Laptop className="w-3.5 h-3.5" /> Remote
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Compensation Model *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCompensationType('SALARIED')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${compensationType === 'SALARIED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-[#182234] text-slate-400 border-slate-700'
                    }`}
                >
                  <DollarSign className="w-3.5 h-3.5" /> Salaried
                </button>
                <button
                  type="button"
                  onClick={() => setCompensationType('PERCENTAGE')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${compensationType === 'PERCENTAGE'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-[#182234] text-slate-400 border-slate-700'
                    }`}
                >
                  <Percent className="w-3.5 h-3.5" /> % Share
                </button>
              </div>
            </div>
          </div>

          {/* Department & Compensation Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Department / Team
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Core Engineering, UI/UX"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {compensationType === 'SALARIED' ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Annual Salary (USD)
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
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-amber-400" />
                  Project Share Percentage (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.5"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    placeholder="e.g. 15.0"
                    className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsProvisionModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
            >
              Provision Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Super Admin Change Employee Password Modal */}
      {passwordModalUser && (
        <Modal
          isOpen={!!passwordModalUser}
          onClose={() => setPasswordModalUser(null)}
          title="Change Employee Password"
          subtitle={`Admin credential override for ${passwordModalUser.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSavePassword} className="space-y-4">
            {/* User Target Card */}
            <div className="p-3.5 rounded-xl bg-[#182234] border border-slate-700/80 flex items-center gap-3">
              <img
                src={passwordModalUser.avatar}
                alt={passwordModalUser.name}
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-amber-500/40"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white truncate">{passwordModalUser.name}</h4>
                  <RoleBadge role={passwordModalUser.role} />
                </div>
                <p className="text-[11px] text-slate-400 truncate">{passwordModalUser.email}</p>
                <p className="text-[10px] text-indigo-400 font-medium">{passwordModalUser.title}</p>
              </div>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {/* Password input with toggle & auto-generate */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300">
                  New Password *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const generated = 'Lincoz#' + Math.floor(1000 + Math.random() * 9000) + '!';
                    setNewPassword(generated);
                    setConfirmPassword(generated);
                    setShowPassword(true);
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3" /> Auto-Generate
                </button>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters..."
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password..."
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              The employee will immediately be required to use this new password to sign in.
            </p>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" /> Save Password
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
