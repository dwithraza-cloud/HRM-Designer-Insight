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
  Eye
} from 'lucide-react';
import { JobOpening, ViewMode } from '../types';

interface RecruitmentViewProps {
  jobOpenings: JobOpening[];
  onAddJob: (job: JobOpening) => void;
  onNavigate: (view: ViewMode) => void;
}

export const RecruitmentView: React.FC<RecruitmentViewProps> = ({
  jobOpenings,
  onAddJob,
  onNavigate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDept, setNewJobDept] = useState('Engineering');
  const [newJobType, setNewJobType] = useState<'Full-time' | 'Remote' | 'Hybrid'>('Full-time');
  const [newJobLoc, setNewJobLoc] = useState('Dhaka, BD (Hybrid)');

  const filteredJobs = jobOpenings.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle) return;

    const job: JobOpening = {
      id: `job-${Date.now()}`,
      title: newJobTitle,
      department: newJobDept,
      location: newJobLoc,
      type: newJobType,
      applicantsCount: 0,
      status: 'Active',
      icon: 'Briefcase',
      postedDate: 'Just now'
    };

    onAddJob(job);
    setShowNewJobModal(false);
    setNewJobTitle('');
  };

  return (
    <div id="recruitment-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Recruitment Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {jobOpenings.length} Active Positions
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage open roles, candidate pipelines, interview schedules, and talent velocity.
          </p>
        </div>

        <button
          id="btn-post-new-job"
          onClick={() => setShowNewJobModal(true)}
          className="brand-gradient-btn flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
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
          <p className="text-2xl font-bold text-white font-['Sora']">24</p>
          <p className="text-[11px] text-purple-400 font-medium">8 departments hiring</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Active Candidates</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-['Sora']">156</p>
          <p className="text-[11px] text-emerald-400">+18 applicants today</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Interviews Scheduled</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-['Sora']">32</p>
          <p className="text-[11px] text-amber-300 font-medium">Next: UX Lead at 3:00 PM</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Hiring Velocity</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-['Sora']">18 <span className="text-xs font-normal text-slate-400">Days</span></p>
          <p className="text-[11px] text-emerald-400">4 days faster than industry benchmark</p>
        </div>
      </div>

      {/* Pipeline Overview & Stage Breakdown */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Recruitment Pipeline Stages</h2>
            <p className="text-xs text-slate-400">Real-time candidate transition through hiring funnels</p>
          </div>
          <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg">156 In Flow</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { stage: '1. Sourced & Applied', count: 156, pct: '100%', color: 'from-purple-500 to-indigo-500', note: 'Top of funnel' },
            { stage: '2. Screening Passed', count: 64, pct: '41%', color: 'from-blue-500 to-cyan-500', note: 'Technical & HR call' },
            { stage: '3. Panel Interview', count: 32, pct: '20%', color: 'from-amber-500 to-amber-600', note: 'Live assessment' },
            { stage: '4. Offer Sent', count: 8, pct: '5%', color: 'from-emerald-500 to-teal-500', note: 'Decision stage' },
          ].map((pipe, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{pipe.stage}</span>
                <span className="text-xs font-bold text-purple-300 font-mono">{pipe.count}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${pipe.color} rounded-full`} style={{ width: pipe.pct }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{pipe.note}</span>
                <span className="font-semibold text-slate-400">{pipe.pct}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Job Openings List */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search active openings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {filteredJobs.map((job) => (
            <div key={job.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-white/[0.02] px-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/25 shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="text-purple-300 font-semibold">{job.department}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {job.location}
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">{job.type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <p className="text-xs font-bold text-white">{job.applicantsCount} Applicants</p>
                  <p className="text-[10px] text-slate-500">Posted {job.postedDate}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/10 transition-colors">
                    View Candidates
                  </button>
                  <button className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post Job Modal */}
      {showNewJobModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 max-w-lg w-full space-y-5 bg-[#131b2e] shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white">Create New Job Posting</h3>
              <button 
                onClick={() => setShowNewJobModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Staff Security Architect"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Department</label>
                  <select
                    value={newJobDept}
                    onChange={(e) => setNewJobDept(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Job Type</label>
                  <select
                    value={newJobType}
                    onChange={(e) => setNewJobType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Location</label>
                <input
                  type="text"
                  value={newJobLoc}
                  onChange={(e) => setNewJobLoc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowNewJobModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] text-slate-300 hover:bg-white/[0.1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="brand-gradient-btn px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  Publish Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
