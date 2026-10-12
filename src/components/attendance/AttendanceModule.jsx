import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { StatsCard } from '../common/StatsCard';
import {
  CalendarCheck2,
  Clock,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Users,
  UserCheck,
  Plus,
  Zap,
  Filter,
  Search,
  Building,
  Laptop,
  Edit2,
  Trash2,
  ShieldCheck,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';

export const AttendanceModule = () => {
  const {
    currentUser,
    users,
    isSuperAdmin,
    isPM,
    recordAttendance,
    updateAttendance,
    deleteAttendance,
    bulkMarkAttendance,
    getScopedAttendance
  } = useApp();

  const canManage = isSuperAdmin() || isPM();

  // Filter state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedWorkMode, setSelectedWorkMode] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Form state for Single Record / Edit
  const [formData, setFormData] = useState({
    userId: users[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
    workMode: 'ON_SITE',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    hoursWorked: 8.5,
    notes: ''
  });

  // Form state for Bulk Mark
  const [bulkFormData, setBulkFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
    workMode: 'ON_SITE',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    notes: 'Standard daily attendance log'
  });

  // Get scoped records based on role (employees only receive their own)
  const scopedRecords = getScopedAttendance();

  // Active employees eligible for attendance (excluding Super Admin if preferred or all staff)
  const eligibleStaff = useMemo(() => {
    return (users || []).filter(u => u.role !== 'SUPER_ADMIN');
  }, [users]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return scopedRecords.filter(r => {
      if (selectedDate && r.date !== selectedDate) return false;
      if (canManage && selectedUserId !== 'ALL' && r.userId !== selectedUserId) return false;
      if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
      if (selectedWorkMode !== 'ALL' && r.workMode !== selectedWorkMode) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const user = users.find(u => u.id === r.userId);
        const matchesName = user?.name?.toLowerCase().includes(query);
        const matchesNotes = r.notes?.toLowerCase().includes(query);
        const matchesDate = r.date?.includes(query);
        if (!matchesName && !matchesNotes && !matchesDate) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [scopedRecords, selectedDate, selectedUserId, selectedStatus, selectedWorkMode, searchQuery, canManage, users]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = filteredRecords.length;
    const presentCount = filteredRecords.filter(r => r.status === 'PRESENT').length;
    const lateCount = filteredRecords.filter(r => r.status === 'LATE').length;
    const halfDayCount = filteredRecords.filter(r => r.status === 'HALF_DAY').length;
    const leaveCount = filteredRecords.filter(r => r.status === 'ON_LEAVE').length;
    const absentCount = filteredRecords.filter(r => r.status === 'ABSENT').length;

    const totalHours = filteredRecords.reduce((sum, r) => sum + (Number(r.hoursWorked) || 0), 0);
    const presentRate = total > 0 ? Math.round(((presentCount + lateCount + halfDayCount * 0.5) / total) * 100) : 100;

    return {
      total,
      presentCount,
      lateCount,
      halfDayCount,
      leaveCount,
      absentCount,
      totalHours: totalHours.toFixed(1),
      presentRate
    };
  }, [filteredRecords]);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      userId: eligibleStaff[0]?.id || users[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      status: 'PRESENT',
      workMode: 'ON_SITE',
      checkIn: '09:00 AM',
      checkOut: '06:00 PM',
      hoursWorked: 8.5,
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setFormData({
      userId: rec.userId,
      date: rec.date,
      status: rec.status,
      workMode: rec.workMode || 'ON_SITE',
      checkIn: rec.checkIn || '09:00 AM',
      checkOut: rec.checkOut || '06:00 PM',
      hoursWorked: rec.hoursWorked || 8.5,
      notes: rec.notes || ''
    });
    setIsAddModalOpen(true);
  };

  // Submit Add or Edit
  const handleSaveAttendance = (e) => {
    e.preventDefault();
    if (editingRecord) {
      updateAttendance(editingRecord.id, formData);
    } else {
      recordAttendance(formData);
    }
    setIsAddModalOpen(false);
  };

  // Submit Bulk Mark
  const handleSaveBulk = (e) => {
    e.preventDefault();
    const targetUserIds = eligibleStaff.map(u => u.id);
    bulkMarkAttendance({
      userIds: targetUserIds,
      ...bulkFormData
    });
    setIsBulkModalOpen(false);
  };

  // Render Status Badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Present
          </span>
        );
      case 'LATE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25">
            <Clock className="w-3.5 h-3.5" />
            Late
          </span>
        );
      case 'HALF_DAY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">
            <Clock3 className="w-3.5 h-3.5" />
            Half Day
          </span>
        );
      case 'ON_LEAVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
            <Calendar className="w-3.5 h-3.5" />
            On Leave
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/25">
            <XCircle className="w-3.5 h-3.5" />
            Absent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-300 border border-slate-500/25">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner & Header */}
      <div className="dashboard-hero-banner attendance-banner relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-[#111827] border border-indigo-500/30 p-6 sm:p-7 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                <CalendarCheck2 className="w-3.5 h-3.5" />
                {canManage ? 'Workforce Attendance Hub' : 'My Attendance Portal'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Logs
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {canManage ? 'Staff Attendance & Work Logs' : `${currentUser?.name}'s Attendance & Work Records`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {canManage
                ? 'Centralized audit and management of daily employee check-ins, work modes, and hours across operational squads.'
                : 'Review your verified check-in history, work modes, total hours, and attendance reliability records.'}
            </p>
          </div>

          {/* Action buttons (Only for Super Admin and Project Manager) */}
          {canManage && (
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#182234] hover:bg-[#202d44] text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-500/50 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                title="Mark all active staff as present for a selected day"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                Quick Bulk Mark
              </button>
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Record Attendance
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Attendance Reliability"
          value={`${metrics.presentRate}%`}
          icon={CheckCircle2}
          colorScheme="emerald"
          badgeText={`${metrics.presentCount} Days Present`}
          subtitle={`Across ${metrics.total} recorded logs`}
        />
        <StatsCard
          title="Logged Work Hours"
          value={`${metrics.totalHours} hrs`}
          icon={Clock}
          colorScheme="indigo"
          badgeText="Total Hours"
          subtitle={metrics.total > 0 ? `Avg ${(metrics.totalHours / metrics.total).toFixed(1)} hrs/day` : 'No logs recorded'}
        />
        <StatsCard
          title="Late Check-Ins"
          value={metrics.lateCount}
          icon={Clock3}
          colorScheme="amber"
          badgeText={metrics.lateCount > 0 ? "Grace Delays" : "All On-Time"}
          subtitle="Check-in past scheduled shift"
        />
        <StatsCard
          title="Leaves & Partials"
          value={metrics.leaveCount + metrics.halfDayCount}
          icon={Calendar}
          colorScheme="cyan"
          badgeText={`${metrics.halfDayCount} Half • ${metrics.leaveCount} Leave`}
          subtitle="Approved time off & half-days"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        
        {/* Left: Search & Date Filter */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={canManage ? "Search staff name, notes..." : "Search date, notes..."}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#182234] border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium transition-all"
            />
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#182234] border border-slate-700/80 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-[11px] text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-[#182234] border border-slate-700/80"
                title="Clear date filter"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-mono pl-1 hidden sm:block">
            Showing <span className="font-bold text-white">{filteredRecords.length}</span> records
          </div>
        </div>

        {/* Right: Role-Scoped Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Employee dropdown (Only for Admin & Manager) */}
          {canManage && (
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#182234] border border-slate-700/80 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="ALL">All Staff Members</option>
              {eligibleStaff.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#182234] border border-slate-700/80 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="ABSENT">Absent</option>
          </select>

          {/* Work Mode Filter */}
          <select
            value={selectedWorkMode}
            onChange={(e) => setSelectedWorkMode(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#182234] border border-slate-700/80 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="ALL">All Modes</option>
            <option value="ON_SITE">On-Site</option>
            <option value="REMOTE">Remote</option>
          </select>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="rounded-2xl bg-[#111827] border border-slate-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#182234] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Date</th>
                {canManage && <th className="py-3 px-4">Staff Member</th>}
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Work Mode</th>
                <th className="py-3 px-4">Check-In / Out</th>
                <th className="py-3 px-4">Hours</th>
                <th className="py-3 px-4">Notes & Remarks</th>
                <th className="py-3 px-4">Verified By</th>
                {canManage && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 9 : 7} className="py-12 text-center text-slate-500">
                    <CalendarCheck2 className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-slate-400">No attendance logs found</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {canManage
                        ? 'Try adjusting your filters or record attendance for the team.'
                        : 'No records exist for the selected filters.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const staffUser = users.find(u => u.id === rec.userId) || currentUser;
                  const dayName = new Date(rec.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' });

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-white font-mono flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{rec.date}</span>
                          <span className="text-[10px] text-slate-400 font-sans font-normal">({dayName})</span>
                        </div>
                      </td>

                      {/* Staff Member (Only visible to PM / Super Admin) */}
                      {canManage && (
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={staffUser.avatar}
                              alt={staffUser.name}
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700"
                            />
                            <div>
                              <p className="font-bold text-white">{staffUser.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {staffUser.role.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderStatusBadge(rec.status)}
                      </td>

                      {/* Work Mode */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          rec.workMode === 'ON_SITE'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/25'
                        }`}>
                          {rec.workMode === 'ON_SITE' ? (
                            <>
                              <Building className="w-3 h-3 text-cyan-400" />
                              On-Site
                            </>
                          ) : (
                            <>
                              <Laptop className="w-3 h-3 text-purple-400" />
                              Remote
                            </>
                          )}
                        </span>
                      </td>

                      {/* Check-In / Out */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-300">
                        {rec.checkIn && rec.checkIn !== '-' ? (
                          <div className="space-y-0.5">
                            <span className="text-emerald-400">In: {rec.checkIn}</span>
                            {rec.checkOut && rec.checkOut !== '-' && (
                              <span className="text-slate-400 block text-[10px]">Out: {rec.checkOut}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">-</span>
                        )}
                      </td>

                      {/* Hours */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-white">
                        {rec.hoursWorked ? `${rec.hoursWorked} hrs` : '-'}
                      </td>

                      {/* Notes & Remarks */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-300 truncate text-[11px]" title={rec.notes || 'No remarks provided'}>
                          {rec.notes || <span className="text-slate-500 italic">No remarks</span>}
                        </p>
                      </td>

                      {/* Verified By */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-slate-400">
                        <span className="font-medium text-slate-300">{rec.markedByName || 'Management'}</span>
                      </td>

                      {/* Actions (Manager and Admin only) */}
                      {canManage && (
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEdit(rec)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-300 transition-colors"
                              title="Edit Attendance Entry"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete attendance record for ${rec.date}?`)) {
                                  deleteAttendance(rec.id);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Notice for Employees */}
      {!canManage && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3 text-xs text-slate-300">
          <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
          <p>
            Your attendance log is verified by your Project Manager and Super Admin. If you notice any discrepancies with check-in timestamps or leave allocations, please contact your manager directly.
          </p>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT ATTENDANCE ================= */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={editingRecord ? "Edit Attendance Record" : "Record Employee Attendance"}
          subtitle="Record daily staff verification, check-in timestamps, and hours."
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveAttendance} className="space-y-4">
            
            {/* Employee Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Staff Member *
              </label>
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              >
                {eligibleStaff.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Status Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late</option>
                  <option value="HALF_DAY">Half Day</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="ABSENT">Absent</option>
                </select>
              </div>
            </div>

            {/* Work Mode & Hours */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Work Mode
                </label>
                <select
                  value={formData.workMode}
                  onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="ON_SITE">On-Site Office</option>
                  <option value="REMOTE">Remote / Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Hours Worked
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={formData.hoursWorked}
                  onChange={(e) => setFormData({ ...formData, hoursWorked: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Check-In and Check-Out Times */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Check-In Time
                </label>
                <input
                  type="text"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  placeholder="e.g. 09:00 AM"
                  className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Check-Out Time
                </label>
                <input
                  type="text"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  placeholder="e.g. 06:00 PM"
                  className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Notes / Remarks */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Notes & Daily Remarks
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                placeholder="e.g. Sprint demo, on-site laboratory support..."
                className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Submit buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
              >
                {editingRecord ? "Update Record" : "Save Attendance"}
              </button>
            </div>

          </form>
        </Modal>
      )}

      {/* ================= MODAL: QUICK BULK MARK ================= */}
      {isBulkModalOpen && (
        <Modal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          title="⚡ Quick Bulk Mark Team Attendance"
          subtitle={`Bulk mark attendance for all ${eligibleStaff.length} active staff members in one click.`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveBulk} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Target Date *
              </label>
              <input
                type="date"
                value={bulkFormData.date}
                onChange={(e) => setBulkFormData({ ...bulkFormData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Default Status
                </label>
                <select
                  value={bulkFormData.status}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="PRESENT">Present</option>
                  <option value="ON_LEAVE">Company Holiday</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Work Mode
                </label>
                <select
                  value={bulkFormData.workMode}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, workMode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="ON_SITE">On-Site Office</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Default Check-In
                </label>
                <input
                  type="text"
                  value={bulkFormData.checkIn}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, checkIn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Default Check-Out
                </label>
                <input
                  type="text"
                  value={bulkFormData.checkOut}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, checkOut: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Batch Remarks
              </label>
              <input
                type="text"
                value={bulkFormData.notes}
                onChange={(e) => setBulkFormData({ ...bulkFormData, notes: e.target.value })}
                placeholder="e.g. Standard on-site business day"
                className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
              This will record or update attendance for all {eligibleStaff.length} active team members on {bulkFormData.date}.
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                Apply Batch Mark
              </button>
            </div>

          </form>
        </Modal>
      )}

    </div>
  );
};
