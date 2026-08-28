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
  UserCheck
} from 'lucide-react';
import { Employee, ViewMode, UserProfile } from '../types';

interface EmployeeManagementViewProps {
  employees: Employee[];
  currentUser: UserProfile;
  onSelectEmployee: (emp: Employee) => void;
  onNavigate: (view: ViewMode) => void;
  onDeleteEmployee: (id: string) => void;
  onExportEmployees: () => void;
}

export const EmployeeManagementView: React.FC<EmployeeManagementViewProps> = ({
  employees,
  currentUser,
  onSelectEmployee,
  onNavigate,
  onDeleteEmployee,
  onExportEmployees
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

                          {/* Edit: Admin only */}
                          {isAdmin && (
                            <button
                              id={`btn-edit-emp-${emp.id}`}
                              onClick={() => {
                                onSelectEmployee(emp);
                                onNavigate('employee-detail');
                              }}
                              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-blue-500/20 text-slate-400 hover:text-blue-300 transition-colors cursor-pointer"
                              title="Edit Employee"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}

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
    </div>
  );
};

