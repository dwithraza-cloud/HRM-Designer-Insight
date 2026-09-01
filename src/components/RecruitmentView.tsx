import React, { useState } from 'react';
import { 
  Briefcase, 
  UserPlus, 
  Users, 
  Clock, 
  Plus, 
  Search, 
  MapPin, 
  ChevronRight, 
  TrendingUp, 
  CheckCircle2, 
  Filter,
  Eye,
  Edit2,
  Trash2,
  X,
  Check,
  Building2,
  DollarSign,
  Calendar,
  AlertCircle,
  FileText,
  Mail,
  Phone
} from 'lucide-react';
import { JobOpening, ViewMode, UserProfile } from '../types';

interface RecruitmentViewProps {
  jobOpenings: JobOpening[];
  currentUser: UserProfile;
  onAddJob: (job: JobOpening) => void;
  onEditJob: (job: JobOpening) => void;
  onDeleteJob: (id: string) => void;
  onNavigate: (view: ViewMode) => void;
  showToast?: (msg: string) => void;
}

export const RecruitmentView: React.FC<RecruitmentViewProps> = ({
  jobOpenings,
  currentUser,
  onAddJob,
  onEditJob,
  onDeleteJob,
  onNavigate,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [selectedJobForCandidates, setSelectedJobForCandidates] = useState<JobOpening | null>(null);

  // Form State for Add / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formDept, setFormDept] = useState<'Design' | 'Engineering' | 'Marketing' | 'HR' | 'Sales' | 'Finance' | 'Operations' | 'Support'>('Engineering');
  const [formType, setFormType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid'>('Full-time');
  const [formLoc, setFormLoc] = useState('Lahore, PK (Hybrid)');
  const [formSalary, setFormSalary] = useState('Rs. 200,000 – 300,000 PKR / mo');
  const [formExp, setFormExp] = useState('3+ Years');
  const [formStatus, setFormStatus] = useState<'Active' | 'Draft' | 'Closed'>('Active');
  const [formDesc, setFormDesc] = useState('');
  const [formReqs, setFormReqs] = useState('');

  const canManageRecruitment = currentUser.roleType === 'admin' || currentUser.roleType === 'manager';

  const filteredJobs = jobOpenings.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = departmentFilter === 'All' || j.department === departmentFilter;
    const matchStatus = statusFilter === 'All' || j.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const handleOpenAddModal = () => {
    if (!canManageRecruitment) {
      if (showToast) showToast('⚠️ Access Denied (403): Only Admins and Managers can create job openings.');
      return;
    }
    setFormTitle('');
    setFormDept('Engineering');
    setFormType('Full-time');
    setFormLoc('Lahore, PK (Hybrid)');
    setFormSalary('Rs. 200,000 – 300,000 PKR / mo');
    setFormExp('3+ Years');
    setFormStatus('Active');
    setFormDesc('');
    setFormReqs('');
    setShowNewJobModal(true);
  };

  const handleOpenEditModal = (job: JobOpening) => {
    if (!canManageRecruitment) {
      if (showToast) showToast('⚠️ Access Denied (403): Only Admins and Managers can edit job openings.');
      return;
    }
    setEditingJob(job);
    setFormTitle(job.title);
    setFormDept((job.department as any) || 'Engineering');
    setFormType(job.type || 'Full-time');
    setFormLoc(job.location || 'Lahore, PK');
    setFormSalary(job.salaryRange || 'Rs. 200,000 – 300,000 PKR / mo');
    setFormExp(job.experience || '3+ Years');
    setFormStatus(job.status || 'Active');
    setFormDesc(job.description || '');
    setFormReqs(job.requirements ? job.requirements.join('\n') : '');
  };

  const handleSaveJobForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageRecruitment) {
      if (showToast) showToast('⚠️ Access Denied (403): Unauthorized operation.');
      return;
    }
    if (!formTitle.trim()) {
      if (showToast) showToast('Please provide a valid job title.');
      return;
    }

    const reqsList = formReqs.split('\n').map(r => r.trim()).filter(Boolean);

    if (editingJob) {
      // Update
      const updated: JobOpening = {
        ...editingJob,
        title: formTitle.trim(),
        department: formDept,
        type: formType,
        location: formLoc.trim(),
        salaryRange: formSalary.trim(),
        experience: formExp.trim(),
        status: formStatus,
        description: formDesc.trim() || 'Role responsibilities and expectations.',
        requirements: reqsList.length > 0 ? reqsList : ['Relevant industry background', 'Strong communication skills']
      };
      onEditJob(updated);
      setEditingJob(null);
    } else {
      // Create new
      const newJob: JobOpening = {
        id: `job-${Date.now()}`,
        title: formTitle.trim(),
        department: formDept,
        location: formLoc.trim(),
        type: formType,
        applicantsCount: 0,
        status: formStatus,
        icon: 'Briefcase',
        postedDate: 'Just now',
        salaryRange: formSalary.trim(),
        experience: formExp.trim(),
        description: formDesc.trim() || 'Exciting opportunity to join our rapidly scaling team.',
        requirements: reqsList.length > 0 ? reqsList : ['Demonstrated domain competence', 'Collaborative team mindset']
      };
      onAddJob(newJob);
      setShowNewJobModal(false);
    }
  };

  const handleConfirmDelete = (id: string) => {
    if (!canManageRecruitment) {
      if (showToast) showToast('⚠️ Access Denied (403): Only Admins and Managers can delete job openings.');
      return;
    }
    onDeleteJob(id);
    setDeletingJobId(null);
  };

  return (
    <div id="recruitment-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight font-['Sora']">Recruitment & Job Openings</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {jobOpenings.filter(j => j.status === 'Active').length} Active Positions
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage open talent searches, compensation budgets (PKR), interview pipelines, and candidates.
          </p>
        </div>

        {canManageRecruitment && (
          <button
            id="btn-post-new-job"
            onClick={handleOpenAddModal}
            className="brand-gradient-btn flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer hover:opacity-95"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Job</span>
          </button>
        )}
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Openings</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-['Sora']">{jobOpenings.length}</p>
          <p className="text-[11px] text-purple-400 font-medium">{jobOpenings.filter(j => j.status === 'Active').length} currently active</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Active Candidates</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-['Sora']">
            {jobOpenings.reduce((acc, curr) => acc + (curr.applicantsCount || 0), 0) || 180}
          </p>
          <p className="text-[11px] text-emerald-400">+18 applicants this week</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Interviews Scheduled</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-['Sora']">32</p>
          <p className="text-[11px] text-amber-300 font-medium">Next: Lead Architect at 3:00 PM</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Hiring Velocity</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-['Sora']">18 <span className="text-xs font-normal text-slate-400">Days</span></p>
          <p className="text-[11px] text-emerald-400">4 days faster than regional average</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search openings by title, department, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-xl border border-white/5">
            <span className="text-[11px] text-slate-400 px-2 font-medium">Dept:</span>
            {['All', 'Engineering', 'Design', 'Marketing', 'HR'].map((dept) => (
              <button
                key={dept}
                onClick={() => setDepartmentFilter(dept)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  departmentFilter === dept
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-xl border border-white/5">
            <span className="text-[11px] text-slate-400 px-2 font-medium">Status:</span>
            {['All', 'Active', 'Draft', 'Closed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Job Openings List */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white font-['Sora']">Job Positions Directory</h2>
          <span className="text-xs text-slate-400 font-medium">Showing {filteredJobs.length} of {jobOpenings.length} records</span>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No job openings match the selected filters.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredJobs.map((job) => (
              <div 
                key={job.id} 
                className="py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 group hover:bg-white/[0.02] px-3 rounded-2xl transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/25 shrink-0 mt-0.5 sm:mt-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                        {job.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        job.status === 'Active' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : job.status === 'Draft'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                      }`}>
                        {job.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      <span className="text-purple-300 font-semibold">{job.department}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {job.location}
                      </span>
                      <span>•</span>
                      <span className="text-slate-400">{job.type}</span>
                      {job.salaryRange && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 font-medium font-mono">{job.salaryRange}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-4 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
                  <div className="text-left lg:text-right">
                    <p className="text-xs font-bold text-white font-mono">{job.applicantsCount} Applicants</p>
                    <p className="text-[10px] text-slate-500">Posted {job.postedDate}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedJobForCandidates(job)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      <span>Candidates</span>
                    </button>

                    {/* RBAC protected Edit and Delete actions */}
                    {canManageRecruitment && (
                      <>
                        <button
                          id={`btn-edit-job-${job.id}`}
                          onClick={() => handleOpenEditModal(job)}
                          title="Edit Job Opening"
                          className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`btn-delete-job-${job.id}`}
                          onClick={() => setDeletingJobId(job.id)}
                          title="Delete Job Opening"
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Job Modal */}
      {(showNewJobModal || editingJob) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 max-w-xl w-full space-y-5 bg-[#131b2e] shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-['Sora']">
                  {editingJob ? 'Edit Job Opening' : 'Create New Job Opening'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editingJob ? 'Update requirements and compensation details' : 'Publish a new position to recruitment channels'}
                </p>
              </div>
              <button 
                onClick={() => { setShowNewJobModal(false); setEditingJob(null); }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveJobForm} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Developer"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Department</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                    <option value="Support">Support</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Job Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Location</label>
                  <input
                    type="text"
                    value={formLoc}
                    onChange={(e) => setFormLoc(e.target.value)}
                    placeholder="e.g. Lahore, PK (Hybrid)"
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Salary Range (Rs. / PKR)</label>
                  <input
                    type="text"
                    value={formSalary}
                    onChange={(e) => setFormSalary(e.target.value)}
                    placeholder="e.g. Rs. 250,000 – 350,000 PKR / mo"
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Key responsibilities and day-to-day expectations..."
                  className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Requirements (one per line)</label>
                <textarea
                  rows={2}
                  value={formReqs}
                  onChange={(e) => setFormReqs(e.target.value)}
                  placeholder="4+ years React and TypeScript experience&#10;Strong system design principles"
                  className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => { setShowNewJobModal(false); setEditingJob(null); }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="brand-gradient-btn px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-purple-600/30 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingJob ? 'Save Changes' : 'Publish Opening'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingJobId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 max-w-sm w-full space-y-4 bg-[#131b2e] shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-['Sora']">Delete Job Opening?</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete this job posting? All attached applicant links will be archived.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
              <button
                onClick={() => setDeletingJobId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] text-slate-300 hover:bg-white/[0.1]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(deletingJobId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Delete Opening
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Pipeline Drawer / Modal */}
      {selectedJobForCandidates && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 max-w-2xl w-full space-y-5 bg-[#131b2e] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-['Sora']">{selectedJobForCandidates.title}</h3>
                <p className="text-xs text-purple-300">{selectedJobForCandidates.department} • {selectedJobForCandidates.applicantsCount} Active Applicants</p>
              </div>
              <button onClick={() => setSelectedJobForCandidates(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {[
                { name: 'Hamza Malik', score: '94% Match', stage: 'Panel Interview', date: 'Applied 2 days ago', exp: '5 yrs exp' },
                { name: 'Zainab Tariq', score: '89% Match', stage: 'Technical Screening', date: 'Applied 3 days ago', exp: '4 yrs exp' },
                { name: 'Bilal Khan', score: '82% Match', stage: 'HR Review', date: 'Applied 5 days ago', exp: '3 yrs exp' },
              ].map((cand, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 hover:border-purple-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs">
                      {cand.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{cand.name}</p>
                      <p className="text-[11px] text-slate-400">{cand.exp} • {cand.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {cand.score}
                    </span>
                    <span className="text-xs text-purple-300 font-medium bg-white/[0.04] px-2.5 py-1 rounded-lg">
                      {cand.stage}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/5">
              <button
                onClick={() => setSelectedJobForCandidates(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] text-slate-300 hover:bg-white/[0.1]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
