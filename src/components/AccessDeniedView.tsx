import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { UserProfile, ViewMode } from '../types';

interface AccessDeniedViewProps {
  currentUser: UserProfile;
  requiredRole: 'admin' | 'manager' | 'admin-or-manager';
  attemptedView: ViewMode;
  onNavigate: (view: ViewMode) => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  currentUser,
  requiredRole,
  attemptedView,
  onNavigate
}) => {
  const getRequiredRoleLabel = () => {
    switch (requiredRole) {
      case 'admin':
        return 'System Administrator (HR Admin)';
      case 'manager':
        return 'Department Manager';
      case 'admin-or-manager':
        return 'Department Manager or Administrator';
      default:
        return 'Elevated Role';
    }
  };

  const getViewTitle = () => {
    switch (attemptedView) {
      case 'payroll':
        return 'Payroll & Financial Compensation';
      case 'settings':
      case 'admin':
        return 'System Settings & Organization Security';
      case 'add-employee':
        return 'Employee Registration & Account Creation';
      case 'recruitment':
        return 'Recruitment & Job Publishing';
      case 'reports':
        return 'Executive Reports & Analytics';
      default:
        return String(attemptedView).toUpperCase();
    }
  };

  return (
    <div id="access-denied-container" className="min-h-[75vh] flex items-center justify-center p-4 max-w-2xl mx-auto">
      <div className="glass-panel w-full p-8 sm:p-10 rounded-3xl border border-rose-500/20 bg-gradient-to-b from-[#19152b]/95 via-[#131b2e]/95 to-[#0f172a]/95 text-center relative overflow-hidden shadow-2xl space-y-6">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-900/30">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <Lock className="w-3.5 h-3.5" />
            <span>403 FORBIDDEN • PERMISSION DENIED</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Sora']">
            Access Restricted
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Your account does not have permission to access <span className="text-white font-semibold">{getViewTitle()}</span>. Access is permanently enforced by your database role.
          </p>
        </div>

        {/* Access Matrix Card */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-left text-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-slate-400">Your Authenticated Role:</span>
            <span className="font-bold text-white uppercase bg-white/10 px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <User className="w-3 h-3 text-purple-400" />
              {currentUser.roleType} ({currentUser.name})
            </span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-slate-400">Required Role:</span>
            <span className="font-bold text-rose-300 bg-rose-500/15 border border-rose-500/20 px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-rose-400" />
              {getRequiredRoleLabel()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Assigned Department:</span>
            <span className="text-slate-300 font-medium">{currentUser.department || 'General'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            id="btn-access-denied-dashboard"
            onClick={() => onNavigate('dashboard')}
            className="brand-gradient-btn w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
          <button
            onClick={() => onNavigate('tasks')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>My Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
