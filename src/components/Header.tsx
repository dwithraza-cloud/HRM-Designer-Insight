import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  Shield, 
  CheckCheck,
  ChevronDown
} from 'lucide-react';
import { UserProfile, NotificationItem, ViewMode } from '../types';

interface HeaderProps {
  currentUser: UserProfile;
  notifications: NotificationItem[];
  onOpenReportModal: () => void;
  onOpenNotifications: () => void;
  onNavigate: (view: ViewMode) => void;
  onOpenSearch: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  notifications,
  onOpenReportModal,
  onNavigate,
  onOpenSearch,
  onSignOut
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header id="main-header" className="h-16 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input trigger */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          id="btn-global-search"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 text-slate-400 text-sm transition-all text-left group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
            <span className="text-slate-400 group-hover:text-slate-200">Search employees, modules, records...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-black/40 border border-white/10 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3.5">
        {/* Download Report button */}
        <button
          id="btn-header-download-report"
          onClick={onOpenReportModal}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.09] text-slate-200 border border-white/10 transition-all hover:border-purple-500/40"
        >
          <Download className="w-3.5 h-3.5 text-purple-400" />
          <span>Download Report</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="btn-header-notifications"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 relative transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-[#0f172a]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#131b2e] border border-white/10 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-2 py-1.5 mb-1.5 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Notifications</span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full font-semibold">{unreadCount} New</span>
                </div>
                <button className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium">
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-2.5 rounded-xl text-xs transition-colors ${n.read ? 'bg-transparent text-slate-400' : 'bg-white/[0.04] text-slate-200 border border-white/5'}`}>
                    <p className="font-semibold text-white mb-0.5">{n.title}</p>
                    <p className="text-[11px] text-slate-400 leading-snug">{n.message}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button
          id="btn-header-settings"
          onClick={() => onNavigate('settings')}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 transition-all"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            id="btn-header-profile-menu"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-3 p-1.5 pl-2 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all"
          >
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-500/40"
                referrerPolicy="no-referrer"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0f172a] absolute bottom-0 right-0" />
            </div>
            <div className="hidden md:block text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white leading-tight">{currentUser.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-[11px] text-purple-300 font-medium leading-none mt-0.5">{currentUser.role}</p>
            </div>
          </button>

          {/* User Menu Dropdown */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#131b2e] border border-white/10 shadow-2xl p-2 z-50">
              <div className="px-3 py-2.5 border-b border-white/5 mb-1">
                <p className="text-xs font-bold text-white">{currentUser.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                  Admin Access
                </span>
              </div>
              <button
                id="menu-item-view-profile"
                onClick={() => {
                  setShowUserDropdown(false);
                  onNavigate('employee-detail');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/[0.05] rounded-xl transition-all"
              >
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>My Profile (Ayon Ahmed)</span>
              </button>
              <button
                id="menu-item-admin-settings"
                onClick={() => {
                  setShowUserDropdown(false);
                  onNavigate('admin');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/[0.05] rounded-xl transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Security & Admin</span>
              </button>
              <div className="my-1 border-t border-white/5" />
              <button
                id="menu-item-signout"
                onClick={() => {
                  setShowUserDropdown(false);
                  onSignOut();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
