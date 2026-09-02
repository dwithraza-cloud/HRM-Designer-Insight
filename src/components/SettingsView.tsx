import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Shield,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Edit3,
  RefreshCw,
  Sparkles,
  Save,
  Check,
  X,
  Building,
  Key,
  Sun,
  Moon,
  Laptop,
  CheckCheck,
  Trash2
} from 'lucide-react';
import { UserProfile, UserRole, Employee, ViewMode, ThemeMode } from '../types';
import { authService, UserAccount } from '../services/authService';

interface SettingsViewProps {
  currentUser: UserProfile;
  employees: Employee[];
  currentTheme?: ThemeMode;
  onToggleTheme?: (theme?: ThemeMode) => void;
  onUpdateCurrentUser: (updatedUser: UserProfile) => void;
  onUpdateEmployeeEmail?: (oldEmail: string, newEmail: string) => void;
  onNavigate: (view: ViewMode) => void;
  showToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  employees,
  currentTheme = currentUser.themePreference || 'dark',
  onToggleTheme,
  onUpdateCurrentUser,
  onUpdateEmployeeEmail,
  onNavigate,
  showToast
}) => {
  const roleType = currentUser.roleType || 'admin';
  const isAdmin = roleType === 'admin';

  // Active Settings Tab
  const [activeTab, setActiveTab] = useState<'my-account' | 'admin-users' | 'security-preferences'>('my-account');

  // Self Email Change State
  const [newEmail, setNewEmail] = useState('');
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Self Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Admin User Credential Management State
  const [accountsList, setAccountsList] = useState<UserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'manager' | 'employee'>('all');
  
  // Admin Editing User Modal State
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [adminEditEmail, setAdminEditEmail] = useState('');
  const [adminEditPassword, setAdminEditPassword] = useState('');
  const [adminEditRole, setAdminEditRole] = useState<UserRole>('employee');
  const [showAdminEditPassword, setShowAdminEditPassword] = useState(false);
  const [adminEditLoading, setAdminEditLoading] = useState(false);
  const [adminEditError, setAdminEditError] = useState<string | null>(null);

  // Load Accounts for Admin
  const refreshAccounts = () => {
    const list = authService.getAvailableAccounts();
    setAccountsList([...list]);
  };

  useEffect(() => {
    refreshAccounts();
  }, []);

  // Handler: Update Self Email
  const handleUpdateSelfEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMessage(null);

    if (!newEmail.trim()) {
      setEmailMessage({ type: 'error', text: 'Please enter a new email address.' });
      return;
    }

    if (newEmail.trim().toLowerCase() === currentUser.email.toLowerCase()) {
      setEmailMessage({ type: 'error', text: 'New email must be different from your current email.' });
      return;
    }

    setEmailLoading(true);

    setTimeout(() => {
      const result = authService.updateSelfCredentials(currentUser.id || currentUser.email, {
        newEmail: newEmail.trim(),
        currentPassword: emailCurrentPassword.trim() || undefined
      });

      setEmailLoading(false);

      if (result.success && result.updatedProfile) {
        onUpdateCurrentUser(result.updatedProfile);
        if (onUpdateEmployeeEmail) {
          onUpdateEmployeeEmail(currentUser.email, newEmail.trim());
        }
        setEmailMessage({ type: 'success', text: 'Your work email address has been updated successfully!' });
        showToast('Work email updated successfully.');
        setNewEmail('');
        setEmailCurrentPassword('');
        refreshAccounts();
      } else {
        setEmailMessage({ type: 'error', text: result.error || 'Failed to update email.' });
      }
    }, 400);
  };

  // Handler: Update Self Password
  const handleUpdateSelfPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword.trim()) {
      setPasswordMessage({ type: 'error', text: 'Please enter your current password.' });
      return;
    }

    if (!newPassword.trim()) {
      setPasswordMessage({ type: 'error', text: 'Please enter a new password.' });
      return;
    }

    if (newPassword.trim().length < 4) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 4 characters long.' });
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match. Please re-check.' });
      return;
    }

    setPasswordLoading(true);

    setTimeout(() => {
      const result = authService.updateSelfCredentials(currentUser.id || currentUser.email, {
        newPassword: newPassword.trim(),
        currentPassword: currentPassword.trim()
      });

      setPasswordLoading(false);

      if (result.success && result.updatedProfile) {
        onUpdateCurrentUser(result.updatedProfile);
        setPasswordMessage({ type: 'success', text: 'Your password has been changed successfully!' });
        showToast('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        refreshAccounts();
      } else {
        setPasswordMessage({ type: 'error', text: result.error || 'Failed to update password.' });
      }
    }, 400);
  };

  // Handler: Open Admin Edit Modal for a specific user
  const handleOpenAdminEdit = (account: UserAccount) => {
    setEditingAccount(account);
    setAdminEditEmail(account.email);
    setAdminEditPassword(account.passwordHash || '');
    setAdminEditRole(account.roleType);
    setAdminEditError(null);
    setShowAdminEditPassword(false);
  };

  // Handler: Generate Random Strong Password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let generated = '';
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAdminEditPassword(generated);
    setShowAdminEditPassword(true);
  };

  // Handler: Save Admin Edit for a User's Credentials
  const handleSaveAdminEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    setAdminEditError(null);

    if (!adminEditEmail.trim()) {
      setAdminEditError('Email address cannot be empty.');
      return;
    }

    if (adminEditPassword && adminEditPassword.trim().length < 4) {
      setAdminEditError('Password must be at least 4 characters long.');
      return;
    }

    setAdminEditLoading(true);

    setTimeout(() => {
      const result = authService.adminUpdateUserCredentials(roleType, editingAccount.id, {
        newEmail: adminEditEmail.trim(),
        newPassword: adminEditPassword.trim() || undefined,
        newRole: adminEditRole
      });

      setAdminEditLoading(false);

      if (result.success && result.updatedAccount) {
        // If the admin edited their own active account, update current user state
        if (editingAccount.id === currentUser.id || editingAccount.email.toLowerCase() === currentUser.email.toLowerCase()) {
          onUpdateCurrentUser(result.updatedAccount.profile);
        }

        if (onUpdateEmployeeEmail) {
          onUpdateEmployeeEmail(editingAccount.email, adminEditEmail.trim());
        }

        showToast(`Credentials updated for ${editingAccount.name || editingAccount.email}`);
        setEditingAccount(null);
        refreshAccounts();
      } else {
        setAdminEditError(result.error || 'Failed to update credentials.');
      }
    }, 350);
  };

  // Handler: Admin Delete User Account Credentials
  const handleDeleteAccountCredentials = async (accountId: string, nameOrEmail: string) => {
    if (!isAdmin) {
      showToast('⚠️ Access Denied (403): Only Admins can remove user credentials.');
      return;
    }

    if (window.confirm(`Are you sure you want to permanently remove credentials for "${nameOrEmail}"? This user will no longer be able to log in.`)) {
      await authService.removeAccountFromDB(accountId);
      showToast(`✓ Removed credentials for ${nameOrEmail}`);
      refreshAccounts();
    }
  };

  // Filtered accounts for Admin table
  const filteredAccounts = accountsList.filter(acc => {
    const matchesSearch =
      (acc.name && acc.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.profile?.department && acc.profile.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || acc.roleType === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <UserCheck className="w-3 h-3" /> Manager
          </span>
        );
      case 'employee':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <User className="w-3 h-3" /> Employee
          </span>
        );
    }
  };

  return (
    <div id="settings-view" className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Account & System Settings</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage your login credentials, password security, and organization account permissions.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 text-xs">
          <button
            id="tab-my-account"
            onClick={() => setActiveTab('my-account')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'my-account'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Security & My Credentials</span>
          </button>

          {isAdmin && (
            <button
              id="tab-admin-users"
              onClick={() => setActiveTab('admin-users')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'admin-users'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Credentials (Admin)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-extrabold text-white">
                {accountsList.length}
              </span>
            </button>
          )}

          <button
            id="tab-security-preferences"
            onClick={() => setActiveTab('security-preferences')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'security-preferences'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Preferences & 2FA</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MY ACCOUNT & CREDENTIALS (ACCESSIBLE TO ADMIN, MANAGER, EMPLOYEE) */}
      {activeTab === 'my-account' && (
        <div className="space-y-6">
          {/* User Profile Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-r from-purple-950/20 via-[#131b2e] to-[#0f172a] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-500/40 shadow-xl"
                  referrerPolicy="no-referrer"
                />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#0f172a] absolute -bottom-1 -right-1" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-white">{currentUser.name}</h2>
                  {getRoleBadge(roleType)}
                </div>
                <p className="text-xs text-purple-300 font-medium mt-0.5">{currentUser.role}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span>Dept: <strong className="text-slate-200">{currentUser.department}</strong></span>
                  <span>•</span>
                  <span>Emp ID: <strong className="text-slate-200">{currentUser.empId}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/5 text-xs text-slate-300">
              <Mail className="w-4 h-4 text-purple-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">Current Work Email</span>
                <span className="font-semibold text-white">{currentUser.email}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form 1: Change Email */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Change Email Address</h3>
                  <p className="text-xs text-slate-400">Update the work email associated with your login account.</p>
                </div>
              </div>

              {emailMessage && (
                <div
                  className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                    emailMessage.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                  }`}
                >
                  {emailMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{emailMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateSelfEmail} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold mb-1.5 block">Current Email Address</label>
                  <div className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400 font-mono">
                    {currentUser.email}
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1.5 block">New Email Address</label>
                  <div className="relative">
                    <input
                      id="input-self-new-email"
                      type="email"
                      required
                      placeholder="e.g. yourname@company.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1.5 block">
                    Confirm With Current Password <span className="text-slate-500 font-normal">(Optional for demo)</span>
                  </label>
                  <input
                    id="input-self-email-password"
                    type="password"
                    placeholder="Enter current password"
                    value={emailCurrentPassword}
                    onChange={(e) => setEmailCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <button
                    id="btn-save-self-email"
                    type="submit"
                    disabled={emailLoading}
                    className="w-full brand-gradient-btn py-2.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    {emailLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Update Email Address</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Form 2: Change Password */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Change Password</h3>
                  <p className="text-xs text-slate-400">Choose a secure password to protect your account.</p>
                </div>
              </div>

              {passwordMessage && (
                <div
                  className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                    passwordMessage.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                  }`}
                >
                  {passwordMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateSelfPassword} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold mb-1.5 block">Current Password</label>
                  <div className="relative">
                    <input
                      id="input-self-curr-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter existing password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1.5 block">New Password</label>
                  <div className="relative">
                    <input
                      id="input-self-new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter new password (min. 4 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1.5 block">Confirm New Password</label>
                  <div className="relative">
                    <input
                      id="input-self-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="btn-save-self-password"
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 py-2.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    {passwordLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Key className="w-4 h-4" />
                    )}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ADMIN ONLY - MANAGE TEAM & EMPLOYEE CREDENTIALS */}
      {activeTab === 'admin-users' && isAdmin && (
        <div className="space-y-6">
          {/* Admin Banner */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-[#131b2e] to-[#0f172a]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-xl shadow-purple-600/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">Employee & Manager Credential Governance</h2>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Admin Access
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    As an Administrator, you can modify email addresses, reset account passwords, and update access roles for any manager or employee in the organization.
                  </p>
                </div>
              </div>

              <button
                onClick={refreshAccounts}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-xs font-semibold text-slate-300 border border-white/10 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                <span>Refresh Directory</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-admin-search-users"
                type="text"
                placeholder="Search by name, email, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/5 text-xs">
              {(['all', 'manager', 'employee', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                    roleFilter === r
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r === 'all' ? 'All Roles' : `${r}s`}
                </button>
              ))}
            </div>
          </div>

          {/* Accounts Table */}
          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-5">User / Member</th>
                    <th className="py-3.5 px-4">Role Permission</th>
                    <th className="py-3.5 px-4">Work Email</th>
                    <th className="py-3.5 px-4">Current Password</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {filteredAccounts.map((acc) => {
                    const isSelf = acc.id === currentUser.id || acc.email.toLowerCase() === currentUser.email.toLowerCase();
                    return (
                      <tr key={acc.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={acc.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(acc.name || acc.email)}`}
                              alt={acc.name || acc.email}
                              className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white">{acc.name || acc.profile?.name || 'Team Member'}</span>
                                {isSelf && (
                                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-semibold">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 block">
                                {acc.profile?.role || acc.profile?.department || 'Staff'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {getRoleBadge(acc.roleType)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono text-slate-200">{acc.email}</span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          <span className="bg-black/30 px-2 py-1 rounded border border-white/5 text-[11px]">
                            {acc.passwordHash || 'password'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              id={`btn-edit-user-${acc.id}`}
                              onClick={() => handleOpenAdminEdit(acc)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-semibold transition-all hover:scale-105 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            {!isSelf && (
                              <button
                                id={`btn-delete-user-${acc.id}`}
                                onClick={() => handleDeleteAccountCredentials(acc.id, acc.name || acc.email)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold transition-all hover:scale-105 cursor-pointer"
                                title="Remove User Credentials"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAccounts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No user accounts found matching &quot;{searchQuery}&quot;.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PREFERENCES & 2FA */}
      {activeTab === 'security-preferences' && (
        <div className="space-y-6">
          {/* Theme & Display Preference Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider text-purple-300 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" /> Interface Theme & Appearance
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  User-Specific Preference
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Choose your preferred visual theme for Insight HRM. Your selection is stored permanently to your account (<strong className="text-slate-200">{currentUser.email}</strong>) and does not affect other users.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Light Theme Card */}
              <div
                id="theme-card-light"
                onClick={() => {
                  if (onToggleTheme) onToggleTheme('light');
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  currentTheme === 'light'
                    ? 'bg-purple-600/10 border-purple-500 ring-2 ring-purple-500/30 shadow-lg'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      currentTheme === 'light' ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' : 'bg-white/[0.05] text-slate-400'
                    }`}>
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        Light Mode
                        {currentTheme === 'light' && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">High-clarity bright canvas for well-lit environments.</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    currentTheme === 'light' ? 'border-purple-500 bg-purple-600 text-white' : 'border-white/20'
                  }`}>
                    {currentTheme === 'light' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                {/* Light Mode Preview Thumbnail */}
                <div className="mt-4 p-3 rounded-xl bg-slate-100 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <div className="h-2 w-16 bg-slate-300 rounded" />
                    <div className="h-2 w-6 bg-purple-500 rounded" />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="h-6 bg-white rounded border border-slate-200" />
                    <div className="h-6 bg-white rounded border border-slate-200" />
                    <div className="h-6 bg-white rounded border border-slate-200" />
                  </div>
                </div>
              </div>

              {/* Dark Theme Card */}
              <div
                id="theme-card-dark"
                onClick={() => {
                  if (onToggleTheme) onToggleTheme('dark');
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  currentTheme === 'dark'
                    ? 'bg-purple-600/10 border-purple-500 ring-2 ring-purple-500/30 shadow-lg'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      currentTheme === 'dark' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/[0.05] text-slate-400'
                    }`}>
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        Dark Mode
                        {currentTheme === 'dark' && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Deep indigo enterprise dark theme with soft contrast.</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    currentTheme === 'dark' ? 'border-purple-500 bg-purple-600 text-white' : 'border-white/20'
                  }`}>
                    {currentTheme === 'dark' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                {/* Dark Mode Preview Thumbnail */}
                <div className="mt-4 p-3 rounded-xl bg-[#0b1326] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                    <div className="h-2 w-16 bg-slate-700 rounded" />
                    <div className="h-2 w-6 bg-purple-500 rounded" />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="h-6 bg-[#131b2e] rounded border border-white/10" />
                    <div className="h-6 bg-[#131b2e] rounded border border-white/10" />
                    <div className="h-6 bg-[#131b2e] rounded border border-white/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security & 2FA Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Security & Session Controls
              </h2>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Enforce Two-Factor Authentication (2FA)</p>
                    <p className="text-slate-400 text-[11px]">Require a secondary verification code for all HR portal logins.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-500 rounded" />
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Email Login Alerts</p>
                    <p className="text-slate-400 text-[11px]">Receive an immediate email notification whenever a new device logs into your account.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-500 rounded" />
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Automatic Daily Cloud Backup</p>
                    <p className="text-slate-400 text-[11px]">Encrypt and sync workforce attendance, payroll, and task databases.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-500 rounded" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                onClick={() => showToast('Preferences updated successfully.')}
                className="brand-gradient-btn px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-purple-600/30 cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN EDIT USER CREDENTIALS MODAL */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-[#131b2e] shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Modify User Credentials</h3>
                  <p className="text-xs text-slate-400">Admin override for {editingAccount.name || editingAccount.email}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingAccount(null)}
                className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {adminEditError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{adminEditError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdminEdit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1.5 block">Employee Name</label>
                <div className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-slate-300 font-semibold">
                  {editingAccount.name || editingAccount.profile?.name || 'Team Member'}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1.5 block">Work Email Address</label>
                <input
                  id="modal-admin-edit-email"
                  type="email"
                  required
                  value={adminEditEmail}
                  onChange={(e) => setAdminEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-semibold">Set New Password</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Strong Password</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="modal-admin-edit-password"
                    type={showAdminEditPassword ? 'text' : 'password'}
                    required
                    value={adminEditPassword}
                    onChange={(e) => setAdminEditPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminEditPassword(!showAdminEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showAdminEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1.5 block">Account Role Permission</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['employee', 'manager', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAdminEditRole(r)}
                      className={`py-2 px-3 rounded-xl border text-center capitalize font-semibold transition-all cursor-pointer ${
                        adminEditRole === r
                          ? 'bg-purple-600/30 border-purple-500 text-white'
                          : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-admin-edit-modal"
                  type="submit"
                  disabled={adminEditLoading}
                  className="brand-gradient-btn px-5 py-2.5 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  {adminEditLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save & Update User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
