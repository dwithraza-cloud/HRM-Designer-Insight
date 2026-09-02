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
import { SettingsView } from './components/SettingsView';
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
  INITIAL_PAYROLL_RECORDS,
  INITIAL_ASSETS,
  INITIAL_DOCUMENTS,
  UPCOMING_EVENTS, 
  RECENT_ACTIVITIES, 
  NOTIFICATIONS,
  INITIAL_TASKS,
  TOP_PERFORMERS,
  RECENT_FEEDBACK,
  INITIAL_ACTIVE_INTERVIEWS,
  INITIAL_HIRING_VELOCITY
} from './data/initialData';
import { 
  ViewMode, 
  Employee, 
  LeaveRequest, 
  JobOpening, 
  UserRole, 
  TaskItem, 
  UserProfile,
  PayrollRecord,
  AssetItem,
  DocumentItem,
  AttendanceRecord,
  ThemeMode,
  ActivityItem,
  NotificationItem,
  TopPerformer,
  FeedbackItem,
  ActiveInterview,
  HiringVelocityMetric
} from './types';
import { authService } from './services/authService';
import { dbService } from './services/dbService';

function loadStoredData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
  }
  return fallback;
}

export function App() {
  // Navigation & Authentication - strictly require login on app launch
  const initialSession = authService.getActiveSession();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!initialSession);
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => initialSession || ADMIN_USER);
  const [currentView, setCurrentView] = useState<ViewMode>(() => initialSession ? 'dashboard' : 'auth-login');

  // Apply user-specific theme whenever currentUser changes
  useEffect(() => {
    const theme = currentUser?.themePreference || 'dark';
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
  }, [currentUser?.themePreference, currentUser?.id]);

  // Core Data State initialized with local state fallback while Firestore syncs
  const [employees, setEmployees] = useState<Employee[]>(() => loadStoredData('insight_hrm_employees', INITIAL_EMPLOYEES));
  const [selectedEmployee, setSelectedEmployee] = useState<Employee>(() => {
    const list = loadStoredData<Employee[]>('insight_hrm_employees', INITIAL_EMPLOYEES);
    return list[0] || INITIAL_EMPLOYEES[0];
  });
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => loadStoredData('insight_hrm_leave_requests', INITIAL_LEAVE_REQUESTS));
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>(() => loadStoredData('insight_hrm_job_openings', INITIAL_JOB_OPENINGS));
  const [tasks, setTasks] = useState<TaskItem[]>(() => loadStoredData('insight_hrm_tasks', INITIAL_TASKS));
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => loadStoredData('insight_hrm_attendance', INITIAL_ATTENDANCE));
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() => loadStoredData('insight_hrm_payroll_records', INITIAL_PAYROLL_RECORDS));
  const [assets, setAssets] = useState<AssetItem[]>(() => loadStoredData('insight_hrm_assets', INITIAL_ASSETS));
  const [documents, setDocuments] = useState<DocumentItem[]>(() => loadStoredData('insight_hrm_documents', INITIAL_DOCUMENTS));
  const [upcomingEvents] = useState(UPCOMING_EVENTS);
  const [activities, setActivities] = useState(() => loadStoredData('insight_hrm_activities', RECENT_ACTIVITIES));
  const [notifications, setNotifications] = useState(() => loadStoredData('insight_hrm_notifications', NOTIFICATIONS));
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>(() => loadStoredData('insight_hrm_top_performers', TOP_PERFORMERS));
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(() => loadStoredData('insight_hrm_feedback', RECENT_FEEDBACK));
  const [interviews, setInterviews] = useState<ActiveInterview[]>(() => loadStoredData('insight_hrm_interviews', INITIAL_ACTIVE_INTERVIEWS));
  const [velocities, setVelocities] = useState<HiringVelocityMetric[]>(() => loadStoredData('insight_hrm_velocities', INITIAL_HIRING_VELOCITY));

  // Sync state to Firestore Production Database & Realtime Listeners
  useEffect(() => {
    let unsubscribes: (() => void)[] = [];

    async function initDatabase() {
      try {
        const loadedEmps = await dbService.loadOrSeedCollection('employees', INITIAL_EMPLOYEES);
        setEmployees(loadedEmps);
        if (loadedEmps.length > 0) setSelectedEmployee(loadedEmps[0]);

        const loadedLeaves = await dbService.loadOrSeedCollection('leave_requests', INITIAL_LEAVE_REQUESTS);
        setLeaveRequests(loadedLeaves);

        const loadedJobs = await dbService.loadOrSeedCollection('job_openings', INITIAL_JOB_OPENINGS);
        setJobOpenings(loadedJobs);

        const loadedTasks = await dbService.loadOrSeedCollection('tasks', INITIAL_TASKS);
        setTasks(loadedTasks);

        const loadedAttendance = await dbService.loadOrSeedCollection('attendance', INITIAL_ATTENDANCE);
        setAttendanceRecords(loadedAttendance);

        const loadedPayroll = await dbService.loadOrSeedCollection('payroll_records', INITIAL_PAYROLL_RECORDS);
        setPayrollRecords(loadedPayroll);

        const loadedAssets = await dbService.loadOrSeedCollection('assets', INITIAL_ASSETS);
        setAssets(loadedAssets);

        const loadedDocs = await dbService.loadOrSeedCollection('documents', INITIAL_DOCUMENTS);
        setDocuments(loadedDocs);

        const loadedActs = await dbService.loadOrSeedCollection('activities', RECENT_ACTIVITIES);
        setActivities(loadedActs);

        const loadedNotifs = await dbService.loadOrSeedCollection('notifications', NOTIFICATIONS);
        setNotifications(loadedNotifs);

        const loadedPerformers = await dbService.loadOrSeedCollection('top_performers', TOP_PERFORMERS);
        setTopPerformers(loadedPerformers);

        const loadedFeedback = await dbService.loadOrSeedCollection('performance_feedback', RECENT_FEEDBACK);
        setFeedbackList(loadedFeedback);

        const loadedInterviews = await dbService.loadOrSeedCollection('interviews', INITIAL_ACTIVE_INTERVIEWS);
        setInterviews(loadedInterviews);

        const loadedVelocities = await dbService.loadOrSeedCollection('hiring_velocity', INITIAL_HIRING_VELOCITY);
        setVelocities(loadedVelocities);

        // Realtime Firestore subscriptions
        unsubscribes.push(dbService.subscribeToCollection<Employee>('employees', items => setEmployees(items)));
        unsubscribes.push(dbService.subscribeToCollection<LeaveRequest>('leave_requests', items => setLeaveRequests(items)));
        unsubscribes.push(dbService.subscribeToCollection<JobOpening>('job_openings', items => setJobOpenings(items)));
        unsubscribes.push(dbService.subscribeToCollection<TaskItem>('tasks', items => setTasks(items)));
        unsubscribes.push(dbService.subscribeToCollection<AttendanceRecord>('attendance', items => setAttendanceRecords(items)));
        unsubscribes.push(dbService.subscribeToCollection<PayrollRecord>('payroll_records', items => setPayrollRecords(items)));
        unsubscribes.push(dbService.subscribeToCollection<AssetItem>('assets', items => setAssets(items)));
        unsubscribes.push(dbService.subscribeToCollection<DocumentItem>('documents', items => setDocuments(items)));
        unsubscribes.push(dbService.subscribeToCollection<ActivityItem>('activities', items => setActivities(items)));
        unsubscribes.push(dbService.subscribeToCollection<NotificationItem>('notifications', items => setNotifications(items)));
        unsubscribes.push(dbService.subscribeToCollection<TopPerformer>('top_performers', items => setTopPerformers(items)));
        unsubscribes.push(dbService.subscribeToCollection<FeedbackItem>('performance_feedback', items => setFeedbackList(items)));
        unsubscribes.push(dbService.subscribeToCollection<ActiveInterview>('interviews', items => setInterviews(items)));
        unsubscribes.push(dbService.subscribeToCollection<HiringVelocityMetric>('hiring_velocity', items => setVelocities(items)));
      } catch (err) {
        console.error('Error initializing Firestore database:', err);
      }
    }

    initDatabase();

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  // Also maintain local storage backup
  useEffect(() => {
    try {
      localStorage.setItem('insight_hrm_employees', JSON.stringify(employees));
    } catch (e) {
      console.error(e);
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem('insight_hrm_leave_requests', JSON.stringify(leaveRequests));
    } catch (e) {
      console.error(e);
    }
  }, [leaveRequests]);

  useEffect(() => {
    try {
      localStorage.setItem('insight_hrm_job_openings', JSON.stringify(jobOpenings));
    } catch (e) {
      console.error(e);
    }
  }, [jobOpenings]);

  useEffect(() => {
    try {
      localStorage.setItem('insight_hrm_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('insight_hrm_attendance', JSON.stringify(attendanceRecords));
    } catch (e) {
      console.error(e);
    }
  }, [attendanceRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('insight_hrm_payroll_records', JSON.stringify(payrollRecords));
    } catch (e) {
      console.error(e);
    }
  }, [payrollRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('insight_hrm_assets', JSON.stringify(assets));
    } catch (e) {
      console.error(e);
    }
  }, [assets]);

  useEffect(() => {
    try {
      localStorage.setItem('insight_hrm_documents', JSON.stringify(documents));
    } catch (e) {
      console.error(e);
    }
  }, [documents]);

  useEffect(() => {
    try {
      localStorage.setItem('insight_hrm_activities', JSON.stringify(activities));
    } catch (e) {
      console.error(e);
    }
  }, [activities]);

  useEffect(() => {
    try {
      localStorage.setItem('insight_hrm_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  // Modals
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);
  const [isDownloadReportOpen, setIsDownloadReportOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Responsive Sidebar State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Toast Notification state
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  // Keyboard shortcut for Cmd/Ctrl+K search & Cmd/Ctrl+\ sidebar toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === '\\' || e.key === 'b')) {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // RBAC Action Handlers with Authorization Checks & Production Database Persistence
  const handleSaveEmployee = async (newEmp: Employee) => {
    if (currentUser.roleType !== 'admin') {
      showToast('⚠️ Access Denied (403): Only Admins can register new employee accounts.');
      return;
    }
    try {
      await dbService.saveItem('employees', newEmp);
      setEmployees(prev => [newEmp, ...prev.filter(e => e.id !== newEmp.id)]);
      setSelectedEmployee(newEmp);

      const act: ActivityItem = {
        id: `act-${Date.now()}`,
        type: 'employee',
        highlightedText: newEmp.name,
        description: `was registered as ${newEmp.designation} in ${newEmp.department}`,
        timestamp: 'Just now'
      };
      await dbService.saveItem('activities', act);

      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      showToast(`Employee ${newEmp.name} registered successfully!`);
      setCurrentView('employee-detail');
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (currentUser.roleType !== 'admin') {
      showToast('⚠️ Access Denied (403): Only Admins can delete employee records.');
      return;
    }
    const emp = employees.find(e => e.id === id);
    if (window.confirm(`Are you sure you want to delete ${emp?.name || 'this employee'}?`)) {
      try {
        await dbService.deleteItem('employees', id);
        setEmployees(prev => prev.filter(e => e.id !== id));
        if (emp) {
          const relatedLeaves = leaveRequests.filter(r => r.empId === emp.empId || r.employeeName === emp.name);
          for (const r of relatedLeaves) {
            await dbService.deleteItem('leave_requests', r.id);
          }
          setLeaveRequests(prev => prev.filter(r => r.empId !== emp.empId && r.employeeName !== emp.name));

          const relatedPayrolls = payrollRecords.filter(p => p.empId === emp.empId || p.employeeName === emp.name);
          for (const p of relatedPayrolls) {
            await dbService.deleteItem('payroll_records', p.id);
          }
          setPayrollRecords(prev => prev.filter(p => p.empId !== emp.empId && p.employeeName !== emp.name));

          const relatedAttendance = attendanceRecords.filter(a => a.empId === emp.empId || a.employeeName === emp.name);
          for (const a of relatedAttendance) {
            await dbService.deleteItem('attendance', a.id);
          }
          setAttendanceRecords(prev => prev.filter(a => a.empId !== emp.empId && a.employeeName !== emp.name));
        }

        const act: ActivityItem = {
          id: `act-${Date.now()}`,
          type: 'employee',
          highlightedText: emp?.name || 'Employee',
          description: `was removed from employee records`,
          timestamp: 'Just now'
        };
        await dbService.saveItem('activities', act);
        showToast(`Employee record removed from database.`);
      } catch (err: any) {
        showToast(`❌ Database error: ${err.message || err}`);
      }
    }
  };

  const handleApplyLeave = async (newLeave: LeaveRequest) => {
    try {
      await dbService.saveItem('leave_requests', newLeave);
      setLeaveRequests(prev => [newLeave, ...prev.filter(r => r.id !== newLeave.id)]);

      const act: ActivityItem = {
        id: `act-${Date.now()}`,
        type: 'leave',
        highlightedText: newLeave.employeeName,
        description: `submitted a ${newLeave.leaveType} application (${newLeave.duration})`,
        timestamp: 'Just now'
      };
      await dbService.saveItem('activities', act);
      showToast(`Leave application submitted for approval.`);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleApproveLeave = async (id: string) => {
    if (currentUser.roleType === 'employee') {
      showToast('⚠️ Access Denied (403): Employees cannot approve leave requests.');
      return;
    }
    const targetLeave = leaveRequests.find(r => r.id === id);
    if (currentUser.roleType === 'manager' && targetLeave && targetLeave.department !== currentUser.department) {
      showToast(`⚠️ Access Denied: Managers can only approve leave requests for the ${currentUser.department} department.`);
      return;
    }
    try {
      await dbService.updateItemFields('leave_requests', id, { status: 'Approved' });
      setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      showToast(`Leave request approved.`);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleRejectLeave = async (id: string) => {
    if (currentUser.roleType === 'employee') {
      showToast('⚠️ Access Denied (403): Employees cannot reject leave requests.');
      return;
    }
    try {
      await dbService.updateItemFields('leave_requests', id, { status: 'Rejected' });
      setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
      showToast(`Leave request rejected.`);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  // --- RECRUITMENT & INTERVIEW CRUD HANDLERS ---
  const handleAddJob = async (job: JobOpening) => {
    if (currentUser.roleType !== 'admin' && currentUser.roleType !== 'manager') {
      showToast('⚠️ Access Denied (403): Unauthorized operation.');
      return;
    }
    try {
      await dbService.saveItem('job_openings', job);
      setJobOpenings(prev => [job, ...prev.filter(j => j.id !== job.id)]);
      showToast(`✓ Job position "${job.title}" created successfully.`);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleEditJob = async (job: JobOpening) => {
    if (currentUser.roleType !== 'admin' && currentUser.roleType !== 'manager') {
      showToast('⚠️ Access Denied (403): Unauthorized operation.');
      return;
    }
    try {
      await dbService.saveItem('job_openings', job);
      setJobOpenings(prev => prev.map(j => j.id === job.id ? job : j));
      showToast(`✓ Job opening "${job.title}" updated.`);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (currentUser.roleType !== 'admin') {
      showToast('⚠️ Access Denied (403): Only Admins can delete job positions.');
      return;
    }
    try {
      await dbService.deleteItem('job_openings', id);
      setJobOpenings(prev => prev.filter(j => j.id !== id));
      showToast(`✓ Job opening removed.`);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleAddInterview = async (interview: ActiveInterview) => {
    try {
      await dbService.saveItem('interviews', interview);
      setInterviews(prev => [interview, ...prev.filter(i => i.id !== interview.id)]);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleEditInterview = async (interview: ActiveInterview) => {
    try {
      await dbService.saveItem('interviews', interview);
      setInterviews(prev => prev.map(i => i.id === interview.id ? interview : i));
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleDeleteInterview = async (id: string) => {
    try {
      await dbService.deleteItem('interviews', id);
      setInterviews(prev => prev.filter(i => i.id !== id));
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleAddVelocity = async (velocity: HiringVelocityMetric) => {
    try {
      await dbService.saveItem('hiring_velocity', velocity);
      setVelocities(prev => [velocity, ...prev.filter(v => v.id !== velocity.id)]);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleEditVelocity = async (velocity: HiringVelocityMetric) => {
    try {
      await dbService.saveItem('hiring_velocity', velocity);
      setVelocities(prev => prev.map(v => v.id === velocity.id ? velocity : v));
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleDeleteVelocity = async (id: string) => {
    try {
      await dbService.deleteItem('hiring_velocity', id);
      setVelocities(prev => prev.filter(v => v.id !== id));
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  // --- PERFORMANCE HANDLERS ---
  const handleAddTopPerformer = async (performer: TopPerformer) => {
    try {
      await dbService.saveItem('top_performers', performer);
      setTopPerformers(prev => [performer, ...prev.filter(p => p.id !== performer.id)]);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleRemoveTopPerformer = async (id: string) => {
    try {
      await dbService.deleteItem('top_performers', id);
      setTopPerformers(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleAddFeedback = async (feedback: FeedbackItem) => {
    try {
      await dbService.saveItem('performance_feedback', feedback);
      setFeedbackList(prev => [feedback, ...prev.filter(f => f.id !== feedback.id)]);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  // --- PAYROLL CRUD HANDLERS ---
  const handleAddPayrollRecord = async (record: PayrollRecord) => {
    if (currentUser.roleType !== 'admin') {
      showToast('⚠️ Access Denied (403): Only Admins can create payroll records.');
      return;
    }
    try {
      await dbService.saveItem('payroll_records', record);
      setPayrollRecords(prev => [record, ...prev.filter(p => p.id !== record.id)]);
      showToast(`✓ Payroll record added for ${record.employeeName}. Net: Rs. ${record.netSalary.toLocaleString()} PKR`);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleEditPayrollRecord = async (record: PayrollRecord) => {
    if (currentUser.roleType !== 'admin') {
      showToast('⚠️ Access Denied (403): Only Admins can modify payroll records.');
      return;
    }
    try {
      await dbService.saveItem('payroll_records', record);
      setPayrollRecords(prev => prev.map(p => p.id === record.id ? record : p));
      showToast(`✓ Payroll record updated for ${record.employeeName}. Net: Rs. ${record.netSalary.toLocaleString()} PKR`);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleDeletePayrollRecord = async (id: string) => {
    if (currentUser.roleType !== 'admin') {
      showToast('⚠️ Access Denied (403): Only Admins can delete payroll records.');
      return;
    }
    try {
      await dbService.deleteItem('payroll_records', id);
      setPayrollRecords(prev => prev.filter(p => p.id !== id));
      showToast(`✓ Payroll disbursement record removed.`);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  // --- ASSET MANAGEMENT CRUD HANDLERS ---
  const handleAddAsset = async (asset: AssetItem) => {
    if (currentUser.roleType !== 'admin') {
      showToast('⚠️ Access Denied (403): Only Admins can add hardware assets.');
      return;
    }
    try {
      await dbService.saveItem('assets', asset);
      setAssets(prev => [asset, ...prev.filter(a => a.id !== asset.id)]);
      showToast(`✓ Hardware asset "${asset.name}" (${asset.serialNumber}) registered.`);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleEditAsset = async (asset: AssetItem) => {
    if (currentUser.roleType !== 'admin') {
      showToast('⚠️ Access Denied (403): Only Admins can edit hardware assets.');
      return;
    }
    try {
      await dbService.saveItem('assets', asset);
      setAssets(prev => prev.map(a => a.id === asset.id ? asset : a));
      showToast(`✓ Hardware asset "${asset.name}" updated.`);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (currentUser.roleType !== 'admin') {
      showToast('⚠️ Access Denied (403): Only Admins can delete hardware assets.');
      return;
    }
    try {
      await dbService.deleteItem('assets', id);
      setAssets(prev => prev.filter(a => a.id !== id));
      showToast(`✓ Hardware asset removed from inventory.`);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  // --- DOCUMENT MANAGEMENT CRUD HANDLERS ---
  const handleAddDocument = async (doc: DocumentItem) => {
    if (currentUser.roleType !== 'admin' && currentUser.roleType !== 'manager') {
      showToast('⚠️ Access Denied (403): Only Admins and Managers can upload documents.');
      return;
    }
    try {
      await dbService.saveItem('documents', doc);
      setDocuments(prev => [doc, ...prev.filter(d => d.id !== doc.id)]);
      showToast(`✓ Document "${doc.name}" uploaded successfully.`);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleEditDocument = async (doc: DocumentItem) => {
    if (currentUser.roleType !== 'admin' && currentUser.roleType !== 'manager') {
      showToast('⚠️ Access Denied (403): Only Admins and Managers can edit documents.');
      return;
    }
    try {
      await dbService.saveItem('documents', doc);
      setDocuments(prev => prev.map(d => d.id === doc.id ? doc : d));
      showToast(`✓ Document "${doc.name}" updated.`);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (currentUser.roleType !== 'admin' && currentUser.roleType !== 'manager') {
      showToast('⚠️ Access Denied (403): Only Admins and Managers can delete documents.');
      return;
    }
    try {
      await dbService.deleteItem('documents', id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      showToast(`✓ Document removed from repository.`);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  // --- TASK HANDLERS ---
  const handleAddTask = async (newTask: TaskItem) => {
    try {
      await dbService.saveItem('tasks', newTask);
      setTasks(prev => [newTask, ...prev.filter(t => t.id !== newTask.id)]);
      showToast(`Task "${newTask.title}" assigned successfully!`);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleUpdateTaskStatus = async (id: string, status: TaskItem['status']) => {
    const completed = status === 'Completed';
    try {
      await dbService.updateItemFields('tasks', id, { status, completed });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status, completed } : t));
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const nextCompleted = !task.completed;
    const nextStatus: TaskItem['status'] = nextCompleted ? 'Completed' : 'Pending';
    try {
      await dbService.updateItemFields('tasks', id, { completed: nextCompleted, status: nextStatus });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: nextCompleted, status: nextStatus } : t));
      if (nextCompleted) {
        confetti({ particleCount: 35, spread: 45, origin: { y: 0.8 } });
        showToast(`Task completed!`);
      }
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleTogglePinTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const nextPinned = !task.pinned;
    try {
      await dbService.updateItemFields('tasks', id, { pinned: nextPinned });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, pinned: nextPinned } : t));
      showToast(nextPinned ? `Task pinned to top` : `Task unpinned`);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await dbService.deleteItem('tasks', id);
      setTasks(prev => prev.filter(t => t.id !== id));
      showToast(`Task deleted.`);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleAddAttachment = async (taskId: string, attachment: any) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const updatedAttachments = [attachment, ...(task.attachments || [])];
    try {
      await dbService.updateItemFields('tasks', taskId, { attachments: updatedAttachments });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, attachments: updatedAttachments } : t));
      showToast(`Attachment "${attachment.name}" attached to task.`);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleRemoveAttachment = async (taskId: string, attachmentId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const updatedAttachments = (task.attachments || []).filter(a => a.id !== attachmentId);
    try {
      await dbService.updateItemFields('tasks', taskId, { attachments: updatedAttachments });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, attachments: updatedAttachments } : t));
      showToast(`Attachment removed.`);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
  };

  const handleSendMessage = (emp: Employee) => {
    setIsSupportOpen(true);
  };

  const handleUpdateEmployeeEmail = async (oldEmail: string, newEmail: string) => {
    const targetEmp = employees.find(emp => emp.email.toLowerCase() === oldEmail.toLowerCase());
    if (targetEmp) {
      const updated = { ...targetEmp, email: newEmail };
      try {
        await dbService.saveItem('employees', updated);
        setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
      } catch (err: any) {
        showToast(`❌ Database error: ${err.message || err}`);
      }
    }
  };

  const handleUpdateEmployee = async (updatedEmp: Employee) => {
    try {
      await dbService.saveItem('employees', updatedEmp);
      setEmployees(prev => prev.map(emp => emp.id === updatedEmp.id ? updatedEmp : emp));
      setSelectedEmployee(updatedEmp);

      if (
        currentUser.id === updatedEmp.id || 
        currentUser.email?.toLowerCase() === updatedEmp.email.toLowerCase() ||
        currentUser.name.toLowerCase() === updatedEmp.name.toLowerCase()
      ) {
        setCurrentUser(prev => ({
          ...prev,
          id: updatedEmp.id || prev.id,
          name: updatedEmp.name,
          email: updatedEmp.email,
          role: updatedEmp.designation,
          department: updatedEmp.department,
          empId: updatedEmp.empId,
          phone: updatedEmp.phone || prev.phone,
          address: updatedEmp.address || prev.address,
          gender: updatedEmp.gender || prev.gender,
          dob: updatedEmp.dob || prev.dob,
          bloodGroup: updatedEmp.bloodGroup || prev.bloodGroup,
          maritalStatus: updatedEmp.maritalStatus || prev.maritalStatus,
          nationality: updatedEmp.nationality || prev.nationality,
          location: updatedEmp.location || prev.location,
          joiningDate: updatedEmp.joiningDate || prev.joiningDate,
          status: updatedEmp.status || prev.status,
          avatar: updatedEmp.avatar || prev.avatar,
          baseSalary: updatedEmp.baseSalary || prev.baseSalary,
          reportingManager: {
            ...prev.reportingManager,
            name: updatedEmp.reportingManager || prev.reportingManager.name
          }
        }));
      }

      const account = authService.getAvailableAccounts().find(
        a => a.id === updatedEmp.id || a.email.toLowerCase() === updatedEmp.email.toLowerCase()
      );
      if (account) {
        authService.adminUpdateUserCredentials('admin', account.id, {
          newEmail: updatedEmp.email
        });
        account.name = updatedEmp.name;
        account.email = updatedEmp.email;
        if (account.profile) {
          account.profile.name = updatedEmp.name;
          account.profile.email = updatedEmp.email;
          account.profile.role = updatedEmp.designation;
          account.profile.department = updatedEmp.department;
          account.profile.empId = updatedEmp.empId;
          account.profile.phone = updatedEmp.phone;
          account.profile.address = updatedEmp.address || '';
          account.profile.gender = updatedEmp.gender || '';
          account.profile.dob = updatedEmp.dob || '';
          account.profile.bloodGroup = updatedEmp.bloodGroup || '';
          account.profile.maritalStatus = updatedEmp.maritalStatus || '';
          account.profile.nationality = updatedEmp.nationality || '';
          account.profile.joiningDate = updatedEmp.joiningDate;
          account.profile.status = updatedEmp.status;
          if (updatedEmp.avatar) account.profile.avatar = updatedEmp.avatar;
        }
      }

      showToast(`Profile updated successfully for ${updatedEmp.name}!`);
    } catch (err: any) {
      showToast(`❌ Database error: ${err.message || err}`);
    }
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

  // User-Specific Theme Toggle Handler
  const handleToggleTheme = (targetTheme?: ThemeMode) => {
    const current = currentUser.themePreference || 'dark';
    const nextTheme: ThemeMode = targetTheme || (current === 'light' ? 'dark' : 'light');
    
    // 1. Update active currentUser state
    const updatedUser = { ...currentUser, themePreference: nextTheme };
    setCurrentUser(updatedUser);

    // 2. Persist in database/localStorage for this specific user
    authService.updateThemePreference(currentUser.id || currentUser.email, nextTheme);

    // 3. Immediately apply to DOM
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(nextTheme);
    root.setAttribute('data-theme', nextTheme);

    showToast(`✓ Theme switched to ${nextTheme === 'light' ? 'Light' : 'Dark'} Mode (saved to your account).`);
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
    if (['payroll', 'add-employee', 'reports', 'admin'].includes(currentView)) {
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
            attendanceRecords={attendanceRecords}
            jobOpenings={jobOpenings}
            payrollRecords={payrollRecords}
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
            onUpdateEmployeeEmail={handleUpdateEmployeeEmail}
            onUpdateEmployee={handleUpdateEmployee}
            showToast={showToast}
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
            onUpdateEmployee={handleUpdateEmployee}
            showToast={showToast}
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
            currentUser={currentUser}
            interviews={interviews}
            velocities={velocities}
            onAddJob={handleAddJob}
            onEditJob={handleEditJob}
            onDeleteJob={handleDeleteJob}
            onAddInterview={handleAddInterview}
            onEditInterview={handleEditInterview}
            onDeleteInterview={handleDeleteInterview}
            onAddVelocity={handleAddVelocity}
            onEditVelocity={handleEditVelocity}
            onDeleteVelocity={handleDeleteVelocity}
            onNavigate={setCurrentView}
            showToast={showToast}
          />
        );

      case 'attendance':
        return (
          <AttendanceView
            attendanceRecords={attendanceRecords}
            currentUser={currentUser}
            employees={employees}
            leaveRequests={leaveRequests}
            onUpdateRecords={setAttendanceRecords}
            onNavigate={setCurrentView}
            showToast={showToast}
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
        return (
          <PayrollView 
            payrollRecords={payrollRecords}
            employees={employees}
            currentUser={currentUser}
            onAddPayrollRecord={handleAddPayrollRecord}
            onEditPayrollRecord={handleEditPayrollRecord}
            onDeletePayrollRecord={handleDeletePayrollRecord}
            onNavigate={setCurrentView}
            showToast={showToast}
          />
        );

      case 'performance':
        return (
          <PerformanceView 
            currentUser={currentUser}
            employees={employees}
            topPerformers={topPerformers}
            feedbackList={feedbackList}
            onAddTopPerformer={handleAddTopPerformer}
            onRemoveTopPerformer={handleRemoveTopPerformer}
            onAddFeedback={handleAddFeedback}
            onNavigate={setCurrentView}
            showToast={showToast}
          />
        );

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

      case 'settings':
      case 'admin':
        return (
          <SettingsView
            currentUser={currentUser}
            employees={employees}
            currentTheme={currentUser.themePreference || 'dark'}
            onToggleTheme={handleToggleTheme}
            onUpdateCurrentUser={setCurrentUser}
            onUpdateEmployeeEmail={handleUpdateEmployeeEmail}
            onNavigate={setCurrentView}
            showToast={showToast}
          />
        );

      case 'assets':
      case 'documents':
      case 'reports':
        return (
          <OtherViews 
            view={currentView} 
            onNavigate={setCurrentView}
            currentUser={currentUser}
            employees={employees}
            assets={assets}
            onAddAsset={handleAddAsset}
            onEditAsset={handleEditAsset}
            onDeleteAsset={handleDeleteAsset}
            documents={documents}
            onAddDocument={handleAddDocument}
            onEditDocument={handleEditDocument}
            onDeleteDocument={handleDeleteDocument}
            showToast={showToast}
          />
        );

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

      {/* Main Sidebar (Responsive Drawer on mobile, Collapsible Rail on desktop) */}
      <Sidebar
        currentView={currentView}
        currentUser={currentUser}
        currentTheme={currentUser.themePreference || 'dark'}
        onNavigate={(view) => {
          setCurrentView(view);
          setIsMobileSidebarOpen(false);
        }}
        onOpenSupport={() => setIsSupportOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          notifications={notifications}
          currentTheme={currentUser.themePreference || 'dark'}
          onToggleTheme={handleToggleTheme}
          onOpenReportModal={() => setIsDownloadReportOpen(true)}
          onOpenNotifications={() => {}}
          onNavigate={setCurrentView}
          onOpenSearch={() => setIsSearchOpen(true)}
          onSignOut={handleSignOut}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        />

        {/* Dynamic Page Views Container with RBAC Guarding */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-7">
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
