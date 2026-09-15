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

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

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
    empId: 'EMP-0109',
    employeeName: 'Iqra Pervaiz',
    department: 'Engineering',
    designation: 'Senior Frontend Engineer',
    baseSalary: 260000,
    allowances: 39000,
    deductions: 20800,
    netSalary: 278200,
    status: 'Paid',
    paymentDate: '28 May 2025',
    month: 'May 2025',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCygYhHxrgl5qRtqzjE6Q0wBw0qO07I1AgcE3f7rjT4Kvlk-h2eBlcyXzERuSG8QLwXvTln7dkB0evTz0_8d6XscH6Z-3ZscPI4rvjg4uAo_okgcs6zG4cqq6SF-bGnZraG6xC0yvzBhJ6reIdNoLS3uiyVM70IVXv4NOXel6TAoMvE_fZJ0Fbk50-6GNyyj9xAgi0SThZcppMO1pbPKw8HQ78s8IXlXstNFswBA7TOP-RXosHeF3X',
    paymentMethod: 'Direct Deposit'
  },
  {
    id: 'pay-5',
    empId: 'EMP-0110',
    employeeName: 'Asim Khan',
    department: 'Marketing',
    designation: 'Social Media Manager',
    baseSalary: 140000,
    allowances: 21000,
    deductions: 11200,
    netSalary: 149800,
    status: 'Processing',
    paymentDate: 'Pending',
    month: 'May 2025',
    avatarInitials: 'AK',
    paymentMethod: 'Direct Deposit'
  },
  {
    id: 'pay-6',
    empId: 'EMP-0111',
    employeeName: 'Saba',
    department: 'Marketing',
    designation: 'Video Editor',
    baseSalary: 150000,
    allowances: 22500,
    deductions: 12000,
    netSalary: 160500,
    status: 'Paid',
    paymentDate: '28 May 2025',
    month: 'May 2025',
    avatarInitials: 'SB',
    paymentMethod: 'Direct Deposit'
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
    fromName: 'Raja Raza',
    toName: 'Aqsa',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQndi0Q67LuyTUAs8C_7ptSSpWoFH67QhVbLxfJfqqymbTF0-ImTvZteCBSvRhku41rEwtRkkZ2yuI6nQmZb0BfCOfoZGNID_PEOn4VWAWuKVpWR7Ik8bXButYDHroiVhejf7BUJNlr5RCQjELnvfecxNjb3pdO-wFiNm8ZRyrk3KjzJktBW6t2HdB8uvLEdFXWKFvdGX3obC3EyYo3QUO3PVDq-c-ap2YZgHP_1pncDG6fIUYwwl',
    timeAgo: '2 hours ago',
    comment: 'Exceptional design leadership across our entire product suite. The team velocity has improved dramatically!'
  },
  {
    id: 'fb-2',
    fromName: 'Aqsa',
    toName: 'Rani',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGYbO589VOTATEVvsbR5nyyOSwLBLuKXOxbFTAMEVyEEoVKEAscptTr1Fw8iGYSdAB1g1J5Y2Vx6y8Ypywrc1QuHnwiu6JKqVnuiQ75E-Zl1lklVnZju58LXg4EI6rxi76D29F_QaeZ2oRg09f6FoJmK_QL6Z8b3aMDi0bl53XwFkCgcHB8gkqEbh1qkmBlu_dlAs6b6vNmeVUXXkWqoQmRb8581biV9eH9oJ2xg2_FZghdAbak5L',
    timeAgo: '1 day ago',
    comment: 'Outstanding visual craft and layout precision on the latest dashboard redesign. Pixel-perfect work!'
  },
  {
    id: 'fb-3',
    fromName: 'Raja Raza',
    toName: 'Iqra Pervaiz',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQndi0Q67LuyTUAs8C_7ptSSpWoFH67QhVbLxfJfqqymbTF0-ImTvZteCBSvRhku41rEwtRkkZ2yuI6nQmZb0BfCOfoZGNID_PEOn4VWAWuKVpWR7Ik8bXButYDHroiVhejf7BUJNlr5RCQjELnvfecxNjb3pdO-wFiNm8ZRyrk3KjzJktBW6t2HdB8uvLEdFXWKFvdGX3obC3EyYo3QUO3PVDq-c-ap2YZgHP_1pncDG6fIUYwwl',
    timeAgo: '2 days ago',
    comment: 'Great work on frontend state modularity, TypeScript type-safety, and snappy client interactions.'
  }
];

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Workforce Attendance Logged',
    message: 'Workforce shifts and biometric logs synchronized successfully',
    time: '10 min ago',
    read: false,
    type: 'system',
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    recipientRole: 'all',
    linkView: 'attendance'
  },
  {
    id: 'notif-2',
    title: 'Task Due Soon',
    message: 'Task "Design System 2.0 Governance" is due today',
    time: '25 min ago',
    read: false,
    type: 'task',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    recipientRole: 'all',
    linkView: 'tasks'
  },
  {
    id: 'notif-3',
    title: '360 Peer Feedback Received',
    message: 'Raja Raza left feedback for Aqsa on Design Leadership',
    time: '1 hour ago',
    read: false,
    type: 'performance',
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    recipientRole: 'all',
    linkView: 'performance'
  },
  {
    id: 'notif-4',
    title: 'New Candidate Application',
    message: 'Zubair Ahmed applied for Senior Frontend Developer role',
    time: '2 hours ago',
    read: false,
    type: 'recruitment',
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
    recipientRole: 'admin',
    linkView: 'recruitment'
  },
  {
    id: 'notif-5',
    title: 'Payroll Disbursed',
    message: 'Monthly payslip for May 2025 is ready for download',
    time: '3 hours ago',
    read: false,
    type: 'payroll',
    createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
    recipientRole: 'all',
    linkView: 'payroll'
  },
  {
    id: 'notif-6',
    title: 'Hardware Asset Allocated',
    message: 'MacBook Pro M3 Max (Serial #APP-MBP-9901) assigned to your profile',
    time: 'Yesterday',
    read: true,
    type: 'asset',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    recipientRole: 'all',
    linkView: 'assets'
  },
  {
    id: 'notif-7',
    title: 'Company Policy Updated',
    message: 'Updated Hybrid & Remote Work Framework 2025 is now available',
    time: '2 days ago',
    read: true,
    type: 'system',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    recipientRole: 'all',
    linkView: 'documents'
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-social-posts',
    title: 'Monthly Social Media Visual Posts & Creatives',
    description: 'Create and schedule 14 monthly campaign posts for brand channels. Track real-time deliverables and percentage completion.',
    completed: false,
    status: 'In Progress',
    pinned: true,
    priority: 'high',
    dueDate: 'End of Month',
    category: 'Design',
    createdAt: 'Today at 09:00 AM',
    assignedTo: {
      id: 'emp-2',
      name: 'Rani',
      role: 'UI/UX Visual Designer',
      roleType: 'employee',
      department: 'Design',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSANbGI_8XJwr4JerK2U_S85Z10-Lhe_dnK9SL5j7CA7A78CwnhHQHcY4OfNOr2pDaW9hgOkTqKBCWPZ9PSSR9sfz9ljGdJCaRFTtYFjjW-EeDaH4Lb7pSfNCRoyGbmvg9LYJvJf4XTU2H0-vTX1OncSoyHd9Yq1BjbrpoWB6up8qQOivnc3S9AK11f-bL5xi6YcXHd-lgU3gKTaGFvNAZXYG0H5_OaDSz4Vlg_JLyRbeFO6H7cJrv'
    },
    assignedBy: {
      id: 'emp-1',
      name: 'Raja Raza',
      role: 'HR Director & System Admin',
      roleType: 'admin',
      avatar: '/raja_raza.jpg'
    },
    department: 'Design',
    tags: ['Social Media', 'Visual Posts', 'Deliverables'],
    hasNumericTarget: true,
    targetCount: 14,
    currentCount: 2,
    unitName: 'posts'
  },
  {
    id: 'task-1',
    title: 'Design System 2.0 Governance & Guidelines',
    description: 'Establish typography tokens, spatial grids, and component libraries across web and mobile surfaces.',
    completed: false,
    status: 'Pending',
    pinned: true,
    priority: 'high',
    dueDate: 'Today',
    category: 'Design',
    createdAt: 'Today at 09:15 AM',
    assignedTo: {
      id: 'emp-3',
      name: 'Aqsa',
      role: 'Design Department Lead',
      roleType: 'manager',
      department: 'Design',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGYbO589VOTATEVvsbR5nyyOSwLBLuKXOxbFTAMEVyEEoVKEAscptTr1Fw8iGYSdAB1g1J5Y2Vx6y8Ypywrc1QuHnwiu6JKqVnuiQ75E-Zl1lklVnZju58LXg4EI6rxi76D29F_QaeZ2oRg09f6FoJmK_QL6Z8b3aMDi0bl53XwFkCgcHB8gkqEbh1qkmBlu_dlAs6b6vNmeVUXXkWqoQmRb8581biV9eH9oJ2xg2_FZghdAbak5L'
    },
    assignedBy: {
      id: 'emp-1',
      name: 'Raja Raza',
      role: 'HR Director & System Admin',
      roleType: 'admin',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQndi0Q67LuyTUAs8C_7ptSSpWoFH67QhVbLxfJfqqymbTF0-ImTvZteCBSvRhku41rEwtRkkZ2yuI6nQmZb0BfCOfoZGNID_PEOn4VWAWuKVpWR7Ik8bXButYDHroiVhejf7BUJNlr5RCQjELnvfecxNjb3pdO-wFiNm8ZRyrk3KjzJktBW6t2HdB8uvLEdFXWKFvdGX3obC3EyYo3QUO3PVDq-c-ap2YZgHP_1pncDG6fIUYwwl'
    },
    department: 'Design',
    tags: ['Design System', 'Core Governance']
  },
  {
    id: 'task-2',
    title: 'Mobile App Screen Mockups & Micro-interactions',
    description: 'Design dark-mode elevation screens and interactive button states for the iOS/Android release.',
    completed: false,
    status: 'In Progress',
    pinned: true,
    priority: 'high',
    dueDate: 'Tomorrow',
    category: 'Design',
    createdAt: 'Yesterday at 04:30 PM',
    assignedTo: {
      id: 'emp-2',
      name: 'Rani',
      role: 'UI/UX Visual Designer',
      roleType: 'employee',
      department: 'Design',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSANbGI_8XJwr4JerK2U_S85Z10-Lhe_dnK9SL5j7CA7A78CwnhHQHcY4OfNOr2pDaW9hgOkTqKBCWPZ9PSSR9sfz9ljGdJCaRFTtYFjjW-EeDaH4Lb7pSfNCRoyGbmvg9LYJvJf4XTU2H0-vTX1OncSoyHd9Yq1BjbrpoWB6up8qQOivnc3S9AK11f-bL5xi6YcXHd-lgU3gKTaGFvNAZXYG0H5_OaDSz4Vlg_JLyRbeFO6H7cJrv'
    },
    assignedBy: {
      id: 'emp-3',
      name: 'Aqsa',
      role: 'Design Department Lead',
      roleType: 'manager',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGYbO589VOTATEVvsbR5nyyOSwLBLuKXOxbFTAMEVyEEoVKEAscptTr1Fw8iGYSdAB1g1J5Y2Vx6y8Ypywrc1QuHnwiu6JKqVnuiQ75E-Zl1lklVnZju58LXg4EI6rxi76D29F_QaeZ2oRg09f6FoJmK_QL6Z8b3aMDi0bl53XwFkCgcHB8gkqEbh1qkmBlu_dlAs6b6vNmeVUXXkWqoQmRb8581biV9eH9oJ2xg2_FZghdAbak5L'
    },
    department: 'Design',
    tags: ['Mobile UI', 'Prototyping']
  },
  {
    id: 'task-3',
    title: 'Frontend Performance & Web Vitals Optimization',
    description: 'Profile React render cycles, eliminate unnecessary re-renders, and ensure instantaneous navigation transitions.',
    completed: false,
    status: 'In Progress',
    pinned: false,
    priority: 'medium',
    dueDate: '28 May',
    category: 'Engineering',
    createdAt: '2 days ago',
    assignedTo: {
      id: 'emp-4',
      name: 'Iqra Pervaiz',
      role: 'Senior Frontend Engineer',
      roleType: 'employee',
      department: 'Engineering',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCygYhHxrgl5qRtqzjE6Q0wBw0qO07I1AgcE3f7rjT4Kvlk-h2eBlcyXzERuSG8QLwXvTln7dkB0evTz0_8d6XscH6Z-3ZscPI4rvjg4uAo_okgcs6zG4cqq6SF-bGnZraG6xC0yvzBhJ6reIdNoLS3uiyVM70IVXv4NOXel6TAoMvE_fZJ0Fbk50-6GNyyj9xAgi0SThZcppMO1pbPKw8HQ78s8IXlXstNFswBA7TOP-RXosHeF3X'
    },
    assignedBy: {
      id: 'emp-1',
      name: 'Raja Raza',
      role: 'HR Director & System Admin',
      roleType: 'admin',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQndi0Q67LuyTUAs8C_7ptSSpWoFH67QhVbLxfJfqqymbTF0-ImTvZteCBSvRhku41rEwtRkkZ2yuI6nQmZb0BfCOfoZGNID_PEOn4VWAWuKVpWR7Ik8bXButYDHroiVhejf7BUJNlr5RCQjELnvfecxNjb3pdO-wFiNm8ZRyrk3KjzJktBW6t2HdB8uvLEdFXWKFvdGX3obC3EyYo3QUO3PVDq-c-ap2YZgHP_1pncDG6fIUYwwl'
    },
    department: 'Engineering',
    tags: ['Web Vitals', 'React Architecture']
  },
  {
    id: 'task-4',
    title: 'Social Media Campaign & Outreach Plan',
    description: 'Prepare creative copy and schedule multi-platform posts for our upcoming hiring wave.',
    completed: true,
    status: 'Completed',
    pinned: false,
    priority: 'medium',
    dueDate: 'Done',
    category: 'Marketing',
    createdAt: '3 days ago',
    assignedTo: {
      id: 'emp-5',
      name: 'Asim Khan',
      role: 'Social Media Manager',
      roleType: 'employee',
      department: 'Marketing'
    },
    assignedBy: {
      id: 'emp-1',
      name: 'Raja Raza',
      role: 'HR Director & System Admin',
      roleType: 'admin',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQndi0Q67LuyTUAs8C_7ptSSpWoFH67QhVbLxfJfqqymbTF0-ImTvZteCBSvRhku41rEwtRkkZ2yuI6nQmZb0BfCOfoZGNID_PEOn4VWAWuKVpWR7Ik8bXButYDHroiVhejf7BUJNlr5RCQjELnvfecxNjb3pdO-wFiNm8ZRyrk3KjzJktBW6t2HdB8uvLEdFXWKFvdGX3obC3EyYo3QUO3PVDq-c-ap2YZgHP_1pncDG6fIUYwwl'
    },
    department: 'Marketing',
    tags: ['Social Media', 'Branding']
  },
  {
    id: 'task-5',
    title: 'Product Demo Video Editing & Motion Graphics',
    description: 'Assemble motion graphics cuts and audio syncing for the software showcase reel.',
    completed: false,
    status: 'Pending',
    pinned: false,
    priority: 'low',
    dueDate: 'Friday',
    category: 'Marketing',
    createdAt: '1 day ago',
    assignedTo: {
      id: 'emp-6',
      name: 'Saba',
      role: 'Video Editor',
      roleType: 'employee',
      department: 'Marketing'
    },
    assignedBy: {
      id: 'emp-1',
      name: 'Raja Raza',
      role: 'HR Director & System Admin',
      roleType: 'admin',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQndi0Q67LuyTUAs8C_7ptSSpWoFH67QhVbLxfJfqqymbTF0-ImTvZteCBSvRhku41rEwtRkkZ2yuI6nQmZb0BfCOfoZGNID_PEOn4VWAWuKVpWR7Ik8bXButYDHroiVhejf7BUJNlr5RCQjELnvfecxNjb3pdO-wFiNm8ZRyrk3KjzJktBW6t2HdB8uvLEdFXWKFvdGX3obC3EyYo3QUO3PVDq-c-ap2YZgHP_1pncDG6fIUYwwl'
    },
    department: 'Marketing',
    tags: ['Video Editing', 'Motion Graphics']
  }
];

