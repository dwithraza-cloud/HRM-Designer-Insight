import React, { useState } from 'react';
import { 
  CreditCard, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Users, 
  Search,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Building2,
  DollarSign,
  AlertCircle,
  Printer
} from 'lucide-react';
import { PayrollRecord, ViewMode, UserProfile, Employee } from '../types';
import { InsightLogo } from './InsightLogo';

interface PayrollViewProps {
  payrollRecords: PayrollRecord[];
  employees: Employee[];
  currentUser: UserProfile;
  onAddPayrollRecord: (record: PayrollRecord) => void;
  onEditPayrollRecord: (record: PayrollRecord) => void;
  onDeletePayrollRecord: (id: string) => void;
  onNavigate: (view: ViewMode) => void;
  showToast?: (msg: string) => void;
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  payrollRecords,
  employees,
  currentUser,
  onAddPayrollRecord,
  onEditPayrollRecord,
  onDeletePayrollRecord,
  onNavigate,
  showToast
}) => {
  const [selectedMonth, setSelectedMonth] = useState('May 2025');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Modal States
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);

  // Form states for Add / Edit
  const [formEmpId, setFormEmpId] = useState('');
  const [formBaseSalary, setFormBaseSalary] = useState<number>(150000);
  const [formAllowances, setFormAllowances] = useState<number>(22500);
  const [formDeductions, setFormDeductions] = useState<number>(12000);
  const [formStatus, setFormStatus] = useState<'Paid' | 'Processing' | 'On Hold'>('Paid');
  const [formPaymentMethod, setFormPaymentMethod] = useState('Direct Deposit');
  const [formPaymentDate, setFormPaymentDate] = useState('28 May 2025');

  const isAdmin = currentUser.roleType === 'admin';

  const filtered = payrollRecords.filter(p => {
    const matchSearch = p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchDept = departmentFilter === 'All' || p.department === departmentFilter;
    return matchSearch && matchStatus && matchDept;
  });

  const totalDisbursement = payrollRecords.reduce((acc, curr) => acc + (curr.netSalary || 0), 0);
  const totalDeductions = payrollRecords.reduce((acc, curr) => acc + (curr.deductions || 0), 0);
  const totalAllowances = payrollRecords.reduce((acc, curr) => acc + (curr.allowances || 0), 0);

  const handleOpenAddModal = () => {
    if (!isAdmin) {
      if (showToast) showToast('⚠️ Access Denied (403): Only Admins can create payroll records.');
      return;
    }
    const defaultEmp = employees[0] || { empId: 'EMP-0142', name: 'Employee', designation: 'Specialist', department: 'Engineering', baseSalary: 150000 };
    setFormEmpId(defaultEmp.empId);
    const base = defaultEmp.baseSalary || 150000;
    setFormBaseSalary(base);
    setFormAllowances(Math.round(base * 0.15));
    setFormDeductions(Math.round(base * 0.08));
    setFormStatus('Paid');
    setFormPaymentMethod('Direct Deposit');
    setFormPaymentDate('28 May 2025');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (record: PayrollRecord) => {
    if (!isAdmin) {
      if (showToast) showToast('⚠️ Access Denied (403): Only Admins can modify payroll records.');
      return;
    }
    setEditingRecord(record);
    setFormEmpId(record.empId);
    setFormBaseSalary(record.baseSalary);
    setFormAllowances(record.allowances);
    setFormDeductions(record.deductions);
    setFormStatus(record.status);
    setFormPaymentMethod(record.paymentMethod || 'Direct Deposit');
    setFormPaymentDate(record.paymentDate || '28 May 2025');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      if (showToast) showToast('⚠️ Access Denied (403): Unauthorized operation.');
      return;
    }

    const net = Number(formBaseSalary) + Number(formAllowances) - Number(formDeductions);

    if (editingRecord) {
      const updated: PayrollRecord = {
        ...editingRecord,
        baseSalary: Number(formBaseSalary),
        allowances: Number(formAllowances),
        deductions: Number(formDeductions),
        netSalary: net,
        status: formStatus,
        paymentMethod: formPaymentMethod,
        paymentDate: formPaymentDate
      };
      onEditPayrollRecord(updated);
      setEditingRecord(null);
    } else {
      const targetEmp = employees.find(e => e.empId === formEmpId) || {
        name: 'Selected Employee',
        designation: 'Specialist',
        department: 'Operations',
        avatar: undefined
      };

      const newRecord: PayrollRecord = {
        id: `pay-${Date.now()}`,
        empId: formEmpId,
        employeeName: targetEmp.name,
        department: targetEmp.department,
        designation: targetEmp.designation,
        baseSalary: Number(formBaseSalary),
        allowances: Number(formAllowances),
        deductions: Number(formDeductions),
        netSalary: net,
        status: formStatus,
        paymentDate: formPaymentDate,
        month: selectedMonth,
        avatar: targetEmp.avatar,
        paymentMethod: formPaymentMethod
      };
      onAddPayrollRecord(newRecord);
      setShowAddModal(false);
    }
  };

  const handleConfirmDelete = (id: string) => {
    if (!isAdmin) {
      if (showToast) showToast('⚠️ Access Denied (403): Only Admins can delete payroll records.');
      return;
    }
    onDeletePayrollRecord(id);
    setDeletingRecordId(null);
  };

  const handleExportPayrollSheet = () => {
    const csvHeader = 'Employee Name,Emp ID,Department,Designation,Base Salary (PKR),Allowances (PKR),Deductions (PKR),Net Pay (PKR),Status,Payment Method,Pay Date\n';
    const csvRows = payrollRecords.map(r => 
      `"${r.employeeName}","${r.empId}","${r.department}","${r.designation}",${r.baseSalary},${r.allowances},${r.deductions},${r.netSalary},"${r.status}","${r.paymentMethod || 'Direct Deposit'}","${r.paymentDate}"`
    ).join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Payroll_Register_PKR_${selectedMonth.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) showToast(`📥 Exported ${selectedMonth} Payroll Register in PKR format.`);
  };

  const handleRunPayroll = () => {
    if (!isAdmin) {
      if (showToast) showToast('⚠️ Access Denied (403): Only Admins can execute monthly payroll runs.');
      return;
    }
    if (showToast) {
      showToast(`✓ Monthly payroll run executed for ${payrollRecords.length} staff! Total: Rs. ${totalDisbursement.toLocaleString()} PKR`);
    }
  };

  return (
    <div id="payroll-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight font-['Sora']">Payroll & Compensation</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              PKR Currency (Rs.)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage Pakistani Rupee (PKR) salary structures, allowances, tax withholdings, and payslips.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button 
            id="btn-export-payroll"
            onClick={handleExportPayrollSheet}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.09] text-slate-200 border border-white/10 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Export Payroll Sheet</span>
          </button>

          {isAdmin && (
            <>
              <button 
                id="btn-add-payroll-record"
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Record</span>
              </button>

              <button 
                id="btn-run-payroll"
                onClick={handleRunPayroll}
                className="brand-gradient-btn flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer hover:opacity-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>Run Monthly Payroll</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3 Overview Metric Cards in PKR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Net Payroll (PKR)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-['Sora']">
            Rs. {totalDisbursement.toLocaleString()} <span className="text-xs font-normal text-purple-300">PKR</span>
          </p>
          <p className="text-[11px] text-emerald-400 font-medium">{selectedMonth} Disbursement</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Tax & Provident Deductions</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-['Sora']">
            Rs. {totalDeductions.toLocaleString()} <span className="text-xs font-normal text-slate-400">PKR</span>
          </p>
          <p className="text-[11px] text-blue-300 font-medium">Auto-calculated compliant deductions</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Disbursement Status</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-300 font-['Sora']">
            {payrollRecords.filter(p => p.status === 'Paid').length} of {payrollRecords.length} Paid
          </p>
          <p className="text-[11px] text-slate-400">Bank batch clearance verified</p>
        </div>
      </div>

      {/* Salary List Table */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white font-['Sora']">Employee Compensation Register (PKR)</h2>
            <p className="text-xs text-slate-400">Showing all salary allocations and tax breakdowns</p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-[#131b2e] border border-white/10 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
            >
              <option value="All">All Depts</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
              <option value="Operations">Operations</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#131b2e] border border-white/10 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Processing">Processing</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 uppercase text-[11px] font-bold">
                <th className="pb-3">Employee</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Base Salary (Rs.)</th>
                <th className="pb-3">Allowances</th>
                <th className="pb-3">Deductions</th>
                <th className="pb-3">Net Pay (PKR)</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filtered.map((record) => (
                <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {record.avatar ? (
                        <img 
                          src={record.avatar} 
                          alt={record.employeeName} 
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                          {record.avatarInitials || record.employeeName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-white">{record.employeeName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{record.empId} • {record.designation}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-slate-300">{record.department}</td>
                  <td className="py-3 font-mono text-slate-200">Rs. {record.baseSalary.toLocaleString()}</td>
                  <td className="py-3 font-mono text-emerald-400">+Rs. {record.allowances.toLocaleString()}</td>
                  <td className="py-3 font-mono text-rose-400">-Rs. {record.deductions.toLocaleString()}</td>
                  <td className="py-3 font-mono font-bold text-white text-sm">
                    Rs. {record.netSalary.toLocaleString()}
                  </td>
                  <td className="py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      record.status === 'Paid'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : record.status === 'Processing'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedPayslip(record)}
                        title="View Payslip"
                        className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                      >
                        <FileText className="w-3.5 h-3.5 text-purple-400" />
                        <span>Slip</span>
                      </button>

                      {/* Admin RBAC Edit and Delete Actions */}
                      {isAdmin && (
                        <>
                          <button
                            id={`btn-edit-pay-${record.id}`}
                            onClick={() => handleOpenEditModal(record)}
                            title="Edit Compensation Record"
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-pay-${record.id}`}
                            onClick={() => setDeletingRecordId(record.id)}
                            title="Delete Payroll Record"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Payroll Record Modal */}
      {(showAddModal || editingRecord) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 max-w-lg w-full space-y-5 bg-[#131b2e] shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-['Sora']">
                  {editingRecord ? 'Edit Payroll Compensation' : 'Add Payroll Disbursement Record'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adjust base salary, allowances, and statutory tax deductions in PKR (Rs.)
                </p>
              </div>
              <button 
                onClick={() => { setShowAddModal(false); setEditingRecord(null); }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              {!editingRecord ? (
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Select Employee *</label>
                  <select
                    value={formEmpId}
                    onChange={(e) => {
                      setFormEmpId(e.target.value);
                      const sel = employees.find(emp => emp.empId === e.target.value);
                      if (sel && sel.baseSalary) {
                        setFormBaseSalary(sel.baseSalary);
                        setFormAllowances(Math.round(sel.baseSalary * 0.15));
                        setFormDeductions(Math.round(sel.baseSalary * 0.08));
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.empId}>
                        {emp.name} ({emp.empId}) - {emp.designation} [{emp.department}]
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{editingRecord.employeeName}</p>
                    <p className="text-[11px] text-slate-400">{editingRecord.empId} • {editingRecord.designation}</p>
                  </div>
                  <span className="text-xs font-semibold text-purple-300">{editingRecord.department}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Base Salary (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={formBaseSalary}
                    onChange={(e) => setFormBaseSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Allowances (Rs.)</label>
                  <input
                    type="number"
                    value={formAllowances}
                    onChange={(e) => setFormAllowances(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50 font-mono text-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Deductions (Rs.)</label>
                  <input
                    type="number"
                    value={formDeductions}
                    onChange={(e) => setFormDeductions(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50 font-mono text-rose-400"
                  />
                </div>
              </div>

              {/* Real-time Net Pay preview card */}
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-purple-300 block font-medium">Calculated Net Pay</span>
                  <span className="text-xs text-slate-400">Base + Allowances - Deductions</span>
                </div>
                <p className="text-lg font-bold text-white font-mono">
                  Rs. {(Number(formBaseSalary) + Number(formAllowances) - Number(formDeductions)).toLocaleString()} PKR
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Disbursement Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Processing">Processing</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Payment Method</label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="Direct Deposit">Direct Deposit</option>
                    <option value="Bank Wire Transfer">Bank Wire Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Payment Date</label>
                <input
                  type="text"
                  value={formPaymentDate}
                  onChange={(e) => setFormPaymentDate(e.target.value)}
                  placeholder="e.g. 28 May 2025"
                  className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingRecord(null); }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] text-slate-300 hover:bg-white/[0.1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="brand-gradient-btn px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-purple-600/30 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingRecord ? 'Save Changes' : 'Create Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Payroll Confirmation Modal */}
      {deletingRecordId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 max-w-sm w-full space-y-4 bg-[#131b2e] shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-['Sora']">Delete Payroll Record?</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to remove this payroll disbursement entry? This action will adjust total ledger accounts.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
              <button
                onClick={() => setDeletingRecordId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] text-slate-300 hover:bg-white/[0.1]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(deletingRecordId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payslip Modal (Detailed PKR Breakdown) */}
      {selectedPayslip && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 max-w-md w-full space-y-5 bg-[#131b2e] shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <InsightLogo className="w-10 h-10 shrink-0" rounded="rounded-xl" />
                <div>
                  <h3 className="text-base font-bold text-white font-['Sora']">Official Salary Payslip</h3>
                  <p className="text-xs text-orange-400 font-medium">Insight HRM • {selectedMonth}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPayslip(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-sm">{selectedPayslip.employeeName}</p>
                <p className="text-xs text-slate-400">{selectedPayslip.designation} • {selectedPayslip.department}</p>
                <p className="text-[11px] text-purple-400 font-mono mt-0.5">ID: {selectedPayslip.empId}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                selectedPayslip.status === 'Paid'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {selectedPayslip.status}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-300">
                <span>Basic Monthly Salary (60%)</span>
                <span className="font-mono text-white">Rs. {Math.round(selectedPayslip.baseSalary * 0.6).toLocaleString()} PKR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-300">
                <span>House Rent Allowance (25%)</span>
                <span className="font-mono text-white">Rs. {Math.round(selectedPayslip.baseSalary * 0.25).toLocaleString()} PKR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-300">
                <span>Medical & Transport Allowance</span>
                <span className="font-mono text-emerald-400">+Rs. {selectedPayslip.allowances.toLocaleString()} PKR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-300">
                <span>Tax Withholding & PF Deductions</span>
                <span className="font-mono text-rose-400">-Rs. {selectedPayslip.deductions.toLocaleString()} PKR</span>
              </div>
              <div className="flex justify-between py-2 border-t border-purple-500/30 text-sm font-bold text-white bg-purple-500/10 px-3 rounded-xl mt-3">
                <span className="text-purple-300">Net Disbursed Amount:</span>
                <span className="font-mono text-emerald-300 font-extrabold">Rs. {selectedPayslip.netSalary.toLocaleString()} PKR</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
              <span>Disbursed via: {selectedPayslip.paymentMethod || 'Direct Deposit'}</span>
              <span>Date: {selectedPayslip.paymentDate}</span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  if (showToast) showToast(`🖨️ Printing Payslip for ${selectedPayslip.employeeName}...`);
                  setSelectedPayslip(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] text-slate-200 hover:bg-white/[0.1]"
              >
                <Printer className="w-3.5 h-3.5 text-purple-400" />
                <span>Print</span>
              </button>
              <button
                onClick={() => {
                  if (showToast) showToast(`📥 PDF Payslip downloaded for ${selectedPayslip.employeeName}`);
                  setSelectedPayslip(null);
                }}
                className="brand-gradient-btn flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-purple-600/30"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
