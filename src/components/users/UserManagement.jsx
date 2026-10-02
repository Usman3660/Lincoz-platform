import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RoleBadge } from '../common/Badge';
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
  Filter
} from 'lucide-react';

export const UserManagement = () => {
  const { users, createUser, isSuperAdmin, isPM, openProfileModal } = useApp();

  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // Default role based on who is logged in
  const [role, setRole] = useState(isSuperAdmin() ? 'PROJECT_MANAGER' : 'ONSITE_MEMBER');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Core Engineering');
  const [organization, setOrganization] = useState('');
  const [taxId, setTaxId] = useState('');
  const [payoutChannel, setPayoutChannel] = useState('Wise Multi-Currency Wire');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const handleOpenProvisionModal = () => {
    setRole(isSuperAdmin() ? 'PROJECT_MANAGER' : 'ONSITE_MEMBER');
    setName('');
    setEmail('');
    setTitle('');
    setOrganization('');
    setTaxId('');
    setIsProvisionModalOpen(true);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    // PM can only create ONSITE_MEMBER or PARTNER
    let finalRole = role;
    if (isPM() && finalRole === 'SUPER_ADMIN') {
      finalRole = 'ONSITE_MEMBER';
    }

    createUser({
      name: name.trim(),
      email: email.trim(),
      role: finalRole,
      title: title.trim() || (finalRole === 'PROJECT_MANAGER' ? 'Project Manager' : finalRole === 'PARTNER' ? 'Contractor Partner' : 'Software Engineer'),
      department: finalRole === 'PARTNER' ? 'External Contractor' : finalRole === 'PROJECT_MANAGER' ? 'Operations' : department,
      organization: finalRole === 'PARTNER' ? (organization.trim() || `${name.trim()} LLC`) : undefined,
      taxId: finalRole === 'PARTNER' ? (taxId.trim() || 'XX-XXX-PENDING') : undefined,
      payoutChannel: finalRole === 'PARTNER' ? payoutChannel : undefined
    });

    setName('');
    setEmail('');
    setTitle('');
    setOrganization('');
    setTaxId('');
    setIsProvisionModalOpen(false);
  };

  // Project Manager only sees operational staff (Onsite Members & Contractors). Super Admin & other PMs are excluded.
  const baseUsers = isSuperAdmin()
    ? users
    : users.filter(u => u.role === 'ONSITE_MEMBER' || u.role === 'PARTNER');

  const filteredUsers = baseUsers.filter(u => {
    if (roleFilter === 'ALL') return true;
    return u.role === roleFilter;
  });

  const filterChips = isSuperAdmin()
    ? [
        { id: 'ALL', label: 'All Users' },
        { id: 'SUPER_ADMIN', label: 'Super Admin' },
        { id: 'PROJECT_MANAGER', label: 'Project Managers' },
        { id: 'ONSITE_MEMBER', label: 'Onsite Members' },
        { id: 'PARTNER', label: 'Partner Contractors' }
      ]
    : [
        { id: 'ALL', label: 'All Team Staff' },
        { id: 'ONSITE_MEMBER', label: 'Onsite Members' },
        { id: 'PARTNER', label: 'Partner Contractors' }
      ];

  const canProvision = isSuperAdmin() || isPM();

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <KeyRound className="w-6 h-6 text-indigo-400" />
            {isSuperAdmin() ? 'Enterprise User Provisioning & Hierarchy' : 'Team Members & Staff Provisioning'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isSuperAdmin()
              ? 'Super Admin provisions Project Managers & enterprise staff. Public signup is disabled.'
              : 'Project Manager permissions: Provision and manage onsite engineers, designers, and contractor partners.'}
          </p>
        </div>

        {canProvision && (
          <button
            onClick={handleOpenProvisionModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 shrink-0"
          >
            <Plus className="w-4 h-4" />
            {isSuperAdmin() ? 'Provision New User' : 'Provision Team Member'}
          </button>
        )}
      </div>

      {/* Role Permission Matrix Card (PRD Table 2.1) */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          SRS 2.1 Hierarchical Provisioning & Permission Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#182234] text-[10px] uppercase font-bold text-slate-400">
                <th className="py-2.5 px-3">Functional Capability</th>
                <th className="py-2.5 px-3">Super Admin (Owner)</th>
                <th className="py-2.5 px-3">Project Manager</th>
                <th className="py-2.5 px-3">Onsite Member</th>
                <th className="py-2.5 px-3">Partner Contractor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2 px-3 font-semibold text-white">User Provisioning Flow</td>
                <td className="py-2 px-3 text-emerald-400 font-mono font-bold">Provisions PMs & Admins</td>
                <td className="py-2 px-3 text-indigo-400 font-mono font-bold">Provisions Engineers & Partners</td>
                <td className="py-2 px-3 text-slate-500">None (Provisioned)</td>
                <td className="py-2 px-3 text-slate-500">None (Provisioned)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-white">Credential & Profile Access</td>
                <td className="py-2 px-3 text-emerald-400 font-mono">Full Platform Access</td>
                <td className="py-2 px-3 text-indigo-400 font-mono">Scoped to Team Staff</td>
                <td className="py-2 px-3 text-slate-400 font-mono">Self Only</td>
                <td className="py-2 px-3 text-slate-400 font-mono">Self Only</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-white">Public Self-Registration</td>
                <td className="py-2 px-3 text-rose-400 font-mono">Disabled</td>
                <td className="py-2 px-3 text-rose-400 font-mono">Disabled</td>
                <td className="py-2 px-3 text-rose-400 font-mono">Disabled</td>
                <td className="py-2 px-3 text-rose-400 font-mono">Disabled</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-white">Project Creation & Scoping</td>
                <td className="py-2 px-3 text-rose-400 font-mono">Full (CRUD)</td>
                <td className="py-2 px-3 text-indigo-400">Manage Assigned Projects</td>
                <td className="py-2 px-3 text-slate-400">View Assigned</td>
                <td className="py-2 px-3 text-slate-500">None</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-white">Disbursement Authorization</td>
                <td className="py-2 px-3 text-rose-400 font-mono font-bold">Full 2-Step Sign-Off</td>
                <td className="py-2 px-3 text-slate-500">Step-1 Verify Only</td>
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
            onClick={() => setRoleFilter(chip.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              roleFilter === chip.id
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
          const canEditUser = isSuperAdmin() || (isPM() && u.role !== 'SUPER_ADMIN');

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
                    className="w-11 h-11 rounded-2xl object-cover ring-2 ring-indigo-500/30"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{u.name}</h4>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </div>
                </div>

                {canEditUser && (
                  <button
                    onClick={() => openProfileModal(u)}
                    className="p-1.5 rounded-xl bg-[#182234] hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-300 border border-slate-700/80 text-xs font-semibold flex items-center gap-1 transition-all"
                    title="Edit User Profile & Photo"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Edit</span>
                  </button>
                )}
              </div>

              <div className="p-3 rounded-xl bg-[#182234] border border-slate-700/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Role</span>
                  <RoleBadge role={u.role} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Title</span>
                  <span className="text-white font-medium truncate max-w-[160px]">{u.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Department</span>
                  <span className="text-slate-300 font-medium truncate max-w-[160px]">{u.department || 'Engineering'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Provision User Modal */}
      <Modal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
        title={isSuperAdmin() ? 'Provision New System User' : 'Provision Team Member / Contractor'}
        subtitle={
          isSuperAdmin()
            ? 'Super Admin: Provision Project Managers, engineers, or external partner accounts.'
            : 'Project Manager: Provision onsite engineers, designers, or contractor partners.'
        }
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
                    <option value="PROJECT_MANAGER">Project Manager (Onsite PM)</option>
                    <option value="ONSITE_MEMBER">Onsite Member (Engineer / Designer)</option>
                    <option value="PARTNER">Partner (% Contractor Freelancer)</option>
                  </>
                )}
                {isPM() && (
                  <>
                    <option value="ONSITE_MEMBER">Onsite Member (Engineer / Designer)</option>
                    <option value="PARTNER">Partner (% Contractor Freelancer)</option>
                  </>
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
                placeholder={role === 'PROJECT_MANAGER' ? 'Project Manager' : role === 'PARTNER' ? 'Contractor' : 'Senior Engineer'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Department / Team
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Core Engineering, Mobile Team, UI/UX"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Conditional contractor fields */}
          {role === 'PARTNER' && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-fadeIn">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Contractor Legal & Payout Setup
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Legal Entity Name (e.g. Sterling Labs LLC)"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
                />
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="Tax ID (EIN / VAT / SSN)"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
                />
              </div>
              <input
                type="text"
                value={payoutChannel}
                onChange={(e) => setPayoutChannel(e.target.value)}
                placeholder="Default Payout Channel (e.g. Wise USD Wire)"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
              />
            </div>
          )}

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

    </div>
  );
};
