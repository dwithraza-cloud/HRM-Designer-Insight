export type ViewMode = 
  | 'dashboard'
  | 'employees'
  | 'employee-detail'
  | 'add-employee'
  | 'recruitment'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'performance'
  | 'tasks'
  | 'assets'
  | 'documents'
  | 'reports'
  | 'settings'
  | 'admin'
  | 'auth-login'
  | 'auth-signup';

export type UserRole = 'admin' | 'manager' | 'employee';

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  roleType: UserRole;
  email: string;
  avatar: string;
  department: string;
  empId: string;
  location: string;
  phone: string;
  address: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  maritalStatus: string;
  nationality: string;
  joiningDate: string;
  reportingManager: {
    name: string;
    role: string;
    avatar: string;
  };
  baseSalary: number;
  status: 'Active' | 'On Leave' | 'Inactive';
}

export interface Employee {
  id: string;
  empId: string;
  name: string;
  designation: string;
  department: 'Design' | 'Engineering' | 'Marketing' | 'HR' | 'Sales' | 'Finance' | 'Operations' | 'Support';
  email: string;
  phone: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  joiningDate: string;
  avatar?: string;
  avatarInitials?: string;
  gender?: string;
  dob?: string;
  address?: string;
  reportingManager?: string;
  baseSalary?: number;
}

export interface LeaveRequest {
  id: string;
  employeeName: string;
  department: string;
  avatar?: string;
  avatarInitials?: string;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Annual Leave' | 'Maternity Leave';
  duration: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
}

export interface AttendanceRecord {
  id: string;
  empId: string;
  employeeName: string;
  department: string;
  avatarInitials: string;
  avatar?: string;
  clockIn: string;
  clockOut: string;
  totalHrs: string;
  status: 'Present' | 'Late' | 'Absent' | 'On Leave' | 'Half Day';
  date: string;
}

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid';
  applicantsCount: number;
  status: 'Active' | 'Draft' | 'Closed';
  icon: string;
  postedDate: string;
}

export interface ActivityItem {
  id: string;
  type: 'employee' | 'leave' | 'payroll' | 'document' | 'performance';
  description: string;
  highlightedText: string;
  timestamp: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  month: string;
  day: string;
  type: 'birthday' | 'anniversary' | 'payroll' | 'training' | 'holiday' | 'review';
  avatar?: string;
}

export interface PerformanceReview {
  id: string;
  employeeName: string;
  role: string;
  department: string;
  avatar: string;
  score: number;
  status: 'Completed' | 'Pending';
  period: string;
}

export interface TaskAssignee {
  id: string;
  name: string;
  role: string;
  roleType: UserRole;
  avatar?: string;
  department: string;
  email?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  status?: 'Pending' | 'In Progress' | 'Under Review' | 'Completed' | 'Blocked';
  pinned: boolean;
  priority?: 'high' | 'medium' | 'low' | 'urgent';
  category?: string;
  dueDate?: string;
  createdAt?: string;
  assignedTo?: TaskAssignee;
  assignedBy?: {
    id: string;
    name: string;
    role: string;
    roleType: UserRole;
    avatar?: string;
  };
  department?: string;
  tags?: string[];
  notes?: string;
}

export interface FeedbackItem {
  id: string;
  fromName: string;
  toName: string;
  avatar: string;
  timeAgo: string;
  comment: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'leave' | 'employee' | 'payroll' | 'alert';
}
