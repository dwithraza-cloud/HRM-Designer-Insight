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
  User,
  X,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { ViewMode, UserProfile } from '../types';
import { InsightLogo } from './InsightLogo';

interface SidebarProps {
  currentView: ViewMode;
  currentUser: UserProfile;
  currentTheme?: 'dark' | 'light';
  onNavigate: (view: ViewMode) => void;
  onOpenSupport: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  currentUser,
  currentTheme = currentUser.themePreference || 'dark',
  onNavigate,
  onOpenSupport,
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse
}) => {
  const roleType = currentUser.roleType || 'admin';
  const isLight = currentTheme === 'light';

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
    { id: 'settings', label: roleType === 'admin' ? 'Settings & Security' : 'Account Settings', icon: Settings, roles: ['admin', 'manager', 'employee'] },
  ];

  // Strictly filter out any module that the current role is not authorized to see
  const authorizedMenuItems = allMenuItems.filter(item => item.roles.includes(roleType));

  const getRoleBadge = () => {
    switch (roleType) {
      case 'admin':
        return (
          <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            isLight 
              ? 'bg-purple-100 text-purple-700 border-purple-200' 
              : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
          }`}>
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'manager':
        return (
          <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            isLight 
              ? 'bg-blue-100 text-blue-700 border-blue-200' 
              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
          }`}>
            <UserCheck className="w-3 h-3" /> Manager
          </span>
        );
      case 'employee':
        return (
          <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            isLight 
              ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}>
            <User className="w-3 h-3" /> Employee
          </span>
        );
    }
  };

  const handleItemClick = (id: ViewMode) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          id="sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar (Off-canvas Drawer on Mobile, Collapsible Rail on Desktop) */}
      <aside 
        id="main-sidebar" 
        className={`fixed inset-y-0 left-0 z-50 lg:static flex flex-col h-screen select-none backdrop-blur-xl lg:backdrop-blur-none border-r transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          isLight
            ? 'bg-white lg:bg-white border-slate-200 shadow-sm'
            : 'bg-[#0f172a]/95 lg:bg-[#0f172a]/95 border-white/5'
        } ${
          isMobileOpen 
            ? 'translate-x-0 w-72 max-w-[85vw] shadow-2xl shadow-purple-950/40' 
            : '-translate-x-full lg:translate-x-0'
        } ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
      >
        {/* Brand Header */}
        <div className={`p-4 border-b flex items-center justify-between transition-all ${
          isLight ? 'border-slate-200' : 'border-white/5'
        } ${
          isCollapsed ? 'lg:p-3 lg:justify-center' : 'p-4 sm:p-5'
        }`}>
          <div 
            className="flex items-center gap-3 cursor-pointer overflow-hidden" 
            onClick={() => handleItemClick('dashboard')}
            title="Insight HRM Dashboard"
          >
            <InsightLogo className="w-10 h-10 shrink-0" />
            {(!isCollapsed || isMobileOpen) && (
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold text-lg tracking-tight truncate ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>Insight HRM</span>
                </div>
                <p className={`text-xs font-medium truncate ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>Enterprise HRM</p>
              </div>
            )}
          </div>

          {/* Right Controls: Role Badge on mobile/expanded, and Close Button on Mobile */}
          <div className="flex items-center gap-1.5">
            {(!isCollapsed || isMobileOpen) && (
              <div className="hidden sm:block">
                {getRoleBadge()}
              </div>
            )}

            {/* Mobile Close Button */}
            <button
              id="btn-close-mobile-sidebar"
              onClick={onCloseMobile}
              className={`lg:hidden p-2 rounded-xl transition-colors cursor-pointer ${
                isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <div className="p-3 flex-1 space-y-1 overflow-y-auto overflow-x-hidden">
          {(!isCollapsed || isMobileOpen) && (
            <div className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between ${
              isLight ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <span className="truncate">
                {roleType === 'admin' ? 'Administration' : (roleType === 'manager' ? `${currentUser.department || 'Department'} Portal` : 'Employee Workspace')}
              </span>
            </div>
          )}
          
          {authorizedMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === 'employees' && (currentView === 'employee-detail' || currentView === 'add-employee'));
            
            return (
              <div key={item.id} className="relative group">
                <button
                  id={`nav-item-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isCollapsed && !isMobileOpen
                      ? 'justify-center p-3'
                      : 'justify-between px-3.5 py-2.5'
                  } ${
                    isActive
                      ? isLight
                        ? 'bg-purple-100 text-purple-900 border border-purple-300 shadow-sm font-semibold'
                        : 'bg-gradient-to-r from-[#a078ff]/20 to-[#7b42f6]/10 text-white border border-[#a078ff]/40 shadow-sm shadow-purple-900/30'
                      : isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                  title={isCollapsed && !isMobileOpen ? item.label : undefined}
                >
                  <div className={`flex items-center ${isCollapsed && !isMobileOpen ? 'justify-center' : 'gap-3'}`}>
                    <div className="relative">
                      <Icon className={`w-4 h-4 transition-colors shrink-0 ${
                        isActive 
                          ? (isLight ? 'text-purple-700' : 'text-[#c084fc]') 
                          : (isLight ? 'text-slate-500 group-hover:text-slate-900' : 'text-slate-400 group-hover:text-slate-200')
                      }`} />
                      {/* Compact Dot Badge on collapsed desktop */}
                      {isCollapsed && !isMobileOpen && item.badge && (
                        <span className={`absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-purple-500 ring-2 ${
                          isLight ? 'ring-white' : 'ring-[#0f172a]'
                        }`} />
                      )}
                    </div>
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate text-left">{item.label}</span>
                    )}
                  </div>

                  {(!isCollapsed || isMobileOpen) && item.badge && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      isActive 
                        ? (isLight ? 'bg-purple-600 text-white font-bold' : 'bg-[#a078ff] text-white') 
                        : (isLight ? 'bg-slate-200/80 text-slate-700' : 'bg-white/10 text-slate-300')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Floating Tooltip for Desktop Collapsed Mode */}
                {isCollapsed && !isMobileOpen && (
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-[#0f172a] border border-white/10 text-white text-xs font-semibold rounded-xl shadow-2xl whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1.5">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="bg-purple-500/30 text-purple-200 text-[10px] px-1.5 py-0.2 rounded-full border border-purple-500/30 font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Section: Support & Desktop Collapse Toggle */}
        <div className={`border-t transition-all ${
          isLight ? 'border-slate-200' : 'border-white/5'
        } ${
          isCollapsed && !isMobileOpen ? 'p-2 space-y-2' : 'p-4 space-y-3'
        }`}>
          {/* Support Card / Icon */}
          {isCollapsed && !isMobileOpen ? (
            <div className="relative group flex justify-center">
              <button
                id="btn-sidebar-support-collapsed"
                onClick={onOpenSupport}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                  isLight
                    ? 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
                    : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/30'
                }`}
                title="Contact Support"
              >
                <HeadphonesIcon className="w-4 h-4" />
              </button>
              <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-[#0f172a] border border-white/10 text-white text-xs font-semibold rounded-xl shadow-2xl whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                24/7 Support
              </div>
            </div>
          ) : (
            <div className={`p-3.5 rounded-2xl border text-center relative overflow-hidden shadow-sm ${
              isLight
                ? 'bg-gradient-to-b from-slate-50 to-slate-100 border-slate-200'
                : 'bg-gradient-to-b from-[#1e293b]/80 to-[#131b2e]/90 border-white/10 shadow-md'
            }`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-2.5">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZJQuMLWsuKBKmyvnIxfZKY45-SUjoXmLS1yXS98XYHLoEbsxJ_7F4RMkDMRDrQn6Kd5mUz0Uqjwh5f28atr_ooRqS9qRft2fInwFlov2q3_luFyHTdjsOlQMeVCJ65wo5G9f-sHrNLEjqiUcGzIceU95nZ_DyeGjoCIREGM9Bxz9HueMw7W-dWK6T_v_ME3F-RPmfOHbxaIkn6SO2jKhGiRtTOlXKnvxDdtpntRSfDo7MoSD3p8uz" 
                  alt="Support Lead" 
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-400/40"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left overflow-hidden">
                  <p className={`text-xs font-semibold truncate ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>Need Help?</p>
                  <p className={`text-[11px] truncate ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}>24/7 HRM Support</p>
                </div>
              </div>
              <button
                id="btn-sidebar-support"
                onClick={onOpenSupport}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  isLight
                    ? 'bg-purple-600 hover:bg-purple-700 text-white border-transparent shadow-sm'
                    : 'bg-[#a078ff]/20 hover:bg-[#a078ff]/30 text-purple-200 border-[#a078ff]/40'
                }`}
              >
                <HeadphonesIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Contact Support</span>
              </button>
            </div>
          )}

          {/* System Admin Button: strictly Admin only */}
          {roleType === 'admin' && (
            isCollapsed && !isMobileOpen ? (
              <div className="relative group flex justify-center">
                <button
                  id="btn-sidebar-admin-collapsed"
                  onClick={() => handleItemClick('admin')}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isLight ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-900' : 'hover:bg-white/[0.05] text-slate-400 hover:text-white'
                  }`}
                  title="System Administration"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                </button>
                <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-[#0f172a] border border-white/10 text-white text-xs font-semibold rounded-xl shadow-2xl whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  System Administration
                </div>
              </div>
            ) : (
              <button
                id="btn-sidebar-admin"
                onClick={() => handleItemClick('admin')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">System Administration</span>
              </button>
            )
          )}

          {/* Desktop Collapse / Expand Toggle Button */}
          <div className={`hidden lg:flex items-center justify-center pt-1 border-t ${
            isLight ? 'border-slate-200' : 'border-white/5'
          }`}>
            <button
              id="btn-toggle-sidebar-collapse"
              onClick={onToggleCollapse}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isLight 
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              } ${
                isCollapsed ? 'w-10 h-10' : 'w-full px-3'
              }`}
              title={isCollapsed ? 'Expand Sidebar (Ctrl+\\)' : 'Collapse Sidebar to reclaim space (Ctrl+\\)'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              ) : (
                <>
                  <PanelLeftClose className={`w-4 h-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                  <span className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Collapse Menu</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};


