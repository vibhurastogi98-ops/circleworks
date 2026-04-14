"use client";

import React, { useState, useEffect } from "react";
import {
  Plus, Search, Filter, Laptop, Monitor, Smartphone, Keyboard, CreditCard, CarFront, Package,
  Trash2, Edit3, X, ChevronDown, AlertTriangle, CheckCircle2, Wrench, Archive,
  UserPlus, RotateCcw, Eye, Hash, DollarSign, Calendar, StickyNote, Box
} from "lucide-react";
import { toast } from "sonner";
import { mockAssets, mockAssetAssignments, ASSET_TYPES, ASSET_STATUSES, ASSET_TYPE_ICONS, type Asset, type AssetType, type AssetStatus } from "@/data/mockAssets";

/* ─── Type Icon Component ───────────────────────────────────────────── */
function AssetTypeIcon({ type, size = 18 }: { type: AssetType; size?: number }) {
  const iconMap: Record<AssetType, React.ReactNode> = {
    'Laptop': <Laptop size={size} />,
    'Monitor': <Monitor size={size} />,
    'Phone': <Smartphone size={size} />,
    'Keyboard': <Keyboard size={size} />,
    'Badge': <CreditCard size={size} />,
    'Parking Pass': <CarFront size={size} />,
    'Other': <Package size={size} />,
  };
  return <>{iconMap[type] || <Package size={size} />}</>;
}

/* ─── Status Badge ──────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: AssetStatus }) {
  const styles: Record<AssetStatus, string> = {
    'Available': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Assigned': 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'In Repair': 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Retired': 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500',
  };
  const icons: Record<AssetStatus, React.ReactNode> = {
    'Available': <CheckCircle2 size={12} />,
    'Assigned': <UserPlus size={12} />,
    'In Repair': <Wrench size={12} />,
    'Retired': <Archive size={12} />,
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
      {icons[status]} {status}
    </span>
  );
}

/* ─── KPI Card ──────────────────────────────────────────────────────── */
function KpiCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────── */
export default function AssetsSettingsPage() {
  // State
  const [assetList, setAssetList] = useState<Asset[]>(mockAssets);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<AssetType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AssetStatus | "all">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Asset | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [detailAsset, setDetailAsset] = useState<Asset | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<AssetType>("Laptop");
  const [formSerial, setFormSerial] = useState("");
  const [formStatus, setFormStatus] = useState<AssetStatus>("Available");
  const [formPurchaseDate, setFormPurchaseDate] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Assign form state
  const [assignEmployee, setAssignEmployee] = useState("");

  // Try to load from API first
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/assets");
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setAssetList(data.map((a: any) => ({
              id: a.id.toString(),
              name: a.name,
              type: a.type || 'Other',
              serialNumber: a.serialNumber || '',
              assignedTo: a.assignedTo || null,
              assignedToId: a.assignedToId || null,
              status: a.status || 'Available',
              purchaseDate: a.purchaseDate || '',
              value: a.value || 0,
              notes: a.notes || '',
            })));
          }
        }
      } catch {
        // fallback to mock data
      }
    })();
  }, []);

  // Filtered list
  const filtered = assetList.filter(a => {
    const matchesSearch = !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.assignedTo && a.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "all" || a.type === typeFilter;
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // KPIs
  const totalAssets = assetList.length;
  const assignedAssets = assetList.filter(a => a.status === "Assigned").length;
  const availableAssets = assetList.filter(a => a.status === "Available").length;
  const totalValue = assetList.reduce((sum, a) => sum + (a.value || 0), 0);

  // Handlers
  const resetForm = () => {
    setFormName("");
    setFormType("Laptop");
    setFormSerial("");
    setFormStatus("Available");
    setFormPurchaseDate("");
    setFormValue("");
    setFormNotes("");
    setEditingAsset(null);
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormName(asset.name);
    setFormType(asset.type);
    setFormSerial(asset.serialNumber);
    setFormStatus(asset.status);
    setFormPurchaseDate(asset.purchaseDate);
    setFormValue(asset.value ? (asset.value / 100).toFixed(2) : "");
    setFormNotes(asset.notes);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Asset name is required");
      return;
    }

    const payload = {
      name: formName,
      type: formType,
      serialNumber: formSerial,
      status: formStatus,
      purchaseDate: formPurchaseDate || null,
      value: formValue ? Math.round(parseFloat(formValue) * 100) : null,
      notes: formNotes,
    };

    try {
      if (editingAsset) {
        // Try API first
        try {
          await fetch(`/api/assets/${editingAsset.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } catch {}

        setAssetList(prev => prev.map(a =>
          a.id === editingAsset.id
            ? { ...a, ...payload, value: payload.value || 0, purchaseDate: payload.purchaseDate || '' }
            : a
        ));
        toast.success("Asset updated");
      } else {
        // Try API first
        let newId = `ast-${Date.now()}`;
        try {
          const res = await fetch("/api/assets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const data = await res.json();
            newId = data.id.toString();
          }
        } catch {}

        const newAsset: Asset = {
          id: newId,
          name: formName,
          type: formType,
          serialNumber: formSerial,
          assignedTo: null,
          assignedToId: null,
          status: formStatus,
          purchaseDate: formPurchaseDate,
          value: payload.value || 0,
          notes: formNotes,
        };
        setAssetList(prev => [newAsset, ...prev]);
        toast.success("Asset added to inventory");
      }

      setShowAddForm(false);
      resetForm();
    } catch (err) {
      toast.error("Failed to save asset");
    }
  };

  const handleDelete = async (asset: Asset) => {
    if (!confirm(`Delete "${asset.name}" (S/N: ${asset.serialNumber})? This cannot be undone.`)) return;
    try {
      await fetch(`/api/assets/${asset.id}`, { method: "DELETE" });
    } catch {}
    setAssetList(prev => prev.filter(a => a.id !== asset.id));
    toast.success("Asset deleted");
  };

  const handleAssign = (asset: Asset) => {
    setAssignTarget(asset);
    setAssignEmployee("");
    setShowAssignModal(true);
  };

  const submitAssignment = async () => {
    if (!assignTarget || !assignEmployee.trim()) {
      toast.error("Please enter an employee name");
      return;
    }

    try {
      await fetch("/api/assets/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: assignTarget.id,
          employeeId: 1, // In real implementation, search employees
          assignedBy: "admin",
        }),
      });
    } catch {}

    setAssetList(prev =>
      prev.map(a =>
        a.id === assignTarget.id
          ? { ...a, status: "Assigned" as AssetStatus, assignedTo: assignEmployee }
          : a
      )
    );
    setShowAssignModal(false);
    setAssignTarget(null);
    toast.success(`${assignTarget.name} assigned to ${assignEmployee}`);
  };

  const handleReturn = async (asset: Asset) => {
    try {
      // Find the assignment to mark as returned
      const assignment = mockAssetAssignments.find(a => a.assetId === asset.id && a.status === 'Active');
      if (assignment) {
        await fetch("/api/assets/assign", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignmentId: assignment.id }),
        });
      }
    } catch {}

    setAssetList(prev =>
      prev.map(a =>
        a.id === asset.id
          ? { ...a, status: "Available" as AssetStatus, assignedTo: null, assignedToId: null }
          : a
      )
    );
    toast.success(`${asset.name} marked as returned and available`);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-6xl">

      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Box size={24} className="text-blue-600" /> Equipment & Assets
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track company equipment, manage inventory, and handle assignments.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
        >
          <Plus size={16} /> Add Asset
        </button>
      </div>

      {/* ─── KPI Row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Assets" value={totalAssets}
          icon={<Box size={20} className="text-blue-600" />}
          color="bg-blue-50 dark:bg-blue-900/30" />
        <KpiCard label="Assigned" value={assignedAssets}
          icon={<UserPlus size={20} className="text-violet-600" />}
          color="bg-violet-50 dark:bg-violet-900/30" />
        <KpiCard label="Available" value={availableAssets}
          icon={<CheckCircle2 size={20} className="text-emerald-600" />}
          color="bg-emerald-50 dark:bg-emerald-900/30" />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-900/30">
            <DollarSign size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              ${(totalValue / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-slate-500 font-medium">Total Value</p>
          </div>
        </div>
      </div>

      {/* ─── Search + Filters ────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, serial #, or assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Filter size={16} /> Filters
            <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-1 duration-200">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as AssetType | "all")}
                className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {ASSET_TYPES.map(t => (<option key={t} value={t}>{ASSET_TYPE_ICONS[t]} {t}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AssetStatus | "all")}
                className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                {ASSET_STATUSES.map(s => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>

            {(typeFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => { setTypeFilter("all"); setStatusFilter("all"); }}
                className="self-end text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-2"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── Asset Table ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" id="asset-inventory-table">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Asset</th>
                <th className="px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Serial #</th>
                <th className="px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Package size={28} className="opacity-50" />
                      </div>
                      <p className="text-sm font-medium">No assets found</p>
                      <p className="text-xs">Try adjusting your search or filters.</p>
                      <button
                        onClick={() => { resetForm(); setShowAddForm(true); }}
                        className="text-blue-600 text-sm font-medium hover:underline mt-1"
                      >
                        Add your first asset →
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(asset => (
                  <tr key={asset.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                          ${asset.type === 'Laptop' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                            asset.type === 'Monitor' ? 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' :
                            asset.type === 'Phone' ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                            asset.type === 'Badge' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
                        >
                          <AssetTypeIcon type={asset.type} size={18} />
                        </div>
                        <div>
                          <button
                            onClick={() => setDetailAsset(asset)}
                            className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                          >
                            {asset.name}
                          </button>
                          {asset.value > 0 && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              ${(asset.value / 100).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{asset.type}</span>
                    </td>
                    <td className="px-5 py-4">
                      <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                        {asset.serialNumber || '—'}
                      </code>
                    </td>
                    <td className="px-5 py-4">
                      {asset.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                            {asset.assignedTo.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{asset.assignedTo}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {asset.status === 'Available' && (
                          <button
                            onClick={() => handleAssign(asset)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Assign"
                          >
                            <UserPlus size={16} />
                          </button>
                        )}
                        {asset.status === 'Assigned' && (
                          <button
                            onClick={() => handleReturn(asset)}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-600 transition-colors"
                            title="Mark Returned"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => setDetailAsset(asset)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(asset)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(asset)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Table footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-700 dark:text-slate-300">{filtered.length}</span> of {assetList.length} assets
            </p>
          </div>
        )}
      </div>

      {/* ─── Add / Edit Asset Slide-over ─────────────────────────── */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex justify-end" id="asset-form-modal">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => { setShowAddForm(false); resetForm(); }} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {editingAsset ? <Edit3 size={18} className="text-blue-500" /> : <Plus size={18} className="text-blue-500" />}
                {editingAsset ? 'Edit Asset' : 'Add New Asset'}
              </h2>
              <button onClick={() => { setShowAddForm(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6">
              <form id="asset-form" onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Asset Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder='e.g., MacBook Pro 16" M3 Max'
                  />
                </div>

                {/* Type + Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as AssetType)}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      {ASSET_TYPES.map(t => (<option key={t} value={t}>{ASSET_TYPE_ICONS[t]} {t}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as AssetStatus)}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      {ASSET_STATUSES.map(s => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </div>
                </div>

                {/* Serial */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5"><Hash size={14} /> Serial Number</span>
                  </label>
                  <input
                    value={formSerial}
                    onChange={(e) => setFormSerial(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., C02ZW1L3MD6R"
                  />
                </div>

                {/* Purchase Date + Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <span className="flex items-center gap-1.5"><Calendar size={14} /> Purchase Date</span>
                    </label>
                    <input
                      type="date"
                      value={formPurchaseDate}
                      onChange={(e) => setFormPurchaseDate(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <span className="flex items-center gap-1.5"><DollarSign size={14} /> Value ($)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formValue}
                      onChange={(e) => setFormValue(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5"><StickyNote size={14} /> Notes</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Optional notes about this asset..."
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <button
                type="submit"
                form="asset-form"
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
              >
                {editingAsset ? 'Save Changes' : 'Add Asset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Assign Modal ────────────────────────────────────────── */}
      {showAssignModal && assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="asset-assign-modal">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowAssignModal(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Assign Asset
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              Assign <span className="font-semibold text-slate-700 dark:text-slate-300">{assignTarget.name}</span> (S/N: {assignTarget.serialNumber}) to an employee.
            </p>

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Employee</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={assignEmployee}
                  onChange={(e) => setAssignEmployee(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Search employee name..."
                  autoFocus
                />
              </div>
              {/* Quick suggestions */}
              {assignEmployee.length === 0 && (
                <div className="mt-2 flex flex-col gap-1">
                  {['Priya Sharma', 'Marcus Chen', 'Keiko Tanaka'].map(name => (
                    <button
                      key={name}
                      onClick={() => setAssignEmployee(name)}
                      className="text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitAssignment}
                disabled={!assignEmployee.trim()}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Detail Slide-over ───────────────────────────────────── */}
      {detailAsset && (
        <div className="fixed inset-0 z-50 flex justify-end" id="asset-detail-modal">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setDetailAsset(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                    ${detailAsset.type === 'Laptop' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                      detailAsset.type === 'Monitor' ? 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
                  >
                    <AssetTypeIcon type={detailAsset.type} size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{detailAsset.name}</h2>
                    <StatusBadge status={detailAsset.status} />
                  </div>
                </div>
                <button onClick={() => setDetailAsset(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Detail Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                    <AssetTypeIcon type={detailAsset.type} size={14} /> {detailAsset.type}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Serial Number</span>
                  <code className="text-sm font-mono text-slate-900 dark:text-white">{detailAsset.serialNumber || '—'}</code>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Purchase Date</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {detailAsset.purchaseDate ? new Date(detailAsset.purchaseDate).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Value</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {detailAsset.value ? `$${(detailAsset.value / 100).toLocaleString()}` : '—'}
                  </span>
                </div>
              </div>

              {/* Current Assignee */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Current Assignee</h4>
                {detailAsset.assignedTo ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-sm font-bold text-white">
                      {detailAsset.assignedTo.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{detailAsset.assignedTo}</p>
                      <p className="text-xs text-slate-500">Currently in possession</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Not currently assigned</p>
                )}
              </div>

              {/* Notes */}
              {detailAsset.notes && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notes</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                    {detailAsset.notes}
                  </p>
                </div>
              )}

              {/* Assignment History */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Assignment History</h4>
                <div className="space-y-2">
                  {mockAssetAssignments
                    .filter(a => a.assetId === detailAsset.id)
                    .map(assignment => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${assignment.status === 'Active' ? 'bg-green-500' : assignment.status === 'Overdue' ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{assignment.employeeName}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">{new Date(assignment.assignedAt).toLocaleDateString()}</p>
                          <span className={`text-[10px] font-bold uppercase
                            ${assignment.status === 'Active' ? 'text-green-600' :
                              assignment.status === 'Overdue' ? 'text-red-600' : 'text-slate-400'}`}>
                            {assignment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  {mockAssetAssignments.filter(a => a.assetId === detailAsset.id).length === 0 && (
                    <p className="text-sm text-slate-400 italic">No previous assignments</p>
                  )}
                </div>
              </div>
            </div>

            {/* Detail Footer Actions */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex gap-3">
              {detailAsset.status === 'Available' && (
                <button
                  onClick={() => { setDetailAsset(null); handleAssign(detailAsset); }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Assign to Employee
                </button>
              )}
              {detailAsset.status === 'Assigned' && (
                <button
                  onClick={() => { handleReturn(detailAsset); setDetailAsset(null); }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Mark as Returned
                </button>
              )}
              <button
                onClick={() => { setDetailAsset(null); handleEdit(detailAsset); }}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
