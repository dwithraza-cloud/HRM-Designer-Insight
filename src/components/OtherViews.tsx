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
  Sparkles,
  Search,
  Edit2,
  Trash2,
  X,
  Building2,
  DollarSign,
  AlertCircle,
  Tag,
  Upload,
  Calendar,
  Layers,
  Filter
} from 'lucide-react';
import { ViewMode, UserProfile, Employee, AssetItem, DocumentItem } from '../types';

interface OtherViewsProps {
  view: ViewMode;
  onNavigate: (view: ViewMode) => void;
  currentUser: UserProfile;
  employees: Employee[];
  assets: AssetItem[];
  onAddAsset: (asset: AssetItem) => void;
  onEditAsset: (asset: AssetItem) => void;
  onDeleteAsset: (id: string) => void;
  documents: DocumentItem[];
  onAddDocument: (doc: DocumentItem) => void;
  onEditDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (id: string) => void;
  showToast?: (msg: string) => void;
}

export const OtherViews: React.FC<OtherViewsProps> = ({ 
  view, 
  onNavigate,
  currentUser,
  employees,
  assets,
  onAddAsset,
  onEditAsset,
  onDeleteAsset,
  documents,
  onAddDocument,
  onEditDocument,
  onDeleteDocument,
  showToast
}) => {
  // === ASSET MANAGEMENT STATE ===
  const [assetSearch, setAssetSearch] = useState('');
  const [assetCategoryFilter, setAssetCategoryFilter] = useState('All');
  const [assetStatusFilter, setAssetStatusFilter] = useState('All');
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);

  // Asset Form State
  const [assetName, setAssetName] = useState('');
  const [assetSerial, setAssetSerial] = useState('');
  const [assetCategory, setAssetCategory] = useState<AssetItem['category']>('Laptop');
  const [assetValuePkr, setAssetValuePkr] = useState<number>(350000);
  const [assetAssignedEmpId, setAssetAssignedEmpId] = useState<string>('none');
  const [assetPurchaseDate, setAssetPurchaseDate] = useState('15 Jan 2024');
  const [assetStatus, setAssetStatus] = useState<AssetItem['status']>('Allocated');
  const [assetSpecs, setAssetSpecs] = useState('');

  // === DOCUMENT MANAGEMENT STATE ===
  const [docSearch, setDocSearch] = useState('');
  const [docTagFilter, setDocTagFilter] = useState('All');
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  // Document Form State
  const [docName, setDocName] = useState('');
  const [docTag, setDocTag] = useState<DocumentItem['tag']>('Policy');
  const [docSize, setDocSize] = useState('2.4 MB');
  const [docFormat, setDocFormat] = useState('PDF');
  const [docDescription, setDocDescription] = useState('');
  const [docRestricted, setDocRestricted] = useState<DocumentItem['restrictedTo']>('all');

  const isAdmin = currentUser.roleType === 'admin';
  const isManager = currentUser.roleType === 'manager';
  const canManageDocuments = isAdmin || isManager;

  // ==========================================
  // 1. ASSET MANAGEMENT VIEW
  // ==========================================
  if (view === 'assets') {
    const totalAssetValuation = assets.reduce((acc, a) => acc + (a.valuePkr || 0), 0);
    const allocatedCount = assets.filter(a => a.status === 'Allocated').length;
    const availableCount = assets.filter(a => a.status === 'Available').length;

    const filteredAssets = assets.filter(a => {
      const matchSearch = a.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
        a.serialNumber.toLowerCase().includes(assetSearch.toLowerCase()) ||
        (a.assignedTo?.name && a.assignedTo.name.toLowerCase().includes(assetSearch.toLowerCase()));
      const matchCategory = assetCategoryFilter === 'All' || a.category === assetCategoryFilter;
      const matchStatus = assetStatusFilter === 'All' || a.status === assetStatusFilter;
      return matchSearch && matchCategory && matchStatus;
    });

    const handleOpenAddAsset = () => {
      if (!isAdmin) {
        if (showToast) showToast('⚠️ Access Denied (403): Only Admins can register company assets.');
        return;
      }
      setAssetName('');
      setAssetSerial(`AST-${Math.floor(1000 + Math.random() * 9000)}`);
      setAssetCategory('Laptop');
      setAssetValuePkr(350000);
      setAssetAssignedEmpId('none');
      setAssetPurchaseDate('15 May 2025');
      setAssetStatus('Available');
      setAssetSpecs('');
      setShowAddAssetModal(true);
    };

    const handleOpenEditAsset = (asset: AssetItem) => {
      if (!isAdmin) {
        if (showToast) showToast('⚠️ Access Denied (403): Only Admins can modify asset records.');
        return;
      }
      setEditingAsset(asset);
      setAssetName(asset.name);
      setAssetSerial(asset.serialNumber);
      setAssetCategory(asset.category);
      setAssetValuePkr(asset.valuePkr);
      setAssetAssignedEmpId(asset.assignedTo ? asset.assignedTo.empId : 'none');
      setAssetPurchaseDate(asset.purchaseDate);
      setAssetStatus(asset.status);
      setAssetSpecs(asset.specs || '');
    };

    const handleSaveAsset = (e: React.FormEvent) => {
      e.preventDefault();
      if (!isAdmin) {
        if (showToast) showToast('⚠️ Access Denied (403): Unauthorized operation.');
        return;
      }

      const assignedEmp = assetAssignedEmpId !== 'none' 
        ? employees.find(emp => emp.empId === assetAssignedEmpId)
        : undefined;

      const assignedObj = assignedEmp ? {
        id: assignedEmp.id,
        name: assignedEmp.name,
        empId: assignedEmp.empId,
        department: assignedEmp.department,
        avatar: assignedEmp.avatar
      } : undefined;

      if (editingAsset) {
        const updated: AssetItem = {
          ...editingAsset,
          name: assetName.trim(),
          serialNumber: assetSerial.trim(),
          category: assetCategory,
          valuePkr: Number(assetValuePkr),
          assignedTo: assignedObj,
          purchaseDate: assetPurchaseDate,
          status: assetStatus,
          specs: assetSpecs.trim()
        };
        onEditAsset(updated);
        setEditingAsset(null);
      } else {
        const newAsset: AssetItem = {
          id: `ast-${Date.now()}`,
          name: assetName.trim(),
          serialNumber: assetSerial.trim(),
          category: assetCategory,
          valuePkr: Number(assetValuePkr),
          assignedTo: assignedObj,
          purchaseDate: assetPurchaseDate,
          status: assignedObj ? 'Allocated' : assetStatus,
          specs: assetSpecs.trim()
        };
        onAddAsset(newAsset);
        setShowAddAssetModal(false);
      }
    };

    const handleConfirmDeleteAsset = (id: string) => {
      if (!isAdmin) {
        if (showToast) showToast('⚠️ Access Denied (403): Only Admins can delete asset records.');
        return;
      }
      onDeleteAsset(id);
      setDeletingAssetId(null);
    };

    return (
      <div id="assets-view" className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight font-['Sora']">Asset Management</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Hardware & Inventory (PKR)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Track hardware items, workstations, peripherals, and security keys in Pakistani Rupees (Rs.).
            </p>
          </div>

          {isAdmin && (
            <button 
              id="btn-add-asset"
              onClick={handleOpenAddAsset}
              className="brand-gradient-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Hardware Asset</span>
            </button>
          )}
        </div>

        {/* 4 Asset KPI Tiles in PKR */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Total Asset Valuation</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <HardDrive className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white font-['Sora']">
              Rs. {totalAssetValuation.toLocaleString()} <span className="text-xs font-normal text-purple-300">PKR</span>
            </p>
            <p className="text-[11px] text-purple-400 font-medium">Enterprise inventory</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Allocated Assets</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-['Sora']">{allocatedCount}</p>
            <p className="text-[11px] text-emerald-400 font-medium">Assigned to staff</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Available in Stock</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Laptop className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-['Sora']">{availableCount}</p>
            <p className="text-[11px] text-blue-300 font-medium">Ready for immediate rollout</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Hardware 2FA Security</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-['Sora']">100%</p>
            <p className="text-[11px] text-amber-300 font-medium">YubiKey enforced</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search asset name, serial number, or assignee..."
              value={assetSearch}
              onChange={(e) => setAssetSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={assetCategoryFilter}
              onChange={(e) => setAssetCategoryFilter(e.target.value)}
              className="bg-[#131b2e] border border-white/10 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Laptop">Laptops</option>
              <option value="Display">Displays</option>
              <option value="Security">Security Keys</option>
              <option value="Furniture">Furniture</option>
              <option value="Peripheral">Peripherals</option>
            </select>

            <select
              value={assetStatusFilter}
              onChange={(e) => setAssetStatusFilter(e.target.value)}
              className="bg-[#131b2e] border border-white/10 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="All">All Status</option>
              <option value="Allocated">Allocated</option>
              <option value="Available">Available</option>
              <option value="In Repair">In Repair</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>

        {/* Asset Register Table */}
        <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-['Sora']">Asset Register</h2>
            <span className="text-xs text-slate-400 font-medium">Showing {filteredAssets.length} of {assets.length} items</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 uppercase text-[11px] font-bold">
                  <th className="pb-3">Asset Details</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Serial No</th>
                  <th className="pb-3">Value (PKR)</th>
                  <th className="pb-3">Assigned To</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/25 shrink-0">
                          {asset.category === 'Laptop' ? <Laptop className="w-4 h-4" /> : <HardDrive className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-white">{asset.name}</p>
                          <p className="text-[11px] text-slate-400">{asset.specs || 'Standard enterprise configuration'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-300">{asset.category}</td>
                    <td className="py-3.5 font-mono text-slate-400">{asset.serialNumber}</td>
                    <td className="py-3.5 font-mono font-bold text-white">
                      Rs. {asset.valuePkr.toLocaleString()}
                    </td>
                    <td className="py-3.5">
                      {asset.assignedTo ? (
                        <div className="flex items-center gap-2">
                          {asset.assignedTo.avatar ? (
                            <img src={asset.assignedTo.avatar} alt={asset.assignedTo.name} className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-[10px] flex items-center justify-center font-bold">
                              {asset.assignedTo.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">{asset.assignedTo.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{asset.assignedTo.empId}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned (In Vault)</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        asset.status === 'Allocated'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : asset.status === 'Available'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {/* Admin RBAC Edit and Delete Actions */}
                      {isAdmin ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-edit-asset-${asset.id}`}
                            onClick={() => handleOpenEditAsset(asset)}
                            title="Edit Asset"
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-asset-${asset.id}`}
                            onClick={() => setDeletingAssetId(asset.id)}
                            title="Delete Asset"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">View only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Asset Modal */}
        {(showAddAssetModal || editingAsset) && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 max-w-lg w-full space-y-5 bg-[#131b2e] shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white font-['Sora']">
                    {editingAsset ? 'Edit Asset Record' : 'Register New Hardware Asset'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Specify hardware specifications, serial code, and PKR valuation
                  </p>
                </div>
                <button 
                  onClick={() => { setShowAddAssetModal(false); setEditingAsset(null); }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAsset} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Asset Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MacBook Pro 16 M3 Max"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Serial Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. APL-MBP-9921"
                      value={assetSerial}
                      onChange={(e) => setAssetSerial(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Category</label>
                    <select
                      value={assetCategory}
                      onChange={(e) => setAssetCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="Laptop">Laptop</option>
                      <option value="Display">Display</option>
                      <option value="Security">Security Key</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Peripheral">Peripheral</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Asset Value (Rs. / PKR) *</label>
                    <input
                      type="number"
                      required
                      placeholder="350000"
                      value={assetValuePkr}
                      onChange={(e) => setAssetValuePkr(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Assign to Employee</label>
                    <select
                      value={assetAssignedEmpId}
                      onChange={(e) => setAssetAssignedEmpId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="none">-- Unassigned (In Storage) --</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.empId}>
                          {emp.name} ({emp.empId}) - {emp.department}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Purchase Date</label>
                    <input
                      type="text"
                      placeholder="e.g. 15 Jan 2024"
                      value={assetPurchaseDate}
                      onChange={(e) => setAssetPurchaseDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Status</label>
                    <select
                      value={assetStatus}
                      onChange={(e) => setAssetStatus(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="Allocated">Allocated</option>
                      <option value="Available">Available</option>
                      <option value="In Repair">In Repair</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Hardware Specifications</label>
                  <textarea
                    rows={2}
                    value={assetSpecs}
                    onChange={(e) => setAssetSpecs(e.target.value)}
                    placeholder="M3 Max, 64GB RAM, 2TB SSD, 16-inch Liquid Retina XDR..."
                    className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => { setShowAddAssetModal(false); setEditingAsset(null); }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] text-slate-300 hover:bg-white/[0.1]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="brand-gradient-btn px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-purple-600/30 cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingAsset ? 'Save Asset' : 'Register Asset'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Asset Modal */}
        {deletingAssetId && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 max-w-sm w-full space-y-4 bg-[#131b2e] shadow-2xl">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white font-['Sora']">Delete Asset?</h3>
              </div>
              <p className="text-xs text-slate-300">
                Are you sure you want to delete this hardware asset record? Inventory counts will be updated.
              </p>
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  onClick={() => setDeletingAssetId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] text-slate-300 hover:bg-white/[0.1]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmDeleteAsset(deletingAssetId)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 cursor-pointer"
                >
                  Delete Asset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 2. DOCUMENT MANAGEMENT VIEW
  // ==========================================
  if (view === 'documents') {
    const filteredDocs = documents.filter(d => {
      const matchSearch = d.name.toLowerCase().includes(docSearch.toLowerCase()) ||
        (d.description && d.description.toLowerCase().includes(docSearch.toLowerCase()));
      const matchTag = docTagFilter === 'All' || d.tag === docTagFilter;
      return matchSearch && matchTag;
    });

    const handleOpenAddDoc = () => {
      if (!canManageDocuments) {
        if (showToast) showToast('⚠️ Access Denied (403): Only Admins and Managers can upload official documents.');
        return;
      }
      setDocName('');
      setDocTag('Policy');
      setDocSize('3.2 MB');
      setDocFormat('PDF');
      setDocDescription('');
      setDocRestricted('all');
      setShowAddDocModal(true);
    };

    const handleOpenEditDoc = (doc: DocumentItem) => {
      if (!canManageDocuments) {
        if (showToast) showToast('⚠️ Access Denied (403): Only Admins and Managers can edit document records.');
        return;
      }
      setEditingDoc(doc);
      setDocName(doc.name);
      setDocTag(doc.tag);
      setDocSize(doc.size);
      setDocFormat(doc.fileFormat);
      setDocDescription(doc.description || '');
      setDocRestricted(doc.restrictedTo || 'all');
    };

    const handleSaveDoc = (e: React.FormEvent) => {
      e.preventDefault();
      if (!canManageDocuments) {
        if (showToast) showToast('⚠️ Access Denied (403): Unauthorized operation.');
        return;
      }
      if (!docName.trim()) {
        if (showToast) showToast('Please enter a document title.');
        return;
      }

      if (editingDoc) {
        const updated: DocumentItem = {
          ...editingDoc,
          name: docName.trim(),
          tag: docTag,
          description: docDescription.trim(),
          restrictedTo: docRestricted
        };
        onEditDocument(updated);
        setEditingDoc(null);
      } else {
        const newDoc: DocumentItem = {
          id: `doc-${Date.now()}`,
          name: docName.trim().endsWith(`.${docFormat.toLowerCase()}`) ? docName.trim() : `${docName.trim()}.${docFormat.toLowerCase()}`,
          tag: docTag,
          size: docSize,
          updated: 'Just now',
          fileFormat: docFormat,
          description: docDescription.trim() || 'Official company document.',
          uploadedBy: currentUser.name,
          restrictedTo: docRestricted,
          downloadCount: 1
        };
        onAddDocument(newDoc);
        setShowAddDocModal(false);
      }
    };

    const handleConfirmDeleteDoc = (id: string) => {
      if (!canManageDocuments) {
        if (showToast) showToast('⚠️ Access Denied (403): Only Admins and Managers can delete document records.');
        return;
      }
      onDeleteDocument(id);
      setDeletingDocId(null);
    };

    return (
      <div id="documents-view" className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight font-['Sora']">Document Management</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {documents.length} Files Stored
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Central repository for HR policies, benefits handbooks, tax compliance forms, and legal agreements.
            </p>
          </div>

          {canManageDocuments && (
            <button 
              id="btn-upload-document"
              onClick={handleOpenAddDoc}
              className="brand-gradient-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          )}
        </div>

        {/* Search & Category Pills */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search document name or keywords..."
              value={docSearch}
              onChange={(e) => setDocSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Policy', 'Legal', 'Benefits', 'Workplace', 'Tax'].map((tag) => (
              <button
                key={tag}
                onClick={() => setDocTagFilter(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  docTagFilter === tag
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div 
              key={doc.id} 
              className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 hover:border-purple-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/25">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 text-purple-300 px-2.5 py-1 rounded-full border border-white/10">
                      {doc.tag}
                    </span>
                    {canManageDocuments && (
                      <div className="flex items-center gap-1">
                        <button
                          id={`btn-edit-doc-${doc.id}`}
                          onClick={() => handleOpenEditDoc(doc)}
                          title="Edit Document"
                          className="p-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          id={`btn-delete-doc-${doc.id}`}
                          onClick={() => setDeletingDocId(doc.id)}
                          title="Delete Document"
                          className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{doc.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{doc.description || 'Verified enterprise policy file.'}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-3 font-mono">
                  <span>{doc.size}</span>
                  <span>•</span>
                  <span>{doc.fileFormat}</span>
                  <span>•</span>
                  <span>Updated {doc.updated}</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  if (showToast) showToast(`📥 Downloading "${doc.name}"...`);
                }}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span>Download File</span>
              </button>
            </div>
          ))}
        </div>

        {/* Add / Edit Document Modal */}
        {(showAddDocModal || editingDoc) && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 max-w-md w-full space-y-5 bg-[#131b2e] shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white font-['Sora']">
                    {editingDoc ? 'Edit Document Metadata' : 'Upload New Document'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage classification, description, and visibility permissions
                  </p>
                </div>
                <button 
                  onClick={() => { setShowAddDocModal(false); setEditingDoc(null); }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveDoc} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Document Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Employee Code of Conduct 2025"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Category Tag</label>
                    <select
                      value={docTag}
                      onChange={(e) => setDocTag(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="Policy">Policy</option>
                      <option value="Legal">Legal</option>
                      <option value="Benefits">Benefits</option>
                      <option value="Workplace">Workplace</option>
                      <option value="Tax">Tax</option>
                      <option value="Compliance">Compliance</option>
                      <option value="Technical">Technical</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Format</label>
                    <select
                      value={docFormat}
                      onChange={(e) => setDocFormat(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#0b1326] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="PDF">PDF</option>
                      <option value="DOCX">DOCX</option>
                      <option value="XLSX">XLSX</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Description / Summary</label>
                  <textarea
                    rows={3}
                    value={docDescription}
                    onChange={(e) => setDocDescription(e.target.value)}
                    placeholder="Brief description of the document contents, renewal periods, or targets..."
                    className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => { setShowAddDocModal(false); setEditingDoc(null); }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] text-slate-300 hover:bg-white/[0.1]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="brand-gradient-btn px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-purple-600/30 cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingDoc ? 'Save Changes' : 'Upload File'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Document Modal */}
        {deletingDocId && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 max-w-sm w-full space-y-4 bg-[#131b2e] shadow-2xl">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white font-['Sora']">Delete Document?</h3>
              </div>
              <p className="text-xs text-slate-300">
                Are you sure you want to permanently delete this repository document?
              </p>
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  onClick={() => setDeletingDocId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] text-slate-300 hover:bg-white/[0.1]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmDeleteDoc(deletingDocId)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 cursor-pointer"
                >
                  Delete Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 3. REPORTS & HR ANALYTICS VIEW
  // ==========================================
  if (view === 'reports') {
    return (
      <div id="reports-view" className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight font-['Sora']">Reports & HR Analytics</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Financial Currency: PKR
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Workforce distribution, department compensation analysis (Rs.), retention metrics, and hiring velocity.
            </p>
          </div>

          <button 
            onClick={() => {
              if (showToast) showToast('📥 Executive HR summary report exported.');
            }}
            className="brand-gradient-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 cursor-pointer"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Generate Executive Report</span>
          </button>
        </div>

        {/* 3 Overview Financial Metrics in PKR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <span className="text-xs text-slate-400">Monthly Compensation Run</span>
            <p className="text-2xl font-bold text-white font-['Sora']">
              Rs. 2,865,540 <span className="text-xs font-normal text-purple-300">PKR</span>
            </p>
            <p className="text-[11px] text-emerald-400 font-medium">98.4% on-time disbursement</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <span className="text-xs text-slate-400">Average Salary per Employee</span>
            <p className="text-2xl font-bold text-white font-['Sora']">
              Rs. 185,000 <span className="text-xs font-normal text-slate-400">PKR</span>
            </p>
            <p className="text-[11px] text-blue-300 font-medium">+4.2% competitive market adjustment</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
            <span className="text-xs text-slate-400">Annual Retention Rate</span>
            <p className="text-2xl font-bold text-emerald-400 font-['Sora']">96.8%</p>
            <p className="text-[11px] text-emerald-400 font-medium">+3.2% improvement YoY</p>
          </div>
        </div>

        {/* Department Breakdown Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <h2 className="text-base font-bold text-white font-['Sora']">Department Compensation Budget (PKR)</h2>
            <div className="space-y-3.5 text-xs">
              {[
                { dept: 'Engineering', amount: 'Rs. 1,180,000 PKR', pct: 41, color: 'bg-purple-500' },
                { dept: 'Design & UX', amount: 'Rs. 545,000 PKR', pct: 19, color: 'bg-blue-500' },
                { dept: 'Marketing & Growth', amount: 'Rs. 515,000 PKR', pct: 18, color: 'bg-emerald-500' },
                { dept: 'Operations & HR', amount: 'Rs. 375,000 PKR', pct: 13, color: 'bg-amber-500' },
                { dept: 'Finance & Legal', amount: 'Rs. 250,540 PKR', pct: 9, color: 'bg-rose-500' },
              ].map((d, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">{d.dept}</span>
                    <span className="text-white font-mono font-bold">{d.amount} ({d.pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <h2 className="text-base font-bold text-white font-['Sora']">Workforce Headcount Distribution</h2>
            <div className="space-y-3.5 text-xs">
              {[
                { dept: 'Engineering', count: 520, pct: 41, color: 'bg-purple-500' },
                { dept: 'Design & UX', count: 240, pct: 19, color: 'bg-blue-500' },
                { dept: 'Marketing & Growth', count: 220, pct: 18, color: 'bg-emerald-500' },
                { dept: 'Operations & HR', count: 160, pct: 13, color: 'bg-amber-500' },
                { dept: 'Finance & Legal', count: 108, pct: 9, color: 'bg-rose-500' },
              ].map((d, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">{d.dept}</span>
                    <span className="text-white font-mono font-bold">{d.count} Members ({d.pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 4. SETTINGS & ADMINISTRATION VIEW
  // ==========================================
  return (
    <div id="settings-view" className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight font-['Sora']">
          {view === 'admin' ? 'System Administration & RBAC' : 'System Settings'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure Pakistani Rupee (PKR) monetary standards, authentication policies, role permissions, and company branding.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        {/* Currency Setting Badge */}
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-['Sora']">System Currency Standard</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Default currency: <strong>PKR – Pakistani Rupee (Rs. / PKR)</strong> enforced across all modules.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-purple-300 bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/10">
            PKR (Rs.)
          </span>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-purple-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Security & Role Access Controls
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
                <p className="font-bold text-white">Manual Punch Clock Verification</p>
                <p className="text-slate-400 text-[11px]">Prevent auto-clock-in on login; require explicit employee confirmation timestamp.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-500 rounded" />
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Role-Based Access Enforcement (RBAC)</p>
                <p className="text-slate-400 text-[11px]">Strictly guard Recruitment, Payroll, Assets, and Document CRUD at the logic level.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-500 rounded" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex justify-end">
          <button 
            onClick={() => {
              if (showToast) showToast('✓ System settings updated successfully.');
            }}
            className="brand-gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md shadow-purple-600/30 cursor-pointer"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
