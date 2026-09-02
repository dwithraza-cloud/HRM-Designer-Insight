import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, AlertCircle, Save, User, Briefcase, Coffee } from 'lucide-react';
import { AttendanceRecord, Employee, AttendanceStatus } from '../../types';
import { 
  calculateAttendanceHours, 
  determinePunctuality, 
  formatPKTDateDisplay, 
  formatPKTDateShort,
  getPKTDateISO 
} from '../../utils/attendanceUtils';

interface EditAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: AttendanceRecord) => Promise<void>;
  initialRecord?: AttendanceRecord | null;
  employees: Employee[];
  selectedDate?: string;
  defaultEmployeeId?: string;
}

export const EditAttendanceModal: React.FC<EditAttendanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRecord,
  employees,
  selectedDate,
  defaultEmployeeId
}) => {
  const isEditing = !!initialRecord;

  const [selectedEmpId, setSelectedEmpId] = useState<string>(() => {
    return initialRecord?.empId || defaultEmployeeId || employees[0]?.empId || '';
  });

  const [date, setDate] = useState<string>(() => {
    return initialRecord?.date || selectedDate || getPKTDateISO();
  });

  const [shift, setShift] = useState<string>(() => {
    return initialRecord?.shift || 'Regular (09:00 AM – 06:00 PM)';
  });

  const [clockIn, setClockIn] = useState<string>(() => {
    return initialRecord?.clockIn && initialRecord.clockIn !== '--:--' ? initialRecord.clockIn : '09:00 AM';
  });

  const [clockOut, setClockOut] = useState<string>(() => {
    return initialRecord?.clockOut && initialRecord.clockOut !== '--:--' ? initialRecord.clockOut : '06:00 PM';
  });

  const [breakMinutes, setBreakMinutes] = useState<number>(() => {
    return initialRecord?.breakMinutes !== undefined ? initialRecord.breakMinutes : 60;
  });

  const [status, setStatus] = useState<AttendanceStatus>(() => {
    return initialRecord?.status || 'Present';
  });

  const [remarks, setRemarks] = useState<string>(() => {
    return initialRecord?.remarks || '';
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state when props change
  useEffect(() => {
    if (initialRecord) {
      setSelectedEmpId(initialRecord.empId);
      setDate(initialRecord.date || getPKTDateISO());
      setShift(initialRecord.shift || 'Regular (09:00 AM – 06:00 PM)');
      setClockIn(initialRecord.clockIn && initialRecord.clockIn !== '--:--' ? initialRecord.clockIn : '09:00 AM');
      setClockOut(initialRecord.clockOut && initialRecord.clockOut !== '--:--' ? initialRecord.clockOut : '06:00 PM');
      setBreakMinutes(initialRecord.breakMinutes !== undefined ? initialRecord.breakMinutes : 60);
      setStatus(initialRecord.status || 'Present');
      setRemarks(initialRecord.remarks || '');
    } else {
      setSelectedEmpId(defaultEmployeeId || employees[0]?.empId || '');
      setDate(selectedDate || getPKTDateISO());
      setShift('Regular (09:00 AM – 06:00 PM)');
      setClockIn('09:00 AM');
      setClockOut('06:00 PM');
      setBreakMinutes(60);
      setStatus('Present');
      setRemarks('');
    }
    setError(null);
  }, [initialRecord, defaultEmployeeId, selectedDate, employees, isOpen]);

  // Recalculate working hours live preview
  const hoursCalc = calculateAttendanceHours(clockIn, clockOut, breakMinutes);
  const punctuality = determinePunctuality(clockIn, shift.includes('08:00') ? '08:00 AM' : '09:00 AM');

  // Automatically update status if user is modifying clock-in unless set to Absent/Leave
  const handleClockInChange = (newVal: string) => {
    setClockIn(newVal);
    if (status !== 'Absent' && status !== 'On Leave' && status !== 'Half Day') {
      const punct = determinePunctuality(newVal, shift.includes('08:00') ? '08:00 AM' : '09:00 AM');
      setStatus(punct.status);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emp = employees.find(e => e.empId === selectedEmpId);
    if (!emp) {
      setError('Please select a valid employee');
      return;
    }

    if (!date) {
      setError('Please select a valid date');
      return;
    }

    setIsSaving(true);
    try {
      const calculatedHours = status === 'Absent' || status === 'On Leave'
        ? { totalHrsStr: '--:--', overtimeStr: '0h 00m' }
        : calculateAttendanceHours(clockIn, clockOut, breakMinutes);

      const lateInfo = status === 'Absent' || status === 'On Leave'
        ? { lateDuration: '--' }
        : determinePunctuality(clockIn, shift.includes('08:00') ? '08:00 AM' : '09:00 AM');

      const recordToSave: AttendanceRecord = {
        id: initialRecord?.id || `att-${emp.empId}-${date}`,
        empId: emp.empId,
        employeeName: emp.name,
        department: emp.department,
        avatar: emp.avatar,
        avatarInitials: emp.avatarInitials || emp.name.split(' ').map(n => n[0]).join('').substring(0, 2),
        date,
        displayDate: formatPKTDateDisplay(date),
        dayName: new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' }),
        shift,
        clockIn: status === 'Absent' || status === 'On Leave' ? '--:--' : clockIn,
        clockOut: status === 'Absent' || status === 'On Leave' ? '--:--' : clockOut,
        breakMinutes: status === 'Absent' || status === 'On Leave' ? 0 : breakMinutes,
        totalHrs: calculatedHours.totalHrsStr,
        overtime: calculatedHours.overtimeStr,
        status,
        lateDuration: lateInfo.lateDuration,
        remarks: remarks.trim() || (isEditing ? 'Corrected by Admin' : 'Manual entry by Admin'),
        recordedBy: 'Admin',
        updatedAt: new Date().toISOString()
      };

      await onSave(recordToSave);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save attendance record');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 bg-[#131b2e] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-purple-900/30 via-[#191e3b]/50 to-indigo-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Sora']">
                {isEditing ? 'Edit Attendance Record' : 'Manual Attendance Entry'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing ? 'Correct clock-in, clock-out, or status adjustments' : 'Create an official attendance record'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Employee Selection */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-400" /> Employee
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              disabled={isEditing}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-purple-500/50 disabled:opacity-60"
            >
              {employees.map(emp => (
                <option key={emp.empId} value={emp.empId} className="bg-[#131b2e] text-white">
                  {emp.name} ({emp.empId}) — {emp.department}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Shift Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-purple-400" /> Assigned Shift
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="Regular (09:00 AM – 06:00 PM)" className="bg-[#131b2e]">Regular (09:00 AM – 06:00 PM)</option>
                <option value="Morning (08:00 AM – 05:00 PM)" className="bg-[#131b2e]">Morning (08:00 AM – 05:00 PM)</option>
                <option value="Night (06:00 PM – 03:00 AM)" className="bg-[#131b2e]">Night (06:00 PM – 03:00 AM)</option>
                <option value="Flexible (8 Hours)" className="bg-[#131b2e]">Flexible (8 Hours)</option>
              </select>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Attendance Status</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(['Present', 'Late', 'Half Day', 'On Leave', 'Absent'] as AttendanceStatus[]).map(st => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer border ${
                    status === st
                      ? (st === 'Present' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm' :
                         st === 'Late' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm' :
                         st === 'On Leave' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm' :
                         st === 'Half Day' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm' :
                         'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm')
                      : 'bg-white/[0.03] hover:bg-white/[0.07] text-slate-400 border-white/5'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Clock In, Clock Out, Break Duration (shown if not Absent / On Leave) */}
          {status !== 'Absent' && status !== 'On Leave' && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Clock In Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:05 AM"
                    value={clockIn}
                    onChange={(e) => handleClockInChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono focus:outline-none focus:border-purple-500/50"
                  />
                  {punctuality.lateMinutes > 0 && (
                    <span className="text-[10px] text-amber-300 font-semibold block">
                      ⚠️ {punctuality.lateDuration} late
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Clock Out Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 06:10 PM"
                    value={clockOut}
                    onChange={(e) => setClockOut(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium flex items-center gap-1">
                    <Coffee className="w-3 h-3 text-amber-400" /> Break (Mins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    step="5"
                    value={breakMinutes}
                    onChange={(e) => setBreakMinutes(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              {/* Live Calculations Summary Box */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Total Worked:</span>
                  <span className="font-bold font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                    {hoursCalc.totalHrsStr}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Overtime:</span>
                  <span className={`font-bold font-mono px-2 py-0.5 rounded-md border ${
                    hoursCalc.overtimeMinutes > 0
                      ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-slate-400 bg-white/[0.02] border-white/5'
                  }`}>
                    {hoursCalc.overtimeStr}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Remarks */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Remarks & Notes</label>
            <input
              type="text"
              placeholder="e.g. Approved manual adjustment, delayed by client meeting, etc."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="brand-gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Record...' : isEditing ? 'Save Changes' : 'Create Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
