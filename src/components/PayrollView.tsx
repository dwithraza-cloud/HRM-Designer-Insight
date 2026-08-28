import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Users, 
  Search,
  ChevronRight
} from 'lucide-react';
import { INITIAL_EMPLOYEES } from '../data/initialData';
import { ViewMode } from '../types';

interface PayrollViewProps {
  onNavigate: (view: ViewMode) => void;
}

export const PayrollView: React.FC<PayrollViewProps> = ({ onNavigate }) => {
  const [selectedMonth, setSelectedMonth] = useState('May 2025');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState<any | null>(null);

  const employees = INITIAL_EMPLOYEES;

  const filtered = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.empId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="payroll-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Payroll & Compensation</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Disbursement Processing
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage salary structures, deductions, tax withholdings, and bulk payslip generation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => alert('Monthly payroll summary downloaded.')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.09] text-slate-200 border border-white/10 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Export Payroll Sheet</span>
          </button>
          <button 
            onClick={() => alert('May 2025 payroll run triggered for 1,248 employees.')}
            className="brand-gradient-btn flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Run Monthly Payroll</span>
          </button>
        </div>
      </div>

      {/* 3 Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Net Payroll</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-['Sora']">৳ 28,65,540</p>
          <p className="text-[11px] text-emerald-400 font-medium">May 2025 Disbursement</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Tax & Provident Deductions</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-['Sora']">৳ 3,42,800</p>
          <p className="text-[11px] text-blue-300 font-medium">Auto-calculated compliant deductions</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Disbursement Status</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-300 font-['Sora']">98.4% Ready</p>
          <p className="text-[11px] text-slate-400">Auto bank batch clearance pending</p>
        </div>
      </div>

      {/* Salary List Table */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white">Employee Compensation Register</h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employee or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 uppercase text-[11px] font-bold">
                <th className="pb-3">Employee</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Base Salary</th>
                <th className="pb-3">Allowances</th>
                <th className="pb-3">Net Pay</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filtered.map((emp) => {
                const base = emp.baseSalary || 120000;
                const allowances = Math.round(base * 0.15);
                const deductions = Math.round(base * 0.08);
                const net = base + allowances - deductions;

                return (
                  <tr key={emp.id} className="hover:bg-white/[0.02]">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {emp.avatar ? (
                          <img 
                            src={emp.avatar} 
                            alt={emp.name} 
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 shrink-0" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0">
                            {emp.avatarInitials}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white">{emp.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{emp.empId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-300">{emp.department}</td>
                    <td className="py-3 font-mono font-medium text-slate-200">৳ {base.toLocaleString()}</td>
                    <td className="py-3 font-mono text-emerald-400">+ ৳ {allowances.toLocaleString()}</td>
                    <td className="py-3 font-mono font-bold text-white">৳ {net.toLocaleString()}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300">
                        Paid
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedPayslip({ emp, base, allowances, deductions, net })}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.04] hover:bg-purple-500/20 text-purple-300 border border-white/10 transition-colors"
                      >
                        Payslip
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 max-w-md w-full space-y-5 bg-[#131b2e] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-['Sora']">Salary Payslip</h3>
                <p className="text-xs text-purple-400">May 2025 • Aura HRMS</p>
              </div>
              <button onClick={() => setSelectedPayslip(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-sm">{selectedPayslip.emp.name}</p>
                  <p className="text-slate-400">{selectedPayslip.emp.designation} • {selectedPayslip.emp.empId}</p>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Processed
                </span>
              </div>

              <div className="space-y-2 border-t border-b border-white/5 py-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Basic Salary:</span>
                  <span className="font-mono text-white font-semibold">৳ {selectedPayslip.base.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Housing & Medical Allowance:</span>
                  <span className="font-mono text-emerald-400 font-semibold">+ ৳ {selectedPayslip.allowances.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tax & Provident Fund:</span>
                  <span className="font-mono text-rose-400 font-semibold">- ৳ {selectedPayslip.deductions.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-white">Net Take-Home Pay:</span>
                <span className="text-lg font-extrabold text-purple-300 font-['Sora']">৳ {selectedPayslip.net.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
              <button
                onClick={() => setSelectedPayslip(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] text-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Payslip downloaded for ${selectedPayslip.emp.name}`);
                  setSelectedPayslip(null);
                }}
                className="brand-gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-purple-600/30"
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
