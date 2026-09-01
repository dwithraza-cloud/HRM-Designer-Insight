import React, { useState } from 'react';
import confetti from 'canvas-confetti';
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
  Zap,
  Cake,
  Gift,
  PartyPopper,
  Send,
  Heart,
  Smile,
  MessageCircle,
  X
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
  ReferenceLine,
  PieChart,
  Pie
} from 'recharts';
import { Employee, LeaveRequest, UpcomingEvent, ActivityItem, ViewMode, TaskItem, JobOpening, PayrollRecord, UserProfile } from '../types';

interface DashboardViewProps {
  currentUser: UserProfile;
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  jobOpenings: JobOpening[];
  payrollRecords: PayrollRecord[];
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
  currentUser,
  employees,
  leaveRequests,
  jobOpenings,
  payrollRecords,
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
  const totalEmps = employees.length;
  const approvedLeaves = leaveRequests.filter(r => r.status === 'Approved').length;
  const pendingLeaves = leaveRequests.filter(r => r.status === 'Pending');
  const presentCount = Math.max(0, Math.round(totalEmps * 0.85));
  const leaveCount = Math.max(0, approvedLeaves + Math.min(pendingLeaves.length, totalEmps));
  const absentCount = Math.max(0, totalEmps - presentCount - leaveCount);
  const presentPercent = totalEmps > 0 ? Math.round((presentCount / totalEmps) * 100) : 0;
  const leavePercent = totalEmps > 0 ? Math.round((leaveCount / totalEmps) * 100) : 0;
  const absentPercent = totalEmps > 0 ? Math.round((absentCount / totalEmps) * 100) : 0;

  const attendanceBreakdownData = [
    { name: 'Present', value: presentCount, percentage: presentPercent, color: '#a078ff', subtext: `${Math.round(presentCount * 0.1)} late clock-ins` },
    { name: 'On Leave', value: leaveCount, percentage: leavePercent, color: '#f59e0b', subtext: `${pendingLeaves.length} pending approvals` },
    { name: 'Absent', value: absentCount, percentage: absentPercent, color: '#f43f5e', subtext: 'Unnotified absences' },
  ];

  const activeJobCount = jobOpenings.length;
  const totalPayrollAmount = payrollRecords.reduce((acc, p) => acc + (p.netPay || p.baseSalary || 250000), 0) || (totalEmps * 240000);

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

  // Upcoming Birthdays Widget State & Data
  const [birthdayRange, setBirthdayRange] = useState<'week' | 'month'>('week');
  const [wishedEmpIds, setWishedEmpIds] = useState<string[]>(['emp-2']);
  const [activeWishModal, setActiveWishModal] = useState<{
    id: string;
    empId: string;
    name: string;
    role: string;
    department: string;
    avatar?: string;
    avatarInitials?: string;
    date: string;
    dayLabel: string;
    relativeTime: 'today' | 'tomorrow' | 'this_week' | 'later';
    defaultWish: string;
  } | null>(null);
  const [customWishMsg, setCustomWishMsg] = useState('');
  const [birthdayToast, setBirthdayToast] = useState<string | null>(null);

  const handleSendWish = (empId: string, empName: string, message?: string) => {
    if (!wishedEmpIds.includes(empId)) {
      setWishedEmpIds(prev => [...prev, empId]);
    }
    confetti({
      particleCount: 75,
      spread: 80,
      origin: { y: 0.6 }
    });
    setBirthdayToast(`🎉 Birthday wishes sent to ${empName}! "${message || 'Happy Birthday! Wishing you an awesome and joyful day!'}"`);
    setActiveWishModal(null);
    setCustomWishMsg('');
    setTimeout(() => {
      setBirthdayToast(null);
    }, 4500);
  };

  const upcomingBirthdays = [
    {
      id: 'emp-6',
      empId: 'EMP-0105',
      name: 'Sarah Rahman',
      role: 'Marketing Lead',
      department: 'Marketing',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5IchO3RZGm0f-HVXMJ2KxT1l2SPNekW2kVOsggoKpVozxw1zaldbKe88nR15OTuPadqt_G7uE6prssjL5xoTgVCGTpoza8BFq1s1jhzKiaXW7oZKPC9tygDzBzxnsHNiu2qwkIO4zmOCcexW7kiM1D9FmeO5X-YHAWr5NitUEE2fZ6T5TkPRNQb3uPDz0rR1Mnot8atZ8vqQ5D0tFqEAqa-TfiXb4wekFZpoBxlHR6R4nrLDWUoI1',
      date: 'Today, 18 May',
      dayLabel: 'Today',
      relativeTime: 'today' as const,
      countdown: 'Today 🎉',
      age: 32,
      isThisWeek: true,
      defaultWish: 'Happy Birthday Sarah! Wishing you a fantastic celebration and an amazing year of creativity and leadership! 🎂🎉'
    },
    {
      id: 'emp-5',
      empId: 'EMP-0104',
      name: 'David Rodriguez',
      role: 'Chief Technology Officer',
      department: 'Engineering',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxxwgp1S_xgssIZegK3dERGVDZcLI9XQVUUm9It4Wm4oMN4NKizpZSI9fWQibKQdGBAI8RMzHaqD_HL4fSBoylnUj-ucusfkiJ8xXMyzcwvEM_rNaleKTzbfNS6NpSpcOYjnN7_IfN8HwVz4nDrcsjOoNXLw5OjxsykRRqh1lGToOo0hbnOQt7mnj54iEhfAtgCaAsqcivvqhMKtX2XVijkEYYxOy-VtUvvwosmtJodKaQSKIgpOb4',
      date: 'Tomorrow, 19 May',
      dayLabel: 'Tomorrow',
      relativeTime: 'tomorrow' as const,
      countdown: 'Tomorrow 🎂',
      age: 40,
      isThisWeek: true,
      defaultWish: 'Happy early Birthday David! Thank you for inspiring the tech team every day. Cheers to another great milestone! 🚀✨'
    },
    {
      id: 'emp-2',
      empId: 'EMP-0142',
      name: 'Rani',
      role: 'UI/UX Visual Designer',
      department: 'Design',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSANbGI_8XJwr4JerK2U_S85Z10-Lhe_dnK9SL5j7CA7A78CwnhHQHcY4OfNOr2pDaW9hgOkTqKBCWPZ9PSSR9sfz9ljGdJCaRFTtYFjjW-EeDaH4Lb7pSfNCRoyGbmvg9LYJvJf4XTU2H0-vTX1OncSoyHd9Yq1BjbrpoWB6up8qQOivnc3S9AK11f-bL5xi6YcXHd-lgU3gKTaGFvNAZXYG0H5_OaDSz4Vlg_JLyRbeFO6H7cJrv',
      date: 'Thu, 21 May',
      dayLabel: 'Thursday',
      relativeTime: 'this_week' as const,
      countdown: 'In 3 Days 🎈',
      age: 33,
      isThisWeek: true,
      defaultWish: 'Happy Birthday Rani! Wishing you endless inspiration, joy, and wonderful designs ahead! 🎨🎁'
    },
    {
      id: 'emp-8',
      empId: 'EMP-0107',
      name: 'James Wilson',
      role: 'Financial Analyst',
      department: 'Finance',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYuWL1I268A8mrdo_oo6Ogy_tSmASTaEJzJe3YhKGlNgG-oTNLpoHtIfy51vMDxhlTEaMNdg0f8nYuwf5pN1P1s8ipRI8UPvU8ubP4jIzk2XVX6dnAtOqx4Sdgx7ApP-rb9yAJfNQc0srAr64oJ2RuzqXKIX5b5AdPGEulshBmBcxQEgBpu8GVCjNiIbRRMND0n1IrG9SqpcfdNHqJyikzXSu_9Yhs3J1sOs9pR-ahVBP6E3C1G0-m',
      date: 'Sat, 23 May',
      dayLabel: 'Saturday',
      relativeTime: 'this_week' as const,
      countdown: 'In 5 Days 🎁',
      age: 34,
      isThisWeek: true,
      defaultWish: 'Happy Birthday James! Wishing you great health, happiness, and prosperity in the coming year! 📊🥂'
    },
    {
      id: 'emp-12',
      empId: 'EMP-0111',
      name: 'Fatima Zohra',
      role: 'Content & Copy Lead',
      department: 'Marketing',
      avatarInitials: 'FZ',
      date: 'Tue, 26 May',
      dayLabel: 'Next Tue',
      relativeTime: 'later' as const,
      countdown: 'In 8 Days',
      age: 29,
      isThisWeek: false,
      defaultWish: 'Happy Birthday Fatima! May your day be as vibrant and wonderful as your stories! ✍️🎉'
    },
    {
      id: 'emp-10',
      empId: 'EMP-0109',
      name: 'David Chen',
      role: 'Senior Frontend Engineer',
      department: 'Engineering',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCygYhHxrgl5qRtqzjE6Q0wBw0qO07I1AgcE3f7rjT4Kvlk-h2eBlcyXzERuSG8QLwXvTln7dkB0evTz0_8d6XscH6Z-3ZscPI4rvjg4uAo_okgcs6zG4cqq6SF-bGnZraG6xC0yvzBhJ6reIdNoLS3uiyVM70IVXv4NOXel6TAoMvE_fZJ0Fbk50-6GNyyj9xAgi0SThZcppMO1pbPKw8HQ78s8IXlXstNFswBA7TOP-RXosHeF3X',
      date: 'Sat, 30 May',
      dayLabel: 'End of Month',
      relativeTime: 'later' as const,
      countdown: 'In 12 Days',
      age: 30,
      isThisWeek: false,
      defaultWish: 'Happy Birthday David! Wishing you smooth code and fantastic adventures ahead! 💻🎂'
    }
  ];

  const activeUpcomingBirthdays = upcomingBirthdays.filter(b => 
    employees.some(e => e.id === b.id || e.empId === b.empId || e.name.toLowerCase() === b.name.toLowerCase())
  );

  const thisWeekBirthdays = activeUpcomingBirthdays.filter(b => b.isThisWeek);
  const displayedBirthdays = birthdayRange === 'week' ? thisWeekBirthdays : activeUpcomingBirthdays;
  const todaysBirthday = activeUpcomingBirthdays.find(b => b.relativeTime === 'today');

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
            Welcome back, <span className="bg-gradient-to-r from-purple-300 via-purple-200 to-indigo-300 bg-clip-text text-transparent">{currentUser.name}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Here is your live workforce snapshot for today. You have <span className="text-purple-300 font-semibold">{pendingLeaves.length} pending leave requests</span> and <span className="text-purple-300 font-semibold">{activeJobCount} active job openings</span>.
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
              Live <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Total Employees</p>
          <p className="text-2xl font-bold text-white mt-0.5 font-['Sora']">{totalEmps.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-1">Active directory registry</p>
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
              {presentPercent}%
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Present Today</p>
          <p className="text-2xl font-bold text-white mt-0.5 font-['Sora']">{presentCount.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-400/80 mt-1">Active clock-ins</p>
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
          <p className="text-2xl font-bold text-white mt-0.5 font-['Sora']">{leaveCount.toLocaleString()}</p>
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
              {absentPercent}%
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Absent</p>
          <p className="text-2xl font-bold text-white mt-0.5 font-['Sora']">{absentCount.toLocaleString()}</p>
          <p className="text-[11px] text-rose-400/80 mt-1">Unnotified</p>
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
              Directory
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">New Joiners</p>
          <p className="text-2xl font-bold text-white mt-0.5 font-['Sora']">{Math.min(totalEmps, 12)}</p>
          <p className="text-[11px] text-blue-400/80 mt-1">Onboarding in flow</p>
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Summary Card with Recharts Ring Chart */}
        <div id="card-attendance-summary" className="glass-panel p-5 rounded-3xl border border-white/5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Attendance Summary</h2>
                <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                </span>
              </div>
              <p className="text-xs text-slate-400">Workforce presence breakdown</p>
            </div>
            <button 
              id="btn-attendance-summary-details"
              onClick={() => onNavigate('attendance')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-0.5 transition-colors cursor-pointer group"
              title="Open full attendance log"
            >
              <span>Details</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Recharts Ring / Donut Chart */}
          <div className="relative h-44 w-full flex items-center justify-center my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as { name: string; value: number; percentage: number; color: string; subtext: string };
                      return (
                        <div className="bg-[#131b2e]/95 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shadow-xl text-xs space-y-0.5 pointer-events-none">
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: data.color }} />
                            <span>{data.name}</span>
                          </div>
                          <div className="text-slate-300">
                            <span className="font-semibold text-white font-['Sora']">{data.value.toLocaleString()}</span> employees ({data.percentage}%)
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {data.subtext}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={attendanceBreakdownData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  cornerRadius={5}
                  stroke="none"
                  animationDuration={800}
                >
                  {attendanceBreakdownData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="cursor-pointer hover:opacity-85 transition-opacity"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Ring Stats Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-2xl font-extrabold text-white font-['Sora'] leading-tight">{presentPercent}%</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Present</span>
            </div>
          </div>

          {/* Breakdown Legend Tiles */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center">
            {attendanceBreakdownData.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => onNavigate('attendance')}
                className="p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition-all cursor-pointer group"
                title={`View ${item.name} list`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors font-medium truncate">{item.name}</span>
                </div>
                <p className="text-sm font-bold text-white font-['Sora']">{item.value.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{item.percentage}%</p>
              </div>
            ))}
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
            <p className="text-lg font-bold text-white font-['Sora']">Rs. {totalPayrollAmount.toLocaleString()} <span className="text-xs font-normal text-purple-300">PKR</span></p>
            <p className="text-xs text-slate-400 mt-0.5 mb-3">Total Estimated Payroll Disbursement ({totalEmps} active employees)</p>
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
                {activeJobCount} Active
              </span>
            </div>
            <p className="text-lg font-bold text-white font-['Sora']">{activeJobCount * 6 + 12} Candidates</p>
            <p className="text-xs text-slate-400 mt-0.5 mb-3">{activeJobCount * 2} interviews scheduled for this week</p>
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

        {/* Right Column: Upcoming Birthdays & Upcoming Events */}
        <div className="space-y-6 flex flex-col">
          {/* Upcoming Birthdays Widget */}
          <div id="widget-upcoming-birthdays" className="glass-panel p-5 rounded-3xl border border-white/5 space-y-4 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-white/[0.04] to-white/[0.01]">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center shadow-lg shadow-pink-500/10">
                    <Cake className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-white">Upcoming Birthdays</h2>
                      <span className="text-[10px] bg-pink-500/20 text-pink-300 font-bold px-2 py-0.5 rounded-full border border-pink-500/30 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-pink-400" /> {thisWeekBirthdays.length} This Week
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Team milestones & birthday celebrations</p>
                  </div>
                </div>

                {/* Week vs Month Switcher */}
                <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10 shrink-0">
                  <button
                    id="btn-birthdays-week"
                    onClick={() => setBirthdayRange('week')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      birthdayRange === 'week'
                        ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    This Week
                  </button>
                  <button
                    id="btn-birthdays-month"
                    onClick={() => setBirthdayRange('month')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      birthdayRange === 'month'
                        ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Month
                  </button>
                </div>
              </div>

              {/* Today's Birthday Spotlight Banner (if active) */}
              {todaysBirthday && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-amber-950/20 border border-pink-500/30 shadow-lg shadow-pink-950/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-20 h-20 bg-pink-500/10 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        {todaysBirthday.avatar ? (
                          <img
                            src={todaysBirthday.avatar}
                            alt={todaysBirthday.name}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-pink-400/80 shadow-md shadow-pink-500/20"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-pink-600/30 border border-pink-400 text-pink-200 font-bold flex items-center justify-center text-sm">
                            {todaysBirthday.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px] shadow-sm border border-slate-900">
                          🎂
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-pink-300 bg-pink-500/20 px-1.5 py-0.5 rounded border border-pink-500/30 flex items-center gap-1">
                            <PartyPopper className="w-2.5 h-2.5" /> TODAY'S BIRTHDAY
                          </span>
                          <span className="text-[10px] text-amber-300 font-semibold">Turning {todaysBirthday.age}</span>
                        </div>
                        <p className="text-xs font-bold text-white truncate mt-0.5">{todaysBirthday.name}</p>
                        <p className="text-[11px] text-slate-300 truncate">{todaysBirthday.role} • {todaysBirthday.department}</p>
                      </div>
                    </div>

                    <button
                      id={`btn-wish-today-${todaysBirthday.id}`}
                      onClick={() => {
                        if (wishedEmpIds.includes(todaysBirthday.id)) {
                          handleSendWish(todaysBirthday.id, todaysBirthday.name, 'Sending extra birthday love! 💖🎉');
                        } else {
                          setActiveWishModal({
                            id: todaysBirthday.id,
                            empId: todaysBirthday.empId,
                            name: todaysBirthday.name,
                            role: todaysBirthday.role,
                            department: todaysBirthday.department,
                            avatar: todaysBirthday.avatar,
                            date: todaysBirthday.date,
                            dayLabel: todaysBirthday.dayLabel,
                            relativeTime: todaysBirthday.relativeTime,
                            defaultWish: todaysBirthday.defaultWish
                          });
                          setCustomWishMsg(todaysBirthday.defaultWish);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                        wishedEmpIds.includes(todaysBirthday.id)
                          ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 hover:bg-pink-500/30'
                          : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-md shadow-pink-500/30'
                      }`}
                    >
                      {wishedEmpIds.includes(todaysBirthday.id) ? (
                        <>
                          <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
                          <span>Wished 🎉</span>
                        </>
                      ) : (
                        <>
                          <Gift className="w-3.5 h-3.5" />
                          <span>Send Wish 🎈</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Birthday List Items */}
              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                {displayedBirthdays.length === 0 ? (
                  <div className="text-center py-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <Cake className="w-6 h-6 text-slate-500 mx-auto mb-1.5 opacity-60" />
                    <p className="text-xs text-slate-400 font-medium">No other birthdays this week.</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Check the monthly view for upcoming dates.</p>
                  </div>
                ) : (
                  displayedBirthdays
                    .filter(b => b.relativeTime !== 'today' || displayedBirthdays.length === 1)
                    .map((item) => {
                      const isWished = wishedEmpIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          id={`birthday-item-${item.id}`}
                          className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                            item.isThisWeek
                              ? 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5 hover:border-pink-500/20'
                              : 'bg-white/[0.015] hover:bg-white/[0.04] border-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                              {item.avatar ? (
                                <img
                                  src={item.avatar}
                                  alt={item.name}
                                  className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10 group-hover:ring-pink-400/50 transition-all"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold flex items-center justify-center text-xs">
                                  {item.avatarInitials || item.name.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs font-bold text-white truncate group-hover:text-pink-300 transition-colors">
                                  {item.name}
                                </p>
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                                  item.relativeTime === 'today'
                                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                                    : item.relativeTime === 'tomorrow'
                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                    : item.isThisWeek
                                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/25'
                                    : 'bg-slate-500/15 text-slate-400 border-slate-500/20'
                                }`}>
                                  {item.countdown}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                <span className="text-slate-300 font-medium">{item.date}</span>
                                <span>•</span>
                                <span className="truncate">{item.department}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="shrink-0">
                            <button
                              id={`btn-wish-emp-${item.id}`}
                              onClick={() => {
                                if (isWished) {
                                  handleSendWish(item.id, item.name, 'Sending extra celebration wishes! 💖');
                                } else {
                                  setActiveWishModal({
                                    id: item.id,
                                    empId: item.empId,
                                    name: item.name,
                                    role: item.role,
                                    department: item.department,
                                    avatar: item.avatar,
                                    avatarInitials: item.avatarInitials,
                                    date: item.date,
                                    dayLabel: item.dayLabel,
                                    relativeTime: item.relativeTime,
                                    defaultWish: item.defaultWish
                                  });
                                  setCustomWishMsg(item.defaultWish);
                                }
                              }}
                              className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                isWished
                                  ? 'bg-pink-500/15 text-pink-300 border border-pink-500/30 hover:bg-pink-500/25'
                                  : 'bg-white/[0.04] hover:bg-pink-600/20 text-slate-300 hover:text-pink-300 border border-white/5 hover:border-pink-500/30'
                              }`}
                              title={isWished ? 'Wished! Click to send another cheer' : `Send Birthday Wishes to ${item.name}`}
                            >
                              {isWished ? (
                                <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
                              ) : (
                                <Gift className="w-3.5 h-3.5 text-pink-400" />
                              )}
                              <span className="hidden sm:inline text-[11px] font-medium">
                                {isWished ? 'Wished' : 'Wish'}
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* Birthday Footer */}
            <div className="pt-3 border-t border-white/5 text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cake className="w-3.5 h-3.5 text-pink-400" />
                <span>{upcomingBirthdays.length} birthdays in May</span>
              </span>
              <button
                onClick={() => onNavigate('employees')}
                className="text-pink-400 hover:text-pink-300 font-semibold cursor-pointer transition-colors"
              >
                View Directory →
              </button>
            </div>
          </div>

          {/* Upcoming Events */}
          <div id="widget-upcoming-events" className="glass-panel p-5 rounded-3xl border border-white/5 space-y-4 flex flex-col justify-between">
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

      {/* Birthday Celebration Toast Notification */}
      {birthdayToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#131b2e]/95 backdrop-blur-md border border-pink-500/40 text-white p-4 rounded-2xl shadow-2xl shadow-pink-900/30 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center justify-center shrink-0 text-base">
            🎂
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Birthday Greeting Broadcasted
            </p>
            <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{birthdayToast}</p>
          </div>
          <button
            onClick={() => setBirthdayToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Interactive Birthday Greeting Modal */}
      {activeWishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131b2e] border border-pink-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl shadow-pink-900/30 relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-36 h-36 bg-pink-500/15 rounded-full blur-2xl pointer-events-none" />
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/30 text-pink-400 flex items-center justify-center text-lg">
                  🎉
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Send Birthday Wishes</h3>
                  <p className="text-xs text-slate-400">Share team celebration cheer</p>
                </div>
              </div>
              <button
                onClick={() => setActiveWishModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Recipient Card */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3.5">
              {activeWishModal.avatar ? (
                <img
                  src={activeWishModal.avatar}
                  alt={activeWishModal.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-pink-400/60"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-pink-500/20 border border-pink-400 text-pink-200 font-bold flex items-center justify-center text-sm">
                  {activeWishModal.avatarInitials || activeWishModal.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white">{activeWishModal.name}</h4>
                <p className="text-xs text-slate-300">{activeWishModal.role} • {activeWishModal.department}</p>
                <span className="text-[10px] text-pink-300 font-semibold mt-1 inline-flex items-center gap-1 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                  <Cake className="w-2.5 h-2.5" /> Birthday: {activeWishModal.date}
                </span>
              </div>
            </div>

            {/* Preset Wish Chips */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Choose Quick Wish or Customize:</label>
              <div className="space-y-1.5">
                {[
                  `🎉 Happy Birthday ${activeWishModal.name}! Wishing you a wonderful year of success and happiness! 🎂`,
                  `🌟 Hope you have an incredible celebration today! Cheers from the team! 🚀🥂`,
                  `🎂 Wishing you health, joy, and wonderful moments ahead! Have a fantastic day! 🎈✨`
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomWishMsg(preset)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border cursor-pointer ${
                      customWishMsg === preset
                        ? 'bg-pink-500/20 border-pink-500/50 text-pink-200'
                        : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5 text-slate-300'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Message Area */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Personalized Greeting:</label>
              <textarea
                value={customWishMsg}
                onChange={(e) => setCustomWishMsg(e.target.value)}
                placeholder="Write your custom birthday greeting..."
                rows={3}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActiveWishModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSendWish(activeWishModal.id, activeWishModal.name, customWishMsg)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-purple-500 shadow-lg shadow-pink-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Birthday Wishes 🎉</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
