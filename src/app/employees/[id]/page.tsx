"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEmployee } from "@/hooks/useEmployees";
import { Briefcase, Calendar, User, Loader2, AlertCircle, Landmark, Laptop, Monitor, Smartphone, Keyboard, CreditCard, CarFront, Package, Plus, Activity, Shield, Hash, Save } from "lucide-react";
import { toast } from "sonner";
import { ASSET_TYPE_ICONS, type AssetType, type Asset, type AssetAssignment } from "@/data/mockAssets";
import { mockEmployeeUnionMemberships, mockUnions } from "@/data/mockUnionPayroll";
import { formatDate } from "@/utils/formatDate";

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
  const [availableInventory, setAvailableInventory] = useState<Asset[]>([]);
  const [currentAssets, setCurrentAssets] = useState<AssetAssignment[]>([]);
  const [isUnionMember, setIsUnionMember] = useState(false);
  const [selectedUnionId, setSelectedUnionId] = useState("u-001");
  const [membershipNumber, setMembershipNumber] = useState("");
  const [employeeUnionMemberships, setEmployeeUnionMemberships] = useState<typeof mockEmployeeUnionMemberships>([]);

  const employeeUnionLookupId = `e-${String(id).padStart(3, "0")}`;

  useEffect(() => {
    const activeAssignments = (emp?.assetAssignments || [])
      .filter((assignment: any) => assignment.status === "Active" && assignment.asset)
      .map((assignment: any) => ({
        id: String(assignment.id),
        assetId: String(assignment.assetId),
        assetName: assignment.asset.name,
        assetType: (assignment.asset.type || "Other") as AssetType,
        serialNumber: assignment.asset.serialNumber || "",
        employeeId: Number(id),
        employeeName: `${emp?.firstName || ""} ${emp?.lastName || ""}`.trim(),
        assignedAt: assignment.assignedAt || assignment.createdAt || new Date().toISOString(),
        returnedAt: assignment.returnedAt || null,
        status: assignment.status as "Active" | "Returned" | "Overdue",
      }));

    setCurrentAssets(activeAssignments);
  }, [emp, id]);

  useEffect(() => {
    const fullName = `${emp?.firstName || ""} ${emp?.lastName || ""}`.trim();
    const memberships = mockEmployeeUnionMemberships.filter(
      (membership) =>
        membership.employeeId === employeeUnionLookupId ||
        membership.employeeId === String(id) ||
        membership.employeeName === fullName,
    );

    setEmployeeUnionMemberships(memberships);
    setIsUnionMember(memberships.length > 0);
  }, [emp, employeeUnionLookupId, id]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/assets?status=Available", { credentials: "include" });
        if (!response.ok) return;
        const assets = await response.json();
        setAvailableInventory(
          assets.map((asset: any) => ({
            id: String(asset.id),
            name: asset.name,
            type: asset.type || "Other",
            serialNumber: asset.serialNumber || "",
            assignedTo: asset.assignedTo || null,
            assignedToId: asset.assignedToId || null,
            status: asset.status || "Available",
            purchaseDate: asset.purchaseDate || "",
            value: asset.value || 0,
            notes: asset.notes || "",
          }))
        );
      } catch {
        // keep empty fallback if API isn't available
      }
    })();
  }, []);

  const handleAssign = async (asset: Asset) => {
    try {
      setAssigningId(asset.id);

      const response = await fetch("/api/assets/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: asset.id,
          employeeId: id,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to assign asset");
      }

      const assignment = await response.json();

      const newAssignment: AssetAssignment = {
        id: String(assignment.id),
        assetId: asset.id,
        assetName: asset.name,
        assetType: asset.type,
        serialNumber: asset.serialNumber,
        employeeId: parseInt(id as string),
        employeeName: `${emp?.firstName} ${emp?.lastName}`,
        assignedAt: assignment.assignedAt || new Date().toISOString(),
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

  const handleAddUnionMembership = () => {
    if (!isUnionMember) {
      toast.info("Turn on Union Member before adding an affiliation");
      return;
    }

    if (!membershipNumber.trim()) {
      toast.error("Membership number is required");
      return;
    }

    const selectedUnion = mockUnions.find((union) => union.id === selectedUnionId);
    if (!selectedUnion || !emp) return;

    const newMembership = {
      id: `eum-local-${Date.now()}`,
      employeeId: employeeUnionLookupId,
      employeeName: `${emp.firstName} ${emp.lastName}`.trim(),
      avatar: `${emp.firstName?.[0] || ""}${emp.lastName?.[0] || ""}`.toUpperCase(),
      department: emp.department || "Production",
      unionId: selectedUnion.id,
      unionAbbreviation: selectedUnion.abbreviation,
      membershipNumber: membershipNumber.trim(),
      joinDate: new Date().toISOString().slice(0, 10),
      status: "Active" as const,
    };

    setEmployeeUnionMemberships((prev) => [...prev, newMembership]);
    setMembershipNumber("");
    toast.success("Union membership added", {
      description: `${selectedUnion.abbreviation} membership saved to this profile.`,
    });
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

        {/* Union Membership */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <Shield size={18} className="text-indigo-500" /> Union Membership
              </h3>
              <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <span>Union Member</span>
                <button
                  type="button"
                  onClick={() => setIsUnionMember((value) => !value)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    isUnionMember ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                  aria-pressed={isUnionMember}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                      isUnionMember ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </label>
           </div>

           {employeeUnionMemberships.length > 0 && (
             <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
               {employeeUnionMemberships.map((membership) => (
                 <div
                   key={membership.id}
                   className="rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/70 dark:bg-indigo-950/20 p-4"
                 >
                   <div className="flex items-center justify-between gap-3">
                     <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">{membership.unionAbbreviation}</span>
                     <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                       {membership.status}
                     </span>
                   </div>
                   <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                     <Hash size={13} />
                     <span className="font-mono">{membership.membershipNumber}</span>
                   </div>
                   <p className="mt-1 text-[11px] text-slate-500">Joined {formatDate(membership.joinDate)}</p>
                 </div>
               ))}
             </div>
           )}

           {isUnionMember ? (
             <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
                <select
                  value={selectedUnionId}
                  onChange={(event) => setSelectedUnionId(event.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {mockUnions.map((union) => (
                    <option key={union.id} value={union.id}>
                      {union.abbreviation} — {union.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={membershipNumber}
                  onChange={(event) => setMembershipNumber(event.target.value)}
                  placeholder="Membership number"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <button
                  type="button"
                  onClick={handleAddUnionMembership}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
                >
                  <Save size={15} />
                  Add Union
                </button>
             </div>
           ) : (
             <p className="text-sm text-slate-500 dark:text-slate-400">
               Turn on the Union Member toggle to add SAG-AFTRA, IATSE, WGA, DGA, or other affiliations. Multiple union memberships can be stored for entertainment workers.
             </p>
           )}
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

         {/* Recent Activity */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity size={18} className="text-blue-500" /> Recent Activity
               </h3>
               <Link href={`/employees/${id}/activity`} className="text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700">
                  View all
               </Link>
            </div>

            <div className="space-y-3">
               {[
                  { label: "Profile reviewed", detail: "HR verified personal details", date: emp.updatedAt || emp.createdAt },
                  { label: "Compensation synced", detail: "Current rate available to payroll", date: emp.updatedAt || emp.startDate },
                  { label: "Document status checked", detail: "I-9 and onboarding files monitored", date: emp.createdAt },
               ].map((item) => (
                  <div key={item.label} className="flex gap-3">
                     <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                     <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.detail}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{item.date ? formatDate(item.date) : "Recently"}</p>
                     </div>
                  </div>
               ))}
            </div>
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
                  <span className="font-medium text-slate-900 dark:text-white">{emp.startDate ? formatDate(emp.startDate) : "Pending"}</span>
               </div>
               <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-600 dark:text-slate-400">Next Review</span>
                  <span className="font-medium text-slate-900 dark:text-white">Not scheduled</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Joined</span>
                  <span className="font-medium text-slate-900 dark:text-white">{emp.createdAt ? formatDate(emp.createdAt) : "Recent"}</span>
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
