import React, { useState } from 'react';
import { 
  Award, 
  Star, 
  TrendingUp, 
  CheckCircle2, 
  MessageSquare, 
  Plus, 
  Sparkles, 
  Target, 
  Users,
  ChevronRight,
  Trash2,
  UserPlus,
  X
} from 'lucide-react';
import { TOP_PERFORMERS, RECENT_FEEDBACK } from '../data/initialData';
import { ViewMode, UserProfile, Employee, TopPerformer } from '../types';

interface PerformanceViewProps {
  currentUser?: UserProfile;
  employees?: Employee[];
  onNavigate: (view: ViewMode) => void;
  showToast?: (msg: string) => void;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({ 
  currentUser,
  employees = [],
  onNavigate,
  showToast
}) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRecipient, setFeedbackRecipient] = useState('Ayon Ahmed');
  const [feedbackList, setFeedbackList] = useState(RECENT_FEEDBACK);

  // Top Performers State
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>(TOP_PERFORMERS);
  const [showAddPerformerModal, setShowAddPerformerModal] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.empId || '');
  const [performerScore, setPerformerScore] = useState<number>(96);
  const [performerStars, setPerformerStars] = useState<number>(5);
  const [performerTag, setPerformerTag] = useState<string>('Sprint Champion');

  const isAdmin = currentUser?.roleType === 'admin';

  const handlePostFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText) return;

    setFeedbackList([
      {
        id: `fb-${Date.now()}`,
        fromName: currentUser?.name || 'Ayon Ahmed',
        toName: feedbackRecipient,
        avatar: currentUser?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQndi0Q67LuyTUAs8C_7ptSSpWoFH67QhVbLxfJfqqymbTF0-ImTvZteCBSvRhku41rEwtRkkZ2yuI6nQmZb0BfCOfoZGNID_PEOn4VWAWuKVpWR7Ik8bXButYDHroiVhejf7BUJNlr5RCQjELnvfecxNjb3pdO-wFiNm8ZRyrk3KjzJktBW6t2HdB8uvLEdFXWKFvdGX3obC3EyYo3QUO3PVDq-c-ap2YZgHP_1pncDG6fIUYwwl',
        timeAgo: 'Just now',
        comment: feedbackText
      },
      ...feedbackList
    ]);
    setFeedbackText('');
    setShowFeedbackModal(false);
    if (showToast) showToast(`✓ 360 Feedback submitted for ${feedbackRecipient}.`);
  };

  const handleAddTopPerformer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      if (showToast) showToast('⚠️ Access Denied (403): Only Admins can add top performers.');
      return;
    }

    const emp = employees.find(e => e.empId === selectedEmpId) || employees[0];
    if (!emp) return;

    // Check if already in top performers
    const existingIndex = topPerformers.findIndex(p => p.empId === emp.empId || p.name.toLowerCase() === emp.name.toLowerCase());

    const newPerformer: TopPerformer = {
      id: existingIndex >= 0 ? topPerformers[existingIndex].id : `perf-${Date.now()}`,
      empId: emp.empId,
      name: emp.name,
      role: emp.designation || 'Specialist',
      department: emp.department,
      score: Number(performerScore),
      stars: Number(performerStars),
      avatar: emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      avatarInitials: emp.avatarInitials || emp.name.substring(0, 2).toUpperCase(),
      tag: performerTag.trim() || 'Top Performer'
    };

    if (existingIndex >= 0) {
      setTopPerformers(prev => prev.map((p, idx) => idx === existingIndex ? newPerformer : p));
      if (showToast) showToast(`✓ Updated ${emp.name} in Top Performers (${performerScore}%).`);
    } else {
      setTopPerformers(prev => [newPerformer, ...prev]);
      if (showToast) showToast(`✓ Added ${emp.name} to Top Performers (${performerScore}%).`);
    }

    setShowAddPerformerModal(false);
  };

  const handleRemoveTopPerformer = (id: string, name: string) => {
    if (!isAdmin) {
      if (showToast) showToast('⚠️ Access Denied (403): Only Admins can remove top performers.');
      return;
    }
    setTopPerformers(prev => prev.filter(p => p.id !== id));
    if (showToast) showToast(`✓ Removed ${name} from Top Performers.`);
  };

  return (
    <div id="performance-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Performance & Appraisal</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Q2 2025 Cycle Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate employee quarterly goals, 360 peer feedback, competency ratings, and star performers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-give-feedback"
            onClick={() => setShowFeedbackModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.09] text-slate-200 border border-white/10 transition-all cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
            <span>Give 360 Feedback</span>
          </button>
          <button
            id="btn-schedule-review"
            onClick={() => alert('New Performance Review form generated for Q2.')}
            className="brand-gradient-btn flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Review</span>
          </button>
        </div>
      </div>

      {/* Top Overview Cards & Performance Index */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Index Donut */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#191e3b]/90 to-[#131b2e]/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Org Index
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                +4.8% vs Q1
              </span>
            </div>
            <h2 className="text-base font-bold text-white">Company Performance Score</h2>
          </div>

          <div className="py-6 flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" className="stroke-slate-800" strokeWidth="12" fill="none" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="38" 
                  className="stroke-[#a078ff]" 
                  strokeWidth="12" 
                  strokeDasharray="238.76" 
                  strokeDashoffset="59.69" 
                  strokeLinecap="round"
                  fill="none" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-white font-['Sora']">75%</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">High Output</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 text-center text-xs">
            <div className="p-2 rounded-xl bg-white/[0.02]">
              <p className="text-slate-400 text-[11px]">Completed</p>
              <p className="text-sm font-bold text-white mt-0.5">142 Reviews</p>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02]">
              <p className="text-slate-400 text-[11px]">Pending</p>
              <p className="text-sm font-bold text-amber-400 mt-0.5">28 Reviews</p>
            </div>
          </div>
        </div>

        {/* 4 Performance KPI Tiles */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Reviews Completed</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-['Sora']">142</p>
            <p className="text-[11px] text-emerald-400 font-medium">+12% faster completion</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Goal Completion Rate</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-['Sora']">68%</p>
            <p className="text-[11px] text-blue-300 font-medium">Target: 70% by June</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">High Performers</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Star className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-['Sora']">45</p>
            <p className="text-[11px] text-emerald-400 font-medium">Rated 5/5 stars</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Feedback Exchange</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-['Sora']">312</p>
            <p className="text-[11px] text-amber-300 font-medium">Positive peer mentions</p>
          </div>
        </div>
      </div>

      {/* Top Performers Leaderboard & Strategic Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              Top Performers of Q2
            </h2>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  id="btn-add-top-performer"
                  onClick={() => setShowAddPerformerModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Performer</span>
                </button>
              )}
              <span className="text-xs text-slate-400">Leadership Board</span>
            </div>
          </div>

          <div className="space-y-3">
            {topPerformers.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No top performers listed yet.</p>
            ) : (
              topPerformers.map((p, idx) => (
                <div key={p.id} className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-amber-400 text-black' : idx === 1 ? 'bg-slate-300 text-black' : 'bg-amber-700/60 text-white'
                    }`}>
                      {idx + 1}
                    </span>
                    {p.avatar ? (
                      <img 
                        src={p.avatar} 
                        alt={p.name} 
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/30 shrink-0" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                        {p.avatarInitials || p.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xs font-bold text-white">{p.name}</h3>
                      <p className="text-[11px] text-slate-400">{p.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span className="text-xs font-bold text-white font-mono">{p.score}%</span>
                      </div>
                      <span className="text-[10px] text-purple-300 font-semibold mt-0.5 inline-block bg-purple-500/10 px-2 py-0.5 rounded-full">
                        {p.tag}
                      </span>
                    </div>
                    {isAdmin && (
                      <button
                        id={`btn-remove-performer-${p.id}`}
                        onClick={() => handleRemoveTopPerformer(p.id, p.name)}
                        title="Remove from Top Performers"
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Strategic Goals Progress */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              Strategic OKRs & Goals
            </h2>
            <span className="text-xs text-purple-400 font-semibold cursor-pointer">Manage OKRs</span>
          </div>

          <div className="space-y-4">
            {[
              { goal: 'Design System & Component Tokens 2.0', owner: 'Ayon Ahmed', progress: 92, color: 'from-purple-500 to-indigo-500' },
              { goal: 'Zero-Downtime Microservices Architecture', owner: 'Rahim Uddin', progress: 85, color: 'from-blue-500 to-cyan-500' },
              { goal: 'Enterprise Security SOC2 Type II Audit', owner: 'David Rodriguez', progress: 74, color: 'from-emerald-500 to-teal-500' },
              { goal: 'Hire 24 High-Impact Senior Engineers', owner: 'Sumaiya Akter', progress: 62, color: 'from-amber-500 to-orange-500' },
            ].map((okr, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{okr.goal}</span>
                  <span className="font-mono font-bold text-purple-300">{okr.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${okr.color} rounded-full`} style={{ width: `${okr.progress}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Lead: {okr.owner}</span>
                  <span className="text-slate-400">On Track</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 360 Feedback Stream */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
        <h2 className="text-base font-bold text-white">Recent 360 Peer Feedback</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbackList.map((fb) => (
            <div key={fb.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img 
                    src={fb.avatar} 
                    alt={fb.fromName} 
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10" 
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">
                      {fb.fromName} <span className="text-slate-500 font-normal">to</span> <span className="text-purple-300">{fb.toName}</span>
                    </p>
                    <p className="text-[10px] text-slate-500">{fb.timeAgo}</p>
                  </div>
                </div>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "{fb.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for 360 Feedback */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 max-w-md w-full space-y-4 bg-[#131b2e] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white">Give 360 Peer Feedback</h3>
              <button onClick={() => setShowFeedbackModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handlePostFeedback} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Select Teammate</label>
                <select
                  value={feedbackRecipient}
                  onChange={(e) => setFeedbackRecipient(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white"
                >
                  <option value="Rahim Uddin">Rahim Uddin (Engineering)</option>
                  <option value="Sarah Jenkins">Sarah Jenkins (Design VP)</option>
                  <option value="Elena Rodriguez">Elena Rodriguez (Product)</option>
                  <option value="David Chen">David Chen (Frontend)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Your Recognition / Feedback Note</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share praise, impact details, or constructive encouragement..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="brand-gradient-btn px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-purple-600/30"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Adding Top Performer (Admin Only) */}
      {showAddPerformerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 max-w-md w-full space-y-5 bg-[#131b2e] shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-['Sora']">Add to Top Performers</h3>
                <p className="text-xs text-slate-400 mt-0.5">Recognize an employee with high-rating score and custom honors</p>
              </div>
              <button 
                onClick={() => setShowAddPerformerModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTopPerformer} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Select Employee *</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.empId}>
                      {emp.name} ({emp.empId}) — {emp.designation || emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Performance Score (%) *</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    required
                    value={performerScore}
                    onChange={(e) => setPerformerScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Star Rating (1-5)</label>
                  <select
                    value={performerStars}
                    onChange={(e) => setPerformerStars(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Honors / Recognition Tag *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sprint Champion, Design Virtuoso, Star Closer"
                  value={performerTag}
                  onChange={(e) => setPerformerTag(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddPerformerModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="brand-gradient-btn px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  Add Top Performer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
