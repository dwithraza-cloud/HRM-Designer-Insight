import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { EmployeeManagementView } from './components/EmployeeManagementView';
import { EmployeeDetailView } from './components/EmployeeDetailView';
import { AddEmployeeView } from './components/AddEmployeeView';
import { RecruitmentView } from './components/RecruitmentView';
import { AttendanceView } from './components/AttendanceView';
import { LeaveManagementView } from './components/LeaveManagementView';
import { PerformanceView } from './components/PerformanceView';
import { PayrollView } from './components/PayrollView';
import { TaskManagementView } from './components/TaskManagementView';
import { OtherViews } from './components/OtherViews';
import { AuthView } from './components/AuthView';
import { AccessDeniedView } from './components/AccessDeniedView';
import { 
  ApplyLeaveModal, 
  DownloadReportModal, 
  SupportModal, 
  GlobalSearchModal 
} from './components/Modals';
import { 
  ADMIN_USER,
  MANAGER_USER,
  EMPLOYEE_USER,
  INITIAL_EMPLOYEES, 
  INITIAL_LEAVE_REQUESTS, 
  INITIAL_ATTENDANCE, 
  INITIAL_JOB_OPENINGS, 
  UPCOMING_EVENTS, 
  RECENT_ACTIVITIES, 
  NOTIFICATIONS,
  INITIAL_TASKS
} from './data/initialData';
import { ViewMode, Employee, LeaveRequest, JobOpening, UserRole, TaskItem, UserProfile } from './types';
import { authService } from './services/authService';

export function App() {
  // Navigation & Authentication - strictly require login on app launch
  const initialSession = authService.getActiveSession();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!initialSession);
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => initialSession || ADMIN_USER);
  const [currentView, setCurrentView] = useState<ViewMode>(() => initialSession ? 'dashboard' : 'auth-login');

  // Core Data State
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee>(INITIAL_EMPLOYEES[0]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>(INITIAL_JOB_OPENINGS);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [attendanceRecords] = useState(INITIAL_ATTENDANCE);
  const [upcomingEvents] = useState(UPCOMING_EVENTS);
  const [activities, setActivities] = useState(RECENT_ACTIVITIES);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  // Modals
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);
  const [isDownloadReportOpen, setIsDownloadReportOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Toast Notification state
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  // Keyboard shortcut for Cmd/Ctrl+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // RBAC Action Handlers with Authorization Checks
  const handleSaveEmployee = (newEmp: Employee) => {
    if (currentUser.roleType !== 'admin') {
      showToast('⚠️ Access Denied (403): Only Admins can register new employee accounts.');
      return;
    }
    setEmployees(prev => [newEmp, ...prev]);
    setSelectedEmployee(newEmp);
    setActivities(prev => [
      {
        id: `act-${Date.now()}`,
        type: 'employee',
        highlightedText: newEmp.name,
        description: `was registered as ${newEmp.designation} in ${newEmp.department}`,
        timestamp: 'Just now'
      },
      ...prev
    ]);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    showToast(`Employee ${newEmp.name} registered successfully!`);
    setCurrentView('employee-detail');
  };

  const handleDeleteEmployee = (id: string) => {
    if (currentUser.roleType !== 'admin') {
      showToast('⚠️ Access Denied (403): Only Admins can delete employee records.');
      return;
    }
    const emp = employees.find(e => e.id === id);
    if (window.confirm(`Are you sure you want to delete ${emp?.name || 'this employee'}?`)) {
      setEmployees(prev => prev.filter(e => e.id !== id));
      showToast(`Employee record removed.`);
    }
  };

  const handleApplyLeave = (newLeave: LeaveRequest) => {
    setLeaveRequests(prev => [newLeave, ...prev]);
    setActivities(prev => [
      {
        id: `act-${Date.now()}`,
        type: 'leave',
        highlightedText: newLeave.employeeName,
        description: `submitted a ${newLeave.leaveType} application (${newLeave.duration})`,
        timestamp: 'Just now'
      },
      ...prev
    ]);
    showToast(`Leave application submitted for approval.`);
  };

  const handleApproveLeave = (id: string) => {
    if (currentUser.roleType === 'employee') {
      showToast('⚠️ Access Denied (403): Employees cannot approve leave requests.');
      return;
    }
    const targetLeave = leaveRequests.find(r => r.id === id);
    if (currentUser.roleType === 'manager' && targetLeave && targetLeave.department !== currentUser.department) {
      showToast(`⚠️ Access Denied: Managers can only approve leave requests for the ${currentUser.department} department.`);
      return;
    }
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    showToast(`Leave request approved.`);
  };

  const handleRejectLeave = (id: string) => {
    if (currentUser.roleType === 'employee') {
      showToast('⚠️ Access Denied (403): Employees cannot reject leave requests.');
      return;
    }
    const targetLeave = leaveRequests.find(r => r.id === id);
    if (currentUser.roleType === 'manager' && targetLeave && targetLeave.department !== currentUser.department) {
      showToast(`⚠️ Access Denied: Managers can only reject leave requests for the ${currentUser.department} department.`);
      return;
    }
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
    showToast(`Leave request rejected.`);
  };

  const handleAddJob = (job: JobOpening) => {
    if (currentUser.roleType === 'employee') {
      showToast('⚠️ Access Denied (403): Employees cannot post job openings.');
      return;
    }
    setJobOpenings(prev => [job, ...prev]);
    showToast(`New job posting "${job.title}" created.`);
  };

  const handleAddTask = (
    titleOrTask: string | Partial<TaskItem>,
    priority: 'high' | 'medium' | 'low' | 'urgent' = 'medium',
    category = 'HR Action'
  ) => {
    if (typeof titleOrTask === 'string') {
      if (!titleOrTask.trim()) return;
      const newTask: TaskItem = {
        id: `task-${Date.now()}`,
        title: titleOrTask.trim(),
        completed: false,
        status: 'Pending',
        pinned: false,
        priority,
        category,
        dueDate: 'Today',
        createdAt: 'Just now',
        department: currentUser.department || 'Operations',
        assignedTo: {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          roleType: currentUser.roleType,
          department: currentUser.department,
          avatar: currentUser.avatar
        },
        assignedBy: {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          roleType: currentUser.roleType,
          avatar: currentUser.avatar
        }
      };
      setTasks(prev => [newTask, ...prev]);
      showToast(`Task added: "${newTask.title.slice(0, 30)}${newTask.title.length > 30 ? '...' : ''}"`);
    } else {
      const taskObj = titleOrTask as TaskItem;
      // Role hierarchy assignment check:
      if (currentUser.roleType === 'employee' && taskObj.assignedTo?.id !== currentUser.id) {
        showToast('⚠️ Access Denied: Employees can only create personal tasks.');
        return;
      }
      setTasks(prev => [taskObj, ...prev]);
      showToast(`Task assigned to ${taskObj.assignedTo?.name || 'team member'}`);
    }
  };

  const handleUpdateTaskStatus = (id: string, status: TaskItem['status']) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const completed = status === 'Completed';
        return { ...t, status, completed };
      }
      return t;
    }));
    showToast(`Task status updated to ${status}`);
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        const nextStatus: TaskItem['status'] = nextCompleted ? 'Completed' : 'In Progress';
        if (nextCompleted) {
          confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
          showToast(`Task marked completed!`);
        }
        return { ...t, completed: nextCompleted, status: nextStatus };
      }
      return t;
    }));
  };

  const handleTogglePinTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextPinned = !t.pinned;
        showToast(nextPinned ? `Task pinned to top` : `Task unpinned`);
        return { ...t, pinned: nextPinned };
      }
      return t;
    }));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast(`Task deleted.`);
  };

  const handleAddAttachment = (taskId: string, attachment: any) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const existing = t.attachments || [];
        return {
          ...t,
          attachments: [attachment, ...existing]
        };
      }
      return t;
    }));
    showToast(`Attachment "${attachment.name}" attached to task.`);
  };

  const handleRemoveAttachment = (taskId: string, attachmentId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          attachments: (t.attachments || []).filter(a => a.id !== attachmentId)
        };
      }
      return t;
    }));
    showToast(`Attachment removed.`);
  };

  const handleSendMessage = (emp: Employee) => {
    setIsSupportOpen(true);
  };

  const handleLoginSuccess = (userOrEmail: UserProfile | string, roleParam?: UserRole) => {
    setIsAuthenticated(true);
    let activeUser: UserProfile;

    if (typeof userOrEmail === 'object' && userOrEmail !== null) {
      activeUser = userOrEmail;
    } else {
      const email = userOrEmail;
      const role = roleParam || 'admin';
      if (role === 'admin') activeUser = ADMIN_USER;
      else if (role === 'manager') activeUser = MANAGER_USER;
      else activeUser = EMPLOYEE_USER;
    }

    setCurrentUser(activeUser);
    setCurrentView('dashboard');
    const roleTitle = (activeUser.roleType || 'user').toUpperCase();
    showToast(`Signed in as ${roleTitle} (${activeUser.email || activeUser.name})`);
  };

  const handleSignOut = () => {
    authService.signOut();
    setIsAuthenticated(false);
    setCurrentView('auth-login');
  };

  // Helper to render RBAC guarded view
  const renderCurrentView = () => {
    const roleType = currentUser.roleType || 'admin';

    // 1. Admin-Only Views
    if (['payroll', 'add-employee', 'reports', 'settings', 'admin'].includes(currentView)) {
      if (roleType !== 'admin') {
        return (
          <AccessDeniedView
            currentUser={currentUser}
            requiredRole="admin"
            attemptedView={currentView}
            onNavigate={setCurrentView}
          />
        );
      }
    }

    // 2. Admin & Manager Views (Recruitment)
    if (currentView === 'recruitment' && roleType === 'employee') {
      return (
        <AccessDeniedView
          currentUser={currentUser}
          requiredRole="admin-or-manager"
          attemptedView="recruitment"
          onNavigate={setCurrentView}
        />
      );
    }

    // View Components
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            currentUser={currentUser}
            employees={employees}
            leaveRequests={leaveRequests}
            upcomingEvents={upcomingEvents}
            activities={activities}
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onTogglePinTask={handleTogglePinTask}
            onDeleteTask={handleDeleteTask}
            onNavigate={setCurrentView}
            onOpenApplyLeave={() => setIsApplyLeaveOpen(true)}
          />
        );

      case 'employees':
        return (
          <EmployeeManagementView
            employees={employees}
            currentUser={currentUser}
            onSelectEmployee={setSelectedEmployee}
            onNavigate={setCurrentView}
            onDeleteEmployee={handleDeleteEmployee}
            onExportEmployees={() => setIsDownloadReportOpen(true)}
          />
        );

      case 'employee-detail':
        return (
          <EmployeeDetailView
            employee={selectedEmployee}
            currentUser={currentUser}
            onBack={() => setCurrentView('employees')}
            onNavigate={setCurrentView}
            onSendMessage={handleSendMessage}
          />
        );

      case 'add-employee':
        return (
          <AddEmployeeView
            onBack={() => setCurrentView('employees')}
            onSaveEmployee={handleSaveEmployee}
          />
        );

      case 'recruitment':
        return (
          <RecruitmentView
            jobOpenings={jobOpenings}
            onAddJob={handleAddJob}
            onNavigate={setCurrentView}
          />
        );

      case 'attendance':
        return (
          <AttendanceView
            attendanceRecords={attendanceRecords}
            onNavigate={setCurrentView}
          />
        );

      case 'leave':
        return (
          <LeaveManagementView
            leaveRequests={leaveRequests}
            onApproveLeave={handleApproveLeave}
            onRejectLeave={handleRejectLeave}
            onOpenApplyLeave={() => setIsApplyLeaveOpen(true)}
            onNavigate={setCurrentView}
          />
        );

      case 'payroll':
        return <PayrollView onNavigate={setCurrentView} />;

      case 'performance':
        return <PerformanceView onNavigate={setCurrentView} />;

      case 'tasks':
        return (
          <TaskManagementView
            tasks={tasks}
            employees={employees}
            currentUser={currentUser}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onTogglePinTask={handleTogglePinTask}
            onDeleteTask={handleDeleteTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onAddAttachment={handleAddAttachment}
            onRemoveAttachment={handleRemoveAttachment}
            onNavigate={setCurrentView}
          />
        );

      case 'assets':
      case 'documents':
      case 'reports':
      case 'settings':
      case 'admin':
        return <OtherViews view={currentView} onNavigate={setCurrentView} />;

      default:
        return (
          <DashboardView
            currentUser={currentUser}
            employees={employees}
            leaveRequests={leaveRequests}
            upcomingEvents={upcomingEvents}
            activities={activities}
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onTogglePinTask={handleTogglePinTask}
            onDeleteTask={handleDeleteTask}
            onNavigate={setCurrentView}
            onOpenApplyLeave={() => setIsApplyLeaveOpen(true)}
          />
        );
    }
  };

  // If viewing Auth screens or unauthenticated
  if (!isAuthenticated || currentView === 'auth-login' || currentView === 'auth-signup') {
    return (
      <AuthView
        mode={currentView === 'auth-signup' ? 'signup' : 'login'}
        onLoginSuccess={handleLoginSuccess}
        onSwitchMode={(mode) => setCurrentView(mode === 'signup' ? 'auth-signup' : 'auth-login')}
      />
    );
  }

  return (
    <div id="app-layout" className="flex h-screen w-screen overflow-hidden bg-[#0b1326] text-[#dae2fd]">
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 glass-panel px-4 py-3 rounded-2xl border border-purple-500/40 bg-[#131b2e] shadow-2xl text-xs font-semibold text-white flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Sidebar (Dynamically filters menu tabs according to currentUser.roleType) */}
      <Sidebar
        currentView={currentView}
        currentUser={currentUser}
        onNavigate={setCurrentView}
        onOpenSupport={() => setIsSupportOpen(true)}
      />

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          notifications={notifications}
          onOpenReportModal={() => setIsDownloadReportOpen(true)}
          onOpenNotifications={() => {}}
          onNavigate={setCurrentView}
          onOpenSearch={() => setIsSearchOpen(true)}
          onSignOut={handleSignOut}
        />

        {/* Dynamic Page Views Container with RBAC Guarding */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Modals */}
      <ApplyLeaveModal
        isOpen={isApplyLeaveOpen}
        onClose={() => setIsApplyLeaveOpen(false)}
        onSubmit={handleApplyLeave}
      />

      <DownloadReportModal
        isOpen={isDownloadReportOpen}
        onClose={() => setIsDownloadReportOpen(false)}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        employees={employees}
        onNavigate={setCurrentView}
        onSelectEmployee={setSelectedEmployee}
      />
    </div>
  );
}

export default App;

