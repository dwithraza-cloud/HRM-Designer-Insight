import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Upload, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  Check, 
  Sparkles,
  Camera
} from 'lucide-react';
import { Employee, ViewMode } from '../types';

interface AddEmployeeViewProps {
  onBack: () => void;
  onSaveEmployee: (newEmp: Employee) => void;
}

export const AddEmployeeView: React.FC<AddEmployeeViewProps> = ({
  onBack,
  onSaveEmployee
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '1995-05-15',
    gender: 'Male',
    email: '',
    phone: '',
    address: '',
    empId: `EMP-0${Math.floor(100 + Math.random() * 900)}`,
    joiningDate: '2025-05-01',
    department: 'Design',
    designation: '',
    reportingManager: 'Sarah Jenkins',
    baseSalary: 120000,
    avatarUrl: ''
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert('Please fill out the required employee details.');
      return;
    }

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      empId: formData.empId,
      name: `${formData.firstName} ${formData.lastName}`,
      designation: formData.designation || 'Specialist',
      department: formData.department as any,
      email: formData.email,
      phone: formData.phone || '+880 1700-000000',
      status: 'Active',
      joiningDate: new Date(formData.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      avatar: avatarPreview || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQndi0Q67LuyTUAs8C_7ptSSpWoFH67QhVbLxfJfqqymbTF0-ImTvZteCBSvRhku41rEwtRkkZ2yuI6nQmZb0BfCOfoZGNID_PEOn4VWAWuKVpWR7Ik8bXButYDHroiVhejf7BUJNlr5RCQjELnvfecxNjb3pdO-wFiNm8ZRyrk3KjzJktBW6t2HdB8uvLEdFXWKFvdGX3obC3EyYo3QUO3PVDq-c-ap2YZgHP_1pncDG6fIUYwwl',
      gender: formData.gender,
      dob: formData.dob,
      address: formData.address,
      reportingManager: formData.reportingManager,
      baseSalary: Number(formData.baseSalary)
    };

    onSaveEmployee(newEmp);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="add-employee-view" className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button 
            onClick={onBack}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Employee Management</span>
          </button>
          <span>/</span>
          <span className="text-purple-300 font-semibold">New Employee Registration</span>
        </div>

        <button
          onClick={onBack}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10"
        >
          Cancel
        </button>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-['Sora']">
            Add New Employee
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fill in personal, contact, and employment information to create a new team profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Personal Details */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-purple-300">
              <User className="w-4 h-4" /> 1. Personal Details
            </h2>

            {/* Avatar Upload Dropzone */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
              <div className="relative w-20 h-20 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <label className="inline-block px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 cursor-pointer transition-colors">
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Allowed formats: PNG, JPG, WEBP (Max 3MB).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayon"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ahmed"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Details */}
          <div className="space-y-4 border-t border-white/5 pt-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-blue-300">
              <Mail className="w-4 h-4" /> 2. Contact Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Work Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@aurahrms.io"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Phone Number</label>
                <input
                  type="text"
                  placeholder="+880 1712-345678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Residential Address</label>
                <input
                  type="text"
                  placeholder="e.g. House 42, Road 11, Banani, Dhaka"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Employment Information */}
          <div className="space-y-4 border-t border-white/5 pt-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-emerald-300">
              <Briefcase className="w-4 h-4" /> 3. Employment Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Employee ID</label>
                <input
                  type="text"
                  value={formData.empId}
                  onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs font-mono text-purple-300 font-bold focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Joining Date</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="Design">Design</option>
                  <option value="Engineering">Engineering</option>
                  <option value="HR">HR</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Reporting Manager</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.reportingManager}
                  onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Base Monthly Salary (Rs. / PKR)</label>
                <input
                  type="number"
                  placeholder="120000"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/5">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 border border-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-save-new-employee"
              className="brand-gradient-btn px-6 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save & Register Employee</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
