import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, 
  Calendar, 
  Check, 
  X, 
  Plus, 
  Clock, 
  HeartHandshake, 
  Plane, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Users,
  Filter,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { LeaveRequest, ViewMode, UserProfile, Employee } from '../types';

interface LeaveManagementViewProps {
  leaveRequests: LeaveRequest[];
  onApproveLeave: (id: string) => void;
  onRejectLeave: (id: string) => void;
  onOpenApplyLeave: () => void;
  onNavigate: (view: ViewMode) => void;
  currentUser?: UserProfile;
  employees?: Employee[];
  onDeleteLeave?: (id: string) => void;
}

export const LeaveManagementView: React.FC<LeaveManagementViewProps> = ({
  leaveRequests,
  onApproveLeave,
  onRejectLeave,
  onOpenApplyLeave,
  currentUser,
  employees = [],
  onDeleteLeave
}) => {
  const [activeTab, setActiveTab] = useState<'Requests' | 'Past' | 'Calendar'>('Requests');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(4); // May (0-indexed)
  const currentYear = 2025;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const isEmployeeUser = currentUser?.roleType === 'employee';
  
  // Admin/Manager can filter balances by specific employee or view company aggregate
  const [selectedEmpFilter, setSelectedEmpFilter] = useState<string>(
    isEmployeeUser ? (currentUser?.name || 'ALL') : 'ALL'
  );

  // Filter requests according to user and selector
  const visibleRequests = useMemo(() => {
    return leaveRequests.filter(req => {
      // If employee logged in, only see own requests
      if (isEmployeeUser && currentUser?.name) {
        return req.employeeName.toLowerCase().trim() === currentUser.name.toLowerCase().trim();
      }
      if (selectedEmpFilter !== 'ALL') {
        return req.employeeName.toLowerCase().trim() === selectedEmpFilter.toLowerCase().trim();
      }
      return true;
    });
  }, [leaveRequests, isEmployeeUser, currentUser?.name, selectedEmpFilter]);

  const pending = useMemo(() => visibleRequests.filter(r => r.status === 'Pending'), [visibleRequests]);
  const past = useMemo(() => visibleRequests.filter(r => r.status !== 'Pending'), [visibleRequests]);

  // Approved leaves specifically for calculating used leave days
  const approvedRequests = useMemo(() => {
    return visibleRequests.filter(r => r.status === 'Approved');
  }, [visibleRequests]);

  // Calculate actual verified days taken per leave category
  const casualDaysUsed = useMemo(() => {
    return approvedRequests
      .filter(r => (r.leaveType || '').toLowerCase().includes('casual'))
      .reduce((sum, r) => sum + (Number(r.daysCount) || 1), 0);
  }, [approvedRequests]);

  const sickDaysUsed = useMemo(() => {
    return approvedRequests
      .filter(r => (r.leaveType || '').toLowerCase().includes('sick'))
      .reduce((sum, r) => sum + (Number(r.daysCount) || 1), 0);
  }, [approvedRequests]);

  const annualDaysUsed = useMemo(() => {
    return approvedRequests
      .filter(r => {
        const t = (r.leaveType || '').toLowerCase();
        return t.includes('annual') || t.includes('vacation');
      })
      .reduce((sum, r) => sum + (Number(r.daysCount) || 1), 0);
  }, [approvedRequests]);

  // Quota totals (per employee annual standard: Casual=12, Sick=12, Vacation/Annual=10)
  const isAggregate = selectedEmpFilter === 'ALL' && !isEmployeeUser;

  const casualTotal = 12;
  const sickTotal = 12;
  const annualTotal = 10;

  // When viewing all workforce, show standard annual quotas: 12, 12, 10
  // When an individual employee is selected or employee user is logged in, show their live remaining balance
  const casualRemaining = isAggregate ? 12 : Math.max(0, casualTotal - casualDaysUsed);
  const sickRemaining = isAggregate ? 12 : Math.max(0, sickTotal - sickDaysUsed);
  const annualRemaining = isAggregate ? 10 : Math.max(0, annualTotal - annualDaysUsed);

  const casualPercent = Math.min(100, Math.max(0, Math.round((casualRemaining / casualTotal) * 100)));
  const sickPercent = Math.min(100, Math.max(0, Math.round((sickRemaining / sickTotal) * 100)));
  const annualPercent = Math.min(100, Math.max(0, Math.round((annualRemaining / annualTotal) * 100)));

  // Calendar Day mapping based on real leave requests in leaveRequests
  const daysInMonth = new Date(currentYear, selectedMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, selectedMonthIndex, 1).getDay();

  // Helper to check if a day falls within a request's range
  const getLeavesForDay = (dayNum: number) => {
    const dayDate = new Date(currentYear, selectedMonthIndex, dayNum);
    return visibleRequests.filter(req => {
      try {
        const start = new Date(req.startDate);
        const end = new Date(req.endDate);
        // Normalize time parts
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return dayDate >= start && dayDate <= end;
      } catch {
        return false;
      }
    });
  };

  return (
    <div id="leave-management-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Leave Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {pending.length} Action Items
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Annual Quota: 12 Casual (CL), 12 Sick (SL), and 10 Vacation (VL) days per year per employee.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Employee Filter dropdown for Admin/Manager */}
          {!isEmployeeUser && employees.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-xl">
              <Filter className="w-3.5 h-3.5 text-purple-400" />
              <select
                id="select-leave-emp-filter"
                value={selectedEmpFilter}
                onChange={(e) => setSelectedEmpFilter(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#0e1626] text-white">All Workforce ({employees.length})</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.name} className="bg-[#0e1626] text-white">
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            id="btn-apply-leave-modal-trigger"
            onClick={onOpenApplyLeave}
            className="brand-gradient-btn flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer shrink-0 ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* Verified Leave Balances Cards (Calculated directly from live leave records) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Casual Leave Card */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Casual Leave (CL)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Plane className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-['Sora']">
              {casualRemaining} / 12 <span className="text-xs font-normal text-slate-400">Days</span>
            </p>
            <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500" 
                style={{ width: `${casualPercent}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            {isAggregate 
              ? '12 days per year (1 day/month standard allowance)' 
              : (casualDaysUsed === 0 
                  ? '0 days consumed • 100% balance intact' 
                  : `${casualDaysUsed} ${casualDaysUsed === 1 ? 'day' : 'days'} consumed from verified records`)}
          </p>
        </div>

        {/* Sick Leave Card */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Sick Leave (SL)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-['Sora']">
              {sickRemaining} / 12 <span className="text-xs font-normal text-slate-400">Days</span>
            </p>
            <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-500" 
                style={{ width: `${sickPercent}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            {isAggregate 
              ? '12 days per year (1 day/month standard allowance)' 
              : (sickDaysUsed === 0 
                  ? '0 days consumed • 100% balance intact' 
                  : `${sickDaysUsed} ${sickDaysUsed === 1 ? 'day' : 'days'} consumed from verified records`)}
          </p>
        </div>

        {/* Vacation / Annual Leave Card */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Vacation Leave (VL)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-['Sora']">
              {annualRemaining} / 10 <span className="text-xs font-normal text-slate-400">Days</span>
            </p>
            <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full transition-all duration-500" 
                style={{ width: `${annualPercent}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            {isAggregate 
              ? '10 days per year annual vacation allowance' 
              : (annualDaysUsed === 0 
                  ? '0 days consumed • 100% balance intact' 
                  : `${annualDaysUsed} ${annualDaysUsed === 1 ? 'day' : 'days'} consumed from verified records`)}
          </p>
        </div>
      </div>

      {/* Tabs (Pending Requests vs Past Requests vs Team Calendar) */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-3">
          <div className="flex items-center gap-2">
            <button
              id="tab-leave-pending"
              onClick={() => setActiveTab('Requests')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'Requests'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pending Requests ({pending.length})
            </button>
            <button
              id="tab-leave-past"
              onClick={() => setActiveTab('Past')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'Past'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Resolved History ({past.length})
            </button>
            <button
              id="tab-leave-calendar"
              onClick={() => setActiveTab('Calendar')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'Calendar'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Team Leave Calendar
            </button>
          </div>

          <span className="text-xs text-slate-400">
            {selectedEmpFilter === 'ALL' ? 'Showing all workforce records' : `Filtered: ${selectedEmpFilter}`}
          </span>
        </div>

        {/* TAB 1: Pending Requests */}
        {activeTab === 'Requests' && (
          <div className="space-y-4">
            {pending.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Sparkles className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="font-semibold text-white">All leave applications are resolved!</p>
                <p className="text-xs text-slate-500 mt-1">No pending requests requiring approval.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {pending.map((req) => (
                  <div key={req.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      {req.avatar ? (
                        <img 
                          src={req.avatar} 
                          alt={req.employeeName} 
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/30 shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0">
                          {req.avatarInitials || (req.employeeName ? req.employeeName.substring(0, 2).toUpperCase() : 'LV')}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{req.employeeName}</h3>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-300 border border-white/10">
                            {req.department}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Pending Review
                          </span>
                        </div>
                        <p className="text-xs text-purple-300 font-semibold mt-0.5">
                          {req.leaveType} • <span className="text-white">{req.startDate} to {req.endDate}</span> ({req.duration})
                        </p>
                        <p className="text-xs text-slate-400 mt-1 italic">
                          "{req.reason}"
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">Applied on {req.appliedDate || 'Recent'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                      <button
                        id={`btn-reject-leave-${req.id}`}
                        onClick={() => onRejectLeave(req.id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        id={`btn-approve-leave-${req.id}`}
                        onClick={() => onApproveLeave(req.id)}
                        className="brand-gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Past / Resolved History */}
        {activeTab === 'Past' && (
          <div className="space-y-4">
            {past.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="font-semibold text-white">No resolved leave records yet.</p>
                <p className="text-xs text-slate-500 mt-1">Approved and rejected leave requests will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {past.map((req) => (
                  <div key={req.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      {req.avatar ? (
                        <img 
                          src={req.avatar} 
                          alt={req.employeeName} 
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/30 shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0">
                          {req.avatarInitials || (req.employeeName ? req.employeeName.substring(0, 2).toUpperCase() : 'LV')}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{req.employeeName}</h3>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-300 border border-white/10">
                            {req.department}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            req.status === 'Approved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium mt-0.5">
                          {req.leaveType} • {req.startDate} to {req.endDate} ({req.duration})
                        </p>
                        <p className="text-xs text-slate-400 mt-1 italic">
                          "{req.reason}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {req.status === 'Approved' ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-4 h-4" /> Verified Approved
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 font-medium">
                          <X className="w-4 h-4" /> Request Rejected
                        </span>
                      )}
                      {onDeleteLeave && currentUser?.roleType === 'admin' && (
                        <button
                          onClick={() => onDeleteLeave(req.id)}
                          title="Delete leave record permanently"
                          className="p-1.5 ml-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Team Leave Calendar based on real records */}
        {activeTab === 'Calendar' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">
                {monthNames[selectedMonthIndex]} {currentYear}
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setSelectedMonthIndex(prev => (prev > 0 ? prev - 1 : 11))}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setSelectedMonthIndex(prev => (prev < 11 ? prev + 1 : 0))}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Visual Calendar Grid populated strictly from real leave requests */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-1 font-bold text-slate-500 uppercase text-[10px]">{d}</div>
              ))}

              {/* Leading blank days */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`blank-${i}`} className="p-2 min-h-[60px] rounded-xl bg-transparent border border-transparent" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const leavesOnDay = getLeavesForDay(dayNum);
                const hasLeaves = leavesOnDay.length > 0;

                return (
                  <div 
                    key={`day-${dayNum}`} 
                    className={`p-2 min-h-[64px] rounded-xl border text-left flex flex-col justify-between transition-all ${
                      hasLeaves 
                        ? 'bg-purple-950/20 border-purple-500/30 shadow-inner' 
                        : 'bg-white/[0.02] border-white/5'
                    }`}
                  >
                    <span className={`text-[10px] font-bold ${hasLeaves ? 'text-purple-300' : 'text-slate-400'}`}>
                      {dayNum}
                    </span>

                    <div className="space-y-1 overflow-hidden mt-1">
                      {leavesOnDay.slice(0, 2).map((req) => {
                        const isCasual = req.leaveType.toLowerCase().includes('casual');
                        const isSick = req.leaveType.toLowerCase().includes('sick');
                        const colorClass = isCasual 
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : isSick 
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                            : 'bg-purple-500/20 text-purple-300 border-purple-500/30';

                        return (
                          <div 
                            key={req.id} 
                            title={`${req.employeeName} (${req.leaveType}) - ${req.status}`}
                            className={`text-[9px] truncate px-1.5 py-0.5 rounded border font-medium ${colorClass}`}
                          >
                            {req.employeeName.split(' ')[0]} ({req.leaveType.substring(0, 2).toUpperCase()})
                          </div>
                        );
                      })}
                      {leavesOnDay.length > 2 && (
                        <div className="text-[8px] text-slate-400 text-center font-semibold">
                          +{leavesOnDay.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
