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
import { 
  ApplyLeaveModal, 
  DownloadReportModal, 
  SupportModal, 
  GlobalSearchModal 
} from './components/Modals';
import { 
  CURRENT_USER, 
  INITIAL_EMPLOYEES, 
  INITIAL_LEAVE_REQUESTS, 
  INITIAL_ATTENDANCE, 
  INITIAL_JOB_OPENINGS, 
  UPCOMING_EVENTS, 
  RECENT_ACTIVITIES, 
  NOTIFICATIONS,
  INITIAL_TASKS
} from './data/initialData';
import { ViewMode, Employee, LeaveRequest, JobOpening, UserRole, TaskItem } from './types';

export function App() {
  // Navigation & Authentication
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [currentUser, setCurrentUser] = useState(CURRENT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

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

  // Handlers
  const handleSaveEmployee = (newEmp: Employee) => {
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
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    showToast(`Leave request approved.`);
  };

  const handleRejectLeave = (id: string) => {
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
    showToast(`Leave request rejected.`);
  };

  const handleAddJob = (job: JobOpening) => {
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

  const handleSendMessage = (emp: Employee) => {
    setIsSupportOpen(true);
  };

  const handleLoginSuccess = (email: string, role: UserRole) => {
    setIsAuthenticated(true);
    setCurrentView('dashboard');
    showToast(`Signed in as ${role.toUpperCase()} (${email})`);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setCurrentView('auth-login');
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

      {/* Main Sidebar */}
      <Sidebar
        currentView={currentView}
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

        {/* Dynamic Page Views Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {currentView === 'dashboard' && (
            <DashboardView
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
          )}

          {currentView === 'employees' && (
            <EmployeeManagementView
              employees={employees}
              onSelectEmployee={setSelectedEmployee}
              onNavigate={setCurrentView}
              onDeleteEmployee={handleDeleteEmployee}
              onExportEmployees={() => setIsDownloadReportOpen(true)}
            />
          )}

          {currentView === 'employee-detail' && (
            <EmployeeDetailView
              employee={selectedEmployee}
              onBack={() => setCurrentView('employees')}
              onNavigate={setCurrentView}
              onSendMessage={handleSendMessage}
            />
          )}

          {currentView === 'add-employee' && (
            <AddEmployeeView
              onBack={() => setCurrentView('employees')}
              onSaveEmployee={handleSaveEmployee}
            />
          )}

          {currentView === 'recruitment' && (
            <RecruitmentView
              jobOpenings={jobOpenings}
              onAddJob={handleAddJob}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'attendance' && (
            <AttendanceView
              attendanceRecords={attendanceRecords}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'leave' && (
            <LeaveManagementView
              leaveRequests={leaveRequests}
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleRejectLeave}
              onOpenApplyLeave={() => setIsApplyLeaveOpen(true)}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'payroll' && (
            <PayrollView onNavigate={setCurrentView} />
          )}

          {currentView === 'performance' && (
            <PerformanceView onNavigate={setCurrentView} />
          )}

          {currentView === 'tasks' && (
            <TaskManagementView
              tasks={tasks}
              employees={employees}
              currentUser={currentUser}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onTogglePinTask={handleTogglePinTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onNavigate={setCurrentView}
            />
          )}

          {['assets', 'documents', 'reports', 'settings', 'admin'].includes(currentView) && (
            <OtherViews view={currentView} onNavigate={setCurrentView} />
          )}
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
