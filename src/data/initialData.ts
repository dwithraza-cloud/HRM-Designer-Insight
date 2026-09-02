import { 
  Employee, 
  LeaveRequest, 
  AttendanceRecord, 
  JobOpening, 
  UpcomingEvent, 
  ActivityItem, 
  UserProfile, 
  FeedbackItem, 
  NotificationItem, 
  TaskItem, 
  PayrollRecord, 
  AssetItem, 
  DocumentItem,
  ActiveInterview,
  HiringVelocityMetric,
  TopPerformer
} from '../types';

export const ADMIN_USER: UserProfile = {
  id: 'usr-admin-01',
  name: 'Raja Raza',
  role: 'Director & System Admin',
  roleType: 'admin',
  email: 'rajaraza300@gmail.com',
  avatar: '/raja_raza.jpg',
  department: 'Operations',
  empId: 'EMP-0001',
  location: 'Lahore, Pakistan',
  phone: '+92 314 5338340',
  address: 'Executive Heights, Gulberg III, Lahore',
  gender: 'Male',
  dob: '14 August 1992',
  bloodGroup: 'O+ Positive',
  maritalStatus: 'Married',
  nationality: 'Pakistani',
  joiningDate: '15 Jan 2021',
  reportingManager: {
    name: 'Executive Board',
    role: 'Board of Directors',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
  },
  baseSalary: 450000,
  status: 'Active'
};

export const MANAGER_USER: UserProfile = {
  id: 'usr-mgr-01',
  name: 'Aqsa',
  role: 'Design Department Lead',
  roleType: 'manager',
  email: 'aqsa@designerinsight.online',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGYbO589VOTATEVvsbR5nyyOSwLBLuKXOxbFTAMEVyEEoVKEAscptTr1Fw8iGYSdAB1g1J5Y2Vx6y8Ypywrc1QuHnwiu6JKqVnuiQ75E-Zl1lklVnZju58LXg4EI6rxi76D29F_QaeZ2oRg09f6FoJmK_QL6Z8b3aMDi0bl53XwFkCgcHB8gkqEbh1qkmBlu_dlAs6b6vNmeVUXXkWqoQmRb8581biV9eH9oJ2xg2_FZghdAbak5L',
  department: 'Design',
  empId: 'EMP-0103',
  location: 'Lahore, Pakistan',
  phone: '+1 (555) 234-5678',
  address: 'DHA Phase 5, Lahore',
  gender: 'Female',
  dob: '18 May 1990',
  bloodGroup: 'A+ Positive',
  maritalStatus: 'Married',
  nationality: 'Pakistani',
  joiningDate: '12 Mar 2019',
  reportingManager: {
    name: 'Raja Raza',
    role: 'Director & System Admin',
    avatar: '/raja_raza.jpg'
  },
  baseSalary: 320000,
  status: 'Active'
};

export const EMPLOYEE_USER: UserProfile = {
  id: 'usr-emp-01',
  name: 'Rani',
  role: 'UI/UX Visual Designer',
  roleType: 'employee',
  email: 'Rani@designerinsight.online',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSANbGI_8XJwr4JerK2U_S85Z10-Lhe_dnK9SL5j7CA7A78CwnhHQHcY4OfNOr2pDaW9hgOkTqKBCWPZ9PSSR9sfz9ljGdJCaRFTtYFjjW-EeDaH4Lb7pSfNCRoyGbmvg9LYJvJf4XTU2H0-vTX1OncSoyHd9Yq1BjbrpoWB6up8qQOivnc3S9AK11f-bL5xi6YcXHd-lgU3gKTaGFvNAZXYG0H5_OaDSz4Vlg_JLyRbeFO6H7cJrv',
  department: 'Design',
  empId: 'EMP-0142',
  location: 'Lahore, Pakistan',
  phone: '+880 1711-223344',
  address: 'Johar Town, Block G, Lahore',
  gender: 'Female',
  dob: '03 March 1994',
  bloodGroup: 'B+ Positive',
  maritalStatus: 'Single',
  nationality: 'Pakistani',
  joiningDate: '10 Feb 2020',
  reportingManager: {
    name: 'Aqsa',
    role: 'Design Department Lead',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGYbO589VOTATEVvsbR5nyyOSwLBLuKXOxbFTAMEVyEEoVKEAscptTr1Fw8iGYSdAB1g1J5Y2Vx6y8Ypywrc1QuHnwiu6JKqVnuiQ75E-Zl1lklVnZju58LXg4EI6rxi76D29F_QaeZ2oRg09f6FoJmK_QL6Z8b3aMDi0bl53XwFkCgcHB8gkqEbh1qkmBlu_dlAs6b6vNmeVUXXkWqoQmRb8581biV9eH9oJ2xg2_FZghdAbak5L'
  },
  baseSalary: 185000,
  status: 'Active'
};

export const CURRENT_USER: UserProfile = ADMIN_USER;

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    empId: 'EMP-0001',
    name: 'Raja Raza',
    designation: 'Director & System Admin',
    department: 'Operations',
    email: 'rajaraza300@gmail.com',
    phone: '+92 314 5338340',
    status: 'Active',
    joiningDate: '15 Jan 2021',
    avatar: '/raja_raza.jpg',
    gender: 'Male',
    dob: '14 Aug 1992',
    address: 'Executive Heights, Gulberg III, Lahore',
    reportingManager: 'Executive Board',
    baseSalary: 450000
  },
  {
    id: 'emp-2',
    empId: 'EMP-0142',
    name: 'Rani',
    designation: 'UI/UX Visual Designer',
    department: 'Design',
    email: 'Rani@designerinsight.online',
    phone: '+880 1711-223344',
    status: 'Active',
    joiningDate: '10 Feb 2020',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSANbGI_8XJwr4JerK2U_S85Z10-Lhe_dnK9SL5j7CA7A78CwnhHQHcY4OfNOr2pDaW9hgOkTqKBCWPZ9PSSR9sfz9ljGdJCaRFTtYFjjW-EeDaH4Lb7pSfNCRoyGbmvg9LYJvJf4XTU2H0-vTX1OncSoyHd9Yq1BjbrpoWB6up8qQOivnc3S9AK11f-bL5xi6YcXHd-lgU3gKTaGFvNAZXYG0H5_OaDSz4Vlg_JLyRbeFO6H7cJrv',
    gender: 'Female',
    dob: '03 Mar 1994',
    address: 'Johar Town, Block G, Lahore',
    reportingManager: 'Aqsa',
    baseSalary: 185000
  },
  {
    id: 'emp-3',
    empId: 'EMP-0103',
    name: 'Aqsa',
    designation: 'Design Department Lead',
    department: 'Design',
    email: 'aqsa@designerinsight.online',
    phone: '+1 (555) 234-5678',
    status: 'Active',
    joiningDate: '12 Mar 2019',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGYbO589VOTATEVvsbR5nyyOSwLBLuKXOxbFTAMEVyEEoVKEAscptTr1Fw8iGYSdAB1g1J5Y2Vx6y8Ypywrc1QuHnwiu6JKqVnuiQ75E-Zl1lklVnZju58LXg4EI6rxi76D29F_QaeZ2oRg09f6FoJmK_QL6Z8b3aMDi0bl53XwFkCgcHB8gkqEbh1qkmBlu_dlAs6b6vNmeVUXXkWqoQmRb8581biV9eH9oJ2xg2_FZghdAbak5L',
    gender: 'Female',
    dob: '18 May 1990',
    address: 'DHA Phase 5, Lahore',
    reportingManager: 'Raja Raza',
    baseSalary: 320000
  },
  {
    id: 'emp-4',
    empId: 'EMP-0109',
    name: 'Iqra Pervaiz',
    designation: 'Senior Frontend Engineer',
    department: 'Engineering',
    email: 'iqrapervaiz123@gmail.com',
    phone: '+92 333 4628135',
    status: 'Active',
    joiningDate: '01 Mar 2023',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCygYhHxrgl5qRtqzjE6Q0wBw0qO07I1AgcE3f7rjT4Kvlk-h2eBlcyXzERuSG8QLwXvTln7dkB0evTz0_8d6XscH6Z-3ZscPI4rvjg4uAo_okgcs6zG4cqq6SF-bGnZraG6xC0yvzBhJ6reIdNoLS3uiyVM70IVXv4NOXel6TAoMvE_fZJ0Fbk50-6GNyyj9xAgi0SThZcppMO1pbPKw8HQ78s8IXlXstNFswBA7TOP-RXosHeF3X',
    gender: 'Female',
    dob: '30 Jun 1996',
    address: 'Model Town, Lahore',
    reportingManager: 'Raja Raza',
    baseSalary: 260000
  },
  {
    id: 'emp-5',
    empId: 'EMP-0110',
    name: 'Asim Khan',
    designation: 'Social Media Manager',
    department: 'Marketing',
    email: 'asim.khan@aurahrms.io',
    phone: '+92 321 9699310',
    status: 'Inactive',
    joiningDate: '15 Oct 2022',
    avatarInitials: 'AK',
    gender: 'Male',
    dob: '11 Sep 1994',
    address: 'Bahria Town, Sector C, Lahore',
    reportingManager: 'Raja Raza',
    baseSalary: 140000
  },
  {
    id: 'emp-6',
    empId: 'EMP-0111',
    name: 'Saba',
    designation: 'Video Editor',
    department: 'Marketing',
    email: 'saba@aurahrms.io',
    phone: '+880 1755-443322',
    status: 'Active',
    joiningDate: '05 Jan 2023',
    avatarInitials: 'SB',
    gender: 'Female',
    dob: '08 Feb 1997',
    address: 'Faisal Town, Lahore',
    reportingManager: 'Raja Raza',
    baseSalary: 135000
  }
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lev-1',
    employeeName: 'Rahim Uddin',
    department: 'Engineering',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSANbGI_8XJwr4JerK2U_S85Z10-Lhe_dnK9SL5j7CA7A78CwnhHQHcY4OfNOr2pDaW9hgOkTqKBCWPZ9PSSR9sfz9ljGdJCaRFTtYFjjW-EeDaH4Lb7pSfNCRoyGbmvg9LYJvJf4XTU2H0-vTX1OncSoyHd9Yq1BjbrpoWB6up8qQOivnc3S9AK11f-bL5xi6YcXHd-lgU3gKTaGFvNAZXYG0H5_OaDSz4Vlg_JLyRbeFO6H7cJrv',
    leaveType: 'Casual Leave',
    duration: '3 Days',
    startDate: '12 May 2025',
    endDate: '14 May 2025',
    daysCount: 3,
    reason: 'Family wedding event in Sylhet.',
    status: 'Pending',
    appliedDate: '08 May 2025'
  },
  {
    id: 'lev-2',
    employeeName: 'Sarah Rahman',
    department: 'Marketing',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5IchO3RZGm0f-HVXMJ2KxT1l2SPNekW2kVOsggoKpVozxw1zaldbKe88nR15OTuPadqt_G7uE6prssjL5xoTgVCGTpoza8BFq1s1jhzKiaXW7oZKPC9tygDzBzxnsHNiu2qwkIO4zmOCcexW7kiM1D9FmeO5X-YHAWr5NitUEE2fZ6T5TkPRNQb3uPDz0rR1Mnot8atZ8vqQ5D0tFqEAqa-TfiXb4wekFZpoBxlHR6R4nrLDWUoI1',
    leaveType: 'Sick Leave',
    duration: '2 Days',
    startDate: '15 May 2025',
    endDate: '16 May 2025',
    daysCount: 2,
    reason: 'Medical checkup and recovery prescribed by doctor.',
    status: 'Pending',
    appliedDate: '10 May 2025'
  },
  {
    id: 'lev-3',
    employeeName: 'Sumaiya Akter',
    department: 'HR',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADQcAFIWDJ8g7APl2aOjC7M5drmvNeR0adkjwJQVVuoFudHVArwpni00b8CM7KOAHa7oxn4kKlj8AuLw3DQ5q7z72A_M7SyQJfWE_Omi_kh3T0W41JFx5OUziSGWqpzvo0veD9kqf54hae4mDr7abyGMq79swnEo0j598XUbb2OXswI5H1s5qlM86vEdiXh_udAlNHwMxSXuvt-XFNIbqvvlG-ZjCtCUI--j3MBmfhy7XMikuswA27',
    leaveType: 'Annual Leave',
    duration: '5 Days',
    startDate: '20 May 2025',
    endDate: '24 May 2025',
    daysCount: 5,
    reason: 'Annual vacation trip with family.',
    status: 'Approved',
    appliedDate: '02 May 2025'
  },
  {
    id: 'lev-4',
    employeeName: 'David Chen',
    department: 'Engineering',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCygYhHxrgl5qRtqzjE6Q0wBw0qO07I1AgcE3f7rjT4Kvlk-h2eBlcyXzERuSG8QLwXvTln7dkB0evTz0_8d6XscH6Z-3ZscPI4rvjg4uAo_okgcs6zG4cqq6SF-bGnZraG6xC0yvzBhJ6reIdNoLS3uiyVM70IVXv4NOXel6TAoMvE_fZJ0Fbk50-6GNyyj9xAgi0SThZcppMO1pbPKw8HQ78s8IXlXstNFswBA7TOP-RXosHeF3X',
    leaveType: 'Casual Leave',
    duration: '1 Day',
    startDate: '18 May 2025',
    endDate: '18 May 2025',
    daysCount: 1,
    reason: 'Personal urgent bank paperwork.',
    status: 'Pending',
    appliedDate: '11 May 2025'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-hist-01',
    empId: 'EMP-0001',
    employeeName: 'Raja Raza',
    department: 'Operations',
    avatar: '/raja_raza.jpg',
    avatarInitials: 'RR',
    date: '2026-09-01',
    displayDate: '01 Sep 2026',
    dayName: 'Tuesday',
    shift: 'Regular (09:00 AM – 06:00 PM)',
    clockIn: '08:58 AM',
    clockOut: '06:03 PM',
    breakMinutes: 60,
    totalHrs: '8h 05m',
    overtime: '0h 05m',
    status: 'Present',
    lateDuration: '--',
    remarks: 'Punctual check-in',
    recordedBy: 'Self'
  },
  {
    id: 'att-hist-02',
    empId: 'EMP-0142',
    employeeName: 'Rani',
    department: 'Design',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSANbGI_8XJwr4JerK2U_S85Z10-Lhe_dnK9SL5j7CA7A78CwnhHQHcY4OfNOr2pDaW9hgOkTqKBCWPZ9PSSR9sfz9ljGdJCaRFTtYFjjW-EeDaH4Lb7pSfNCRoyGbmvg9LYJvJf4XTU2H0-vTX1OncSoyHd9Yq1BjbrpoWB6up8qQOivnc3S9AK11f-bL5xi6YcXHd-lgU3gKTaGFvNAZXYG0H5_OaDSz4Vlg_JLyRbeFO6H7cJrv',
    avatarInitials: 'RA',
    date: '2026-09-01',
    displayDate: '01 Sep 2026',
    dayName: 'Tuesday',
    shift: 'Regular (09:00 AM – 06:00 PM)',
    clockIn: '09:04 AM',
    clockOut: '06:00 PM',
    breakMinutes: 45,
    totalHrs: '8h 11m',
    overtime: '0h 11m',
    status: 'Present',
    lateDuration: '--',
    remarks: 'UI sprint review',
    recordedBy: 'Self'
  },
  {
    id: 'att-hist-03',
    empId: 'EMP-0103',
    employeeName: 'Aqsa',
    department: 'Design',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGYbO589VOTATEVvsbR5nyyOSwLBLuKXOxbFTAMEVyEEoVKEAscptTr1Fw8iGYSdAB1g1J5Y2Vx6y8Ypywrc1QuHnwiu6JKqVnuiQ75E-Zl1lklVnZju58LXg4EI6rxi76D29F_QaeZ2oRg09f6FoJmK_QL6Z8b3aMDi0bl53XwFkCgcHB8gkqEbh1qkmBlu_dlAs6b6vNmeVUXXkWqoQmRb8581biV9eH9oJ2xg2_FZghdAbak5L',
    avatarInitials: 'AQ',
    date: '2026-09-01',
    displayDate: '01 Sep 2026',
    dayName: 'Tuesday',
    shift: 'Regular (09:00 AM – 06:00 PM)',
    clockIn: '08:52 AM',
    clockOut: '06:15 PM',
    breakMinutes: 60,
    totalHrs: '8h 23m',
    overtime: '0h 23m',
    status: 'Present',
    lateDuration: '--',
    remarks: 'Design system tokens sync',
    recordedBy: 'Self'
  },
  {
    id: 'att-hist-04',
    empId: 'EMP-0109',
    employeeName: 'Iqra Pervaiz',
    department: 'Engineering',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCygYhHxrgl5qRtqzjE6Q0wBw0qO07I1AgcE3f7rjT4Kvlk-h2eBlcyXzERuSG8QLwXvTln7dkB0evTz0_8d6XscH6Z-3ZscPI4rvjg4uAo_okgcs6zG4cqq6SF-bGnZraG6xC0yvzBhJ6reIdNoLS3uiyVM70IVXv4NOXel6TAoMvE_fZJ0Fbk50-6GNyyj9xAgi0SThZcppMO1pbPKw8HQ78s8IXlXstNFswBA7TOP-RXosHeF3X',
    avatarInitials: 'IP',
    date: '2026-09-01',
    displayDate: '01 Sep 2026',
    dayName: 'Tuesday',
    shift: 'Regular (09:00 AM – 06:00 PM)',
    clockIn: '09:22 AM',
    clockOut: '06:30 PM',
    breakMinutes: 60,
    totalHrs: '8h 08m',
    overtime: '0h 08m',
    status: 'Late',
    lateDuration: '22 min',
    remarks: 'Traffic congestion at Canal Road',
    recordedBy: 'Self'
  },
  {
    id: 'att-hist-05',
    empId: 'EMP-0104',
    employeeName: 'David Rodriguez',
    department: 'Engineering',
    avatarInitials: 'DR',
    date: '2026-09-01',
    displayDate: '01 Sep 2026',
    dayName: 'Tuesday',
    shift: 'Regular (09:00 AM – 06:00 PM)',
    clockIn: '08:45 AM',
    clockOut: '06:10 PM',
    breakMinutes: 50,
    totalHrs: '8h 35m',
    overtime: '0h 35m',
    status: 'Present',
    lateDuration: '--',
    remarks: 'Architecture sprint review',
    recordedBy: 'Self'
  },
  {
    id: 'att-hist-06',
    empId: 'EMP-0105',
    employeeName: 'Sarah Rahman',
    department: 'Marketing',
    avatarInitials: 'SR',
    date: '2026-09-01',
    displayDate: '01 Sep 2026',
    dayName: 'Tuesday',
    shift: 'Regular (09:00 AM – 06:00 PM)',
    clockIn: '09:00 AM',
    clockOut: '06:00 PM',
    breakMinutes: 60,
    totalHrs: '8h 00m',
    overtime: '0h 00m',
    status: 'Present',
    lateDuration: '--',
    remarks: 'Marketing campaign kickoff',
    recordedBy: 'Self'
  }
];

export const INITIAL_ACTIVE_INTERVIEWS: ActiveInterview[] = [
  {
    id: 'int-1',
    candidateName: 'Zubair Ahmed',
    candidateEmail: 'zubair.ahmed@example.com',
    jobTitle: 'Senior Frontend Developer',
    department: 'Engineering',
    interviewer: 'Raja Raza & Iqra Pervaiz',
    date: 'Today, 14 May 2025',
    time: '03:00 PM – 04:00 PM',
    stage: 'Technical Round 1',
    mode: 'Google Meet',
    status: 'Scheduled',
    notes: 'Focus on React 19 concurrent features, TypeScript generics, and state architecture.'
  },
  {
    id: 'int-2',
    candidateName: 'Marium Siddiqui',
    candidateEmail: 'marium.design@example.com',
    jobTitle: 'UX/UI Product Designer',
    department: 'Design',
    interviewer: 'Aqsa & Rani',
    date: 'Tomorrow, 15 May 2025',
    time: '11:30 AM – 12:30 PM',
    stage: 'System Design',
    mode: 'Zoom',
    status: 'Scheduled',
    notes: 'Portfolio walkthrough for mobile banking and design system governance.'
  },
  {
    id: 'int-3',
    candidateName: 'Bilal Tariq',
    candidateEmail: 'bilal.tariq@example.com',
    jobTitle: 'Growth Marketing Manager',
    department: 'Marketing',
    interviewer: 'Raja Raza',
    date: '16 May 2025',
    time: '02:00 PM – 02:45 PM',
    stage: 'HR Screening',
    mode: 'Google Meet',
    status: 'Scheduled',
    notes: 'Paid acquisition strategy, CAC/LTV benchmarks, and SEO attribution.'
  },
  {
    id: 'int-4',
    candidateName: 'Hassan Raza',
    candidateEmail: 'hassan.ai@example.com',
    jobTitle: 'Lead Data Scientist',
    department: 'Engineering',
    interviewer: 'Raja Raza',
    date: '18 May 2025',
    time: '04:30 PM – 05:30 PM',
    stage: 'Executive Final',
    mode: 'In-Person',
    status: 'Scheduled',
    notes: 'Compensation alignment and executive culture fit interview.'
  }
];

export const INITIAL_HIRING_VELOCITY: HiringVelocityMetric[] = [
  {
    id: 'vel-1',
    department: 'Engineering',
    averageDays: 14,
    targetDays: 16,
    offerAcceptanceRate: 92,
    openRoles: 2,
    trend: 'faster'
  },
  {
    id: 'vel-2',
    department: 'Design',
    averageDays: 12,
    targetDays: 14,
    offerAcceptanceRate: 95,
    openRoles: 1,
    trend: 'faster'
  },
  {
    id: 'vel-3',
    department: 'Marketing',
    averageDays: 19,
    targetDays: 18,
    offerAcceptanceRate: 84,
    openRoles: 1,
    trend: 'on-track'
  },
  {
    id: 'vel-4',
    department: 'Operations',
    averageDays: 10,
    targetDays: 12,
    offerAcceptanceRate: 98,
    openRoles: 1,
    trend: 'faster'
  }
];

export const INITIAL_JOB_OPENINGS: JobOpening[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Lahore, PK (Hybrid)',
    type: 'Full-time',
    applicantsCount: 48,
    status: 'Active',
    icon: 'Code2',
    postedDate: '3 days ago',
    salaryRange: 'Rs. 250,000 – 350,000 PKR / mo',
    experience: '4+ Years',
    description: 'We are seeking an experienced Frontend Developer proficient in React, TypeScript, and modern state architectures.',
    requirements: ['4+ years React & TypeScript', 'State management & SSR experience', 'UI component design system mastery']
  },
  {
    id: 'job-2',
    title: 'UX/UI Product Designer',
    department: 'Design',
    location: 'Karachi, PK (Remote)',
    type: 'Full-time',
    applicantsCount: 64,
    status: 'Active',
    icon: 'Palette',
    postedDate: '1 week ago',
    salaryRange: 'Rs. 180,000 – 260,000 PKR / mo',
    experience: '3+ Years',
    description: 'Lead end-to-end design sprints, wireframing, interactive prototyping, and cross-platform design libraries.',
    requirements: ['Figma design systems', 'Usability testing & research', 'Micro-interactions & animation skills']
  },
  {
    id: 'job-3',
    title: 'Growth Marketing Manager',
    department: 'Marketing',
    location: 'Islamabad, PK (On-site)',
    type: 'Full-time',
    applicantsCount: 22,
    status: 'Active',
    icon: 'Megaphone',
    postedDate: '2 weeks ago',
    salaryRange: 'Rs. 160,000 – 220,000 PKR / mo',
    experience: '3+ Years',
    description: 'Drive high-conversion multi-channel growth campaigns, paid acquisitions, and customer retention funnels.',
    requirements: ['Performance marketing & SEO', 'Analytics tracking & attribution', 'Copywriting and content leadership']
  },
  {
    id: 'job-4',
    title: 'Lead Data Scientist',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    applicantsCount: 15,
    status: 'Active',
    icon: 'BrainCircuit',
    postedDate: '4 days ago',
    salaryRange: 'Rs. 320,000 – 450,000 PKR / mo',
    experience: '5+ Years',
    description: 'Architect machine learning pipelines, predictive analytics models, and big-data statistical infrastructure.',
    requirements: ['Python, PyTorch, SQL', 'MLOps & model deployment', 'Predictive modeling and telemetry']
  },
  {
    id: 'job-5',
    title: 'Talent Acquisition Partner',
    department: 'HR',
    location: 'Lahore, PK (Hybrid)',
    type: 'Full-time',
    applicantsCount: 31,
    status: 'Active',
    icon: 'UserPlus',
    postedDate: '5 days ago',
    salaryRange: 'Rs. 130,000 – 180,000 PKR / mo',
    experience: '2+ Years',
    description: 'Manage executive hiring pipelines, candidate interview rounds, technical assessments, and onboarding.',
    requirements: ['Tech recruitment experience', 'Candidate sourcing & screening', 'HRIS & applicant tracking mastery']
  }
];

export const INITIAL_PAYROLL_RECORDS: PayrollRecord[] = [
  {
    id: 'pay-1',
    empId: 'EMP-0001',
    employeeName: 'Raja Raza',
    department: 'Operations',
    designation: 'HR Director & System Admin',
    baseSalary: 320000,
    allowances: 48000,
    deductions: 25600,
    netSalary: 342400,
    status: 'Paid',
    paymentDate: '28 May 2025',
    month: 'May 2025',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQndi0Q67LuyTUAs8C_7ptSSpWoFH67QhVbLxfJfqqymbTF0-ImTvZteCBSvRhku41rEwtRkkZ2yuI6nQmZb0BfCOfoZGNID_PEOn4VWAWuKVpWR7Ik8bXButYDHroiVhejf7BUJNlr5RCQjELnvfecxNjb3pdO-wFiNm8ZRyrk3KjzJktBW6t2HdB8uvLEdFXWKFvdGX3obC3EyYo3QUO3PVDq-c-ap2YZgHP_1pncDG6fIUYwwl',
    paymentMethod: 'Bank Wire Transfer'
  },
  {
    id: 'pay-2',
    empId: 'EMP-0142',
    employeeName: 'Rani',
    department: 'Design',
    designation: 'UI/UX Visual Designer',
    baseSalary: 145000,
    allowances: 21750,
    deductions: 11600,
    netSalary: 155150,
    status: 'Paid',
    paymentDate: '28 May 2025',
    month: 'May 2025',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSANbGI_8XJwr4JerK2U_S85Z10-Lhe_dnK9SL5j7CA7A78CwnhHQHcY4OfNOr2pDaW9hgOkTqKBCWPZ9PSSR9sfz9ljGdJCaRFTtYFjjW-EeDaH4Lb7pSfNCRoyGbmvg9LYJvJf4XTU2H0-vTX1OncSoyHd9Yq1BjbrpoWB6up8qQOivnc3S9AK11f-bL5xi6YcXHd-lgU3gKTaGFvNAZXYG0H5_OaDSz4Vlg_JLyRbeFO6H7cJrv',
    paymentMethod: 'Direct Deposit'
  },
  {
    id: 'pay-3',
    empId: 'EMP-0103',
    employeeName: 'Aqsa',
    department: 'Design',
    designation: 'Design Department Lead',
    baseSalary: 280000,
    allowances: 42000,
    deductions: 22400,
    netSalary: 299600,
    status: 'Paid',
    paymentDate: '28 May 2025',
    month: 'May 2025',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGYbO589VOTATEVvsbR5nyyOSwLBLuKXOxbFTAMEVyEEoVKEAscptTr1Fw8iGYSdAB1g1J5Y2Vx6y8Ypywrc1QuHnwiu6JKqVnuiQ75E-Zl1lklVnZju58LXg4EI6rxi76D29F_QaeZ2oRg09f6FoJmK_QL6Z8b3aMDi0bl53XwFkCgcHB8gkqEbh1qkmBlu_dlAs6b6vNmeVUXXkWqoQmRb8581biV9eH9oJ2xg2_FZghdAbak5L',
    paymentMethod: 'Direct Deposit'
  },
  {
    id: 'pay-4',
    empId: 'EMP-0102',
    employeeName: 'Sumaiya Akter',
    department: 'HR',
    designation: 'HR Specialist',
    baseSalary: 95000,
    allowances: 14250,
    deductions: 7600,
    netSalary: 101650,
    status: 'Processing',
    paymentDate: 'Pending',
    month: 'May 2025',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADQcAFIWDJ8g7APl2aOjC7M5drmvNeR0adkjwJQVVuoFudHVArwpni00b8CM7KOAHa7oxn4kKlj8AuLw3DQ5q7z72A_M7SyQJfWE_Omi_kh3T0W41JFx5OUziSGWqpzvo0veD9kqf54hae4mDr7abyGMq79swnEo0j598XUbb2OXswI5H1s5qlM86vEdiXh_udAlNHwMxSXuvt-XFNIbqvvlG-ZjCtCUI--j3MBmfhy7XMikuswA27',
    paymentMethod: 'Direct Deposit'
  },
  {
    id: 'pay-5',
    empId: 'EMP-0104',
    employeeName: 'David Rodriguez',
    department: 'Engineering',
    designation: 'Chief Technology Officer',
    baseSalary: 350000,
    allowances: 52500,
    deductions: 28000,
    netSalary: 374500,
    status: 'Paid',
    paymentDate: '28 May 2025',
    month: 'May 2025',
    avatarInitials: 'DR',
    paymentMethod: 'Bank Wire Transfer'
  },
  {
    id: 'pay-6',
    empId: 'EMP-0105',
    employeeName: 'Sarah Rahman',
    department: 'Marketing',
    designation: 'Marketing Director',
    baseSalary: 130000,
    allowances: 19500,
    deductions: 10400,
    netSalary: 139100,
    status: 'Paid',
    paymentDate: '28 May 2025',
    month: 'May 2025',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5IchO3RZGm0f-HVXMJ2KxT1l2SPNekW2kVOsggoKpVozxw1zaldbKe88nR15OTuPadqt_G7uE6prssjL5xoTgVCGTpoza8BFq1s1jhzKiaXW7oZKPC9tygDzBzxnsHNiu2qwkIO4zmOCcexW7kiM1D9FmeO5X-YHAWr5NitUEE2fZ6T5TkPRNQb3uPDz0rR1Mnot8atZ8vqQ5D0tFqEAqa-TfiXb4wekFZpoBxlHR6R4nrLDWUoI1',
    paymentMethod: 'Direct Deposit'
  },
  {
    id: 'pay-7',
    empId: 'EMP-0106',
    employeeName: 'Alex Morgan',
    department: 'Engineering',
    designation: 'Lead DevOps Architect',
    baseSalary: 175000,
    allowances: 26250,
    deductions: 14000,
    netSalary: 187250,
    status: 'On Hold',
    paymentDate: 'Pending Verification',
    month: 'May 2025',
    avatarInitials: 'AM',
    paymentMethod: 'Bank Wire Transfer'
  }
];

export const INITIAL_ASSETS: AssetItem[] = [
  {
    id: 'ast-1',
    name: 'MacBook Pro 16" M3 Max',
    serialNumber: 'APL-MBP-9921',
    category: 'Laptop',
    assignedTo: {
      id: 'emp-1',
      name: 'Raja Raza',
      empId: 'EMP-0001',
      department: 'Operations',
      avatar: '/raja_raza.jpg'
    },
    valuePkr: 890000,
    purchaseDate: '15 Jan 2024',
    status: 'Allocated',
    specs: 'M3 Max 16-Core CPU, 40-Core GPU, 64GB RAM, 2TB SSD'
  },
  {
    id: 'ast-2',
    name: 'Dell UltraSharp 32" 4K Thunderbolt Monitor',
    serialNumber: 'DEL-U32-4019',
    category: 'Display',
    assignedTo: {
      id: 'emp-2',
      name: 'Rani',
      empId: 'EMP-0142',
      department: 'Design',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSANbGI_8XJwr4JerK2U_S85Z10-Lhe_dnK9SL5j7CA7A78CwnhHQHcY4OfNOr2pDaW9hgOkTqKBCWPZ9PSSR9sfz9ljGdJCaRFTtYFjjW-EeDaH4Lb7pSfNCRoyGbmvg9LYJvJf4XTU2H0-vTX1OncSoyHd9Yq1BjbrpoWB6up8qQOivnc3S9AK11f-bL5xi6YcXHd-lgU3gKTaGFvNAZXYG0H5_OaDSz4Vlg_JLyRbeFO6H7cJrv'
    },
    valuePkr: 265000,
    purchaseDate: '20 Feb 2024',
    status: 'Allocated',
    specs: 'IPS Black panel, 98% DCI-P3, 90W Power Delivery'
  },
  {
    id: 'ast-3',
    name: 'Figma Enterprise Organization Suite',
    serialNumber: 'DIG-FIG-ORG-2025',
    category: 'Digital Product',
    assignedTo: {
      id: 'emp-3',
      name: 'Aqsa',
      empId: 'EMP-0103',
      department: 'Design',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGYbO589VOTATEVvsbR5nyyOSwLBLuKXOxbFTAMEVyEEoVKEAscptTr1Fw8iGYSdAB1g1J5Y2Vx6y8Ypywrc1QuHnwiu6JKqVnuiQ75E-Zl1lklVnZju58LXg4EI6rxi76D29F_QaeZ2oRg09f6FoJmK_QL6Z8b3aMDi0bl53XwFkCgcHB8gkqEbh1qkmBlu_dlAs6b6vNmeVUXXkWqoQmRb8581biV9eH9oJ2xg2_FZghdAbak5L'
    },
    valuePkr: 340000,
    purchaseDate: '01 Jan 2025',
    status: 'Allocated',
    specs: 'Design System Analytics, Unlimited Dev Mode seats, Single Sign-On (SSO)',
    licenseKey: 'FIG-ENT-9948-ORGA-PAK',
    renewalDate: '01 Jan 2026',
    seatsCount: 25
  },
  {
    id: 'ast-4',
    name: 'Adobe Creative Cloud All Apps Enterprise',
    serialNumber: 'DIG-ADB-CC-8821',
    category: 'Digital Product',
    assignedTo: {
      id: 'emp-2',
      name: 'Rani',
      empId: 'EMP-0142',
      department: 'Design',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSANbGI_8XJwr4JerK2U_S85Z10-Lhe_dnK9SL5j7CA7A78CwnhHQHcY4OfNOr2pDaW9hgOkTqKBCWPZ9PSSR9sfz9ljGdJCaRFTtYFjjW-EeDaH4Lb7pSfNCRoyGbmvg9LYJvJf4XTU2H0-vTX1OncSoyHd9Yq1BjbrpoWB6up8qQOivnc3S9AK11f-bL5xi6YcXHd-lgU3gKTaGFvNAZXYG0H5_OaDSz4Vlg_JLyRbeFO6H7cJrv'
    },
    valuePkr: 280000,
    purchaseDate: '15 Feb 2025',
    status: 'Allocated',
    specs: 'Photoshop, Illustrator, After Effects, Premiere Pro, Firefly GenAI credits',
    licenseKey: 'ADB-CC-ENT-4491-PRO',
    renewalDate: '15 Feb 2026',
    seatsCount: 10
  },
  {
    id: 'ast-5',
    name: 'GitHub Enterprise Cloud & Copilot Business',
    serialNumber: 'DIG-GH-ENT-7710',
    category: 'Digital Product',
    assignedTo: {
      id: 'emp-4',
      name: 'Iqra Pervaiz',
      empId: 'EMP-0109',
      department: 'Engineering',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCygYhHxrgl5qRtqzjE6Q0wBw0qO07I1AgcE3f7rjT4Kvlk-h2eBlcyXzERuSG8QLwXvTln7dkB0evTz0_8d6XscH6Z-3ZscPI4rvjg4uAo_okgcs6zG4cqq6SF-bGnZraG6xC0yvzBhJ6reIdNoLS3uiyVM70IVXv4NOXel6TAoMvE_fZJ0Fbk50-6GNyyj9xAgi0SThZcppMO1pbPKw8HQ78s8IXlXstNFswBA7TOP-RXosHeF3X'
    },
    valuePkr: 490000,
    purchaseDate: '01 Mar 2025',
    status: 'Allocated',
    specs: 'Advanced Security, Code scanning, Secret detection, Copilot Chat AI',
    licenseKey: 'GH-ENT-CLOUD-8829-CORP',
    renewalDate: '01 Mar 2026',
    seatsCount: 50
  },
  {
    id: 'ast-6',
    name: 'AWS Cloud Production Cluster & S3 Bucket',
    serialNumber: 'DIG-AWS-PROD-001',
    category: 'Cloud Resource',
    assignedTo: {
      id: 'emp-1',
      name: 'Raja Raza',
      empId: 'EMP-0001',
      department: 'Operations',
      avatar: '/raja_raza.jpg'
    },
    valuePkr: 650000,
    purchaseDate: '01 Jan 2025',
    status: 'Allocated',
    specs: 'us-east-1 VPC, Multi-AZ RDS Aurora, CloudFront CDN, WAF Security',
    renewalDate: 'Monthly Auto-Bill'
  },
  {
    id: 'ast-7',
    name: 'YubiKey 5C NFC Enterprise Key',
    serialNumber: 'YUB-5CN-8801',
    category: 'Security',
    assignedTo: {
      id: 'emp-1',
      name: 'Raja Raza',
      empId: 'EMP-0001',
      department: 'Operations',
      avatar: '/raja_raza.jpg'
    },
    valuePkr: 18500,
    purchaseDate: '01 Jan 2024',
    status: 'Allocated',
    specs: 'FIDO2 / WebAuthn, U2F, Smart Card hardware 2FA'
  },
  {
    id: 'ast-8',
    name: 'ThinkPad X1 Carbon Gen 11',
    serialNumber: 'LEN-X1C-5092',
    category: 'Laptop',
    valuePkr: 520000,
    purchaseDate: '05 Apr 2024',
    status: 'Available',
    specs: 'Intel Core i7-1365U vPro, 32GB LPDDR5, 1TB PCIe Gen4 SSD'
  },
  {
    id: 'ast-9',
    name: 'Herman Miller Aeron Ergonomic Chair',
    serialNumber: 'HM-AER-1240',
    category: 'Furniture',
    valuePkr: 380000,
    purchaseDate: '12 Nov 2023',
    status: 'Available',
    specs: 'Fully adjustable postureFit SL, Forward Tilt, Carbon mesh'
  }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'Insight HRM Enterprise Employee Handbook 2025.pdf',
    tag: 'Policy',
    size: '4.2 MB',
    updated: '2 days ago',
    fileFormat: 'PDF',
    description: 'Comprehensive code of conduct, remote work ethics, leave policies, and company culture guide.',
    uploadedBy: 'Raja Raza',
    restrictedTo: 'all',
    downloadCount: 482
  },
  {
    id: 'doc-2',
    name: 'Mutual Confidentiality & Standard NDA Agreement.docx',
    tag: 'Legal',
    size: '1.1 MB',
    updated: '1 week ago',
    fileFormat: 'DOCX',
    description: 'Standard proprietary information and invention assignment agreement for all full-time contractors & employees.',
    uploadedBy: 'Raja Raza',
    restrictedTo: 'all',
    downloadCount: 318
  },
  {
    id: 'doc-3',
    name: 'Comprehensive Health & Life Insurance Policy 2025.pdf',
    tag: 'Benefits',
    size: '6.8 MB',
    updated: 'May 2025',
    fileFormat: 'PDF',
    description: 'Corporate hospitalization coverage, outpatient reimbursement limits, and OPD network details in Pakistan.',
    uploadedBy: 'Sumaiya Akter',
    restrictedTo: 'all',
    downloadCount: 654
  },
  {
    id: 'doc-4',
    name: 'Hybrid & Remote Work Framework & Allowance Guide.pdf',
    tag: 'Workplace',
    size: '2.4 MB',
    updated: 'Apr 2025',
    fileFormat: 'PDF',
    description: 'Stipend allocation for home office setup, internet reimbursement rules, and core working hours protocol.',
    uploadedBy: 'Aqsa',
    restrictedTo: 'all',
    downloadCount: 512
  },
  {
    id: 'doc-5',
    name: 'FBR Tax Withholding & Provident Fund Compliance Matrix.pdf',
    tag: 'Tax',
    size: '3.5 MB',
    updated: 'Mar 2025',
    fileFormat: 'PDF',
    description: 'Salary tax calculation brackets under Pakistani tax laws, provident fund deductions, and annual tax certificates.',
    uploadedBy: 'Raja Raza',
    restrictedTo: 'admin-manager',
    downloadCount: 142
  }
];

export const UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    id: 'evt-1',
    title: "Employee Birthday",
    subtitle: "Sarah Rahman • Marketing",
    date: "18",
    month: "MAY",
    day: "18",
    type: "birthday",
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5IchO3RZGm0f-HVXMJ2KxT1l2SPNekW2kVOsggoKpVozxw1zaldbKe88nR15OTuPadqt_G7uE6prssjL5xoTgVCGTpoza8BFq1s1jhzKiaXW7oZKPC9tygDzBzxnsHNiu2qwkIO4zmOCcexW7kiM1D9FmeO5X-YHAWr5NitUEE2fZ6T5TkPRNQb3uPDz0rR1Mnot8atZ8vqQ5D0tFqEAqa-TfiXb4wekFZpoBxlHR6R4nrLDWUoI1'
  },
  {
    id: 'evt-2',
    title: "Work Anniversary",
    subtitle: "Rahim Uddin (5 Years) • Engineering",
    date: "22",
    month: "MAY",
    day: "22",
    type: "anniversary",
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSANbGI_8XJwr4JerK2U_S85Z10-Lhe_dnK9SL5j7CA7A78CwnhHQHcY4OfNOr2pDaW9hgOkTqKBCWPZ9PSSR9sfz9ljGdJCaRFTtYFjjW-EeDaH4Lb7pSfNCRoyGbmvg9LYJvJf4XTU2H0-vTX1OncSoyHd9Yq1BjbrpoWB6up8qQOivnc3S9AK11f-bL5xi6YcXHd-lgU3gKTaGFvNAZXYG0H5_OaDSz4Vlg_JLyRbeFO6H7cJrv'
  },
  {
    id: 'evt-3',
    title: "Payroll Processing",
    subtitle: "May Salary Disbursement Cycle",
    date: "28",
    month: "MAY",
    day: "28",
    type: "payroll"
  },
  {
    id: 'evt-4',
    title: "Training Program",
    subtitle: "Design Systems & AI Workflows",
    date: "02",
    month: "JUN",
    day: "02",
    type: "training"
  }
];

export const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'employee',
    description: 'New employee joined the Design team as Lead UI/UX Designer',
    highlightedText: 'Ayon Ahmed',
    timestamp: '2 hours ago'
  },
  {
    id: 'act-2',
    type: 'leave',
    description: 'submitted a Casual Leave request for 3 days',
    highlightedText: 'Rahim Uddin',
    timestamp: '4 hours ago'
  },
  {
    id: 'act-3',
    type: 'payroll',
    description: 'April 2025 payroll has been processed successfully for 1,248 employees',
    highlightedText: 'Finance Dept',
    timestamp: 'Yesterday at 5:30 PM'
  },
  {
    id: 'act-4',
    type: 'performance',
    description: 'completed Q1 360 Performance Review for Sarah Jenkins',
    highlightedText: 'David Rodriguez',
    timestamp: '2 days ago'
  },
  {
    id: 'act-5',
    type: 'document',
    description: 'Updated the Global Employee Handbook & NDA Policies 2025',
    highlightedText: 'HR Compliance',
    timestamp: '3 days ago'
  }
];

export const TOP_PERFORMERS: TopPerformer[] = [
  {
    id: 'tp-1',
    name: 'Rani',
    empId: 'EMP-0142',
    role: 'UI/UX Visual Designer',
    department: 'Design',
    score: 98,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSANbGI_8XJwr4JerK2U_S85Z10-Lhe_dnK9SL5j7CA7A78CwnhHQHcY4OfNOr2pDaW9hgOkTqKBCWPZ9PSSR9sfz9ljGdJCaRFTtYFjjW-EeDaH4Lb7pSfNCRoyGbmvg9LYJvJf4XTU2H0-vTX1OncSoyHd9Yq1BjbrpoWB6up8qQOivnc3S9AK11f-bL5xi6YcXHd-lgU3gKTaGFvNAZXYG0H5_OaDSz4Vlg_JLyRbeFO6H7cJrv',
    stars: 5,
    tag: 'Top Innovator'
  },
  {
    id: 'tp-2',
    name: 'Iqra Pervaiz',
    empId: 'EMP-0109',
    role: 'Senior Frontend Engineer',
    department: 'Engineering',
    score: 96,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCygYhHxrgl5qRtqzjE6Q0wBw0qO07I1AgcE3f7rjT4Kvlk-h2eBlcyXzERuSG8QLwXvTln7dkB0evTz0_8d6XscH6Z-3ZscPI4rvjg4uAo_okgcs6zG4cqq6SF-bGnZraG6xC0yvzBhJ6reIdNoLS3uiyVM70IVXv4NOXel6TAoMvE_fZJ0Fbk50-6GNyyj9xAgi0SThZcppMO1pbPKw8HQ78s8IXlXstNFswBA7TOP-RXosHeF3X',
    stars: 5,
    tag: 'Code Architect'
  },
  {
    id: 'tp-3',
    name: 'Aqsa',
    empId: 'EMP-0103',
    role: 'Design Department Lead',
    department: 'Design',
    score: 94,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGYbO589VOTATEVvsbR5nyyOSwLBLuKXOxbFTAMEVyEEoVKEAscptTr1Fw8iGYSdAB1g1J5Y2Vx6y8Ypywrc1QuHnwiu6JKqVnuiQ75E-Zl1lklVnZju58LXg4EI6rxi76D29F_QaeZ2oRg09f6FoJmK_QL6Z8b3aMDi0bl53XwFkCgcHB8gkqEbh1qkmBlu_dlAs6b6vNmeVUXXkWqoQmRb8581biV9eH9oJ2xg2_FZghdAbak5L',
    stars: 5,
    tag: 'Design Leadership'
  },
  {
    id: 'tp-4',
    name: 'Saba',
    empId: 'EMP-0111',
    role: 'Video Editor',
    department: 'Marketing',
    score: 90,
    avatarInitials: 'SB',
    stars: 4,
    tag: 'Creative Vanguard'
  }
];

export const RECENT_FEEDBACK: FeedbackItem[] = [
  {
    id: 'fb-1',
    fromName: 'Sarah Jenkins',
    toName: 'Ayon Ahmed',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGYbO589VOTATEVvsbR5nyyOSwLBLuKXOxbFTAMEVyEEoVKEAscptTr1Fw8iGYSdAB1g1J5Y2Vx6y8Ypywrc1QuHnwiu6JKqVnuiQ75E-Zl1lklVnZju58LXg4EI6rxi76D29F_QaeZ2oRg09f6FoJmK_QL6Z8b3aMDi0bl53XwFkCgcHB8gkqEbh1qkmBlu_dlAs6b6vNmeVUXXkWqoQmRb8581biV9eH9oJ2xg2_FZghdAbak5L',
    timeAgo: '2 hours ago',
    comment: 'Exceptional work redesigning the core enterprise flow! The consistency in design tokens and spatial clarity is world-class.'
  },
  {
    id: 'fb-2',
    fromName: 'David Rodriguez',
    toName: 'Rahim Uddin',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxxwgp1S_xgssIZegK3dERGVDZcLI9XQVUUm9It4Wm4oMN4NKizpZSI9fWQibKQdGBAI8RMzHaqD_HL4fSBoylnUj-ucusfkiJ8xXMyzcwvEM_rNaleKTzbfNS6NpSpcOYjnN7_IfN8HwVz4nDrcsjOoNXLw5OjxsykRRqh1lGToOo0hbnOQt7mnj54iEhfAtgCaAsqcivvqhMKtX2XVijkEYYxOy-VtUvvwosmtJodKaQSKIgpOb4',
    timeAgo: '1 day ago',
    comment: 'The zero-downtime database migration was executed flawlessly without any degradation in API latency. Outstanding work!'
  }
];

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New Leave Application',
    message: 'Rahim Uddin submitted a Casual Leave request (3 Days)',
    time: '10 min ago',
    read: false,
    type: 'leave'
  },
  {
    id: 'notif-2',
    title: 'New Employee Profile',
    message: 'Fatima Zohra was added to the Marketing team',
    time: '1 hour ago',
    read: false,
    type: 'employee'
  },
  {
    id: 'notif-3',
    title: 'Payroll Disbursed',
    message: 'Monthly payroll run for May 2025 is ready for review',
    time: '3 hours ago',
    read: false,
    type: 'payroll'
  },
  {
    id: 'notif-4',
    title: 'Performance Review Due',
    message: 'Q2 Performance reviews are now open for all department leads',
    time: 'Yesterday',
    read: true,
    type: 'alert'
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Approve Rahim Uddin\'s casual leave application',
    description: 'Verify 3-day sick leave balance and coordinate coverage with the engineering pod lead.',
    completed: false,
    status: 'Pending',
    pinned: true,
    priority: 'high',
    dueDate: 'Today',
    category: 'Leave',
    createdAt: 'Today at 09:15 AM',
    assignedTo: {
      id: 'emp-1',
      name: 'Ayon Ahmed',
      role: 'Lead UI/UX Designer & Admin',
      roleType: 'admin',
      department: 'Design',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQndi0Q67LuyTUAs8C_7ptSSpWoFH67QhVbLxfJfqqymbTF0-ImTvZteCBSvRhku41rEwtRkkZ2yuI6nQmZb0BfCOfoZGNID_PEOn4VWAWuKVpWR7Ik8bXButYDHroiVhejf7BUJNlr5RCQjELnvfecxNjb3pdO-wFiNm8ZRyrk3KjzJktBW6t2HdB8uvLEdFXWKFvdGX3obC3EyYo3QUO3PVDq-c-ap2YZgHP_1pncDG6fIUYwwl'
    },
    assignedBy: {
      id: 'emp-4',
      name: 'Sarah Jenkins',
      role: 'VP of Product Design',
      roleType: 'manager',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGYbO589VOTATEVvsbR5nyyOSwLBLuKXOxbFTAMEVyEEoVKEAscptTr1Fw8iGYSdAB1g1J5Y2Vx6y8Ypywrc1QuHnwiu6JKqVnuiQ75E-Zl1lklVnZju58LXg4EI6rxi76D29F_QaeZ2oRg09f6FoJmK_QL6Z8b3aMDi0bl53XwFkCgcHB8gkqEbh1qkmBlu_dlAs6b6vNmeVUXXkWqoQmRb8581biV9eH9oJ2xg2_FZghdAbak5L'
    },
    department: 'Design',
    tags: ['HR Approvals', 'Urgent Coverage'],
    attachments: [
      {
        id: 'att-1',
        name: 'leave_medical_certificate.jpg',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
        size: '1.4 MB',
        uploadedAt: 'Today at 09:18 AM',
        source: 'upload'
      },
      {
        id: 'att-2',
        name: 'coverage_schedule_q2.pdf',
        type: 'pdf',
        url: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=600&q=80',
        size: '420 KB',
        uploadedAt: 'Today at 09:20 AM',
        source: 'upload'
      }
    ]
  },
  {
    id: 'task-2',
    title: 'Review Q2 design team performance appraisals',
    description: 'Calibrate scores for 4 junior designers and prepare executive promotion dossier.',
    completed: false,
    status: 'In Progress',
    pinned: true,
    priority: 'high',
    dueDate: 'Tomorrow',
    category: 'Performance',
    createdAt: 'Yesterday at 04:30 PM',
    assignedTo: {
      id: 'emp-4',
      name: 'Sarah Jenkins',
      role: 'VP of Product Design',
      roleType: 'manager',
      department: 'Design',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGYbO589VOTATEVvsbR5nyyOSwLBLuKXOxbFTAMEVyEEoVKEAscptTr1Fw8iGYSdAB1g1J5Y2Vx6y8Ypywrc1QuHnwiu6JKqVnuiQ75E-Zl1lklVnZju58LXg4EI6rxi76D29F_QaeZ2oRg09f6FoJmK_QL6Z8b3aMDi0bl53XwFkCgcHB8gkqEbh1qkmBlu_dlAs6b6vNmeVUXXkWqoQmRb8581biV9eH9oJ2xg2_FZghdAbak5L'
    },
    assignedBy: {
      id: 'emp-1',
      name: 'Ayon Ahmed',
      role: 'Lead UI/UX Designer & Admin',
      roleType: 'admin',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQndi0Q67LuyTUAs8C_7ptSSpWoFH67QhVbLxfJfqqymbTF0-ImTvZteCBSvRhku41rEwtRkkZ2yuI6nQmZb0BfCOfoZGNID_PEOn4VWAWuKVpWR7Ik8bXButYDHroiVhejf7BUJNlr5RCQjELnvfecxNjb3pdO-wFiNm8ZRyrk3KjzJktBW6t2HdB8uvLEdFXWKFvdGX3obC3EyYo3QUO3PVDq-c-ap2YZgHP_1pncDG6fIUYwwl'
    },
    department: 'Design',
    tags: ['Quarterly Review', 'Design Leadership'],
    attachments: [
      {
        id: 'att-3',
        name: 'ux_design_scorecards_matrix.png',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
        size: '2.1 MB',
        uploadedAt: 'Yesterday at 04:35 PM',
        source: 'generated'
      }
    ]
  },
  {
    id: 'task-3',
    title: 'Sign off May payroll disbursement batch',
    description: 'Ensure statutory tax withholding, bonus calculations, and overtime payouts are balanced.',
    completed: false,
    status: 'In Progress',
    pinned: false,
    priority: 'medium',
    dueDate: '28 May',
    category: 'Payroll',
    createdAt: '2 days ago',
    assignedTo: {
      id: 'emp-8',
      name: 'James Wilson',
      role: 'Financial Analyst',
      roleType: 'employee',
      department: 'Finance',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYuWL1I268A8mrdo_oo6Ogy_tSmASTaEJzJe3YhKGlNgG-oTNLpoHtIfy51vMDxhlTEaMNdg0f8nYuwf5pN1P1s8ipRI8UPvU8ubP4jIzk2XVX6dnAtOqx4Sdgx7ApP-rb9yAJfNQc0srAr64oJ2RuzqXKIX5b5AdPGEulshBmBcxQEgBpu8GVCjNiIbRRMND0n1IrG9SqpcfdNHqJyikzXSu_9Yhs3J1sOs9pR-ahVBP6E3C1G0-m'
    },
    assignedBy: {
      id: 'emp-1',
      name: 'Ayon Ahmed',
      role: 'Lead UI/UX Designer & Admin',
      roleType: 'admin',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQndi0Q67LuyTUAs8C_7ptSSpWoFH67QhVbLxfJfqqymbTF0-ImTvZteCBSvRhku41rEwtRkkZ2yuI6nQmZb0BfCOfoZGNID_PEOn4VWAWuKVpWR7Ik8bXButYDHroiVhejf7BUJNlr5RCQjELnvfecxNjb3pdO-wFiNm8ZRyrk3KjzJktBW6t2HdB8uvLEdFXWKFvdGX3obC3EyYo3QUO3PVDq-c-ap2YZgHP_1pncDG6fIUYwwl'
    },
    department: 'Finance',
    tags: ['Payroll Run', 'Audit Compliance']
  },
  {
    id: 'task-4',
    title: 'Screen Senior Frontend Developer applicant resumes (48)',
    description: 'Shortlist top 8 candidates meeting React 19, TypeScript, and micro-frontend requirements.',
    completed: true,
    status: 'Completed',
    pinned: false,
    priority: 'medium',
    dueDate: 'Done',
    category: 'Recruitment',
    createdAt: '3 days ago',
    assignedTo: {
      id: 'emp-3',
      name: 'Sumaiya Akter',
      role: 'HR Specialist',
      roleType: 'employee',
      department: 'HR',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADQcAFIWDJ8g7APl2aOjC7M5drmvNeR0adkjwJQVVuoFudHVArwpni00b8CM7KOAHa7oxn4kKlj8AuLw3DQ5q7z72A_M7SyQJfWE_Omi_kh3T0W41JFx5OUziSGWqpzvo0veD9kqf54hae4mDr7abyGMq79swnEo0j598XUbb2OXswI5H1s5qlM86vEdiXh_udAlNHwMxSXuvt-XFNIbqvvlG-ZjCtCUI--j3MBmfhy7XMikuswA27'
    },
    assignedBy: {
      id: 'emp-5',
      name: 'David Rodriguez',
      role: 'Chief Technology Officer',
      roleType: 'manager',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxxwgp1S_xgssIZegK3dERGVDZcLI9XQVUUm9It4Wm4oMN4NKizpZSI9fWQibKQdGBAI8RMzHaqD_HL4fSBoylnUj-ucusfkiJ8xXMyzcwvEM_rNaleKTzbfNS6NpSpcOYjnN7_IfN8HwVz4nDrcsjOoNXLw5OjxsykRRqh1lGToOo0hbnOQt7mnj54iEhfAtgCaAsqcivvqhMKtX2XVijkEYYxOy-VtUvvwosmtJodKaQSKIgpOb4'
    },
    department: 'HR',
    tags: ['Tech Hiring', 'Pipeline']
  },
  {
    id: 'task-5',
    title: 'Verify NDA paperwork for new joiner Fatima Zohra',
    description: 'Ensure signed intellectual property assignment and identity verification documents are filed.',
    completed: false,
    status: 'Pending',
    pinned: false,
    priority: 'low',
    dueDate: 'Friday',
    category: 'Onboarding',
    createdAt: '1 day ago',
    assignedTo: {
      id: 'emp-3',
      name: 'Sumaiya Akter',
      role: 'HR Specialist',
      roleType: 'employee',
      department: 'HR',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADQcAFIWDJ8g7APl2aOjC7M5drmvNeR0adkjwJQVVuoFudHVArwpni00b8CM7KOAHa7oxn4kKlj8AuLw3DQ5q7z72A_M7SyQJfWE_Omi_kh3T0W41JFx5OUziSGWqpzvo0veD9kqf54hae4mDr7abyGMq79swnEo0j598XUbb2OXswI5H1s5qlM86vEdiXh_udAlNHwMxSXuvt-XFNIbqvvlG-ZjCtCUI--j3MBmfhy7XMikuswA27'
    },
    assignedBy: {
      id: 'emp-4',
      name: 'Sarah Jenkins',
      role: 'VP of Product Design',
      roleType: 'manager',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGYbO589VOTATEVvsbR5nyyOSwLBLuKXOxbFTAMEVyEEoVKEAscptTr1Fw8iGYSdAB1g1J5Y2Vx6y8Ypywrc1QuHnwiu6JKqVnuiQ75E-Zl1lklVnZju58LXg4EI6rxi76D29F_QaeZ2oRg09f6FoJmK_QL6Z8b3aMDi0bl53XwFkCgcHB8gkqEbh1qkmBlu_dlAs6b6vNmeVUXXkWqoQmRb8581biV9eH9oJ2xg2_FZghdAbak5L'
    },
    department: 'HR',
    tags: ['Compliance', 'New Joiner']
  },
  {
    id: 'task-6',
    title: 'Deploy infrastructure updates for database security patch',
    description: 'Apply security patches to PostgreSQL clusters with zero downtime failover.',
    completed: false,
    status: 'In Progress',
    pinned: false,
    priority: 'urgent',
    dueDate: 'Today',
    category: 'Engineering',
    createdAt: 'Today at 08:00 AM',
    assignedTo: {
      id: 'emp-7',
      name: 'Michael Lee',
      role: 'DevOps Architect',
      roleType: 'employee',
      department: 'Engineering',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwY4FYp5_M7k-ZIiDBaE9RxdEkkHIZ-0iOnrgx4tUXhpraXo8K9oa9lSO_8BcdC9WHYpoTRLi-yjLbZvTxlT0x6mMs2w-wcSvfhuXZ3jatECSogNvTrNSgDswwJxuHS57HgdFTQVtKswQtamvIRLtzLStl3GeYzoa-vq97chSsokir3mYCzjFrZx745AWtSH9Fb5B0ZbATFXXjldqEpQWtZDw8zhwcd-H7t0DPFPNQWokx08LQ2PfB'
    },
    assignedBy: {
      id: 'emp-5',
      name: 'David Rodriguez',
      role: 'Chief Technology Officer',
      roleType: 'manager',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxxwgp1S_xgssIZegK3dERGVDZcLI9XQVUUm9It4Wm4oMN4NKizpZSI9fWQibKQdGBAI8RMzHaqD_HL4fSBoylnUj-ucusfkiJ8xXMyzcwvEM_rNaleKTzbfNS6NpSpcOYjnN7_IfN8HwVz4nDrcsjOoNXLw5OjxsykRRqh1lGToOo0hbnOQt7mnj54iEhfAtgCaAsqcivvqhMKtX2XVijkEYYxOy-VtUvvwosmtJodKaQSKIgpOb4'
    },
    department: 'Engineering',
    tags: ['DevOps', 'Security Hotfix']
  },
  {
    id: 'task-7',
    title: 'Finalize Design System token palette documentation for v3.0',
    description: 'Document color contrast ratios, dark mode elevation scales, and accessibility badges.',
    completed: false,
    status: 'In Progress',
    pinned: false,
    priority: 'medium',
    dueDate: 'Friday',
    category: 'Design',
    createdAt: 'Yesterday',
    assignedTo: {
      id: 'emp-9',
      name: 'Elena Rodriguez',
      role: 'Product Strategist',
      roleType: 'employee',
      department: 'Design',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDijMHP0EyUOQOObEYIh_Hb4Z8uFiGLY5LNH6JgNEZtRFha7dhi0jCINuK5K8eCrEV5XynCXMvuGq_895NA4vn0eN_nPdtjw20v5JdVsgbQS6RaKALyS3MJJ8F-FiYZCQxtngYpZh2zqPvUnt-YSCzO8SWont-LHujOrKAnQeZdyCZl3rIGH9HgZjFf3tMrPhJEbcWqyr3C8nQeioKR4GylOA6NGtgRxH-lUAHTN5e-fVELArV7z4S'
    },
    assignedBy: {
      id: 'emp-1',
      name: 'Ayon Ahmed',
      role: 'Lead UI/UX Designer & Admin',
      roleType: 'admin',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQndi0Q67LuyTUAs8C_7ptSSpWoFH67QhVbLxfJfqqymbTF0-ImTvZteCBSvRhku41rEwtRkkZ2yuI6nQmZb0BfCOfoZGNID_PEOn4VWAWuKVpWR7Ik8bXButYDHroiVhejf7BUJNlr5RCQjELnvfecxNjb3pdO-wFiNm8ZRyrk3KjzJktBW6t2HdB8uvLEdFXWKFvdGX3obC3EyYo3QUO3PVDq-c-ap2YZgHP_1pncDG6fIUYwwl'
    },
    department: 'Design',
    tags: ['Design System', 'Tokens']
  }
];

