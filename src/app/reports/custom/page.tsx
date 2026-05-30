"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Columns3,
  Database,
  Filter,
  GripVertical,
  Group,
  Play,
  Save,
  Send,
  Sigma,
  Table2,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  buildCustomRows,
  customReportEntities,
  customReportFields,
  type CustomEntity,
  type CustomReportField,
} from "@/data/reportsAnalytics";

type FilterOperator = "equals" | "contains" | "greater_than" | "less_than" | "between";
type FilterConnector = "AND" | "OR";
type AggregateFunction = "sum" | "avg" | "count" | "min" | "max";

interface BuilderFilter {
  id: string;
  connector: FilterConnector;
  fieldId: string;
  operator: FilterOperator;
  value: string;
}

const steps = [
  { id: 1, title: "Choose Entity", icon: Database },
  { id: 2, title: "Select Fields", icon: Columns3 },
  { id: 3, title: "Add Filters", icon: Filter },
  { id: 4, title: "Grouping & Aggregates", icon: Sigma },
  { id: 5, title: "Preview", icon: Table2 },
];

const operatorLabels: Record<FilterOperator, string> = {
  equals: "Equals",
  contains: "Contains",
  greater_than: "Greater than",
  less_than: "Less than",
  between: "Between",
};

function wait(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getBuilderData() {
  await wait();
  return {
    entities: customReportEntities,
    fields: customReportFields,
  };
}

function BuilderSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="h-[520px] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>
  );
}

function SaveDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Custom Report</DialogTitle>
          <DialogDescription>Saved reports appear in the Custom Reports section on the hub.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
            Name
            <Input defaultValue="Department Cost Center" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
            Description
            <textarea
              rows={3}
              defaultValue="Payroll and benefits cost allocation by department."
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            <Save size={16} />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ScheduleDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Custom Report</DialogTitle>
          <DialogDescription>Email this report to recipients on a daily, weekly, or monthly schedule.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
            Schedule
            <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
            Recipients
            <Input defaultValue="finance@circleworks.com, people@circleworks.com" />
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            <Send size={16} />
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CustomReportBuilderPage() {
  const [step, setStep] = useState(1);
  const [entity, setEntity] = useState<CustomEntity>("Employees");
  const [selectedFields, setSelectedFields] = useState<string[]>([
    "employee_name",
    "department",
    "location",
    "annual_salary",
  ]);
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [filters, setFilters] = useState<BuilderFilter[]>([
    { id: "filter-1", connector: "AND", fieldId: "department", operator: "equals", value: "Engineering" },
  ]);
  const [groupBy, setGroupBy] = useState("department");
  const [aggregateField, setAggregateField] = useState("annual_salary");
  const [aggregateFunction, setAggregateFunction] = useState<AggregateFunction>("avg");
  const [saveOpen, setSaveOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["reports", "custom-builder"],
    queryFn: getBuilderData,
  });

  const entityFields = useMemo(
    () => (data?.fields ?? []).filter((field) => field.entity === entity),
    [data?.fields, entity],
  );
  const selectedFieldObjects = useMemo(
    () =>
      selectedFields
        .map((fieldId) => data?.fields.find((field) => field.id === fieldId))
        .filter(Boolean) as CustomReportField[],
    [data?.fields, selectedFields],
  );
  const previewRows = useMemo(() => buildCustomRows(selectedFields, 10), [selectedFields]);
  const numericFields = selectedFieldObjects.filter((field) => ["number", "currency", "percentage"].includes(field.type));

  const toggleField = (fieldId: string) => {
    setSelectedFields((current) => {
      if (current.includes(fieldId)) return current.filter((id) => id !== fieldId);
      return [...current, fieldId];
    });
  };

  const moveField = (targetField: string) => {
    if (!draggedField || draggedField === targetField) return;
    setSelectedFields((current) => {
      const next = [...current];
      const from = next.indexOf(draggedField);
      const to = next.indexOf(targetField);
      if (from === -1 || to === -1) return current;
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const addFilter = () => {
    setFilters((current) => [
      ...current,
      {
        id: `filter-${Date.now()}`,
        connector: "AND",
        fieldId: entityFields[0]?.id ?? "",
        operator: "equals",
        value: "",
      },
    ]);
  };

  const updateFilter = (id: string, patch: Partial<BuilderFilter>) => {
    setFilters((current) => current.map((filter) => (filter.id === id ? { ...filter, ...patch } : filter)));
  };

  if (isLoading) return <BuilderSkeleton />;

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <p className="mt-1 text-sm">Custom report builder could not be loaded.</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-start gap-3">
          <Link href="/reports" className="mt-1 rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft size={18} className="text-slate-500" />
          </Link>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Custom Reports</p>
            <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">Custom Report Builder</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Choose an entity, select fields, add filters, group and aggregate, preview, save, and schedule.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setScheduleOpen(true)}>
            <Send size={16} />
            Schedule
          </Button>
          <Button onClick={() => setSaveOpen(true)}>
            <Save size={16} />
            Save
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setStep(item.id)}
              className={`flex min-w-fit items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                step === item.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : item.id < step
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800"
              }`}
            >
              {item.id < step ? <Check size={16} /> : <Icon size={16} />}
              Step {item.id}: {item.title}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {step === 1 && (
            <div>
              <h2 className="text-lg font-black text-slate-950 dark:text-white">Step 1 - Choose Entity</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {data.entities.map((item) => {
                  const Icon = item.icon;
                  const active = item.entity === entity;
                  return (
                    <button
                      key={item.entity}
                      type="button"
                      onClick={() => {
                        setEntity(item.entity);
                        const nextFields = data.fields.filter((field) => field.entity === item.entity).slice(0, 4).map((field) => field.id);
                        setSelectedFields(nextFields);
                      }}
                      className={`rounded-xl border p-5 text-left transition ${
                        active
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                          : "border-slate-200 hover:border-blue-300 dark:border-slate-800"
                      }`}
                    >
                      <Icon size={24} className={active ? "text-blue-600" : "text-slate-400"} />
                      <h3 className="mt-3 font-black text-slate-950 dark:text-white">{item.entity}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-black text-slate-950 dark:text-white">Step 2 - Select Fields</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Use checkboxes to select fields, then drag selected columns to reorder.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {entityFields.map((field) => {
                  const checked = selectedFields.includes(field.id);
                  return (
                    <label
                      key={field.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                        checked
                          ? "border-blue-300 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10"
                          : "border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <input type="checkbox" checked={checked} onChange={() => toggleField(field.id)} />
                      <span className="flex-1 text-sm font-bold text-slate-800 dark:text-slate-200">{field.label}</span>
                      <span className="text-xs text-slate-400">{field.type}</span>
                    </label>
                  );
                })}
              </div>
              <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">Column order</h3>
                <div className="mt-3 grid gap-2">
                  {selectedFieldObjects.map((field, index) => (
                    <div
                      key={field.id}
                      draggable
                      onDragStart={() => setDraggedField(field.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => moveField(field.id)}
                      onDragEnd={() => setDraggedField(null)}
                      className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800"
                    >
                      <GripVertical size={15} className="text-slate-400" />
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-sm font-bold text-slate-800 dark:text-slate-200">{field.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-black text-slate-950 dark:text-white">Step 3 - Add Filters</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Supports multiple filters with AND/OR logic.</p>
              <div className="mt-5 grid gap-3">
                {filters.map((filter, index) => (
                  <div key={filter.id} className="grid gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-800 lg:grid-cols-[80px_1fr_150px_1fr_40px]">
                    <select
                      value={filter.connector}
                      disabled={index === 0}
                      onChange={(event) => updateFilter(filter.id, { connector: event.target.value as FilterConnector })}
                      className="h-10 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                    >
                      <option>AND</option>
                      <option>OR</option>
                    </select>
                    <select
                      value={filter.fieldId}
                      onChange={(event) => updateFilter(filter.id, { fieldId: event.target.value })}
                      className="h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      {entityFields.map((field) => (
                        <option key={field.id} value={field.id}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={filter.operator}
                      onChange={(event) => updateFilter(filter.id, { operator: event.target.value as FilterOperator })}
                      className="h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      {(Object.keys(operatorLabels) as FilterOperator[]).map((operator) => (
                        <option key={operator} value={operator}>
                          {operatorLabels[operator]}
                        </option>
                      ))}
                    </select>
                    <Input value={filter.value} onChange={(event) => updateFilter(filter.id, { value: event.target.value })} />
                    <button
                      type="button"
                      onClick={() => setFilters((current) => current.filter((item) => item.id !== filter.id))}
                      className="flex h-10 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <Button variant="outline" className="w-fit" onClick={addFilter}>
                  Add Filter
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-lg font-black text-slate-950 dark:text-white">Step 4 - Grouping & Aggregates</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  Group by
                  <select
                    value={groupBy}
                    onChange={(event) => setGroupBy(event.target.value)}
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="">No grouping</option>
                    {selectedFieldObjects.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  Aggregate
                  <select
                    value={aggregateField}
                    onChange={(event) => setAggregateField(event.target.value)}
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    {numericFields.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  Function
                  <select
                    value={aggregateFunction}
                    onChange={(event) => setAggregateFunction(event.target.value as AggregateFunction)}
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="sum">Sum</option>
                    <option value="avg">Average</option>
                    <option value="count">Count</option>
                    <option value="min">Min</option>
                    <option value="max">Max</option>
                  </select>
                </label>
              </div>
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <Group size={16} />
                  Grouped by {selectedFieldObjects.find((field) => field.id === groupBy)?.label ?? "None"} with {aggregateFunction.toUpperCase()} on{" "}
                  {selectedFieldObjects.find((field) => field.id === aggregateField)?.label ?? "selected values"}.
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-lg font-black text-slate-950 dark:text-white">Step 5 - Preview</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                First 10 rows with full column headers. Run the full report to load all data.
              </p>
              <PreviewTable fields={selectedFieldObjects} rows={previewRows} />
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/reports/custom/department-cost-center">
                  <Button>
                    <Play size={16} />
                    Run Full Report
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => setSaveOpen(true)}>
                  <Save size={16} />
                  Save
                </Button>
                <Button variant="outline" onClick={() => setScheduleOpen(true)}>
                  <Send size={16} />
                  Schedule
                </Button>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between border-t border-slate-200 pt-5 dark:border-slate-800">
            <Button variant="outline" disabled={step === 1} onClick={() => setStep((current) => Math.max(1, current - 1))}>
              <ArrowLeft size={16} />
              Back
            </Button>
            <Button disabled={step === 5} onClick={() => setStep((current) => Math.min(5, current + 1))}>
              Next
              <ArrowRight size={16} />
            </Button>
          </div>
        </section>

        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">Builder Summary</h2>
          <div className="mt-5 grid gap-3 text-sm">
            <SummaryLine label="Entity" value={entity} />
            <SummaryLine label="Fields" value={String(selectedFields.length)} />
            <SummaryLine label="Filters" value={String(filters.length)} />
            <SummaryLine label="Group by" value={selectedFieldObjects.find((field) => field.id === groupBy)?.label ?? "None"} />
            <SummaryLine label="Aggregate" value={aggregateFunction.toUpperCase()} />
          </div>
          <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
            Saved reports can be scheduled daily, weekly, or monthly and exported from the saved report detail page.
          </div>
        </aside>
      </div>

      <SaveDialog open={saveOpen} onOpenChange={setSaveOpen} />
      <ScheduleDialog open={scheduleOpen} onOpenChange={setScheduleOpen} />
    </div>
  );
}

function PreviewTable({ fields, rows }: { fields: CustomReportField[]; rows: Array<Record<string, string | number>> }) {
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              {fields.map((field) => (
                <th key={field.id} className="px-4 py-3">
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row, index) => (
              <tr key={index}>
                {fields.map((field) => (
                  <td key={field.id} className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {formatCell(row[field.id], field.type)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-black text-slate-950 dark:text-white">{value}</span>
    </div>
  );
}

function formatCell(value: string | number, type: CustomReportField["type"]) {
  if (type === "currency") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
      Number(value),
    );
  }
  if (type === "percentage") return `${value}%`;
  return String(value ?? "");
}
