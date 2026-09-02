import React, { useState, useEffect } from 'react';
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
  X,
  Edit3
} from 'lucide-react';
import { TOP_PERFORMERS, RECENT_FEEDBACK } from '../data/initialData';
import { ViewMode, UserProfile, Employee, TopPerformer, FeedbackItem } from '../types';
import { dbService } from '../services/dbService';

interface PerformanceViewProps {
  currentUser?: UserProfile;
  employees?: Employee[];
  topPerformers?: TopPerformer[];
  feedbackList?: FeedbackItem[];
  onAddTopPerformer?: (performer: TopPerformer) => void;
  onRemoveTopPerformer?: (id: string) => void;
  onAddFeedback?: (item: FeedbackItem) => void;
  onNavigate: (view: ViewMode) => void;
  showToast?: (msg: string) => void;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({ 
  currentUser,
  employees = [],
  topPerformers: propTopPerformers,
  feedbackList: propFeedbackList,
  onAddTopPerformer,
  onRemoveTopPerformer,
  onAddFeedback,
  onNavigate,
  showToast
}) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRecipient, setFeedbackRecipient] = useState(employees[0]?.name || 'Aqsa');
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(propFeedbackList || RECENT_FEEDBACK);

  // Top Performers State
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>(propTopPerformers || TOP_PERFORMERS);
  const [showAddPerformerModal, setShowAddPerformerModal] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.empId || '');
  const [performerScore, setPerformerScore] = useState<number>(96);
  const [performerStars, setPerformerStars] = useState<number>(5);
  const [performerTag, setPerformerTag] = useState<string>('Sprint Champion');

  useEffect(() => {
    if (propTopPerformers) {
      setTopPerformers(propTopPerformers);
    }
  }, [propTopPerformers]);

  useEffect(() => {
    if (propFeedbackList) {
      setFeedbackList(propFeedbackList);
    }
  }, [propFeedbackList]);

  useEffect(() => {
    if (employees.length > 0 && !selectedEmpId) {
      setSelectedEmpId(employees[0].empId);
      setFeedbackRecipient(employees[0].name);
    }
  }, [employees, selectedEmpId]);

  const isAdmin = currentUser?.roleType === 'admin';
  const isManager = currentUser?.roleType === 'manager';
  const canManageFeedback = isAdmin || isManager;

  const [editingFeedback, setEditingFeedback] = useState<FeedbackItem | null>(null);
  const [editFeedbackText, setEditFeedbackText] = useState('');

  const handleOpenEditFeedback = (fb: FeedbackItem) => {
    if (!canManageFeedback) {
      if (showToast) showToast('⚠️ Access Denied (403): Only Admins and Managers can edit feedback.');
      return;
    }
    setEditingFeedback(fb);
    setEditFeedbackText(fb.comment);
  };

  const handleSaveEditFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeedback || !canManageFeedback) return;

    const updated = {
      ...editingFeedback,
      comment: editFeedbackText.trim()
    };

    setFeedbackList(prev => prev.map(f => f.id === updated.id ? updated : f));
    setEditingFeedback(null);

    try {
      await dbService.saveItem('performance_feedback', updated);
      if (showToast) showToast('✓ 360 Peer Feedback updated successfully.');
    } catch (err: any) {
      console.error('Failed to update feedback:', err);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!canManageFeedback) {
      if (showToast) showToast('⚠️ Access Denied (403): Only Admins and Managers can delete feedback.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this peer feedback note?')) {
      setFeedbackList(prev => prev.filter(f => f.id !== id));
      try {
        await dbService.deleteItem('performance_feedback', id);
        if (showToast) showToast('✓ 360 Peer Feedback deleted.');
      } catch (err: any) {
        console.error('Failed to delete feedback:', err);
      }
    }
  };

  const activeTopPerformers = topPerformers.filter(p => 
    employees.length === 0 || employees.some(e => e.empId === p.empId || e.name.toLowerCase() === p.name.toLowerCase())
  );

  // Dynamic calculations based on real employees and live data
  const totalEmployeesCount = employees.length;
  const topPerformersCount = activeTopPerformers.length;
  const feedbackCount = feedbackList.length;
  const avgScore = activeTopPerformers.length > 0 
    ? Math.round(activeTopPerformers.reduce((acc, p) => acc + (p.score || 90), 0) / activeTopPerformers.length)
    : 88;

  const handlePostFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText) return;

    const newFeedback: FeedbackItem = {
      id: `fb-${Date.now()}`,
      fromName: currentUser?.name || 'Raja Raza',
      toName: feedbackRecipient,
      avatar: currentUser?.avatar || '/raja_raza.jpg',
      timeAgo: 'Just now',
      comment: feedbackText
    };

    setFeedbackList(prev => [newFeedback, ...prev]);
    setFeedbackText('');
    setShowFeedbackModal(false);

    try {
      if (onAddFeedback) {
        onAddFeedback(newFeedback);
      } else {
        await dbService.saveItem('performance_feedback', newFeedback);
      }
      if (showToast) showToast(`✓ 360 Feedback submitted for ${feedbackRecipient}.`);
    } catch (err: any) {
      console.error('Failed to save feedback:', err);
    }
  };

  const handleAddTopPerformer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      if (showToast) showToast('⚠️ Access Denied (403): Only Admins can add top performers.');
      return;
    }

    const emp = employees.find(e => e.empId === selectedEmpId) || employees[0];
    if (!emp) return;

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

    try {
      if (onAddTopPerformer) {
        onAddTopPerformer(newPerformer);
      } else {
        await dbService.saveItem('top_performers', newPerformer);
      }
    } catch (err: any) {
      console.error('Failed to save top performer:', err);
    }

    setShowAddPerformerModal(false);
  };

  const handleRemoveTopPerformer = async (id: string, name: string) => {
    if (!isAdmin) {
      if (showToast) showToast('⚠️ Access Denied (403): Only Admins can remove top performers.');
      return;
    }
    setTopPerformers(prev => prev.filter(p => p.id !== id));

    try {
      if (onRemoveTopPerformer) {
        onRemoveTopPerformer(id);
      } else {
        await dbService.deleteItem('top_performers', id);
      }
      if (showToast) showToast(`✓ Removed ${name} from Top Performers.`);
    } catch (err: any) {
      console.error('Failed to delete top performer:', err);
    }
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
                  strokeDashoffset={238.76 - (238.76 * (avgScore / 100))} 
                  strokeLinecap="round"
                  fill="none" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-white font-['Sora']">{avgScore}%</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">High Output</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 text-center text-xs">
            <div className="p-2 rounded-xl bg-white/[0.02]">
              <p className="text-slate-400 text-[11px]">Completed</p>
              <p className="text-sm font-bold text-white mt-0.5">{totalEmployeesCount * 2} Reviews</p>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02]">
              <p className="text-slate-400 text-[11px]">Pending</p>
              <p className="text-sm font-bold text-amber-400 mt-0.5">{Math.max(0, totalEmployeesCount - topPerformersCount)} Reviews</p>
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
            <p className="text-2xl font-bold text-white font-['Sora']">{totalEmployeesCount * 2}</p>
            <p className="text-[11px] text-emerald-400 font-medium">100% active workforce coverage</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Goal Completion Rate</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-['Sora']">{avgScore}%</p>
            <p className="text-[11px] text-blue-300 font-medium">Target: 85% by Q3</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">High Performers</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Star className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-['Sora']">{topPerformersCount}</p>
            <p className="text-[11px] text-emerald-400 font-medium">Rated 5/5 stars</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Feedback Exchange</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-['Sora']">{feedbackCount}</p>
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
            {activeTopPerformers.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No top performers listed yet.</p>
            ) : (
              activeTopPerformers.map((p, idx) => (
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
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Recent 360 Peer Feedback</h2>
          <span className="text-xs text-slate-400">
            {canManageFeedback ? 'Admin/Manager Controls Active' : 'Read Only'}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbackList.map((fb) => (
            <div key={fb.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 relative group">
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
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  {canManageFeedback && (
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        id={`btn-edit-feedback-${fb.id}`}
                        onClick={() => handleOpenEditFeedback(fb)}
                        title="Edit Feedback Note"
                        className="p-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`btn-delete-feedback-${fb.id}`}
                        onClick={() => handleDeleteFeedback(fb.id)}
                        title="Delete Feedback Note"
                        className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
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
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name} ({emp.designation || emp.department})
                    </option>
                  ))}
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
      {/* Modal for Editing 360 Feedback (Admin/Manager) */}
      {editingFeedback && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 max-w-md w-full space-y-4 bg-[#131b2e] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Edit 360 Feedback</h3>
                <p className="text-xs text-slate-400 mt-0.5">From {editingFeedback.fromName} to {editingFeedback.toName}</p>
              </div>
              <button onClick={() => setEditingFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEditFeedback} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Feedback / Praise Note</label>
                <textarea
                  rows={4}
                  required
                  value={editFeedbackText}
                  onChange={(e) => setEditFeedbackText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingFeedback(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="brand-gradient-btn px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
