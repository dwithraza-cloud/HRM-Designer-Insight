import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Edit, 
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
  Lock
} from 'lucide-react';
import { Employee, ViewMode, UserProfile } from '../types';

interface EmployeeDetailViewProps {
  employee: Employee;
  currentUser?: UserProfile;
  onBack: () => void;
  onNavigate: (view: ViewMode) => void;
  onSendMessage: (employee: Employee) => void;
}

export const EmployeeDetailView: React.FC<EmployeeDetailViewProps> = ({
  employee,
  currentUser,
  onBack,
  onNavigate,
  onSendMessage
}) => {
  const roleType = currentUser?.roleType || 'admin';
  const isAdmin = roleType === 'admin';
  const isSelf = currentUser?.id === employee.id || currentUser?.name === employee.name;
  const canViewSalary = isAdmin || isSelf;

  const [activeTab, setActiveTab] = useState<'Overview' | 'Personal' | 'Employment' | 'Attendance' | 'Leave' | 'Payroll' | 'Documents'>('Overview');
  const [isEditing, setIsEditing] = useState(false);

  // Filter tabs - hide Payroll if not admin and not self
  const allTabs = ['Overview', 'Personal', 'Employment', 'Attendance', 'Leave', 'Payroll', 'Documents'] as const;
  const tabs = allTabs.filter(t => t !== 'Payroll' || canViewSalary);

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
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 cursor-pointer"
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
            <div className="relative">
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
              <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full ring-4 ring-[#131b2e]" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Sora']">
                  {employee.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {employee.status}
                </span>
              </div>

              <p className="text-sm font-semibold text-purple-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-400" />
                {employee.designation} • <span className="text-slate-400">{employee.department}</span>
              </p>

              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="font-mono text-purple-300 font-semibold">{employee.empId}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Gulshan 2, Dhaka</span>
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
            {isAdmin && (
              <button
                id="btn-emp-detail-edit"
                onClick={() => setIsEditing(!isEditing)}
                className="flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-purple-400" />
                <span>{isEditing ? 'Editing...' : 'Edit Profile'}</span>
              </button>
            )}
            <button
              id="btn-emp-detail-message"
              onClick={() => onSendMessage(employee)}
              className="flex-1 md:flex-initial brand-gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/30 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
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
          {/* Bento Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Leaves Stat */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Remaining Leaves</span>
                <CalendarDays className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white font-['Sora']">12 / 24 <span className="text-xs font-normal text-slate-400">Days</span></p>
                <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div className="w-1/2 h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">50% balance consumed this year</p>
            </div>

            {/* Attendance Rate */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Attendance Rate</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white font-['Sora']">96.5%</p>
                <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div className="w-[96.5%] h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" />
                </div>
              </div>
              <p className="text-[11px] text-emerald-400/80">+2.1% higher than team average</p>
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
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">Full Name</span>
                  <span className="font-semibold text-white">{employee.name}</span>
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
                  <span className="font-semibold text-white">O+ Positive</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Marital Status</span>
                  <span className="font-semibold text-white">Married</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Nationality</span>
                  <span className="font-semibold text-white">Bangladeshi</span>
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
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">Department</span>
                  <span className="font-semibold text-white">{employee.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Designation</span>
                  <span className="font-semibold text-white">{employee.designation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Employee ID</span>
                  <span className="font-mono font-semibold text-purple-300">{employee.empId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Joining Date</span>
                  <span className="font-semibold text-white">{employee.joiningDate}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block mb-1">Reporting Manager</span>
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/5 mt-1">
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrGYbO589VOTATEVvsbR5nyyOSwLBLuKXOxbFTAMEVyEEoVKEAscptTr1Fw8iGYSdAB1g1J5Y2Vx6y8Ypywrc1QuHnwiu6JKqVnuiQ75E-Zl1lklVnZju58LXg4EI6rxi76D29F_QaeZ2oRg09f6FoJmK_QL6Z8b3aMDi0bl53XwFkCgcHB8gkqEbh1qkmBlu_dlAs6b6vNmeVUXXkWqoQmRb8581biV9eH9oJ2xg2_FZghdAbak5L"
                      alt="Manager"
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{employee.reportingManager || 'Sarah Jenkins'}</p>
                      <p className="text-[11px] text-purple-300">VP of Product Design</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Tab Placeholders */}
      {activeTab !== 'Overview' && (
        <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
          <h3 className="text-base font-bold text-white">{activeTab} Details for {employee.name}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Viewing comprehensive logs, documents, and historical data records associated with {employee.name}.
          </p>
          <button
            onClick={() => setActiveTab('Overview')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 mt-2 inline-block cursor-pointer"
          >
            Back to Overview
          </button>
        </div>
      )}
    </div>
  );
};

