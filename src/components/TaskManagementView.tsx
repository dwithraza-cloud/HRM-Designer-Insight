import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Pin, 
  Trash2, 
  Edit3,
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Users, 
  UserCheck, 
  Shield, 
  Building2, 
  Tag, 
  ChevronRight, 
  Layers, 
  Kanban, 
  ListFilter, 
  Eye, 
  Flame, 
  Info,
  Check,
  X,
  User,
  ArrowRight,
  Briefcase,
  BarChart3,
  TrendingUp,
  Target,
  PieChart as PieIcon,
  Activity,
  Award,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Paperclip,
  Camera,
  FileText,
  Image as ImageIcon,
  FileCode,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  Wand2,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  Radio
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import confetti from 'canvas-confetti';
import { TaskItem, TaskAssignee, UserRole, Employee, UserProfile, TaskAttachment } from '../types';

interface TaskManagementViewProps {
  tasks: TaskItem[];
  employees: Employee[];
  currentUser: UserProfile;
  onAddTask: (task: Partial<TaskItem>) => void;
  onEditTask?: (task: TaskItem) => void;
  onToggleTask: (id: string) => void;
  onTogglePinTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClearAllTasks?: () => void;
  onUpdateTaskStatus?: (id: string, status: TaskItem['status']) => void;
  onAddAttachment?: (taskId: string, attachment: TaskAttachment) => void;
  onRemoveAttachment?: (taskId: string, attachmentId: string) => void;
  onNavigate: (view: any) => void;
}

export const TaskManagementView: React.FC<TaskManagementViewProps> = ({
  tasks,
  employees,
  currentUser,
  onAddTask,
  onEditTask,
  onToggleTask,
  onTogglePinTask,
  onDeleteTask,
  onClearAllTasks,
  onUpdateTaskStatus,
  onAddAttachment,
  onRemoveAttachment,
  onNavigate
}) => {
  // Fixed user role from authenticated session
  const userRole = currentUser.roleType || 'admin';
  
  // View & Filter States
  const [viewMode, setViewMode] = useState<'board' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'all' | 'assigned-to-me' | 'assigned-by-me' | 'in-progress' | 'completed'>('all');
  
  // Dashboard Analytics Section States
  const [showAnalyticsSummary, setShowAnalyticsSummary] = useState(true);
  const [analyticsMetricMode, setAnalyticsMetricMode] = useState<'rate' | 'counts'>('rate');
  const [analyticsTargetDept, setAnalyticsTargetDept] = useState<string>('All');
  
  // Modal & Drawer States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<TaskItem | null>(null);
  const [editingTaskModal, setEditingTaskModal] = useState<TaskItem | null>(null);

  // Attachment State & Camera Capture in TaskDetailModal
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewAttachmentUrl, setPreviewAttachmentUrl] = useState<string | null>(null);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Stop camera when closing details modal or unmounting
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Keep selectedTaskForDetails in sync with tasks prop updates
  useEffect(() => {
    if (selectedTaskForDetails) {
      const updated = tasks.find(t => t.id === selectedTaskForDetails.id);
      if (updated) {
        setSelectedTaskForDetails(updated);
      }
    }
  }, [tasks]);

  // Form State for Creating / Assigning a Task
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formPriority, setFormPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');
  const [formDueDate, setFormDueDate] = useState('Tomorrow');
  const [formAssigneeId, setFormAssigneeId] = useState('');
  const [formTags, setFormTags] = useState('HR Workflow');

  // Voice-to-Text Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [listeningTarget, setListeningTarget] = useState<'title' | 'description' | 'voice-modal' | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceSpeechText, setVoiceSpeechText] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceParsedInfo, setVoiceParsedInfo] = useState<{
    detectedCategory?: string;
    detectedPriority?: 'urgent' | 'high' | 'medium' | 'low';
    detectedAssignee?: Employee;
    detectedDueDate?: string;
  } | null>(null);
  const recognitionRef = useRef<any>(null);

  const isSpeechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Stop speech recognition when unmounting
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore cleanup error
        }
      }
    };
  }, []);

  // Parse spoken text to intelligently detect attributes
  const parseSpokenTask = (spokenText: string) => {
    const lower = spokenText.toLowerCase();
    
    // Detect Priority
    let priority: 'urgent' | 'high' | 'medium' | 'low' = 'medium';
    if (lower.includes('urgent') || lower.includes('emergency') || lower.includes('critical')) {
      priority = 'urgent';
    } else if (lower.includes('high priority') || lower.includes('high') || lower.includes('important')) {
      priority = 'high';
    } else if (lower.includes('low priority') || lower.includes('low') || lower.includes('minor')) {
      priority = 'low';
    }

    // Detect Category
    let category = 'General';
    const catList = ['Leave', 'Performance', 'Payroll', 'Recruitment', 'Engineering', 'Design', 'Onboarding', 'Compliance'];
    for (const cat of catList) {
      if (lower.includes(cat.toLowerCase())) {
        category = cat;
        break;
      }
    }

    // Detect Due Date
    let dueDate = 'Tomorrow';
    if (lower.includes('today') || lower.includes('tonight')) {
      dueDate = 'Today';
    } else if (lower.includes('friday')) {
      dueDate = 'Friday';
    } else if (lower.includes('next week')) {
      dueDate = 'Next Week';
    } else if (lower.includes('month') || lower.includes('end of month')) {
      dueDate = 'End of Month';
    }

    // Detect Assignee
    let matchedAssignee: Employee | undefined = undefined;
    for (const emp of employees) {
      const firstName = emp.name.split(' ')[0].toLowerCase();
      const lastName = emp.name.split(' ').slice(1).join(' ').toLowerCase();
      if (lower.includes(emp.name.toLowerCase()) || (firstName.length > 2 && lower.includes(firstName)) || (lastName.length > 2 && lower.includes(lastName))) {
        matchedAssignee = emp;
        break;
      }
    }

    setVoiceParsedInfo({
      detectedCategory: category,
      detectedPriority: priority,
      detectedAssignee: matchedAssignee,
      detectedDueDate: dueDate
    });
  };

  const startVoiceListening = (target: 'title' | 'description' | 'voice-modal') => {
    setVoiceError(null);
    if (!isSpeechSupported) {
      setVoiceError('Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setListeningTarget(target);
        if (target === 'voice-modal') {
          setIsVoiceModalOpen(true);
          setVoiceSpeechText('');
          setVoiceParsedInfo(null);
        }
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }

        if (target === 'title') {
          setFormTitle(currentTranscript.trim());
        } else if (target === 'description') {
          setFormDescription(currentTranscript.trim());
        } else if (target === 'voice-modal') {
          setVoiceSpeechText(currentTranscript.trim());
          parseSpokenTask(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission was denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          // No speech detected, keep listening
        } else {
          setVoiceError(`Voice input: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setListeningTarget(null);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setVoiceError(err?.message || 'Failed to initialize voice recognition.');
      setIsListening(false);
      setListeningTarget(null);
    }
  };

  const stopVoiceListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
    setListeningTarget(null);
  };

  const handleApplyVoiceToTask = () => {
    if (!voiceSpeechText.trim()) return;

    // Apply speech text to form
    const sentences = voiceSpeechText.split(/[.!?]\s+/);
    const titleCandidate = sentences[0] || voiceSpeechText;
    const descCandidate = sentences.slice(1).join('. ') || voiceSpeechText;

    setFormTitle(titleCandidate.trim());
    setFormDescription(descCandidate.trim());

    if (voiceParsedInfo) {
      if (voiceParsedInfo.detectedCategory) {
        setFormCategory(voiceParsedInfo.detectedCategory);
      }
      if (voiceParsedInfo.detectedPriority) {
        setFormPriority(voiceParsedInfo.detectedPriority);
      }
      if (voiceParsedInfo.detectedDueDate) {
        setFormDueDate(voiceParsedInfo.detectedDueDate);
      }
      if (voiceParsedInfo.detectedAssignee) {
        setFormAssigneeId(voiceParsedInfo.detectedAssignee.id);
      }
    }

    setIsVoiceModalOpen(false);
    setIsAssignModalOpen(true);
    stopVoiceListening();
  };

  // Categories list
  const categories = ['All', 'Leave', 'Performance', 'Payroll', 'Recruitment', 'Engineering', 'Design', 'Onboarding', 'Compliance', 'General'];
  const departments = ['All', 'Design', 'Engineering', 'Marketing', 'HR', 'Finance', 'Operations', 'Sales'];

  // Check role-based assignment eligibility for assignee dropdown:
  // - Admin can assign to Managers and Employees
  // - Manager can assign to Employees only
  // - Employee cannot assign tasks
  const eligibleAssignees = employees.filter(emp => {
    // Determine whether employee is manager or regular employee
    const isManager = emp.designation.includes('VP') || emp.designation.includes('Lead') || emp.designation.includes('Officer') || emp.designation.includes('Director') || emp.designation.includes('CTO');
    
    if (userRole === 'admin') {
      return true; // Admin can assign to everyone
    }
    if (userRole === 'manager') {
      // Manager can assign tasks to Employees only (not other managers or admins)
      return !isManager && emp.id !== currentUser.id;
    }
    return false;
  });

  // Filter tasks strictly according to user permissions:
  // - Admin can view and manage all tasks across the organization.
  // - Manager can view their own assigned tasks and tasks of employees under them / in their department.
  // - Employee can view and update only their own assigned tasks.
  const accessibleTasks = tasks.filter(task => {
    if (userRole === 'admin') return true;
    if (userRole === 'manager') {
      const isAssignedToMe = task.assignedTo?.id === currentUser.id || task.assignedTo?.name === currentUser.name;
      const isAssignedByMe = task.assignedBy?.id === currentUser.id || task.assignedBy?.name === currentUser.name;
      const isInMyDept = task.department === currentUser.department || task.assignedTo?.department === currentUser.department;
      return isAssignedToMe || isAssignedByMe || isInMyDept;
    }
    if (userRole === 'employee') {
      // Employee can view only their own assigned tasks
      return task.assignedTo?.id === currentUser.id || task.assignedTo?.name === currentUser.name;
    }
    return false;
  });

  // Apply tab filters
  const tabFilteredTasks = accessibleTasks.filter(task => {
    if (activeTab === 'assigned-to-me') {
      return task.assignedTo?.id === currentUser.id || task.assignedTo?.name === currentUser.name;
    }
    if (activeTab === 'assigned-by-me') {
      return task.assignedBy?.id === currentUser.id || task.assignedBy?.name === currentUser.name;
    }
    if (activeTab === 'in-progress') {
      return !task.completed && (task.status === 'In Progress' || task.status === 'Under Review');
    }
    if (activeTab === 'completed') {
      return task.completed || task.status === 'Completed';
    }
    return true;
  });

  // Apply search and category / priority / department dropdown filters
  const filteredTasks = tabFilteredTasks.filter(task => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchAssignee = task.assignedTo?.name.toLowerCase().includes(q);
      const matchCategory = task.category?.toLowerCase().includes(q);
      const matchTags = task.tags?.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchAssignee && !matchCategory && !matchTags) return false;
    }
    // Category
    if (selectedCategory !== 'All' && (task.category || 'General').toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    // Priority
    if (selectedPriority !== 'All' && (task.priority || 'medium').toLowerCase() !== selectedPriority.toLowerCase()) {
      return false;
    }
    // Department
    if (selectedDepartment !== 'All' && (task.department || task.assignedTo?.department || '').toLowerCase() !== selectedDepartment.toLowerCase()) {
      return false;
    }
    return true;
  });

  // Sort tasks: pinned first, then by priority, then by completed status
  const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const aP = priorityWeight[a.priority || 'medium'] || 2;
    const bP = priorityWeight[b.priority || 'medium'] || 2;
    return bP - aP;
  });

  // Metrics
  const totalInScope = accessibleTasks.length;
  const completedInScope = accessibleTasks.filter(t => t.completed || t.status === 'Completed').length;
  const inProgressInScope = accessibleTasks.filter(t => !t.completed && (t.status === 'In Progress' || t.status === 'Under Review')).length;
  const urgentInScope = accessibleTasks.filter(t => !t.completed && (t.priority === 'urgent' || t.priority === 'high')).length;
  const completionRate = totalInScope > 0 ? Math.round((completedInScope / totalInScope) * 100) : 0;

  // --------------------------------------------------------------------------
  // ROLE-PERMITTED RECHARTS DASHBOARD ANALYTICS CALCULATIONS
  // --------------------------------------------------------------------------
  // 1. Department Completion Rates (Filtered strictly by role permissions)
  const departmentStatsMap: Record<string, { total: number; completed: number; inProgress: number; urgent: number }> = {};
  accessibleTasks.forEach(task => {
    const dept = task.department || task.assignedTo?.department || 'Operations';
    if (!departmentStatsMap[dept]) {
      departmentStatsMap[dept] = { total: 0, completed: 0, inProgress: 0, urgent: 0 };
    }
    departmentStatsMap[dept].total += 1;
    if (task.completed || task.status === 'Completed') {
      departmentStatsMap[dept].completed += 1;
    } else if (task.status === 'In Progress' || task.status === 'Under Review') {
      departmentStatsMap[dept].inProgress += 1;
    }
    if (!task.completed && (task.priority === 'urgent' || task.priority === 'high')) {
      departmentStatsMap[dept].urgent += 1;
    }
  });

  const departmentCompletionChartData = Object.keys(departmentStatsMap).map(dept => {
    const stat = departmentStatsMap[dept];
    const rate = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
    return {
      department: dept,
      rate,
      completed: stat.completed,
      pending: stat.total - stat.completed,
      inProgress: stat.inProgress,
      total: stat.total,
      urgent: stat.urgent
    };
  }).sort((a, b) => b.rate - a.rate);

  // 2. Employee Completion Rates (Filtered strictly by role permissions and accessible tasks)
  const employeeStatsMap: Record<string, {
    empId: string;
    name: string;
    role: string;
    department: string;
    avatar?: string;
    total: number;
    completed: number;
    inProgress: number;
    urgent: number;
  }> = {};

  accessibleTasks.forEach(task => {
    const assignee = task.assignedTo;
    const name = assignee?.name || 'Unassigned';
    const empId = assignee?.id || name;
    
    if (!employeeStatsMap[name]) {
      employeeStatsMap[name] = {
        empId,
        name,
        role: assignee?.role || 'Staff Member',
        department: task.department || assignee?.department || 'General',
        avatar: assignee?.avatar,
        total: 0,
        completed: 0,
        inProgress: 0,
        urgent: 0
      };
    }
    employeeStatsMap[name].total += 1;
    if (task.completed || task.status === 'Completed') {
      employeeStatsMap[name].completed += 1;
    } else if (task.status === 'In Progress' || task.status === 'Under Review') {
      employeeStatsMap[name].inProgress += 1;
    }
    if (!task.completed && (task.priority === 'urgent' || task.priority === 'high')) {
      employeeStatsMap[name].urgent += 1;
    }
  });

  const employeeCompletionChartData = Object.values(employeeStatsMap)
    .filter(emp => analyticsTargetDept === 'All' || emp.department.toLowerCase() === analyticsTargetDept.toLowerCase())
    .map(emp => {
      const rate = emp.total > 0 ? Math.round((emp.completed / emp.total) * 100) : 0;
      return {
        name: emp.name.length > 14 ? `${emp.name.split(' ')[0]} ${emp.name.split(' ')[1]?.[0] || ''}.` : emp.name,
        fullName: emp.name,
        department: emp.department,
        role: emp.role,
        avatar: emp.avatar,
        rate,
        completed: emp.completed,
        pending: emp.total - emp.completed,
        inProgress: emp.inProgress,
        total: emp.total,
        urgent: emp.urgent
      };
    })
    .sort((a, b) => b.rate - a.rate);

  // Status Distribution Pie Data
  const statusDistributionData = [
    { name: 'Completed', value: completedInScope, color: '#10b981' },
    { name: 'In Progress', value: inProgressInScope, color: '#3b82f6' },
    { name: 'Pending / Action', value: Math.max(0, totalInScope - completedInScope - inProgressInScope), color: '#a855f7' },
  ].filter(d => d.value > 0);

  // Top performer in current scope
  const topPerformer = employeeCompletionChartData.length > 0 ? employeeCompletionChartData[0] : null;

  // Handle Task Creation Submit
  const handleAssignTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (userRole === 'employee') {
      alert('Permission Denied: Employees cannot assign tasks.');
      return;
    }

    const targetEmp = employees.find(e => e.id === formAssigneeId) || eligibleAssignees[0] || employees[0];
    const isTargetManager = targetEmp.designation.includes('VP') || targetEmp.designation.includes('Lead') || targetEmp.designation.includes('Officer') || targetEmp.designation.includes('Director');

    const newTaskPayload: Partial<TaskItem> = {
      id: `task-${Date.now()}`,
      title: formTitle.trim(),
      description: formDescription.trim() || 'Standard operational task assignment.',
      completed: false,
      status: 'Pending',
      pinned: false,
      priority: formPriority,
      category: formCategory,
      dueDate: formDueDate,
      createdAt: 'Just now',
      department: targetEmp.department || 'Operations',
      assignedTo: {
        id: targetEmp.id,
        name: targetEmp.name,
        role: targetEmp.designation,
        roleType: isTargetManager ? 'manager' : 'employee',
        department: targetEmp.department,
        avatar: targetEmp.avatar
      },
      assignedBy: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        roleType: currentUser.roleType,
        avatar: currentUser.avatar
      },
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean)
    };

    onAddTask(newTaskPayload);
    setIsAssignModalOpen(false);
    setFormTitle('');
    setFormDescription('');
    setFormTags('HR Workflow');
  };

  // Attachment Helper Functions
  const handleStartCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API is not supported on this browser or environment.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(err.message || 'Unable to access camera. Please allow camera permissions.');
    }
  };

  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const handleCaptureCameraPhoto = () => {
    if (!videoRef.current || !selectedTaskForDetails) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const newAtt: TaskAttachment = {
        id: `att-cam-${Date.now()}`,
        name: `camera_snapshot_${new Date().toISOString().slice(0, 10)}.jpg`,
        type: 'image',
        url: dataUrl,
        size: `${Math.round((dataUrl.length * 3) / 4 / 1024)} KB`,
        uploadedAt: 'Just now',
        source: 'camera'
      };

      if (onAddAttachment) {
        onAddAttachment(selectedTaskForDetails.id, newAtt);
      }
      // Update local state directly for responsive feedback
      setSelectedTaskForDetails({
        ...selectedTaskForDetails,
        attachments: [newAtt, ...(selectedTaskForDetails.attachments || [])]
      });
      handleStopCamera();
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.7 } });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedTaskForDetails) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const isImg = file.type.startsWith('image/');
      const isPdf = file.type.includes('pdf');
      const isSpreadsheet = file.type.includes('sheet') || file.type.includes('csv') || file.name.endsWith('.xlsx');
      
      const newAtt: TaskAttachment = {
        id: `att-up-${Date.now()}`,
        name: file.name,
        type: isImg ? 'image' : isPdf ? 'pdf' : isSpreadsheet ? 'spreadsheet' : 'document',
        url: dataUrl,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadedAt: 'Just now',
        source: 'upload'
      };

      if (onAddAttachment) {
        onAddAttachment(selectedTaskForDetails.id, newAtt);
      }
      setSelectedTaskForDetails({
        ...selectedTaskForDetails,
        attachments: [newAtt, ...(selectedTaskForDetails.attachments || [])]
      });
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.7 } });
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleGeneratePlaceholderVisual = () => {
    if (!selectedTaskForDetails) return;
    setIsGeneratingVisual(true);

    // Curated high quality professional placeholder visuals based on task category
    const visualLibrary = [
      {
        name: 'task_architecture_blueprint.png',
        url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80',
        size: '1.8 MB',
        type: 'image' as const
      },
      {
        name: 'compliance_audit_summary.png',
        url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
        size: '1.2 MB',
        type: 'image' as const
      },
      {
        name: 'ui_spec_wireframes.png',
        url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
        size: '2.4 MB',
        type: 'image' as const
      },
      {
        name: 'employee_review_matrix.png',
        url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80',
        size: '1.5 MB',
        type: 'image' as const
      }
    ];

    setTimeout(() => {
      const selected = visualLibrary[Math.floor(Math.random() * visualLibrary.length)];
      const newAtt: TaskAttachment = {
        id: `att-gen-${Date.now()}`,
        name: selected.name,
        type: selected.type,
        url: selected.url,
        size: selected.size,
        uploadedAt: 'Just now',
        source: 'generated'
      };

      if (onAddAttachment) {
        onAddAttachment(selectedTaskForDetails.id, newAtt);
      }
      setSelectedTaskForDetails({
        ...selectedTaskForDetails,
        attachments: [newAtt, ...(selectedTaskForDetails.attachments || [])]
      });
      setIsGeneratingVisual(false);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }, 450);
  };

  const handleRemoveTaskAttachment = (attId: string) => {
    if (!selectedTaskForDetails) return;
    if (onRemoveAttachment) {
      onRemoveAttachment(selectedTaskForDetails.id, attId);
    }
    setSelectedTaskForDetails({
      ...selectedTaskForDetails,
      attachments: (selectedTaskForDetails.attachments || []).filter(a => a.id !== attId)
    });
  };

  // Status Change Handler with fallback
  const handleStatusChange = (taskId: string, newStatus: TaskItem['status']) => {
    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(taskId, newStatus);
    } else {
      if (newStatus === 'Completed') {
        const task = tasks.find(t => t.id === taskId);
        if (task && !task.completed) {
          onToggleTask(taskId);
        }
      } else {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.completed) {
          onToggleTask(taskId);
        }
      }
    }
    if (newStatus === 'Completed') {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    }
  };

  const getPriorityBadgeClass = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'low':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  const getStatusBadgeClass = (status?: string, completed?: boolean) => {
    if (completed || status === 'Completed') {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
    if (status === 'In Progress') {
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
    if (status === 'Under Review') {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
    return 'bg-white/5 text-slate-300 border-white/10';
  };

  return (
    <div id="task-management-module" className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Module Header & Role Permissions Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/30 ring-1 ring-white/20">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-white tracking-tight font-['Sora']">Task Management</h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Role-Governed
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Enterprise workflow assignment, delegation, and completion tracking with hierarchical role permissions.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Voice Create Task Button */}
          {userRole !== 'employee' && (
            <button
              id="btn-voice-create-task"
              onClick={() => {
                if (eligibleAssignees.length > 0 && !formAssigneeId) {
                  setFormAssigneeId(eligibleAssignees[0].id);
                }
                startVoiceListening('voice-modal');
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/[0.05] hover:bg-purple-600/20 text-purple-200 border border-purple-500/30 hover:border-purple-500/60 shadow-md transition-all cursor-pointer group"
              title="Speak to create and assign tasks via voice"
            >
              <Mic className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span>Voice Task Creator</span>
            </button>
          )}

          {/* Assign Task Button (Allowed for Admin & Manager, Hidden/Disabled for Employee) */}
          {userRole !== 'employee' ? (
            <button
              id="btn-assign-new-task"
              onClick={() => {
                if (eligibleAssignees.length > 0) {
                  setFormAssigneeId(eligibleAssignees[0].id);
                }
                setIsAssignModalOpen(true);
              }}
              className="brand-gradient-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Assign New Task</span>
            </button>
          ) : (
            <div 
              title="Employees have read & update access to their own tasks and cannot assign new tasks"
              className="px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 cursor-not-allowed"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Employee Scope (Read & Update Only)</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Role Governance Information Banner */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-gradient-to-r from-purple-950/20 via-[#131b2e] to-indigo-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">
                Viewing as {currentUser.name}
              </span>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {String(userRole || 'admin').toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {userRole === 'admin' && 'Full Administrative Access: Admin can assign tasks to Managers & Employees, and manage all organization tasks.'}
              {userRole === 'manager' && `Department Scope (${currentUser.department || 'Design'}): Manager can assign tasks to Employees only and view department tasks.`}
              {userRole === 'employee' && 'Individual Scope: Employee cannot assign tasks; can view and update their own assigned tasks.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <span className="text-[11px] text-slate-400">Total in Scope:</span>
          <span className="text-xs font-bold text-white font-['Sora'] px-2 py-0.5 rounded bg-white/10">
            {totalInScope} Tasks
          </span>
        </div>
      </div>

      {/* 3. Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Tasks in Scope</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white font-['Sora']">{totalInScope}</p>
            <span className="text-[11px] text-purple-300">
              {userRole === 'admin' ? 'Company-wide' : userRole === 'manager' ? 'Dept & Assigned' : 'Assigned to Me'}
            </span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(100, totalInScope * 12)}%` }} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Completion Rate</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-emerald-400 font-['Sora']">{completionRate}%</p>
            <span className="text-[11px] text-slate-400">
              {completedInScope} of {totalInScope} resolved
            </span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">In Progress / Pending</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-blue-400 font-['Sora']">{inProgressInScope}</p>
            <span className="text-[11px] text-slate-400">Active workflows</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${totalInScope > 0 ? (inProgressInScope / totalInScope) * 100 : 0}%` }} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Urgent & High Priority</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-rose-400 font-['Sora']">{urgentInScope}</p>
            <span className="text-[11px] text-rose-300">Requires attention</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${totalInScope > 0 ? (urgentInScope / totalInScope) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* 3.5 DASHBOARD SUMMARY SECTION: RECHARTS TASK COMPLETION VISUALIZER */}
      <div id="task-dashboard-summary-recharts" className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 relative overflow-hidden">
        {/* Header with Title, Role Scoping Tag & Collapse / Metric Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white font-['Sora']">Task Completion Analytics Summary</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-indigo-400" />
                  {userRole === 'admin' && 'Organization Scope (All Units)'}
                  {userRole === 'manager' && `${currentUser.department || 'Department'} & Assigned Scope`}
                  {userRole === 'employee' && 'Personal Scope (Self)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time completion rates visualized across {departmentCompletionChartData.length} departments and {employeeCompletionChartData.length} team members within your role permission boundaries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {/* Metric Mode Toggle (Rate % vs Volume Count) */}
            <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5 text-xs">
              <button
                id="btn-metric-mode-rate"
                onClick={() => setAnalyticsMetricMode('rate')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  analyticsMetricMode === 'rate'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Completion Rate (%)
              </button>
              <button
                id="btn-metric-mode-counts"
                onClick={() => setAnalyticsMetricMode('counts')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  analyticsMetricMode === 'counts'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Task Volume
              </button>
            </div>

            {/* Department Filter for Employee Chart */}
            {userRole !== 'employee' && departments.length > 1 && (
              <div className="flex items-center gap-1 bg-white/[0.03] px-2.5 py-1 rounded-xl border border-white/5 text-xs">
                <Building2 className="w-3 h-3 text-purple-400 shrink-0" />
                <span className="text-[11px] text-slate-400 font-medium hidden md:inline">Dept:</span>
                <select
                  id="select-analytics-dept"
                  value={analyticsTargetDept}
                  onChange={(e) => setAnalyticsTargetDept(e.target.value)}
                  className="bg-transparent text-xs text-purple-200 font-semibold focus:outline-none cursor-pointer pr-1"
                >
                  <option value="All" className="bg-[#131b2e] text-slate-200">All Depts</option>
                  {departments.filter(d => d !== 'All').map(d => (
                    <option key={d} value={d} className="bg-[#131b2e] text-slate-200">{d}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Toggle Panel Expand/Collapse */}
            <button
              id="btn-toggle-analytics-summary"
              onClick={() => setShowAnalyticsSummary(!showAnalyticsSummary)}
              className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-all cursor-pointer border border-white/5"
              title={showAnalyticsSummary ? 'Collapse Analytics' : 'Expand Analytics'}
            >
              {showAnalyticsSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {showAnalyticsSummary && (
          <div className="space-y-5">
            {/* Top Quick Telemetry Metric Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Target className="w-3 h-3 text-purple-400" /> Target Benchmark
                </span>
                <p className="text-lg font-bold text-white mt-1 font-['Sora']">85% Target</p>
                <span className={`text-[10px] font-semibold flex items-center gap-0.5 mt-0.5 ${
                  completionRate >= 85 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  <TrendingUp className="w-2.5 h-2.5" />
                  {completionRate >= 85 ? 'Optimal SLA Achieved' : `${85 - completionRate}% to Target`}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-indigo-400" /> Top Performing Dept
                </span>
                <p className="text-lg font-bold text-indigo-300 mt-1 font-['Sora'] truncate">
                  {departmentCompletionChartData[0]?.department || 'N/A'}
                </p>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {departmentCompletionChartData[0] ? `${departmentCompletionChartData[0].rate}% Completed` : 'No tasks in scope'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" /> Top Individual Contributor
                </span>
                <p className="text-lg font-bold text-white mt-1 font-['Sora'] truncate">
                  {topPerformer ? topPerformer.fullName : 'N/A'}
                </p>
                <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                  {topPerformer ? `${topPerformer.rate}% (${topPerformer.completed}/${topPerformer.total} Done)` : 'No data'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" /> Status Resolution
                </span>
                <p className="text-lg font-bold text-emerald-400 mt-1 font-['Sora']">
                  {completedInScope} <span className="text-xs text-slate-400 font-normal">/ {totalInScope} Total</span>
                </p>
                <span className="text-[10px] text-purple-300 block mt-0.5">
                  {inProgressInScope} Active In-Flight
                </span>
              </div>
            </div>

            {/* Main Charts Grid: Department Completion Rates + Employee Completion Rates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* CHART 1: Completion Rates By Department */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white">Department Completion Rates</span>
                  </div>
                  <span className="text-[10px] text-purple-300 font-semibold bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                    {departmentCompletionChartData.length} Departments
                  </span>
                </div>

                {departmentCompletionChartData.length === 0 ? (
                  <div className="h-56 flex items-center justify-center text-xs text-slate-400">
                    No department task data available in current role scope.
                  </div>
                ) : (
                  <div className="h-60 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={departmentCompletionChartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                          dataKey="department" 
                          stroke="#64748b" 
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                          domain={analyticsMetricMode === 'rate' ? [0, 100] : [0, 'auto']}
                          tickFormatter={(val) => analyticsMetricMode === 'rate' ? `${val}%` : val}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-[#131b2e] p-3 rounded-xl border border-white/10 shadow-xl text-xs space-y-1.5 min-w-[170px]">
                                  <div className="flex items-center gap-1.5 font-bold text-white border-b border-white/10 pb-1">
                                    <Building2 className="w-3.5 h-3.5 text-purple-400" />
                                    <span>{data.department}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-0.5">
                                    <span>Completion Rate:</span>
                                    <span className="font-bold text-emerald-400 font-['Sora']">{data.rate}%</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                                    <span>Completed Tasks:</span>
                                    <span className="font-bold text-white">{data.completed}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                                    <span>In Progress / Pending:</span>
                                    <span className="font-bold text-amber-300">{data.pending}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                                    <span>Total Assigned:</span>
                                    <span className="font-bold text-purple-300">{data.total}</span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        {analyticsMetricMode === 'rate' && (
                          <ReferenceLine 
                            y={85} 
                            stroke="#10b981" 
                            strokeDasharray="4 4" 
                            label={{ value: 'Target 85%', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} 
                          />
                        )}
                        {analyticsMetricMode === 'rate' ? (
                          <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                            {departmentCompletionChartData.map((entry, index) => (
                              <Cell 
                                key={`cell-dept-${index}`} 
                                fill={entry.rate >= 80 ? '#10b981' : entry.rate >= 50 ? '#8b5cf6' : '#f59e0b'} 
                              />
                            ))}
                          </Bar>
                        ) : (
                          <>
                            <Bar dataKey="completed" name="Completed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="pending" name="In Progress / Pending" stackId="a" fill="#6366f1" radius={[6, 6, 0, 0]} />
                          </>
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Micro Department Rate Badges */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {departmentCompletionChartData.map((d) => (
                    <div 
                      key={d.department}
                      className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-1.5"
                    >
                      <span className="text-slate-400">{d.department}:</span>
                      <span className={`font-bold font-['Sora'] ${
                        d.rate >= 80 ? 'text-emerald-400' : d.rate >= 50 ? 'text-purple-300' : 'text-amber-400'
                      }`}>
                        {d.rate}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CHART 2: Completion Rates By Employee (Role-Permitted) */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">Employee Completion Rates</span>
                  </div>
                  <span className="text-[10px] text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    {employeeCompletionChartData.length} Assignees
                  </span>
                </div>

                {employeeCompletionChartData.length === 0 ? (
                  <div className="h-56 flex items-center justify-center text-xs text-slate-400">
                    No employee task assignments found in current scope.
                  </div>
                ) : (
                  <div className="h-60 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={employeeCompletionChartData}
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis 
                          type="number"
                          stroke="#64748b" 
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                          domain={analyticsMetricMode === 'rate' ? [0, 100] : [0, 'auto']}
                          tickFormatter={(val) => analyticsMetricMode === 'rate' ? `${val}%` : val}
                        />
                        <YAxis 
                          dataKey="name" 
                          type="category"
                          stroke="#94a3b8" 
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                          width={85}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-[#131b2e] p-3 rounded-xl border border-white/10 shadow-xl text-xs space-y-1.5 min-w-[190px]">
                                  <div className="flex items-center gap-2 border-b border-white/10 pb-1.5">
                                    {data.avatar ? (
                                      <img src={data.avatar} alt={data.fullName} className="w-5 h-5 rounded-full object-cover" />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[10px] text-white font-bold">
                                        {data.fullName.charAt(0)}
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="font-bold text-white truncate">{data.fullName}</p>
                                      <p className="text-[10px] text-slate-400">{data.department} • {data.role}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-0.5">
                                    <span>Completion Rate:</span>
                                    <span className="font-bold text-emerald-400 font-['Sora']">{data.rate}%</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                                    <span>Completed / Total:</span>
                                    <span className="font-bold text-white">{data.completed} of {data.total}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                                    <span>In-Flight Workflows:</span>
                                    <span className="font-bold text-blue-400">{data.inProgress}</span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        {analyticsMetricMode === 'rate' && (
                          <ReferenceLine 
                            x={85} 
                            stroke="#10b981" 
                            strokeDasharray="4 4" 
                            label={{ value: '85%', fill: '#10b981', fontSize: 10, position: 'insideBottomRight' }} 
                          />
                        )}
                        {analyticsMetricMode === 'rate' ? (
                          <Bar dataKey="rate" radius={[0, 6, 6, 0]}>
                            {employeeCompletionChartData.map((entry, index) => (
                              <Cell 
                                key={`cell-emp-${index}`} 
                                fill={entry.rate >= 80 ? '#10b981' : entry.rate >= 50 ? '#6366f1' : '#f43f5e'} 
                              />
                            ))}
                          </Bar>
                        ) : (
                          <>
                            <Bar dataKey="completed" name="Completed" stackId="b" fill="#10b981" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="pending" name="In Progress" stackId="b" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                          </>
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Employee Performance Mini-Tags */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {employeeCompletionChartData.slice(0, 4).map((emp) => (
                    <div 
                      key={emp.fullName}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-1"
                    >
                      <span className="text-slate-300">{emp.name}:</span>
                      <span className="font-bold text-emerald-400 font-['Sora']">{emp.rate}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Filter Toolbar & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3">
        {/* Top row: Tab selector + Layout Toggle + Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Scope Tabs */}
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
            <button
              id="tab-tasks-all"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {userRole === 'admin' ? 'All Organization Tasks' : userRole === 'manager' ? 'All Department Tasks' : 'All My Tasks'}
            </button>

            {userRole !== 'employee' && (
              <button
                id="tab-tasks-assigned-by-me"
                onClick={() => setActiveTab('assigned-by-me')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'assigned-by-me'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Assigned By Me
              </button>
            )}

            <button
              id="tab-tasks-assigned-to-me"
              onClick={() => setActiveTab('assigned-to-me')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'assigned-to-me'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Assigned To Me
            </button>

            <button
              id="tab-tasks-in-progress"
              onClick={() => setActiveTab('in-progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'in-progress'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              In Progress
            </button>

            <button
              id="tab-tasks-completed"
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Completed ({completedInScope})
            </button>
          </div>

          {/* Right Controls: Search + Board/List switch */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="input-task-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks, assignees, tags..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
              <button
                id="btn-layout-list"
                onClick={() => setViewMode('list')}
                title="List View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
              </button>
              <button
                id="btn-layout-board"
                onClick={() => setViewMode('board')}
                title="Kanban Board View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'board' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom row: Category Pills & Dropdown Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-white/5">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-purple-400" /> Category:
            </span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  id={`btn-cat-filter-${cat.toLowerCase()}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-sm'
                      : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Priority & Dept Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority Filter */}
            <div className="flex items-center gap-1 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/5 text-xs">
              <span className="text-[11px] text-slate-400">Priority:</span>
              <select
                id="select-filter-priority"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-transparent text-xs text-purple-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-[#131b2e] text-slate-300">All</option>
                <option value="urgent" className="bg-[#131b2e] text-rose-300">Urgent</option>
                <option value="high" className="bg-[#131b2e] text-amber-300">High</option>
                <option value="medium" className="bg-[#131b2e] text-purple-300">Medium</option>
                <option value="low" className="bg-[#131b2e] text-slate-400">Low</option>
              </select>
            </div>

            {/* Department Filter (Visible for Admin & Manager) */}
            {userRole !== 'employee' && (
              <div className="flex items-center gap-1 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/5 text-xs">
                <span className="text-[11px] text-slate-400">Dept:</span>
                <select
                  id="select-filter-department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="bg-transparent text-xs text-purple-200 font-semibold focus:outline-none cursor-pointer"
                >
                  {departments.map(d => (
                    <option key={d} value={d} className="bg-[#131b2e] text-slate-300">{d}</option>
                  ))}
                </select>
              </div>
            )}

            {(selectedCategory !== 'All' || selectedPriority !== 'All' || selectedDepartment !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedPriority('All');
                  setSelectedDepartment('All');
                  setSearchQuery('');
                }}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline px-1.5 cursor-pointer"
              >
                Reset Filters
              </button>
            )}

            {userRole !== 'employee' && tasks.length > 0 && onClearAllTasks && (
              <button
                id="btn-clear-all-tasks"
                type="button"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to remove ALL ${tasks.length} tasks permanently from the database?`)) {
                    onClearAllTasks();
                  }
                }}
                className="text-[11px] text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer ml-auto"
                title="Permanently remove all tasks"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All Tasks</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Main Task Content: List View vs Kanban Board View */}
      {viewMode === 'list' ? (
        <div className="space-y-2.5">
          {sortedTasks.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-white/5 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">No Tasks Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {userRole === 'employee'
                  ? 'You currently have no tasks matching this filter. Once assigned by an Admin or Manager, they will appear here.'
                  : 'No tasks match your active filter criteria. Use the "Assign New Task" button above to delegate new tasks.'}
              </p>
              {userRole !== 'employee' && (
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="brand-gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Assign a Task
                </button>
              )}
            </div>
          ) : (
            sortedTasks.map((task) => {
              const isAssignedToCurrent = task.assignedTo?.id === currentUser.id || task.assignedTo?.name === currentUser.name;
              const isAssignedByCurrent = task.assignedBy?.id === currentUser.id || task.assignedBy?.name === currentUser.name;
              const canEditStatus = userRole === 'admin' || isAssignedToCurrent || isAssignedByCurrent;
              const canDelete = userRole === 'admin' || (userRole === 'manager' && isAssignedByCurrent);

              return (
                <div
                  key={task.id}
                  id={`task-row-${task.id}`}
                  className={`glass-panel p-4 rounded-2xl border transition-all hover:border-purple-500/30 group ${
                    task.completed
                      ? 'bg-white/[0.01] border-white/5 opacity-75'
                      : task.pinned
                      ? 'bg-purple-950/10 border-purple-500/30'
                      : 'border-white/5 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Checkbox + Title + Description + Tags */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Checkbox */}
                      <button
                        id={`btn-check-task-${task.id}`}
                        onClick={() => onToggleTask(task.id)}
                        title={task.completed ? 'Mark as incomplete' : 'Mark as completed'}
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 mt-0.5 cursor-pointer ${
                          task.completed
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                            : 'border border-white/20 hover:border-purple-400 bg-white/5'
                        }`}
                      >
                        {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 
                            onClick={() => setSelectedTaskForDetails(task)}
                            className={`text-xs sm:text-sm font-semibold cursor-pointer transition-colors hover:text-purple-300 ${
                              task.completed ? 'line-through text-slate-500' : 'text-white'
                            }`}
                          >
                            {task.title}
                          </h4>

                          {task.pinned && (
                            <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5">
                              <Pin className="w-2.5 h-2.5 fill-purple-300" /> Pinned
                            </span>
                          )}

                          {/* Priority Badge */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getPriorityBadgeClass(task.priority)}`}>
                            {task.priority || 'medium'}
                          </span>

                          {/* Category Badge */}
                          {task.category && (
                            <button
                              onClick={() => setSelectedCategory(task.category || 'General')}
                              className="text-[10px] text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                            >
                              {task.category}
                            </button>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {task.description}
                          </p>
                        )}

                        {/* Assignee & Assigner Information Badges */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap pt-0.5">
                          {/* Assignee info */}
                          {task.assignedTo && (
                            <div className="flex items-center gap-1.5 bg-white/[0.03] px-2 py-0.5 rounded-lg border border-white/5">
                              {task.assignedTo.avatar ? (
                                <img
                                  src={task.assignedTo.avatar}
                                  alt={task.assignedTo.name}
                                  className="w-4 h-4 rounded-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] flex items-center justify-center">
                                  {task.assignedTo.name.charAt(0)}
                                </div>
                              )}
                              <span className="text-slate-300 font-medium">To: {task.assignedTo.name}</span>
                              <span className="text-[10px] text-purple-300">({task.assignedTo.department})</span>
                            </div>
                          )}

                          {/* Assigner info */}
                          {task.assignedBy && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <span>By:</span>
                              <span className="text-slate-400 font-medium">{task.assignedBy.name}</span>
                              <span className="text-[10px] text-slate-500">({task.assignedBy.roleType})</span>
                            </div>
                          )}

                          {/* Due date */}
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-slate-400">
                              <Calendar className="w-3 h-3 text-purple-400" />
                              <span>Due: {task.dueDate}</span>
                            </div>
                          )}

                          {/* Attachments Indicator Badge */}
                          {task.attachments && task.attachments.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedTaskForDetails(task)}
                              className="flex items-center gap-1 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 px-2 py-0.5 rounded-md font-medium text-[10px] cursor-pointer"
                              title={`${task.attachments.length} attached documents / photos`}
                            >
                              <Paperclip className="w-2.5 h-2.5" />
                              <span>{task.attachments.length}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Actions: Status Dropdown + Pin + Delete */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {/* Status Selector */}
                      {canEditStatus ? (
                        <select
                          id={`select-status-${task.id}`}
                          value={task.completed ? 'Completed' : task.status || 'Pending'}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as any)}
                          className={`text-xs font-bold rounded-xl px-2.5 py-1 border focus:outline-none cursor-pointer transition-all ${getStatusBadgeClass(task.status, task.completed)}`}
                        >
                          <option value="Pending" className="bg-[#131b2e] text-slate-300">Pending</option>
                          <option value="In Progress" className="bg-[#131b2e] text-blue-300">In Progress</option>
                          <option value="Under Review" className="bg-[#131b2e] text-amber-300">Under Review</option>
                          <option value="Completed" className="bg-[#131b2e] text-emerald-300">Completed</option>
                        </select>
                      ) : (
                        <span className={`text-xs font-bold rounded-xl px-2.5 py-1 border ${getStatusBadgeClass(task.status, task.completed)}`}>
                          {task.completed ? 'Completed' : task.status || 'Pending'}
                        </span>
                      )}

                      {/* Pin button */}
                      <button
                        id={`btn-pin-task-${task.id}`}
                        onClick={() => onTogglePinTask(task.id)}
                        title={task.pinned ? 'Unpin task' : 'Pin task to top'}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          task.pinned
                            ? 'text-purple-400 bg-purple-500/20 border border-purple-500/30'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      {/* Detail View Eye button */}
                      <button
                        id={`btn-detail-task-${task.id}`}
                        onClick={() => setSelectedTaskForDetails(task)}
                        title="View Full Task Details"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Task button */}
                      {(userRole === 'admin' || canDelete) && (
                        <button
                          id={`btn-edit-task-${task.id}`}
                          onClick={() => setEditingTaskModal(task)}
                          title="Edit task"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-purple-300 hover:bg-purple-500/10 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete button (Admin or Assigner only) */}
                      {canDelete && (
                        <button
                          id={`btn-delete-task-${task.id}`}
                          onClick={() => {
                            if (window.confirm(`Delete task "${task.title}"?`)) {
                              onDeleteTask(task.id);
                            }
                          }}
                          title="Delete task"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Pending */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3 bg-white/[0.01]">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="text-xs font-bold text-white">Pending</span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                {sortedTasks.filter(t => !t.completed && (!t.status || t.status === 'Pending')).length}
              </span>
            </div>

            <div className="space-y-2.5">
              {sortedTasks
                .filter(t => !t.completed && (!t.status || t.status === 'Pending'))
                .map(task => (
                  <div 
                    key={task.id}
                    onClick={() => setSelectedTaskForDetails(task)}
                    className="p-3.5 rounded-xl bg-[#131b2e] border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority || 'medium'}
                      </span>
                      <span className="text-[10px] text-slate-400">{task.dueDate}</span>
                    </div>
                    <p className="text-xs font-semibold text-white line-clamp-2">{task.title}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="truncate">To: {task.assignedTo?.name || 'Unassigned'}</span>
                        {task.attachments && task.attachments.length > 0 && (
                          <span className="flex items-center gap-0.5 text-[9px] text-purple-300 bg-purple-500/20 px-1 py-0.2 rounded shrink-0">
                            <Paperclip className="w-2 h-2" />
                            {task.attachments.length}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(task.id, 'In Progress');
                        }}
                        className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-0.5 shrink-0"
                      >
                        Start <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 2: In Progress / Review */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3 bg-white/[0.01]">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span className="text-xs font-bold text-white">In Progress</span>
              </div>
              <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                {sortedTasks.filter(t => !t.completed && (t.status === 'In Progress' || t.status === 'Under Review')).length}
              </span>
            </div>

            <div className="space-y-2.5">
              {sortedTasks
                .filter(t => !t.completed && (t.status === 'In Progress' || t.status === 'Under Review'))
                .map(task => (
                  <div 
                    key={task.id}
                    onClick={() => setSelectedTaskForDetails(task)}
                    className="p-3.5 rounded-xl bg-[#131b2e] border border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority || 'medium'}
                      </span>
                      <span className="text-[10px] text-blue-300">{task.dueDate}</span>
                    </div>
                    <p className="text-xs font-semibold text-white line-clamp-2">{task.title}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                      <span>To: {task.assignedTo?.name || 'Unassigned'}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(task.id, 'Completed');
                        }}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5"
                      >
                        Complete <Check className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3 bg-white/[0.01]">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-white">Completed</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {sortedTasks.filter(t => t.completed || t.status === 'Completed').length}
              </span>
            </div>

            <div className="space-y-2.5">
              {sortedTasks
                .filter(t => t.completed || t.status === 'Completed')
                .map(task => (
                  <div 
                    key={task.id}
                    onClick={() => setSelectedTaskForDetails(task)}
                    className="p-3.5 rounded-xl bg-[#131b2e]/60 border border-emerald-500/20 hover:border-emerald-500/40 opacity-80 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Resolved
                      </span>
                      <span className="text-[10px] text-slate-500">{task.dueDate}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-300 line-through line-clamp-2">{task.title}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5">
                      <span>Done by {task.assignedTo?.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. ASSIGN NEW TASK MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 bg-[#131b2e] shadow-2xl p-6 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Assign New Task</h3>
                  <p className="text-[11px] text-slate-400">
                    {userRole === 'admin' 
                      ? 'Admin Scope: Can assign tasks to Managers and Employees' 
                      : 'Manager Scope: Can assign tasks to Employees only'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAssignTaskSubmit} className="space-y-4">
              {/* Task Title with Voice Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    Task Title <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (isListening && listeningTarget === 'title') {
                        stopVoiceListening();
                      } else {
                        startVoiceListening('title');
                      }
                    }}
                    className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                      isListening && listeningTarget === 'title'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : 'bg-white/5 text-purple-300 border-white/10 hover:border-purple-500/30'
                    }`}
                    title="Speak to dictate task title"
                  >
                    <Mic className="w-3 h-3 text-purple-400" />
                    <span>{isListening && listeningTarget === 'title' ? 'Listening...' : 'Voice Dictate'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="modal-input-task-title"
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g., Audit Q2 employee compliance certifications"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Task Description with Voice Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Detailed Instructions / Objective
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (isListening && listeningTarget === 'description') {
                        stopVoiceListening();
                      } else {
                        startVoiceListening('description');
                      }
                    }}
                    className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                      isListening && listeningTarget === 'description'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : 'bg-white/5 text-purple-300 border-white/10 hover:border-purple-500/30'
                    }`}
                    title="Speak to dictate detailed instructions"
                  >
                    <Mic className="w-3 h-3 text-purple-400" />
                    <span>{isListening && listeningTarget === 'description' ? 'Listening...' : 'Voice Dictate'}</span>
                  </button>
                </div>
                <textarea
                  id="modal-input-task-description"
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Outline key deliverables, dependencies, or sign-off criteria..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Assignee Selector (Enforcing Role Governance) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Assign To (Eligible Workforce) <span className="text-rose-400">*</span></span>
                  <span className="text-[10px] text-purple-400">
                    {userRole === 'manager' ? 'Employees Only' : 'Managers & Employees'}
                  </span>
                </label>
                <select
                  id="modal-select-task-assignee"
                  required
                  value={formAssigneeId}
                  onChange={(e) => setFormAssigneeId(e.target.value)}
                  className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {eligibleAssignees.map(emp => {
                    const isMgr = emp.designation.includes('VP') || emp.designation.includes('Lead') || emp.designation.includes('Officer');
                    return (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} — {emp.designation} ({emp.department}) {isMgr ? '[Manager]' : '[Employee]'}
                      </option>
                    );
                  })}
                </select>
                {userRole === 'manager' && (
                  <p className="text-[10px] text-slate-500">
                    Rule enforced: As a Manager, you can delegate tasks to Employees only.
                  </p>
                )}
              </div>

              {/* Category, Priority & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    id="modal-select-task-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="General">General</option>
                    <option value="Leave">Leave</option>
                    <option value="Performance">Performance</option>
                    <option value="Payroll">Payroll</option>
                    <option value="Recruitment">Recruitment</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Design">Design</option>
                    <option value="Engineering">Engineering</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Priority</label>
                  <select
                    id="modal-select-task-priority"
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Due Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Due Date</label>
                  <select
                    id="modal-select-task-duedate"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Today">Today</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="Friday">This Friday</option>
                    <option value="Next Week">Next Week</option>
                    <option value="End of Month">End of Month</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="e.g. Audit, Priority, Compliance"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  id="btn-modal-submit-task"
                  type="submit"
                  className="brand-gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  Confirm & Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. TASK DETAILS DRAWER / MODAL */}
      {selectedTaskForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 bg-[#131b2e] shadow-2xl p-6 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getPriorityBadgeClass(selectedTaskForDetails.priority)}`}>
                    {selectedTaskForDetails.priority || 'medium'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(selectedTaskForDetails.status, selectedTaskForDetails.completed)}`}>
                    {selectedTaskForDetails.completed ? 'Completed' : selectedTaskForDetails.status || 'Pending'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedTaskForDetails.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTaskForDetails(null)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-4 text-xs">
              {/* Description */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400">Description / Scope</span>
                <p className="text-slate-200 leading-relaxed">
                  {selectedTaskForDetails.description || 'No additional notes provided for this task.'}
                </p>
              </div>

              {/* Assignment Information Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Assignee */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Assigned To</span>
                  {selectedTaskForDetails.assignedTo ? (
                    <div className="flex items-center gap-2">
                      {selectedTaskForDetails.assignedTo.avatar && (
                        <img 
                          src={selectedTaskForDetails.assignedTo.avatar} 
                          alt="" 
                          className="w-6 h-6 rounded-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div>
                        <p className="text-xs font-bold text-white">{selectedTaskForDetails.assignedTo.name}</p>
                        <p className="text-[10px] text-purple-300">{selectedTaskForDetails.assignedTo.role}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400">Unassigned</p>
                  )}
                </div>

                {/* Assigner */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Assigned By</span>
                  {selectedTaskForDetails.assignedBy ? (
                    <div>
                      <p className="text-xs font-bold text-white">{selectedTaskForDetails.assignedBy.name}</p>
                      <p className="text-[10px] text-slate-400">{selectedTaskForDetails.assignedBy.role}</p>
                    </div>
                  ) : (
                    <p className="text-slate-400">System Admin</p>
                  )}
                </div>
              </div>

              {/* Due Date & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase">Due Date</span>
                  <p className="text-xs font-bold text-white mt-0.5">{selectedTaskForDetails.dueDate || 'Flexible'}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase">Category</span>
                  <p className="text-xs font-bold text-purple-300 mt-0.5">{selectedTaskForDetails.category || 'General'}</p>
                </div>
              </div>

              {/* Tags */}
              {selectedTaskForDetails.tags && selectedTaskForDetails.tags.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">Workflow Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTaskForDetails.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 📎 FILE ATTACHMENTS & VISUAL ARTIFACTS SECTION */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white">Attachments & Documents</span>
                  </div>
                  <span className="text-[10px] text-purple-300 font-semibold bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                    {(selectedTaskForDetails.attachments || []).length} Attached
                  </span>
                </div>

                {/* Attachment Action Buttons: Upload File, Camera Photo, AI Placeholder Visual */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* 1. Upload Local File/Image */}
                  <button
                    id="btn-task-upload-file"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-all cursor-pointer group"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span>Upload File</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* 2. Take Camera Photo */}
                  <button
                    id="btn-task-open-camera"
                    type="button"
                    onClick={isCameraActive ? handleStopCamera : handleStartCamera}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer group ${
                      isCameraActive 
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
                    }`}
                  >
                    <Camera className={`w-3.5 h-3.5 ${isCameraActive ? 'text-rose-400 animate-pulse' : 'text-emerald-400'} group-hover:scale-110 transition-transform`} />
                    <span>{isCameraActive ? 'Close Camera' : 'Camera Photo'}</span>
                  </button>

                  {/* 3. Generate Mock Visual / Document Placeholder */}
                  <button
                    id="btn-task-generate-visual"
                    type="button"
                    disabled={isGeneratingVisual}
                    onClick={handleGeneratePlaceholderVisual}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 border border-purple-500/20 text-xs font-medium transition-all cursor-pointer group disabled:opacity-50"
                  >
                    <Wand2 className={`w-3.5 h-3.5 text-purple-400 ${isGeneratingVisual ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform`} />
                    <span>{isGeneratingVisual ? 'Generating...' : 'Add Visual'}</span>
                  </button>
                </div>

                {/* Real-time Camera Viewport Drawer */}
                {isCameraActive && (
                  <div className="p-3 rounded-2xl bg-black/60 border border-purple-500/30 space-y-3 animate-in fade-in zoom-in-95">
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-white/10">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] text-emerald-400 font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        LIVE CAMERA
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <button
                        id="btn-task-capture-photo"
                        type="button"
                        onClick={handleCaptureCameraPhoto}
                        className="flex-1 brand-gradient-btn py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Snap & Attach Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleStopCamera}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Camera Permission or Error Warning */}
                {cameraError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <VideoOff className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{cameraError}</span>
                    </div>
                    <button 
                      onClick={() => setCameraError(null)} 
                      className="text-rose-400 hover:text-white p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Attached Files List */}
                {(!selectedTaskForDetails.attachments || selectedTaskForDetails.attachments.length === 0) ? (
                  <div className="py-4 text-center rounded-xl bg-white/[0.01] border border-dashed border-white/10">
                    <p className="text-[11px] text-slate-400">No attachments linked to this task yet.</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Use the buttons above to upload files, take photos, or generate visuals.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {selectedTaskForDetails.attachments.map((att) => {
                      const isImg = att.type === 'image';
                      return (
                        <div
                          key={att.id}
                          className="group relative p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-purple-500/30 transition-all flex flex-col justify-between"
                        >
                          {/* Image preview or Document Icon */}
                          <div className="flex items-start gap-2.5">
                            {isImg ? (
                              <div 
                                onClick={() => setPreviewAttachmentUrl(att.url)}
                                className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0 cursor-pointer relative group/img"
                              >
                                <img
                                  src={att.url}
                                  alt={att.name}
                                  className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                  <Eye className="w-3.5 h-3.5 text-white" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-300">
                                {att.type === 'pdf' ? (
                                  <FileText className="w-5 h-5 text-rose-400" />
                                ) : att.type === 'spreadsheet' ? (
                                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                                ) : (
                                  <FileText className="w-5 h-5 text-blue-400" />
                                )}
                              </div>
                            )}

                            {/* Details */}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-white truncate group-hover:text-purple-200 transition-colors" title={att.name}>
                                {att.name}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                                <span>{att.size || '1.0 MB'}</span>
                                <span>•</span>
                                <span className="capitalize">{att.source || 'file'}</span>
                              </div>
                              <span className="text-[9px] text-slate-500 block mt-0.5">{att.uploadedAt}</span>
                            </div>
                          </div>

                          {/* Quick Action Footer inside Card */}
                          <div className="flex items-center justify-end gap-1.5 pt-2 mt-2 border-t border-white/5">
                            {isImg && (
                              <button
                                type="button"
                                onClick={() => setPreviewAttachmentUrl(att.url)}
                                className="p-1 rounded-md text-slate-400 hover:text-purple-300 hover:bg-white/5 text-[10px] flex items-center gap-1"
                                title="View full visual"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View</span>
                              </button>
                            )}
                            <a
                              href={att.url}
                              download={att.name}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-md text-slate-400 hover:text-emerald-300 hover:bg-white/5 text-[10px] flex items-center gap-1"
                              title="Download or open link"
                            >
                              <Download className="w-3 h-3" />
                              <span>Open</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveTaskAttachment(att.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-[10px] flex items-center gap-1 transition-colors"
                              title="Delete attachment"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status Update Quick Action */}
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                <span className="text-xs font-bold text-white">Update Status</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {(['Pending', 'In Progress', 'Under Review', 'Completed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        handleStatusChange(selectedTaskForDetails.id, st);
                        setSelectedTaskForDetails({ ...selectedTaskForDetails, status: st, completed: st === 'Completed' });
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        (selectedTaskForDetails.completed && st === 'Completed') || (!selectedTaskForDetails.completed && selectedTaskForDetails.status === st)
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                {userRole !== 'employee' && (
                  <button
                    type="button"
                    onClick={() => {
                      const taskToEdit = selectedTaskForDetails;
                      handleStopCamera();
                      setSelectedTaskForDetails(null);
                      setEditingTaskModal(taskToEdit);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Task</span>
                  </button>
                )}
                {userRole !== 'employee' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete task "${selectedTaskForDetails.title}"?`)) {
                        const id = selectedTaskForDetails.id;
                        handleStopCamera();
                        setSelectedTaskForDetails(null);
                        onDeleteTask(id);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  handleStopCamera();
                  setSelectedTaskForDetails(null);
                }}
                className="brand-gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. ATTACHMENT LIGHTBOX MODAL */}
      {previewAttachmentUrl && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setPreviewAttachmentUrl(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-[#131b2e] rounded-2xl p-3 border border-white/15 shadow-2xl space-y-3 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                Image Preview
              </span>
              <button
                onClick={() => setPreviewAttachmentUrl(null)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black/50 border border-white/10 max-h-[70vh] flex items-center justify-center">
              <img
                src={previewAttachmentUrl}
                alt="Attachment preview"
                className="max-h-[68vh] w-auto max-w-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <a
                href={previewAttachmentUrl}
                download="task_attachment_visual.jpg"
                target="_blank"
                rel="noreferrer"
                className="brand-gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Full Image</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 8. VOICE-TO-TEXT TASK CREATOR MODAL */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-purple-500/30 bg-[#131b2e] shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Mic className={`w-5 h-5 ${isListening ? 'text-rose-400 animate-pulse' : 'text-purple-300'}`} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Voice Task Creator</span>
                    {isListening && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                        LIVE RECORDING
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Speak clearly to dictate task title, description, priority, category & assignee.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopVoiceListening();
                  setIsVoiceModalOpen(false);
                }}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visualizer & Mic Control */}
            <div className="flex flex-col items-center justify-center py-6 px-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 text-center">
              <button
                type="button"
                onClick={() => {
                  if (isListening) {
                    stopVoiceListening();
                  } else {
                    startVoiceListening('voice-modal');
                  }
                }}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                  isListening
                    ? 'bg-rose-500 text-white shadow-rose-500/40 scale-105 ring-8 ring-rose-500/20'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/40 ring-4 ring-purple-500/20'
                }`}
                title={isListening ? 'Click to pause/stop' : 'Click to start recording'}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8 animate-pulse" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>

              <div>
                <p className="text-xs font-semibold text-white">
                  {isListening ? 'Listening to your voice...' : 'Tap the microphone to start speaking'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Try saying: &quot;Audit quarterly cybersecurity logs, high priority, assigned to Ayon due Friday&quot;
                </p>
              </div>

              {/* Dynamic Audio Equalizer Simulation when active */}
              {isListening && (
                <div className="flex items-center gap-1 h-5 pt-1">
                  {[40, 75, 100, 60, 90, 45, 80, 55, 95, 70, 85, 40].map((h, i) => (
                    <span
                      key={i}
                      style={{ height: `${h}%` }}
                      className="w-1 bg-gradient-to-t from-purple-500 to-rose-400 rounded-full animate-bounce"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Live Transcript Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Spoken Transcript</span>
                {voiceSpeechText && (
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceSpeechText('');
                      setVoiceParsedInfo(null);
                    }}
                    className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    Clear Text
                  </button>
                )}
              </label>
              <div className="min-h-[70px] max-h-[120px] overflow-y-auto p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white leading-relaxed">
                {voiceSpeechText ? (
                  <span>{voiceSpeechText}</span>
                ) : (
                  <span className="text-slate-500 italic">
                    Spoken words will appear here in real-time...
                  </span>
                )}
              </div>
            </div>

            {/* Auto-Detected Metadata Pills */}
            {voiceParsedInfo && (
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-Detected Task Attributes
                </span>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {voiceParsedInfo.detectedPriority && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getPriorityBadgeClass(voiceParsedInfo.detectedPriority)}`}>
                      Priority: {voiceParsedInfo.detectedPriority}
                    </span>
                  )}
                  {voiceParsedInfo.detectedCategory && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Category: {voiceParsedInfo.detectedCategory}
                    </span>
                  )}
                  {voiceParsedInfo.detectedDueDate && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Due: {voiceParsedInfo.detectedDueDate}
                    </span>
                  )}
                  {voiceParsedInfo.detectedAssignee && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Assignee: {voiceParsedInfo.detectedAssignee.name}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Error Message if any */}
            {voiceError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{voiceError}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  stopVoiceListening();
                  setIsVoiceModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-apply-voice-task"
                disabled={!voiceSpeechText.trim()}
                onClick={handleApplyVoiceToTask}
                className="brand-gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply to Task & Review</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 9. EDIT TASK MODAL */}
      {editingTaskModal && (
        <EditTaskModal
          task={editingTaskModal}
          employees={employees}
          eligibleAssignees={eligibleAssignees}
          onClose={() => setEditingTaskModal(null)}
          onSave={(updated) => {
            if (onEditTask) {
              onEditTask(updated);
            } else {
              onAddTask(updated);
            }
            setEditingTaskModal(null);
          }}
        />
      )}
    </div>
  );
};

interface EditTaskModalProps {
  task: TaskItem;
  employees: Employee[];
  eligibleAssignees: Employee[];
  onClose: () => void;
  onSave: (task: TaskItem) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  employees,
  eligibleAssignees,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [assigneeId, setAssigneeId] = useState(task.assignedTo?.id || (employees[0]?.id ?? ''));
  const [category, setCategory] = useState(task.category || 'General');
  const [priority, setPriority] = useState<TaskItem['priority']>(task.priority || 'medium');
  const [dueDate, setDueDate] = useState(task.dueDate || 'Flexible');
  const [status, setStatus] = useState<TaskItem['status']>(task.status || (task.completed ? 'Completed' : 'Pending'));
  const [tags, setTags] = useState((task.tags || []).join(', '));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedEmp = employees.find(e => e.id === assigneeId || e.empId === assigneeId);
    const updatedTask: TaskItem = {
      ...task,
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      dueDate,
      status,
      completed: status === 'Completed',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      assignedTo: assignedEmp ? {
        id: assignedEmp.id,
        name: assignedEmp.name,
        role: assignedEmp.designation,
        avatar: assignedEmp.avatar
      } : task.assignedTo
    };

    onSave(updatedTask);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 bg-[#131b2e] shadow-2xl p-6 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Task</h3>
              <p className="text-[11px] text-slate-400">Modify task attributes, status, and assignment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Assign To</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {eligibleAssignees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.designation} ({emp.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="General">General</option>
                <option value="Leave">Leave</option>
                <option value="Performance">Performance</option>
                <option value="Payroll">Payroll</option>
                <option value="Recruitment">Recruitment</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Compliance">Compliance</option>
                <option value="Design">Design</option>
                <option value="Engineering">Engineering</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Under Review">Under Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Due Date</label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="e.g. Tomorrow, This Friday, 2026-09-10"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tags (comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. Audit, Priority, Compliance"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="brand-gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
