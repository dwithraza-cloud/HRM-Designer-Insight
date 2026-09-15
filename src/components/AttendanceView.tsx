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
  Info,
  Lock,
  ShieldCheck,
  Users
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
  generateEmployeeMonthlyRoster,
  isDateCoveredByApprovedLeave,
  WORKFORCE_SHIFTS,
  DEFAULT_SHIFT_LABEL,
  getShiftStartTime
} from '../utils/attendanceUtils';
import { dbService } from '../services/dbService';
import { EditAttendanceModal } from './attendance/EditAttendanceModal';
import { DeleteAttendanceModal } from './attendance/DeleteAttendanceModal';
import { AttendanceProfileModal } from './attendance/AttendanceProfileModal';
import { DayAttendanceModal } from './attendance/DayAttendanceModal';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function parseDurationToMinutes(durationStr?: string): number {
  if (!durationStr || durationStr === '--:--' || durationStr === '--') return 0;
  const clean = durationStr.replace(/Working\s*\(/i, '').replace(/\)/g, '').trim();
  let mins = 0;
  const hMatch = clean.match(/(\d+)\s*h(?:rs?)?/i);
  const mMatch = clean.match(/(\d+)\s*m(?:in|ins?)?/i);
  if (hMatch) {
    mins += parseInt(hMatch[1], 10) * 60;
  }
  if (mMatch) {
    mins += parseInt(mMatch[1], 10);
  }
  if (!hMatch && !mMatch) {
    const num = parseFloat(clean);
    if (!isNaN(num)) {
      mins += Math.round(num * 60);
    }
  }
  return mins;
}

function formatMinutesToHoursStr(totalMins: number): string {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

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
  onUpdateRecords,
  onNavigate,
  showToast
}) => {
  const isAdmin = currentUser.roleType === 'admin';
  const isManager = currentUser.roleType === 'manager';
  // Strictly Admin-only management: Anyone can view any calendar, but ONLY Admin can edit/modify/add attendance records
  const canManageRecords = isAdmin;

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

  // Calendar Target Employee: 'all' for overview, or an employee's empId to view their personal calendar
  const [calendarTargetEmpId, setCalendarTargetEmpId] = useState<string>('all');

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

  // Local optimistic records state to ensure instantaneous UI updates on delete/punch
  const [localRecords, setLocalRecords] = useState<AttendanceRecord[]>(() =>
    attendanceRecords.filter(r => !dbService.isItemDeleted('attendance', r.id))
  );

  // Keep localRecords in sync with props while respecting tombstones
  useEffect(() => {
    setLocalRecords(attendanceRecords.filter(r => !dbService.isItemDeleted('attendance', r.id)));
  }, [attendanceRecords]);

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
    return localRecords.find(r => {
      if (dbService.isItemDeleted('attendance', r.id)) return false;
      const matchEmp = r.empId === currentUser.empId || r.employeeName.toLowerCase() === currentUser.name.toLowerCase();
      if (!matchEmp) return false;
      return r.date === todayISO || r.date.includes(todayDisplay) || r.date.includes('Today');
    });
  }, [localRecords, currentUser, todayISO, todayDisplay]);

  // Active shift selection for current user
  const [selectedShift, setSelectedShift] = useState<string>(() => {
    return myTodayRecord?.shift || currentUser.shift || DEFAULT_SHIFT_LABEL;
  });

  // Keep selectedShift synced if user profile or existing record provides it
  useEffect(() => {
    if (myTodayRecord?.shift) {
      setSelectedShift(myTodayRecord.shift);
    }
  }, [myTodayRecord?.shift]);

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
    return calculateTodayAttendanceKPIs(employees, localRecords, leaveRequests);
  }, [employees, localRecords, leaveRequests]);

  // Monthly Report KPIs (Aggregated for currently selected month and year)
  const monthlyKPIs = useMemo(() => {
    const monthPadded = String(selectedMonthIndex + 1).padStart(2, '0');
    const monthPrefix = `${selectedYear}-${monthPadded}`;
    const monthShort = MONTH_NAMES[selectedMonthIndex].substring(0, 3);

    // Records belonging to this month
    const monthRecords = localRecords.filter(r => {
      if (dbService.isItemDeleted('attendance', r.id)) return false;
      return r.date.startsWith(monthPrefix) || r.date.includes(monthShort);
    });

    const uniquePunchedEmpIds = new Set(monthRecords.map(r => r.empId));
    const uniqueEmployeesCount = Math.max(uniquePunchedEmpIds.size, employees.length || 1);

    // Present logs in this month
    const presentLogs = monthRecords.filter(r => 
      r.status === 'Present' || r.status === 'Late' || (r.clockIn && r.clockIn !== '--:--')
    );
    const totalPresentLogs = presentLogs.length;

    // Late arrivals in month
    const lateLogs = monthRecords.filter(r => 
      r.status === 'Late' || (r.lateDuration && r.lateDuration !== '--' && r.lateDuration !== '0m')
    );
    const lateCount = lateLogs.length;
    const uniqueLateEmpIds = new Set(lateLogs.map(r => r.empId));
    const uniqueLateEmployeesCount = uniqueLateEmpIds.size;

    const latePercent = totalPresentLogs > 0 ? Math.min(100, Math.round((lateCount / totalPresentLogs) * 100)) : 0;
    const punctualPercent = totalPresentLogs > 0 ? Math.max(0, 100 - latePercent) : 100;

    // Approved leave requests active in this month
    const approvedInMonth = leaveRequests.filter(r => {
      if (r.status !== 'Approved') return false;
      const start = r.startDate || '';
      const end = r.endDate || '';
      return start.startsWith(monthPrefix) || end.startsWith(monthPrefix) || 
             start.includes(monthShort) || end.includes(monthShort);
    });

    const leaveDaysCount = approvedInMonth.reduce((sum, r) => sum + (Number(r.daysCount) || 1), 0);
    const leaveRequestsCount = approvedInMonth.length;

    // Total work hours and overtime
    let totalWorkMinutes = 0;
    let totalOvertimeMinutes = 0;

    monthRecords.forEach(r => {
      totalWorkMinutes += parseDurationToMinutes(r.totalHrs);
      totalOvertimeMinutes += parseDurationToMinutes(r.overtime);
    });

    return {
      monthName: MONTH_NAMES[selectedMonthIndex],
      year: selectedYear,
      totalPresentLogs,
      uniqueEmployeesCount,
      lateCount,
      uniqueLateEmployeesCount,
      latePercent,
      punctualPercent,
      leaveDaysCount,
      leaveRequestsCount,
      totalHoursLoggedStr: formatMinutesToHoursStr(totalWorkMinutes),
      totalOvertimeStr: formatMinutesToHoursStr(totalOvertimeMinutes),
      totalWorkMinutes,
      totalRecordsCount: monthRecords.length
    };
  }, [localRecords, selectedMonthIndex, selectedYear, leaveRequests, employees]);

  // Selected Employee for Calendar View
  const selectedCalendarEmployee = useMemo(() => {
    if (calendarTargetEmpId === 'all') return null;
    return employees.find(e => e.empId === calendarTargetEmpId || e.id === calendarTargetEmpId) || null;
  }, [calendarTargetEmpId, employees]);

  // Calculated Month-wise Roster for the Selected Employee in Calendar
  const selectedCalendarEmployeeSummary = useMemo(() => {
    if (!selectedCalendarEmployee) return null;
    return generateEmployeeMonthlyRoster(
      selectedCalendarEmployee,
      selectedYear,
      selectedMonthIndex,
      localRecords,
      leaveRequests
    );
  }, [selectedCalendarEmployee, selectedYear, selectedMonthIndex, localRecords, leaveRequests]);

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
      const shiftStartTime = getShiftStartTime(selectedShift);
      const punctuality = determinePunctuality(clockInTimeStr, shiftStartTime, 15);
      const dayName = nowPKT.toLocaleDateString('en-US', { weekday: 'long' });

      const newRecord: AttendanceRecord = {
        id: `att-${currentUser.empId}-${todayISO}-${Date.now()}`,
        empId: currentUser.empId,
        employeeName: currentUser.name,
        department: currentUser.department,
        avatar: currentUser.avatar,
        avatarInitials: currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2),
        date: todayISO,
        displayDate: formatPKTDateDisplay(todayISO),
        dayName,
        shift: selectedShift,
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
      
      const nextRecords = [
        newRecord,
        ...localRecords.filter(r => !(r.empId === currentUser.empId && r.date === todayISO))
      ];
      setLocalRecords(nextRecords);
      if (onUpdateRecords) {
        onUpdateRecords(nextRecords);
      }

      if (showToast) {
        showToast(
          `✓ Clocked In successfully at ${clockInTimeStr} for ${selectedShift} (${punctuality.status === 'Late' ? 'Late: ' + punctuality.lateDuration : 'Present & On Time'})`,
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
      const nextRecords = localRecords.map(r => r.id === updatedRecord.id ? updatedRecord : r);
      setLocalRecords(nextRecords);
      if (onUpdateRecords) {
        onUpdateRecords(nextRecords);
      }
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
      const nextRecords = localRecords.map(r => r.id === updatedRecord.id ? updatedRecord : r);
      setLocalRecords(nextRecords);
      if (onUpdateRecords) {
        onUpdateRecords(nextRecords);
      }
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
    const exists = localRecords.some(r => r.id === record.id);
    const nextRecords = exists
      ? localRecords.map(r => r.id === record.id ? record : r)
      : [record, ...localRecords];
    setLocalRecords(nextRecords);
    if (onUpdateRecords) {
      onUpdateRecords(nextRecords);
    }
    if (showToast) {
      showToast(`✓ Attendance record for ${record.employeeName} saved permanently`, 'success');
    }
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (record: AttendanceRecord) => {
    setDeletingRecord(record);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete - Instant UI removal and durable persistence
  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    const recordToDelete = deletingRecord;
    const targetId = recordToDelete.id;
    const targetEmpId = recordToDelete.empId;
    const targetEmpName = recordToDelete.employeeName;
    const targetDate = recordToDelete.date;

    // 1. Immediately dismiss modal so user doesn't wait
    setIsDeleteModalOpen(false);
    setDeletingRecord(null);
    setIsDeleting(false);

    // 2. Identify all IDs to purge
    const idsToDelete = new Set<string>([targetId]);
    localRecords.forEach(r => {
      if (
        r.id === targetId ||
        (r.empId === targetEmpId && r.date === targetDate) ||
        (targetEmpName && r.employeeName.toLowerCase() === targetEmpName.toLowerCase() && r.date === targetDate)
      ) {
        idsToDelete.add(r.id);
      }
    });

    // Cleanup legacy IDs if any
    if (targetEmpId === 'EMP-0109' || targetEmpName.toLowerCase().includes('iqra')) idsToDelete.add('att-hist-04');
    if (targetEmpId === 'EMP-0110' || targetEmpName.toLowerCase().includes('asim')) idsToDelete.add('att-hist-05');
    if (targetEmpId === 'EMP-0001' || targetEmpName.toLowerCase().includes('raza')) idsToDelete.add('att-hist-01');
    if (targetEmpId === 'EMP-0142' || targetEmpName.toLowerCase().includes('rani')) idsToDelete.add('att-hist-02');
    if (targetEmpId === 'EMP-0103' || targetEmpName.toLowerCase().includes('aqsa')) idsToDelete.add('att-hist-03');
    if (targetEmpId === 'EMP-0111' || targetEmpName.toLowerCase().includes('saba')) idsToDelete.add('att-hist-06');

    // 3. Mark in tombstones (localStorage + memory cache + Firestore metadata)
    idsToDelete.forEach(id => dbService.markItemDeleted('attendance', id));

    // 4. INSTANT OPTIMISTIC UI REMOVAL: row disappears immediately
    const updatedRecords = localRecords.filter(r => !idsToDelete.has(r.id));
    setLocalRecords(updatedRecords);
    if (onUpdateRecords) {
      onUpdateRecords(updatedRecords);
    }

    if (showToast) {
      showToast(`✓ Attendance record for ${targetEmpName} deleted permanently`, 'success');
    }

    // 5. Asynchronously delete from Firestore in the background
    try {
      await Promise.all(
        Array.from(idsToDelete).map(id => dbService.deleteItem('attendance', id).catch(() => {}))
      );
    } catch (err) {
      console.warn('Background Firestore delete notice:', err);
    }
  };

  // Filtered Today's Records - Shows employees who have an attendance record logged for today
  const filteredTodayRecords = useMemo(() => {
    const recordsMap = new Map<string, AttendanceRecord>();

    // Add recorded attendance records matching today
    localRecords.forEach(r => {
      if (dbService.isItemDeleted('attendance', r.id)) return;
      const matchDate = r.date === todayISO || r.date.includes(todayDisplay) || r.date.includes('Today');
      if (matchDate) {
        recordsMap.set(r.empId, r);
      }
    });

    const allToday = Array.from(recordsMap.values());

    return allToday.filter(r => {
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
  }, [localRecords, todayISO, todayDisplay, searchQuery, deptFilter, statusFilter]);

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

    return localRecords.filter(r => {
      if (dbService.isItemDeleted('attendance', r.id)) return false;
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
  }, [localRecords, selectedYear, selectedMonthIndex, searchQuery, deptFilter, employeeFilter, statusFilter, monthNames]);

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
                Pakistan Standard Time (PKT / Asia/Karachi) • Real-Time Tracking, Automatic Punch Synchronization & Full Record Editability
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
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 pt-0.5">
                <span>Shift:</span>
                {!isClockedIn && !isShiftCompleted ? (
                  <select
                    value={selectedShift}
                    onChange={(e) => setSelectedShift(e.target.value)}
                    className="px-2.5 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs font-medium focus:outline-none focus:border-purple-400 cursor-pointer"
                  >
                    {WORKFORCE_SHIFTS.map(s => (
                      <option key={s.id} value={s.label} className="bg-[#131b2e] text-slate-200">
                        {s.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-slate-200 font-medium px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">
                    {myTodayRecord?.shift || selectedShift}
                  </span>
                )}
                <span className="text-slate-600">•</span>
                <span>Department: <strong className="text-slate-300 font-medium">{currentUser.department}</strong></span>
              </div>
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

      {/* Main Content Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            id="tab-btn-today-register"
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'today'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white'
            }`}
          >
            Today's Punch Register ({todayDisplay})
          </button>
          <button
            id="tab-btn-monthly-history"
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'monthly'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white'
            }`}
          >
            Month-wise History & Roster
          </button>
          <button
            id="tab-btn-calendar-overview"
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white'
            }`}
          >
            Calendar Overview
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {(activeTab === 'monthly' || activeTab === 'calendar') && (
            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-xl px-2 py-1">
              <button
                onClick={handlePrevMonth}
                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-white px-1">
                {MONTH_NAMES[selectedMonthIndex]} {selectedYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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
      </div>

      {/* Top 4 Attendance Statistics KPI Cards (Dynamically toggles between Today's Live Counters & Monthly Report) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {activeTab === 'today' 
                ? `Daily Live Attendance Dashboard (${todayDisplay})` 
                : `Monthly Attendance Report Summary — ${MONTH_NAMES[selectedMonthIndex]} ${selectedYear}`}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {activeTab === 'today' ? 'Synchronized with live punches' : `Calculated from ${monthlyKPIs.totalRecordsCount} month punch logs`}
          </span>
        </div>

        {activeTab === 'today' ? (
          /* TODAY'S LIVE STATS */
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
        ) : (
          /* MONTHLY REPORT STATS */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            {/* Monthly Punches Logged */}
            <div className="glass-panel p-5 rounded-3xl border border-purple-500/20 bg-[#131b2e] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Monthly Punches Logged</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white font-['Sora']">{monthlyKPIs.totalPresentLogs}</span>
                <span className="text-xs text-slate-400">/ {monthlyKPIs.uniqueEmployeesCount} Staff Active</span>
              </div>
              <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${monthlyKPIs.punctualPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-emerald-400 font-medium">
                {monthlyKPIs.punctualPercent}% on-time rate ({monthlyKPIs.totalPresentLogs - monthlyKPIs.lateCount} punctual)
              </p>
            </div>

            {/* Monthly Late Arrivals */}
            <div className="glass-panel p-5 rounded-3xl border border-purple-500/20 bg-[#131b2e] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Monthly Late Arrivals</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-amber-300 font-['Sora']">{monthlyKPIs.lateCount}</span>
                <span className="text-xs text-slate-400">Punches ({monthlyKPIs.latePercent}%)</span>
              </div>
              <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${monthlyKPIs.latePercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                {monthlyKPIs.uniqueLateEmployeesCount} unique employees clocked in late
              </p>
            </div>

            {/* Monthly Approved Leaves */}
            <div className="glass-panel p-5 rounded-3xl border border-purple-500/20 bg-[#131b2e] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Monthly Approved Leaves</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <CalendarOff className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-purple-300 font-['Sora']">{monthlyKPIs.leaveDaysCount}</span>
                <span className="text-xs text-slate-400">Days Approved</span>
              </div>
              <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, monthlyKPIs.leaveDaysCount * 8)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                {monthlyKPIs.leaveRequestsCount} approved leave applications in {monthlyKPIs.monthName}
              </p>
            </div>

            {/* Total Work Hours Logged */}
            <div className="glass-panel p-5 rounded-3xl border border-purple-500/20 bg-[#131b2e] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Total Work Hours Logged</span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-300 font-['Sora']">{monthlyKPIs.totalHoursLoggedStr}</span>
                <span className="text-xs text-slate-400">Cumulative Time</span>
              </div>
              <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: '100%' }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Overtime recorded: <span className="text-purple-300 font-semibold">{monthlyKPIs.totalOvertimeStr}</span>
              </p>
            </div>
          </div>
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
                          <td className="py-3 px-4 text-slate-400 text-[11px]">{record.shift || DEFAULT_SHIFT_LABEL}</td>
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
          {/* Calendar Employee Chooser & Access Bar */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-[#131b2e] shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Sora'] flex items-center gap-2">
                    <span>Attendance Calendar View</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Select whose calendar you want to view: your personal schedule, any team member's record, or company overview.
                  </p>
                </div>
              </div>

              {/* Access permission notice */}
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Admin Mode (Full Edit & Audit Access)</span>
                  </div>
                ) : (
                  <div className="px-3.5 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    <Lock className="w-4 h-4 text-purple-400" />
                    <span>View-Only Mode (Only Admin can edit attendance)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Employee Selection Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5">
              <div className="flex items-center gap-2.5 flex-wrap flex-1">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>Whose Calendar to View:</span>
                </span>

                <select
                  value={calendarTargetEmpId}
                  onChange={(e) => setCalendarTargetEmpId(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-purple-500 min-w-[260px] cursor-pointer"
                >
                  <option value="all" className="bg-[#131b2e] font-bold text-purple-300">
                    👥 All Employees (Workforce Overview)
                  </option>
                  <option value={currentUser.empId} className="bg-[#131b2e] font-semibold text-emerald-300">
                    👤 My Calendar ({currentUser.name} — {currentUser.department})
                  </option>
                  <optgroup label="🏢 Team Members & Colleagues" className="bg-[#131b2e] text-slate-400 font-semibold">
                    {employees
                      .filter(e => e.empId !== currentUser.empId)
                      .map(e => (
                        <option key={e.empId} value={e.empId} className="bg-[#131b2e] text-slate-200">
                          {e.name} — {e.empId} ({e.department || e.role})
                        </option>
                      ))}
                  </optgroup>
                </select>

                {/* Quick Switch Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCalendarTargetEmpId(currentUser.empId)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      calendarTargetEmpId === currentUser.empId
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                        : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/5'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My Calendar</span>
                  </button>

                  <button
                    onClick={() => setCalendarTargetEmpId('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      calendarTargetEmpId === 'all'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                        : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/5'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>All Workforce</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Employee Avatar Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
              <span className="text-[11px] text-slate-400 whitespace-nowrap font-medium pr-1">Quick Select:</span>
              {employees.map(emp => {
                const isSelected = calendarTargetEmpId === emp.empId;
                const isMe = emp.empId === currentUser.empId;

                return (
                  <button
                    key={emp.empId}
                    onClick={() => setCalendarTargetEmpId(emp.empId)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                      isSelected
                        ? 'bg-purple-500/25 border-purple-500/50 text-white ring-1 ring-purple-500/50'
                        : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.07] hover:text-white'
                    }`}
                    title={`${emp.name} (${emp.department || emp.role})`}
                  >
                    {emp.avatar ? (
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-5 h-5 rounded-full object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-[9px] shrink-0">
                        {emp.avatarInitials || emp.name.substring(0, 2)}
                      </div>
                    )}
                    <span className="font-semibold">{emp.name.split(' ')[0]}</span>
                    {isMe && <span className="text-[10px] text-purple-300 font-mono font-bold">(You)</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Employee Monthly Summary Banner (When viewing a specific person) */}
          {selectedCalendarEmployee && selectedCalendarEmployeeSummary && (
            <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-gradient-to-r from-[#141b30] via-[#161a36] to-[#1a1336] shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Employee Info */}
                <div className="flex items-center gap-4">
                  {selectedCalendarEmployee.avatar ? (
                    <img
                      src={selectedCalendarEmployee.avatar}
                      alt={selectedCalendarEmployee.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-500/40 shadow-lg shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/25 text-purple-300 font-bold flex items-center justify-center text-lg ring-2 ring-purple-500/30 shrink-0">
                      {selectedCalendarEmployee.avatarInitials || selectedCalendarEmployee.name.substring(0, 2)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-white font-['Sora']">
                        {selectedCalendarEmployee.name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-white/[0.06] text-purple-300 border border-purple-500/30">
                        {selectedCalendarEmployee.empId}
                      </span>
                      {selectedCalendarEmployee.empId === currentUser.empId ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          Your Personal Calendar
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Colleague Calendar (View Only)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>{selectedCalendarEmployee.designation || selectedCalendarEmployee.role}</span>
                      <span>•</span>
                      <span className="text-slate-300">{selectedCalendarEmployee.department}</span>
                      <span>•</span>
                      <span className="text-purple-300 font-semibold">{monthNames[selectedMonthIndex]} {selectedYear}</span>
                    </p>
                  </div>
                </div>

                {/* Monthly KPI Metrics for Selected Employee */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center min-w-[75px]">
                    <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Present</span>
                    <span className="text-base font-bold text-white font-['Sora']">{selectedCalendarEmployeeSummary.presentDays} <span className="text-[10px] font-normal text-emerald-300">Days</span></span>
                  </div>

                  <div className="px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center min-w-[75px]">
                    <span className="text-[10px] text-amber-300 uppercase font-semibold block">Late</span>
                    <span className="text-base font-bold text-white font-['Sora']">{selectedCalendarEmployeeSummary.lateDays} <span className="text-[10px] font-normal text-amber-300">Days</span></span>
                  </div>

                  <div className="px-3.5 py-2 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center min-w-[75px]">
                    <span className="text-[10px] text-purple-300 uppercase font-semibold block">On Leave</span>
                    <span className="text-base font-bold text-white font-['Sora']">{selectedCalendarEmployeeSummary.leaveDays} <span className="text-[10px] font-normal text-purple-300">Days</span></span>
                  </div>

                  <div className="px-3.5 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center min-w-[90px]">
                    <span className="text-[10px] text-indigo-300 uppercase font-semibold block">Logged Hours</span>
                    <span className="text-sm font-bold text-white font-mono block">{selectedCalendarEmployeeSummary.totalWorkingHoursFormatted}</span>
                  </div>

                  <button
                    onClick={() => setProfileModalEmp(selectedCalendarEmployee)}
                    className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer self-stretch justify-center"
                    title="View Full Month Breakdown & Export"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Full Roster</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Calendar Month Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-4 rounded-2xl border border-white/10 bg-[#131b2e]">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-base font-bold text-white font-['Sora']">
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
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Working
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
                    <div key={`empty-${i}`} className="min-h-[96px] rounded-2xl bg-white/[0.01] border border-white/[0.02] opacity-25" />
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

                  // 1. INDIVIDUAL EMPLOYEE VIEW
                  if (selectedCalendarEmployee && selectedCalendarEmployeeSummary) {
                    const row = selectedCalendarEmployeeSummary.dailyRows[day - 1];
                    const status = row ? row.status : isWeekend ? 'Weekend' : 'Absent';
                    const clockIn = row?.clockIn || '--:--';
                    const clockOut = row?.clockOut || '--:--';
                    const totalHrs = row?.totalHrs || '--:--';
                    const lateDuration = row?.lateDuration || '--';

                    const isPresent = status === 'Present';
                    const isLate = status === 'Late';
                    const isWorking = status === 'Working';
                    const isOnLeave = status === 'On Leave';
                    const isRowWeekend = status === 'Weekend';
                    const isAbsent = status === 'Absent';

                    cells.push(
                      <button
                        key={dateISO}
                        onClick={() => setDayModalDate(dateISO)}
                        className={`min-h-[96px] p-2.5 rounded-2xl text-left flex flex-col justify-between transition-all cursor-pointer border ${
                          isToday
                            ? 'bg-purple-500/15 border-purple-500/50 shadow-lg shadow-purple-900/20'
                            : isPresent
                            ? 'bg-emerald-950/20 border-emerald-500/25 hover:bg-emerald-950/30'
                            : isLate
                            ? 'bg-amber-950/20 border-amber-500/25 hover:bg-amber-950/30'
                            : isWorking
                            ? 'bg-blue-950/20 border-blue-500/30 hover:bg-blue-950/30'
                            : isOnLeave
                            ? 'bg-purple-950/20 border-purple-500/25 hover:bg-purple-950/30'
                            : isRowWeekend
                            ? 'bg-white/[0.015] border-white/5 opacity-60 hover:opacity-100'
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
                          {isRowWeekend && !isToday && (
                            <span className="text-[9px] text-slate-500 font-medium">Weekend</span>
                          )}
                        </div>

                        {/* Status detail */}
                        <div className="space-y-1 mt-1.5">
                          {isPresent && (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Present
                                </span>
                                <span className="text-[10px] font-mono font-semibold text-emerald-300">{totalHrs}</span>
                              </div>
                              <p className="text-[9px] font-mono text-slate-400 truncate">
                                {clockIn} - {clockOut}
                              </p>
                            </>
                          )}

                          {isLate && (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Late {lateDuration !== '--' ? `(${lateDuration})` : ''}
                                </span>
                                <span className="text-[10px] font-mono font-semibold text-amber-300">{totalHrs}</span>
                              </div>
                              <p className="text-[9px] font-mono text-slate-400 truncate">
                                {clockIn} - {clockOut}
                              </p>
                            </>
                          )}

                          {isWorking && (
                            <>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse block w-fit">
                                Working
                              </span>
                              <p className="text-[9px] font-mono text-blue-300 mt-1">In: {clockIn}</p>
                            </>
                          )}

                          {isOnLeave && (
                            <div className="space-y-0.5">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 block w-fit">
                                On Leave
                              </span>
                              <p className="text-[9px] text-purple-300/80 truncate">
                                {row?.remarks || 'Approved'}
                              </p>
                            </div>
                          )}

                          {isAbsent && !isRowWeekend && (
                            <div className="space-y-0.5">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/20 block w-fit">
                                Absent
                              </span>
                              <p className="text-[9px] text-slate-500 italic">No punch logged</p>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  } else {
                    // 2. COMPANY-WIDE / ALL EMPLOYEES OVERVIEW
                    const dayRecs = localRecords.filter(r => 
                      !dbService.isItemDeleted('attendance', r.id) && 
                      (r.date === dateISO || r.date.includes(`${dayStr} ${monthNames[selectedMonthIndex].substring(0, 3)}`))
                    );
                    const presentCount = dayRecs.filter(r => r.status === 'Present' || r.status === 'Late' || r.status === 'Working').length;
                    const lateCount = dayRecs.filter(r => r.status === 'Late').length;

                    cells.push(
                      <button
                        key={dateISO}
                        onClick={() => setDayModalDate(dateISO)}
                        className={`min-h-[96px] p-2.5 rounded-2xl text-left flex flex-col justify-between transition-all cursor-pointer border ${
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
        attendanceRecords={localRecords}
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
        attendanceRecords={localRecords}
        leaveRequests={leaveRequests}
        currentUser={currentUser}
        onAddRecord={(empId, date) => handleOpenAddModal(empId, date)}
        onEditRecord={handleOpenEditModal}
        onDeleteRecord={handleOpenDeleteModal}
      />
    </div>
  );
};
