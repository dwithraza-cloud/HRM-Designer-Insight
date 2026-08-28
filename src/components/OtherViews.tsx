import React, { useState } from 'react';
import { 
  Laptop, 
  FolderKanban, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  Plus, 
  Download, 
  FileText, 
  HardDrive, 
  Check, 
  Key, 
  UserCheck, 
  Lock,
  Sparkles
} from 'lucide-react';
import { ViewMode } from '../types';

interface OtherViewsProps {
  view: ViewMode;
  onNavigate: (view: ViewMode) => void;
}

export const OtherViews: React.FC<OtherViewsProps> = ({ view, onNavigate }) => {
  // 1. Asset Management View
  if (view === 'assets') {
    return (
      <div id="assets-view" className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Asset Management</h1>
            <p className="text-xs text-slate-400 mt-0.5">Track hardware, laptops, monitors, accessories, and security licenses assigned to employees.</p>
          </div>
          <button 
            onClick={() => alert('Add Hardware Asset modal opened.')}
            className="brand-gradient-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <span className="text-xs text-slate-400">MacBook Pro M3 Max</span>
            <p className="text-xl font-bold text-white">480 Units</p>
            <p className="text-[11px] text-purple-300">Assigned to Engineering & Design</p>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <span className="text-xs text-slate-400">4K Dell UltraSharp Displays</span>
            <p className="text-xl font-bold text-white">620 Units</p>
            <p className="text-[11px] text-blue-300">Desk workstations equipped</p>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <span className="text-xs text-slate-400">Security YubiKeys</span>
            <p className="text-xl font-bold text-white">1,248 Units</p>
            <p className="text-[11px] text-emerald-400">100% 2FA hardware enforced</p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Document Management View
  if (view === 'documents') {
    return (
      <div id="documents-view" className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Document Management</h1>
            <p className="text-xs text-slate-400 mt-0.5">Centralized repository for HR policies, employee contracts, NDAs, and compliance files.</p>
          </div>
          <button 
            onClick={() => alert('Upload new document dialog opened.')}
            className="brand-gradient-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Employee Handbook 2025.pdf', size: '4.2 MB', updated: '2 days ago', tag: 'Policy' },
            { name: 'Standard NDA Agreement.docx', size: '1.1 MB', updated: '1 week ago', tag: 'Legal' },
            { name: 'Health Insurance Plan.pdf', size: '6.8 MB', updated: 'May 2025', tag: 'Benefits' },
            { name: 'Remote Work Guidelines.pdf', size: '2.4 MB', updated: 'Apr 2025', tag: 'Workplace' },
          ].map((doc, i) => (
            <div key={i} className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3 hover:border-purple-500/30 transition-all">
              <div className="flex items-center justify-between">
                <FileText className="w-8 h-8 text-purple-400" />
                <span className="text-[10px] font-semibold bg-white/5 text-purple-300 px-2 py-0.5 rounded-full">{doc.tag}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-white truncate">{doc.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{doc.size} • {doc.updated}</p>
              </div>
              <button 
                onClick={() => alert(`Downloading ${doc.name}`)}
                className="w-full py-1.5 rounded-lg text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 flex items-center justify-center gap-1 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. Reports & Analytics View
  if (view === 'reports') {
    return (
      <div id="reports-view" className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Reports & HR Analytics</h1>
            <p className="text-xs text-slate-400 mt-0.5">Generate custom enterprise reports on workforce turnover, diversity, payroll costs, and productivity.</p>
          </div>
          <button 
            onClick={() => alert('Custom report query generator launched.')}
            className="brand-gradient-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 cursor-pointer"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <h2 className="text-sm font-bold text-white">Department Headcount Distribution</h2>
            <div className="space-y-3 text-xs">
              {[
                { dept: 'Engineering', count: 520, pct: 41, color: 'bg-purple-500' },
                { dept: 'Design & Product', count: 240, pct: 19, color: 'bg-blue-500' },
                { dept: 'Marketing & Sales', count: 220, pct: 18, color: 'bg-emerald-500' },
                { dept: 'Operations & HR', count: 160, pct: 13, color: 'bg-amber-500' },
                { dept: 'Finance & Legal', count: 108, pct: 9, color: 'bg-rose-500' },
              ].map((d, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">{d.dept}</span>
                    <span className="text-white font-mono font-bold">{d.count} ({d.pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <h2 className="text-sm font-bold text-white">Annual Retention & Turnover</h2>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <span className="text-xs text-slate-400">96.8% Retention Rate</span>
              <p className="text-2xl font-bold text-emerald-400 font-['Sora']">+3.2% Improvement</p>
              <p className="text-xs text-slate-400">Industry leading employee satisfaction and career progression programs.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. Settings & Administration
  return (
    <div id="settings-view" className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {view === 'admin' ? 'System Administration' : 'System Settings'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure enterprise security, authentication policies, role permissions, and company branding.
          </p>
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-purple-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Security & Access Controls
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Enforce Two-Factor Authentication (2FA)</p>
                <p className="text-slate-400 text-[11px]">Require hardware key or authenticator app for all HR admins and employees.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-500 rounded" />
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Automatic Daily Cloud Backup</p>
                <p className="text-slate-400 text-[11px]">Encrypt and sync all workforce attendance and payroll databases.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-500 rounded" />
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Live Geolocation Attendance Verification</p>
                <p className="text-slate-400 text-[11px]">Restrict check-ins to designated company WiFi and office coordinates.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-500 rounded" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex justify-end">
          <button 
            onClick={() => alert('Settings saved successfully.')}
            className="brand-gradient-btn px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-purple-600/30 cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
