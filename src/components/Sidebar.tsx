import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Clock, 
  CalendarDays, 
  CreditCard, 
  Award, 
  CheckSquare, 
  Laptop, 
  FolderKanban, 
  BarChart3, 
  Settings, 
  ShieldCheck,
  Sparkles,
  HeadphonesIcon,
  Shield,
  UserCheck,
  User
} from 'lucide-react';
import { ViewMode, UserProfile } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  currentUser: UserProfile;
  onNavigate: (view: ViewMode) => void;
  onOpenSupport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  currentUser,
  onNavigate,
  onOpenSupport 
}) => {
  const roleType = currentUser.roleType || 'admin';

  // Base list of all items
  const allMenuItems: { 
    id: ViewMode; 
    label: string; 
    icon: React.ElementType; 
    badge?: string;
    roles: ('admin' | 'manager' | 'employee')[];
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
    { id: 'employees', label: roleType === 'admin' ? 'Employee Management' : (roleType === 'manager' ? 'Team Directory' : 'Company Directory'), icon: Users, roles: ['admin', 'manager', 'employee'] },
    { id: 'recruitment', label: roleType === 'admin' ? 'Recruitment' : (roleType === 'manager' ? 'Hiring & Interviews' : 'Internal Openings'), icon: Briefcase, badge: roleType === 'admin' ? '24' : undefined, roles: ['admin', 'manager', 'employee'] },
    { id: 'attendance', label: roleType === 'admin' ? 'Attendance' : (roleType === 'manager' ? 'Team Attendance' : 'My Attendance'), icon: Clock, roles: ['admin', 'manager', 'employee'] },
    { id: 'leave', label: roleType === 'admin' ? 'Leave Management' : (roleType === 'manager' ? 'Leave Approvals' : 'My Leaves'), icon: CalendarDays, badge: roleType === 'employee' ? undefined : '3', roles: ['admin', 'manager', 'employee'] },
    { id: 'payroll', label: roleType === 'admin' ? 'Payroll' : 'My Payslips', icon: CreditCard, roles: roleType === 'admin' ? ['admin'] : ['employee'] },
    { id: 'performance', label: roleType === 'admin' ? 'Performance' : (roleType === 'manager' ? 'Team Reviews' : 'My Performance'), icon: Award, roles: ['admin', 'manager', 'employee'] },
    { id: 'tasks', label: roleType === 'admin' ? 'Task Management' : (roleType === 'manager' ? 'Team Tasks' : 'My Tasks'), icon: CheckSquare, roles: ['admin', 'manager', 'employee'] },
    { id: 'assets', label: 'Asset Management', icon: Laptop, roles: ['admin'] },
    { id: 'documents', label: 'Document Management', icon: FolderKanban, roles: ['admin', 'manager', 'employee'] },
    { id: 'reports', label: roleType === 'admin' ? 'Reports & Analytics' : 'Department Analytics', icon: BarChart3, roles: ['admin', 'manager'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  ];

  // Strictly filter out any module that the current role is not authorized to see
  const authorizedMenuItems = allMenuItems.filter(item => item.roles.includes(roleType));

  const getRoleBadge = () => {
    switch (roleType) {
      case 'admin':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'manager':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <UserCheck className="w-3 h-3" /> Manager
          </span>
        );
      case 'employee':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <User className="w-3 h-3" /> Employee
          </span>
        );
    }
  };

  return (
    <aside id="main-sidebar" className="w-64 bg-[#0f172a]/95 border-r border-white/5 flex flex-col h-screen shrink-0 select-none overflow-y-auto">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-white/5 cursor-pointer" onClick={() => onNavigate('dashboard')}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7b42f6] to-[#a078ff] flex items-center justify-center shadow-lg shadow-purple-600/30 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-white tracking-tight">Aura HR</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Enterprise HRMS</p>
          </div>
        </div>
        {getRoleBadge()}
      </div>

      {/* Navigation List */}
      <div className="p-3 flex-1 space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>{roleType === 'admin' ? 'Administration' : (roleType === 'manager' ? `${currentUser.department || 'Department'} Portal` : 'Employee Workspace')}</span>
        </div>
        {authorizedMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === 'employees' && (currentView === 'employee-detail' || currentView === 'add-employee'));
          
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-[#a078ff]/20 to-[#7b42f6]/10 text-white border border-[#a078ff]/40 shadow-sm shadow-purple-900/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-[#c084fc]' : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  isActive 
                    ? 'bg-[#a078ff] text-white' 
                    : 'bg-white/10 text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Help & Admin Card */}
      <div className="p-4 border-t border-white/5 space-y-3">
        {/* Support Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#1e293b]/80 to-[#131b2e]/90 border border-white/10 text-center relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-3 mb-2.5">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZJQuMLWsuKBKmyvnIxfZKY45-SUjoXmLS1yXS98XYHLoEbsxJ_7F4RMkDMRDrQn6Kd5mUz0Uqjwh5f28atr_ooRqS9qRft2fInwFlov2q3_luFyHTdjsOlQMeVCJ65wo5G9f-sHrNLEjqiUcGzIceU95nZ_DyeGjoCIREGM9Bxz9HueMw7W-dWK6T_v_ME3F-RPmfOHbxaIkn6SO2jKhGiRtTOlXKnvxDdtpntRSfDo7MoSD3p8uz" 
              alt="Support Lead" 
              className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-400/40"
              referrerPolicy="no-referrer"
            />
            <div className="text-left">
              <p className="text-xs font-semibold text-white">Need Help?</p>
              <p className="text-[11px] text-slate-400">24/7 HRMS Support</p>
            </div>
          </div>
          <button
            id="btn-sidebar-support"
            onClick={onOpenSupport}
            className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#a078ff]/20 hover:bg-[#a078ff]/30 text-purple-200 border border-[#a078ff]/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <HeadphonesIcon className="w-3.5 h-3.5" />
            Contact Support
          </button>
        </div>

        {/* System Admin Button: strictly Admin only */}
        {roleType === 'admin' && (
          <button
            id="btn-sidebar-admin"
            onClick={() => onNavigate('admin')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>System Administration</span>
          </button>
        )}
      </div>
    </aside>
  );
};

