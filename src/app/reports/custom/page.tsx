"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, Database, Columns, Filter,
  Group, BarChart, Table, LineChart, PieChart, Save, Clock,
  Plus, Trash2, GripVertical, Eye, ChevronRight, X,
  DollarSign, Users, CalendarDays, Heart, Receipt, Briefcase
} from "lucide-react";
import {
  availableFields,
  dataSourceLabels,
  filterOperators,
  visualizationOptions,
  generatePreviewData,
  type DataSource,
  type FilterOperator,
  type VisualizationType,
  type ReportField,
} from "@/data/mockReports";

/* ─── Step Indicator ──────────────────────────────────────────────── */
const STEPS = [
  { num: 1, label: "Data Source", icon: Database },
  { num: 2, label: "Fields", icon: Columns },
  { num: 3, label: "Filters", icon: Filter },
  { num: 4, label: "Grouping", icon: Group },
  { num: 5, label: "Visualization", icon: BarChart },
];

function StepIndicator({ currentStep, onStepClick }: { currentStep: number; onStepClick: (s: number) => void }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = step.num === currentStep;
        const isDone = step.num < currentStep;
        return (
          <React.Fragment key={step.num}>
            {i > 0 && <div className={`w-8 h-px flex-shrink-0 ${isDone ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700"}`} />}
            <button
              onClick={() => onStepClick(step.num)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : isDone
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              }`}
            >
              {isDone ? <Check size={14} /> : <Icon size={14} />}
              {step.label}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─── Data Source Icons ────────────────────────────────────────────── */
const dsIcons: Record<DataSource, React.ElementType> = {
  payroll: DollarSign,
  employees: Users,
  time: CalendarDays,
  benefits: Heart,
  expenses: Receipt,
  ats: Briefcase,
};

const dsColors: Record<DataSource, string> = {
  payroll: "bg-green-50 dark:bg-green-900/20 text-green-600 border-green-200 dark:border-green-800",
  employees: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-200 dark:border-blue-800",
  time: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 border-purple-200 dark:border-purple-800",
  benefits: "bg-red-50 dark:bg-red-900/20 text-red-600 border-red-200 dark:border-red-800",
  expenses: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200 dark:border-amber-800",
  ats: "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 border-cyan-200 dark:border-cyan-800",
};

/* ─── Filter Row (Step 3) ─────────────────────────────────────────── */
interface FilterRow {
  id: string;
  fieldId: string;
  operator: FilterOperator;
  value: string;
}

/* ─── Save Modal ──────────────────────────────────────────────────── */
function SaveModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"private" | "team" | "org">("private");

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Save Custom Report</h3>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Report Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Q2 Engineering Costs" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Brief description of this report..." className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Visibility</label>
            <div className="flex gap-2">
              {(["private", "team", "org"] as const).map((v) => (
                <button key={v} onClick={() => setVisibility(v)} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold capitalize transition-colors ${visibility === v ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm">Save Report</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Schedule Modal ──────────────────────────────────────────────── */
function ScheduleModal({ onClose }: { onClose: () => void }) {
  const [freq, setFreq] = useState("weekly");
  const [emails, setEmails] = useState("");
  const [format, setFormat] = useState("csv");

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock size={18} className="text-blue-600" /> Schedule Report
          </h3>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Frequency</label>
            <select value={freq} onChange={(e) => setFreq(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Recipient Emails</label>
            <input value={emails} onChange={(e) => setEmails(e.target.value)} placeholder="email@company.com, another@company.com" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Format</label>
            <div className="flex gap-2">
              {["csv", "pdf", "excel"].map((f) => (
                <button key={f} onClick={() => setFormat(f)} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${format === f ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm">Schedule</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Custom Report Builder ──────────────────────────────────── */
export default function CustomReportBuilder() {
  const [step, setStep] = useState(1);
  const [dataSource, setDataSource] = useState<DataSource>("payroll");
  const [selectedFields, setSelectedFields] = useState<string[]>(["f-1", "f-3", "f-8", "f-9"]);
  const [filters, setFilters] = useState<FilterRow[]>([]);
  const [groupBy, setGroupBy] = useState<string>("");
  const [vizType, setVizType] = useState<VisualizationType>("table");
  const [showSave, setShowSave] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const sourceFields = availableFields.filter((f) => f.dataSource === dataSource);
  const fieldGroups = Array.from(new Set(sourceFields.map((f) => f.group)));
  const selectedFieldObjects = selectedFields.map((id) => availableFields.find((f) => f.id === id)).filter(Boolean) as ReportField[];

  const previewData = useMemo(() => {
    if (selectedFields.length === 0) return [];
    return generatePreviewData(selectedFields);
  }, [selectedFields]);

  const toggleField = (fieldId: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]
    );
  };

  const addFilter = () => {
    setFilters((prev) => [
      ...prev,
      { id: `filter-${Date.now()}`, fieldId: sourceFields[0]?.id || "", operator: "equals", value: "" },
    ]);
  };

  const removeFilter = (id: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFilter = (id: string, key: keyof FilterRow, value: string) => {
    setFilters((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: value } : f)));
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/reports" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={18} className="text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Custom Report Builder</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Build a report from scratch with your own fields and filters.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSchedule(true)} className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
            <Clock size={16} /> Schedule
          </button>
          <button onClick={() => setShowSave(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Save size={16} /> Save Report
          </button>
        </div>
      </div>

      {/* Steps */}
      <StepIndicator currentStep={step} onStepClick={setStep} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Builder Panel */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          {/* Step 1: Data Source */}
          {step === 1 && (
            <div className="p-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Choose Data Source</h3>
              <p className="text-sm text-slate-500 mb-6">Select the primary data source for your report.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(Object.keys(dataSourceLabels) as DataSource[]).map((ds) => {
                  const Icon = dsIcons[ds];
                  const isActive = dataSource === ds;
                  return (
                    <button
                      key={ds}
                      onClick={() => { setDataSource(ds); setSelectedFields([]); }}
                      className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                        isActive
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-md"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${dsColors[ds]}`}>
                        <Icon size={24} />
                      </div>
                      <span className={`text-sm font-bold ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"}`}>
                        {dataSourceLabels[ds]}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {availableFields.filter((f) => f.dataSource === ds).length} fields
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Select Fields */}
          {step === 2 && (
            <div className="p-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Select Fields</h3>
              <p className="text-sm text-slate-500 mb-4">Choose the columns for your report. Selected: {selectedFields.length}</p>
              <div className="flex flex-col gap-4">
                {fieldGroups.map((group) => {
                  const fields = sourceFields.filter((f) => f.group === group);
                  return (
                    <div key={group}>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{group}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {fields.map((field) => {
                          const isChecked = selectedFields.includes(field.id);
                          return (
                            <button
                              key={field.id}
                              onClick={() => toggleField(field.id)}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                                isChecked
                                  ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/20"
                                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                              }`}
                            >
                              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                                isChecked ? "bg-blue-600 text-white" : "border border-slate-300 dark:border-slate-600"
                              }`}>
                                {isChecked && <Check size={12} />}
                              </div>
                              <span className={`text-sm ${isChecked ? "font-bold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                                {field.name}
                              </span>
                              <span className="text-[9px] text-slate-400 ml-auto font-mono">{field.type}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Selected fields — reorder */}
              {selectedFields.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Column Order (drag to reorder)</h4>
                  <div className="flex flex-col gap-1.5">
                    {selectedFieldObjects.map((field, idx) => (
                      <div key={field.id} className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <GripVertical size={14} className="text-slate-400 cursor-grab flex-shrink-0" />
                        <span className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white flex-1">{field.name}</span>
                        <button onClick={() => toggleField(field.id)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-red-500">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Filters */}
          {step === 3 && (
            <div className="p-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Add Filters</h3>
              <p className="text-sm text-slate-500 mb-4">Narrow down your report results.</p>
              <div className="flex flex-col gap-3">
                {filters.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <select
                      value={f.fieldId}
                      onChange={(e) => updateFilter(f.id, "fieldId", e.target.value)}
                      className="flex-1 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {sourceFields.map((sf) => <option key={sf.id} value={sf.id}>{sf.name}</option>)}
                    </select>
                    <select
                      value={f.operator}
                      onChange={(e) => updateFilter(f.id, "operator", e.target.value)}
                      className="px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {filterOperators.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
                    </select>
                    <input
                      value={f.value}
                      onChange={(e) => updateFilter(f.id, "value", e.target.value)}
                      placeholder="Value"
                      className="flex-1 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={() => removeFilter(f.id)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button onClick={addFilter} className="self-start flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline mt-2">
                  <Plus size={12} /> Add Filter
                </button>
                {filters.length === 0 && (
                  <p className="text-sm text-slate-500 py-8 text-center">No filters added. Click &quot;Add Filter&quot; to narrow results.</p>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Grouping */}
          {step === 4 && (
            <div className="p-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Group By</h3>
              <p className="text-sm text-slate-500 mb-4">Optionally group your results by a field.</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setGroupBy("")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                    groupBy === "" ? "border-blue-300 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-700" : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${groupBy === "" ? "bg-blue-600" : "border border-slate-300 dark:border-slate-600"}`}>
                    {groupBy === "" && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">No Grouping</span>
                </button>
                {selectedFieldObjects.filter((f) => f.type === "text").map((field) => (
                  <button
                    key={field.id}
                    onClick={() => setGroupBy(field.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                      groupBy === field.id ? "border-blue-300 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-700" : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${groupBy === field.id ? "bg-blue-600" : "border border-slate-300 dark:border-slate-600"}`}>
                      {groupBy === field.id && <Check size={12} className="text-white" />}
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">Group by {field.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Visualization */}
          {step === 5 && (
            <div className="p-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Choose Visualization</h3>
              <p className="text-sm text-slate-500 mb-4">How should the report be displayed?</p>
              <div className="grid grid-cols-2 gap-4">
                {visualizationOptions.map((opt) => {
                  const icons: Record<string, React.ElementType> = { Table, BarChart, LineChart, PieChart };
                  const VizIcon = icons[opt.icon] || Table;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setVizType(opt.value)}
                      className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                        vizType === opt.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-md"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <VizIcon size={28} className={vizType === opt.value ? "text-blue-600" : "text-slate-400"} />
                      <span className={`text-sm font-bold ${vizType === opt.value ? "text-blue-600" : "text-slate-600 dark:text-slate-400"}`}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="px-6 pb-6 flex justify-between">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-30"
            >
              <ArrowLeft size={14} /> Back
            </button>
            {step < 5 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm"
              >
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <Link
                href="/reports/viewer/custom"
                className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-sm"
              >
                Run Report <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye size={14} className="text-slate-500" /> Live Preview
            </h3>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs font-medium text-blue-600 dark:text-blue-400"
            >
              {showPreview ? "Hide" : "Show"}
            </button>
          </div>
          {showPreview && selectedFields.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      {selectedFieldObjects.map((f) => (
                        <th key={f.id} className="px-3 py-2 font-bold text-slate-500">{f.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {previewData.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        {selectedFieldObjects.map((f) => (
                          <td key={f.id} className="px-3 py-2 text-slate-600 dark:text-slate-400">
                            {f.type === "currency" ? `$${(row[f.name] as number)?.toLocaleString() || 0}` : String(row[f.name] || "—")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 text-center">
                Showing 5 sample rows · Actual data will appear when you run the report
              </div>
            </div>
          )}
          {showPreview && selectedFields.length === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-sm text-slate-500">
              Select fields in Step 2 to see a preview.
            </div>
          )}

          {/* Configuration Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Configuration</h4>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Data Source</span>
                <span className="font-bold text-slate-900 dark:text-white">{dataSourceLabels[dataSource]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fields Selected</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedFields.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Filters</span>
                <span className="font-bold text-slate-900 dark:text-white">{filters.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Group By</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {groupBy ? availableFields.find((f) => f.id === groupBy)?.name : "None"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Visualization</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {visualizationOptions.find((v) => v.value === vizType)?.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSave && <SaveModal onClose={() => setShowSave(false)} />}
      {showSchedule && <ScheduleModal onClose={() => setShowSchedule(false)} />}
    </div>
  );
}
