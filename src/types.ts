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

export type ThemeMode = 'dark' | 'light';

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
  themePreference?: ThemeMode;
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
  bloodGroup?: string;
  maritalStatus?: string;
  nationality?: string;
  location?: string;
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
  avatarInitials?: string;
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
  salaryRange?: string; // in Rs. / PKR
  description?: string;
  experience?: string;
  requirements?: string[];
}

export interface PayrollRecord {
  id: string;
  empId: string;
  employeeName: string;
  department: string;
  designation: string;
  baseSalary: number; // in PKR
  allowances: number; // in PKR
  deductions: number; // in PKR
  netSalary: number;  // in PKR
  status: 'Paid' | 'Processing' | 'On Hold';
  paymentDate: string;
  month: string;
  avatar?: string;
  avatarInitials?: string;
  paymentMethod?: string;
}

export interface AssetItem {
  id: string;
  name: string;
  serialNumber: string;
  category: 'Laptop' | 'Display' | 'Security' | 'Mobile' | 'Peripheral' | 'Furniture' | 'Digital Product' | 'Software License' | 'Cloud Resource' | 'Other';
  assignedTo?: {
    id: string;
    name: string;
    empId: string;
    department: string;
    avatar?: string;
  };
  valuePkr: number; // in PKR / Rs.
  purchaseDate: string;
  status: 'Allocated' | 'Available' | 'In Repair' | 'Retired';
  specs?: string;
  licenseKey?: string;
  renewalDate?: string;
  seatsCount?: number;
}

export interface ActiveInterview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  department: string;
  interviewer: string;
  date: string;
  time: string;
  stage: 'HR Screening' | 'Technical Round 1' | 'System Design' | 'Executive Final';
  mode: 'Google Meet' | 'Zoom' | 'In-Person' | 'Phone';
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface HiringVelocityMetric {
  id: string;
  department: string;
  averageDays: number;
  targetDays: number;
  offerAcceptanceRate: number; // percentage
  openRoles: number;
  trend: 'faster' | 'on-track' | 'slower';
}

export interface TopPerformer {
  id: string;
  name: string;
  empId?: string;
  role: string;
  department?: string;
  score: number;
  stars: number;
  avatar?: string;
  avatarInitials?: string;
  tag: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  tag: 'Policy' | 'Legal' | 'Benefits' | 'Workplace' | 'Tax' | 'Technical' | 'Compliance';
  size: string;
  updated: string;
  fileFormat: string;
  description?: string;
  uploadedBy?: string;
  restrictedTo?: 'all' | 'admin-manager' | 'admin-only';
  downloadCount?: number;
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

export interface TaskAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'pdf' | 'spreadsheet' | 'archive';
  url: string;
  size?: string;
  uploadedAt: string;
  source?: 'upload' | 'camera' | 'generated';
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
  attachments?: TaskAttachment[];
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
