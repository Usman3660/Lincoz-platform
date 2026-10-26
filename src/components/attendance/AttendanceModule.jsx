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
    recordRosterAttendance,
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
  const [searchQuery, setSearchQuery] = useState('');

  // Roster Mark Attendance Modal state (matching attached design)
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [rosterDate, setRosterDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [rosterDeptFilter, setRosterDeptFilter] = useState('ALL');
  const [rosterEntries, setRosterEntries] = useState({});

  // Single Record Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Form state for Single Record Edit
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


  // Get scoped records based on role (employees only receive their own)
  const scopedRecords = getScopedAttendance();

  // Active employees eligible for attendance (excluding Super Admin and external contractors/partners)
  const eligibleStaff = useMemo(() => {
    return (users || []).filter(u => u.role !== 'SUPER_ADMIN' && u.role !== 'PARTNER_FREELANCER');
  }, [users]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return scopedRecords.filter(r => {
      if (selectedDate && r.date !== selectedDate) return false;
      if (canManage && selectedUserId !== 'ALL' && r.userId !== selectedUserId) return false;
      if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
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
  }, [scopedRecords, selectedDate, selectedUserId, selectedStatus, searchQuery, canManage, users]);

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

  // Initialize or reload roster entries for a given date
  const initRosterForDate = (date) => {
    const existingOnDate = getScopedAttendance(date);
    const initialMap = {};
    eligibleStaff.forEach((u) => {
      const existing = existingOnDate.find(r => r.userId === u.id);
      initialMap[u.id] = {
        status: existing?.status || 'PRESENT',
        workMode: existing?.workMode || u.workMode || 'ON_SITE'
      };
    });
    setRosterEntries(initialMap);
  };

  // Open Roster Mark Attendance Modal
  const handleOpenRoster = () => {
    const targetDate = selectedDate || new Date().toISOString().split('T')[0];
    setRosterDate(targetDate);
    initRosterForDate(targetDate);
    setIsRosterModalOpen(true);
  };

  const handleRosterDateChange = (newDate) => {
    setRosterDate(newDate);
    initRosterForDate(newDate);
  };

  const handleSetEmployeeStatus = (userId, newStatus) => {
    setRosterEntries(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        status: newStatus
      }
    }));
  };

  const markAllStatus = (newStatus) => {
    setRosterEntries(prev => {
      const next = { ...prev };
      displayedRoster.forEach(emp => {
        next[emp.id] = {
          ...next[emp.id],
          status: newStatus
        };
      });
      return next;
    });
  };

  const displayedRoster = useMemo(() => {
    return eligibleStaff.filter(emp => {
      if (rosterDeptFilter === 'ALL') return true;
      return emp.role === rosterDeptFilter;
    });
  }, [eligibleStaff, rosterDeptFilter]);

  const rosterSummary = useMemo(() => {
    let present = 0, absent = 0, leave = 0;
    displayedRoster.forEach(emp => {
      const st = rosterEntries[emp.id]?.status || 'PRESENT';
      if (st === 'PRESENT') present++;
      else if (st === 'ABSENT') absent++;
      else if (st === 'ON_LEAVE') leave++;
    });
    return {
      total: displayedRoster.length,
      present,
      absent,
      leave
    };
  }, [displayedRoster, rosterEntries]);

  const handleSubmitRosterAttendance = () => {
    const payload = displayedRoster.map(emp => {
      const entry = rosterEntries[emp.id] || {};
      const st = entry.status || 'PRESENT';
      return {
        userId: emp.id,
        status: st,
        workMode: 'ON_SITE',
        checkIn: st === 'ABSENT' || st === 'ON_LEAVE' ? '-' : '09:00 AM',
        checkOut: st === 'ABSENT' || st === 'ON_LEAVE' ? '-' : '06:00 PM',
        hoursWorked: st === 'ABSENT' || st === 'ON_LEAVE' ? 0 : 8.5,
        notes: `Marked via daily onsite attendance roster on ${rosterDate}`
      };
    });

    recordRosterAttendance({
      date: rosterDate,
      roster: payload
    });

    setIsRosterModalOpen(false);
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
    setIsEditModalOpen(true);
  };

  // Submit Single Edit
  const handleSaveAttendance = (e) => {
    e.preventDefault();
    if (editingRecord) {
      updateAttendance(editingRecord.id, formData);
    }
    setIsEditModalOpen(false);
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
                onClick={handleOpenRoster}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
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
                  <td colSpan={canManage ? 8 : 6} className="py-12 text-center text-slate-500">
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
                  const staffUser = users.find(u => u.id === rec.userId) || {
                    id: rec.userId,
                    name: rec.userName || 'Team Member',
                    role: rec.userRole || 'ONSITE_MEMBER',
                    avatar: rec.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  };
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

      {/* ================= MODAL: MARK ATTENDANCE ROSTER (MATCHING ATTACHED DESIGN) ================= */}
      {isRosterModalOpen && (
        <Modal
          isOpen={isRosterModalOpen}
          onClose={() => setIsRosterModalOpen(false)}
          title="Mark Attendance"
          subtitle={`Quickly mark and verify daily attendance for all team members on ${rosterDate}.`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">

            {/* Top Controls: Quick Batch Actions & Date Filter (Matching "Add Student / Add Class") */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">

              {/* Left: Quick Batch Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => markAllStatus('PRESENT')}
                  className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Mark all listed staff as Present"
                  style={{ color: '#ffffff' }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>Mark All Present</span>
                </button>
                <button
                  type="button"
                  onClick={() => markAllStatus('ABSENT')}
                  className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Mark all listed staff as Absent"
                  style={{ color: '#ffffff' }}
                >
                  <XCircle className="w-3.5 h-3.5 text-white" />
                  <span>Mark All Absent</span>
                </button>
                <button
                  type="button"
                  onClick={() => markAllStatus('ON_LEAVE')}
                  className="px-3.5 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Mark all listed staff as Leave"
                  style={{ color: '#ffffff' }}
                >
                  <Clock className="w-3.5 h-3.5 text-white" />
                  <span>Mark All Leave</span>
                </button>
              </div>

              {/* Right: Date Picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Date:</span>
                <input
                  type="date"
                  value={rosterDate}
                  onChange={(e) => handleRosterDateChange(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#182234] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono shadow-xs"
                />
              </div>
            </div>

            {/* Employee Filter Dropdown */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">Employee:</span>
                <select
                  value={rosterDeptFilter}
                  onChange={(e) => setRosterDeptFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#182234] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium shadow-xs"
                >
                  <option value="ALL">All Employees ({eligibleStaff.length})</option>
                  <option value="ONSITE_MEMBER">Onsite Staff (Engineers & Designers)</option>
                  <option value="PROJECT_MANAGER">Project Managers</option>
                </select>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Mark status: <span className="font-bold text-rose-600 dark:text-rose-400">[A] Absent</span>, <span className="font-bold text-emerald-600 dark:text-emerald-400">[P] Present</span>, <span className="font-bold text-amber-600 dark:text-amber-400">[L] Leave</span>
              </div>
            </div>

            {/* Employee Roster List (Neutral cards with colored active status options) */}
            <div className="space-y-2 max-h-[48vh] overflow-y-auto custom-scrollbar pr-1">
              {displayedRoster.map((emp) => {
                const currentStatus = rosterEntries[emp.id]?.status || 'PRESENT';
                const formattedRole = emp.role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

                return (
                  <div
                    key={emp.id}
                    className="roster-employee-card p-3 sm:p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-xs"
                  >
                    {/* Left: Employee Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 shrink-0 shadow-xs"
                      />
                      <div className="min-w-0">
                        <span className="roster-emp-name font-bold text-sm tracking-tight truncate block">
                          {emp.name}
                        </span>
                        <p className="roster-emp-role text-[11px] font-medium truncate">
                          {formattedRole}
                        </p>
                      </div>
                    </div>

                    {/* Right: Circular Status Buttons [ A ] [ P ] [ L ] */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Absent Button */}
                      <button
                        type="button"
                        onClick={() => handleSetEmployeeStatus(emp.id, 'ABSENT')}
                        title="Mark Absent"
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-black text-xs flex items-center justify-center transition-all cursor-pointer ${
                          currentStatus === 'ABSENT'
                            ? 'bg-rose-500 hover:bg-rose-600 text-white ring-2 ring-rose-400/80 scale-110 shadow-md shadow-rose-500/30 roster-status-btn-active'
                            : 'roster-btn-unselected active:scale-95'
                        }`}
                      >
                        <span className="font-black text-xs">A</span>
                      </button>

                      {/* Present Button */}
                      <button
                        type="button"
                        onClick={() => handleSetEmployeeStatus(emp.id, 'PRESENT')}
                        title="Mark Present"
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-black text-xs flex items-center justify-center transition-all cursor-pointer ${
                          currentStatus === 'PRESENT'
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white ring-2 ring-emerald-400/80 scale-110 shadow-md shadow-emerald-500/30 roster-status-btn-active'
                            : 'roster-btn-unselected active:scale-95'
                        }`}
                      >
                        <span className="font-black text-xs">P</span>
                      </button>

                      {/* Leave Button */}
                      <button
                        type="button"
                        onClick={() => handleSetEmployeeStatus(emp.id, 'ON_LEAVE')}
                        title="Mark On Leave"
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-black text-xs flex items-center justify-center transition-all cursor-pointer ${
                          currentStatus === 'ON_LEAVE'
                            ? 'bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-300/80 scale-110 shadow-md shadow-amber-500/30 roster-status-btn-active'
                            : 'roster-btn-unselected active:scale-95'
                        }`}
                      >
                        <span className="font-black text-xs">L</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Summary Section (Matching attached design) */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Roster Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Staff</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">{rosterSummary.total}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/40 flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Present</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{rosterSummary.present}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-800/40 flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">Absent</span>
                  <span className="text-base font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-0.5">{rosterSummary.absent}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/40 flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Leave</span>
                  <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-0.5">{rosterSummary.leave}</span>
                </div>
              </div>
            </div>

            {/* Bottom Submit Action (Matching attached design rounded pill button) */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsRosterModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitRosterAttendance}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                style={{ color: '#ffffff' }}
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Submit Attendance</span>
              </button>
            </div>

          </div>
        </Modal>
      )}

      {/* ================= MODAL: EDIT SINGLE ATTENDANCE RECORD ================= */}
      {isEditModalOpen && editingRecord && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Attendance Record"
          subtitle="Update check-in timestamps, status, or remarks."
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveAttendance} className="space-y-4">

            {/* Employee info */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Staff Member
              </label>
              <div className="px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white font-bold">
                {users.find(u => u.id === formData.userId)?.name || formData.userId}
              </div>
            </div>

            {/* Date, Status, and Hours Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Status
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
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                Update Record
              </button>
            </div>

          </form>
        </Modal>
      )}



    </div>
  );
};
