import React, { useState } from 'react';
import { 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  HeadphonesIcon, 
  Send, 
  Search, 
  User, 
  Briefcase, 
  Clock, 
  CreditCard, 
  Award,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { LeaveRequest, Employee, ViewMode } from '../types';

// 1. Apply for Leave Modal
interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leave: LeaveRequest) => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [leaveType, setLeaveType] = useState<'Casual Leave' | 'Sick Leave' | 'Annual Leave' | 'Maternity Leave'>('Casual Leave');
  const [startDate, setStartDate] = useState('2025-05-18');
  const [endDate, setEndDate] = useState('2025-05-20');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newReq: LeaveRequest = {
      id: `lev-${Date.now()}`,
      employeeName: 'Ayon Ahmed',
      department: 'Design',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQndi0Q67LuyTUAs8C_7ptSSpWoFH67QhVbLxfJfqqymbTF0-ImTvZteCBSvRhku41rEwtRkkZ2yuI6nQmZb0BfCOfoZGNID_PEOn4VWAWuKVpWR7Ik8bXButYDHroiVhejf7BUJNlr5RCQjELnvfecxNjb3pdO-wFiNm8ZRyrk3KjzJktBW6t2HdB8uvLEdFXWKFvdGX3obC3EyYo3QUO3PVDq-c-ap2YZgHP_1pncDG6fIUYwwl',
      leaveType,
      duration: `${days} Day${days > 1 ? 's' : ''}`,
      startDate: new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      endDate: new Date(endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      daysCount: days,
      reason: reason || 'Personal urgent matters',
      status: 'Pending',
      appliedDate: 'Today'
    };

    onSubmit(newReq);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 max-w-md w-full space-y-5 bg-[#131b2e] shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-base font-bold text-white font-['Sora']">Apply for Leave</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1.5 font-medium">Leave Category</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="Casual Leave">Casual Leave (CL) - 12 Days Remaining</option>
              <option value="Sick Leave">Sick Leave (SL) - 8 Days Remaining</option>
              <option value="Annual Leave">Annual Vacation (AL) - 15 Days Remaining</option>
              <option value="Maternity Leave">Maternity / Paternity Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1.5 font-medium">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1.5 font-medium">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1.5 font-medium">Reason for Absence</label>
            <textarea
              rows={3}
              required
              placeholder="Provide context for manager approval..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] text-slate-300 hover:bg-white/[0.1]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="brand-gradient-btn px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-purple-600/30 cursor-pointer"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Download Report Modal
interface DownloadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadReportModal: React.FC<DownloadReportModalProps> = ({
  isOpen,
  onClose
}) => {
  const [reportType, setReportType] = useState('executive');

  if (!isOpen) return null;

  const handleDownload = () => {
    alert(`Generating and downloading ${reportType.toUpperCase()} HR Report for May 2025.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 max-w-md w-full space-y-5 bg-[#131b2e] shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-base font-bold text-white font-['Sora']">Export HR & Workforce Report</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-3 text-xs">
          {[
            { id: 'executive', title: 'Executive Workforce Summary (PDF)', desc: 'Key KPIs, attendance trends, headcount growth, and payroll totals.', icon: FileText },
            { id: 'payroll', title: 'Detailed Payroll & Compensation (Excel)', desc: 'Employee-by-employee itemized breakdown with tax deductions.', icon: FileSpreadsheet },
            { id: 'attendance', title: 'Monthly Attendance & Punch Log (CSV)', desc: 'Raw timestamped check-in logs for time & attendance auditing.', icon: Download }
          ].map((opt) => {
            const Icon = opt.icon;
            const isSelected = reportType === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setReportType(opt.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  isSelected ? 'bg-purple-500/15 border-purple-500/40' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                }`}
              >
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 mt-0.5 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">{opt.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] text-slate-300">
            Cancel
          </button>
          <button
            onClick={handleDownload}
            className="brand-gradient-btn px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-purple-600/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate & Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Support Live Assistant Modal
interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello Ayon! I am your Aura HR Assistant. How can I help you today with payroll, attendance, or policy questions?' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setMessages(prev => [...prev, { from: 'user', text: userText }]);
    setInputMsg('');

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { 
          from: 'bot', 
          text: `Thank you! I have logged your inquiry regarding "${userText}". Our HR Operations lead has been notified.` 
        }
      ]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-panel p-6 rounded-3xl border border-white/10 max-w-md w-full space-y-4 bg-[#131b2e] shadow-2xl flex flex-col h-[500px]">
        {/* Support Rep Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZJQuMLWsuKBKmyvnIxfZKY45-SUjoXmLS1yXS98XYHLoEbsxJ_7F4RMkDMRDrQn6Kd5mUz0Uqjwh5f28atr_ooRqS9qRft2fInwFlov2q3_luFyHTdjsOlQMeVCJ65wo5G9f-sHrNLEjqiUcGzIceU95nZ_DyeGjoCIREGM9Bxz9HueMw7W-dWK6T_v_ME3F-RPmfOHbxaIkn6SO2jKhGiRtTOlXKnvxDdtpntRSfDo7MoSD3p8uz"
              alt="Support"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-400"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="text-xs font-bold text-white">Aura HR Enterprise Support</p>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online (24/7)
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${
                m.from === 'user' 
                  ? 'bg-purple-600 text-white rounded-br-none' 
                  : 'bg-white/[0.05] text-slate-200 border border-white/5 rounded-bl-none'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex items-center gap-2 pt-2 border-t border-white/5 shrink-0">
          <input
            type="text"
            placeholder="Type your question..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            className="flex-1 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
          />
          <button
            type="submit"
            className="brand-gradient-btn p-2 rounded-xl text-white shadow-md cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

// 4. Global Omnibox Command Search
interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onNavigate: (view: ViewMode) => void;
  onSelectEmployee: (emp: Employee) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  employees,
  onNavigate,
  onSelectEmployee
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(query.toLowerCase()) ||
    e.designation.toLowerCase().includes(query.toLowerCase()) ||
    e.department.toLowerCase().includes(query.toLowerCase())
  );

  const modules: { name: string; view: ViewMode; icon: React.ElementType }[] = [
    { name: 'Dashboard Overview', view: 'dashboard', icon: Sparkles },
    { name: 'Employee Directory', view: 'employees', icon: User },
    { name: 'Recruitment & Openings', view: 'recruitment', icon: Briefcase },
    { name: 'Attendance Punch Logs', view: 'attendance', icon: Clock },
    { name: 'Leave Management', view: 'leave', icon: Calendar },
    { name: 'Payroll & Compensation', view: 'payroll', icon: CreditCard },
    { name: 'Performance & 360 Reviews', view: 'performance', icon: Award },
  ];

  const filteredModules = modules.filter(m => 
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-start justify-center z-50 p-4 pt-20">
      <div className="glass-panel p-4 rounded-3xl border border-white/10 max-w-xl w-full space-y-4 bg-[#131b2e] shadow-2xl animate-in fade-in zoom-in-95">
        <div className="relative">
          <Search className="w-5 h-5 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            autoFocus
            type="text"
            placeholder="Type to search employees, navigation, or modules..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/[0.05] border border-white/10 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div className="max-h-80 overflow-y-auto space-y-3 text-xs">
          {/* Quick Modules */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase px-2 mb-1.5">Modules</p>
            <div className="space-y-1">
              {filteredModules.map((m, idx) => {
                const Icon = m.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => { onNavigate(m.view); onClose(); }}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.05] text-left text-slate-200 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-purple-400" />
                    <span>{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Employees */}
          {filteredEmployees.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase px-2 mb-1.5">Employees</p>
              <div className="space-y-1">
                {filteredEmployees.map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => {
                      onSelectEmployee(emp);
                      onNavigate('employee-detail');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.05] text-left text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={emp.avatar} alt={emp.name} className="w-6 h-6 rounded-full object-cover ring-1 ring-white/10" referrerPolicy="no-referrer" />
                      <span className="font-semibold text-white">{emp.name}</span>
                      <span className="text-[11px] text-slate-400">({emp.designation})</span>
                    </div>
                    <span className="font-mono text-[10px] text-purple-300">{emp.empId}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 px-2">
          <span>Press <kbd className="px-1 py-0.5 bg-black/40 rounded border border-white/10 text-slate-400">ESC</kbd> to exit</span>
          <button onClick={onClose} className="text-purple-400 hover:text-purple-300 font-medium">Close</button>
        </div>
      </div>
    </div>
  );
};
