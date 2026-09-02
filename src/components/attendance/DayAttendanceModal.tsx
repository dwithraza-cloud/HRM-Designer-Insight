import React from 'react';
import { X, Calendar, UserCheck, AlertCircle, UserX, CalendarOff, Plus, Edit3, Trash2 } from 'lucide-react';
import { Employee, AttendanceRecord, LeaveRequest, UserProfile } from '../../types';
import { formatPKTDateDisplay, isDateCoveredByApprovedLeave } from '../../utils/attendanceUtils';

interface DayAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateISO: string;
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  currentUser: UserProfile;
  onAddRecord: (employeeId?: string, date?: string) => void;
  onEditRecord: (record: AttendanceRecord) => void;
  onDeleteRecord: (record: AttendanceRecord) => void;
}

export const DayAttendanceModal: React.FC<DayAttendanceModalProps> = ({
  isOpen,
  onClose,
  dateISO,
  employees,
  attendanceRecords,
  leaveRequests,
  currentUser,
  onAddRecord,
  onEditRecord,
  onDeleteRecord
}) => {
  if (!isOpen || !dateISO) return null;

  const isAdmin = currentUser.roleType === 'admin';
  const isManager = currentUser.roleType === 'manager';
  const canModify = isAdmin || isManager;

  const dateObj = new Date(`${dateISO}T12:00:00`);
  const dateFormatted = formatPKTDateDisplay(dateISO);
  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';

  // Roster entries for every active employee on this date
  const activeEmployees = employees.filter(e => e.status !== 'Inactive');
  const dayRecords = attendanceRecords.filter(r => r.date === dateISO || r.date.includes(dateFormatted));

  const roster = activeEmployees.map(emp => {
    const record = dayRecords.find(r => r.empId === emp.empId || r.employeeName.toLowerCase() === emp.name.toLowerCase());
    const leaveCheck = isDateCoveredByApprovedLeave(dateISO, emp.name, leaveRequests);

    let status = record ? record.status : leaveCheck.isLeave ? 'On Leave' : isWeekend ? 'Weekend' : 'Absent';
    let clockIn = record?.clockIn || '--:--';
    let clockOut = record?.clockOut || '--:--';
    let totalHrs = record?.totalHrs || '--:--';
    let overtime = record?.overtime || '0h 00m';
    let lateDuration = record?.lateDuration || '--';
    let remarks = record?.remarks || (leaveCheck.isLeave ? leaveCheck.leaveType : '');

    return {
      emp,
      record,
      status,
      clockIn,
      clockOut,
      totalHrs,
      overtime,
      lateDuration,
      remarks,
      shift: record?.shift || 'Regular (09:00 AM – 06:00 PM)'
    };
  });

  const presentCount = roster.filter(r => r.status === 'Present' || r.status === 'Late' || r.status === 'Working').length;
  const lateCount = roster.filter(r => r.status === 'Late').length;
  const leaveCount = roster.filter(r => r.status === 'On Leave').length;
  const absentCount = roster.filter(r => r.status === 'Absent').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-4xl rounded-3xl border border-white/10 bg-[#131b2e] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-[#191e3b] via-[#131b2e] to-[#1e1333]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white font-['Sora']">
                  {dateFormatted}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/[0.06] text-slate-300 border border-white/10">
                  {dayOfWeek}
                </span>
                {isWeekend && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Weekend
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Workforce attendance register & punch audit for this date
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canModify && (
              <button
                onClick={() => onAddRecord(undefined, dateISO)}
                className="brand-gradient-btn px-3.5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Record</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Mini KPI Badges */}
        <div className="p-6 pb-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase">Present</span>
              <p className="text-xl font-bold text-white font-['Sora']">{presentCount}</p>
            </div>
            <UserCheck className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-amber-300 font-semibold uppercase">Late</span>
              <p className="text-xl font-bold text-white font-['Sora']">{lateCount}</p>
            </div>
            <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>

          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-purple-300 font-semibold uppercase">On Leave</span>
              <p className="text-xl font-bold text-white font-['Sora']">{leaveCount}</p>
            </div>
            <CalendarOff className="w-5 h-5 text-purple-400" />
          </div>

          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-rose-400 font-semibold uppercase">Absent</span>
              <p className="text-xl font-bold text-white font-['Sora']">{absentCount}</p>
            </div>
            <UserX className="w-5 h-5 text-rose-400" />
          </div>
        </div>

        {/* Table */}
        <div className="p-6 pt-3 overflow-y-auto flex-1">
          <div className="rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-[#161e33] text-slate-400 uppercase text-[10px] font-bold border-b border-white/10 z-10">
                <tr>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Clock In</th>
                  <th className="py-2.5 px-3">Clock Out</th>
                  <th className="py-2.5 px-3">Total Hours</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Remarks</th>
                  {canModify && <th className="py-2.5 px-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {roster.map(({ emp, record, status, clockIn, clockOut, totalHrs, lateDuration, remarks }) => (
                  <tr key={emp.empId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        {emp.avatar ? (
                          <img 
                            src={emp.avatar} 
                            alt={emp.name} 
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10 shrink-0" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                            {emp.avatarInitials || emp.name.substring(0, 2)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white">{emp.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{emp.empId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{emp.department}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-200">{clockIn}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{clockOut}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-purple-300">{totalHrs}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        status === 'Present'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : status === 'Late'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : status === 'Working'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse'
                          : status === 'On Leave'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : status === 'Weekend'
                          ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-[150px]">
                      {remarks || '--'}
                    </td>
                    {canModify && (
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {record ? (
                            <>
                              <button
                                onClick={() => onEditRecord(record)}
                                className="p-1 rounded-lg bg-white/[0.05] hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 transition-colors cursor-pointer"
                                title="Edit Record"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteRecord(record)}
                                className="p-1 rounded-lg bg-white/[0.05] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => onAddRecord(emp.empId, dateISO)}
                              className="px-2 py-0.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-[10px] font-semibold transition-colors cursor-pointer"
                            >
                              + Punch
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
