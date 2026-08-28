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
  HeadphonesIcon
} from 'lucide-react';
import { ViewMode } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenSupport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onNavigate,
  onOpenSupport 
}) => {
  const menuItems: { id: ViewMode; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employee Management', icon: Users },
    { id: 'recruitment', label: 'Recruitment', icon: Briefcase, badge: '24' },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave', label: 'Leave Management', icon: CalendarDays, badge: '3' },
    { id: 'payroll', label: 'Payroll', icon: CreditCard },
    { id: 'performance', label: 'Performance', icon: Award },
    { id: 'tasks', label: 'Task Management', icon: CheckSquare },
    { id: 'assets', label: 'Asset Management', icon: Laptop },
    { id: 'documents', label: 'Document Management', icon: FolderKanban },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside id="main-sidebar" className="w-64 bg-[#0f172a]/95 border-r border-white/5 flex flex-col h-screen shrink-0 select-none overflow-y-auto">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-white/5 cursor-pointer" onClick={() => onNavigate('dashboard')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7b42f6] to-[#a078ff] flex items-center justify-center shadow-lg shadow-purple-600/30 ring-1 ring-white/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg text-white tracking-tight">Aura HR</span>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">Pro</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Smart HRMS System</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="p-3 flex-1 space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>
        {menuItems.map((item) => {
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
            className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#a078ff]/20 hover:bg-[#a078ff]/30 text-purple-200 border border-[#a078ff]/40 flex items-center justify-center gap-1.5 transition-all"
          >
            <HeadphonesIcon className="w-3.5 h-3.5" />
            Contact Support
          </button>
        </div>

        {/* System Admin */}
        <button
          id="btn-sidebar-admin"
          onClick={() => onNavigate('admin')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>System Administration</span>
        </button>
      </div>
    </aside>
  );
};
