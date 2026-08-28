import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { LeaveRequest, ViewMode } from '../types';

interface LeaveManagementViewProps {
  leaveRequests: LeaveRequest[];
  onApproveLeave: (id: string) => void;
  onRejectLeave: (id: string) => void;
  onOpenApplyLeave: () => void;
  onNavigate: (view: ViewMode) => void;
}

export const LeaveManagementView: React.FC<LeaveManagementViewProps> = ({
  leaveRequests,
  onApproveLeave,
  onRejectLeave,
  onOpenApplyLeave
}) => {
  const [activeTab, setActiveTab] = useState<'Requests' | 'Calendar'>('Requests');
  const [selectedMonth, setSelectedMonth] = useState('May 2025');

  const pending = leaveRequests.filter(r => r.status === 'Pending');
  const past = leaveRequests.filter(r => r.status !== 'Pending');

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
            Review time-off requests, track employee leave balances, and plan workforce availability.
          </p>
        </div>

        <button
          id="btn-apply-leave-modal-trigger"
          onClick={onOpenApplyLeave}
          className="brand-gradient-btn flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Balances Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Casual Leave (CL)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Plane className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-['Sora']">12 / 15 <span className="text-xs font-normal text-slate-400">Days</span></p>
            <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div className="w-[80%] h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">3 days used this year</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Sick Leave (SL)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-['Sora']">8 / 10 <span className="text-xs font-normal text-slate-400">Days</span></p>
            <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div className="w-[80%] h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">2 days consumed</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Annual Vacation</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-['Sora']">15 / 20 <span className="text-xs font-normal text-slate-400">Days</span></p>
            <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div className="w-[75%] h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">5 days consumed</p>
        </div>
      </div>

      {/* Tabs (Pending Requests vs Team Calendar) */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('Requests')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'Requests'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pending Requests ({pending.length})
            </button>
            <button
              onClick={() => setActiveTab('Calendar')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'Calendar'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Team Leave Calendar
            </button>
          </div>
        </div>

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
                        </div>
                        <p className="text-xs text-purple-300 font-semibold mt-0.5">
                          {req.leaveType} • <span className="text-white">{req.startDate} to {req.endDate}</span> ({req.duration})
                        </p>
                        <p className="text-xs text-slate-400 mt-1 italic">
                          "{req.reason}"
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">Applied on {req.appliedDate}</p>
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

        {activeTab === 'Calendar' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">{selectedMonth}</span>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded bg-white/5 text-slate-300"><ChevronLeft className="w-4 h-4" /></button>
                <button className="p-1 rounded bg-white/5 text-slate-300"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Visual Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-1 font-bold text-slate-500 uppercase text-[10px]">{d}</div>
              ))}
              {Array.from({ length: 31 }).map((_, i) => {
                const dayNum = i + 1;
                const isLeave1 = dayNum >= 12 && dayNum <= 14;
                const isLeave2 = dayNum >= 20 && dayNum <= 24;
                return (
                  <div key={i} className={`p-2 min-h-[50px] rounded-xl border border-white/5 text-left flex flex-col justify-between ${
                    dayNum === 14 ? 'bg-purple-900/30 border-purple-500/40' : 'bg-white/[0.02]'
                  }`}>
                    <span className="text-[10px] font-bold text-slate-400">{dayNum}</span>
                    {isLeave1 && (
                      <span className="text-[9px] truncate bg-blue-500/20 text-blue-300 px-1 py-0.5 rounded">
                        Rahim (CL)
                      </span>
                    )}
                    {isLeave2 && (
                      <span className="text-[9px] truncate bg-purple-500/20 text-purple-300 px-1 py-0.5 rounded">
                        Sumaiya (AL)
                      </span>
                    )}
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
