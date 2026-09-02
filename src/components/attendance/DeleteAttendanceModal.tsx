import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { AttendanceRecord } from '../../types';

interface DeleteAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  record: AttendanceRecord | null;
  isDeleting?: boolean;
}

export const DeleteAttendanceModal: React.FC<DeleteAttendanceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  record,
  isDeleting = false
}) => {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-3xl border border-rose-500/20 bg-[#131b2e] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-rose-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Sora']">
                Delete Attendance Record?
              </h2>
              <p className="text-xs text-rose-300/80">Permanent action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Are you sure you want to permanently delete this attendance record for{' '}
            <strong className="text-white font-semibold">{record.employeeName}</strong> on{' '}
            <strong className="text-purple-300 font-mono">{record.displayDate || record.date}</strong>?
          </p>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5 font-mono text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Employee ID:</span>
              <span className="text-white">{record.empId}</span>
            </div>
            <div className="flex justify-between">
              <span>Department:</span>
              <span className="text-white">{record.department}</span>
            </div>
            <div className="flex justify-between">
              <span>Punched In / Out:</span>
              <span className="text-white">{record.clockIn} → {record.clockOut}</span>
            </div>
            <div className="flex justify-between">
              <span>Recorded Status:</span>
              <span className="text-white">{record.status} ({record.totalHrs})</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            This record will be permanently purged from the database and will not return upon page refresh.
          </p>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 shadow-lg shadow-rose-900/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
