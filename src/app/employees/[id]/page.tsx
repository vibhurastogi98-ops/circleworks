"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEmployee } from "@/hooks/useEmployees";
import { Briefcase, Calendar, User, Loader2, AlertCircle, Landmark, Laptop, Monitor, Smartphone, Keyboard, CreditCard, CarFront, Package, Plus } from "lucide-react";
import { toast } from "sonner";
import { mockAssetAssignments, ASSET_TYPE_ICONS, type AssetType, mockAssets, type Asset, type AssetAssignment } from "@/data/mockAssets";

/* ─── Asset Type Icon ─────────────────────────────────────────────── */
function AssetIcon({ type, size = 14 }: { type: AssetType; size?: number }) {
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

export default function EmployeeOverviewTab() {
  const { id } = useParams();
  const { data: emp, isLoading, error } = useEmployee(id as string);

  // Asset Assignment States
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assetSearch, setAssetSearch] = useState("");
  const [assigningId, setAssigningId] = useState<string | null>(null);

  // Mock available inventory (In real app, fetch from /api/assets?status=Available)
  const [availableInventory, setAvailableInventory] = useState<Asset[]>(
    mockAssets.filter((a: Asset) => a.status === 'Available')
  );

  // Local state for assignments (initialized from mock)
  const [currentAssets, setCurrentAssets] = useState<AssetAssignment[]>(
    mockAssetAssignments.filter((a: AssetAssignment) => a.employeeId === parseInt(id as string) && a.status === 'Active')
  );

  const handleAssign = async (asset: Asset) => {
    try {
      setAssigningId(asset.id);
      
      // Simulate API call
      // await fetch('/api/assets/assign', { ... });

      const newAssignment: AssetAssignment = {
        id: `asgn-${Date.now()}`,
        assetId: asset.id,
        assetName: asset.name,
        assetType: asset.type,
        serialNumber: asset.serialNumber,
        employeeId: parseInt(id as string),
        employeeName: `${emp?.firstName} ${emp?.lastName}`,
        assignedAt: new Date().toISOString(),
        returnedAt: null,
        status: 'Active' as const,
      };

      setCurrentAssets(prev => [...prev, newAssignment]);
      setAvailableInventory(prev => prev.filter(a => a.id !== asset.id));
      setShowAssignModal(false);
      setAssetSearch("");
      toast.success(`${asset.name} assigned successfully`);
    } catch (err) {
      toast.error("Failed to assign asset");
    } finally {
      setAssigningId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  if (error || !emp) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600">
           <AlertCircle size={24} />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">Profile Not Found</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">We couldn't retrieve the data for this employee.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      {/* Left Column: Details */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Personal info grid */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <User size={18} className="text-blue-500" /> Personal Information
              </h3>
              <Link href={`/employees/${id}/edit`} className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">Edit</Link>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white">{emp.firstName} {emp.lastName}</span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preferred Name</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white">{emp.firstName}</span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white">{emp.email || "No email provided"}</span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white">+1 (555) 000-0000</span>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Work Location</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white">{emp.location || "Remote"} ({emp.locationType})</span>
              </div>
           </div>
        </div>

        {/* Employment Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <Briefcase size={18} className="text-blue-500" /> Employment Details
              </h3>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Title</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white">{emp.jobTitle}</span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white">{emp.department}</span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Employment Type</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">{emp.employmentType}</span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">{emp.status}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Right Column: Mini charts and timelines */}
      <div className="flex flex-col gap-6">
         
         {/* Org Mini Chart snippet */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Reports To</h3>
            {emp.manager ? (
               <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                    <img src={emp.manager.avatar} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                     <div className="text-sm font-bold text-slate-900 dark:text-white">{emp.manager.firstName} {emp.manager.lastName}</div>
                     <div className="text-xs text-slate-500 dark:text-slate-400">{emp.manager.jobTitle}</div>
                  </div>
               </div>
            ) : (
               <p className="text-sm text-slate-500 dark:text-slate-400 italic">No manager assigned.</p>
            )}

            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-6 mb-4">Direct Reports</h3>
            {emp.subordinates && emp.subordinates.length > 0 ? (
              <div className="flex flex-col gap-2">
                {emp.subordinates.slice(0, 3).map((sub: any) => (
                  <div key={sub.id} className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                      <img src={sub.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span>{sub.firstName} {sub.lastName}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">No direct reports.</p>
            )}
         </div>

         {/* ── Assigned Equipment Widget ─────────────────────────── */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <Package size={18} className="text-blue-500" /> Assigned Equipment
              </h3>
              <button
                onClick={() => setShowAssignModal(true)}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                <Plus size={12} /> Assign
              </button>
            </div>

            {currentAssets.length > 0 ? (
              <div className="flex flex-col gap-2">
                {currentAssets.map(asset => (
                  <div
                    key={asset.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                      ${asset.assetType === 'Laptop' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                        asset.assetType === 'Monitor' ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' :
                        asset.assetType === 'Phone' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}
                    >
                      <AssetIcon type={asset.assetType} size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{asset.assetName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">S/N: {asset.serialNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-slate-400 italic">No equipment assigned.</p>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                >
                  Assign first asset →
                </button>
              </div>
            )}
         </div>

         {/* ── Assign Asset Modal ───────────────────────────────── */}
         {showAssignModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowAssignModal(false)} />
               <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assign Equipment</h3>
                     <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <Plus size={20} className="rotate-45" />
                     </button>
                  </div>
                  
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                     <div className="relative">
                        <Plus size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-0" />
                        <input
                           type="text"
                           placeholder="Search inventory by name or serial..."
                           value={assetSearch}
                           onChange={(e) => setAssetSearch(e.target.value)}
                           className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500"
                           autoFocus
                        />
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                     {availableInventory.filter((a: Asset) => 
                        a.name.toLowerCase().includes(assetSearch.toLowerCase()) || 
                        a.serialNumber.toLowerCase().includes(assetSearch.toLowerCase())
                     ).map((asset: Asset) => (
                        <div key={asset.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xl text-slate-900 dark:text-white">
                                 {ASSET_TYPE_ICONS[asset.type]}
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-slate-900 dark:text-white">{asset.name}</p>
                                 <p className="text-[10px] text-slate-500 font-mono">S/N: {asset.serialNumber}</p>
                              </div>
                           </div>
                           <button 
                              onClick={() => handleAssign(asset)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                           >
                              Assign
                           </button>
                        </div>
                     ))}
                     {availableInventory.length === 0 && (
                        <p className="text-center py-10 text-sm text-slate-400 italic">No available assets in inventory.</p>
                     )}
                  </div>
               </div>
            </div>
         )}

         {/* Key Dates */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
               <Calendar size={18} className="text-blue-500" /> Key Dates
            </h3>
            
            <div className="flex flex-col gap-4">
               <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-600 dark:text-slate-400">Hire Date</span>
                  <span className="font-medium text-slate-900 dark:text-white">{emp.startDate ? new Date(emp.startDate).toLocaleDateString() : "Pending"}</span>
               </div>
               <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-600 dark:text-slate-400">Next Review</span>
                  <span className="font-medium text-slate-900 dark:text-white">Not scheduled</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Joined</span>
                  <span className="font-medium text-slate-900 dark:text-white">{emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : "Recent"}</span>
               </div>
            </div>
         </div>

         {/* Direct Deposit Status */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
               <Landmark size={18} className="text-blue-500" /> Direct Deposit
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${emp.bankAccount?.verified ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'}`}>
                {emp.bankAccount?.verified ? 'Verified' : 'Pending'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Account details are hidden for security reasons. Only verification status is shown to admins.</p>
         </div>
      </div>
    </div>
  );
}
