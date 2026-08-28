import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Pin, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Users, 
  UserCheck, 
  Shield, 
  Building2, 
  Tag, 
  ChevronRight, 
  Layers, 
  Kanban, 
  ListFilter, 
  Eye, 
  Flame, 
  Info,
  Check,
  X,
  User,
  ArrowRight,
  Briefcase
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TaskItem, TaskAssignee, UserRole, Employee, UserProfile } from '../types';

interface TaskManagementViewProps {
  tasks: TaskItem[];
  employees: Employee[];
  currentUser: UserProfile;
  onAddTask: (task: Partial<TaskItem>) => void;
  onToggleTask: (id: string) => void;
  onTogglePinTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTaskStatus?: (id: string, status: TaskItem['status']) => void;
  onNavigate: (view: any) => void;
}

export const TaskManagementView: React.FC<TaskManagementViewProps> = ({
  tasks,
  employees,
  currentUser,
  onAddTask,
  onToggleTask,
  onTogglePinTask,
  onDeleteTask,
  onUpdateTaskStatus,
  onNavigate
}) => {
  // Role simulation switcher (enables testing Admin, Manager, and Employee task perspectives)
  const [activeRole, setActiveRole] = useState<UserRole>(currentUser.roleType || 'admin');
  
  // View & Filter States
  const [viewMode, setViewMode] = useState<'board' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'all' | 'assigned-to-me' | 'assigned-by-me' | 'in-progress' | 'completed'>('all');
  
  // Modal & Drawer States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<TaskItem | null>(null);

  // Form State for Creating / Assigning a Task
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formPriority, setFormPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');
  const [formDueDate, setFormDueDate] = useState('Tomorrow');
  const [formAssigneeId, setFormAssigneeId] = useState('');
  const [formTags, setFormTags] = useState('HR Workflow');

  // Categories list
  const categories = ['All', 'Leave', 'Performance', 'Payroll', 'Recruitment', 'Engineering', 'Design', 'Onboarding', 'Compliance', 'General'];
  const departments = ['All', 'Design', 'Engineering', 'Marketing', 'HR', 'Finance', 'Operations', 'Sales'];

  // Current simulation user profile derived from active role
  const simulatedUser = {
    id: activeRole === 'admin' ? 'emp-1' : activeRole === 'manager' ? 'emp-4' : 'emp-2',
    name: activeRole === 'admin' ? 'Ayon Ahmed' : activeRole === 'manager' ? 'Sarah Jenkins' : 'Rahim Uddin',
    role: activeRole === 'admin' ? 'Lead UI/UX Designer & Admin' : activeRole === 'manager' ? 'VP of Product Design' : 'Senior Software Engineer',
    roleType: activeRole,
    department: activeRole === 'admin' ? 'Design' : activeRole === 'manager' ? 'Design' : 'Engineering',
    avatar: activeRole === 'admin' 
      ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQndi0Q67LuyTUAs8C_7ptSSpWoFH67QhVbLxfJfqqymbTF0-ImTvZteCBSvRhku41rEwtRkkZ2yuI6nQmZb0BfCOfoZGNID_PEOn4VWAWuKVpWR7Ik8bXButYDHroiVhejf7BUJNlr5RCQjELnvfecxNjb3pdO-wFiNm8ZRyrk3KjzJktBW6t2HdB8uvLEdFXWKFvdGX3obC3EyYo3QUO3PVDq-c-ap2YZgHP_1pncDG6fIUYwwl'
      : activeRole === 'manager'
      ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGYbO589VOTATEVvsbR5nyyOSwLBLuKXOxbFTAMEVyEEoVKEAscptTr1Fw8iGYSdAB1g1J5Y2Vx6y8Ypywrc1QuHnwiu6JKqVnuiQ75E-Zl1lklVnZju58LXg4EI6rxi76D29F_QaeZ2oRg09f6FoJmK_QL6Z8b3aMDi0bl53XwFkCgcHB8gkqEbh1qkmBlu_dlAs6b6vNmeVUXXkWqoQmRb8581biV9eH9oJ2xg2_FZghdAbak5L'
      : 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSANbGI_8XJwr4JerK2U_S85Z10-Lhe_dnK9SL5j7CA7A78CwnhHQHcY4OfNOr2pDaW9hgOkTqKBCWPZ9PSSR9sfz9ljGdJCaRFTtYFjjW-EeDaH4Lb7pSfNCRoyGbmvg9LYJvJf4XTU2H0-vTX1OncSoyHd9Yq1BjbrpoWB6up8qQOivnc3S9AK11f-bL5xi6YcXHd-lgU3gKTaGFvNAZXYG0H5_OaDSz4Vlg_JLyRbeFO6H7cJrv'
  };

  // Check role-based assignment eligibility for assignee dropdown:
  // - Admin can assign to Managers and Employees
  // - Manager can assign to Employees only
  // - Employee cannot assign tasks
  const eligibleAssignees = employees.filter(emp => {
    // Determine whether employee is manager or regular employee
    const isManager = emp.designation.includes('VP') || emp.designation.includes('Lead') || emp.designation.includes('Officer') || emp.designation.includes('Director') || emp.designation.includes('CTO');
    
    if (activeRole === 'admin') {
      return true; // Admin can assign to everyone
    }
    if (activeRole === 'manager') {
      // Manager can assign tasks to Employees only (not other managers or admins)
      return !isManager && emp.id !== simulatedUser.id;
    }
    return false;
  });

  // Filter tasks strictly according to user permissions:
  // - Admin can view and manage all tasks across the organization.
  // - Manager can view their own assigned tasks and tasks of employees under them / in their department.
  // - Employee can view and update only their own assigned tasks.
  const accessibleTasks = tasks.filter(task => {
    if (activeRole === 'admin') return true;
    if (activeRole === 'manager') {
      const isAssignedToMe = task.assignedTo?.id === simulatedUser.id || task.assignedTo?.name === simulatedUser.name;
      const isAssignedByMe = task.assignedBy?.id === simulatedUser.id || task.assignedBy?.name === simulatedUser.name;
      const isInMyDept = task.department === simulatedUser.department || task.assignedTo?.department === simulatedUser.department;
      return isAssignedToMe || isAssignedByMe || isInMyDept;
    }
    if (activeRole === 'employee') {
      // Employee can view only their own assigned tasks
      return task.assignedTo?.id === simulatedUser.id || task.assignedTo?.name === simulatedUser.name;
    }
    return false;
  });

  // Apply tab filters
  const tabFilteredTasks = accessibleTasks.filter(task => {
    if (activeTab === 'assigned-to-me') {
      return task.assignedTo?.id === simulatedUser.id || task.assignedTo?.name === simulatedUser.name;
    }
    if (activeTab === 'assigned-by-me') {
      return task.assignedBy?.id === simulatedUser.id || task.assignedBy?.name === simulatedUser.name;
    }
    if (activeTab === 'in-progress') {
      return !task.completed && (task.status === 'In Progress' || task.status === 'Under Review');
    }
    if (activeTab === 'completed') {
      return task.completed || task.status === 'Completed';
    }
    return true;
  });

  // Apply search and category / priority / department dropdown filters
  const filteredTasks = tabFilteredTasks.filter(task => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchAssignee = task.assignedTo?.name.toLowerCase().includes(q);
      const matchCategory = task.category?.toLowerCase().includes(q);
      const matchTags = task.tags?.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchAssignee && !matchCategory && !matchTags) return false;
    }
    // Category
    if (selectedCategory !== 'All' && (task.category || 'General').toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    // Priority
    if (selectedPriority !== 'All' && (task.priority || 'medium').toLowerCase() !== selectedPriority.toLowerCase()) {
      return false;
    }
    // Department
    if (selectedDepartment !== 'All' && (task.department || task.assignedTo?.department || '').toLowerCase() !== selectedDepartment.toLowerCase()) {
      return false;
    }
    return true;
  });

  // Sort tasks: pinned first, then by priority, then by completed status
  const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const aP = priorityWeight[a.priority || 'medium'] || 2;
    const bP = priorityWeight[b.priority || 'medium'] || 2;
    return bP - aP;
  });

  // Metrics
  const totalInScope = accessibleTasks.length;
  const completedInScope = accessibleTasks.filter(t => t.completed || t.status === 'Completed').length;
  const inProgressInScope = accessibleTasks.filter(t => !t.completed && (t.status === 'In Progress' || t.status === 'Under Review')).length;
  const urgentInScope = accessibleTasks.filter(t => !t.completed && (t.priority === 'urgent' || t.priority === 'high')).length;
  const completionRate = totalInScope > 0 ? Math.round((completedInScope / totalInScope) * 100) : 0;

  // Handle Task Creation Submit
  const handleAssignTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (activeRole === 'employee') {
      alert('Permission Denied: Employees cannot assign tasks.');
      return;
    }

    const targetEmp = employees.find(e => e.id === formAssigneeId) || eligibleAssignees[0] || employees[0];
    const isTargetManager = targetEmp.designation.includes('VP') || targetEmp.designation.includes('Lead') || targetEmp.designation.includes('Officer') || targetEmp.designation.includes('Director');

    const newTaskPayload: Partial<TaskItem> = {
      id: `task-${Date.now()}`,
      title: formTitle.trim(),
      description: formDescription.trim() || 'Standard operational task assignment.',
      completed: false,
      status: 'Pending',
      pinned: false,
      priority: formPriority,
      category: formCategory,
      dueDate: formDueDate,
      createdAt: 'Just now',
      department: targetEmp.department || 'Operations',
      assignedTo: {
        id: targetEmp.id,
        name: targetEmp.name,
        role: targetEmp.designation,
        roleType: isTargetManager ? 'manager' : 'employee',
        department: targetEmp.department,
        avatar: targetEmp.avatar
      },
      assignedBy: {
        id: simulatedUser.id,
        name: simulatedUser.name,
        role: simulatedUser.role,
        roleType: simulatedUser.roleType,
        avatar: simulatedUser.avatar
      },
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean)
    };

    onAddTask(newTaskPayload);
    setIsAssignModalOpen(false);
    setFormTitle('');
    setFormDescription('');
    setFormTags('HR Workflow');
  };

  // Status Change Handler with fallback
  const handleStatusChange = (taskId: string, newStatus: TaskItem['status']) => {
    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(taskId, newStatus);
    } else {
      if (newStatus === 'Completed') {
        const task = tasks.find(t => t.id === taskId);
        if (task && !task.completed) {
          onToggleTask(taskId);
        }
      } else {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.completed) {
          onToggleTask(taskId);
        }
      }
    }
    if (newStatus === 'Completed') {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    }
  };

  const getPriorityBadgeClass = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'low':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  const getStatusBadgeClass = (status?: string, completed?: boolean) => {
    if (completed || status === 'Completed') {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
    if (status === 'In Progress') {
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
    if (status === 'Under Review') {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
    return 'bg-white/5 text-slate-300 border-white/10';
  };

  return (
    <div id="task-management-module" className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Module Header & Role Permissions Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/30 ring-1 ring-white/20">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-white tracking-tight font-['Sora']">Task Management</h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Role-Governed
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Enterprise workflow assignment, delegation, and completion tracking with hierarchical role permissions.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Role Simulator */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Active Role Simulation Switcher */}
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-2xl border border-white/10 shadow-inner">
            <span className="text-[11px] text-slate-400 font-semibold px-2 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-purple-400" /> Role:
            </span>
            {(['admin', 'manager', 'employee'] as const).map((roleKey) => {
              const isActive = activeRole === roleKey;
              return (
                <button
                  key={roleKey}
                  id={`btn-role-switch-${roleKey}`}
                  onClick={() => setActiveRole(roleKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    isActive
                      ? roleKey === 'admin'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : roleKey === 'manager'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {roleKey}
                </button>
              );
            })}
          </div>

          {/* Assign Task Button (Allowed for Admin & Manager, Hidden/Disabled for Employee) */}
          {activeRole !== 'employee' ? (
            <button
              id="btn-assign-new-task"
              onClick={() => {
                if (eligibleAssignees.length > 0) {
                  setFormAssigneeId(eligibleAssignees[0].id);
                }
                setIsAssignModalOpen(true);
              }}
              className="brand-gradient-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Assign New Task</span>
            </button>
          ) : (
            <div 
              title="Employees have read & update access to their own tasks and cannot assign new tasks"
              className="px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 cursor-not-allowed"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Employee Scope (Read & Update Only)</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Role Governance Information Banner */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-gradient-to-r from-purple-950/20 via-[#131b2e] to-indigo-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">
                Viewing as {simulatedUser.name}
              </span>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {activeRole.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {activeRole === 'admin' && 'Full Administrative Access: Admin can assign tasks to Managers & Employees, and manage all organization tasks.'}
              {activeRole === 'manager' && 'Department Scope: Manager can assign tasks to Employees only and view tasks under their department.'}
              {activeRole === 'employee' && 'Individual Scope: Employee cannot assign tasks; can view and update their own assigned tasks.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <span className="text-[11px] text-slate-400">Total in Scope:</span>
          <span className="text-xs font-bold text-white font-['Sora'] px-2 py-0.5 rounded bg-white/10">
            {totalInScope} Tasks
          </span>
        </div>
      </div>

      {/* 3. Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Tasks in Scope</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white font-['Sora']">{totalInScope}</p>
            <span className="text-[11px] text-purple-300">
              {activeRole === 'admin' ? 'Company-wide' : activeRole === 'manager' ? 'Dept & Assigned' : 'Assigned to Me'}
            </span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(100, totalInScope * 12)}%` }} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Completion Rate</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-emerald-400 font-['Sora']">{completionRate}%</p>
            <span className="text-[11px] text-slate-400">
              {completedInScope} of {totalInScope} resolved
            </span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">In Progress / Pending</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-blue-400 font-['Sora']">{inProgressInScope}</p>
            <span className="text-[11px] text-slate-400">Active workflows</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${totalInScope > 0 ? (inProgressInScope / totalInScope) * 100 : 0}%` }} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Urgent & High Priority</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-rose-400 font-['Sora']">{urgentInScope}</p>
            <span className="text-[11px] text-rose-300">Requires attention</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${totalInScope > 0 ? (urgentInScope / totalInScope) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* 4. Filter Toolbar & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3">
        {/* Top row: Tab selector + Layout Toggle + Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Scope Tabs */}
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
            <button
              id="tab-tasks-all"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {activeRole === 'admin' ? 'All Organization Tasks' : activeRole === 'manager' ? 'All Department Tasks' : 'All My Tasks'}
            </button>

            {activeRole !== 'employee' && (
              <button
                id="tab-tasks-assigned-by-me"
                onClick={() => setActiveTab('assigned-by-me')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'assigned-by-me'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Assigned By Me
              </button>
            )}

            <button
              id="tab-tasks-assigned-to-me"
              onClick={() => setActiveTab('assigned-to-me')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'assigned-to-me'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Assigned To Me
            </button>

            <button
              id="tab-tasks-in-progress"
              onClick={() => setActiveTab('in-progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'in-progress'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              In Progress
            </button>

            <button
              id="tab-tasks-completed"
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Completed ({completedInScope})
            </button>
          </div>

          {/* Right Controls: Search + Board/List switch */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="input-task-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks, assignees, tags..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
              <button
                id="btn-layout-list"
                onClick={() => setViewMode('list')}
                title="List View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
              </button>
              <button
                id="btn-layout-board"
                onClick={() => setViewMode('board')}
                title="Kanban Board View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'board' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom row: Category Pills & Dropdown Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-white/5">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-purple-400" /> Category:
            </span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  id={`btn-cat-filter-${cat.toLowerCase()}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-sm'
                      : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Priority & Dept Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority Filter */}
            <div className="flex items-center gap-1 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/5 text-xs">
              <span className="text-[11px] text-slate-400">Priority:</span>
              <select
                id="select-filter-priority"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-transparent text-xs text-purple-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-[#131b2e] text-slate-300">All</option>
                <option value="urgent" className="bg-[#131b2e] text-rose-300">Urgent</option>
                <option value="high" className="bg-[#131b2e] text-amber-300">High</option>
                <option value="medium" className="bg-[#131b2e] text-purple-300">Medium</option>
                <option value="low" className="bg-[#131b2e] text-slate-400">Low</option>
              </select>
            </div>

            {/* Department Filter (Visible for Admin & Manager) */}
            {activeRole !== 'employee' && (
              <div className="flex items-center gap-1 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/5 text-xs">
                <span className="text-[11px] text-slate-400">Dept:</span>
                <select
                  id="select-filter-department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="bg-transparent text-xs text-purple-200 font-semibold focus:outline-none cursor-pointer"
                >
                  {departments.map(d => (
                    <option key={d} value={d} className="bg-[#131b2e] text-slate-300">{d}</option>
                  ))}
                </select>
              </div>
            )}

            {(selectedCategory !== 'All' || selectedPriority !== 'All' || selectedDepartment !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedPriority('All');
                  setSelectedDepartment('All');
                  setSearchQuery('');
                }}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline px-1.5 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Main Task Content: List View vs Kanban Board View */}
      {viewMode === 'list' ? (
        <div className="space-y-2.5">
          {sortedTasks.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-white/5 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">No Tasks Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {activeRole === 'employee'
                  ? 'You currently have no tasks matching this filter. Once assigned by an Admin or Manager, they will appear here.'
                  : 'No tasks match your active filter criteria. Use the "Assign New Task" button above to delegate new tasks.'}
              </p>
              {activeRole !== 'employee' && (
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="brand-gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Assign a Task
                </button>
              )}
            </div>
          ) : (
            sortedTasks.map((task) => {
              const isAssignedToCurrent = task.assignedTo?.id === simulatedUser.id || task.assignedTo?.name === simulatedUser.name;
              const isAssignedByCurrent = task.assignedBy?.id === simulatedUser.id || task.assignedBy?.name === simulatedUser.name;
              const canEditStatus = activeRole === 'admin' || isAssignedToCurrent || isAssignedByCurrent;
              const canDelete = activeRole === 'admin' || (activeRole === 'manager' && isAssignedByCurrent);

              return (
                <div
                  key={task.id}
                  id={`task-row-${task.id}`}
                  className={`glass-panel p-4 rounded-2xl border transition-all hover:border-purple-500/30 group ${
                    task.completed
                      ? 'bg-white/[0.01] border-white/5 opacity-75'
                      : task.pinned
                      ? 'bg-purple-950/10 border-purple-500/30'
                      : 'border-white/5 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Checkbox + Title + Description + Tags */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Checkbox */}
                      <button
                        id={`btn-check-task-${task.id}`}
                        onClick={() => onToggleTask(task.id)}
                        title={task.completed ? 'Mark as incomplete' : 'Mark as completed'}
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 mt-0.5 cursor-pointer ${
                          task.completed
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                            : 'border border-white/20 hover:border-purple-400 bg-white/5'
                        }`}
                      >
                        {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 
                            onClick={() => setSelectedTaskForDetails(task)}
                            className={`text-xs sm:text-sm font-semibold cursor-pointer transition-colors hover:text-purple-300 ${
                              task.completed ? 'line-through text-slate-500' : 'text-white'
                            }`}
                          >
                            {task.title}
                          </h4>

                          {task.pinned && (
                            <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5">
                              <Pin className="w-2.5 h-2.5 fill-purple-300" /> Pinned
                            </span>
                          )}

                          {/* Priority Badge */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getPriorityBadgeClass(task.priority)}`}>
                            {task.priority || 'medium'}
                          </span>

                          {/* Category Badge */}
                          {task.category && (
                            <button
                              onClick={() => setSelectedCategory(task.category || 'General')}
                              className="text-[10px] text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                            >
                              {task.category}
                            </button>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {task.description}
                          </p>
                        )}

                        {/* Assignee & Assigner Information Badges */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap pt-0.5">
                          {/* Assignee info */}
                          {task.assignedTo && (
                            <div className="flex items-center gap-1.5 bg-white/[0.03] px-2 py-0.5 rounded-lg border border-white/5">
                              {task.assignedTo.avatar ? (
                                <img
                                  src={task.assignedTo.avatar}
                                  alt={task.assignedTo.name}
                                  className="w-4 h-4 rounded-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] flex items-center justify-center">
                                  {task.assignedTo.name.charAt(0)}
                                </div>
                              )}
                              <span className="text-slate-300 font-medium">To: {task.assignedTo.name}</span>
                              <span className="text-[10px] text-purple-300">({task.assignedTo.department})</span>
                            </div>
                          )}

                          {/* Assigner info */}
                          {task.assignedBy && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <span>By:</span>
                              <span className="text-slate-400 font-medium">{task.assignedBy.name}</span>
                              <span className="text-[10px] text-slate-500">({task.assignedBy.roleType})</span>
                            </div>
                          )}

                          {/* Due date */}
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-slate-400">
                              <Calendar className="w-3 h-3 text-purple-400" />
                              <span>Due: {task.dueDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Actions: Status Dropdown + Pin + Delete */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {/* Status Selector */}
                      {canEditStatus ? (
                        <select
                          id={`select-status-${task.id}`}
                          value={task.completed ? 'Completed' : task.status || 'Pending'}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as any)}
                          className={`text-xs font-bold rounded-xl px-2.5 py-1 border focus:outline-none cursor-pointer transition-all ${getStatusBadgeClass(task.status, task.completed)}`}
                        >
                          <option value="Pending" className="bg-[#131b2e] text-slate-300">Pending</option>
                          <option value="In Progress" className="bg-[#131b2e] text-blue-300">In Progress</option>
                          <option value="Under Review" className="bg-[#131b2e] text-amber-300">Under Review</option>
                          <option value="Completed" className="bg-[#131b2e] text-emerald-300">Completed</option>
                        </select>
                      ) : (
                        <span className={`text-xs font-bold rounded-xl px-2.5 py-1 border ${getStatusBadgeClass(task.status, task.completed)}`}>
                          {task.completed ? 'Completed' : task.status || 'Pending'}
                        </span>
                      )}

                      {/* Pin button */}
                      <button
                        id={`btn-pin-task-${task.id}`}
                        onClick={() => onTogglePinTask(task.id)}
                        title={task.pinned ? 'Unpin task' : 'Pin task to top'}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          task.pinned
                            ? 'text-purple-400 bg-purple-500/20 border border-purple-500/30'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      {/* Detail View Eye button */}
                      <button
                        id={`btn-detail-task-${task.id}`}
                        onClick={() => setSelectedTaskForDetails(task)}
                        title="View Full Task Details"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button (Admin or Assigner only) */}
                      {canDelete && (
                        <button
                          id={`btn-delete-task-${task.id}`}
                          onClick={() => {
                            if (window.confirm(`Delete task "${task.title}"?`)) {
                              onDeleteTask(task.id);
                            }
                          }}
                          title="Delete task"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Pending */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3 bg-white/[0.01]">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="text-xs font-bold text-white">Pending</span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                {sortedTasks.filter(t => !t.completed && (!t.status || t.status === 'Pending')).length}
              </span>
            </div>

            <div className="space-y-2.5">
              {sortedTasks
                .filter(t => !t.completed && (!t.status || t.status === 'Pending'))
                .map(task => (
                  <div 
                    key={task.id}
                    onClick={() => setSelectedTaskForDetails(task)}
                    className="p-3.5 rounded-xl bg-[#131b2e] border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority || 'medium'}
                      </span>
                      <span className="text-[10px] text-slate-400">{task.dueDate}</span>
                    </div>
                    <p className="text-xs font-semibold text-white line-clamp-2">{task.title}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                      <span>To: {task.assignedTo?.name || 'Unassigned'}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(task.id, 'In Progress');
                        }}
                        className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-0.5"
                      >
                        Start <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 2: In Progress / Review */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3 bg-white/[0.01]">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span className="text-xs font-bold text-white">In Progress</span>
              </div>
              <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                {sortedTasks.filter(t => !t.completed && (t.status === 'In Progress' || t.status === 'Under Review')).length}
              </span>
            </div>

            <div className="space-y-2.5">
              {sortedTasks
                .filter(t => !t.completed && (t.status === 'In Progress' || t.status === 'Under Review'))
                .map(task => (
                  <div 
                    key={task.id}
                    onClick={() => setSelectedTaskForDetails(task)}
                    className="p-3.5 rounded-xl bg-[#131b2e] border border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority || 'medium'}
                      </span>
                      <span className="text-[10px] text-blue-300">{task.dueDate}</span>
                    </div>
                    <p className="text-xs font-semibold text-white line-clamp-2">{task.title}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                      <span>To: {task.assignedTo?.name || 'Unassigned'}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(task.id, 'Completed');
                        }}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5"
                      >
                        Complete <Check className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3 bg-white/[0.01]">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-white">Completed</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {sortedTasks.filter(t => t.completed || t.status === 'Completed').length}
              </span>
            </div>

            <div className="space-y-2.5">
              {sortedTasks
                .filter(t => t.completed || t.status === 'Completed')
                .map(task => (
                  <div 
                    key={task.id}
                    onClick={() => setSelectedTaskForDetails(task)}
                    className="p-3.5 rounded-xl bg-[#131b2e]/60 border border-emerald-500/20 hover:border-emerald-500/40 opacity-80 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Resolved
                      </span>
                      <span className="text-[10px] text-slate-500">{task.dueDate}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-300 line-through line-clamp-2">{task.title}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5">
                      <span>Done by {task.assignedTo?.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. ASSIGN NEW TASK MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 bg-[#131b2e] shadow-2xl p-6 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Assign New Task</h3>
                  <p className="text-[11px] text-slate-400">
                    {activeRole === 'admin' 
                      ? 'Admin Scope: Can assign tasks to Managers and Employees' 
                      : 'Manager Scope: Can assign tasks to Employees only'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAssignTaskSubmit} className="space-y-4">
              {/* Task Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  Task Title <span className="text-rose-400">*</span>
                </label>
                <input
                  id="modal-input-task-title"
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Audit Q2 employee compliance certifications"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Task Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Detailed Instructions / Objective
                </label>
                <textarea
                  id="modal-input-task-description"
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Outline key deliverables, dependencies, or sign-off criteria..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Assignee Selector (Enforcing Role Governance) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Assign To (Eligible Workforce) <span className="text-rose-400">*</span></span>
                  <span className="text-[10px] text-purple-400">
                    {activeRole === 'manager' ? 'Employees Only' : 'Managers & Employees'}
                  </span>
                </label>
                <select
                  id="modal-select-task-assignee"
                  required
                  value={formAssigneeId}
                  onChange={(e) => setFormAssigneeId(e.target.value)}
                  className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {eligibleAssignees.map(emp => {
                    const isMgr = emp.designation.includes('VP') || emp.designation.includes('Lead') || emp.designation.includes('Officer');
                    return (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} — {emp.designation} ({emp.department}) {isMgr ? '[Manager]' : '[Employee]'}
                      </option>
                    );
                  })}
                </select>
                {activeRole === 'manager' && (
                  <p className="text-[10px] text-slate-500">
                    Rule enforced: As a Manager, you can delegate tasks to Employees only.
                  </p>
                )}
              </div>

              {/* Category, Priority & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    id="modal-select-task-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="General">General</option>
                    <option value="Leave">Leave</option>
                    <option value="Performance">Performance</option>
                    <option value="Payroll">Payroll</option>
                    <option value="Recruitment">Recruitment</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Design">Design</option>
                    <option value="Engineering">Engineering</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Priority</label>
                  <select
                    id="modal-select-task-priority"
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Due Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Due Date</label>
                  <select
                    id="modal-select-task-duedate"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Today">Today</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="Friday">This Friday</option>
                    <option value="Next Week">Next Week</option>
                    <option value="End of Month">End of Month</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="e.g. Audit, Priority, Compliance"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  id="btn-modal-submit-task"
                  type="submit"
                  className="brand-gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  Confirm & Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. TASK DETAILS DRAWER / MODAL */}
      {selectedTaskForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 bg-[#131b2e] shadow-2xl p-6 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getPriorityBadgeClass(selectedTaskForDetails.priority)}`}>
                    {selectedTaskForDetails.priority || 'medium'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(selectedTaskForDetails.status, selectedTaskForDetails.completed)}`}>
                    {selectedTaskForDetails.completed ? 'Completed' : selectedTaskForDetails.status || 'Pending'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedTaskForDetails.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTaskForDetails(null)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-4 text-xs">
              {/* Description */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400">Description / Scope</span>
                <p className="text-slate-200 leading-relaxed">
                  {selectedTaskForDetails.description || 'No additional notes provided for this task.'}
                </p>
              </div>

              {/* Assignment Information Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Assignee */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Assigned To</span>
                  {selectedTaskForDetails.assignedTo ? (
                    <div className="flex items-center gap-2">
                      {selectedTaskForDetails.assignedTo.avatar && (
                        <img 
                          src={selectedTaskForDetails.assignedTo.avatar} 
                          alt="" 
                          className="w-6 h-6 rounded-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div>
                        <p className="text-xs font-bold text-white">{selectedTaskForDetails.assignedTo.name}</p>
                        <p className="text-[10px] text-purple-300">{selectedTaskForDetails.assignedTo.role}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400">Unassigned</p>
                  )}
                </div>

                {/* Assigner */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Assigned By</span>
                  {selectedTaskForDetails.assignedBy ? (
                    <div>
                      <p className="text-xs font-bold text-white">{selectedTaskForDetails.assignedBy.name}</p>
                      <p className="text-[10px] text-slate-400">{selectedTaskForDetails.assignedBy.role}</p>
                    </div>
                  ) : (
                    <p className="text-slate-400">System Admin</p>
                  )}
                </div>
              </div>

              {/* Due Date & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase">Due Date</span>
                  <p className="text-xs font-bold text-white mt-0.5">{selectedTaskForDetails.dueDate || 'Flexible'}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase">Category</span>
                  <p className="text-xs font-bold text-purple-300 mt-0.5">{selectedTaskForDetails.category || 'General'}</p>
                </div>
              </div>

              {/* Tags */}
              {selectedTaskForDetails.tags && selectedTaskForDetails.tags.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">Workflow Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTaskForDetails.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update Quick Action */}
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                <span className="text-xs font-bold text-white">Update Status</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {(['Pending', 'In Progress', 'Under Review', 'Completed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        handleStatusChange(selectedTaskForDetails.id, st);
                        setSelectedTaskForDetails({ ...selectedTaskForDetails, status: st, completed: st === 'Completed' });
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        (selectedTaskForDetails.completed && st === 'Completed') || (!selectedTaskForDetails.completed && selectedTaskForDetails.status === st)
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => setSelectedTaskForDetails(null)}
                className="brand-gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
