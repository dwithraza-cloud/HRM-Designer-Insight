import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  Mail,
  Phone,
  CheckSquare,
  Square,
  Sparkles,
  Shield,
  UserCheck,
  Key,
  KeyRound,
  Lock,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  RefreshCw,
  User
} from 'lucide-react';
import { Employee, ViewMode, UserProfile, UserRole } from '../types';
import { authService, UserAccount } from '../services/authService';

interface EmployeeManagementViewProps {
  employees: Employee[];
  currentUser: UserProfile;
  onSelectEmployee: (emp: Employee) => void;
  onNavigate: (view: ViewMode) => void;
  onDeleteEmployee: (id: string) => void;
  onExportEmployees: () => void;
  onUpdateEmployeeEmail?: (oldEmail: string, newEmail: string) => void;
  onUpdateEmployee?: (updatedEmployee: Employee) => void;
  showToast?: (msg: string) => void;
}

export const EmployeeManagementView: React.FC<EmployeeManagementViewProps> = ({
  employees,
  currentUser,
  onSelectEmployee,
  onNavigate,
  onDeleteEmployee,
  onExportEmployees,
  onUpdateEmployeeEmail,
  onUpdateEmployee,
  showToast
}) => {
  const roleType = currentUser.roleType || 'admin';
  const isManager = roleType === 'manager';
  const isEmployee = roleType === 'employee';
  const isAdmin = roleType === 'admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState(isManager ? currentUser.department || 'Design' : 'All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Admin Credential Modal State
  const [credentialModalEmployee, setCredentialModalEmployee] = useState<Employee | null>(null);
  const [targetAccount, setTargetAccount] = useState<UserAccount | null>(null);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminRoleInput, setAdminRoleInput] = useState<UserRole>('employee');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [credentialError, setCredentialError] = useState<string | null>(null);

  const handleOpenCredentialsModal = (emp: Employee) => {
    const acc = authService.getOrCreateAccountForEmployee(emp);
    setCredentialModalEmployee(emp);
    setTargetAccount(acc);
    setAdminEmailInput(acc.email || emp.email);
    setAdminPasswordInput(acc.passwordHash || 'password');
    setAdminRoleInput(acc.roleType || 'employee');
    setCredentialError(null);
    setShowAdminPassword(false);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let generated = '';
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAdminPasswordInput(generated);
    setShowAdminPassword(true);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentialModalEmployee || !targetAccount) return;
    setCredentialError(null);

    if (!adminEmailInput.trim()) {
      setCredentialError('Email address cannot be empty.');
      return;
    }

    if (adminPasswordInput && adminPasswordInput.trim().length < 4) {
      setCredentialError('Password must be at least 4 characters long.');
      return;
    }

    setSavingCredentials(true);

    setTimeout(() => {
      const result = authService.adminUpdateUserCredentials(roleType, targetAccount.id, {
        newEmail: adminEmailInput.trim(),
        newPassword: adminPasswordInput.trim() || undefined,
        newRole: adminRoleInput
      });

      setSavingCredentials(false);

      if (result.success && result.updatedAccount) {
        if (onUpdateEmployeeEmail) {
          onUpdateEmployeeEmail(credentialModalEmployee.email, adminEmailInput.trim());
        }
        if (showToast) {
          showToast(`Credentials updated for ${credentialModalEmployee.name}`);
        }
        setCredentialModalEmployee(null);
      } else {
        setCredentialError(result.error || 'Failed to update user credentials.');
      }
    }, 350);
  };

  // Role Scoped Employees:
  // Managers can ONLY see employees in their department.
  // Admin & Employee can see all directory members (or filtered).
  const scopedBaseEmployees = isManager
    ? employees.filter(emp => emp.department === currentUser.department)
    : employees;

  // Filtering
  const filtered = scopedBaseEmployees.filter((emp) => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = isManager 
      ? true 
      : (deptFilter === 'All' || emp.department === deptFilter);
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginated.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map(e => e.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div id="employee-management-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isAdmin ? 'Employee Directory' : (isManager ? `${currentUser.department} Team Directory` : 'Company Member Directory')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {filtered.length} {isManager ? 'Team Members' : 'Total'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAdmin 
              ? 'Manage organization members, profiles, roles, and employment credentials.'
              : (isManager 
                  ? `Viewing subordinates and personnel assigned to the ${currentUser.department} department.`
                  : 'Browse company contact information and directory listings.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            id="btn-emp-export"
            onClick={onExportEmployees}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.09] text-slate-200 border border-white/10 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Export Data</span>
          </button>
          
          {/* Add Employee is strictly Admin only */}
          {isAdmin && (
            <button
              id="btn-add-new-employee"
              onClick={() => onNavigate('add-employee')}
              className="flex-1 sm:flex-initial brand-gradient-btn flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center gap-3 justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-employee-search"
            type="text"
            placeholder="Search by name, ID, role, email..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Department Filter (Admin & Employee only) */}
          {!isManager && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden lg:inline">Dept:</span>
              <select
                id="select-dept-filter"
                value={deptFilter}
                onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
                className="bg-[#131b2e] border border-white/10 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500/50"
              >
                <option value="All">All Departments</option>
                <option value="Design">Design</option>
                <option value="Engineering">Engineering</option>
                <option value="HR">HR</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden lg:inline">Status:</span>
            <select
              id="select-status-filter"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-[#131b2e] border border-white/10 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500/50"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {(searchTerm || (!isManager && deptFilter !== 'All') || statusFilter !== 'All') && (
            <button
              onClick={() => { setSearchTerm(''); if (!isManager) setDeptFilter('All'); setStatusFilter('All'); }}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Employees Table Card */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {isAdmin && (
                  <th className="p-4 w-10 text-center">
                    <button 
                      onClick={toggleSelectAll} 
                      className="text-slate-400 hover:text-white"
                      aria-label="Select all employees"
                    >
                      {selectedIds.length === paginated.length && paginated.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                )}
                <th className="p-4">Employee</th>
                <th className="p-4">Designation & Department</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joining Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="p-12 text-center text-slate-400">
                    No employee records match the given criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((emp) => {
                  const isSelected = selectedIds.includes(emp.id);
                  return (
                    <tr 
                      key={emp.id} 
                      className={`hover:bg-white/[0.03] transition-colors ${
                        isSelected ? 'bg-purple-900/10' : ''
                      }`}
                    >
                      {/* Checkbox for Admin */}
                      {isAdmin && (
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => toggleSelectOne(emp.id)} 
                            className="text-slate-400 hover:text-white"
                            aria-label={`Select ${emp.name}`}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-purple-400" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      )}

                      {/* Employee Info */}
                      <td className="p-4">
                        <div 
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => {
                            onSelectEmployee(emp);
                            onNavigate('employee-detail');
                          }}
                        >
                          {emp.avatar ? (
                            <img
                              src={emp.avatar}
                              alt={emp.name}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-purple-400 transition-all shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0">
                              {emp.avatarInitials || (emp.name ? emp.name.substring(0, 2).toUpperCase() : 'EM')}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white group-hover:text-purple-300 transition-colors">
                              {emp.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{emp.empId}</p>
                          </div>
                        </div>
                      </td>

                      {/* Designation & Dept */}
                      <td className="p-4">
                        <p className="font-semibold text-slate-200">{emp.designation}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/[0.05] text-purple-300 border border-white/10">
                          {emp.department}
                        </span>
                      </td>

                      {/* Contact Info */}
                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[160px]">{emp.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{emp.phone}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          emp.status === 'Active'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : emp.status === 'On Leave'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            emp.status === 'Active' ? 'bg-emerald-400' : emp.status === 'On Leave' ? 'bg-amber-400' : 'bg-slate-400'
                          }`} />
                          {emp.status}
                        </span>
                      </td>

                      {/* Joining Date */}
                      <td className="p-4 text-slate-400 font-medium">
                        {emp.joiningDate}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-view-emp-${emp.id}`}
                            onClick={() => {
                              onSelectEmployee(emp);
                              onNavigate('employee-detail');
                            }}
                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-purple-500/20 text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Admin: Update Email / Reset Password interface directly in Employee list */}
                          {isAdmin && (
                            <button
                              id={`btn-credentials-emp-${emp.id}`}
                              onClick={() => handleOpenCredentialsModal(emp)}
                              className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/25 text-purple-300 hover:text-white transition-colors cursor-pointer border border-purple-500/20"
                              title="Update Email & Reset Password"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Edit Profile: Accessible to edit employee profile */}
                          <button
                            id={`btn-edit-emp-${emp.id}`}
                            onClick={() => {
                              onSelectEmployee(emp);
                              onNavigate('employee-detail');
                            }}
                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-blue-500/20 text-slate-400 hover:text-blue-300 transition-colors cursor-pointer"
                            title="Edit Profile & Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete: strictly Admin only */}
                          {isAdmin && (
                            <button
                              id={`btn-delete-emp-${emp.id}`}
                              onClick={() => onDeleteEmployee(emp.id)}
                              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                              title="Delete Employee"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-semibold text-white">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="font-semibold text-white">{filtered.length}</span> employees
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none text-slate-300 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-8 h-8 rounded-xl font-semibold transition-all ${
                  currentPage === idx + 1
                    ? 'bg-[#a078ff] text-white shadow-md shadow-purple-600/30'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400'
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none text-slate-300 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Credential Management Modal */}
      {credentialModalEmployee && targetAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            id="modal-admin-credentials"
            className="w-full max-w-lg glass-panel rounded-3xl border border-purple-500/30 p-6 sm:p-7 shadow-2xl relative bg-[#10172b] text-white space-y-5"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Update Employee Credentials</h3>
                  <p className="text-xs text-slate-400">Admin security control for account credentials</p>
                </div>
              </div>

              <button
                id="btn-close-credentials-modal"
                onClick={() => setCredentialModalEmployee(null)}
                className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Employee Overview Card */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3.5">
              {credentialModalEmployee.avatar ? (
                <img
                  src={credentialModalEmployee.avatar}
                  alt={credentialModalEmployee.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500/30 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-purple-600/30 text-purple-200 font-bold flex items-center justify-center shrink-0 text-sm">
                  {credentialModalEmployee.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white truncate">{credentialModalEmployee.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                    {targetAccount.roleType}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">{credentialModalEmployee.designation} • {credentialModalEmployee.department}</p>
                <p className="text-[11px] font-mono text-purple-400 mt-0.5">{credentialModalEmployee.empId}</p>
              </div>
            </div>

            {/* Error Message */}
            {credentialError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{credentialError}</span>
              </div>
            )}

            {/* Credential Edit Form */}
            <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                  <span>Work Email Address</span>
                  <span className="text-[11px] text-slate-500 font-normal">Used for login</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-admin-emp-email"
                    type="email"
                    required
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-semibold">Reset Password</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Strong Password</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-admin-emp-password"
                    type={showAdminPassword ? 'text' : 'password'}
                    placeholder="Enter new password (min 4 characters)"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1.5 block">Access Permission Role</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdminRoleInput('employee')}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                      adminRoleInput === 'employee'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 shadow-sm'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05]'
                    }`}
                  >
                    Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminRoleInput('manager')}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                      adminRoleInput === 'manager'
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-200 shadow-sm'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05]'
                    }`}
                  >
                    Manager
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminRoleInput('admin')}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                      adminRoleInput === 'admin'
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-200 shadow-sm'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05]'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCredentialModalEmployee(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCredentials}
                  id="btn-save-emp-credentials"
                  className="brand-gradient-btn px-5 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer disabled:opacity-50"
                >
                  {savingCredentials ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save & Apply Credentials</span>
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

