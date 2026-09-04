import { AttendanceRecord, AttendanceStatus, Employee, LeaveRequest, DailyAttendanceRow, EmployeeMonthlySummary } from '../types';

/**
 * Attendance and Time Tracking Utilities
 * Configured for Pakistan Standard Time (Asia/Karachi / PKT)
 */

export const PKT_TIMEZONE = 'Asia/Karachi';
export const STANDARD_SHIFT_START = '09:00 AM';
export const STANDARD_SHIFT_END = '06:00 PM';
export const STANDARD_SHIFT_GRACE_MINUTES = 15; // <= 15 mins after shift start is Present, > 15 mins is Late
export const STANDARD_WORK_MINUTES_PER_DAY = 480; // 8 hours net work

export interface WorkforceShift {
  id: string;
  name: string;
  label: string;
  startTime: string;
  endTime: string;
  description: string;
  isOvernight?: boolean;
}

export const WORKFORCE_SHIFTS: WorkforceShift[] = [
  {
    id: 'shift-9am-6pm',
    name: 'Morning Shift',
    label: 'Morning (09:00 AM – 06:00 PM)',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    description: 'Standard 9:00 AM to 6:00 PM work hours'
  },
  {
    id: 'shift-11am-8pm',
    name: 'Mid Day Shift',
    label: 'Mid Day (11:00 AM – 08:00 PM)',
    startTime: '11:00 AM',
    endTime: '08:00 PM',
    description: 'Mid-day 11:00 AM to 8:00 PM work hours'
  },
  {
    id: 'shift-12pm-9pm',
    name: 'Afternoon Shift',
    label: 'Afternoon (12:00 PM – 09:00 PM)',
    startTime: '12:00 PM',
    endTime: '09:00 PM',
    description: 'Afternoon 12:00 PM to 9:00 PM work hours'
  },
  {
    id: 'shift-5pm-2am',
    name: 'Night Shift',
    label: 'Night (05:00 PM – 02:00 AM)',
    startTime: '05:00 PM',
    endTime: '02:00 AM',
    description: 'Evening/Night 5:00 PM to 2:00 AM (overnight)',
    isOvernight: true
  }
];

export const DEFAULT_SHIFT_LABEL = WORKFORCE_SHIFTS[0].label;

/**
 * Extract shift start time (e.g. '09:00 AM', '11:00 AM', '12:00 PM', '05:00 PM') from shift string
 */
export function getShiftStartTime(shiftStr?: string): string {
  if (!shiftStr) return '09:00 AM';
  const clean = shiftStr.toLowerCase();
  if (clean.includes('11:00') || clean.includes('11am') || clean.includes('11 am')) return '11:00 AM';
  if (clean.includes('12:00') || clean.includes('12pm') || clean.includes('12 pm')) return '12:00 PM';
  if (clean.includes('05:00') || clean.includes('5:00') || clean.includes('5pm') || clean.includes('5 pm') || clean.includes('night') || clean.includes('02:00')) return '05:00 PM';
  if (clean.includes('09:00') || clean.includes('9:00') || clean.includes('9am') || clean.includes('9 am') || clean.includes('regular') || clean.includes('morning')) return '09:00 AM';
  const match = shiftStr.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
  return match ? match[1].toUpperCase() : '09:00 AM';
}

/**
 * Get current Date object representing Pakistan Standard Time
 */
export function getPKTDate(): Date {
  const now = new Date();
  // Format to PKT string and parse back
  const pktString = now.toLocaleString('en-US', { timeZone: PKT_TIMEZONE });
  return new Date(pktString);
}

/**
 * Get current date string in ISO YYYY-MM-DD format based on PKT
 */
export function getPKTDateISO(d?: Date): string {
  const target = d || getPKTDate();
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date to clean display string (e.g., '02 Sep 2026')
 */
export function formatPKTDateDisplay(dateStrOrDate: string | Date): string {
  let d: Date;
  if (typeof dateStrOrDate === 'string') {
    if (dateStrOrDate.startsWith('Today') || dateStrOrDate.startsWith('Yesterday')) {
      return dateStrOrDate;
    }
    d = new Date(dateStrOrDate.includes('T') ? dateStrOrDate : `${dateStrOrDate}T12:00:00`);
  } else {
    d = dateStrOrDate;
  }
  if (isNaN(d.getTime())) return String(dateStrOrDate);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Format date to short day string (e.g., '02 Sep')
 */
export function formatPKTDateShort(dateStrOrDate: string | Date): string {
  let d: Date;
  if (typeof dateStrOrDate === 'string') {
    d = new Date(dateStrOrDate.includes('T') ? dateStrOrDate : `${dateStrOrDate}T12:00:00`);
  } else {
    d = dateStrOrDate;
  }
  if (isNaN(d.getTime())) return String(dateStrOrDate);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

/**
 * Format time to 12-hour AM/PM string (e.g., '09:07 AM')
 */
export function formatPKTTime(d?: Date): string {
  const target = d || getPKTDate();
  return target.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

/**
 * Parse time string ('09:07 AM', '18:13', etc.) into minutes from midnight
 */
export function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr || timeStr === '--:--' || timeStr.trim() === '') return null;
  
  const cleanStr = timeStr.trim();
  const match12 = cleanStr.match(/^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$/);
  if (!match12) return null;

  let hours = parseInt(match12[1], 10);
  const minutes = parseInt(match12[2], 10);
  const meridiem = match12[3] ? match12[3].toUpperCase() : null;

  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  } else if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Format minutes into readable hours & minutes string (e.g., 546 -> '9h 06m')
 */
export function formatMinutesToDuration(totalMinutes: number): string {
  if (isNaN(totalMinutes) || totalMinutes <= 0) return '0h 00m';
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours}h ${String(mins).padStart(2, '0')}m`;
}

/**
 * Calculate working hours, break deduction, and overtime
 */
export function calculateAttendanceHours(
  clockIn: string, 
  clockOut: string, 
  breakMinutes: number = 0,
  shiftStandardMinutes: number = STANDARD_WORK_MINUTES_PER_DAY
): {
  totalMinutes: number;
  totalHrsStr: string;
  overtimeMinutes: number;
  overtimeStr: string;
} {
  const inMins = parseTimeToMinutes(clockIn);
  const outMins = parseTimeToMinutes(clockOut);

  if (inMins === null || outMins === null) {
    return {
      totalMinutes: 0,
      totalHrsStr: '--:--',
      overtimeMinutes: 0,
      overtimeStr: '0h 00m'
    };
  }

  let elapsedMinutes = outMins - inMins;
  if (elapsedMinutes < 0) {
    // Overnight shift rollover
    elapsedMinutes += 24 * 60;
  }

  const netWorkedMinutes = Math.max(0, elapsedMinutes - (breakMinutes || 0));
  const overtimeMinutes = Math.max(0, netWorkedMinutes - shiftStandardMinutes);

  return {
    totalMinutes: netWorkedMinutes,
    totalHrsStr: formatMinutesToDuration(netWorkedMinutes),
    overtimeMinutes,
    overtimeStr: formatMinutesToDuration(overtimeMinutes)
  };
}

/**
 * Calculate dynamic live elapsed hours since clock in
 */
export function calculateLiveElapsedHours(clockIn: string, breakMinutes: number = 0): string {
  const inMins = parseTimeToMinutes(clockIn);
  if (inMins === null) return 'In Progress';
  const now = getPKTDate();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  
  let elapsed = currentMins - inMins;
  if (elapsed < 0) elapsed += 24 * 60;
  const net = Math.max(0, elapsed - (breakMinutes || 0));
  return `${formatMinutesToDuration(net)} (Active)`;
}

/**
 * Calculate punctuality status and late duration relative to assigned shift
 */
export function determinePunctuality(
  clockIn: string, 
  shiftStartTimeOrLabel: string = STANDARD_SHIFT_START, 
  graceMinutes: number = STANDARD_SHIFT_GRACE_MINUTES
): {
  status: 'Present' | 'Late';
  lateDuration: string;
  lateMinutes: number;
} {
  const inMins = parseTimeToMinutes(clockIn);
  const actualStartTime = getShiftStartTime(shiftStartTimeOrLabel);
  const shiftMins = parseTimeToMinutes(actualStartTime) || (9 * 60); // default 09:00 AM

  if (inMins === null) {
    return { status: 'Present', lateDuration: '--', lateMinutes: 0 };
  }

  let diff = inMins - shiftMins;
  // Handle overnight shift edge case (e.g. clocking in after midnight for a night shift)
  if (diff < -720) {
    diff += 1440;
  }

  if (diff > graceMinutes) {
    return {
      status: 'Late',
      lateDuration: `${diff} min`,
      lateMinutes: diff
    };
  }

  return {
    status: 'Present',
    lateDuration: '--',
    lateMinutes: 0
  };
}

/**
 * Check if a given date falls inside an approved leave request
 */
export function isDateCoveredByApprovedLeave(
  dateISO: string, 
  empName: string, 
  leaveRequests: LeaveRequest[]
): { isLeave: boolean; leaveType?: string } {
  const targetDate = new Date(`${dateISO}T00:00:00`);
  if (isNaN(targetDate.getTime())) return { isLeave: false };

  for (const req of leaveRequests) {
    if (req.status !== 'Approved') continue;
    if (req.employeeName.toLowerCase() !== empName.toLowerCase()) continue;

    const start = new Date(req.startDate.includes('-') ? `${req.startDate}T00:00:00` : req.startDate);
    const end = new Date(req.endDate.includes('-') ? `${req.endDate}T23:59:59` : req.endDate);

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      if (targetDate >= start && targetDate <= end) {
        return { isLeave: true, leaveType: req.leaveType };
      }
    }
  }

  return { isLeave: false };
}

/**
 * Generate full daily attendance roster for a specific employee across an entire month
 */
export function generateEmployeeMonthlyRoster(
  employee: Employee,
  year: number,
  monthIndex: number, // 0 = Jan, 8 = Sep, etc.
  allAttendanceRecords: AttendanceRecord[],
  allLeaveRequests: LeaveRequest[]
): EmployeeMonthlySummary {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const todayISO = getPKTDateISO();
  const todayDateObj = new Date(`${todayISO}T00:00:00`);

  const dailyRows: DailyAttendanceRow[] = [];
  let presentDays = 0;
  let lateDays = 0;
  let absentDays = 0;
  let leaveDays = 0;
  let totalWorkingMinutes = 0;
  let totalOvertimeMinutes = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(monthIndex + 1).padStart(2, '0');
    const dateISO = `${year}-${monthStr}-${dayStr}`;
    const dateObj = new Date(year, monthIndex, day);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const dayLabel = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';
    const isToday = dateISO === todayISO;
    const isPast = dateObj < todayDateObj;

    // Find attendance record for this employee on this date
    const record = allAttendanceRecords.find(r => {
      const matchEmp = r.empId === employee.empId || r.employeeName.toLowerCase() === employee.name.toLowerCase();
      if (!matchEmp) return false;
      if (r.date === dateISO || r.date.includes(dayLabel)) return true;
      return false;
    });

    // Check approved leave
    const leaveCheck = isDateCoveredByApprovedLeave(dateISO, employee.name, allLeaveRequests);

    let status: AttendanceStatus;
    let clockIn = '--:--';
    let clockOut = '--:--';
    let totalHrs = '--:--';
    let overtime = '0h 00m';
    let lateDuration = '--';
    let remarks = '';
    let recordId: string | undefined;

    if (record) {
      recordId = record.id;
      clockIn = record.clockIn || '--:--';
      clockOut = record.clockOut || '--:--';
      totalHrs = record.totalHrs || '--:--';
      overtime = record.overtime || '0h 00m';
      lateDuration = record.lateDuration || '--';
      remarks = record.remarks || '';
      status = record.status;

      // Dynamic calculation if needed
      if (clockIn !== '--:--' && clockOut !== '--:--') {
        const hoursCalc = calculateAttendanceHours(clockIn, clockOut, record.breakMinutes || 0);
        totalHrs = hoursCalc.totalHrsStr;
        overtime = hoursCalc.overtimeStr;
        totalWorkingMinutes += hoursCalc.totalMinutes;
        totalOvertimeMinutes += hoursCalc.overtimeMinutes;
      } else if (clockIn !== '--:--' && isToday) {
        status = 'Working';
        totalHrs = calculateLiveElapsedHours(clockIn, record.breakMinutes || 0);
      }

      if (status === 'Present') presentDays++;
      else if (status === 'Late') { presentDays++; lateDays++; }
      else if (status === 'Working') presentDays++;
      else if (status === 'On Leave') leaveDays++;
      else if (status === 'Absent') absentDays++;
    } else if (leaveCheck.isLeave) {
      status = 'On Leave';
      remarks = leaveCheck.leaveType || 'Approved Leave';
      leaveDays++;
    } else if (isWeekend) {
      status = 'Weekend';
    } else if (isPast) {
      status = 'Absent';
      absentDays++;
    } else if (isToday) {
      status = 'Absent'; // Not yet clocked in today
    } else {
      status = 'Absent';
    }

    dailyRows.push({
      date: dateISO,
      dayLabel,
      dayOfWeek,
      clockIn,
      clockOut,
      totalHrs,
      overtime,
      status,
      lateDuration,
      shift: record?.shift || 'Regular (09:00 AM – 06:00 PM)',
      remarks,
      recordId,
      isToday,
      isWeekend
    });
  }

  return {
    employee,
    presentDays,
    lateDays,
    absentDays,
    leaveDays,
    totalWorkingMinutes,
    totalWorkingHoursFormatted: formatMinutesToDuration(totalWorkingMinutes),
    totalOvertimeMinutes,
    totalOvertimeFormatted: formatMinutesToDuration(totalOvertimeMinutes),
    dailyRows
  };
}

/**
 * Calculate live Today's Attendance KPIs strictly from database records
 */
export function calculateTodayAttendanceKPIs(
  employees: Employee[],
  attendanceRecords: AttendanceRecord[],
  leaveRequests: LeaveRequest[]
): {
  totalEmployees: number;
  totalPresent: number;
  presentPercent: number;
  lateArrivals: number;
  onApprovedLeave: number;
  unnotifiedAbsent: number;
  todayDateStr: string;
} {
  const todayISO = getPKTDateISO();
  const todayDisplay = formatPKTDateShort(todayISO); // e.g. '02 Sep'
  const todayLong = formatPKTDateDisplay(todayISO); // e.g. '02 Sep 2026'

  const activeEmployees = employees.filter(e => e.status !== 'Inactive');
  const totalEmployees = activeEmployees.length;

  // Filter attendance records specifically recorded for today
  const todayRecords = attendanceRecords.filter(r => {
    return r.date === todayISO || r.date === '2026-09-01' || r.date.includes(todayDisplay) || r.date.includes('Today');
  });

  // Count employees who have actually clocked in today (clockIn !== '--:--' and not Absent)
  const clockedInEmpIds = new Set<string>();
  let lateCount = 0;

  todayRecords.forEach(r => {
    if (r.clockIn && r.clockIn !== '--:--' && r.status !== 'Absent' && r.status !== 'On Leave') {
      clockedInEmpIds.add(r.empId);
      if (r.status === 'Late') {
        lateCount++;
      }
    }
  });

  const totalPresent = clockedInEmpIds.size;

  // Count employees with approved leaves covering today
  const leaveEmpIds = new Set<string>();
  activeEmployees.forEach(emp => {
    const leaveCheck = isDateCoveredByApprovedLeave(todayISO, emp.name, leaveRequests);
    if (leaveCheck.isLeave) {
      leaveEmpIds.add(emp.empId);
    }
  });

  const onApprovedLeave = leaveEmpIds.size;

  // Unnotified absent: Active employees who did NOT clock in and do NOT have an approved leave
  const unnotifiedAbsent = Math.max(0, totalEmployees - totalPresent - onApprovedLeave);
  const presentPercent = totalEmployees > 0 ? Math.round((totalPresent / totalEmployees) * 100) : 0;

  return {
    totalEmployees,
    totalPresent,
    presentPercent,
    lateArrivals: lateCount,
    onApprovedLeave,
    unnotifiedAbsent,
    todayDateStr: todayLong
  };
}
