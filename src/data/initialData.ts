import { Employee, LeaveRequest, AttendanceRecord, JobOpening, UpcomingEvent, ActivityItem, UserProfile, FeedbackItem, NotificationItem, TaskItem } from '../types';

export const ADMIN_USER: UserProfile = {
  id: 'usr-admin-01',
  name: 'Raja Raza',
  role: 'HR Director & System Admin',
  roleType: 'admin',
  email: 'rajaraza300@gmail.com',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQndi0Q67LuyTUAs8C_7ptSSpWoFH67QhVbLxfJfqqymbTF0-ImTvZteCBSvRhku41rEwtRkkZ2yuI6nQmZb0BfCOfoZGNID_PEOn4VWAWuKVpWR7Ik8bXButYDHroiVhejf7BUJNlr5RCQjELnvfecxNjb3pdO-wFiNm8ZRyrk3KjzJktBW6t2HdB8uvLEdFXWKFvdGX3obC3EyYo3QUO3PVDq-c-ap2YZgHP_1pncDG6fIUYwwl',
  department: 'Operations & HR',
  empId: 'EMP-0001',
  location: 'Gulshan 2, Dhaka, Bangladesh',
  phone: '+880 1712-345678',
  address: 'House 42, Road 11, Block D, Banani, Dhaka-1213',
  gender: 'Male',
  dob: '14 August 1994',
  bloodGroup: 'O+ Positive',
  maritalStatus: 'Married',
  nationality: 'Bangladeshi',
  joiningDate: '15 January 2021',
  reportingManager: {
    name: 'Executive Board',
    role: 'Board of Directors',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
  },
  baseSalary: 320000,
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
  location: 'Gulshan 1, Dhaka, Bangladesh',
  phone: '+1 (555) 234-5678',
  address: 'Gulshan 1, Dhaka',
  gender: 'Female',
  dob: '18 May 1988',
  bloodGroup: 'A+ Positive',
  maritalStatus: 'Married',
  nationality: 'American',
  joiningDate: '12 March 2019',
  reportingManager: {
    name: 'Raja Raza',
    role: 'HR Director & System Admin',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQndi0Q67LuyTUAs8C_7ptSSpWoFH67QhVbLxfJfqqymbTF0-ImTvZteCBSvRhku41rEwtRkkZ2yuI6nQmZb0BfCOfoZGNID_PEOn4VWAWuKVpWR7Ik8bXButYDHroiVhejf7BUJNlr5RCQjELnvfecxNjb3pdO-wFiNm8ZRyrk3KjzJktBW6t2HdB8uvLEdFXWKFvdGX3obC3EyYo3QUO3PVDq-c-ap2YZgHP_1pncDG6fIUYwwl'
  },
  baseSalary: 280000,
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
  location: 'Mirpur DOHS, Dhaka, Bangladesh',
  phone: '+880 1711-223344',
  address: 'Mirpur DOHS, Road 4, House 18, Dhaka',
  gender: 'Female',
  dob: '03 March 1992',
  bloodGroup: 'B+ Positive',
  maritalStatus: 'Single',
  nationality: 'Bangladeshi',
  joiningDate: '10 February 2020',
  reportingManager: {
    name: 'Aqsa',
    role: 'Design Department Lead',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGYbO589VOTATEVvsbR5nyyOSwLBLuKXOxbFTAMEVyEEoVKEAscptTr1Fw8iGYSdAB1g1J5Y2Vx6y8Ypywrc1QuHnwiu6JKqVnuiQ75E-Zl1lklVnZju58LXg4EI6rxi76D29F_QaeZ2oRg09f6FoJmK_QL6Z8b3aMDi0bl53XwFkCgcHB8gkqEbh1qkmBlu_dlAs6b6vNmeVUXXkWqoQmRb8581biV9eH9oJ2xg2_FZghdAbak5L'
  },
  baseSalary: 145000,
  status: 'Active'
};

export const CURRENT_USER: UserProfile = ADMIN_USER;

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    empId: 'EMP-0001',
    name: 'Raja Raza',
    designation: 'HR Director & System Admin',
    department: 'Operations',
    email: 'rajaraza300@gmail.com',
    phone: '+880 1712-345678',
    status: 'Active',
    joiningDate: '15 Jan 2021',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQndi0Q67LuyTUAs8C_7ptSSpWoFH67QhVbLxfJfqqymbTF0-ImTvZteCBSvRhku41rEwtRkkZ2yuI6nQmZb0BfCOfoZGNID_PEOn4VWAWuKVpWR7Ik8bXButYDHroiVhejf7BUJNlr5RCQjELnvfecxNjb3pdO-wFiNm8ZRyrk3KjzJktBW6t2HdB8uvLEdFXWKFvdGX3obC3EyYo3QUO3PVDq-c-ap2YZgHP_1pncDG6fIUYwwl',
    gender: 'Male',
    dob: '14 Aug 1994',
    address: 'House 42, Road 11, Block D, Banani, Dhaka-1213',
    reportingManager: 'Executive Board',
    baseSalary: 320000
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
    dob: '03 Mar 1992',
    address: 'Mirpur DOHS, Dhaka',
    reportingManager: 'Aqsa',
    baseSalary: 145000
  },
  {
    id: 'emp-3',
    empId: 'EMP-0102',
    name: 'Sumaiya Akter',
    designation: 'HR Specialist',
    department: 'HR',
    email: 'sumaiya.akter@aurahrms.io',
    phone: '+880 1819-556677',
    status: 'Active',
    joiningDate: '01 Jun 2021',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADQcAFIWDJ8g7APl2aOjC7M5drmvNeR0adkjwJQVVuoFudHVArwpni00b8CM7KOAHa7oxn4kKlj8AuLw3DQ5q7z72A_M7SyQJfWE_Omi_kh3T0W41JFx5OUziSGWqpzvo0veD9kqf54hae4mDr7abyGMq79swnEo0j598XUbb2OXswI5H1s5qlM86vEdiXh_udAlNHwMxSXuvt-XFNIbqvvlG-ZjCtCUI--j3MBmfhy7XMikuswA27',
    gender: 'Female',
    dob: '22 Nov 1995',
    address: 'Dhanmondi 27, Dhaka',
    reportingManager: 'Aqsa',
    baseSalary: 95000
  },
  {
    id: 'emp-4',
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
    dob: '18 May 1988',
    address: 'Gulshan 1, Dhaka',
    reportingManager: 'Raja Raza',
    baseSalary: 280000
  },
  {
    id: 'emp-5',
    empId: 'EMP-0104',
    name: 'David Rodriguez',
    designation: 'Chief Technology Officer',
    department: 'Engineering',
    email: 'david.cto@aurahrms.io',
    phone: '+1 (555) 876-5432',
    status: 'Active',
    joiningDate: '01 Jan 2018',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxxwgp1S_xgssIZegK3dERGVDZcLI9XQVUUm9It4Wm4oMN4NKizpZSI9fWQibKQdGBAI8RMzHaqD_HL4fSBoylnUj-ucusfkiJ8xXMyzcwvEM_rNaleKTzbfNS6NpSpcOYjnN7_IfN8HwVz4nDrcsjOoNXLw5OjxsykRRqh1lGToOo0hbnOQt7mnj54iEhfAtgCaAsqcivvqhMKtX2XVijkEYYxOy-VtUvvwosmtJodKaQSKIgpOb4',
    gender: 'Male',
    dob: '09 Jul 1985',
    address: 'Baridhara Diplomatic Zone, Dhaka',
    reportingManager: 'Board of Directors',
    baseSalary: 350000
  },
  {
    id: 'emp-6',
    empId: 'EMP-0105',
    name: 'Sarah Rahman',
    designation: 'Marketing Lead',
    department: 'Marketing',
    email: 'sarah.rahman@aurahrms.io',
    phone: '+880 1912-889900',
    status: 'On Leave',
    joiningDate: '15 Sep 2021',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5IchO3RZGm0f-HVXMJ2KxT1l2SPNekW2kVOsggoKpVozxw1zaldbKe88nR15OTuPadqt_G7uE6prssjL5xoTgVCGTpoza8BFq1s1jhzKiaXW7oZKPC9tygDzBzxnsHNiu2qwkIO4zmOCcexW7kiM1D9FmeO5X-YHAWr5NitUEE2fZ6T5TkPRNQb3uPDz0rR1Mnot8atZ8vqQ5D0tFqEAqa-TfiXb4wekFZpoBxlHR6R4nrLDWUoI1',
    gender: 'Female',
    dob: '12 Jan 1993',
    address: 'Uttara Sector 7, Dhaka',
    reportingManager: 'Sarah Jenkins',
    baseSalary: 130000
  },
  {
    id: 'emp-7',
    empId: 'EMP-0106',
    name: 'Michael Lee',
    designation: 'DevOps Architect',
    department: 'Engineering',
    email: 'michael.lee@aurahrms.io',
    phone: '+1 (555) 432-1098',
    status: 'Active',
    joiningDate: '01 Nov 2021',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwY4FYp5_M7k-ZIiDBaE9RxdEkkHIZ-0iOnrgx4tUXhpraXo8K9oa9lSO_8BcdC9WHYpoTRLi-yjLbZvTxlT0x6mMs2w-wcSvfhuXZ3jatECSogNvTrNSgDswwJxuHS57HgdFTQVtKswQtamvIRLtzLStl3GeYzoa-vq97chSsokir3mYCzjFrZx745AWtSH9Fb5B0ZbATFXXjldqEpQWtZDw8zhwcd-H7t0DPFPNQWokx08LQ2PfB',
    gender: 'Male',
    dob: '28 Oct 1990',
    address: 'Bashundhara R/A, Dhaka',
    reportingManager: 'David Rodriguez',
    baseSalary: 175000
  },
  {
    id: 'emp-8',
    empId: 'EMP-0107',
    name: 'James Wilson',
    designation: 'Financial Analyst',
    department: 'Finance',
    email: 'james.wilson@aurahrms.io',
    phone: '+1 (555) 765-4321',
    status: 'Active',
    joiningDate: '10 Feb 2022',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYuWL1I268A8mrdo_oo6Ogy_tSmASTaEJzJe3YhKGlNgG-oTNLpoHtIfy51vMDxhlTEaMNdg0f8nYuwf5pN1P1s8ipRI8UPvU8ubP4jIzk2XVX6dnAtOqx4Sdgx7ApP-rb9yAJfNQc0srAr64oJ2RuzqXKIX5b5AdPGEulshBmBcxQEgBpu8GVCjNiIbRRMND0n1IrG9SqpcfdNHqJyikzXSu_9Yhs3J1sOs9pR-ahVBP6E3C1G0-m',
    gender: 'Male',
    dob: '05 Apr 1991',
    address: 'Mohakhali DOHS, Dhaka',
    reportingManager: 'David Rodriguez',
    baseSalary: 140000
  },
  {
    id: 'emp-9',
    empId: 'EMP-0108',
    name: 'Elena Rodriguez',
    designation: 'Product Strategist',
    department: 'Design',
    email: 'elena.rodriguez@aurahrms.io',
    phone: '+1 (555) 345-6789',
    status: 'Active',
    joiningDate: '20 Jul 2022',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDijMHP0EyUOQOObEYIh_Hb4Z8uFiGLY5LNH6JgNEZtRFha7dhi0jCINuK5K8eCrEV5XynCXMvuGq_895NA4vn0eN_nPdtjw20v5JdVsgbQS6RaKALyS3MJJ8F-FiYZCQxtngYpZh2zqPvUnt-YSCzO8SWont-LHujOrKAnQeZdyCZl3rIGH9HgZjFf3tMrPhJEbcWqyr3C8nQeioKR4GylOA6NGtgRxH-lUAHTN5e-fVELArV7z4S',
    gender: 'Female',
    dob: '17 Dec 1993',
    address: 'Gulshan 2, Dhaka',
    reportingManager: 'Sarah Jenkins',
    baseSalary: 155000
  },
  {
    id: 'emp-10',
    empId: 'EMP-0109',
    name: 'David Chen',
    designation: 'Senior Frontend Engineer',
    department: 'Engineering',
    email: 'david.chen@aurahrms.io',
    phone: '+1 (555) 654-3210',
    status: 'Active',
    joiningDate: '01 Mar 2023',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCygYhHxrgl5qRtqzjE6Q0wBw0qO07I1AgcE3f7rjT4Kvlk-h2eBlcyXzERuSG8QLwXvTln7dkB0evTz0_8d6XscH6Z-3ZscPI4rvjg4uAo_okgcs6zG4cqq6SF-bGnZraG6xC0yvzBhJ6reIdNoLS3uiyVM70IVXv4NOXel6TAoMvE_fZJ0Fbk50-6GNyyj9xAgi0SThZcppMO1pbPKw8HQ78s8IXlXstNFswBA7TOP-RXosHeF3X',
    gender: 'Male',
    dob: '30 Jun 1995',
    address: 'Niketan, Dhaka',
    reportingManager: 'Rahim Uddin',
    baseSalary: 135000
  },
  {
    id: 'emp-11',
    empId: 'EMP-0110',
    name: 'Tariqul Islam',
    designation: 'QA Automation Engineer',
    department: 'Engineering',
    email: 'tariqul.islam@aurahrms.io',
    phone: '+880 1678-901234',
    status: 'Inactive',
    joiningDate: '15 Oct 2022',
    avatarInitials: 'TI',
    gender: 'Male',
    dob: '11 Sep 1994',
    address: 'Khilkhet, Dhaka',
    reportingManager: 'Rahim Uddin',
    baseSalary: 110000
  },
  {
    id: 'emp-12',
    empId: 'EMP-0111',
    name: 'Fatima Zohra',
    designation: 'Content & Copy Lead',
    department: 'Marketing',
    email: 'fatima.zohra@aurahrms.io',
    phone: '+880 1755-443322',
    status: 'Active',
    joiningDate: '05 Jan 2023',
    avatarInitials: 'FZ',
    gender: 'Female',
    dob: '08 Feb 1996',
    address: 'Lalmatia, Dhaka',
    reportingManager: 'Sarah Rahman',
    baseSalary: 105000
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
    id: 'att-1',
    empId: 'EMP-0142',
    employeeName: 'Ayon Ahmed',
    department: 'Design',
    avatarInitials: 'AA',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQndi0Q67LuyTUAs8C_7ptSSpWoFH67QhVbLxfJfqqymbTF0-ImTvZteCBSvRhku41rEwtRkkZ2yuI6nQmZb0BfCOfoZGNID_PEOn4VWAWuKVpWR7Ik8bXButYDHroiVhejf7BUJNlr5RCQjELnvfecxNjb3pdO-wFiNm8ZRyrk3KjzJktBW6t2HdB8uvLEdFXWKFvdGX3obC3EyYo3QUO3PVDq-c-ap2YZgHP_1pncDG6fIUYwwl',
    clockIn: '09:14 AM',
    clockOut: '--:--',
    totalHrs: '6h 45m',
    status: 'Present',
    date: 'Today, 14 May'
  },
  {
    id: 'att-2',
    empId: 'EMP-0101',
    employeeName: 'Rahim Uddin',
    department: 'Engineering',
    avatarInitials: 'RU',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSANbGI_8XJwr4JerK2U_S85Z10-Lhe_dnK9SL5j7CA7A78CwnhHQHcY4OfNOr2pDaW9hgOkTqKBCWPZ9PSSR9sfz9ljGdJCaRFTtYFjjW-EeDaH4Lb7pSfNCRoyGbmvg9LYJvJf4XTU2H0-vTX1OncSoyHd9Yq1BjbrpoWB6up8qQOivnc3S9AK11f-bL5xi6YcXHd-lgU3gKTaGFvNAZXYG0H5_OaDSz4Vlg_JLyRbeFO6H7cJrv',
    clockIn: '09:02 AM',
    clockOut: '--:--',
    totalHrs: '6h 58m',
    status: 'Present',
    date: 'Today, 14 May'
  },
  {
    id: 'att-3',
    empId: 'EMP-0102',
    employeeName: 'Sumaiya Akter',
    department: 'HR',
    avatarInitials: 'SA',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADQcAFIWDJ8g7APl2aOjC7M5drmvNeR0adkjwJQVVuoFudHVArwpni00b8CM7KOAHa7oxn4kKlj8AuLw3DQ5q7z72A_M7SyQJfWE_Omi_kh3T0W41JFx5OUziSGWqpzvo0veD9kqf54hae4mDr7abyGMq79swnEo0j598XUbb2OXswI5H1s5qlM86vEdiXh_udAlNHwMxSXuvt-XFNIbqvvlG-ZjCtCUI--j3MBmfhy7XMikuswA27',
    clockIn: '09:48 AM',
    clockOut: '--:--',
    totalHrs: '6h 12m',
    status: 'Late',
    date: 'Today, 14 May'
  },
  {
    id: 'att-4',
    empId: 'EMP-0103',
    employeeName: 'Sarah Jenkins',
    department: 'Design',
    avatarInitials: 'SJ',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGYbO589VOTATEVvsbR5nyyOSwLBLuKXOxbFTAMEVyEEoVKEAscptTr1Fw8iGYSdAB1g1J5Y2Vx6y8Ypywrc1QuHnwiu6JKqVnuiQ75E-Zl1lklVnZju58LXg4EI6rxi76D29F_QaeZ2oRg09f6FoJmK_QL6Z8b3aMDi0bl53XwFkCgcHB8gkqEbh1qkmBlu_dlAs6b6vNmeVUXXkWqoQmRb8581biV9eH9oJ2xg2_FZghdAbak5L',
    clockIn: '08:55 AM',
    clockOut: '--:--',
    totalHrs: '7h 05m',
    status: 'Present',
    date: 'Today, 14 May'
  },
  {
    id: 'att-5',
    empId: 'EMP-0105',
    employeeName: 'Sarah Rahman',
    department: 'Marketing',
    avatarInitials: 'SR',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5IchO3RZGm0f-HVXMJ2KxT1l2SPNekW2kVOsggoKpVozxw1zaldbKe88nR15OTuPadqt_G7uE6prssjL5xoTgVCGTpoza8BFq1s1jhzKiaXW7oZKPC9tygDzBzxnsHNiu2qwkIO4zmOCcexW7kiM1D9FmeO5X-YHAWr5NitUEE2fZ6T5TkPRNQb3uPDz0rR1Mnot8atZ8vqQ5D0tFqEAqa-TfiXb4wekFZpoBxlHR6R4nrLDWUoI1',
    clockIn: '--:--',
    clockOut: '--:--',
    totalHrs: '0h 00m',
    status: 'On Leave',
    date: 'Today, 14 May'
  },
  {
    id: 'att-6',
    empId: 'EMP-0107',
    employeeName: 'James Wilson',
    department: 'Finance',
    avatarInitials: 'JW',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYuWL1I268A8mrdo_oo6Ogy_tSmASTaEJzJe3YhKGlNgG-oTNLpoHtIfy51vMDxhlTEaMNdg0f8nYuwf5pN1P1s8ipRI8UPvU8ubP4jIzk2XVX6dnAtOqx4Sdgx7ApP-rb9yAJfNQc0srAr64oJ2RuzqXKIX5b5AdPGEulshBmBcxQEgBpu8GVCjNiIbRRMND0n1IrG9SqpcfdNHqJyikzXSu_9Yhs3J1sOs9pR-ahVBP6E3C1G0-m',
    clockIn: '09:05 AM',
    clockOut: '--:--',
    totalHrs: '6h 55m',
    status: 'Present',
    date: 'Today, 14 May'
  },
  {
    id: 'att-7',
    empId: 'EMP-0110',
    employeeName: 'Tariqul Islam',
    department: 'Engineering',
    avatarInitials: 'TI',
    clockIn: '--:--',
    clockOut: '--:--',
    totalHrs: '0h 00m',
    status: 'Absent',
    date: 'Today, 14 May'
  }
];

export const INITIAL_JOB_OPENINGS: JobOpening[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Dhaka, BD (Hybrid)',
    type: 'Full-time',
    applicantsCount: 48,
    status: 'Active',
    icon: 'Code2',
    postedDate: '3 days ago'
  },
  {
    id: 'job-2',
    title: 'UX/UI Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    applicantsCount: 64,
    status: 'Active',
    icon: 'Palette',
    postedDate: '1 week ago'
  },
  {
    id: 'job-3',
    title: 'Growth Marketing Manager',
    department: 'Marketing',
    location: 'Dhaka, BD (On-site)',
    type: 'Full-time',
    applicantsCount: 22,
    status: 'Active',
    icon: 'Megaphone',
    postedDate: '2 weeks ago'
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
    postedDate: '4 days ago'
  },
  {
    id: 'job-5',
    title: 'Talent Acquisition Partner',
    department: 'HR',
    location: 'Dhaka, BD (Hybrid)',
    type: 'Full-time',
    applicantsCount: 31,
    status: 'Active',
    icon: 'UserPlus',
    postedDate: '5 days ago'
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

export const TOP_PERFORMERS = [
  {
    id: 'tp-1',
    name: 'Ayon Ahmed',
    role: 'Lead UI/UX Designer',
    score: 98,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQndi0Q67LuyTUAs8C_7ptSSpWoFH67QhVbLxfJfqqymbTF0-ImTvZteCBSvRhku41rEwtRkkZ2yuI6nQmZb0BfCOfoZGNID_PEOn4VWAWuKVpWR7Ik8bXButYDHroiVhejf7BUJNlr5RCQjELnvfecxNjb3pdO-wFiNm8ZRyrk3KjzJktBW6t2HdB8uvLEdFXWKFvdGX3obC3EyYo3QUO3PVDq-c-ap2YZgHP_1pncDG6fIUYwwl',
    stars: 5,
    tag: 'Top Innovator'
  },
  {
    id: 'tp-2',
    name: 'Rahim Uddin',
    role: 'Senior Software Engineer',
    score: 95,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSANbGI_8XJwr4JerK2U_S85Z10-Lhe_dnK9SL5j7CA7A78CwnhHQHcY4OfNOr2pDaW9hgOkTqKBCWPZ9PSSR9sfz9ljGdJCaRFTtYFjjW-EeDaH4Lb7pSfNCRoyGbmvg9LYJvJf4XTU2H0-vTX1OncSoyHd9Yq1BjbrpoWB6up8qQOivnc3S9AK11f-bL5xi6YcXHd-lgU3gKTaGFvNAZXYG0H5_OaDSz4Vlg_JLyRbeFO6H7cJrv',
    stars: 5,
    tag: 'Execution King'
  },
  {
    id: 'tp-3',
    name: 'Elena Rodriguez',
    role: 'Product Strategist',
    score: 92,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDijMHP0EyUOQOObEYIh_Hb4Z8uFiGLY5LNH6JgNEZtRFha7dhi0jCINuK5K8eCrEV5XynCXMvuGq_895NA4vn0eN_nPdtjw20v5JdVsgbQS6RaKALyS3MJJ8F-FiYZCQxtngYpZh2zqPvUnt-YSCzO8SWont-LHujOrKAnQeZdyCZl3rIGH9HgZjFf3tMrPhJEbcWqyr3C8nQeioKR4GylOA6NGtgRxH-lUAHTN5e-fVELArV7z4S',
    stars: 5,
    tag: 'Strategy Master'
  },
  {
    id: 'tp-4',
    name: 'David Chen',
    role: 'Senior Frontend Engineer',
    score: 89,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCygYhHxrgl5qRtqzjE6Q0wBw0qO07I1AgcE3f7rjT4Kvlk-h2eBlcyXzERuSG8QLwXvTln7dkB0evTz0_8d6XscH6Z-3ZscPI4rvjg4uAo_okgcs6zG4cqq6SF-bGnZraG6xC0yvzBhJ6reIdNoLS3uiyVM70IVXv4NOXel6TAoMvE_fZJ0Fbk50-6GNyyj9xAgi0SThZcppMO1pbPKw8HQ78s8IXlXstNFswBA7TOP-RXosHeF3X',
    stars: 4,
    tag: 'Speed Champion'
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

