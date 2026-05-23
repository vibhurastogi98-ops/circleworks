"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Edit2,
  History,
  Info,
  Loader2,
  Map,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { formatDate } from "@/utils/formatDate";

type StateAllocation = {
  state: string;
  percentage: number;
  taxRate: number;
  proratedGross: number;
  estimatedStateTax: number;
};

type EmployeeAllocation = {
  id: string;
  employeeId: string;
  employeeName: string;
  avatar: string;
  role: string;
  primaryState: string;
  additionalStates: string[];
  allocations: StateAllocation[];
  effectiveDate: string;
  updatedAt: string;
  grossPayBasis: number;
  history: Array<{
    id: string;
    date: string;
    description: string;
  }>;
};

type EmployeeOption = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  defaultState: string;
};

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
];

const RECIPROCITY_MAP: Record<string, string[]> = {
  AZ: ["CA", "IN", "OR", "VA"],
  DC: ["MD", "VA"],
  IL: ["IA", "KY", "MI", "WI"],
  IN: ["KY", "MI", "OH", "PA", "WI"],
  KY: ["IL", "IN", "MI", "OH", "VA", "WV", "WI"],
  MD: ["DC", "PA", "VA", "WV"],
  MI: ["IL", "IN", "KY", "MN", "OH", "WI"],
  MN: ["MI", "ND"],
  NJ: ["PA"],
  OH: ["IN", "KY", "MI", "PA", "WV"],
  PA: ["IN", "MD", "NJ", "OH", "VA", "WV"],
  VA: ["AZ", "DC", "KY", "MD", "PA", "WV"],
  WV: ["KY", "MD", "OH", "PA", "VA"],
  WI: ["IL", "IN", "KY", "MI"],
};

const STATE_COLORS = [
  "bg-blue-600",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
];

const allocationSchema = z
  .object({
    employeeId: z.string().min(1, "Please select an employee"),
    employeeName: z.string().min(1),
    role: z.string().min(1),
    avatar: z.string().min(1),
    primaryState: z.string().length(2),
    allocations: z
      .array(
        z.object({
          state: z.string().length(2),
          percentage: z.coerce.number().min(0).max(100),
        })
      )
      .min(1, "At least one state is required"),
    effectiveDate: z.string().min(1, "Effective date is required"),
  })
  .superRefine((value, ctx) => {
    const total = value.allocations.reduce((sum, row) => sum + Number(row.percentage || 0), 0);
    if (total !== 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Allocation must equal 100%",
        path: ["allocations"],
      });
    }
  });

type AllocationFormValues = z.input<typeof allocationSchema>;

function inferState(location?: string | null) {
  const match = location?.match(/\b[A-Z]{2}\b/);
  return match?.[0] && US_STATES.includes(match[0]) ? match[0] : "NY";
}

function nextPayrollDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().slice(0, 10);
}

function hasReciprocity(a: string, b: string) {
  return RECIPROCITY_MAP[a]?.includes(b) || RECIPROCITY_MAP[b]?.includes(a);
}

function reciprocityPairs(allocations: Array<{ state: string }>) {
  const pairs: string[] = [];
  for (let i = 0; i < allocations.length; i += 1) {
    for (let j = i + 1; j < allocations.length; j += 1) {
      if (hasReciprocity(allocations[i].state, allocations[j].state)) {
        pairs.push(`${allocations[i].state}-${allocations[j].state}`);
      }
    }
  }
  return pairs;
}

async function fetchAllocations(): Promise<EmployeeAllocation[]> {
  const response = await fetch("/api/payroll/multi-state-allocations", { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to load multi-state allocations");
  const data = await response.json();
  return data.allocations ?? [];
}

async function fetchEmployees(search: string): Promise<EmployeeOption[]> {
  const response = await fetch(`/api/employees?search=${encodeURIComponent(search)}`);
  if (!response.ok) return [];
  const data = await response.json();
  const rows = Array.isArray(data) ? data : data.employees ?? [];

  return rows
    .map((employee: any) => {
      const firstName = employee.firstName ?? "";
      const lastName = employee.lastName ?? "";
      const name = employee.name ?? `${firstName} ${lastName}`.trim();
      return {
        id: String(employee.id),
        name,
        role: employee.jobTitle ?? employee.title ?? employee.role ?? employee.department ?? "Employee",
        avatar:
          employee.avatar ??
          `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name || String(employee.id))}&backgroundColor=transparent`,
        defaultState: employee.defaultState ?? employee.primaryState ?? inferState(employee.location),
      };
    })
    .filter((employee: EmployeeOption) => {
      if (!search.trim()) return true;
      return employee.name.toLowerCase().includes(search.toLowerCase());
    })
    .slice(0, 8);
}

async function saveAllocation(values: AllocationFormValues) {
  const response = await fetch("/api/payroll/multi-state-allocations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Failed to save allocation");
  return data.allocation as EmployeeAllocation;
}

async function removeAllocation(employeeId: string) {
  const response = await fetch("/api/payroll/multi-state-allocations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "remove", employeeId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Failed to remove allocation");
  return data;
}

function AllocationBar({ allocations }: { allocations: StateAllocation[] }) {
  return (
    <div className="w-56 max-w-full">
      <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        {allocations.map((allocation, index) => (
          <div
            key={`${allocation.state}-${index}`}
            className={STATE_COLORS[index % STATE_COLORS.length]}
            style={{ width: `${allocation.percentage}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
        {allocations.map((allocation, index) => (
          <span key={allocation.state} className="inline-flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${STATE_COLORS[index % STATE_COLORS.length]}`} />
            {allocation.state} {allocation.percentage}%
          </span>
        ))}
      </div>
    </div>
  );
}

function Avatar({ src, name }: { src: string; name: string }) {
  return (
    <img
      src={src}
      alt=""
      className="h-10 w-10 shrink-0 rounded-full border border-slate-200 bg-slate-100 object-cover dark:border-slate-700 dark:bg-slate-800"
    />
  );
}

function HistoryPanel({
  allocation,
  onClose,
}: {
  allocation: EmployeeAllocation | null;
  onClose: () => void;
}) {
  if (!allocation) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button className="absolute inset-0 bg-slate-950/30" aria-label="Close history" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Allocation History</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{allocation.employeeName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {allocation.history.map((entry) => (
            <div key={entry.id} className="border-l-2 border-blue-200 pl-4 dark:border-blue-900">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{entry.description}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDate(entry.date)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AllocationModal({
  editingRow,
  isOpen,
  onClose,
}: {
  editingRow: EmployeeAllocation | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");

  const form = useForm<AllocationFormValues>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      employeeId: "",
      employeeName: "",
      role: "",
      avatar: "",
      primaryState: "NY",
      allocations: [{ state: "NY", percentage: 100 }],
      effectiveDate: nextPayrollDate(),
    },
    mode: "onChange",
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    trigger,
    watch,
  } = form;

  const { append, fields, remove } = useFieldArray({ control, name: "allocations" });
  const allocations = watch("allocations");
  const selectedName = watch("employeeName");
  const selectedRole = watch("role");
  const selectedAvatar = watch("avatar");
  const totalAllocation = allocations.reduce((sum, row) => sum + Number(row.percentage || 0), 0);
  const remainingAllocation = Math.max(0, 100 - totalAllocation);
  const allocationError = typeof errors.allocations?.message === "string" ? errors.allocations.message : undefined;
  const pairs = reciprocityPairs(allocations);

  const employeesQuery = useQuery({
    queryKey: ["employees", "search", search],
    queryFn: () => fetchEmployees(search),
    enabled: isOpen && step === 1 && search.trim().length > 0,
  });

  useEffect(() => {
    if (!isOpen) return;

    if (editingRow) {
      reset({
        employeeId: editingRow.employeeId,
        employeeName: editingRow.employeeName,
        role: editingRow.role,
        avatar: editingRow.avatar,
        primaryState: editingRow.primaryState,
        allocations: editingRow.allocations.map((allocation) => ({
          state: allocation.state,
          percentage: allocation.percentage,
        })),
        effectiveDate: editingRow.effectiveDate,
      });
      setStep(2);
      setSearch(editingRow.employeeName);
      return;
    }

    reset({
      employeeId: "",
      employeeName: "",
      role: "",
      avatar: "",
      primaryState: "NY",
      allocations: [{ state: "NY", percentage: 100 }],
      effectiveDate: nextPayrollDate(),
    });
    setStep(1);
    setSearch("");
  }, [editingRow, isOpen, reset]);

  const saveMutation = useMutation({
    mutationFn: saveAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["multistate-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-preview"] });
      toast.success("Allocation saved");
      onClose();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const selectEmployee = (employee: EmployeeOption) => {
    setValue("employeeId", employee.id, { shouldValidate: true });
    setValue("employeeName", employee.name, { shouldValidate: true });
    setValue("role", employee.role, { shouldValidate: true });
    setValue("avatar", employee.avatar, { shouldValidate: true });
    setValue("primaryState", employee.defaultState, { shouldValidate: true });
    setValue("allocations", [{ state: employee.defaultState, percentage: 100 }], { shouldValidate: true });
    setSearch(employee.name);
    setStep(2);
  };

  const addStateRow = () => {
    const chosen = new Set(allocations.map((allocation) => allocation.state));
    const nextState = US_STATES.find((state) => !chosen.has(state)) ?? "CA";
    append({ state: nextState, percentage: remainingAllocation });
  };

  const goToEffectiveDate = async () => {
    const valid = await trigger(["employeeId", "allocations"]);
    if (!valid || totalAllocation !== 100) return;
    setStep(3);
  };

  const submit = handleSubmit((values) => saveMutation.mutate(values));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
      >
        <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingRow ? "Edit Allocation" : "Add Allocation"}
              </h2>
              <div className="mt-3 flex items-center gap-2">
                {["Select employee", "State allocation", "Effective date"].map((label, index) => {
                  const number = index + 1;
                  return (
                    <React.Fragment key={label}>
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                          step >= number ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                        }`}
                        title={label}
                      >
                        {number}
                      </span>
                      {number < 3 && (
                        <span className={`h-0.5 w-8 rounded-full ${step > number ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              {step === 1 && (
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="employee-search">
                    Employee
                  </label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      id="employee-search"
                      autoFocus
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      placeholder="Search employee name"
                    />
                  </div>

                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                    {employeesQuery.isFetching ? (
                      <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm font-semibold text-slate-500">
                        <Loader2 size={16} className="animate-spin" />
                        Searching
                      </div>
                    ) : employeesQuery.data?.length ? (
                      employeesQuery.data.map((employee) => (
                        <button
                          key={employee.id}
                          type="button"
                          onClick={() => selectEmployee(employee)}
                          className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                        >
                          <Avatar src={employee.avatar} name={employee.name} />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">{employee.name}</span>
                            <span className="block text-xs text-slate-500 dark:text-slate-400">
                              {employee.role} · {employee.defaultState}
                            </span>
                          </span>
                          <ArrowRight size={16} className="ml-auto text-slate-400" />
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-sm text-slate-500">
                        {search.trim() ? "No matching employees found." : "Start typing to search employees."}
                      </div>
                    )}
                  </div>
                  {errors.employeeId && <p className="text-sm font-semibold text-red-600">{errors.employeeId.message}</p>}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <Avatar src={selectedAvatar} name={selectedName} />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedName}</p>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{selectedRole}</p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm font-bold">
                      <span className="text-slate-700 dark:text-slate-300">Total Allocation</span>
                      <span className={totalAllocation === 100 ? "text-emerald-600" : "text-red-600"}>{totalAllocation}%</span>
                    </div>
                    <div className="flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      {allocations.map((allocation, index) => (
                        <div
                          key={`${allocation.state}-${index}`}
                          className={totalAllocation > 100 ? "bg-red-500" : STATE_COLORS[index % STATE_COLORS.length]}
                          style={{ width: `${Math.min(Number(allocation.percentage || 0), 100)}%` }}
                        />
                      ))}
                      {remainingAllocation > 0 && <div className="bg-slate-300 dark:bg-slate-700" style={{ width: `${remainingAllocation}%` }} />}
                    </div>
                    {(allocationError || totalAllocation !== 100) && (
                      <p className="mt-2 flex items-center gap-1 text-xs font-bold text-red-600">
                        <AlertCircle size={14} />
                        {allocationError ?? "Allocation must equal 100%"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-[1fr_128px_40px] items-center gap-3">
                        <Controller
                          control={control}
                          name={`allocations.${index}.state`}
                          render={({ field: stateField }) => (
                            <select
                              {...stateField}
                              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            >
                              {US_STATES.map((state) => (
                                <option key={state} value={state}>
                                  {state}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            {...register(`allocations.${index}.percentage`)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-8 text-right text-sm font-black text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                          />
                          <span className="absolute right-3 top-3 text-sm font-bold text-slate-400">%</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-950/30"
                          title="Remove state"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addStateRow}
                    className="inline-flex items-center gap-2 rounded-lg px-1 py-2 text-sm font-bold text-blue-600 hover:text-blue-700"
                  >
                    <Plus size={15} />
                    Add State Row
                  </button>

                  {pairs.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/70 dark:bg-amber-950/30">
                      <div className="mb-2 flex items-center gap-2 text-sm font-black text-amber-800 dark:text-amber-300">
                        <Info size={16} />
                        Reciprocity Agreements
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {pairs.map((pair) => (
                          <span
                            key={pair}
                            className="rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-amber-800 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                          >
                            {pair}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                      <CheckCircle2 size={28} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Allocation Balanced</h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Effective from the next payroll run.</p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="effective-date">
                      Effective Date
                    </label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        id="effective-date"
                        type="date"
                        {...register("effectiveDate")}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                    {errors.effectiveDate && <p className="mt-2 text-sm font-semibold text-red-600">{errors.effectiveDate.message}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              ) : (
                <span />
              )}

              {step === 1 && (
                <button
                  type="button"
                  disabled={!watch("employeeId")}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  State Allocation
                  <ArrowRight size={16} />
                </button>
              )}
              {step === 2 && (
                <button
                  type="button"
                  disabled={totalAllocation !== 100}
                  onClick={goToEffectiveDate}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  Effective Date
                  <ArrowRight size={16} />
                </button>
              )}
              {step === 3 && (
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Allocation
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
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<EmployeeAllocation | null>(null);
  const [historyRow, setHistoryRow] = useState<EmployeeAllocation | null>(null);
  const [filter, setFilter] = useState("");

  const allocationsQuery = useQuery({
    queryKey: ["multistate-allocations"],
    queryFn: fetchAllocations,
  });

  const removeMutation = useMutation({
    mutationFn: removeAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["multistate-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-preview"] });
      toast.success("Allocation removed");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const visibleAllocations = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return allocationsQuery.data ?? [];
    return (allocationsQuery.data ?? []).filter((allocation) => {
      return (
        allocation.employeeName.toLowerCase().includes(query) ||
        allocation.role.toLowerCase().includes(query) ||
        allocation.allocations.some((row) => row.state.toLowerCase().includes(query))
      );
    });
  }, [allocationsQuery.data, filter]);

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <Link href="/payroll" className="hover:text-blue-600">
              Payroll
            </Link>
            <span className="text-slate-300 dark:text-slate-700">&gt;</span>
            <span className="text-slate-900 dark:text-white">Multi-State</span>
          </div>
          <h1 className="flex items-center gap-3 text-2xl font-extrabold text-slate-900 dark:text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
              <Map size={21} />
            </span>
            Multi-State Payroll
          </h1>
          <p className="ml-[52px] mt-1 text-sm text-slate-500 dark:text-slate-400">
            Configure employees working across multiple states
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingRow(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 md:self-auto"
        >
          <Plus size={16} />
          Add Allocation
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">Active Employees</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{allocationsQuery.data?.length ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">Auto-Prorate</p>
          <p className="mt-1 text-sm font-bold text-emerald-600">Gross split by allocation</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">State Taxes</p>
          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">Calculated on prorated gross</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-black text-slate-700 dark:text-slate-200">Employee List</p>
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Filter employees or states"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:bg-slate-950/70">
                <th className="px-5 py-4">Employee Name</th>
                <th className="px-5 py-4">Primary State</th>
                <th className="px-5 py-4">Additional States</th>
                <th className="px-5 py-4">Allocation %</th>
                <th className="px-5 py-4">Updated</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {allocationsQuery.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <Loader2 size={24} className="mx-auto animate-spin text-blue-600" />
                  </td>
                </tr>
              ) : visibleAllocations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm font-semibold text-slate-500">
                    No multi-state allocations found.
                  </td>
                </tr>
              ) : (
                visibleAllocations.map((allocation) => {
                  const pairs = reciprocityPairs(allocation.allocations);
                  return (
                    <tr key={allocation.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={allocation.avatar} name={allocation.employeeName} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-900 dark:text-white">{allocation.employeeName}</p>
                            <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {allocation.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {allocation.primaryState}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex max-w-[260px] flex-wrap gap-2">
                          {allocation.additionalStates.map((state) => (
                            <span
                              key={state}
                              className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            >
                              {state}
                            </span>
                          ))}
                          {pairs.map((pair) => (
                            <span
                              key={pair}
                              className="rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-[11px] font-black uppercase text-amber-800 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                            >
                              {pair}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <AllocationBar allocations={allocation.allocations} />
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-600 dark:text-slate-300">{formatDate(allocation.updatedAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRow(allocation);
                              setModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-black text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          >
                            <Edit2 size={14} />
                            Edit Allocation
                          </button>
                          <button
                            type="button"
                            disabled={removeMutation.isPending}
                            onClick={() => removeMutation.mutate(allocation.employeeId)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-black text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                          <button
                            type="button"
                            onClick={() => setHistoryRow(allocation)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-black text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <History size={14} />
                            View History
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AllocationModal
        editingRow={editingRow}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRow(null);
        }}
      />
      <HistoryPanel allocation={historyRow} onClose={() => setHistoryRow(null)} />
    </div>
  );
}
