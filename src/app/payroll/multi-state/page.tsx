"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map,
  Plus,
  ArrowRight,
  ArrowLeft,
  Save,
  AlertCircle,
  X,
  Search,
  CheckCircle2,
  Calendar,
  Building2,
  Trash2,
  Edit2,
  History,
  Info
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/utils/formatDate";

/* ──────────────────────────────────── MOCK DATA & API ─────────────────────────────── */

export type StateAllocation = {
  state: string;
  percentage: number;
};

export type EmployeeAllocation = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  primaryState: string;
  allocations: StateAllocation[];
  updatedAt: string;
};

const RECIPROCITY_MAP: Record<string, string[]> = {
  "NY": ["NJ", "CT", "PA"],
  "NJ": ["NY", "PA"],
  "PA": ["NJ", "NY", "OH", "MD", "VA", "WV"],
  "DC": ["MD", "VA"],
  "MD": ["DC", "VA", "PA", "WV"],
  "VA": ["DC", "MD", "PA", "WV", "KY"],
};

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY",
  "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND",
  "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
];

// Mock API initial state
let MOCK_ALLOCATIONS: EmployeeAllocation[] = [
  {
    id: "EMP-001",
    name: "Alex Clark",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=AlexClark&backgroundColor=transparent",
    role: "Engineering Manager",
    primaryState: "NY",
    allocations: [{ state: "NY", percentage: 60 }, { state: "NJ", percentage: 40 }],
    updatedAt: "2026-03-10",
  },
  {
    id: "EMP-002",
    name: "Taylor Smith",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=TaylorSmith&backgroundColor=transparent",
    role: "Sales Rep",
    primaryState: "CA",
    allocations: [{ state: "CA", percentage: 75 }, { state: "OR", percentage: 25 }],
    updatedAt: "2026-02-15",
  },
  {
    id: "EMP-003",
    name: "Jordan Brown",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=JordanBrown&backgroundColor=transparent",
    role: "Consultant",
    primaryState: "DC",
    allocations: [{ state: "DC", percentage: 50 }, { state: "MD", percentage: 30 }, { state: "VA", percentage: 20 }],
    updatedAt: "2026-04-01",
  }
];

const mockSearchEmployees = async (query: string) => {
  await new Promise(r => setTimeout(r, 300));
  const pool = [
    { id: "EMP-004", name: "Morgan Davis", role: "Developer", defaultState: "TX" },
    { id: "EMP-005", name: "Casey Evans", role: "Designer", defaultState: "NY" },
    { id: "EMP-006", name: "Riley Foster", role: "HR", defaultState: "IL" },
  ];
  return pool.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
};

const mockFetchAllocations = async () => {
  await new Promise(r => setTimeout(r, 600));
  return [...MOCK_ALLOCATIONS];
};

const mockSaveAllocation = async (data: any) => {
  await new Promise(r => setTimeout(r, 800));
  return data;
};

/* ──────────────────────────────────── SCHEMA ─────────────────────────────────── */

const allocationSchema = z.object({
  employeeId: z.string().min(1, "Please select an employee"),
  primaryState: z.string().min(2, "Primary state required"),
  allocations: z.array(
    z.object({
      state: z.string(),
      percentage: z.number().min(0).max(100)
    })
  ).min(1, "At least one allocation required"),
  effectiveDate: z.string().min(1, "Effective date required")
}).superRefine((val, ctx) => {
  const sum = val.allocations.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
  if (Math.abs(sum - 100) > 0.01) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Allocation sum must equal exactly 100%",
      path: ["allocations"]
    });
  }
});

type AllocationFormValues = z.infer<typeof allocationSchema>;

/* ──────────────────────────────────── COMPONENTS ─────────────────────────────── */

const STATE_COLORS = [
  "from-blue-500 to-indigo-500",
  "from-cyan-400 to-emerald-400",
  "from-violet-500 to-fuchsia-500",
  "from-orange-400 to-amber-500"
];

function AllocationBar({ allocations }: { allocations: StateAllocation[] }) {
  return (
    <div className="flex flex-col gap-1.5 w-48 xl:w-64">
      <div className="h-2 flex rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {allocations.map((a, i) => (
          <div
            key={a.state}
            style={{ width: `${a.percentage}%` }}
            className={`h-full bg-gradient-to-r ${STATE_COLORS[i % STATE_COLORS.length]}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {allocations.map((a, i) => (
          <span key={a.state} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${STATE_COLORS[i % STATE_COLORS.length]}`} />
            {a.state} {Math.round(a.percentage)}%
          </span>
        ))}
      </div>
    </div>
  );
}

function AddEditModal({ isOpen, onClose, editingRow }: { isOpen: boolean, onClose: () => void, editingRow: EmployeeAllocation | null }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);

  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AllocationFormValues>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      employeeId: "",
      primaryState: "NY",
      allocations: [{ state: "NY", percentage: 100 }],
      effectiveDate: new Date().toISOString().split('T')[0]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "allocations" });
  const allAllocations = watch("allocations");
  const totalAlloc = allAllocations.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0);

  // Pre-fill on edit
  React.useEffect(() => {
    if (editingRow) {
      setSelectedEmp({ id: editingRow.id, name: editingRow.name, role: editingRow.role, defaultState: editingRow.primaryState });
      setValue("employeeId", editingRow.id);
      setValue("primaryState", editingRow.primaryState);
      setValue("allocations", editingRow.allocations);
      setStep(2);
    }
  }, [editingRow, setValue]);

  const searchMutation = useMutation({
    mutationFn: mockSearchEmployees,
    onSuccess: (data) => setSearchResults(data)
  });

  React.useEffect(() => {
    if (search.length > 1) {
      searchMutation.mutate(search);
    } else {
      setSearchResults([]);
    }
  }, [search]);

  const saveMutation = useMutation({
    mutationFn: mockSaveAllocation,
    onSuccess: () => {
      // Opt lock invalidation mock
      queryClient.invalidateQueries({ queryKey: ["multistate-allocations"] });
      onClose();
    }
  });

  const onSubmit = (data: AllocationFormValues) => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    
    // Convert to mock save
    const newAlloc: EmployeeAllocation = {
      id: selectedEmp.id,
      name: selectedEmp.name,
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${selectedEmp.name}&backgroundColor=transparent`,
      role: selectedEmp.role,
      primaryState: data.primaryState,
      allocations: data.allocations,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    
    MOCK_ALLOCATIONS = [newAlloc, ...MOCK_ALLOCATIONS.filter(a => a.id !== newAlloc.id)];
    saveMutation.mutate(newAlloc);
  };

  if (!isOpen) return null;

  const hasReciprocity = (stateA: string, stateB: string) => {
    return RECIPROCITY_MAP[stateA]?.includes(stateB) || RECIPROCITY_MAP[stateB]?.includes(stateA);
  };

  const reciprocityBadges = [];
  for (let i = 0; i < allAllocations.length; i++) {
    for (let j = i + 1; j < allAllocations.length; j++) {
      if (hasReciprocity(allAllocations[i].state, allAllocations[j].state)) {
         reciprocityBadges.push(`${allAllocations[i].state} ⇄ ${allAllocations[j].state}`);
      }
    }
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4">
        
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div>
              <h3 className="text-lg font-bold">Multi-state Allocation</h3>
              <div className="flex items-center gap-2 mt-1">
                {[1, 2, 3].map(s => (
                  <div key={s} className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{s}</div>
                    {s < 3 && <div className={`w-4 h-0.5 rounded-full ${step > s ? 'bg-blue-600' : 'bg-slate-100'}`} />}
                  </div>
                ))}
              </div>
            </div>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
            <div className="p-6">
              
              {/* STEP 1: SELECT EMPLOYEE */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                  <div>
                     <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Find Employee</label>
                     <div className="relative mt-2">
                       <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                       <input autoFocus type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800" />
                     </div>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                      {searchResults.map(emp => (
                        <div key={emp.id} onClick={() => { setSelectedEmp(emp); setValue("employeeId", emp.id); setValue("primaryState", emp.defaultState); setValue("allocations", [{state: emp.defaultState, percentage: 100}]); setStep(2); }}
                          className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200" />
                          <div>
                            <p className="text-sm font-bold">{emp.name}</p>
                            <p className="text-xs text-slate-500">{emp.role}</p>
                          </div>
                          <ArrowRight size={16} className="ml-auto text-slate-400" />
                        </div>
                      ))}
                    </div>
                  )}
                  {search.length > 1 && searchResults.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">No employees found.</p>
                  )}
                </div>
              )}

              {/* STEP 2: ALLOCATION */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6">
                     <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden"><img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${selectedEmp?.name}&backgroundColor=transparent`} /></div>
                     <div><p className="font-bold">{selectedEmp?.name}</p><p className="text-xs text-slate-500">{selectedEmp?.role}</p></div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-sm font-bold mb-2">
                       <span>Total Allocation</span>
                       <span className={totalAlloc !== 100 ? "text-red-500" : "text-emerald-600"}>{totalAlloc}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex">
                       {allAllocations.map((a, i) => (
                         <div key={i} style={{ width: `${a.percentage}%` }} className={`h-full bg-gradient-to-r ${STATE_COLORS[i % STATE_COLORS.length]}`} />
                       ))}
                       {totalAlloc < 100 && (
                         <div style={{ width: `${100 - totalAlloc}%` }} className="h-full bg-slate-200" />
                       )}
                       {totalAlloc > 100 && (
                         <div style={{ width: `${totalAlloc - 100}%` }} className="h-full bg-red-400 opacity-50" />
                       )}
                    </div>
                    {errors.allocations && <p className="text-xs text-red-500 flex items-center gap-1 mt-2"><AlertCircle size={14}/> {errors.allocations.message}</p>}
                    
                    {reciprocityBadges.length > 0 && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                        <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-amber-800">Reciprocity Agreements Active</p>
                          <p className="text-xs text-amber-700 mt-1">
                            {reciprocityBadges.join(", ")} have tax reciprocity. The employee may only need to pay income tax in their resident state. Wait to file till W-4 verification.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {fields.map((field, index) => (
                       <div key={field.id} className="flex items-center gap-3">
                         <div className="flex-1">
                           <Controller name={`allocations.${index}.state`} control={control} render={({ field }) => (
                             <select {...field} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-semibold text-sm">
                               {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                           )} />
                         </div>
                         <div className="w-32 relative">
                           <input type="number" {...register(`allocations.${index}.percentage`, { valueAsNumber: true })} 
                             className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-bold text-sm text-right" 
                           />
                           <span className="absolute right-3 top-2.5 text-sm text-slate-400 font-bold">%</span>
                         </div>
                         <button type="button" onClick={() => remove(index)} disabled={fields.length === 1} className="p-2.5 text-slate-400 hover:text-red-500 disabled:opacity-30"><Trash2 size={16}/></button>
                       </div>
                    ))}
                  </div>
                  
                  <button type="button" onClick={() => append({ state: "CA", percentage: 0 })} className="mt-4 text-sm font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700">
                    <Plus size={14}/> Add State Row
                  </button>
                </div>
              )}

              {/* STEP 3: EFFECTIVE DATE */}
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4">
                  <div className="text-center mb-8">
                     <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                       <CheckCircle2 size={32} className="text-emerald-500" />
                     </div>
                     <h3 className="text-xl font-bold">Allocation Balanced</h3>
                     <p className="text-sm text-slate-500 mt-2">The 100% distribution is perfect. When should this tax routing take effect?</p>
                  </div>

                  <div>
                     <label className="text-sm font-bold text-slate-700 mb-2 block">Effective Date</label>
                     <div className="relative">
                       <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
                       <input type="date" {...register("effectiveDate")} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-bold" />
                     </div>
                     <p className="text-xs text-slate-500 mt-2 flex items-center gap-1"><Info size={14}/> This applies the changes to the next unlocked payroll cycle.</p>
                  </div>
                </div>
              )}

            </div>
            
            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              {step > 1 ? (
                <button type="button" onClick={() => setStep(step - 1)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm">
                  <ArrowLeft size={16}/> Back
                </button>
              ) : <div/>}

              {step === 1 ? (
                <button type="button" disabled={!selectedEmp} onClick={() => setStep(2)} className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center gap-2 text-sm">
                  Allocation <ArrowRight size={16}/>
                </button>
              ) : step === 2 ? (
                <button type="button" disabled={totalAlloc !== 100} onClick={() => setStep(3)} className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center gap-2 text-sm">
                  Schedule Date <ArrowRight size={16}/>
                </button>
              ) : (
                <button type="submit" disabled={saveMutation.isPending} className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 transition-colors flex items-center gap-2 text-sm shadow-lg shadow-emerald-500/20">
                  {saveMutation.isPending ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={16}/>}
                  {saveMutation.isPending ? "Saving..." : "Confirm & Save"}
                </button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function MultiStatePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<EmployeeAllocation | null>(null);

  const { data: allocations, isLoading } = useQuery({
    queryKey: ["multistate-allocations"],
    queryFn: mockFetchAllocations,
  });

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold mb-1">
            <Link href="/payroll" className="hover:text-blue-600">Payroll</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 dark:text-white">Multi-State</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Map size={20} className="text-blue-600" />
            </div>
            Multi-State Payroll
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-[52px]">Configure employees working across multiple states.</p>
        </div>

        <button onClick={() => { setEditingRow(null); setModalOpen(true); }} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2 transition-transform hover:-translate-y-0.5 self-start md:self-auto">
          <Plus size={16} /> Add Split Allocation
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mt-2">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 flex justify-between items-center">
           <p className="font-bold text-sm text-slate-600">Active Allocations ({allocations?.length || 0})</p>
           <div className="relative">
             <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
             <input type="text" placeholder="Filter..." className="pl-8 pr-4 py-1.5 text-sm rounded-lg border border-slate-200 bg-white" />
           </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Employee</th>
              <th className="px-6 py-4 font-semibold">Primary State</th>
              <th className="px-6 py-4 font-semibold">Allocation %</th>
              <th className="px-6 py-4 font-semibold text-center">Last Updated</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center"><div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" /></td></tr>
            ) : allocations?.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center text-slate-500 text-sm">No multi-state allocations configured.</td></tr>
            ) : (
              allocations?.map(alloc => (
                <tr key={alloc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0"><img src={alloc.avatar} alt="" /></div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">{alloc.name}</p>
                        <p className="text-xs text-slate-500">{alloc.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 font-bold text-xs uppercase rounded">{alloc.primaryState}</span>
                  </td>
                  <td className="px-6 py-4">
                    <AllocationBar allocations={alloc.allocations} />
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                    {formatDate(alloc.updatedAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400">
                      <button className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="History"><History size={16}/></button>
                      <button onClick={() => { setEditingRow(alloc); setModalOpen(true); }} className="p-2 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit"><Edit2 size={16}/></button>
                      <button className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remove"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddEditModal isOpen={modalOpen} onClose={() => setModalOpen(false)} editingRow={editingRow} />
    </div>
  );
}
