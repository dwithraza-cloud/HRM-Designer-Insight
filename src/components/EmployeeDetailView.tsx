import React, { useState, useRef } from 'react';
import { 
  ChevronLeft, 
  Edit, 
  Edit3,
  MessageSquare, 
  ShieldAlert, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  CreditCard, 
  Award, 
  FileText, 
  Briefcase, 
  User, 
  CheckCircle2,
  CalendarDays,
  Sparkles,
  Lock,
  X,
  Save,
  Camera,
  Globe,
  Heart,
  Shield,
  Building,
  Upload,
  AlertCircle,
  RefreshCw,
  Eye,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ListChecks,
  Info,
  Image as ImageIcon,
  Trash2,
  FolderOpen
} from 'lucide-react';
import { Employee, ViewMode, UserProfile, UserRole } from '../types';

interface ChecklistItem {
  id: string;
  field: string;
  category: 'Personal' | 'Employment' | 'Contact' | 'Media';
  editTab: 'personal' | 'employment' | 'avatar';
  isComplete: boolean;
  value?: string;
  hint: string;
}

interface EmployeeDetailViewProps {
  employee: Employee;
  currentUser?: UserProfile;
  onBack: () => void;
  onNavigate: (view: ViewMode) => void;
  onSendMessage: (employee: Employee) => void;
  onUpdateEmployee?: (updatedEmployee: Employee) => void;
  showToast?: (msg: string) => void;
}

export const EmployeeDetailView: React.FC<EmployeeDetailViewProps> = ({
  employee,
  currentUser,
  onBack,
  onNavigate,
  onSendMessage,
  onUpdateEmployee,
  showToast
}) => {
  const roleType = currentUser?.roleType || 'admin';
  const isAdmin = roleType === 'admin';
  const isSelf = currentUser?.id === employee.id || 
                 currentUser?.email?.toLowerCase() === employee.email?.toLowerCase() ||
                 currentUser?.name?.toLowerCase() === employee.name?.toLowerCase();
  const canViewSalary = isAdmin || isSelf;
  
  // Everyone can edit their own profile, and Admin/Managers can also edit directory profiles
  const canEdit = true;

  const [activeTab, setActiveTab] = useState<'Overview' | 'Personal' | 'Employment' | 'Attendance' | 'Leave' | 'Payroll' | 'Documents'>('Overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTab, setEditTab] = useState<'personal' | 'employment' | 'avatar'>('personal');
  const [isChecklistExpanded, setIsChecklistExpanded] = useState<boolean>(true);
  const [checklistFilter, setChecklistFilter] = useState<'all' | 'missing' | 'completed'>('all');

  // Form state for editing
  const [formData, setFormData] = useState<Employee>({
    ...employee,
    address: employee.address || 'House 42, Road 11, Block D, Banani, Dhaka-1213',
    gender: employee.gender || 'Male',
    dob: employee.dob || '14 Aug 1994',
    bloodGroup: employee.bloodGroup || 'O+ Positive',
    maritalStatus: employee.maritalStatus || 'Single',
    nationality: employee.nationality || 'Bangladeshi',
    location: employee.location || 'Gulshan 2, Dhaka',
    reportingManager: employee.reportingManager || 'Sarah Jenkins',
    baseSalary: employee.baseSalary || 145000
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Profile Picture Browse & Upload State
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [avatarFileInfo, setAvatarFileInfo] = useState<{ name: string; size: string } | null>(null);

  const handleAvatarFileSelect = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (JPG, PNG, WEBP, GIF, SVG).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setFormError('Image file size must be less than 8MB.');
      return;
    }

    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    setAvatarFileInfo({ name: file.name, size: sizeStr });

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
        setFormError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingAvatar(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAvatarFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Profile Completion Evaluation Checklist
  const completionItems: ChecklistItem[] = [
    {
      id: 'avatar',
      field: 'Profile Photo / Avatar',
      category: 'Media',
      editTab: 'avatar',
      isComplete: Boolean(employee.avatar && employee.avatar.trim().length > 0),
      value: employee.avatar ? 'Photo set' : undefined,
      hint: 'Add an avatar image for employee badge, directory & organization chart.'
    },
    {
      id: 'name',
      field: 'Full Legal Name',
      category: 'Personal',
      editTab: 'personal',
      isComplete: Boolean(employee.name && employee.name.trim().length > 0),
      value: employee.name,
      hint: 'Primary employee name for identification & official certificates.'
    },
    {
      id: 'email',
      field: 'Work Email (Login ID)',
      category: 'Contact',
      editTab: 'personal',
      isComplete: Boolean(employee.email && employee.email.includes('@')),
      value: employee.email,
      hint: 'Official corporate email for system authentication & notices.'
    },
    {
      id: 'phone',
      field: 'Primary Phone Number',
      category: 'Contact',
      editTab: 'personal',
      isComplete: Boolean(employee.phone && employee.phone.trim().length > 5),
      value: employee.phone,
      hint: 'Direct mobile telephone line for HR and team communication.'
    },
    {
      id: 'designation',
      field: 'Job Designation / Title',
      category: 'Employment',
      editTab: 'employment',
      isComplete: Boolean(employee.designation && employee.designation.trim().length > 0),
      value: employee.designation,
      hint: 'Designated role and title inside the organization.'
    },
    {
      id: 'department',
      field: 'Department & Division',
      category: 'Employment',
      editTab: 'employment',
      isComplete: Boolean(employee.department && employee.department.trim().length > 0),
      value: employee.department,
      hint: 'Operational unit or business functional department.'
    },
    {
      id: 'empId',
      field: 'Employee ID Number',
      category: 'Employment',
      editTab: 'employment',
      isComplete: Boolean(employee.empId && employee.empId.trim().length > 0),
      value: employee.empId,
      hint: 'Permanent corporate employee identifier code.'
    },
    {
      id: 'joiningDate',
      field: 'Joining Date',
      category: 'Employment',
      editTab: 'employment',
      isComplete: Boolean(employee.joiningDate && employee.joiningDate.trim().length > 0),
      value: employee.joiningDate,
      hint: 'Official company tenure starting date.'
    },
    {
      id: 'reportingManager',
      field: 'Reporting Manager',
      category: 'Employment',
      editTab: 'employment',
      isComplete: Boolean(employee.reportingManager && employee.reportingManager.trim().length > 0),
      value: employee.reportingManager,
      hint: 'Direct supervisor assigned for performance evaluation.'
    },
    {
      id: 'location',
      field: 'Work Office Location',
      category: 'Employment',
      editTab: 'employment',
      isComplete: Boolean(employee.location && employee.location.trim().length > 0),
      value: employee.location,
      hint: 'Primary branch hub or assigned office facility.'
    },
    {
      id: 'dob',
      field: 'Date of Birth',
      category: 'Personal',
      editTab: 'personal',
      isComplete: Boolean(employee.dob && employee.dob.trim().length > 0),
      value: employee.dob,
      hint: 'Legal birth date for compliance and retirement tracking.'
    },
    {
      id: 'gender',
      field: 'Gender',
      category: 'Personal',
      editTab: 'personal',
      isComplete: Boolean(employee.gender && employee.gender.trim().length > 0),
      value: employee.gender,
      hint: 'Demographic record for workplace diversity reporting.'
    },
    {
      id: 'bloodGroup',
      field: 'Blood Group',
      category: 'Personal',
      editTab: 'personal',
      isComplete: Boolean(employee.bloodGroup && employee.bloodGroup.trim().length > 0),
      value: employee.bloodGroup,
      hint: 'Emergency medical identification data.'
    },
    {
      id: 'maritalStatus',
      field: 'Marital Status',
      category: 'Personal',
      editTab: 'personal',
      isComplete: Boolean(employee.maritalStatus && employee.maritalStatus.trim().length > 0),
      value: employee.maritalStatus,
      hint: 'Marital status for dependent benefits and tax deductions.'
    },
    {
      id: 'nationality',
      field: 'Nationality',
      category: 'Personal',
      editTab: 'personal',
      isComplete: Boolean(employee.nationality && employee.nationality.trim().length > 0),
      value: employee.nationality,
      hint: 'Country of citizenship and statutory employment authorization.'
    },
    {
      id: 'address',
      field: 'Residential Address',
      category: 'Personal',
      editTab: 'personal',
      isComplete: Boolean(employee.address && employee.address.trim().length > 5),
      value: employee.address,
      hint: 'Current permanent home address for HR mailings and emergencies.'
    }
  ];

  const totalFields = completionItems.length;
  const completedFields = completionItems.filter(item => item.isComplete).length;
  const missingFields = completionItems.filter(item => !item.isComplete);
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  const displayedChecklist = completionItems.filter(item => {
    if (checklistFilter === 'missing') return !item.isComplete;
    if (checklistFilter === 'completed') return item.isComplete;
    return true;
  });

  // Sync formData when employee changes
  React.useEffect(() => {
    setFormData({
      ...employee,
      address: employee.address || 'House 42, Road 11, Block D, Banani, Dhaka-1213',
      gender: employee.gender || 'Male',
      dob: employee.dob || '14 Aug 1994',
      bloodGroup: employee.bloodGroup || 'O+ Positive',
      maritalStatus: employee.maritalStatus || 'Single',
      nationality: employee.nationality || 'Bangladeshi',
      location: employee.location || 'Gulshan 2, Dhaka',
      reportingManager: employee.reportingManager || 'Sarah Jenkins',
      baseSalary: employee.baseSalary || 145000
    });
  }, [employee]);

  // Filter tabs - hide Payroll if not admin and not self
  const allTabs = ['Overview', 'Personal', 'Employment', 'Attendance', 'Leave', 'Payroll', 'Documents'] as const;
  const tabs = allTabs.filter(t => t !== 'Payroll' || canViewSalary);

  const handleOpenEdit = (initialTab: 'personal' | 'employment' | 'avatar' = 'personal') => {
    setEditTab(initialTab);
    setFormData({
      ...employee,
      address: employee.address || 'House 42, Road 11, Block D, Banani, Dhaka-1213',
      gender: employee.gender || 'Male',
      dob: employee.dob || '14 Aug 1994',
      bloodGroup: employee.bloodGroup || 'O+ Positive',
      maritalStatus: employee.maritalStatus || 'Single',
      nationality: employee.nationality || 'Bangladeshi',
      location: employee.location || 'Gulshan 2, Dhaka',
      reportingManager: employee.reportingManager || 'Sarah Jenkins',
      baseSalary: employee.baseSalary || 145000
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Full name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Email address is required.');
      return;
    }
    if (!formData.designation.trim()) {
      setFormError('Job designation is required.');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      if (onUpdateEmployee) {
        onUpdateEmployee(formData);
      }
      setSaving(false);
      setIsEditModalOpen(false);
      if (showToast) {
        showToast('Profile information updated successfully!');
      }
    }, 300);
  };

  const PRESET_AVATARS = [
    { label: 'Avatar 1', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQndi0Q67LuyTUAs8C_7ptSSpWoFH67QhVbLxfJfqqymbTF0-ImTvZteCBSvRhku41rEwtRkkZ2yuI6nQmZb0BfCOfoZGNID_PEOn4VWAWuKVpWR7Ik8bXButYDHroiVhejf7BUJNlr5RCQjELnvfecxNjb3pdO-wFiNm8ZRyrk3KjzJktBW6t2HdB8uvLEdFXWKFvdGX3obC3EyYo3QUO3PVDq-c-ap2YZgHP_1pncDG6fIUYwwl' },
    { label: 'Avatar 2', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGYbO589VOTATEVvsbR5nyyOSwLBLuKXOxbFTAMEVyEEoVKEAscptTr1Fw8iGYSdAB1g1J5Y2Vx6y8Ypywrc1QuHnwiu6JKqVnuiQ75E-Zl1lklVnZju58LXg4EI6rxi76D29F_QaeZ2oRg09f6FoJmK_QL6Z8b3aMDi0bl53XwFkCgcHB8gkqEbh1qkmBlu_dlAs6b6vNmeVUXXkWqoQmRb8581biV9eH9oJ2xg2_FZghdAbak5L' },
    { label: 'Avatar 3', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSANbGI_8XJwr4JerK2U_S85Z10-Lhe_dnK9SL5j7CA7A78CwnhHQHcY4OfNOr2pDaW9hgOkTqKBCWPZ9PSSR9sfz9ljGdJCaRFTtYFjjW-EeDaH4Lb7pSfNCRoyGbmvg9LYJvJf4XTU2H0-vTX1OncSoyHd9Yq1BjbrpoWB6up8qQOivnc3S9AK11f-bL5xi6YcXHd-lgU3gKTaGFvNAZXYG0H5_OaDSz4Vlg_JLyRbeFO6H7cJrv' },
    { label: 'Avatar 4', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADQcAFIWDJ8g7APl2aOjC7M5drmvNeR0adkjwJQVVuoFudHVArwpni00b8CM7KOAHa7oxn4kKlj8AuLw3DQ5q7z72A_M7SyQJfWE_Omi_kh3T0W41JFx5OUziSGWqpzvo0veD9kqf54hae4mDr7abyGMq79swnEo0j598XUbb2OXswI5H1s5qlM86vEdiXh_udAlNHwMxSXuvt-XFNIbqvvlG-ZjCtCUI--j3MBmfhy7XMikuswA27' },
    { label: 'Avatar 5', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxxwgp1S_xgssIZegK3dERGVDZcLI9XQVUUm9It4Wm4oMN4NKizpZSI9fWQibKQdGBAI8RMzHaqD_HL4fSBoylnUj-ucusfkiJ8xXMyzcwvEM_rNaleKTzbfNS6NpSpcOYjnN7_IfN8HwVz4nDrcsjOoNXLw5OjxsykRRqh1lGToOo0hbnOQt7mnj54iEhfAtgCaAsqcivvqhMKtX2XVijkEYYxOy-VtUvvwosmtJodKaQSKIgpOb4' },
    { label: 'Avatar 6', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5IchO3RZGm0f-HVXMJ2KxT1l2SPNekW2kVOsggoKpVozxw1zaldbKe88nR15OTuPadqt_G7uE6prssjL5xoTgVCGTpoza8BFq1s1jhzKiaXW7oZKPC9tygDzBzxnsHNiu2qwkIO4zmOCcexW7kiM1D9FmeO5X-YHAWr5NitUEE2fZ6T5TkPRNQb3uPDz0rR1Mnot8atZ8vqQ5D0tFqEAqa-TfiXb4wekFZpoBxlHR6R4nrLDWUoI1' },
    { label: 'Avatar 7', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwY4FYp5_M7k-ZIiDBaE9RxdEkkHIZ-0iOnrgx4tUXhpraXo8K9oa9lSO_8BcdC9WHYpoTRLi-yjLbZvTxlT0x6mMs2w-wcSvfhuXZ3jatECSogNvTrNSgDswwJxuHS57HgdFTQVtKswQtamvIRLtzLStl3GeYzoa-vq97chSsokir3mYCzjFrZx745AWtSH9Fb5B0ZbATFXXjldqEpQWtZDw8zhwcd-H7t0DPFPNQWokx08LQ2PfB' }
  ];

  return (
    <div id="employee-detail-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button 
            onClick={onBack}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Employee Management</span>
          </button>
          <span>/</span>
          <span className="text-purple-300 font-semibold">{employee.name}</span>
        </div>

        <button
          onClick={onBack}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 cursor-pointer transition-colors"
        >
          ← Back to Directory
        </button>
      </div>

      {/* Hero Profile Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-br from-[#191e3b]/90 via-[#131b2e]/90 to-[#1e1333]/90">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar & Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              {employee.avatar ? (
                <img
                  src={employee.avatar}
                  alt={employee.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-purple-500/30 shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-2xl">
                  {employee.avatarInitials || (employee.name ? employee.name.substring(0, 2).toUpperCase() : 'EM')}
                </div>
              )}
              
              {canEdit && (
                <button
                  type="button"
                  onClick={() => handleOpenEdit('avatar')}
                  className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer backdrop-blur-xs"
                  title="Change Avatar"
                >
                  <Camera className="w-5 h-5 mb-1 text-purple-300" />
                  <span className="text-[10px] font-bold">Edit Photo</span>
                </button>
              )}

              <span className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full ring-4 ring-[#131b2e] ${
                employee.status === 'Active' ? 'bg-emerald-500' :
                employee.status === 'On Leave' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Sora']">
                  {employee.name}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${
                  employee.status === 'Active'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : employee.status === 'On Leave'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}>
                  <CheckCircle2 className="w-3 h-3" /> {employee.status || 'Active'}
                </span>

                {/* Profile Completion Indicator Badge */}
                <span 
                  id="badge-profile-completion"
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-all ${
                    completionPercentage === 100
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                      : completionPercentage >= 75
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                  }`}
                  onClick={() => setActiveTab('Overview')}
                  title="Click to view Profile Completion Checklist"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{completionPercentage}% Complete</span>
                  {missingFields.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </span>
              </div>

              <p className="text-sm font-semibold text-purple-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-400" />
                <span>{employee.designation}</span>
                <span className="text-slate-400">• {employee.department}</span>
              </p>

              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="font-mono text-purple-300 font-semibold">{employee.empId}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{employee.location || employee.address || 'Gulshan 2, Dhaka'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{employee.email}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            {canEdit && (
              <button
                id="btn-emp-detail-edit"
                onClick={() => handleOpenEdit('personal')}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold bg-white/[0.08] hover:bg-purple-600/30 text-white border border-white/15 hover:border-purple-500/50 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group"
              >
                <Edit3 className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <span>Edit Profile</span>
              </button>
            )}

            <button
              id="btn-emp-detail-message"
              onClick={() => onSendMessage(employee)}
              className="flex-1 md:flex-initial brand-gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/30 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message</span>
            </button>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex items-center gap-1 border-t border-white/5 mt-6 pt-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              id={`tab-emp-${tab.toLowerCase()}`}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* Profile Completeness Visual Progress Bar & Checklist Widget */}
          <div id="profile-completeness-widget" className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-gradient-to-br from-[#161d36]/90 via-[#131b2e]/90 to-[#1c1836]/90 shadow-xl space-y-6">
            {/* Header with completion stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
                  completionPercentage === 100 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                    : completionPercentage >= 70
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                }`}>
                  {completionPercentage === 100 ? (
                    <ShieldCheck className="w-6 h-6" />
                  ) : (
                    <ListChecks className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-['Sora']">Profile Completion & Strength</h3>
                    {completionPercentage === 100 ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Fully Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {missingFields.length} {missingFields.length === 1 ? 'field' : 'fields'} missing
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {completedFields} of {totalFields} core records completed ({completionPercentage}%)
                  </p>
                </div>
              </div>

              {/* Action shortcuts */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {missingFields.length > 0 && canEdit && (
                  <button
                    id="btn-complete-next-field"
                    onClick={() => handleOpenEdit(missingFields[0].editTab)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold brand-gradient-btn text-white flex items-center gap-1.5 shadow-md shadow-purple-600/25 cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <span>Complete Missing Fields</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  id="btn-toggle-checklist"
                  onClick={() => setIsChecklistExpanded(!isChecklistExpanded)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>{isChecklistExpanded ? 'Hide Checklist' : 'Show Checklist'}</span>
                  {isChecklistExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>Overall Profile Score</span>
                  <span className="text-[10px] text-slate-500">• Recommended for payroll & compliance</span>
                </span>
                <span className={`font-extrabold text-sm font-['Sora'] ${
                  completionPercentage === 100 
                    ? 'text-emerald-400' 
                    : completionPercentage >= 70 
                    ? 'text-purple-300' 
                    : 'text-amber-400'
                }`}>
                  {completionPercentage}%
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full h-3.5 bg-slate-900/80 rounded-full p-0.5 border border-white/10 overflow-hidden relative shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out relative ${
                    completionPercentage === 100
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                      : completionPercentage >= 70
                      ? 'bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                      : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  }`}
                  style={{ width: `${Math.max(completionPercentage, 6)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite] opacity-50 rounded-full" />
                </div>
              </div>

              {/* Category Breakdown Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {(['Personal', 'Employment', 'Contact', 'Media'] as const).map(cat => {
                  const catItems = completionItems.filter(i => i.category === cat);
                  const catDone = catItems.filter(i => i.isComplete).length;
                  const isCatDone = catDone === catItems.length;
                  return (
                    <div 
                      key={cat}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                        isCatDone 
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                          : 'bg-white/[0.03] text-slate-400 border-white/5'
                      }`}
                    >
                      {isCatDone ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                      <span className="font-semibold text-slate-300">{cat}:</span>
                      <span className={isCatDone ? 'text-emerald-300 font-bold' : 'text-slate-400 font-medium'}>
                        {catDone}/{catItems.length}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Checklist Drawer */}
            {isChecklistExpanded && (
              <div className="pt-3 border-t border-white/5 space-y-4">
                {/* Filter and toggle controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px] font-medium mr-1">Filter:</span>
                    <button
                      type="button"
                      id="filter-checklist-all"
                      onClick={() => setChecklistFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        checklistFilter === 'all'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                      }`}
                    >
                      All ({totalFields})
                    </button>
                    <button
                      type="button"
                      id="filter-checklist-missing"
                      onClick={() => setChecklistFilter('missing')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                        checklistFilter === 'missing'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                      }`}
                    >
                      <span>Missing</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/30 text-amber-200 font-bold">
                        {missingFields.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      id="filter-checklist-completed"
                      onClick={() => setChecklistFilter('completed')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                        checklistFilter === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                      }`}
                    >
                      <span>Completed</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/30 text-emerald-200 font-bold">
                        {completedFields}
                      </span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Click "Fill In" on any missing item to update instantly
                  </span>
                </div>

                {/* Checklist Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {displayedChecklist.map((item) => (
                    <div
                      key={item.id}
                      id={`checklist-item-${item.id}`}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        item.isComplete
                          ? 'bg-white/[0.015] border-white/5 hover:border-emerald-500/30'
                          : 'bg-amber-500/[0.04] border-amber-500/20 hover:border-amber-500/40 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          item.isComplete
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {item.isComplete ? (
                            <Check className="w-3 h-3 stroke-[3]" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold truncate ${
                              item.isComplete ? 'text-slate-200' : 'text-amber-200 font-bold'
                            }`}>
                              {item.field}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.05] text-slate-400">
                              {item.category}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-1">
                            {item.isComplete ? (
                              <span className="text-slate-300 font-normal">
                                {item.value || 'Verified & Saved'}
                              </span>
                            ) : (
                              <span className="text-amber-300/80">
                                {item.hint}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Action button */}
                      <div className="shrink-0 flex items-center">
                        {item.isComplete ? (
                          canEdit && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item.editTab)}
                              className="text-[11px] text-slate-400 hover:text-purple-300 font-semibold px-2 py-1 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                          )
                        ) : (
                          canEdit && (
                            <button
                              type="button"
                              id={`btn-fill-${item.id}`}
                              onClick={() => handleOpenEdit(item.editTab)}
                              className="text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                            >
                              <span>Fill In</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 100% Celebration Banner */}
                {completionPercentage === 100 && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-300 text-xs">
                    <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold text-emerald-200">100% Profile Information Complete!</p>
                      <p className="text-[11px] text-emerald-400/90">All demographic, employment, contact, and system records are fully verified.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bento Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Leaves Stat */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Remaining Leaves</span>
                <CalendarDays className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white font-['Sora']">14 / 24 <span className="text-xs font-normal text-slate-400">Days</span></p>
                <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div className="w-[58%] h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">10 days consumed this fiscal year</p>
            </div>

            {/* Attendance Rate */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Attendance Rate</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white font-['Sora']">97.8%</p>
                <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div className="w-[97.8%] h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" />
                </div>
              </div>
              <p className="text-[11px] text-emerald-400/80">+2.5% higher than department benchmark</p>
            </div>

            {/* Total Earnings / Salary (Protected: Admin or Self) */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Compensation</span>
                <CreditCard className="w-4 h-4 text-purple-400" />
              </div>
              {canViewSalary ? (
                <div>
                  <p className="text-2xl font-bold text-white font-['Sora']">৳ {(employee.baseSalary || 145000).toLocaleString()}</p>
                  <p className="text-xs text-purple-300 font-semibold mt-1">Base Monthly Salary</p>
                  {isAdmin && (
                    <button 
                      onClick={() => onNavigate('payroll')}
                      className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold mt-2 inline-block cursor-pointer"
                    >
                      View Payroll Ledger →
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2 text-slate-400">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-medium text-slate-400">Confidential (Admin Only)</span>
                </div>
              )}
            </div>
          </div>

          {/* Details 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Details Card */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400" />
                  Personal Information
                </h3>
                {canEdit && (
                  <button
                    onClick={() => handleOpenEdit('personal')}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">Full Name</span>
                  <span className="font-semibold text-white">{employee.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Email Address</span>
                  <span className="font-semibold text-purple-300 break-all">{employee.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Phone Number</span>
                  <span className="font-semibold text-white">{employee.phone || '+880 1700-000000'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Date of Birth</span>
                  <span className="font-semibold text-white">{employee.dob || '14 August 1994'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Gender</span>
                  <span className="font-semibold text-white">{employee.gender || 'Male'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Blood Group</span>
                  <span className="font-semibold text-white">{employee.bloodGroup || 'O+ Positive'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Marital Status</span>
                  <span className="font-semibold text-white">{employee.maritalStatus || 'Single'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Nationality</span>
                  <span className="font-semibold text-white">{employee.nationality || 'Bangladeshi'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block mb-1">Residential Address</span>
                  <span className="font-semibold text-white">{employee.address || 'House 42, Road 11, Block D, Banani, Dhaka-1213'}</span>
                </div>
              </div>
            </div>

            {/* Employment Details Card */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  Employment Information
                </h3>
                {canEdit && (
                  <button
                    onClick={() => handleOpenEdit('employment')}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">Designation</span>
                  <span className="font-semibold text-white">{employee.designation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Department</span>
                  <span className="font-semibold text-white">{employee.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Employee ID</span>
                  <span className="font-mono font-semibold text-purple-300">{employee.empId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Joining Date</span>
                  <span className="font-semibold text-white">{employee.joiningDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Employment Status</span>
                  <span className="font-semibold text-emerald-300">{employee.status || 'Active'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Work Location</span>
                  <span className="font-semibold text-white">{employee.location || 'Gulshan 2, Dhaka'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block mb-1">Reporting Manager</span>
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/5 mt-1">
                    <div className="w-8 h-8 rounded-full bg-purple-600/30 text-purple-200 font-bold flex items-center justify-center text-xs">
                      {(employee.reportingManager || 'Sarah Jenkins').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{employee.reportingManager || 'Sarah Jenkins'}</p>
                      <p className="text-[11px] text-purple-300">Department Supervisor</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personal Tab */}
      {activeTab === 'Personal' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                Comprehensive Personal Profile
              </h3>
              <p className="text-xs text-slate-400">Detailed personal demographics and contact information</p>
            </div>
            {canEdit && (
              <button
                onClick={() => handleOpenEdit('personal')}
                className="brand-gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/30"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Personal Details</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">Identity & Name</span>
              <div>
                <span className="text-slate-500 block mb-1">Full Legal Name</span>
                <span className="font-semibold text-white text-sm">{employee.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Date of Birth</span>
                <span className="font-semibold text-white">{employee.dob || '14 August 1994'}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Gender</span>
                <span className="font-semibold text-white">{employee.gender || 'Male'}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Nationality</span>
                <span className="font-semibold text-white">{employee.nationality || 'Bangladeshi'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">Contact & Communication</span>
              <div>
                <span className="text-slate-500 block mb-1">Work / Primary Email</span>
                <span className="font-semibold text-purple-300 break-all">{employee.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Primary Phone</span>
                <span className="font-semibold text-white">{employee.phone || '+880 1700-000000'}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Emergency Contact</span>
                <span className="font-semibold text-slate-300">+880 1911-001122 (Family)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Demographics & Residence</span>
              <div>
                <span className="text-slate-500 block mb-1">Blood Group</span>
                <span className="font-semibold text-white">{employee.bloodGroup || 'O+ Positive'}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Marital Status</span>
                <span className="font-semibold text-white">{employee.maritalStatus || 'Single'}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Residential Address</span>
                <span className="font-semibold text-white">{employee.address || 'House 42, Road 11, Block D, Banani, Dhaka-1213'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employment Tab */}
      {activeTab === 'Employment' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                Employment & Role Information
              </h3>
              <p className="text-xs text-slate-400">Position designation, department, and company organization</p>
            </div>
            {canEdit && (
              <button
                onClick={() => handleOpenEdit('employment')}
                className="brand-gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/30"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Employment Info</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">Job Hierarchy</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block mb-1">Designation</span>
                  <span className="font-semibold text-white text-sm">{employee.designation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Department</span>
                  <span className="font-semibold text-white text-sm">{employee.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Employee ID</span>
                  <span className="font-mono font-semibold text-purple-300">{employee.empId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Reporting Manager</span>
                  <span className="font-semibold text-white">{employee.reportingManager || 'Sarah Jenkins'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">Contract & Status</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block mb-1">Joining Date</span>
                  <span className="font-semibold text-white">{employee.joiningDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Employment Status</span>
                  <span className="font-semibold text-emerald-300">{employee.status || 'Active'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Work Location</span>
                  <span className="font-semibold text-white">{employee.location || 'Gulshan 2, Dhaka'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Employment Type</span>
                  <span className="font-semibold text-white">Full-Time Permanent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'Attendance' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Attendance Records & Time Log
            </h3>
            <span className="text-xs text-emerald-300 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Avg Daily Hours: 8h 45m
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-white/5 bg-white/[0.02]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Clock In</th>
                  <th className="py-2.5 px-3">Clock Out</th>
                  <th className="py-2.5 px-3">Total Hours</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Today</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-mono">09:02 AM</td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono">In Progress</td>
                  <td className="py-2.5 px-3 font-mono">6h 15m</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Present</span></td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Yesterday</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-mono">08:58 AM</td>
                  <td className="py-2.5 px-3 text-purple-300 font-mono">06:05 PM</td>
                  <td className="py-2.5 px-3 font-mono">9h 07m</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Present</span></td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">26 Aug 2026</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-mono">09:12 AM</td>
                  <td className="py-2.5 px-3 text-purple-300 font-mono">06:00 PM</td>
                  <td className="py-2.5 px-3 font-mono">8h 48m</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">Late (12m)</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leave Tab */}
      {activeTab === 'Leave' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-400" />
              Leave Balance & History
            </h3>
            <button
              onClick={() => onNavigate('leave')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
            >
              Open Leave Center →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
              <span className="text-slate-400 block mb-1">Casual Leave</span>
              <p className="text-lg font-bold text-white">6 <span className="text-slate-500 text-xs">/ 10 days left</span></p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
              <span className="text-slate-400 block mb-1">Sick Leave</span>
              <p className="text-lg font-bold text-white">8 <span className="text-slate-500 text-xs">/ 10 days left</span></p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
              <span className="text-slate-400 block mb-1">Annual Paid Leave</span>
              <p className="text-lg font-bold text-white">12 <span className="text-slate-500 text-xs">/ 14 days left</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Tab */}
      {activeTab === 'Payroll' && canViewSalary && (
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-400" />
              Payroll & Compensation Details
            </h3>
            <span className="text-xs text-purple-300 font-mono font-bold bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
              Monthly Base: ৳ {(employee.baseSalary || 145000).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-400 block mb-1">Basic Salary (60%)</span>
              <p className="text-base font-bold text-white">৳ {Math.round((employee.baseSalary || 145000) * 0.6).toLocaleString()}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-400 block mb-1">House Rent (25%)</span>
              <p className="text-base font-bold text-white">৳ {Math.round((employee.baseSalary || 145000) * 0.25).toLocaleString()}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-400 block mb-1">Medical Allowance (10%)</span>
              <p className="text-base font-bold text-white">৳ {Math.round((employee.baseSalary || 145000) * 0.1).toLocaleString()}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-400 block mb-1">Conveyance (5%)</span>
              <p className="text-base font-bold text-white">৳ {Math.round((employee.baseSalary || 145000) * 0.05).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'Documents' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Verified Employee Documents
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="font-semibold text-white">Employment_Agreement_{employee.empId}.pdf</p>
                  <p className="text-[10px] text-slate-500">Verified & Digitally Signed</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Active</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="font-semibold text-white">National_ID_Card_{employee.name.replace(/\s+/g, '_')}.pdf</p>
                  <p className="text-[10px] text-slate-500">Government ID Verified</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Verified</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Comprehensive Profile Edit Modal (Personal + Employment + Avatar Info) */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            id="modal-edit-profile"
            className="w-full max-w-2xl glass-panel rounded-3xl border border-purple-500/30 shadow-2xl relative bg-[#10172b] text-white flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Full Profile</h3>
                  <p className="text-xs text-slate-400">Update personal, employment, and contact records for {employee.name}</p>
                </div>
              </div>

              <button
                id="btn-close-edit-profile-modal"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="px-6 pt-3 pb-2 border-b border-white/5 flex items-center gap-2 shrink-0 bg-white/[0.01]">
              <button
                type="button"
                id="modal-tab-personal"
                onClick={() => setEditTab('personal')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  editTab === 'personal'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Personal Info & Address</span>
              </button>

              <button
                type="button"
                id="modal-tab-employment"
                onClick={() => setEditTab('employment')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  editTab === 'employment'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Designation & Employment</span>
              </button>

              <button
                type="button"
                id="modal-tab-avatar"
                onClick={() => setEditTab('avatar')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  editTab === 'avatar'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Profile Photo</span>
              </button>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Modal Body Form */}
            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* TAB 1: Personal Information */}
              {editTab === 'personal' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 font-semibold mb-1.5 block">Full Legal Name *</label>
                      <input
                        id="input-edit-emp-name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold mb-1.5 block">Email Address (Login ID) *</label>
                      <input
                        id="input-edit-emp-email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold mb-1.5 block">Phone Number</label>
                      <input
                        id="input-edit-emp-phone"
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+880 1700-000000"
                        className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold mb-1.5 block">Date of Birth</label>
                      <input
                        id="input-edit-emp-dob"
                        type="text"
                        value={formData.dob || ''}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        placeholder="14 Aug 1994"
                        className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold mb-1.5 block">Gender</label>
                      <select
                        id="select-edit-emp-gender"
                        value={formData.gender || 'Male'}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#172038] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold mb-1.5 block">Blood Group</label>
                      <select
                        id="select-edit-emp-blood"
                        value={formData.bloodGroup || 'O+ Positive'}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#172038] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                      >
                        <option value="A+ Positive">A+ Positive</option>
                        <option value="A- Negative">A- Negative</option>
                        <option value="B+ Positive">B+ Positive</option>
                        <option value="B- Negative">B- Negative</option>
                        <option value="AB+ Positive">AB+ Positive</option>
                        <option value="AB- Negative">AB- Negative</option>
                        <option value="O+ Positive">O+ Positive</option>
                        <option value="O- Negative">O- Negative</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold mb-1.5 block">Marital Status</label>
                      <select
                        id="select-edit-emp-marital"
                        value={formData.maritalStatus || 'Single'}
                        onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#172038] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                      >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold mb-1.5 block">Nationality</label>
                      <input
                        id="input-edit-emp-nationality"
                        type="text"
                        value={formData.nationality || 'Bangladeshi'}
                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                        placeholder="Bangladeshi"
                        className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold mb-1.5 block">Residential Address</label>
                    <textarea
                      id="input-edit-emp-address"
                      rows={2}
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street, Sector, Apartment/House, City, Postal Code"
                      className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: Designation & Employment */}
              {editTab === 'employment' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 font-semibold mb-1.5 block">Designation / Job Title *</label>
                      <input
                        id="input-edit-emp-designation"
                        type="text"
                        required
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        placeholder="e.g. Lead UI/UX Designer"
                        className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold mb-1.5 block">Department *</label>
                      <select
                        id="select-edit-emp-department"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 bg-[#172038] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                      >
                        <option value="Design">Design</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Marketing">Marketing</option>
                        <option value="HR">HR</option>
                        <option value="Operations">Operations</option>
                        <option value="Finance">Finance</option>
                        <option value="Sales">Sales</option>
                        <option value="Support">Support</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold mb-1.5 block">Employee ID</label>
                      <input
                        id="input-edit-emp-empid"
                        type="text"
                        value={formData.empId}
                        onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                        placeholder="EMP-0142"
                        className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold mb-1.5 block">Joining Date</label>
                      <input
                        id="input-edit-emp-joining"
                        type="text"
                        value={formData.joiningDate}
                        onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                        placeholder="10 Feb 2020"
                        className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold mb-1.5 block">Employment Status</label>
                      <select
                        id="select-edit-emp-status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 bg-[#172038] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold mb-1.5 block">Work Location</label>
                      <input
                        id="input-edit-emp-location"
                        type="text"
                        value={formData.location || ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Gulshan 2, Dhaka / Remote"
                        className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold mb-1.5 block">Reporting Manager</label>
                      <input
                        id="input-edit-emp-manager"
                        type="text"
                        value={formData.reportingManager || ''}
                        onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                        placeholder="e.g. Sarah Jenkins / Raja Raza"
                        className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    {/* Salary Field: Admin editable or Self visible */}
                    <div>
                      <label className="text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                        <span>Base Monthly Salary (৳)</span>
                        {!isAdmin && <span className="text-[10px] text-slate-500">Read-only for staff</span>}
                      </label>
                      <input
                        id="input-edit-emp-salary"
                        type="number"
                        disabled={!isAdmin}
                        value={formData.baseSalary || 145000}
                        onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                        placeholder="145000"
                        className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 disabled:opacity-60 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Avatar / Profile Photo */}
              {editTab === 'avatar' && (
                <div className="space-y-5">
                  {/* Hidden Native File Input */}
                  <input
                    ref={avatarFileInputRef}
                    id="input-avatar-file-browser"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleAvatarFileSelect(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  {/* Current Active Preview & Summary Card */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-4">
                      {formData.avatar ? (
                        <div className="relative shrink-0">
                          <img
                            src={formData.avatar}
                            alt="Current Avatar"
                            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-500/50 shadow-lg"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-[#131b2e] flex items-center justify-center text-[9px] text-white">
                            ✓
                          </span>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-purple-600/30 text-purple-200 font-bold flex items-center justify-center text-lg shrink-0 border border-purple-500/30">
                          {formData.name ? formData.name.substring(0, 2).toUpperCase() : 'EM'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-white text-sm">{formData.name}</h4>
                        <p className="text-xs text-slate-400">
                          {formData.avatar ? 'Custom profile photo loaded' : 'No photo uploaded yet'}
                        </p>
                        {avatarFileInfo && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-purple-300 font-medium truncate max-w-[160px]">
                              {avatarFileInfo.name}
                            </span>
                            <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                              {avatarFileInfo.size}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        id="btn-browse-avatar-file"
                        onClick={() => avatarFileInputRef.current?.click()}
                        className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
                        <span>Browse Photo</span>
                      </button>

                      {formData.avatar && (
                        <button
                          type="button"
                          id="btn-remove-avatar-photo"
                          onClick={() => {
                            setFormData({ ...formData, avatar: '' });
                            setAvatarFileInfo(null);
                          }}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs transition-colors cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Primary Drag & Drop + Browse Zone */}
                  <div
                    id="dropzone-avatar-upload"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingAvatar(true);
                    }}
                    onDragLeave={() => setIsDraggingAvatar(false)}
                    onDrop={handleAvatarDrop}
                    onClick={() => avatarFileInputRef.current?.click()}
                    className={`relative p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center group flex flex-col items-center justify-center gap-2.5 ${
                      isDraggingAvatar
                        ? 'border-purple-500 bg-purple-500/10 scale-[1.01]'
                        : 'border-white/15 bg-white/[0.02] hover:border-purple-500/50 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white">
                        Click to Browse or Drag & Drop Photo
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                        Select a picture from your computer, tablet or mobile device (JPG, PNG, WEBP, GIF, SVG up to 8MB)
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-purple-300 group-hover:border-purple-500/40 transition-colors">
                      <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                      Browse Files from Device
                    </span>
                  </div>

                  {/* Optional Preset Curated Avatars */}
                  <div>
                    <label className="text-xs text-slate-400 font-semibold mb-2 block uppercase tracking-wider">
                      Or Choose a Curated Avatar Preset
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                      {PRESET_AVATARS.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, avatar: av.url });
                            setAvatarFileInfo({ name: `Preset ${av.label}`, size: 'Preset Asset' });
                          }}
                          className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer p-0.5 group ${
                            formData.avatar === av.url
                              ? 'border-purple-500 ring-2 ring-purple-500/50 scale-105 shadow-md'
                              : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img 
                            src={av.url} 
                            alt={av.label} 
                            className="w-full h-full object-cover rounded-lg"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions footer */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  id="btn-save-profile-changes"
                  className="brand-gradient-btn px-6 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save All Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
