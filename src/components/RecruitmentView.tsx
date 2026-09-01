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
  Phone,
  Video,
  Target,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { JobOpening, ViewMode, UserProfile, ActiveInterview, HiringVelocityMetric } from '../types';
import { INITIAL_ACTIVE_INTERVIEWS, INITIAL_HIRING_VELOCITY } from '../data/initialData';

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
  const [activeTab, setActiveTab] = useState<'openings' | 'interviews' | 'velocity'>('openings');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Job Opening Modal States
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [selectedJobForCandidates, setSelectedJobForCandidates] = useState<JobOpening | null>(null);

  // Active Interviews State & Modals
  const [interviews, setInterviews] = useState<ActiveInterview[]>(INITIAL_ACTIVE_INTERVIEWS);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [editingInterview, setEditingInterview] = useState<ActiveInterview | null>(null);
  const [deletingInterviewId, setDeletingInterviewId] = useState<string | null>(null);

  // Hiring Velocity State & Modals
  const [velocities, setVelocities] = useState<HiringVelocityMetric[]>(INITIAL_HIRING_VELOCITY);
  const [showVelocityModal, setShowVelocityModal] = useState(false);
  const [editingVelocity, setEditingVelocity] = useState<HiringVelocityMetric | null>(null);
  const [deletingVelocityId, setDeletingVelocityId] = useState<string | null>(null);

  // Form State for Job Add / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formDept, setFormDept] = useState<'Design' | 'Engineering' | 'Marketing' | 'HR' | 'Sales' | 'Finance' | 'Operations' | 'Support'>('Engineering');
  const [formType, setFormType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid'>('Full-time');
  const [formLoc, setFormLoc] = useState('Lahore, PK (Hybrid)');
  const [formSalary, setFormSalary] = useState('Rs. 200,000 – 300,000 PKR / mo');
  const [formExp, setFormExp] = useState('3+ Years');
  const [formStatus, setFormStatus] = useState<'Active' | 'Draft' | 'Closed'>('Active');
  const [formDesc, setFormDesc] = useState('');
  const [formReqs, setFormReqs] = useState('');

  // Form State for Interview Add / Edit
  const [intCandidateName, setIntCandidateName] = useState('');
  const [intCandidateEmail, setIntCandidateEmail] = useState('');
  const [intJobTitle, setIntJobTitle] = useState('');
  const [intDept, setIntDept] = useState('Engineering');
  const [intInterviewer, setIntInterviewer] = useState('Raja Raza');
  const [intDate, setIntDate] = useState('Today, 14 May 2025');
  const [intTime, setIntTime] = useState('03:00 PM – 04:00 PM');
  const [intStage, setIntStage] = useState<ActiveInterview['stage']>('Technical Round 1');
  const [intMode, setIntMode] = useState<ActiveInterview['mode']>('Google Meet');
  const [intStatus, setIntStatus] = useState<ActiveInterview['status']>('Scheduled');
  const [intNotes, setIntNotes] = useState('');

  // Form State for Velocity Add / Edit
  const [velDept, setVelDept] = useState('Engineering');
  const [velAvgDays, setVelAvgDays] = useState(14);
  const [velTargetDays, setVelTargetDays] = useState(16);
  const [velAcceptRate, setVelAcceptRate] = useState(90);
  const [velOpenRoles, setVelOpenRoles] = useState(2);
  const [velTrend, setVelTrend] = useState<HiringVelocityMetric['trend']>('faster');

  const canManageRecruitment = currentUser.roleType === 'admin' || currentUser.roleType === 'manager';

  const filteredJobs = jobOpenings.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = departmentFilter === 'All' || j.department === departmentFilter;
    const matchStatus = statusFilter === 'All' || j.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const filteredInterviews = interviews.filter(i => {
    return i.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.interviewer.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Job Opening Handlers
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
      if (showToast) showToast(`Job "${updated.title}" updated successfully.`);
    } else {
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
      if (showToast) showToast(`New job "${newJob.title}" published successfully.`);
    }
  };

  const handleConfirmDelete = (id: string) => {
    if (!canManageRecruitment) {
      if (showToast) showToast('⚠️ Access Denied (403): Only Admins and Managers can delete job openings.');
      return;
    }
    onDeleteJob(id);
    setDeletingJobId(null);
    if (showToast) showToast('Job opening removed successfully.');
  };

  // Interview Handlers
  const handleOpenAddInterview = () => {
    if (!canManageRecruitment) {
      if (showToast) showToast('⚠️ Access Denied (403): Only Admins and Managers can schedule interviews.');
      return;
    }
    setIntCandidateName('');
    setIntCandidateEmail('');
    setIntJobTitle(jobOpenings[0]?.title || 'Senior Frontend Developer');
    setIntDept(jobOpenings[0]?.department || 'Engineering');
    setIntInterviewer(currentUser.name || 'Raja Raza');
    setIntDate('Today, 14 May 2025');
    setIntTime('03:00 PM – 04:00 PM');
    setIntStage('Technical Round 1');
    setIntMode('Google Meet');
    setIntStatus('Scheduled');
    setIntNotes('');
    setEditingInterview(null);
    setShowInterviewModal(true);
  };

  const handleOpenEditInterview = (intItem: ActiveInterview) => {
    if (!canManageRecruitment) {
      if (showToast) showToast('⚠️ Access Denied (403): Only Admins and Managers can edit interview details.');
      return;
    }
    setEditingInterview(intItem);
    setIntCandidateName(intItem.candidateName);
    setIntCandidateEmail(intItem.candidateEmail);
    setIntJobTitle(intItem.jobTitle);
    setIntDept(intItem.department);
    setIntInterviewer(intItem.interviewer);
    setIntDate(intItem.date);
    setIntTime(intItem.time);
    setIntStage(intItem.stage);
    setIntMode(intItem.mode);
    setIntStatus(intItem.status);
    setIntNotes(intItem.notes || '');
    setShowInterviewModal(true);
  };

  const handleSaveInterviewForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageRecruitment) {
      if (showToast) showToast('⚠️ Access Denied (403): Unauthorized operation.');
      return;
    }
    if (!intCandidateName.trim()) {
      if (showToast) showToast('Please enter candidate name.');
      return;
    }

    if (editingInterview) {
      const updated: ActiveInterview = {
        ...editingInterview,
        candidateName: intCandidateName.trim(),
        candidateEmail: intCandidateEmail.trim() || 'candidate@example.com',
        jobTitle: intJobTitle.trim(),
        department: intDept,
        interviewer: intInterviewer.trim(),
        date: intDate.trim(),
        time: intTime.trim(),
        stage: intStage,
        mode: intMode,
        status: intStatus,
        notes: intNotes.trim()
      };
      setInterviews(prev => prev.map(i => i.id === updated.id ? updated : i));
      setEditingInterview(null);
      setShowInterviewModal(false);
      if (showToast) showToast(`Interview for ${updated.candidateName} updated.`);
    } else {
      const newInt: ActiveInterview = {
        id: `int-${Date.now()}`,
        candidateName: intCandidateName.trim(),
        candidateEmail: intCandidateEmail.trim() || 'candidate@example.com',
        jobTitle: intJobTitle.trim(),
        department: intDept,
        interviewer: intInterviewer.trim(),
        date: intDate.trim(),
        time: intTime.trim(),
        stage: intStage,
        mode: intMode,
        status: intStatus,
        notes: intNotes.trim()
      };
      setInterviews(prev => [newInt, ...prev]);
      setShowInterviewModal(false);
      if (showToast) showToast(`Interview scheduled with ${newInt.candidateName}.`);
    }
  };

  const handleConfirmDeleteInterview = (id: string) => {
    if (!canManageRecruitment) {
      if (showToast) showToast('⚠️ Access Denied (403): Only Admins and Managers can remove interviews.');
      return;
    }
    setInterviews(prev => prev.filter(i => i.id !== id));
    setDeletingInterviewId(null);
    if (showToast) showToast('Interview removed from schedule.');
  };

  // Hiring Velocity Handlers
  const handleOpenAddVelocity = () => {
    if (!canManageRecruitment) {
      if (showToast) showToast('⚠️ Access Denied (403): Only Admins and Managers can add velocity benchmarks.');
      return;
    }
    setVelDept('Operations');
    setVelAvgDays(14);
    setVelTargetDays(16);
    setVelAcceptRate(90);
    setVelOpenRoles(1);
    setVelTrend('faster');
    setEditingVelocity(null);
    setShowVelocityModal(true);
  };

  const handleOpenEditVelocity = (vel: HiringVelocityMetric) => {
    if (!canManageRecruitment) {
      if (showToast) showToast('⚠️ Access Denied (403): Only Admins and Managers can edit hiring velocity.');
      return;
    }
    setEditingVelocity(vel);
    setVelDept(vel.department);
    setVelAvgDays(vel.averageDays);
    setVelTargetDays(vel.targetDays);
    setVelAcceptRate(vel.offerAcceptanceRate);
    setVelOpenRoles(vel.openRoles);
    setVelTrend(vel.trend);
    setShowVelocityModal(true);
  };

  const handleSaveVelocityForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageRecruitment) {
      if (showToast) showToast('⚠️ Access Denied (403): Unauthorized operation.');
      return;
    }

    if (editingVelocity) {
      const updated: HiringVelocityMetric = {
        ...editingVelocity,
        department: velDept,
        averageDays: Number(velAvgDays),
        targetDays: Number(velTargetDays),
        offerAcceptanceRate: Number(velAcceptRate),
        openRoles: Number(velOpenRoles),
        trend: velTrend
      };
      setVelocities(prev => prev.map(v => v.id === updated.id ? updated : v));
      setEditingVelocity(null);
      setShowVelocityModal(false);
      if (showToast) showToast(`Velocity metric for ${updated.department} updated.`);
    } else {
      const newVel: HiringVelocityMetric = {
        id: `vel-${Date.now()}`,
        department: velDept,
        averageDays: Number(velAvgDays),
        targetDays: Number(velTargetDays),
        offerAcceptanceRate: Number(velAcceptRate),
        openRoles: Number(velOpenRoles),
        trend: velTrend
      };
      setVelocities(prev => [...prev, newVel]);
      setShowVelocityModal(false);
      if (showToast) showToast(`New velocity metric for ${newVel.department} added.`);
    }
  };

  const handleConfirmDeleteVelocity = (id: string) => {
    if (!canManageRecruitment) {
      if (showToast) showToast('⚠️ Access Denied (403): Only Admins and Managers can remove velocity metrics.');
      return;
    }
    setVelocities(prev => prev.filter(v => v.id !== id));
    setDeletingVelocityId(null);
    if (showToast) showToast('Velocity metric removed.');
  };

  const avgHiringDays = Math.round(
    velocities.reduce((acc, curr) => acc + curr.averageDays, 0) / (velocities.length || 1)
  );

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
            Manage open talent searches, active interviews, hiring velocity benchmarks, and candidates.
          </p>
        </div>

        {canManageRecruitment && (
          <div className="flex items-center gap-2">
            {activeTab === 'openings' && (
              <button
                id="btn-post-new-job"
                onClick={handleOpenAddModal}
                className="brand-gradient-btn flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer hover:opacity-95"
              >
                <Plus className="w-4 h-4" />
                <span>Post New Job</span>
              </button>
            )}
            {activeTab === 'interviews' && (
              <button
                id="btn-schedule-interview"
                onClick={handleOpenAddInterview}
                className="brand-gradient-btn flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer hover:opacity-95"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Interview</span>
              </button>
            )}
            {activeTab === 'velocity' && (
              <button
                id="btn-add-velocity-metric"
                onClick={handleOpenAddVelocity}
                className="brand-gradient-btn flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer hover:opacity-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Department Metric</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveTab('openings')}
          className={`glass-panel p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
            activeTab === 'openings' ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/5 hover:border-white/20'
          }`}
        >
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

        <div 
          onClick={() => setActiveTab('interviews')}
          className={`glass-panel p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
            activeTab === 'interviews' ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/5 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Active Interviews</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-['Sora']">{interviews.length}</p>
          <p className="text-[11px] text-amber-300 font-medium">Click to manage & edit</p>
        </div>

        <div 
          onClick={() => setActiveTab('velocity')}
          className={`glass-panel p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
            activeTab === 'velocity' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/5 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Hiring Velocity</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-['Sora']">{avgHiringDays} <span className="text-xs font-normal text-slate-400">Days</span></p>
          <p className="text-[11px] text-emerald-400">{velocities.length} department benchmarks</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('openings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'openings'
              ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Job Positions Directory ({jobOpenings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('interviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'interviews'
              ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Active Interviews ({interviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('velocity')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'velocity'
              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Hiring Velocity & Metrics ({velocities.length})</span>
        </button>
      </div>

      {/* ======================= TAB 1: JOB OPENINGS ======================= */}
      {activeTab === 'openings' && (
        <div className="space-y-4">
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
        </div>
      )}

      {/* ======================= TAB 2: ACTIVE INTERVIEWS ======================= */}
      {activeTab === 'interviews' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search interviews by candidate, role, or interviewer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {canManageRecruitment ? (
              <span className="text-xs text-amber-300 font-medium hidden sm:inline">
                Admin & Manager access enabled (Edit & Remove available)
              </span>
            ) : (
              <span className="text-xs text-slate-400">Read-only view</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInterviews.map((item) => (
              <div 
                key={item.id} 
                className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-amber-500/30 transition-all space-y-4 relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-sm border border-amber-500/30">
                      {item.candidateName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{item.candidateName}</h3>
                      <p className="text-xs text-slate-400">{item.candidateEmail}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.status === 'Scheduled' 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : item.status === 'Completed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Position & Dept:</span>
                    <span className="font-semibold text-white">{item.jobTitle} ({item.department})</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Stage:</span>
                    <span className="text-purple-300 font-medium">{item.stage}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Schedule:</span>
                    <span className="text-amber-200 font-mono">{item.date} • {item.time}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Interviewer:</span>
                    <span className="text-slate-200">{item.interviewer}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Mode:</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <Video className="w-3 h-3" />
                      {item.mode}
                    </span>
                  </div>
                  {item.notes && (
                    <div className="pt-1.5 border-t border-white/5 text-[11px] text-slate-400 italic">
                      Note: {item.notes}
                    </div>
                  )}
                </div>

                {/* Controls for Admin and Manager */}
                {canManageRecruitment && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                    <button
                      id={`btn-edit-interview-${item.id}`}
                      onClick={() => handleOpenEditInterview(item)}
                      className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      id={`btn-delete-interview-${item.id}`}
                      onClick={() => setDeletingInterviewId(item.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB 3: HIRING VELOCITY ======================= */}
      {activeTab === 'velocity' && (
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-base font-bold text-white font-['Sora']">Department Hiring Velocity & SLA Benchmarks</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track average days to fill positions and candidate offer acceptance rates.
                </p>
              </div>

              {canManageRecruitment && (
                <button
                  onClick={handleOpenAddVelocity}
                  className="brand-gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Department Metric</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {velocities.map((metric) => (
                <div 
                  key={metric.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{metric.department}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      metric.trend === 'faster' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : metric.trend === 'on-track'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {metric.trend}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Average Time-to-Hire:</span>
                      <span className="text-xl font-bold text-white font-mono">{metric.averageDays} Days</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Target SLA:</span>
                      <span className="text-slate-300 font-mono">{metric.targetDays} Days</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Offer Acceptance</span>
                      <span className="text-emerald-400 font-bold font-mono">{metric.offerAcceptanceRate}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${metric.offerAcceptanceRate}%` }} 
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                    <span>Open Roles: <strong className="text-white">{metric.openRoles}</strong></span>
                    {canManageRecruitment && (
                      <div className="flex items-center gap-1.5">
                        <button
                          id={`btn-edit-velocity-${metric.id}`}
                          onClick={() => handleOpenEditVelocity(metric)}
                          className="p-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300"
                          title="Edit Metric"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          id={`btn-delete-velocity-${metric.id}`}
                          onClick={() => setDeletingVelocityId(metric.id)}
                          className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300"
                          title="Delete Metric"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: ADD / EDIT INTERVIEW ======================= */}
      {showInterviewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 max-w-lg w-full space-y-4 bg-[#131b2e] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-['Sora']">
                  {editingInterview ? 'Edit Interview' : 'Schedule Active Interview'}
                </h3>
                <p className="text-xs text-slate-400">Authorized for Admins & Managers</p>
              </div>
              <button onClick={() => setShowInterviewModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInterviewForm} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Candidate Name *</label>
                  <input
                    type="text"
                    required
                    value={intCandidateName}
                    onChange={(e) => setIntCandidateName(e.target.value)}
                    placeholder="e.g. Zubair Ahmed"
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Candidate Email</label>
                  <input
                    type="email"
                    value={intCandidateEmail}
                    onChange={(e) => setIntCandidateEmail(e.target.value)}
                    placeholder="e.g. zubair@example.com"
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Job Title</label>
                  <input
                    type="text"
                    value={intJobTitle}
                    onChange={(e) => setIntJobTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Developer"
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Department</label>
                  <select
                    value={intDept}
                    onChange={(e) => setIntDept(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Date</label>
                  <input
                    type="text"
                    value={intDate}
                    onChange={(e) => setIntDate(e.target.value)}
                    placeholder="e.g. Today, 14 May 2025"
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Time</label>
                  <input
                    type="text"
                    value={intTime}
                    onChange={(e) => setIntTime(e.target.value)}
                    placeholder="e.g. 03:00 PM – 04:00 PM"
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Stage</label>
                  <select
                    value={intStage}
                    onChange={(e) => setIntStage(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white"
                  >
                    <option value="HR Screening">HR Screening</option>
                    <option value="Technical Round 1">Technical Round 1</option>
                    <option value="System Design">System Design</option>
                    <option value="Executive Final">Executive Final</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Mode</label>
                  <select
                    value={intMode}
                    onChange={(e) => setIntMode(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Phone">Phone</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Status</label>
                  <select
                    value={intStatus}
                    onChange={(e) => setIntStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Interviewer(s)</label>
                <input
                  type="text"
                  value={intInterviewer}
                  onChange={(e) => setIntInterviewer(e.target.value)}
                  placeholder="e.g. Raja Raza & Iqra Pervaiz"
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Notes / Key Focus</label>
                <textarea
                  rows={2}
                  value={intNotes}
                  onChange={(e) => setIntNotes(e.target.value)}
                  placeholder="Technical evaluation focus, portfolio review, etc."
                  className="w-full px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowInterviewModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="brand-gradient-btn px-5 py-2 rounded-xl font-bold text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingInterview ? 'Update Interview' : 'Save Interview'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: ADD / EDIT VELOCITY ======================= */}
      {showVelocityModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 max-w-md w-full space-y-4 bg-[#131b2e] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-['Sora']">
                  {editingVelocity ? 'Edit Velocity Metric' : 'Add Department Benchmark'}
                </h3>
                <p className="text-xs text-slate-400">Admin and Manager calibration</p>
              </div>
              <button onClick={() => setShowVelocityModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVelocityForm} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Department</label>
                <select
                  value={velDept}
                  onChange={(e) => setVelDept(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Average Days</label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    required
                    value={velAvgDays}
                    onChange={(e) => setVelAvgDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Target SLA Days</label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    required
                    value={velTargetDays}
                    onChange={(e) => setVelTargetDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Offer Acceptance (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={velAcceptRate}
                    onChange={(e) => setVelAcceptRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Open Roles Count</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    required
                    value={velOpenRoles}
                    onChange={(e) => setVelOpenRoles(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Trend Status</label>
                <select
                  value={velTrend}
                  onChange={(e) => setVelTrend(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white"
                >
                  <option value="faster">Faster than target SLA</option>
                  <option value="on-track">On Track</option>
                  <option value="slower">Needs Attention / Slower</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowVelocityModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="brand-gradient-btn px-5 py-2 rounded-xl font-bold text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingVelocity ? 'Save Metric' : 'Add Metric'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: DELETE INTERVIEW CONFIRMATION ======================= */}
      {deletingInterviewId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 max-w-sm w-full space-y-4 bg-[#131b2e] shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-['Sora']">Remove Interview?</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to remove this interview session? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
              <button
                onClick={() => setDeletingInterviewId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] text-slate-300 hover:bg-white/[0.1]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDeleteInterview(deletingInterviewId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Remove Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: DELETE VELOCITY CONFIRMATION ======================= */}
      {deletingVelocityId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 max-w-sm w-full space-y-4 bg-[#131b2e] shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-['Sora']">Remove Velocity Metric?</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete this department hiring metric?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
              <button
                onClick={() => setDeletingVelocityId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] text-slate-300 hover:bg-white/[0.1]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDeleteVelocity(deletingVelocityId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Remove Metric
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Delete Job Confirmation Modal */}
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
