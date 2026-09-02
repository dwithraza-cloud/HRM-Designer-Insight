import React from 'react';
import { 
  X, 
  UserCheck, 
  AlertCircle, 
  UserX, 
  CalendarOff, 
  Clock, 
  Zap, 
  Calendar, 
  Edit3, 
  Trash2,
  Download,
  Briefcase
} from 'lucide-react';
import { Employee, AttendanceRecord, LeaveRequest, UserProfile } from '../../types';
import { generateEmployeeMonthlyRoster, formatPKTDateDisplay } from '../../utils/attendanceUtils';

interface AttendanceProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  currentUser: UserProfile;
  year: number;
  monthIndex: number;
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  onEditRecord: (record: AttendanceRecord) => void;
  onDeleteRecord: (record: AttendanceRecord) => void;
  onAddRecordForDate: (employeeId: string, date: string) => void;
}

export const AttendanceProfileModal: React.FC<AttendanceProfileModalProps> = ({
  isOpen,
  onClose,
  employee,
  currentUser,
  year,
  monthIndex,
  attendanceRecords,
  leaveRequests,
  onEditRecord,
  onDeleteRecord,
  onAddRecordForDate
}) => {
  if (!isOpen || !employee) return null;

  const isAdmin = currentUser.roleType === 'admin';
  const isManager = currentUser.roleType === 'manager';
  const canModify = isAdmin || (isManager && currentUser.department === employee.department);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthLabel = `${monthNames[monthIndex]} ${year}`;

  const summary = generateEmployeeMonthlyRoster(
    employee,
    year,
    monthIndex,
    attendanceRecords,
    leaveRequests
  );

  const handleExportCSV = () => {
    const csvHeader = 'Date,Day,Shift,Clock In,Clock Out,Total Hours,Overtime,Status,Late Duration,Remarks\n';
    const csvRows = summary.dailyRows.map(r => 
      `"${r.date}","${r.dayOfWeek}","${r.shift}","${r.clockIn}","${r.clockOut}","${r.totalHrs}","${r.overtime}","${r.status}","${r.lateDuration}","${r.remarks || ''}"`
    ).join('\n');
    
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${employee.name.replace(/\s+/g, '_')}_Attendance_${monthLabel.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-4xl rounded-3xl border border-white/10 bg-[#131b2e] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-[#191e3b] via-[#131b2e] to-[#1e1333]">
          <div className="flex items-center gap-4">
            {employee.avatar ? (
              <img 
                src={employee.avatar} 
                alt={employee.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-500/30 shrink-0" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-base shrink-0 border border-purple-500/30">
                {employee.avatarInitials || employee.name.substring(0, 2)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white font-['Sora']">
                  {employee.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {employee.empId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{employee.designation}</span>
                <span>•</span>
                <span>{employee.department}</span>
                <span>•</span>
                <span className="text-purple-300 font-semibold">{monthLabel} Attendance History</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Export Month CSV"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 6 Metric KPI Cards */}
        <div className="p-6 pb-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Present */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-[11px] font-semibold">Present</span>
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-bold text-white font-['Sora']">{summary.presentDays} <span className="text-xs font-normal text-emerald-300">Days</span></p>
          </div>

          {/* Late */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
            <div className="flex items-center justify-between text-amber-300">
              <span className="text-[11px] font-semibold">Late</span>
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-bold text-white font-['Sora']">{summary.lateDays} <span className="text-xs font-normal text-amber-300">Days</span></p>
          </div>

          {/* Absent */}
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
            <div className="flex items-center justify-between text-rose-400">
              <span className="text-[11px] font-semibold">Absent</span>
              <UserX className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-bold text-white font-['Sora']">{summary.absentDays} <span className="text-xs font-normal text-rose-300">Days</span></p>
          </div>

          {/* Leaves */}
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1">
            <div className="flex items-center justify-between text-purple-300">
              <span className="text-[11px] font-semibold">Leaves</span>
              <CalendarOff className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-bold text-white font-['Sora']">{summary.leaveDays} <span className="text-xs font-normal text-purple-300">Days</span></p>
          </div>

          {/* Total Worked */}
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
            <div className="flex items-center justify-between text-indigo-300">
              <span className="text-[11px] font-semibold">Total Hours</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <p className="text-lg font-bold text-white font-['Sora'] truncate">{summary.totalWorkingHoursFormatted}</p>
          </div>

          {/* Overtime */}
          <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-1">
            <div className="flex items-center justify-between text-teal-300">
              <span className="text-[11px] font-semibold">Overtime</span>
              <Zap className="w-3.5 h-3.5" />
            </div>
            <p className="text-lg font-bold text-white font-['Sora'] truncate">{summary.totalOvertimeFormatted}</p>
          </div>
        </div>

        {/* Day by Day Log Table */}
        <div className="p-6 pt-3 overflow-y-auto flex-1">
          <div className="rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-[#161e33] text-slate-400 uppercase text-[10px] font-bold border-b border-white/10 z-10">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Day</th>
                  <th className="py-2.5 px-3">Clock In</th>
                  <th className="py-2.5 px-3">Clock Out</th>
                  <th className="py-2.5 px-3">Hours</th>
                  <th className="py-2.5 px-3">Overtime</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Late Duration</th>
                  <th className="py-2.5 px-3">Remarks</th>
                  {canModify && <th className="py-2.5 px-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {summary.dailyRows.map((row) => {
                  const existingRecord = row.recordId ? attendanceRecords.find(r => r.id === row.recordId) : null;

                  return (
                    <tr 
                      key={row.date} 
                      className={`hover:bg-white/[0.03] transition-colors ${
                        row.isToday ? 'bg-purple-500/[0.07]' : row.isWeekend ? 'opacity-70 bg-white/[0.01]' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-medium text-white flex items-center gap-1.5">
                        <span>{row.dayLabel}</span>
                        {row.isToday && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500 text-white uppercase">
                            Today
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{row.dayOfWeek}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-200">{row.clockIn}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{row.clockOut}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-purple-300">{row.totalHrs}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-300">{row.overtime}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.status === 'Present'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : row.status === 'Late'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : row.status === 'Working'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse'
                            : row.status === 'On Leave'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : row.status === 'Weekend'
                            ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-amber-300 font-mono text-[11px]">{row.lateDuration}</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-[140px]" title={row.remarks}>
                        {row.remarks || '--'}
                      </td>
                      {canModify && (
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {existingRecord ? (
                              <>
                                <button
                                  onClick={() => onEditRecord(existingRecord)}
                                  className="p-1 rounded-lg bg-white/[0.05] hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 transition-colors cursor-pointer"
                                  title="Edit Record"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteRecord(existingRecord)}
                                  className="p-1 rounded-lg bg-white/[0.05] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => onAddRecordForDate(employee.empId, row.date)}
                                className="px-2 py-0.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-[10px] font-semibold transition-colors cursor-pointer"
                              >
                                + Add
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
