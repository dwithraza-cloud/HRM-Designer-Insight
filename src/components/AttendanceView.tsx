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
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { AttendanceRecord, ViewMode } from '../types';

interface AttendanceViewProps {
  attendanceRecords: AttendanceRecord[];
  onNavigate: (view: ViewMode) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendanceRecords,
  onNavigate
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [isClockedIn, setIsClockedIn] = useState<boolean>(true);
  const [isOnBreak, setIsOnBreak] = useState<boolean>(false);
  const [records, setRecords] = useState<AttendanceRecord[]>(attendanceRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

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

  const handleClockToggle = () => {
    if (isClockedIn) {
      setIsClockedIn(false);
      setIsOnBreak(false);
      // update my record
      setRecords(prev => prev.map(r => r.empId === 'EMP-0142' ? { ...r, clockOut: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : r));
    } else {
      setIsClockedIn(true);
      setRecords(prev => prev.map(r => r.empId === 'EMP-0142' ? { ...r, clockIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), clockOut: '--:--', status: 'Present' } : r));
    }
  };

  const filtered = records.filter(r => {
    const matchSearch = r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || r.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div id="attendance-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Attendance Tracking</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real-time employee check-ins, punctuality, break periods, and logs.
          </p>
        </div>

        <button 
          onClick={() => alert('Attendance log downloaded as CSV.')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.09] text-slate-200 border border-white/10 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-purple-400" />
          <span>Export Logs</span>
        </button>
      </div>

      {/* Clock In/Out Live Card + Today's Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Clock Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#191e3b]/90 to-[#131b2e]/90 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Live Punch Desk
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isClockedIn ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-400'
              }`}>
                {isClockedIn ? (isOnBreak ? 'On Break' : 'Checked In') : 'Checked Out'}
              </span>
            </div>

            <div className="text-center py-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-white font-['Sora'] tracking-tight">
                {currentTime || '09:14:32 AM'}
              </p>
              <p className="text-xs text-slate-400 mt-1">{currentDateStr}</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleClockToggle}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isClockedIn 
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30' 
                    : 'brand-gradient-btn text-white'
                }`}
              >
                {isClockedIn ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                <span>{isClockedIn ? 'Clock Out' : 'Clock In'}</span>
              </button>

              <button
                disabled={!isClockedIn}
                onClick={() => setIsOnBreak(!isOnBreak)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
                  isOnBreak 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border-white/10 disabled:opacity-40'
                }`}
              >
                <Coffee className="w-4 h-4 text-amber-400" />
                <span>{isOnBreak ? 'Resume Work' : 'Take Break'}</span>
              </button>
            </div>
            <p className="text-[11px] text-center text-slate-500">
              Shift: Regular (09:00 AM – 06:00 PM)
            </p>
          </div>
        </div>

        {/* 4 Attendance KPI Tiles */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Total Present</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-['Sora']">1,048</p>
            <p className="text-[11px] text-emerald-400 font-medium">84% workforce present</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Late Arrivals</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-['Sora']">32</p>
            <p className="text-[11px] text-amber-300 font-medium">Checked in past 09:30 AM</p>
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
            <p className="text-2xl font-bold text-white font-['Sora']">80</p>
            <p className="text-[11px] text-rose-400 font-medium">6.4% absence rate</p>
          </div>
        </div>
      </div>

      {/* Attendance Logs Table */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white">Daily Punch Logs</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search attendee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filtered.map((record) => (
                <tr key={record.id} className="hover:bg-white/[0.02]">
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
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0">
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
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : record.status === 'Late'
                        ? 'bg-amber-500/20 text-amber-300'
                        : record.status === 'On Leave'
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
