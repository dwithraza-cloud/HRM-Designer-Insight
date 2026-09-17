import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, AlertCircle, Save, User, Briefcase, Coffee, Check, RotateCcw } from 'lucide-react';
import { AttendanceRecord, Employee, AttendanceStatus } from '../../types';
import { 
  calculateAttendanceHours, 
  determinePunctuality, 
  formatPKTDateDisplay, 
  formatPKTDateShort,
  getPKTDateISO,
  WORKFORCE_SHIFTS,
  DEFAULT_SHIFT_LABEL,
  getShiftDetails,
  getShiftStartTime,
  getShiftEndTime
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

  // Helper to find employee by empId
  const getEmployeeProfile = (empId: string): Employee | undefined => {
    return employees.find(e => e.empId === empId || e.id === empId);
  };

  const initialEmpId = initialRecord?.empId || defaultEmployeeId || employees[0]?.empId || '';
  const initialEmp = getEmployeeProfile(initialEmpId);
  const initialEmpShift = initialEmp?.shift || DEFAULT_SHIFT_LABEL;

  const [selectedEmpId, setSelectedEmpId] = useState<string>(() => initialEmpId);

  const [date, setDate] = useState<string>(() => {
    return initialRecord?.date || selectedDate || getPKTDateISO();
  });

  const [shift, setShift] = useState<string>(() => {
    return initialRecord?.shift || initialEmpShift;
  });

  const [clockIn, setClockIn] = useState<string>(() => {
    if (initialRecord?.clockIn && initialRecord.clockIn !== '--:--') return initialRecord.clockIn;
    return getShiftStartTime(initialRecord?.shift || initialEmpShift);
  });

  const [clockOut, setClockOut] = useState<string>(() => {
    if (initialRecord?.clockOut && initialRecord.clockOut !== '--:--') return initialRecord.clockOut;
    return getShiftEndTime(initialRecord?.shift || initialEmpShift);
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

  // Current selected employee object
  const currentSelectedEmp = getEmployeeProfile(selectedEmpId);
  const currentProfileShift = currentSelectedEmp?.shift || DEFAULT_SHIFT_LABEL;

  // Sync state when props change
  useEffect(() => {
    if (initialRecord) {
      const emp = getEmployeeProfile(initialRecord.empId);
      const effectiveShift = initialRecord.shift || emp?.shift || DEFAULT_SHIFT_LABEL;
      setSelectedEmpId(initialRecord.empId);
      setDate(initialRecord.date || getPKTDateISO());
      setShift(effectiveShift);
      setClockIn(initialRecord.clockIn && initialRecord.clockIn !== '--:--' ? initialRecord.clockIn : getShiftStartTime(effectiveShift));
      setClockOut(initialRecord.clockOut && initialRecord.clockOut !== '--:--' ? initialRecord.clockOut : getShiftEndTime(effectiveShift));
      setBreakMinutes(initialRecord.breakMinutes !== undefined ? initialRecord.breakMinutes : 60);
      setStatus(initialRecord.status || 'Present');
      setRemarks(initialRecord.remarks || '');
    } else {
      const targetEmpId = defaultEmployeeId || employees[0]?.empId || '';
      const emp = getEmployeeProfile(targetEmpId);
      const targetShift = emp?.shift || DEFAULT_SHIFT_LABEL;
      setSelectedEmpId(targetEmpId);
      setDate(selectedDate || getPKTDateISO());
      setShift(targetShift);
      setClockIn(getShiftStartTime(targetShift));
      setClockOut(getShiftEndTime(targetShift));
      setBreakMinutes(60);
      setStatus('Present');
      setRemarks('');
    }
    setError(null);
  }, [initialRecord, defaultEmployeeId, selectedDate, employees, isOpen]);

  // Recalculate working hours live preview
  const hoursCalc = calculateAttendanceHours(clockIn, clockOut, breakMinutes);
  const punctuality = determinePunctuality(clockIn, shift);

  // When changing employee in the dropdown, automatically pick that person's workforce shift
  const handleEmployeeChange = (newEmpId: string) => {
    setSelectedEmpId(newEmpId);
    if (!isEditing) {
      const emp = getEmployeeProfile(newEmpId);
      const empShift = emp?.shift || DEFAULT_SHIFT_LABEL;
      setShift(empShift);
      const newIn = getShiftStartTime(empShift);
      const newOut = getShiftEndTime(empShift);
      setClockIn(newIn);
      setClockOut(newOut);
      const punct = determinePunctuality(newIn, empShift);
      setStatus(punct.status);
    }
  };

  // Reset shift to employee's profile workforce shift
  const handleResetToProfileShift = () => {
    const profileShift = currentProfileShift;
    setShift(profileShift);
    const newIn = getShiftStartTime(profileShift);
    const newOut = getShiftEndTime(profileShift);
    setClockIn(newIn);
    setClockOut(newOut);
    const punct = determinePunctuality(newIn, profileShift);
    setStatus(punct.status);
  };

  // Automatically update status if user is modifying clock-in unless set to Absent/Leave
  const handleClockInChange = (newVal: string) => {
    setClockIn(newVal);
    if (status !== 'Absent' && status !== 'On Leave' && status !== 'Half Day') {
      const punct = determinePunctuality(newVal, shift);
      setStatus(punct.status);
    }
  };

  const handleShiftChange = (newShift: string) => {
    setShift(newShift);
    if (status !== 'Absent' && status !== 'On Leave' && status !== 'Half Day') {
      const punct = determinePunctuality(clockIn, newShift);
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
        : determinePunctuality(clockIn, shift);

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
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-400" /> Employee
              </label>
              {currentSelectedEmp?.shift && (
                <span className="text-[11px] text-slate-400">
                  Assigned Shift: <strong className="text-purple-300 font-semibold">{currentSelectedEmp.shift}</strong>
                </span>
              )}
            </div>
            <select
              value={selectedEmpId}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              disabled={isEditing}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-purple-500/50 disabled:opacity-60"
            >
              {employees.map(emp => (
                <option key={emp.empId} value={emp.empId} className="bg-[#131b2e] text-white">
                  {emp.name} ({emp.empId}) — {emp.department} • Shift: {emp.shift || DEFAULT_SHIFT_LABEL}
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
              <div className="flex items-center justify-between gap-1 flex-wrap">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" /> Assigned Shift
                </label>
                {currentSelectedEmp?.shift && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Profile: {currentSelectedEmp.shift.split('(')[0].trim()}</span>
                  </span>
                )}
              </div>
              <select
                value={shift}
                onChange={(e) => handleShiftChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
              >
                {WORKFORCE_SHIFTS.map(s => (
                  <option key={s.id} value={s.label} className="bg-[#131b2e]">
                    {s.label} {currentSelectedEmp?.shift === s.label ? '★ (Profile Shift)' : ''}
                  </option>
                ))}
              </select>
              {currentSelectedEmp?.shift && shift !== currentSelectedEmp.shift && (
                <div className="flex items-center justify-between text-[11px] text-amber-300/90 pt-0.5">
                  <span>Differs from profile</span>
                  <button
                    type="button"
                    onClick={handleResetToProfileShift}
                    className="text-purple-400 hover:text-purple-300 underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Use Profile Shift
                  </button>
                </div>
              )}
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
