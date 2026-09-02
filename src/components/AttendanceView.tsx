import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  Play, 
  Square, 
  Coffee, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Edit3, 
  Trash2, 
  UserCheck, 
  AlertCircle, 
  UserX, 
  CalendarOff, 
  CheckCircle2, 
  Zap, 
  User, 
  Building2, 
  TrendingUp,
  RefreshCw,
  Eye,
  Info
} from 'lucide-react';
import { AttendanceRecord, Employee, LeaveRequest, UserProfile, AttendanceStatus } from '../types';
import { 
  getPKTDate, 
  getPKTDateISO, 
  formatPKTDateDisplay, 
  formatPKTDateShort, 
  formatPKTTime,
  calculateAttendanceHours,
  calculateLiveElapsedHours,
  determinePunctuality,
  calculateTodayAttendanceKPIs,
  generateEmployeeMonthlyRoster
} from '../utils/attendanceUtils';
import { dbService } from '../services/dbService';
import { EditAttendanceModal } from './attendance/EditAttendanceModal';
import { DeleteAttendanceModal } from './attendance/DeleteAttendanceModal';
import { AttendanceProfileModal } from './attendance/AttendanceProfileModal';
import { DayAttendanceModal } from './attendance/DayAttendanceModal';

interface AttendanceViewProps {
  attendanceRecords: AttendanceRecord[];
  currentUser: UserProfile;
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  onUpdateRecords?: (records: AttendanceRecord[]) => void;
  onNavigate?: (view: string) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendanceRecords,
  currentUser,
  employees = [],
  leaveRequests = [],
  showToast
}) => {
  const isAdmin = currentUser.roleType === 'admin';
  const isManager = currentUser.roleType === 'manager';
  const canManageRecords = isAdmin || isManager;

  // Tabs: 'today' | 'monthly' | 'calendar'
  const [activeTab, setActiveTab] = useState<'today' | 'monthly' | 'calendar'>('today');

  // Time & Live Clock State (Pakistan Standard Time)
  const [currentTime, setCurrentTime] = useState<Date>(getPKTDate());
  const todayISO = getPKTDateISO();
  const todayDisplay = formatPKTDateShort(todayISO);
  const todayLong = formatPKTDateDisplay(todayISO);

  // Month & Year state for monthly and calendar views
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(8); // September = 8 (0-indexed)

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [employeeFilter, setEmployeeFilter] = useState('All');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);
  const [modalDefaultEmpId, setModalDefaultEmpId] = useState<string | undefined>(undefined);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<AttendanceRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [profileModalEmp, setProfileModalEmp] = useState<Employee | null>(null);
  const [dayModalDate, setDayModalDate] = useState<string | null>(null);

  // Break state for current user
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState<number | null>(null);

  // Live timer interval (every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getPKTDate());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Today's attendance record for the logged-in user in Firestore
  const myTodayRecord = useMemo(() => {
    return attendanceRecords.find(r => {
      const matchEmp = r.empId === currentUser.empId || r.employeeName.toLowerCase() === currentUser.name.toLowerCase();
      if (!matchEmp) return false;
      return r.date === todayISO || r.date.includes(todayDisplay) || r.date.includes('Today');
    });
  }, [attendanceRecords, currentUser, todayISO, todayDisplay]);

  // Is current user clocked in today?
  const isClockedIn = !!(myTodayRecord && myTodayRecord.clockIn && myTodayRecord.clockIn !== '--:--' && (!myTodayRecord.clockOut || myTodayRecord.clockOut === '--:--'));
  const isShiftCompleted = !!(myTodayRecord && myTodayRecord.clockIn && myTodayRecord.clockIn !== '--:--' && myTodayRecord.clockOut && myTodayRecord.clockOut !== '--:--');

  // Live elapsed time for logged-in user if clocked in
  const myLiveElapsedTime = useMemo(() => {
    if (!myTodayRecord || !myTodayRecord.clockIn || myTodayRecord.clockIn === '--:--') return null;
    if (myTodayRecord.clockOut && myTodayRecord.clockOut !== '--:--') {
      return myTodayRecord.totalHrs;
    }
    return calculateLiveElapsedHours(myTodayRecord.clockIn, myTodayRecord.breakMinutes || 0);
  }, [myTodayRecord, currentTime]);

  // Top 4 Live KPI Counters (Strictly from real database entries)
  const todayKPIs = useMemo(() => {
    return calculateTodayAttendanceKPIs(employees, attendanceRecords, leaveRequests);
  }, [employees, attendanceRecords, leaveRequests]);

  // Departments List
  const departments = useMemo(() => {
    const depts = new Set<string>();
    employees.forEach(e => {
      if (e.department) depts.add(e.department);
    });
    return ['All', ...Array.from(depts)];
  }, [employees]);

  // Handle Manual Clock In for current user
  const handleClockIn = async () => {
    try {
      const nowPKT = getPKTDate();
      const clockInTimeStr = formatPKTTime(nowPKT);
      const punctuality = determinePunctuality(clockInTimeStr, '09:00 AM', 15);
      const dayName = nowPKT.toLocaleDateString('en-US', { weekday: 'long' });

      const newRecord: AttendanceRecord = {
        id: `att-${currentUser.empId}-${todayISO}`,
        empId: currentUser.empId,
        employeeName: currentUser.name,
        department: currentUser.department,
        avatar: currentUser.avatar,
        avatarInitials: currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2),
        date: todayISO,
        displayDate: formatPKTDateDisplay(todayISO),
        dayName,
        shift: 'Regular (09:00 AM – 06:00 PM)',
        clockIn: clockInTimeStr,
        clockOut: '--:--',
        breakMinutes: 0,
        totalHrs: 'Working (0h 01m)',
        overtime: '0h 00m',
        status: punctuality.status,
        lateDuration: punctuality.lateDuration,
        remarks: 'Manual check-in via Web Punch Desk',
        recordedBy: 'Self',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await dbService.saveItem('attendance', newRecord);
      
      if (showToast) {
        showToast(
          `✓ Clocked In successfully at ${clockInTimeStr} (${punctuality.status === 'Late' ? 'Late: ' + punctuality.lateDuration : 'Present & On Time'})`,
          punctuality.status === 'Late' ? 'info' : 'success'
        );
      }
    } catch (err: any) {
      console.error('Failed to clock in:', err);
      if (showToast) showToast('Failed to save Clock-In record to database', 'error');
    }
  };

  // Handle Manual Clock Out for current user
  const handleClockOut = async () => {
    if (!myTodayRecord) return;
    try {
      const nowPKT = getPKTDate();
      const clockOutTimeStr = formatPKTTime(nowPKT);
      const hoursCalc = calculateAttendanceHours(
        myTodayRecord.clockIn, 
        clockOutTimeStr, 
        myTodayRecord.breakMinutes || 0
      );

      const updatedRecord: AttendanceRecord = {
        ...myTodayRecord,
        clockOut: clockOutTimeStr,
        totalHrs: hoursCalc.totalHrsStr,
        overtime: hoursCalc.overtimeStr,
        status: myTodayRecord.status === 'Working' ? 'Present' : myTodayRecord.status,
        updatedAt: new Date().toISOString()
      };

      await dbService.saveItem('attendance', updatedRecord);
      setIsOnBreak(false);

      if (showToast) {
        showToast(
          `✓ Clocked Out successfully at ${clockOutTimeStr}. Total worked: ${hoursCalc.totalHrsStr}`,
          'success'
        );
      }
    } catch (err: any) {
      console.error('Failed to clock out:', err);
      if (showToast) showToast('Failed to save Clock-Out record to database', 'error');
    }
  };

  // Handle Break Toggle
  const handleBreakToggle = async () => {
    if (!isClockedIn || !myTodayRecord) return;
    
    if (!isOnBreak) {
      // Starting Break
      setIsOnBreak(true);
      setBreakStartTime(Date.now());
      if (showToast) showToast('☕ Break started. Timer paused.', 'info');
    } else {
      // Ending Break
      const elapsedBreakMins = breakStartTime ? Math.max(1, Math.round((Date.now() - breakStartTime) / 60000)) : 15;
      const totalBreakMins = (myTodayRecord.breakMinutes || 0) + elapsedBreakMins;

      const updatedRecord: AttendanceRecord = {
        ...myTodayRecord,
        breakMinutes: totalBreakMins,
        updatedAt: new Date().toISOString()
      };

      await dbService.saveItem('attendance', updatedRecord);
      setIsOnBreak(false);
      setBreakStartTime(null);
      if (showToast) showToast(`✓ Break ended (${elapsedBreakMins} min added to break time)`, 'success');
    }
  };

  // Open Add Record Modal
  const handleOpenAddModal = (empId?: string, date?: string) => {
    setEditingRecord(null);
    setModalDefaultEmpId(empId);
    setModalDefaultDate(date || todayISO);
    setIsEditModalOpen(true);
  };

  // Open Edit Record Modal
  const handleOpenEditModal = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  // Save Record (Create or Edit)
  const handleSaveRecord = async (record: AttendanceRecord) => {
    await dbService.saveItem('attendance', record);
    if (showToast) {
      showToast(`✓ Attendance record for ${record.employeeName} saved permanently`, 'success');
    }
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (record: AttendanceRecord) => {
    setDeletingRecord(record);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    setIsDeleting(true);
    try {
      await dbService.deleteItem('attendance', deletingRecord.id);
      setIsDeleteModalOpen(false);
      setDeletingRecord(null);
      if (showToast) {
        showToast(`✓ Attendance record for ${deletingRecord.employeeName} deleted from database`, 'success');
      }
    } catch (err: any) {
      console.error('Delete failed:', err);
      if (showToast) showToast('Failed to delete attendance record', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Today's Records
  const filteredTodayRecords = useMemo(() => {
    return attendanceRecords.filter(r => {
      const matchDate = r.date === todayISO || r.date.includes(todayDisplay) || r.date.includes('Today');
      if (!matchDate) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSearch = r.employeeName.toLowerCase().includes(q) || 
                            r.empId.toLowerCase().includes(q) ||
                            r.department.toLowerCase().includes(q);
        if (!matchSearch) return false;
      }

      if (deptFilter !== 'All' && r.department !== deptFilter) return false;
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;

      return true;
    });
  }, [attendanceRecords, todayISO, todayDisplay, searchQuery, deptFilter, statusFilter]);

  // Month navigation helpers
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (selectedMonthIndex === 0) {
      setSelectedMonthIndex(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonthIndex(selectedMonthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonthIndex === 11) {
      setSelectedMonthIndex(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonthIndex(selectedMonthIndex + 1);
    }
  };

  // Monthly Records list (matching selected year and month)
  const monthlyFilteredRecords = useMemo(() => {
    const monthPadded = String(selectedMonthIndex + 1).padStart(2, '0');
    const monthPrefix = `${selectedYear}-${monthPadded}`;
    const monthShort = monthNames[selectedMonthIndex].substring(0, 3);

    return attendanceRecords.filter(r => {
      const matchMonth = r.date.startsWith(monthPrefix) || r.date.includes(monthShort);
      if (!matchMonth) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSearch = r.employeeName.toLowerCase().includes(q) || 
                            r.empId.toLowerCase().includes(q) ||
                            r.department.toLowerCase().includes(q);
        if (!matchSearch) return false;
      }

      if (deptFilter !== 'All' && r.department !== deptFilter) return false;
      if (employeeFilter !== 'All' && r.empId !== employeeFilter) return false;
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;

      return true;
    });
  }, [attendanceRecords, selectedYear, selectedMonthIndex, searchQuery, deptFilter, employeeFilter, statusFilter, monthNames]);

  // Export CSV
  const handleExportTodayCSV = () => {
    const csvHeader = 'Employee ID,Name,Department,Date,Clock In,Clock Out,Total Hours,Overtime,Status,Late Duration,Remarks\n';
    const csvRows = filteredTodayRecords.map(r => 
      `"${r.empId}","${r.employeeName}","${r.department}","${r.displayDate || r.date}","${r.clockIn}","${r.clockOut}","${r.totalHrs}","${r.overtime || '0h 00m'}","${r.status}","${r.lateDuration || '--'}","${r.remarks || ''}"`
    ).join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_Log_${todayISO}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Top Header & Live Clock Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-r from-[#131b2e] via-[#161a36] to-[#1e1333]">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center shadow-inner">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white font-['Sora'] tracking-tight">
                Attendance Management
              </h1>
              <p className="text-xs text-slate-400">
                Pakistan Standard Time (PKT / Asia/Karachi) • Strict Manual Clock Punch & Database Synchronization
              </p>
            </div>
          </div>
        </div>

        {/* Live Clock & Date Badge */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div className="text-right">
              <p className="text-base font-bold font-mono text-white tracking-wider">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                {currentTime.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })} (PKT)
              </p>
            </div>
          </div>

          {canManageRecords && (
            <button
              onClick={() => handleOpenAddModal()}
              className="brand-gradient-btn px-4 py-2.5 rounded-2xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Manual Entry</span>
            </button>
          )}
        </div>
      </div>

      {/* Manual Punch Desk (Individual Clock In / Out for the Logged-in User) */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-[#131b2e] shadow-xl relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all ${
          isClockedIn ? 'bg-emerald-500/15' : isShiftCompleted ? 'bg-blue-500/10' : 'bg-purple-500/10'
        }`} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* User Info & Current Punch Status */}
          <div className="flex items-center gap-4">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-500/30 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-lg shrink-0 border border-purple-500/30">
                {currentUser.name.substring(0, 2)}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white font-['Sora']">
                  {currentUser.name}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-white/[0.06] text-purple-300 border border-white/10">
                  {currentUser.empId}
                </span>
                {/* Live Status Badge */}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  isClockedIn 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : isShiftCompleted
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isClockedIn ? 'bg-emerald-400 animate-pulse' : isShiftCompleted ? 'bg-blue-400' : 'bg-slate-400'
                  }`} />
                  {isClockedIn ? 'Currently Working' : isShiftCompleted ? 'Shift Completed' : 'Not Clocked In Today'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Shift: <span className="text-slate-300 font-medium">Regular (09:00 AM – 06:00 PM)</span> • Department: <span className="text-slate-300 font-medium">{currentUser.department}</span>
              </p>
            </div>
          </div>

          {/* Punch Action Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Clock-In Info Pill if clocked in */}
            {myTodayRecord && myTodayRecord.clockIn && myTodayRecord.clockIn !== '--:--' && (
              <div className="px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/5 space-y-0.5 text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Today's Punch</span>
                <p className="text-xs font-mono font-bold text-white">
                  In: <span className="text-emerald-400">{myTodayRecord.clockIn}</span>
                  {myTodayRecord.clockOut && myTodayRecord.clockOut !== '--:--' && (
                    <> • Out: <span className="text-amber-400">{myTodayRecord.clockOut}</span></>
                  )}
                </p>
                {myLiveElapsedTime && (
                  <p className="text-[10px] font-mono text-purple-300">
                    Logged: {myLiveElapsedTime}
                  </p>
                )}
              </div>
            )}

            {/* Break Button (enabled when clocked in) */}
            {isClockedIn && (
              <button
                onClick={handleBreakToggle}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                  isOnBreak 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/10'
                }`}
              >
                <Coffee className="w-4 h-4 text-amber-400" />
                <span>{isOnBreak ? 'Resume Work' : 'Take Break'}</span>
              </button>
            )}

            {/* Main Clock In / Clock Out Button */}
            {!isClockedIn ? (
              <button
                onClick={handleClockIn}
                disabled={isShiftCompleted}
                className={`px-6 py-2.5 rounded-2xl text-xs font-bold text-white flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                  isShiftCompleted 
                    ? 'bg-emerald-600/50 cursor-not-allowed opacity-80'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isShiftCompleted ? 'Shift Logged Today' : 'Clock In'}</span>
              </button>
            ) : (
              <button
                onClick={handleClockOut}
                className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white flex items-center gap-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 shadow-lg shadow-rose-900/40 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Clock Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top 4 Attendance Statistics KPI Cards (Calculated from real records) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Present Today */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-[#131b2e] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Total Present Today</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-['Sora']">{todayKPIs.totalPresent}</span>
            <span className="text-xs text-slate-400">/ {todayKPIs.totalEmployees} Active</span>
          </div>
          <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${todayKPIs.presentPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">
            {todayKPIs.presentPercent}% workforce punched in today
          </p>
        </div>

        {/* Late Arrivals */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-[#131b2e] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Late Arrivals</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-300 font-['Sora']">{todayKPIs.lateArrivals}</span>
            <span className="text-xs text-slate-400">Employees</span>
          </div>
          <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${todayKPIs.totalPresent > 0 ? (todayKPIs.lateArrivals / todayKPIs.totalPresent) * 100 : 0}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Clocked in past 09:15 AM grace time
          </p>
        </div>

        {/* On Approved Leave */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-[#131b2e] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">On Approved Leave</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <CalendarOff className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-purple-300 font-['Sora']">{todayKPIs.onApprovedLeave}</span>
            <span className="text-xs text-slate-400">Approved</span>
          </div>
          <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-purple-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${(todayKPIs.onApprovedLeave / (todayKPIs.totalEmployees || 1)) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Synced from Leave Management system
          </p>
        </div>

        {/* Unnotified Absent */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-[#131b2e] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Not Clocked In / Absent</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-400 font-['Sora']">{todayKPIs.unnotifiedAbsent}</span>
            <span className="text-xs text-slate-400">Scheduled</span>
          </div>
          <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-rose-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${(todayKPIs.unnotifiedAbsent / (todayKPIs.totalEmployees || 1)) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Pending punch-in or unexcused absence
          </p>
        </div>
      </div>

      {/* Main Content Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'today'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white'
            }`}
          >
            Today's Punch Register ({todayDisplay})
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'monthly'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white'
            }`}
          >
            Month-wise History & Roster
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white'
            }`}
          >
            Calendar Overview
          </button>
        </div>

        {activeTab === 'today' && (
          <button
            onClick={handleExportTodayCSV}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          TAB 1: TODAY'S PUNCH REGISTER
         ========================================================================= */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 glass-panel p-4 rounded-2xl border border-white/10 bg-[#131b2e]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search employee by name, ID, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5 text-purple-400" />
                <span>Dept:</span>
              </div>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500/50"
              >
                {departments.map(d => (
                  <option key={d} value={d} className="bg-[#131b2e]">{d}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500/50"
              >
                <option value="All" className="bg-[#131b2e]">All Statuses</option>
                <option value="Present" className="bg-[#131b2e]">Present</option>
                <option value="Late" className="bg-[#131b2e]">Late</option>
                <option value="Working" className="bg-[#131b2e]">Working</option>
                <option value="Absent" className="bg-[#131b2e]">Absent</option>
                <option value="On Leave" className="bg-[#131b2e]">On Leave</option>
              </select>
            </div>
          </div>

          {/* Today's Punch Table */}
          <div className="glass-panel rounded-3xl border border-white/10 bg-[#131b2e] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#161e33] text-slate-400 uppercase text-[10px] font-bold border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Shift</th>
                    <th className="py-3.5 px-4">Clock In</th>
                    <th className="py-3.5 px-4">Clock Out</th>
                    <th className="py-3.5 px-4">Total Hours</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Late Duration</th>
                    <th className="py-3.5 px-4">Remarks</th>
                    {canManageRecords && <th className="py-3.5 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {filteredTodayRecords.length > 0 ? (
                    filteredTodayRecords.map((record) => {
                      const emp = employees.find(e => e.empId === record.empId);

                      return (
                        <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4">
                            <button
                              onClick={() => emp && setProfileModalEmp(emp)}
                              className="flex items-center gap-3 text-left group cursor-pointer"
                            >
                              {record.avatar ? (
                                <img
                                  src={record.avatar}
                                  alt={record.employeeName}
                                  className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs shrink-0">
                                  {record.avatarInitials || record.employeeName.substring(0, 2)}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                                  <span>{record.employeeName}</span>
                                  <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400" />
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono">{record.empId}</p>
                              </div>
                            </button>
                          </td>
                          <td className="py-3 px-4 text-slate-300">{record.department}</td>
                          <td className="py-3 px-4 text-slate-400 text-[11px]">{record.shift || 'Regular (09:00 AM – 06:00 PM)'}</td>
                          <td className="py-3 px-4 font-mono font-medium text-slate-200">
                            {record.clockIn}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400">
                            {record.clockOut}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-purple-300">
                            {record.clockIn !== '--:--' && (!record.clockOut || record.clockOut === '--:--')
                              ? calculateLiveElapsedHours(record.clockIn, record.breakMinutes || 0)
                              : record.totalHrs}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              record.status === 'Present'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : record.status === 'Late'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : record.status === 'Working'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse'
                                : record.status === 'On Leave'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-amber-300 text-[11px]">
                            {record.lateDuration || '--'}
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-[160px]" title={record.remarks}>
                            {record.remarks || '--'}
                          </td>
                          {canManageRecords && (
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditModal(record)}
                                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 transition-colors cursor-pointer"
                                  title="Edit Attendance Record"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenDeleteModal(record)}
                                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
                                  title="Delete Attendance Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-500 text-xs">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <p className="font-semibold text-slate-400">No clock-in records recorded for today yet.</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Attendance is 100% manual. Once an employee clocks in, their record will appear here permanently.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: MONTH-WISE HISTORY & ROSTER
         ========================================================================= */}
      {activeTab === 'monthly' && (
        <div className="space-y-4">
          {/* Month Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-white/10 bg-[#131b2e]">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-center md:text-left">
                <h3 className="text-base font-bold text-white font-['Sora']">
                  {monthNames[selectedMonthIndex]} {selectedYear}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {monthlyFilteredRecords.length} recorded punch logs in this month
                </p>
              </div>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500/50"
              >
                {departments.map(d => (
                  <option key={d} value={d} className="bg-[#131b2e]">{d}</option>
                ))}
              </select>

              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500/50"
              >
                <option value="All" className="bg-[#131b2e]">All Employees</option>
                {employees.map(emp => (
                  <option key={emp.empId} value={emp.empId} className="bg-[#131b2e]">
                    {emp.name} ({emp.empId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Monthly Logs Table */}
          <div className="glass-panel rounded-3xl border border-white/10 bg-[#131b2e] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#161e33] text-slate-400 uppercase text-[10px] font-bold border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Shift</th>
                    <th className="py-3.5 px-4">Clock In</th>
                    <th className="py-3.5 px-4">Clock Out</th>
                    <th className="py-3.5 px-4">Total Hours</th>
                    <th className="py-3.5 px-4">Overtime</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Remarks</th>
                    {canManageRecords && <th className="py-3.5 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {monthlyFilteredRecords.length > 0 ? (
                    monthlyFilteredRecords.map((record) => {
                      const emp = employees.find(e => e.empId === record.empId);

                      return (
                        <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-white">
                            {record.displayDate || record.date}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => emp && setProfileModalEmp(emp)}
                              className="flex items-center gap-2.5 text-left group cursor-pointer"
                            >
                              {record.avatar ? (
                                <img
                                  src={record.avatar}
                                  alt={record.employeeName}
                                  className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                                  {record.avatarInitials || record.employeeName.substring(0, 2)}
                                </div>
                              )}
                              <span className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                                {record.employeeName}
                              </span>
                            </button>
                          </td>
                          <td className="py-3 px-4 text-slate-300">{record.department}</td>
                          <td className="py-3 px-4 text-slate-400 text-[11px]">{record.shift || 'Regular (09:00 AM – 06:00 PM)'}</td>
                          <td className="py-3 px-4 font-mono text-slate-200">{record.clockIn}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">{record.clockOut}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-purple-300">{record.totalHrs}</td>
                          <td className="py-3 px-4 font-mono text-emerald-300">{record.overtime || '0h 00m'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              record.status === 'Present'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : record.status === 'Late'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : record.status === 'Working'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : record.status === 'On Leave'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-[140px]" title={record.remarks}>
                            {record.remarks || '--'}
                          </td>
                          {canManageRecords && (
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditModal(record)}
                                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 transition-colors cursor-pointer"
                                  title="Edit Attendance Record"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenDeleteModal(record)}
                                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
                                  title="Delete Attendance Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-500 text-xs">
                        <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <p className="font-semibold text-slate-400">No attendance logs found for {monthNames[selectedMonthIndex]} {selectedYear}.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: CALENDAR OVERVIEW
         ========================================================================= */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          {/* Calendar Header Navigation */}
          <div className="flex items-center justify-between glass-panel p-5 rounded-2xl border border-white/10 bg-[#131b2e]">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-bold text-white font-['Sora']">
                {monthNames[selectedMonthIndex]} {selectedYear}
              </h3>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Present
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Late
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> On Leave
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Absent
              </span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="glass-panel rounded-3xl border border-white/10 bg-[#131b2e] overflow-hidden p-4 shadow-xl">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 text-center text-slate-400 text-[11px] font-bold uppercase pb-3 border-b border-white/10">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2 pt-3">
              {(() => {
                const firstDayOfMonth = new Date(selectedYear, selectedMonthIndex, 1).getDay();
                const daysInMonth = new Date(selectedYear, selectedMonthIndex + 1, 0).getDate();
                const cells = [];

                // Empty padding for preceding month
                for (let i = 0; i < firstDayOfMonth; i++) {
                  cells.push(
                    <div key={`empty-${i}`} className="min-h-[90px] rounded-2xl bg-white/[0.01] border border-white/[0.02] opacity-25" />
                  );
                }

                // Month days
                for (let day = 1; day <= daysInMonth; day++) {
                  const dayStr = String(day).padStart(2, '0');
                  const monthStr = String(selectedMonthIndex + 1).padStart(2, '0');
                  const dateISO = `${selectedYear}-${monthStr}-${dayStr}`;
                  const isToday = dateISO === todayISO;
                  const dateObj = new Date(selectedYear, selectedMonthIndex, day);
                  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

                  // Get day stats
                  const dayRecs = attendanceRecords.filter(r => r.date === dateISO || r.date.includes(`${dayStr} ${monthNames[selectedMonthIndex].substring(0, 3)}`));
                  const presentCount = dayRecs.filter(r => r.status === 'Present' || r.status === 'Late' || r.status === 'Working').length;
                  const lateCount = dayRecs.filter(r => r.status === 'Late').length;

                  cells.push(
                    <button
                      key={dateISO}
                      onClick={() => setDayModalDate(dateISO)}
                      className={`min-h-[90px] p-2.5 rounded-2xl text-left flex flex-col justify-between transition-all cursor-pointer border ${
                        isToday
                          ? 'bg-purple-500/15 border-purple-500/40 shadow-lg shadow-purple-900/20'
                          : isWeekend
                          ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                          : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold font-mono ${isToday ? 'text-purple-300' : 'text-white'}`}>
                          {day}
                        </span>
                        {isToday && (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-purple-500 text-white uppercase">
                            Today
                          </span>
                        )}
                        {isWeekend && !isToday && (
                          <span className="text-[9px] text-slate-500 font-medium">Weekend</span>
                        )}
                      </div>

                      {/* Mini Stats Badges */}
                      <div className="space-y-1 mt-2">
                        {presentCount > 0 && (
                          <div className="flex items-center justify-between text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                            <span>Present</span>
                            <span className="font-bold">{presentCount}</span>
                          </div>
                        )}
                        {lateCount > 0 && (
                          <div className="flex items-center justify-between text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/20">
                            <span>Late</span>
                            <span className="font-bold">{lateCount}</span>
                          </div>
                        )}
                        {presentCount === 0 && !isWeekend && (
                          <div className="text-[10px] text-slate-500 italic px-1">
                            No punch logs
                          </div>
                        )}
                      </div>
                    </button>
                  );
                }

                return cells;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS
         ========================================================================= */}
      
      {/* 1. Add / Edit Attendance Modal */}
      <EditAttendanceModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRecord}
        initialRecord={editingRecord}
        employees={employees}
        selectedDate={modalDefaultDate}
        defaultEmployeeId={modalDefaultEmpId}
      />

      {/* 2. Delete Confirmation Modal */}
      <DeleteAttendanceModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingRecord(null);
        }}
        onConfirm={handleConfirmDelete}
        record={deletingRecord}
        isDeleting={isDeleting}
      />

      {/* 3. Individual Employee Attendance Profile Modal */}
      <AttendanceProfileModal
        isOpen={!!profileModalEmp}
        onClose={() => setProfileModalEmp(null)}
        employee={profileModalEmp}
        currentUser={currentUser}
        year={selectedYear}
        monthIndex={selectedMonthIndex}
        attendanceRecords={attendanceRecords}
        leaveRequests={leaveRequests}
        onEditRecord={handleOpenEditModal}
        onDeleteRecord={handleOpenDeleteModal}
        onAddRecordForDate={(empId, date) => handleOpenAddModal(empId, date)}
      />

      {/* 4. Day-Level Attendance Modal (Opened when clicking a date in Calendar) */}
      <DayAttendanceModal
        isOpen={!!dayModalDate}
        onClose={() => setDayModalDate(null)}
        dateISO={dayModalDate || ''}
        employees={employees}
        attendanceRecords={attendanceRecords}
        leaveRequests={leaveRequests}
        currentUser={currentUser}
        onAddRecord={(empId, date) => handleOpenAddModal(empId, date)}
        onEditRecord={handleOpenEditModal}
        onDeleteRecord={handleOpenDeleteModal}
      />
    </div>
  );
};
