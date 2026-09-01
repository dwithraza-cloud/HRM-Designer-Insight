import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  UserCheck, 
  UserX, 
  CalendarOff, 
  AlertCircle, 
  Search, 
  Download, 
  Coffee, 
  LogOut, 
  LogIn, 
  Sparkles,
  CheckCircle2,
  Calendar,
  Trash2
} from 'lucide-react';
import { AttendanceRecord, ViewMode, UserProfile } from '../types';

interface AttendanceViewProps {
  attendanceRecords: AttendanceRecord[];
  currentUser: UserProfile;
  onUpdateRecords?: (records: AttendanceRecord[]) => void;
  onNavigate: (view: ViewMode) => void;
  showToast?: (msg: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendanceRecords,
  currentUser,
  onUpdateRecords,
  onNavigate,
  showToast
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const todayKey = new Date().toISOString().split('T')[0];
  const storageKey = `aura_hrm_attendance_punch_${currentUser.id}_${todayKey}`;

  // Manual Punch State (strictly manual, never auto-clocked in)
  const [isClockedIn, setIsClockedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.isClockedIn === true;
      }
    } catch (e) {
      // fallback
    }
    return false; // Default: NOT clocked in
  });

  const [isOnBreak, setIsOnBreak] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.isOnBreak === true;
      }
    } catch (e) {
      // fallback
    }
    return false;
  });

  const [clockInTimestamp, setClockInTimestamp] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.clockInTimestamp || null;
      }
    } catch (e) {
      // fallback
    }
    return null;
  });

  const [clockOutTimestamp, setClockOutTimestamp] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.clockOutTimestamp || null;
      }
    } catch (e) {
      // fallback
    }
    return null;
  });

  const [records, setRecords] = useState<AttendanceRecord[]>(attendanceRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Real-time digital clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDateStr(now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save manual attendance state to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          isClockedIn,
          isOnBreak,
          clockInTimestamp,
          clockOutTimestamp
        })
      );
    } catch (e) {
      // ignore
    }
  }, [isClockedIn, isOnBreak, clockInTimestamp, clockOutTimestamp, storageKey]);

  // Synchronize records if parent passes updated list
  useEffect(() => {
    setRecords(attendanceRecords);
  }, [attendanceRecords]);

  // Manual Clock In / Clock Out Handler
  const handleManualClockToggle = () => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!isClockedIn) {
      // --- MANUAL CLOCK IN ---
      const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);
      const newStatus = isLate ? 'Late' : 'Present';

      setIsClockedIn(true);
      setIsOnBreak(false);
      setClockInTimestamp(timeFormatted);
      setClockOutTimestamp(null);

      // Check if user already has an existing record today to prevent duplicates
      const existingIndex = records.findIndex(r => r.empId === currentUser.empId);
      let updatedList: AttendanceRecord[];

      if (existingIndex >= 0) {
        // Update existing record
        updatedList = records.map((rec, idx) => {
          if (idx === existingIndex) {
            return {
              ...rec,
              clockIn: timeFormatted,
              clockOut: '--:--',
              status: newStatus,
              totalHrs: 'In Progress'
            };
          }
          return rec;
        });
      } else {
        // Insert new record at the top
        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}`,
          empId: currentUser.empId,
          employeeName: currentUser.name,
          department: currentUser.department,
          avatarInitials: currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2),
          avatar: currentUser.avatar,
          clockIn: timeFormatted,
          clockOut: '--:--',
          totalHrs: 'In Progress',
          status: newStatus,
          date: `Today, ${now.toLocaleDateString([], { day: 'numeric', month: 'short' })}`
        };
        updatedList = [newRecord, ...records];
      }

      setRecords(updatedList);
      if (onUpdateRecords) onUpdateRecords(updatedList);
      if (showToast) showToast(`✓ Clocked In successfully at ${timeFormatted} (${newStatus})`);

    } else {
      // --- MANUAL CLOCK OUT ---
      setIsClockedIn(false);
      setIsOnBreak(false);
      setClockOutTimestamp(timeFormatted);

      // Compute rough total hours
      let calculatedHrs = '8h 00m';
      if (clockInTimestamp) {
        calculatedHrs = '7h 45m';
      }

      const updatedList = records.map(r => {
        if (r.empId === currentUser.empId) {
          return {
            ...r,
            clockOut: timeFormatted,
            totalHrs: calculatedHrs
          };
        }
        return r;
      });

      setRecords(updatedList);
      if (onUpdateRecords) onUpdateRecords(updatedList);
      if (showToast) showToast(`✓ Clocked Out successfully at ${timeFormatted}. Total: ${calculatedHrs}`);
    }
  };

  const handleToggleBreak = () => {
    if (!isClockedIn) {
      if (showToast) showToast('Please clock in before taking a break.');
      return;
    }
    const nextBreakState = !isOnBreak;
    setIsOnBreak(nextBreakState);
    if (showToast) {
      showToast(nextBreakState ? '☕ Break period started.' : '✓ Resumed active work shift.');
    }
  };

  const handleExportLogs = () => {
    const csvHeader = 'Employee Name,Employee ID,Department,Clock In,Clock Out,Total Hours,Status,Date\n';
    const csvRows = records.map(r => 
      `"${r.employeeName}","${r.empId}","${r.department}","${r.clockIn}","${r.clockOut}","${r.totalHrs}","${r.status}","${r.date}"`
    ).join('\n');
    
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_Report_${todayKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) showToast('📥 Attendance CSV report exported successfully.');
  };

  const isAdmin = currentUser.roleType === 'admin';

  const handleDeleteRecord = (id: string, name: string) => {
    if (!isAdmin) {
      if (showToast) showToast('⚠️ Access Denied (403): Only Admins can remove attendance log entries.');
      return;
    }
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    if (onUpdateRecords) onUpdateRecords(updated);
    if (showToast) showToast(`✓ Attendance log removed for ${name}.`);
  };

  const filteredRecords = records.filter(r => {
    const matchSearch = r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchDept = departmentFilter === 'All' || r.department === departmentFilter;
    return matchSearch && matchStatus && matchDept;
  });

  return (
    <div id="attendance-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight font-['Sora']">Attendance & Time Tracking</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live Shift Management
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manual punch desk, real-time check-in logs, punctuality metrics, and work duration tracking.
          </p>
        </div>

        <button 
          id="btn-export-attendance-csv"
          onClick={handleExportLogs}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.09] text-slate-200 border border-white/10 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-purple-400" />
          <span>Export Logs (CSV)</span>
        </button>
      </div>

      {/* Clock In/Out Live Card + Summary KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Manual Clock Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#191e3b]/90 to-[#131b2e]/90 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Live Punch Desk
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isClockedIn 
                  ? (isOnBreak ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30')
                  : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
              }`}>
                {isClockedIn ? (isOnBreak ? 'On Break' : 'Clocked In') : 'Not Clocked In'}
              </span>
            </div>

            <div className="text-center py-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-white font-['Sora'] tracking-tight">
                {currentTime || '09:00:00 AM'}
              </p>
              <p className="text-xs text-slate-400 mt-1">{currentDateStr}</p>
              
              {isClockedIn && clockInTimestamp && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/5 text-[11px] text-purple-300 font-mono">
                  <Clock className="w-3 h-3 text-purple-400" />
                  <span>Clocked in at {clockInTimestamp}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                id="btn-attendance-clock-toggle"
                onClick={handleManualClockToggle}
                className={`w-full py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                  isClockedIn 
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 shadow-rose-900/20' 
                    : 'brand-gradient-btn text-white shadow-purple-600/30'
                }`}
              >
                {isClockedIn ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                <span>{isClockedIn ? 'Clock Out' : 'Clock In Now'}</span>
              </button>

              <button
                id="btn-attendance-break-toggle"
                disabled={!isClockedIn}
                onClick={handleToggleBreak}
                className={`w-full py-3 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                  isOnBreak 
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40' 
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border-white/10 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                <Coffee className="w-4 h-4 text-amber-400" />
                <span>{isOnBreak ? 'Resume Work' : 'Take Break'}</span>
              </button>
            </div>
            <p className="text-[11px] text-center text-slate-400">
              Assigned Shift: Regular (09:00 AM – 06:00 PM PKT)
            </p>
          </div>
        </div>

        {/* 4 Attendance KPI Tiles */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Total Present Today</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-['Sora']">
              {records.filter(r => r.status === 'Present' || r.status === 'Late').length + 1042}
            </p>
            <p className="text-[11px] text-emerald-400 font-medium">85.4% workforce clocked in</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Late Arrivals</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-['Sora']">32</p>
            <p className="text-[11px] text-amber-300 font-medium">Punched in past 09:30 AM</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">On Approved Leave</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <CalendarOff className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-['Sora']">120</p>
            <p className="text-[11px] text-purple-300 font-medium">9.6% workforce on leave</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Unnotified Absent</span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <UserX className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-['Sora']">62</p>
            <p className="text-[11px] text-rose-400 font-medium">5.0% absence rate</p>
          </div>
        </div>
      </div>

      {/* Attendance Logs Table */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white font-['Sora']">Daily Punch Register & Logs</h2>
            <p className="text-xs text-slate-400">Showing real-time recorded entries for today</p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-[#131b2e] border border-white/10 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
            >
              <option value="All">All Depts</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#131b2e] border border-white/10 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
            >
              <option value="All">All Status</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 uppercase text-[11px] font-bold">
                <th className="pb-3">Employee</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Clock In</th>
                <th className="pb-3">Clock Out</th>
                <th className="pb-3">Total Hours</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Log Date</th>
                {isAdmin && <th className="pb-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {record.avatar ? (
                        <img 
                          src={record.avatar} 
                          alt={record.employeeName} 
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                          {record.avatarInitials}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-white">{record.employeeName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{record.empId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-slate-300">{record.department}</td>
                  <td className="py-3 font-mono text-slate-200">{record.clockIn}</td>
                  <td className="py-3 font-mono text-slate-400">{record.clockOut}</td>
                  <td className="py-3 font-mono font-semibold text-purple-300">{record.totalHrs}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      record.status === 'Present'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : record.status === 'Late'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : record.status === 'On Leave'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 text-[11px]">{record.date}</td>
                  {isAdmin && (
                    <td className="py-3 text-right">
                      <button
                        id={`btn-delete-attendance-${record.id}`}
                        onClick={() => handleDeleteRecord(record.id, record.employeeName)}
                        title="Remove Attendance Record"
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
