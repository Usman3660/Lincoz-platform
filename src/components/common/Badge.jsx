import React from 'react';

export const RoleBadge = ({ role }) => {
  switch (role) {
    case 'SUPER_ADMIN':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5 animate-pulse"></span>
          Super Admin
        </span>
      );
    case 'PROJECT_MANAGER':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-1.5"></span>
          Project Manager
        </span>
      );
    case 'ONSITE_MEMBER':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1.5"></span>
          Team Employee
        </span>
      );
  }
};

export const WorkModeBadge = ({ mode }) => {
  const isRemote = mode === 'REMOTE';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
      isRemote
        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
        : 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
    }`}>
      <span className={`w-1 h-1 rounded-full mr-1 ${isRemote ? 'bg-purple-400' : 'bg-teal-400'}`} />
      {isRemote ? 'Remote' : 'On-Site'}
    </span>
  );
};

export const CompBadge = ({ type, salary, percentage }) => {
  if (type === 'PERCENTAGE') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
        {percentage ? `${percentage}% Share` : '% Based'}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      {salary ? `$${Number(salary).toLocaleString()}/yr` : 'Salaried'}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'COMPLETED':
    case 'DISBURSED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
          {status === 'DISBURSED' ? 'Disbursed' : 'Completed'}
        </span>
      );
    case 'PENDING_REVIEW':
    case 'APPROVED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
          {status === 'APPROVED' ? 'Approved for Payout' : 'Pending Review'}
        </span>
      );
    case 'IN_PROGRESS':
    case 'INVOICED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5"></span>
          {status === 'INVOICED' ? 'Invoiced to Client' : 'In Progress'}
        </span>
      );
    case 'ASSIGNED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5"></span>
          Assigned
        </span>
      );
    case 'ACCRUING':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mr-1.5"></span>
          Accruing (WIP)
        </span>
      );
    case 'BACKLOG':
    case 'PLANNING':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
          {status ? status.replace('_', ' ') : 'Backlog'}
        </span>
      );
  }
};

export const PriorityBadge = ({ priority }) => {
  switch (priority) {
    case 'Urgent':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
          Urgent
        </span>
      );
    case 'High':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
          High
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
          Medium
        </span>
      );
    case 'Low':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700/40 text-slate-400 border border-slate-700/50">
          Low
        </span>
      );
  }
};
