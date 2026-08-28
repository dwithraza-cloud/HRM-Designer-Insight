import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  CalendarOff, 
  UserX, 
  UserPlus, 
  ArrowUpRight, 
  TrendingUp, 
  CreditCard, 
  Briefcase, 
  Clock, 
  Calendar, 
  FileText, 
  Award, 
  FolderKanban, 
  BarChart3, 
  Plus, 
  ChevronRight,
  Sparkles,
  CheckSquare,
  Pin,
  PinOff,
  Trash2,
  Check,
  Filter,
  Tag,
  Activity,
  CheckCircle2,
  Target,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  Cell,
  ReferenceLine
} from 'recharts';
import { Employee, LeaveRequest, UpcomingEvent, ActivityItem, ViewMode, TaskItem } from '../types';

interface DashboardViewProps {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  upcomingEvents: UpcomingEvent[];
  activities: ActivityItem[];
  tasks: TaskItem[];
  onAddTask: (title: string, priority?: 'high' | 'medium' | 'low', category?: string) => void;
  onToggleTask: (id: string) => void;
  onTogglePinTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onNavigate: (view: ViewMode) => void;
  onOpenApplyLeave: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  employees,
  leaveRequests,
  upcomingEvents,
  activities,
  tasks,
  onAddTask,
  onToggleTask,
  onTogglePinTask,
  onDeleteTask,
  onNavigate,
  onOpenApplyLeave
}) => {
  const pendingLeaves = leaveRequests.filter(r => r.status === 'Pending');

  // Task Widget Local UI State
  const [taskViewTab, setTaskViewTab] = useState<'list' | 'analytics'>('list');
  const [chartType, setChartType] = useState<'rate' | 'volume'>('rate');
  const [selectedDay, setSelectedDay] = useState<string>('Sun');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState('HR Action');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed' | 'pinned'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle.trim(), newTaskPriority, newTaskCategory);
    setNewTaskTitle('');
  };

  // Derive unique categories from existing tasks + defaults
  const standardCategories: string[] = ['All', 'Leave', 'Performance', 'Payroll', 'Recruitment', 'Onboarding', 'Compliance', 'General'];
  const presentCategories: string[] = Array.from(new Set(tasks.map(t => t.category || 'General')));
  const availableCategories: string[] = ['All', ...Array.from(new Set([...standardCategories.filter(c => c !== 'All'), ...presentCategories]))];

  const getCategoryTaskCount = (cat: string) => {
    if (cat === 'All') return tasks.length;
    return tasks.filter(t => (t.category || 'General').toLowerCase() === cat.toLowerCase()).length;
  };

  // Sort tasks: pinned first, then by completion status
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return 0;
  });

  const filteredTasks = sortedTasks.filter(t => {
    // Status filter
    if (taskFilter === 'pending' && t.completed) return false;
    if (taskFilter === 'completed' && !t.completed) return false;
    if (taskFilter === 'pinned' && !t.pinned) return false;

    // Category filter
    if (selectedCategory !== 'All') {
      const itemCat = (t.category || 'General').toLowerCase();
      if (itemCat !== selectedCategory.toLowerCase()) return false;
    }
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Real-time weekly task completion metrics for Recharts
  const todayRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const weeklyTaskData = [
    { day: 'Mon', fullDay: 'Monday', assigned: 8, completed: 7, pending: 1, rate: 88, target: 85 },
    { day: 'Tue', fullDay: 'Tuesday', assigned: 10, completed: 9, pending: 1, rate: 90, target: 85 },
    { day: 'Wed', fullDay: 'Wednesday', assigned: 7, completed: 6, pending: 1, rate: 86, target: 85 },
    { day: 'Thu', fullDay: 'Thursday', assigned: 9, completed: 8, pending: 1, rate: 89, target: 85 },
    { day: 'Fri', fullDay: 'Friday', assigned: 10, completed: 9, pending: 1, rate: 90, target: 85 },
    { day: 'Sat', fullDay: 'Saturday', assigned: 4, completed: 3, pending: 1, rate: 75, target: 85 },
    { day: 'Sun', fullDay: 'Sunday (Today)', assigned: totalCount, completed: completedCount, pending: Math.max(0, totalCount - completedCount), rate: todayRate, target: 85 },
  ];

  const totalAssignedWeek = weeklyTaskData.reduce((acc, d) => acc + d.assigned, 0);
  const totalCompletedWeek = weeklyTaskData.reduce((acc, d) => acc + d.completed, 0);
  const weeklyAvgRate = totalAssignedWeek > 0 ? Math.round((totalCompletedWeek / totalAssignedWeek) * 100) : 0;
  const activeDayData = weeklyTaskData.find(d => d.day === selectedDay) || weeklyTaskData[6];

  return (
    <div id="dashboard-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/10 bg-gradient-to-r from-[#191e3b]/90 via-[#131b2e]/90 to-[#1e1333]/90">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> HR Intelligence Suite
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-purple-300 via-purple-200 to-indigo-300 bg-clip-text text-transparent">Ayon Ahmed</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Here is your live workforce snapshot for today. You have <span className="text-purple-300 font-semibold">{pendingLeaves.length} pending leave requests</span> and <span className="text-purple-300 font-semibold">24 active job openings</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            id="btn-dash-add-employee"
            onClick={() => onNavigate('add-employee')}
            className="brand-gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
          <button
            id="btn-dash-apply-leave"
            onClick={onOpenApplyLeave}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/10 transition-all cursor-pointer"
          >
            Apply Leave
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Employees */}
        <div 
          onClick={() => onNavigate('employees')}
          className="glass-panel glass-panel-hover p-4 rounded-2xl cursor-pointer transition-all border border-white/5 relative group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              +12% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Total Employees</p>
          <p className="text-2xl font-bold text-white mt-0.5 font-['Sora']">1,248</p>
          <p className="text-[11px] text-slate-500 mt-1">Across 8 departments</p>
        </div>

        {/* Present Today */}
        <div 
          onClick={() => onNavigate('attendance')}
          className="glass-panel glass-panel-hover p-4 rounded-2xl cursor-pointer transition-all border border-white/5 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              84.0%
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Present Today</p>
          <p className="text-2xl font-bold text-white mt-0.5 font-['Sora']">1,048</p>
          <p className="text-[11px] text-emerald-400/80 mt-1">32 late clock-ins</p>
        </div>

        {/* On Leave */}
        <div 
          onClick={() => onNavigate('leave')}
          className="glass-panel glass-panel-hover p-4 rounded-2xl cursor-pointer transition-all border border-white/5 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <CalendarOff className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full">
              {pendingLeaves.length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">On Leave</p>
          <p className="text-2xl font-bold text-white mt-0.5 font-['Sora']">120</p>
          <p className="text-[11px] text-slate-500 mt-1">Approved & active</p>
        </div>

        {/* Absent */}
        <div 
          onClick={() => onNavigate('attendance')}
          className="glass-panel glass-panel-hover p-4 rounded-2xl cursor-pointer transition-all border border-white/5 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <UserX className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
              6.4%
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Absent</p>
          <p className="text-2xl font-bold text-white mt-0.5 font-['Sora']">80</p>
          <p className="text-[11px] text-rose-400/80 mt-1">14 unnotified</p>
        </div>

        {/* New Joiners */}
        <div 
          onClick={() => onNavigate('employees')}
          className="glass-panel glass-panel-hover p-4 rounded-2xl cursor-pointer transition-all border border-white/5 group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full">
              This Month
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">New Joiners</p>
          <p className="text-2xl font-bold text-white mt-0.5 font-['Sora']">24</p>
          <p className="text-[11px] text-blue-400/80 mt-1">Onboarding in flow</p>
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Donut & Metrics */}
        <div className="glass-panel p-5 rounded-3xl border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Attendance Overview</h2>
              <p className="text-xs text-slate-400">Daily workforce participation</p>
            </div>
            <button 
              onClick={() => onNavigate('attendance')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-0.5"
            >
              Details <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Donut Chart Simulation */}
          <div className="relative py-4 flex items-center justify-center">
            <div className="relative w-44 h-44">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" className="stroke-slate-800" strokeWidth="12" fill="none" />
                {/* Present (84%) */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="38" 
                  className="stroke-[#a078ff] transition-all duration-1000" 
                  strokeWidth="12" 
                  strokeDasharray="238.76" 
                  strokeDashoffset="38.2" 
                  strokeLinecap="round"
                  fill="none" 
                />
                {/* On Leave (10%) */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="38" 
                  className="stroke-[#f59e0b] transition-all duration-1000" 
                  strokeWidth="12" 
                  strokeDasharray="238.76" 
                  strokeDashoffset="214.88" 
                  strokeLinecap="round"
                  fill="none" 
                />
              </svg>
              {/* Inner Stats */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-white font-['Sora']">84%</span>
                <span className="text-[11px] text-slate-400 font-medium">Present Rate</span>
              </div>
            </div>
          </div>

          {/* Breakdown Legend */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5 text-center">
            <div className="p-2 rounded-xl bg-white/[0.02]">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#a078ff]" />
                <span className="text-[11px] text-slate-400">Present</span>
              </div>
              <p className="text-sm font-bold text-white">1,048</p>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02]">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[11px] text-slate-400">On Leave</span>
              </div>
              <p className="text-sm font-bold text-white">120</p>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02]">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-[11px] text-slate-400">Absent</span>
              </div>
              <p className="text-sm font-bold text-white">80</p>
            </div>
          </div>
        </div>

        {/* 6-Month Headcount Growth Trend */}
        <div className="glass-panel p-5 rounded-3xl border border-white/5 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Employee Growth Trend</h2>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +11.4% (6 Months)
                </span>
              </div>
              <p className="text-xs text-slate-400">Monthly headcount expansion from Nov to May</p>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
              FY 2024-2025
            </span>
          </div>

          {/* Visual Trend Chart */}
          <div className="h-48 w-full pt-4 pb-2 flex flex-col justify-end">
            <div className="flex items-end justify-between gap-3 h-36 px-2">
              {[
                { month: 'Nov', count: 1120, height: '65%' },
                { month: 'Dec', count: 1150, height: '72%' },
                { month: 'Jan', count: 1180, height: '78%' },
                { month: 'Feb', count: 1210, height: '85%' },
                { month: 'Mar', count: 1230, height: '90%' },
                { month: 'Apr', count: 1248, height: '98%' },
                { month: 'May (Est)', count: 1272, height: '100%', active: true }
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-purple-300 transition-colors opacity-0 group-hover:opacity-100">
                    {item.count}
                  </span>
                  <div 
                    style={{ height: item.height }}
                    className={`w-full max-w-[36px] rounded-t-xl transition-all duration-300 ${
                      item.active 
                        ? 'bg-gradient-to-t from-[#7b42f6] to-[#c084fc] shadow-lg shadow-purple-500/30' 
                        : 'bg-gradient-to-t from-slate-800 to-slate-700 hover:from-purple-900/60 hover:to-purple-700/60'
                    }`}
                  />
                  <span className={`text-[11px] font-medium ${item.active ? 'text-purple-300 font-bold' : 'text-slate-400'}`}>
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Insights */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Engineering & Design led hiring with +42 net new roles.
            </span>
            <button 
              onClick={() => onNavigate('employees')}
              className="text-purple-400 hover:text-purple-300 font-semibold"
            >
              View Directory →
            </button>
          </div>
        </div>
      </div>

      {/* Module Summaries Row (Leave, Payroll, Recruitment) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Leave Summary */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Leave Summary</h3>
              </div>
              <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                {pendingLeaves.length} Pending
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              {pendingLeaves.length > 0 
                ? `${pendingLeaves[0].employeeName} requested ${pendingLeaves[0].leaveType} (${pendingLeaves[0].duration}).`
                : 'No pending approvals required today.'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('leave')}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 flex items-center justify-center gap-1 transition-all"
          >
            Review Leave Requests <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Payroll Summary */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Payroll Summary</h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                May Cycle
              </span>
            </div>
            <p className="text-lg font-bold text-white font-['Sora']">৳ 28,65,540</p>
            <p className="text-xs text-slate-400 mt-0.5 mb-3">Total Estimated Payroll Disbursement</p>
          </div>
          <button
            onClick={() => onNavigate('payroll')}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 flex items-center justify-center gap-1 transition-all"
          >
            Manage Payroll <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recruitment Summary */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Recruitment Pipeline</h3>
              </div>
              <span className="text-[11px] font-semibold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full">
                24 Active
              </span>
            </div>
            <p className="text-lg font-bold text-white font-['Sora']">156 Candidates</p>
            <p className="text-xs text-slate-400 mt-0.5 mb-3">32 interviews scheduled for this week</p>
          </div>
          <button
            onClick={() => onNavigate('recruitment')}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 flex items-center justify-center gap-1 transition-all"
          >
            Explore Openings <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* My Tasks & Upcoming Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Tasks & Weekly Analytics Widget */}
        <div id="widget-my-tasks" className="glass-panel p-5 rounded-3xl border border-white/5 space-y-4 lg:col-span-2 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header: Title, Completion Badge, & View Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-white">My Tasks & Velocity</h2>
                  <span className="text-xs bg-purple-500/15 text-purple-300 font-semibold px-2.5 py-0.5 rounded-full border border-purple-500/20">
                    {completedCount}/{totalCount} Resolved
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">HR action items, workflow approvals & weekly completion telemetry</p>
              </div>

              {/* View Switcher (Checklist vs Recharts Analytics) & Manage All Tasks link */}
              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/10">
                  <button
                    id="btn-tab-task-list"
                    onClick={() => setTaskViewTab('list')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      taskViewTab === 'list'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Checklist</span>
                  </button>
                  <button
                    id="btn-tab-task-analytics"
                    onClick={() => setTaskViewTab('analytics')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      taskViewTab === 'analytics'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Weekly Chart</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </button>
                </div>

                <button
                  id="btn-nav-full-task-management"
                  onClick={() => onNavigate('tasks')}
                  className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Open Full Task Management Module"
                >
                  <span>Task Management</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* TAB 1: TASK CHECKLIST VIEW */}
            {taskViewTab === 'list' && (
              <div className="space-y-3.5">
                {/* Status Filter Tabs, Category Dropdown & Quick Mini Metric */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
                      {(['all', 'pending', 'pinned', 'completed'] as const).map((filterKey) => (
                        <button
                          key={filterKey}
                          id={`btn-task-filter-${filterKey}`}
                          onClick={() => setTaskFilter(filterKey)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                            taskFilter === filterKey
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          {filterKey}
                        </button>
                      ))}
                    </div>

                    {/* Category Filter Dropdown */}
                    <div className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-xl border border-white/5">
                      <Tag className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Category:</span>
                      <select
                        id="select-task-category-filter"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-transparent text-xs text-purple-200 font-semibold focus:outline-none cursor-pointer pr-1"
                      >
                        {availableCategories.map(cat => (
                          <option key={cat} value={cat} className="bg-[#131b2e] text-slate-200">
                            {cat} ({getCategoryTaskCount(cat)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div 
                    onClick={() => setTaskViewTab('analytics')}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 cursor-pointer hover:bg-purple-500/15 transition-all self-start sm:self-auto"
                  >
                    <Activity className="w-3.5 h-3.5 text-purple-400" />
                    <span>Weekly Avg: <strong className="text-white font-['Sora']">{weeklyAvgRate}%</strong></span>
                    <ChevronRight className="w-3 h-3 text-purple-400" />
                  </div>
                </div>

                {/* Category Filter Tabs Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3 text-purple-400" /> Filter:
                  </span>
                  {availableCategories.map((cat) => {
                    const count = getCategoryTaskCount(cat);
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        id={`btn-category-tab-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                            : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] border border-white/5'
                        }`}
                      >
                        <span>{cat}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                  {selectedCategory !== 'All' && (
                    <button
                      id="btn-clear-category-filter"
                      onClick={() => setSelectedCategory('All')}
                      className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:underline cursor-pointer shrink-0 ml-1 px-1.5 py-0.5"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Quick Add Task Input Form */}
                <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      id="input-new-task-title"
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Add a new HR action item (e.g. Schedule onboarding session)..."
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Priority Selector */}
                    <select
                      id="select-task-priority"
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as 'high' | 'medium' | 'low')}
                      className="bg-white/[0.04] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
                    >
                      <option value="high" className="bg-[#131b2e] text-rose-300">High Priority</option>
                      <option value="medium" className="bg-[#131b2e] text-amber-300">Medium Priority</option>
                      <option value="low" className="bg-[#131b2e] text-blue-300">Low Priority</option>
                    </select>

                    {/* Category Selector */}
                    <select
                      id="select-task-category"
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value)}
                      className="bg-white/[0.04] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500 transition-all cursor-pointer hidden md:block"
                    >
                      <option value="HR Action" className="bg-[#131b2e] text-slate-300">HR Action</option>
                      <option value="Leave" className="bg-[#131b2e] text-slate-300">Leave</option>
                      <option value="Performance" className="bg-[#131b2e] text-slate-300">Performance</option>
                      <option value="Payroll" className="bg-[#131b2e] text-slate-300">Payroll</option>
                      <option value="Recruitment" className="bg-[#131b2e] text-slate-300">Recruitment</option>
                      <option value="Onboarding" className="bg-[#131b2e] text-slate-300">Onboarding</option>
                      <option value="Compliance" className="bg-[#131b2e] text-slate-300">Compliance</option>
                      <option value="General" className="bg-[#131b2e] text-slate-300">General</option>
                    </select>

                    {/* Submit button */}
                    <button
                      id="btn-add-task-submit"
                      type="submit"
                      disabled={!newTaskTitle.trim()}
                      className="brand-gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Task</span>
                    </button>
                  </div>
                </form>

                {/* Task List Items */}
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-8 rounded-2xl bg-white/[0.02] border border-white/5">
                      <p className="text-xs text-slate-400 font-medium">No tasks match the selected filters.</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {selectedCategory !== 'All' 
                          ? `No tasks found in category "${selectedCategory}". Try changing or clearing the category filter.`
                          : 'Use the field above to add your daily action items.'}
                      </p>
                      {selectedCategory !== 'All' && (
                        <button
                          onClick={() => setSelectedCategory('All')}
                          className="mt-2 text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer underline"
                        >
                          Show all categories
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        id={`task-item-${task.id}`}
                        className={`group p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          task.completed
                            ? 'bg-white/[0.01] border-white/5 opacity-60'
                            : task.pinned
                            ? 'bg-purple-950/25 border-purple-500/30 shadow-sm shadow-purple-900/10'
                            : 'bg-white/[0.03] hover:bg-white/[0.05] border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Checkbox Toggle Button */}
                          <button
                            id={`btn-toggle-task-${task.id}`}
                            onClick={() => onToggleTask(task.id)}
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                              task.completed
                                ? 'bg-purple-600 border-purple-500 text-white'
                                : 'border-white/20 hover:border-purple-400 bg-white/[0.04]'
                            }`}
                            title={task.completed ? 'Mark pending' : 'Mark completed'}
                          >
                            {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>

                          {/* Title & metadata */}
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-medium truncate ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {task.pinned && (
                                <span className="text-[10px] font-bold text-purple-300 flex items-center gap-0.5 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30">
                                  <Pin className="w-2.5 h-2.5 fill-purple-300" /> Pinned
                                </span>
                              )}
                              {task.priority && (
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                                  task.priority === 'high'
                                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                    : task.priority === 'medium'
                                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                    : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                }`}>
                                  {task.priority.toUpperCase()}
                                </span>
                              )}
                              {task.category && (
                                <button
                                  onClick={() => setSelectedCategory(task.category || 'General')}
                                  title={`Filter by ${task.category}`}
                                  className={`text-[10px] px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                                    selectedCategory === task.category
                                      ? 'bg-purple-500/30 text-purple-200 border-purple-400'
                                      : 'text-slate-400 hover:text-purple-300 bg-white/5 hover:bg-white/10 border-white/5'
                                  }`}
                                >
                                  {task.category}
                                </button>
                              )}
                              {task.dueDate && (
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5 text-slate-500" /> {task.dueDate}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions: Pin / Delete */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            id={`btn-pin-task-${task.id}`}
                            onClick={() => onTogglePinTask(task.id)}
                            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                              task.pinned
                                ? 'text-purple-300 bg-purple-500/20 hover:bg-purple-500/30'
                                : 'text-slate-400 hover:text-purple-300 hover:bg-white/10 opacity-70 group-hover:opacity-100'
                            }`}
                            title={task.pinned ? 'Unpin task' : 'Pin task to top'}
                          >
                            {task.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            id={`btn-delete-task-${task.id}`}
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 opacity-70 group-hover:opacity-100 transition-all cursor-pointer"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: RECHARTS WEEKLY COMPLETION CHARTS & ANALYTICS */}
            {taskViewTab === 'analytics' && (
              <div id="recharts-task-completion-section" className="space-y-4">
                {/* Analytics Summary Header & Chart Switcher */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Target className="w-3 h-3 text-purple-400" /> Weekly Avg Rate
                    </p>
                    <p className="text-xl font-bold text-white mt-1 font-['Sora']">{weeklyAvgRate}%</p>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
                      <TrendingUp className="w-2.5 h-2.5" /> Above 85% Target
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Resolved Tasks
                    </p>
                    <p className="text-xl font-bold text-white mt-1 font-['Sora']">{totalCompletedWeek} <span className="text-xs text-slate-400 font-normal">/ {totalAssignedWeek}</span></p>
                    <span className="text-[10px] text-purple-300 font-semibold mt-0.5 block">
                      This Week Total
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" /> Peak Velocity
                    </p>
                    <p className="text-xl font-bold text-white mt-1 font-['Sora']">90%</p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Tuesday & Friday
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-400" /> Today (Live)
                    </p>
                    <p className="text-xl font-bold text-purple-300 mt-1 font-['Sora']">{todayRate}%</p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {completedCount} of {totalCount} Done
                    </span>
                  </div>
                </div>

                {/* Chart Header Controls: Chart Type Selector & Target Legend */}
                <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Daily Completion Rates</span>
                    <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                      Mon – Sun
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white/[0.03] p-0.5 rounded-lg border border-white/5 text-[11px]">
                      <button
                        id="btn-chart-rate"
                        onClick={() => setChartType('rate')}
                        className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-all ${
                          chartType === 'rate'
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Rate (%)
                      </button>
                      <button
                        id="btn-chart-volume"
                        onClick={() => setChartType('volume')}
                        className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-all ${
                          chartType === 'volume'
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Task Volume
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recharts Chart Visualization */}
                <div className="h-[210px] w-full bg-white/[0.01] rounded-2xl p-2 border border-white/5">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'rate' ? (
                      <AreaChart
                        data={weeklyTaskData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        onClick={(state) => {
                          if (state && state.activeLabel) {
                            setSelectedDay(state.activeLabel);
                          }
                        }}
                      >
                        <defs>
                          <linearGradient id="taskRateGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                          dataKey="day" 
                          stroke="#94a3b8" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          domain={[50, 100]}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                <div className="bg-[#131b2e]/95 backdrop-blur-md p-3 rounded-xl border border-purple-500/30 shadow-2xl text-xs space-y-1.5 min-w-[160px]">
                                  <div className="flex items-center justify-between border-b border-white/10 pb-1">
                                    <span className="font-bold text-white">{d.fullDay}</span>
                                    <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded">
                                      {d.rate}% Rate
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-slate-300 text-[11px]">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> Resolved:
                                    </span>
                                    <span className="font-bold text-emerald-300 font-['Sora']">{d.completed} of {d.assigned}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-slate-400 text-[10px] pt-1 border-t border-white/5">
                                    <span>Weekly Benchmark:</span>
                                    <span className="text-emerald-400 font-semibold">85% Target</span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <ReferenceLine 
                          y={85} 
                          stroke="#10b981" 
                          strokeDasharray="4 4" 
                          strokeOpacity={0.8}
                          label={{ value: '85% Target', fill: '#34d399', fontSize: 10, position: 'insideTopRight' }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="rate" 
                          stroke="#a855f7" 
                          strokeWidth={2.5}
                          fillOpacity={1} 
                          fill="url(#taskRateGradient)"
                          activeDot={{ r: 6, fill: '#c084fc', stroke: '#ffffff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    ) : (
                      <BarChart
                        data={weeklyTaskData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        onClick={(state) => {
                          if (state && state.activeLabel) {
                            setSelectedDay(state.activeLabel);
                          }
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                          dataKey="day" 
                          stroke="#94a3b8" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                <div className="bg-[#131b2e]/95 backdrop-blur-md p-3 rounded-xl border border-purple-500/30 shadow-2xl text-xs space-y-1.5 min-w-[160px]">
                                  <div className="flex items-center justify-between border-b border-white/10 pb-1">
                                    <span className="font-bold text-white">{d.fullDay}</span>
                                    <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded">
                                      {d.rate}% Rate
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-slate-300 text-[11px]">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-purple-400" /> Completed:
                                    </span>
                                    <span className="font-bold text-purple-300 font-['Sora']">{d.completed} tasks</span>
                                  </div>
                                  <div className="flex items-center justify-between text-slate-300 text-[11px]">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-slate-500" /> Total Assigned:
                                    </span>
                                    <span className="font-bold text-white font-['Sora']">{d.assigned} tasks</span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="assigned" name="Assigned" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="completed" name="Completed" fill="#a855f7" radius={[4, 4, 0, 0]}>
                          {weeklyTaskData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.day === 'Sun' ? '#c084fc' : '#a855f7'} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Interactive Day Details Pills */}
                <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
                  {weeklyTaskData.map((d) => {
                    const isSelected = selectedDay === d.day;
                    return (
                      <button
                        key={d.day}
                        onClick={() => setSelectedDay(d.day)}
                        className={`px-2.5 py-1.5 rounded-xl border text-center transition-all cursor-pointer flex-1 min-w-[55px] ${
                          isSelected
                            ? 'bg-purple-600/30 border-purple-500/50 shadow-sm shadow-purple-900/20'
                            : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5'
                        }`}
                      >
                        <p className="text-[10px] text-slate-400 font-medium">{d.day}</p>
                        <p className={`text-xs font-bold font-['Sora'] mt-0.5 ${d.rate >= 85 ? 'text-emerald-300' : 'text-amber-300'}`}>
                          {d.rate}%
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Progress bar footer */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-purple-300 shrink-0">{progressPercent}%</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {taskViewTab === 'list' 
                ? (selectedCategory !== 'All' 
                    ? `Showing ${filteredTasks.length} task${filteredTasks.length === 1 ? '' : 's'} in "${selectedCategory}" (${completedCount}/${totalCount} total resolved)`
                    : `${completedCount} of ${totalCount} daily actions resolved`)
                : `Active Day: ${activeDayData.fullDay} (${activeDayData.completed}/${activeDayData.assigned} tasks completed)`}
            </span>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="glass-panel p-5 rounded-3xl border border-white/5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-white">Upcoming Events</h2>
              <span className="text-xs text-purple-400 font-semibold cursor-pointer">View Calendar</span>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map((evt) => (
                <div key={evt.id} className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 flex items-center gap-3.5 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-purple-300 uppercase">{evt.month}</span>
                    <span className="text-base font-extrabold text-white font-['Sora'] leading-none mt-0.5">{evt.date}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{evt.title}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{evt.subtitle}</p>
                  </div>
                  {evt.avatar && (
                    <img 
                      src={evt.avatar} 
                      alt="Event Person" 
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 text-xs text-slate-400 flex items-center justify-between">
            <span>4 events in the next 30 days</span>
            <span className="text-purple-400 font-semibold cursor-pointer">+ Sync Calendar</span>
          </div>
        </div>
      </div>

      {/* Quick Access & Recent Activity Grid */}
      <div className="glass-panel p-5 rounded-3xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Quick Access & Modules</h2>
            <p className="text-xs text-slate-400">Frequently used HR management tools</p>
          </div>
          <span className="text-xs text-purple-400 font-semibold">8 Shortcuts</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'Add Employee', icon: UserPlus, view: 'add-employee' as ViewMode, color: 'text-purple-400 bg-purple-500/20' },
            { label: 'Apply Leave', icon: Calendar, action: onOpenApplyLeave, color: 'text-amber-400 bg-amber-500/20' },
            { label: 'Attendance', icon: Clock, view: 'attendance' as ViewMode, color: 'text-emerald-400 bg-emerald-500/20' },
            { label: 'Payroll', icon: CreditCard, view: 'payroll' as ViewMode, color: 'text-blue-400 bg-blue-500/20' },
            { label: 'Recruitment', icon: Briefcase, view: 'recruitment' as ViewMode, color: 'text-rose-400 bg-rose-500/20' },
            { label: 'Performance', icon: Award, view: 'performance' as ViewMode, color: 'text-indigo-400 bg-indigo-500/20' },
            { label: 'Documents', icon: FolderKanban, view: 'documents' as ViewMode, color: 'text-teal-400 bg-teal-500/20' },
            { label: 'Reports', icon: BarChart3, view: 'reports' as ViewMode, color: 'text-pink-400 bg-pink-500/20' },
          ].map((btn, idx) => {
            const Icon = btn.icon;
            return (
              <button
                key={idx}
                id={`btn-quick-access-${idx}`}
                onClick={() => {
                  if (btn.action) btn.action();
                  else if (btn.view) onNavigate(btn.view);
                }}
                className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 flex flex-col items-center justify-center gap-2 transition-all text-center group cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${btn.color}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-semibold text-slate-300 group-hover:text-white truncate max-w-full">
                  {btn.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Recent Live Activity Stream */}
        <div className="pt-4 border-t border-white/5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Recent Activity Feed</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {activities.slice(0, 3).map((act) => (
              <div key={act.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0 mt-1.5" />
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-white mr-1">{act.highlightedText}</span>
                  <span className="text-slate-400 text-[11px] block">{act.description}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">{act.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
