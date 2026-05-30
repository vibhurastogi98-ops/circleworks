"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addEdge,
  Background,
  BackgroundVariant,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  getBezierPath,
  type Connection,
  type Edge,
  type EdgeProps,
  MarkerType,
  type Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  Bell,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  Copy,
  GitBranch,
  Globe2,
  History,
  Mail,
  MessageSquare,
  Play,
  Plus,
  RefreshCcw,
  Repeat2,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  Webhook,
  Zap,
} from "lucide-react";

import { ActionNode } from "@/components/workflows/nodes/ActionNode";
import { ConditionNode } from "@/components/workflows/nodes/ConditionNode";
import { TriggerNode } from "@/components/workflows/nodes/TriggerNode";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ACTION_LIBRARY,
  ACTIVE_AUTOMATIONS,
  ALL_AUTOMATION_RECIPES,
  AUTOMATION_CATEGORIES,
  AUTOMATION_TEMPLATES,
  EVENT_TRIGGERS,
  SCHEDULE_TRIGGERS,
  WEBHOOK_TRIGGER,
  type AutomationCategory,
  type AutomationRecipe,
  type AutomationRunRecord,
  type AutomationRunStatus,
  type AutomationStatus,
  type AutomationTriggerType,
} from "@/data/mockAutomations";
import type { WorkflowNodeData } from "@/data/mockWorkflows";

type AutomationsResponse = {
  automations: AutomationRecipe[];
  templates: AutomationRecipe[];
  source: "mock" | "database";
};

type AutomationRunsResponse = {
  runs: AutomationRunRecord[];
};

type HubTab = "All" | "My Automations" | "Templates";
type ConditionRule = {
  field: string;
  operator: string;
  value: string;
  join: "AND" | "OR";
};

const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
};

const defaultTriggerNode: Node<WorkflowNodeData> = {
  id: "trigger-1",
  type: "trigger",
  position: { x: 80, y: 180 },
  data: {
    label: "Employee Hired",
    triggerEvent: "Employee Hired",
    triggerType: "event",
  },
};

const emptyResponse: AutomationsResponse = {
  automations: ACTIVE_AUTOMATIONS,
  templates: AUTOMATION_TEMPLATES,
  source: "mock",
};

const categoryStyles: Record<AutomationCategory, string> = {
  Onboarding: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-200",
  Offboarding: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  Payroll: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200",
  Compliance: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200",
  Hiring: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-200",
  Benefits: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200",
  Time: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-200",
};

const statusStyles: Record<AutomationStatus, string> = {
  Active: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200",
  Paused: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200",
  Draft: "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const runStatusStyles: Record<AutomationRunStatus, string> = {
  Queued: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  Running: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-200",
  Success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200",
  Failed: "border-red-200 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200",
  Skipped: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200",
};

const categoryIcons: Record<AutomationCategory, React.ElementType> = {
  Onboarding: UserPlus,
  Offboarding: Users,
  Payroll: RefreshCcw,
  Compliance: ShieldCheck,
  Hiring: Search,
  Benefits: BookOpenCheck,
  Time: CalendarClock,
};

const actionIcons: Record<string, React.ElementType> = {
  email: Mail,
  slack: MessageSquare,
  task: CheckCircle2,
  update: RefreshCcw,
  notification: Bell,
  http: Globe2,
  delay: Clock,
  loop: Repeat2,
};

const conditionFields = [
  "employee.department",
  "employee.location",
  "employee.status",
  "employee.manager_id",
  "pto.days_requested",
  "pto.balance",
  "expense.amount",
  "candidate.stage",
  "time.hours_week",
];

const conditionOperators = ["equals", "contains", "greater_than", "less_than", "is_empty"];
const emailTemplates = ["New hire welcome", "I-9 reminder", "PTO update", "Benefits enrollment", "Custom MJML template"];
const recipients = ["employee", "manager", "role:hr", "role:payroll", "custom email"];

function InsertStepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  onInsert,
}: EdgeProps & { onInsert: (edgeId: string) => void }) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <button
          type="button"
          aria-label="Add step between cards"
          onClick={(event) => {
            event.stopPropagation();
            onInsert(id);
          }}
          className="nodrag nopan pointer-events-auto absolute flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-600 shadow-md transition hover:bg-blue-50 dark:border-blue-400/30 dark:bg-slate-900 dark:text-blue-200 dark:hover:bg-blue-500/10"
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
        >
          <Plus className="h-4 w-4" />
        </button>
      </EdgeLabelRenderer>
    </>
  );
}

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

async function fetchAutomations(): Promise<AutomationsResponse> {
  const response = await fetch("/api/automations", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to load automations");
  return (await response.json()) as AutomationsResponse;
}

async function fetchAutomationRuns(automationId: string): Promise<AutomationRunsResponse> {
  const response = await fetch(`/api/automations/${encodeURIComponent(automationId)}/runs`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to load automation runs");
  return (await response.json()) as AutomationRunsResponse;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDuration(durationMs: number) {
  if (!durationMs) return "0 ms";
  if (durationMs < 1000) return `${durationMs} ms`;
  return `${(durationMs / 1000).toFixed(1)}s`;
}

function formatRunTime(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function getDbId(id: string) {
  return id.startsWith("db-") ? id : null;
}

function getTriggerTypeLabel(type: AutomationTriggerType) {
  if (type === "schedule") return "Schedule";
  if (type === "webhook") return "Webhook";
  return "Event";
}

function getActionIcon(actionId: string) {
  return actionIcons[actionId] ?? Play;
}

function getActionLabel(actionId: string) {
  return ACTION_LIBRARY.find((action) => action.id === actionId)?.label ?? "Run action";
}

function getConditions(data: WorkflowNodeData): ConditionRule[] {
  if (Array.isArray(data.conditions)) {
    return data.conditions.filter(Boolean) as ConditionRule[];
  }

  return [
    {
      field: typeof data.field === "string" ? data.field : "employee.department",
      operator: typeof data.operator === "string" ? data.operator : "equals",
      value: typeof data.value === "string" ? data.value : "Engineering",
      join: typeof data.conditionLogic === "string" && data.conditionLogic === "OR" ? "OR" : "AND",
    },
  ];
}

function makeActionData(actionId: string): WorkflowNodeData {
  const label = getActionLabel(actionId);
  return {
    label,
    actionType: actionId,
    template: actionId === "email" ? "New hire welcome" : undefined,
    recipients: actionId === "notification" ? "role:hr" : "employee",
    channel: actionId === "slack" ? "#people-ops" : undefined,
    message: actionId === "slack" || actionId === "notification" ? "{{employee.full_name}} needs attention" : undefined,
    dueOffset: actionId === "task" ? "+3 days" : undefined,
    url: actionId === "http" ? "https://api.example.com/webhooks/circleworks" : undefined,
    payload: actionId === "http" ? '{"employeeId":"{{employee.id}}","event":"{{trigger.event}}"}' : undefined,
    delayAmount: actionId === "delay" ? "2" : undefined,
    delayUnit: actionId === "delay" ? "days" : undefined,
    loopFilter: actionId === "loop" ? "employees.status = active" : undefined,
  };
}

function firstTrigger(nodes: Node<WorkflowNodeData>[]) {
  return nodes.find((node) => node.type === "trigger") ?? defaultTriggerNode;
}

function recipeFromLocal(id?: string | null) {
  if (!id) return null;
  return ALL_AUTOMATION_RECIPES.find((recipe) => recipe.id === id) ?? null;
}

function templateHref(templateId: string) {
  return `/app/automations/new?template=${encodeURIComponent(templateId)}`;
}

function StatusToggle({
  status,
  onToggle,
  disabled,
}: {
  status: AutomationStatus;
  onToggle: () => void;
  disabled?: boolean;
}) {
  const enabled = status === "Active";
  return (
    <button
      type="button"
      aria-label={enabled ? "Pause automation" : "Activate automation"}
      aria-pressed={enabled}
      disabled={disabled}
      onClick={onToggle}
      className={cx(
        "relative inline-flex h-7 w-12 items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50",
        enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700",
      )}
    >
      <span
        className={cx(
          "inline-flex h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
          enabled ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

function KpiCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ElementType;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{value}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{detail}</p>
        </div>
        <span className={cx("flex h-11 w-11 items-center justify-center rounded-lg", tone)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function AutomationListCard({
  automation,
  onToggle,
  onDelete,
  statusPending,
}: {
  automation: AutomationRecipe;
  onToggle: (automation: AutomationRecipe) => void;
  onDelete: (automation: AutomationRecipe) => void;
  statusPending: boolean;
}) {
  const Icon = categoryIcons[automation.category];

  return (
    <article className="p-4">
      <div className="flex items-start gap-3">
        <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border", categoryStyles[automation.category])}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-base font-black text-slate-950 dark:text-white">{automation.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{automation.description}</p>
            </div>
            <Badge className={automation.template ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-200" : statusStyles[automation.status]}>
              {automation.template ? "Template" : automation.status}
            </Badge>
          </div>

          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs font-black uppercase text-slate-400">Trigger</p>
              <p className="mt-1 font-bold text-slate-700 dark:text-slate-200">{automation.trigger}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-400">Last Run</p>
              <p className="mt-1 font-bold text-slate-700 dark:text-slate-200">{automation.lastRun}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-400">Runs</p>
              <p className="mt-1 font-black text-slate-950 dark:text-white">{formatNumber(automation.runCount)}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={categoryStyles[automation.category]}>{automation.category}</Badge>
              <span className="text-xs font-semibold text-slate-400">{automation.owner}</span>
              {!automation.template ? (
                <StatusToggle status={automation.status} onToggle={() => onToggle(automation)} disabled={statusPending} />
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {automation.template ? (
                <Link
                  href={templateHref(automation.id)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white transition hover:bg-blue-700"
                >
                  Use Template
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <>
                  <Link
                    href={`/app/automations/${encodeURIComponent(automation.id)}/runs`}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-blue-200 px-3 text-xs font-bold text-blue-700 transition hover:bg-blue-50 dark:border-blue-400/20 dark:text-blue-200 dark:hover:bg-blue-500/10"
                  >
                    <History className="h-3.5 w-3.5" />
                    Runs
                  </Link>
                  <Link
                    href={`/app/automations/${encodeURIComponent(automation.id)}/edit`}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(automation)}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-bold text-red-600 transition hover:bg-red-50 dark:border-red-400/20 dark:text-red-300 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function AutomationsHubScreen() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<HubTab>("All");
  const [statusOverrides, setStatusOverrides] = useState<Record<string, AutomationStatus>>({});
  const [hiddenIds, setHiddenIds] = useState<Record<string, boolean>>({});

  const { data = emptyResponse, isLoading } = useQuery({
    queryKey: ["automations"],
    queryFn: fetchAutomations,
    initialData: emptyResponse,
  });

  const automations = useMemo(
    () =>
      data.automations
        .filter((automation) => !hiddenIds[automation.id])
        .map((automation) => ({
          ...automation,
          status: statusOverrides[automation.id] ?? automation.status,
        })),
    [data.automations, hiddenIds, statusOverrides],
  );

  const visibleRows = activeTab === "Templates"
    ? data.templates
    : automations.filter((automation) => activeTab === "All" || automation.mine);

  const kpis = useMemo(() => {
    const activeAutomations = automations.filter((automation) => automation.status === "Active").length;
    const runsThisMonth = automations.reduce((sum, automation) => sum + automation.runsThisMonth, 0);
    const timeSavedHours = automations.reduce((sum, automation) => sum + automation.timeSavedHours, 0);
    const errors = automations.reduce((sum, automation) => sum + automation.errors, 0);
    return { activeAutomations, runsThisMonth, timeSavedHours, errors };
  }, [automations]);

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AutomationStatus }) => {
      const dbId = getDbId(id);
      if (!dbId) return { mock: true };
      const response = await fetch(`/api/automations/${dbId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update automation");
      return response.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["automations"] });
    },
    onError: () => toast.error("Could not update automation status."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const dbId = getDbId(id);
      if (!dbId) return { mock: true };
      const response = await fetch(`/api/automations/${dbId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete automation");
      return response.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["automations"] });
      toast.success("Automation deleted.");
    },
    onError: () => toast.error("Could not delete automation."),
  });

  const toggleStatus = (automation: AutomationRecipe) => {
    const nextStatus: AutomationStatus = automation.status === "Active" ? "Paused" : "Active";
    setStatusOverrides((current) => ({ ...current, [automation.id]: nextStatus }));
    statusMutation.mutate({ id: automation.id, status: nextStatus });
  };

  const deleteAutomation = (automation: AutomationRecipe) => {
    setHiddenIds((current) => ({ ...current, [automation.id]: true }));
    deleteMutation.mutate(automation.id);
  };

  return (
    <section className="min-h-full bg-gray-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-200">
                Recipes Engine
              </Badge>
              {isLoading ? <span className="text-xs text-slate-500">Loading...</span> : null}
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              Automations
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Build event, schedule, and webhook workflows across HR, payroll, compliance, time, hiring, and benefits.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/app/automations/templates"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              Browse Templates
            </Link>
            <Link
              href="/app/automations/new"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              New Automation
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Active Automations" value={formatNumber(kpis.activeAutomations)} detail="Currently running recipes" icon={Zap} tone="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300" />
          <KpiCard label="Runs This Month" value={formatNumber(kpis.runsThisMonth)} detail="Across all triggers" icon={Play} tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" />
          <KpiCard label="Time Saved Est." value={`${formatNumber(kpis.timeSavedHours)}h`} detail="Based on configured steps" icon={Clock} tone="bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300" />
          <KpiCard label="Errors" value={formatNumber(kpis.errors)} detail="Needs review" icon={ShieldCheck} tone="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300" />
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950 dark:text-white">Automation List</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Review triggers, activity, ownership, and status.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["All", "My Automations", "Templates"] as HubTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cx(
                    "rounded-lg px-3 py-2 text-sm font-bold transition",
                    activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 xl:hidden">
            {visibleRows.map((automation) => (
              <AutomationListCard
                key={automation.id}
                automation={automation}
                onToggle={toggleStatus}
                onDelete={deleteAutomation}
                statusPending={statusMutation.isPending}
              />
            ))}
          </div>

          <div className="hidden overflow-x-auto xl:block">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900/80">
                <tr>
                  {["Title", "Trigger", "Last run", "Runs", "Status", "Actions"].map((heading) => (
                    <th key={heading} className="px-5 py-3 text-left text-xs font-black uppercase text-slate-500 dark:text-slate-400">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {visibleRows.map((automation) => {
                  const Icon = categoryIcons[automation.category];
                  return (
                    <tr key={automation.id} className="align-top transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-5 py-4">
                        <div className="flex min-w-[260px] gap-3">
                          <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border", categoryStyles[automation.category])}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="font-bold text-slate-950 dark:text-white">{automation.title}</p>
                            <p className="mt-1 line-clamp-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{automation.description}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <Badge className={categoryStyles[automation.category]}>{automation.category}</Badge>
                              <span className="text-xs font-semibold text-slate-400">{automation.owner}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="min-w-[180px]">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{automation.trigger}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{getTriggerTypeLabel(automation.triggerType)} trigger</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{automation.lastRun}</td>
                      <td className="px-5 py-4 text-sm font-black text-slate-950 dark:text-white">{formatNumber(automation.runCount)}</td>
                      <td className="px-5 py-4">
                        {automation.template ? (
                          <Badge className="border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-200">
                            Template
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-3">
                            <StatusToggle status={automation.status} onToggle={() => toggleStatus(automation)} disabled={statusMutation.isPending} />
                            <Badge className={statusStyles[automation.status]}>{automation.status}</Badge>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex min-w-[190px] flex-wrap items-center gap-2">
                          {automation.template ? (
                            <Link
                              href={templateHref(automation.id)}
                              className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white transition hover:bg-blue-700"
                            >
                              Use Template
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          ) : (
                            <>
                              <Link
                                href={`/app/automations/${encodeURIComponent(automation.id)}/runs`}
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-blue-200 px-3 text-xs font-bold text-blue-700 transition hover:bg-blue-50 dark:border-blue-400/20 dark:text-blue-200 dark:hover:bg-blue-500/10"
                              >
                                <History className="h-3.5 w-3.5" />
                                Runs
                              </Link>
                              <Link
                                href={`/app/automations/${encodeURIComponent(automation.id)}/edit`}
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                              >
                                <Settings2 className="h-3.5 w-3.5" />
                                Edit
                              </Link>
                              <button
                                type="button"
                                onClick={() => deleteAutomation(automation)}
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-bold text-red-600 transition hover:bg-red-50 dark:border-red-400/20 dark:text-red-300 dark:hover:bg-red-500/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AutomationTemplatesLibraryScreen() {
  const [activeCategory, setActiveCategory] = useState<AutomationCategory | "All">("All");
  const { data = emptyResponse } = useQuery({
    queryKey: ["automations"],
    queryFn: fetchAutomations,
    initialData: emptyResponse,
  });

  const templates = useMemo(
    () => data.templates.filter((template) => activeCategory === "All" || template.category === activeCategory),
    [activeCategory, data.templates],
  );

  return (
    <section className="min-h-full bg-gray-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
              Template Library
            </Badge>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              Automation Templates
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
              Start from proven HR, payroll, compliance, hiring, benefits, and time recipes, then tune the steps in the builder.
            </p>
          </div>
          <Link
            href="/app/automations/new"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Blank Automation
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["All", ...AUTOMATION_CATEGORIES] as Array<AutomationCategory | "All">).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={cx(
                "shrink-0 rounded-lg border px-4 py-2 text-sm font-bold transition",
                activeCategory === category
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => {
            const Icon = categoryIcons[template.category];
            return (
              <Link
                key={template.id}
                href={templateHref(template.id)}
                className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-400/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={cx("flex h-11 w-11 items-center justify-center rounded-lg border", categoryStyles[template.category])}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <Badge className={categoryStyles[template.category]}>{template.category}</Badge>
                </div>
                <h2 className="mt-5 text-lg font-black text-slate-950 dark:text-white">{template.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{template.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">{getTriggerTypeLabel(template.triggerType)}</Badge>
                  <Badge variant="outline">{template.steps.length} steps</Badge>
                </div>
                <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <p className="text-xs font-black uppercase text-slate-400">Flow</p>
                  <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {template.trigger} to {template.steps.slice(0, 2).join(" + ")}
                  </p>
                </div>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600 dark:text-blue-300">
                  Open in builder
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LibraryButton({
  icon: Icon,
  title,
  detail,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-400/30 dark:hover:bg-blue-500/10"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white dark:bg-slate-800 dark:text-slate-300">
          <Icon className="h-4 w-4" />
        </span>
        <span>
          <span className="block text-sm font-black text-slate-950 dark:text-white">{title}</span>
          <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{detail}</span>
        </span>
      </div>
    </button>
  );
}

function ConfigInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-500/20"
      />
    </label>
  );
}

function ConfigSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-500/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ConfigTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-500/20"
      />
    </label>
  );
}

function BuilderConfigPanel({
  selectedNode,
  automationId,
  onUpdate,
  onDelete,
}: {
  selectedNode: Node<WorkflowNodeData> | null;
  automationId: string;
  onUpdate: (patch: Partial<WorkflowNodeData>) => void;
  onDelete: () => void;
}) {
  if (!selectedNode) {
    return (
      <aside className="flex h-full flex-col border-l border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
          <SlidersHorizontal className="h-8 w-8 text-slate-400" />
          <h3 className="mt-4 font-black text-slate-950 dark:text-white">Select a step</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Configure trigger, branch, or action details here.</p>
        </div>
      </aside>
    );
  }

  const data = selectedNode.data;
  const actionType = typeof data.actionType === "string" ? data.actionType : "email";
  const rules = getConditions(data);

  return (
    <aside className="h-full overflow-y-auto border-l border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Step Config</p>
          <h3 className="mt-1 text-lg font-black text-slate-950 dark:text-white">
            {selectedNode.type === "trigger" ? "Trigger" : selectedNode.type === "condition" ? "Condition" : "Action"}
          </h3>
        </div>
        {selectedNode.type !== "trigger" ? (
          <button
            type="button"
            onClick={onDelete}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 dark:border-red-400/20 dark:text-red-300 dark:hover:bg-red-500/10"
            aria-label="Delete step"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-5 space-y-4">
        {selectedNode.type === "trigger" ? (
          <>
            <ConfigSelect
              label="Trigger type"
              value={typeof data.triggerType === "string" ? data.triggerType : "event"}
              options={["event", "schedule", "webhook"]}
              onChange={(value) => {
                const triggerType = value as AutomationTriggerType;
                const triggerEvent =
                  triggerType === "schedule" ? SCHEDULE_TRIGGERS[0] : triggerType === "webhook" ? WEBHOOK_TRIGGER : EVENT_TRIGGERS[0];
                onUpdate({ triggerType, triggerEvent, label: triggerEvent });
              }}
            />
            <ConfigSelect
              label="Trigger event"
              value={typeof data.triggerEvent === "string" ? data.triggerEvent : EVENT_TRIGGERS[0]}
              options={
                data.triggerType === "schedule"
                  ? SCHEDULE_TRIGGERS
                  : data.triggerType === "webhook"
                    ? [WEBHOOK_TRIGGER]
                    : EVENT_TRIGGERS
              }
              onChange={(value) => onUpdate({ triggerEvent: value, label: value })}
            />
            {data.triggerType === "webhook" ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-400/20 dark:bg-blue-500/10">
                <p className="text-xs font-black uppercase text-blue-700 dark:text-blue-200">Webhook URL</p>
                <p className="mt-2 break-all font-mono text-xs text-blue-800 dark:text-blue-100">
                  /api/webhooks/automations/{automationId}
                </p>
              </div>
            ) : null}
          </>
        ) : null}

        {selectedNode.type === "condition" ? (
          <>
            <ConfigSelect
              label="Branch logic"
              value={typeof data.conditionLogic === "string" ? data.conditionLogic : "AND"}
              options={["AND", "OR"]}
              onChange={(value) => onUpdate({ conditionLogic: value as "AND" | "OR" })}
            />
            <div className="space-y-3">
              {rules.map((rule, index) => (
                <div key={`${rule.field}-${index}`} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  {index > 0 ? (
                    <ConfigSelect
                      label="Join"
                      value={rule.join}
                      options={["AND", "OR"]}
                      onChange={(value) => {
                        const nextRules = [...rules];
                        nextRules[index] = { ...rule, join: value as "AND" | "OR" };
                        onUpdate({ conditions: nextRules, conditionLogic: value as "AND" | "OR" });
                      }}
                    />
                  ) : null}
                  <div className="mt-3 grid gap-3">
                    <ConfigSelect
                      label="Field"
                      value={rule.field}
                      options={conditionFields}
                      onChange={(value) => {
                        const nextRules = [...rules];
                        nextRules[index] = { ...rule, field: value };
                        onUpdate({ conditions: nextRules, field: value, label: `IF ${value} ${rule.operator} ${rule.value}` });
                      }}
                    />
                    <ConfigSelect
                      label="Operator"
                      value={rule.operator}
                      options={conditionOperators}
                      onChange={(value) => {
                        const nextRules = [...rules];
                        nextRules[index] = { ...rule, operator: value };
                        onUpdate({ conditions: nextRules, operator: value, label: `IF ${rule.field} ${value} ${rule.value}` });
                      }}
                    />
                    <ConfigInput
                      label="Value"
                      value={rule.value}
                      onChange={(value) => {
                        const nextRules = [...rules];
                        nextRules[index] = { ...rule, value };
                        onUpdate({ conditions: nextRules, value, label: `IF ${rule.field} ${rule.operator} ${value}` });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                const nextRules = rules.concat({
                  field: "employee.department",
                  operator: "equals",
                  value: "Engineering",
                  join: "AND",
                });
                onUpdate({ conditions: nextRules });
              }}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Add condition
            </button>
          </>
        ) : null}

        {selectedNode.type === "action" ? (
          <>
            <ConfigSelect
              label="Action type"
              value={actionType}
              options={ACTION_LIBRARY.map((action) => action.id)}
              onChange={(value) => onUpdate({ ...makeActionData(value), label: getActionLabel(value), actionType: value })}
            />
            <ConfigInput
              label="Step name"
              value={typeof data.label === "string" ? data.label : getActionLabel(actionType)}
              onChange={(value) => onUpdate({ label: value })}
            />
            {actionType === "email" ? (
              <>
                <ConfigSelect label="Template" value={typeof data.template === "string" ? data.template : emailTemplates[0]} options={emailTemplates} onChange={(value) => onUpdate({ template: value })} />
                <ConfigSelect label="Recipient" value={typeof data.recipients === "string" ? data.recipients : recipients[0]} options={recipients} onChange={(value) => onUpdate({ recipients: value })} />
                <ConfigTextarea label="Variables" value={typeof data.payload === "string" ? data.payload : '{"firstName":"{{employee.first_name}}"}'} onChange={(value) => onUpdate({ payload: value })} />
              </>
            ) : null}
            {actionType === "slack" ? (
              <>
                <ConfigInput label="Channel" value={typeof data.channel === "string" ? data.channel : "#people-ops"} onChange={(value) => onUpdate({ channel: value })} />
                <ConfigTextarea label="Message template" value={typeof data.message === "string" ? data.message : "{{employee.full_name}} triggered {{automation.title}}"} onChange={(value) => onUpdate({ message: value })} />
              </>
            ) : null}
            {actionType === "task" ? (
              <>
                <ConfigSelect label="Assignee" value={typeof data.recipients === "string" ? data.recipients : "manager"} options={recipients} onChange={(value) => onUpdate({ recipients: value })} />
                <ConfigInput label="Due date" value={typeof data.dueOffset === "string" ? data.dueOffset : "+3 days"} onChange={(value) => onUpdate({ dueOffset: value })} />
                <ConfigTextarea label="Description" value={typeof data.message === "string" ? data.message : "Complete task for {{employee.full_name}}."} onChange={(value) => onUpdate({ message: value })} />
              </>
            ) : null}
            {actionType === "update" ? (
              <>
                <ConfigSelect label="Employee field" value={typeof data.field === "string" ? data.field : "employee.status"} options={conditionFields.slice(0, 4)} onChange={(value) => onUpdate({ field: value })} />
                <ConfigInput label="New value" value={typeof data.value === "string" ? data.value : "active"} onChange={(value) => onUpdate({ value })} />
              </>
            ) : null}
            {actionType === "notification" ? (
              <>
                <ConfigSelect label="Notify" value={typeof data.recipients === "string" ? data.recipients : "role:hr"} options={recipients} onChange={(value) => onUpdate({ recipients: value })} />
                <ConfigTextarea label="Notification message" value={typeof data.message === "string" ? data.message : "{{employee.full_name}} needs review."} onChange={(value) => onUpdate({ message: value })} />
              </>
            ) : null}
            {actionType === "http" ? (
              <>
                <ConfigInput label="POST URL" value={typeof data.url === "string" ? data.url : "https://api.example.com/webhooks/circleworks"} onChange={(value) => onUpdate({ url: value })} />
                <ConfigTextarea label="Headers JSON" value={typeof data.headers === "string" ? data.headers : '{"Authorization":"Bearer {{secret.token}}"}'} onChange={(value) => onUpdate({ headers: value })} />
                <ConfigTextarea label="Body JSON" value={typeof data.payload === "string" ? data.payload : '{"employeeId":"{{employee.id}}"}'} onChange={(value) => onUpdate({ payload: value })} />
              </>
            ) : null}
            {actionType === "delay" ? (
              <div className="grid grid-cols-2 gap-3">
                <ConfigInput label="Wait" value={typeof data.delayAmount === "string" ? data.delayAmount : "2"} onChange={(value) => onUpdate({ delayAmount: value })} />
                <ConfigSelect label="Unit" value={typeof data.delayUnit === "string" ? data.delayUnit : "days"} options={["hours", "days"]} onChange={(value) => onUpdate({ delayUnit: value as "hours" | "days" })} />
              </div>
            ) : null}
            {actionType === "loop" ? (
              <>
                <ConfigInput label="For each" value={typeof data.loopFilter === "string" ? data.loopFilter : "employees.status = active"} onChange={(value) => onUpdate({ loopFilter: value })} />
                <ConfigTextarea label="Nested step summary" value={typeof data.message === "string" ? data.message : "Run following steps for each matching employee."} onChange={(value) => onUpdate({ message: value })} />
              </>
            ) : null}
          </>
        ) : null}
      </div>
    </aside>
  );
}

export function AutomationBuilderScreen({
  templateId,
  automationId,
}: {
  templateId?: string | null;
  automationId?: string | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data = emptyResponse } = useQuery({
    queryKey: ["automations"],
    queryFn: fetchAutomations,
    initialData: emptyResponse,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<WorkflowNodeData>>([defaultTriggerNode]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [title, setTitle] = useState("Untitled automation");
  const [description, setDescription] = useState("Describe what this recipe automates.");
  const [category, setCategory] = useState<AutomationCategory>("Onboarding");
  const [status, setStatus] = useState<AutomationStatus>("Draft");
  const [loadedSource, setLoadedSource] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("trigger-1");

  const selectedRecipe = useMemo(() => {
    const allRecipes = [...data.automations, ...data.templates];
    const requestedId = templateId ?? automationId;
    return allRecipes.find((recipe) => recipe.id === requestedId) ?? recipeFromLocal(requestedId);
  }, [automationId, data.automations, data.templates, templateId]);

  useEffect(() => {
    const sourceKey = templateId ? `template:${templateId}` : automationId ? `automation:${automationId}` : "new";
    if (loadedSource === sourceKey) return;

    if (selectedRecipe) {
      setTitle(selectedRecipe.template ? `${selectedRecipe.title} copy` : selectedRecipe.title);
      setDescription(selectedRecipe.description);
      setCategory(selectedRecipe.category);
      setStatus(selectedRecipe.template ? "Draft" : selectedRecipe.status);
      setNodes(selectedRecipe.nodes.length ? selectedRecipe.nodes : [defaultTriggerNode]);
      setEdges(selectedRecipe.edges);
      setSelectedNodeId(selectedRecipe.nodes[0]?.id ?? "trigger-1");
      setLoadedSource(sourceKey);
      return;
    }

    if (!templateId && !automationId) {
      setNodes([defaultTriggerNode]);
      setEdges([]);
      setSelectedNodeId("trigger-1");
      setLoadedSource(sourceKey);
    }
  }, [automationId, loadedSource, selectedRecipe, setEdges, setNodes, templateId]);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const triggerNode = firstTrigger(nodes);
  const trigger = typeof triggerNode.data.triggerEvent === "string" ? triggerNode.data.triggerEvent : "Employee Hired";
  const triggerType = typeof triggerNode.data.triggerType === "string" ? (triggerNode.data.triggerType as AutomationTriggerType) : "event";

  const saveMutation = useMutation({
    mutationFn: async (nextStatus: AutomationStatus) => {
      const response = await fetch("/api/automations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          trigger,
          triggerType,
          status: nextStatus,
          template: false,
          templateId: templateId ?? selectedRecipe?.id,
          nodes,
          edges,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error ?? "Failed to save automation");
      }

      return response.json();
    },
    onSuccess: (_, nextStatus) => {
      void queryClient.invalidateQueries({ queryKey: ["automations"] });
      toast.success(nextStatus === "Active" ? "Automation activated." : "Automation saved.");
      router.push("/app/automations");
    },
    onError: (error) => toast.error(error.message),
  });

  const updateSelectedNode = (patch: Partial<WorkflowNodeData>) => {
    if (!selectedNode) return;
    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: { ...node.data, ...patch },
            }
          : node,
      ),
    );
  };

  const deleteSelectedNode = () => {
    if (!selectedNode || selectedNode.type === "trigger") return;
    setNodes((currentNodes) => currentNodes.filter((node) => node.id !== selectedNode.id));
    setEdges((currentEdges) => currentEdges.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setSelectedNodeId("trigger-1");
  };

  const updateTrigger = (triggerEvent: string, nextTriggerType: AutomationTriggerType) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.type === "trigger"
          ? {
              ...node,
              data: {
                ...node.data,
                label: triggerEvent,
                triggerEvent,
                triggerType: nextTriggerType,
              },
            }
          : node,
      ),
    );
    setSelectedNodeId("trigger-1");
  };

  const addAutomationNode = (type: "condition" | "action", actionId = "email") => {
    const previousNode = nodes[nodes.length - 1];
    const id = `${type}-${Date.now()}-${nodes.length}`;
    const newNode: Node<WorkflowNodeData> = {
      id,
      type,
      position: {
        x: 120 + nodes.length * 260,
        y: 160 + (nodes.length % 3) * 115,
      },
      data:
        type === "condition"
          ? {
              label: "IF employee.department equals Engineering",
              conditionLogic: "AND",
              field: "employee.department",
              operator: "equals",
              value: "Engineering",
              conditions: [
                {
                  field: "employee.department",
                  operator: "equals",
                  value: "Engineering",
                  join: "AND",
                },
              ],
            }
          : makeActionData(actionId),
    };

    setNodes((currentNodes) => currentNodes.concat(newNode));
    if (previousNode) {
      setEdges((currentEdges) =>
        currentEdges.concat({
          id: `e-${previousNode.id}-${newNode.id}`,
          source: previousNode.id,
          sourceHandle: previousNode.type === "condition" ? "true" : undefined,
          target: newNode.id,
          markerEnd: { type: MarkerType.ArrowClosed },
          animated: previousNode.type === "trigger",
        }),
      );
    }
    setSelectedNodeId(id);
  };

  const insertNodeOnEdge = useCallback(
    (edgeId: string) => {
      const edge = edges.find((item) => item.id === edgeId);
      if (!edge) return;

      const sourceNode = nodes.find((node) => node.id === edge.source);
      const targetNode = nodes.find((node) => node.id === edge.target);
      const id = `action-${Date.now()}-${nodes.length}`;
      const newNode: Node<WorkflowNodeData> = {
        id,
        type: "action",
        position: {
          x: sourceNode && targetNode ? (sourceNode.position.x + targetNode.position.x) / 2 : 260 + nodes.length * 180,
          y: sourceNode && targetNode ? (sourceNode.position.y + targetNode.position.y) / 2 + 90 : 220,
        },
        data: makeActionData("email"),
      };

      setNodes((currentNodes) => currentNodes.concat(newNode));
      setEdges((currentEdges) =>
        currentEdges.flatMap((item) => {
          if (item.id !== edgeId) return [item];
          return [
            {
              ...item,
              id: `e-${item.source}-${id}`,
              target: id,
              markerEnd: { type: MarkerType.ArrowClosed },
            },
            {
              id: `e-${id}-${item.target}`,
              source: id,
              target: item.target,
              markerEnd: { type: MarkerType.ArrowClosed },
            },
          ];
        }),
      );
      setSelectedNodeId(id);
      toast.success("Step inserted between cards.");
    },
    [edges, nodes, setEdges, setNodes],
  );

  const edgeTypes = useMemo(
    () => ({
      insert: (edgeProps: EdgeProps) => <InsertStepEdge {...edgeProps} onInsert={insertNodeOnEdge} />,
    }),
    [insertNodeOnEdge],
  );

  const canvasEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        type: "insert",
        markerEnd: edge.markerEnd ?? { type: MarkerType.ArrowClosed },
      })),
    [edges],
  );

  return (
    <section className="min-h-full bg-gray-50 dark:bg-slate-950 xl:flex xl:h-full xl:min-h-[calc(100dvh-4rem)] xl:flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={categoryStyles[category]}>{category}</Badge>
              <Badge className={statusStyles[status]}>{status}</Badge>
              <span className="text-xs font-bold text-slate-400">Trigger: {trigger}</span>
            </div>
            <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(280px,420px)_minmax(320px,1fr)_180px]">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-xl font-black text-slate-950 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-500/20"
              />
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-blue-500/20"
              />
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as AutomationCategory)}
                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-blue-500/20"
              >
                {AUTOMATION_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/app/automations/templates"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Copy className="h-4 w-4" />
              Templates
            </Link>
            <Button
              variant="outline"
              className="h-10 rounded-lg"
              disabled={saveMutation.isPending}
              onClick={() => {
                setStatus("Draft");
                saveMutation.mutate("Draft");
              }}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button
              className="h-10 rounded-lg bg-blue-600 shadow-blue-600/20 hover:bg-blue-700"
              disabled={saveMutation.isPending}
              onClick={() => {
                setStatus("Active");
                saveMutation.mutate("Active");
              }}
            >
              <Zap className="mr-2 h-4 w-4" />
              Activate
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:min-h-0 xl:flex-1 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
        <aside className="max-h-[560px] overflow-y-auto border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 xl:max-h-none xl:min-h-0 xl:border-b-0 xl:border-r">
          <div className="space-y-5">
            <div>
              <p className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Trigger Select</p>
              <div className="mt-3 space-y-3">
                <div>
                  <p className="mb-2 text-xs font-bold text-slate-400">Event Triggers</p>
                  <div className="grid grid-cols-1 gap-2">
                    {EVENT_TRIGGERS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => updateTrigger(item, "event")}
                        className={cx(
                          "rounded-lg border px-3 py-2 text-left text-sm font-bold transition",
                          trigger === item
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400/40 dark:bg-blue-500/10 dark:text-blue-200"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800",
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-bold text-slate-400">Schedule Triggers</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SCHEDULE_TRIGGERS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => updateTrigger(item, "schedule")}
                        className={cx(
                          "rounded-lg border px-3 py-2 text-left text-sm font-bold transition",
                          trigger === item
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800",
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateTrigger(WEBHOOK_TRIGGER, "webhook")}
                  className={cx(
                    "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-bold transition",
                    trigger === WEBHOOK_TRIGGER
                      ? "border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-400/40 dark:bg-violet-500/10 dark:text-violet-200"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800",
                  )}
                >
                  <Webhook className="h-4 w-4" />
                  Webhook Trigger
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Condition Step</p>
              <div className="mt-3">
                <LibraryButton
                  icon={GitBranch}
                  title="IF / THEN branch"
                  detail="Field, operator, value, and AND/OR logic."
                  onClick={() => addAutomationNode("condition")}
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Action Steps</p>
              <div className="mt-3 space-y-2">
                {ACTION_LIBRARY.map((action) => {
                  const Icon = getActionIcon(action.id);
                  return (
                    <LibraryButton
                      key={action.id}
                      icon={Icon}
                      title={action.label}
                      detail={action.description}
                      onClick={() => addAutomationNode("action", action.id)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <div className="min-h-[620px] bg-slate-100 dark:bg-slate-950">
          <ReactFlow
            nodes={nodes}
            edges={canvasEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={(connection: Connection) =>
              setEdges((currentEdges) =>
                addEdge(
                  {
                    ...connection,
                    id: `e-${connection.source}-${connection.target}-${Date.now()}`,
                    markerEnd: { type: MarkerType.ArrowClosed },
                  },
                  currentEdges,
                ),
              )
            }
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId("")}
            fitView
            className="automation-builder-canvas"
          >
            <Background variant={BackgroundVariant.Dots} gap={18} size={1.2} />
            <Controls />
          </ReactFlow>
        </div>

        <BuilderConfigPanel
          selectedNode={selectedNode}
          automationId={automationId?.startsWith("db-") ? automationId.slice(3) : automationId ?? "{{automationId}}"}
          onUpdate={updateSelectedNode}
          onDelete={deleteSelectedNode}
        />
      </div>
    </section>
  );
}

export function AutomationRunsScreen({ automationId }: { automationId: string }) {
  const queryClient = useQueryClient();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const { data: automationsData = emptyResponse } = useQuery({
    queryKey: ["automations"],
    queryFn: fetchAutomations,
    initialData: emptyResponse,
  });
  const { data = { runs: [] }, isLoading } = useQuery({
    queryKey: ["automation-runs", automationId],
    queryFn: () => fetchAutomationRuns(automationId),
  });

  const recipe = useMemo(() => {
    const allRecipes = [...automationsData.automations, ...automationsData.templates];
    return allRecipes.find((item) => item.id === automationId) ?? recipeFromLocal(automationId);
  }, [automationId, automationsData.automations, automationsData.templates]);

  const selectedRun = useMemo(
    () => data.runs.find((run) => run.id === selectedRunId) ?? data.runs[0] ?? null,
    [data.runs, selectedRunId],
  );

  useEffect(() => {
    if (!selectedRunId && data.runs[0]) {
      setSelectedRunId(data.runs[0].id);
    }
  }, [data.runs, selectedRunId]);

  const retryMutation = useMutation({
    mutationFn: async (runId: string) => {
      const response = await fetch(
        `/api/automations/${encodeURIComponent(automationId)}/runs/${encodeURIComponent(runId)}/retry`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (!response.ok) throw new Error("Failed to retry run");
      return response.json() as Promise<{ run: AutomationRunRecord }>;
    },
    onSuccess: ({ run }) => {
      queryClient.setQueryData<AutomationRunsResponse>(["automation-runs", automationId], (current) => ({
        runs: [run, ...(current?.runs.filter((item) => item.id !== run.id) ?? [])],
      }));
      setSelectedRunId(run.id);
      void queryClient.invalidateQueries({ queryKey: ["automations"] });
      toast.success("Retry queued for this automation.");
    },
    onError: () => toast.error("Could not retry this run."),
  });

  return (
    <section className="min-h-full bg-gray-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-200">
                Run History
              </Badge>
              {recipe ? <Badge className={categoryStyles[recipe.category]}>{recipe.category}</Badge> : null}
              {isLoading ? <span className="text-xs text-slate-500">Loading...</span> : null}
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              {recipe?.title ?? "Automation"} Runs
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Review trigger timestamps, outcomes, duration, affected records, and step-level payloads.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/app/automations/${encodeURIComponent(automationId)}/edit`}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Settings2 className="h-4 w-4" />
              Edit
            </Link>
            <Link
              href="/app/automations"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Back to Hub
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {data.runs.some((run) => run.status === "Failed") ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">
            Failure handling is active: failed runs queue admin email delivery and create notification-center alerts with a link back to the run.
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-4 dark:border-slate-800">
              <h2 className="text-lg font-black text-slate-950 dark:text-white">Runs</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Click a row to inspect every step outcome and data payload.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-900/80">
                  <tr>
                    {["Timestamp", "Trigger", "Status", "Duration", "Affected Entity", "Actions"].map((heading) => (
                      <th key={heading} className="px-5 py-3 text-left text-xs font-black uppercase text-slate-500 dark:text-slate-400">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.runs.map((run) => (
                    <tr
                      key={run.id}
                      onClick={() => setSelectedRunId(run.id)}
                      className={cx(
                        "cursor-pointer align-top transition hover:bg-slate-50 dark:hover:bg-slate-800/50",
                        selectedRun?.id === run.id && "bg-blue-50/70 dark:bg-blue-500/10",
                      )}
                    >
                      <td className="px-5 py-4 text-sm font-bold text-slate-800 dark:text-slate-100">{formatRunTime(run.timestamp)}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{run.trigger}</td>
                      <td className="px-5 py-4">
                        <Badge className={runStatusStyles[run.status]}>{run.status}</Badge>
                      </td>
                      <td className="px-5 py-4 text-sm font-black text-slate-950 dark:text-white">{formatDuration(run.durationMs)}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{run.affectedEntity}</td>
                      <td className="px-5 py-4">
                        {run.status === "Failed" ? (
                          <button
                            type="button"
                            disabled={retryMutation.isPending}
                            onClick={(event) => {
                              event.stopPropagation();
                              retryMutation.mutate(run.id);
                            }}
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <RefreshCcw className="h-3.5 w-3.5" />
                            Retry
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">Open details</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!data.runs.length ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                        No runs yet. Webhook, event, and schedule triggers will appear here as soon as they execute.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-4 dark:border-slate-800">
              <p className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Run Detail</p>
              <h2 className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                {selectedRun ? formatRunTime(selectedRun.timestamp) : "Select a run"}
              </h2>
              {selectedRun ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge className={runStatusStyles[selectedRun.status]}>{selectedRun.status}</Badge>
                  <Badge variant="outline">{formatDuration(selectedRun.durationMs)}</Badge>
                </div>
              ) : null}
            </div>

            <div className="max-h-[720px] space-y-3 overflow-y-auto p-4">
              {selectedRun?.errorMessage ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">
                  {selectedRun.errorMessage}
                </div>
              ) : null}

              {selectedRun?.stepResults.length ? (
                selectedRun.stepResults.map((step, index) => (
                  <div key={step.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase text-slate-400">Step {index + 1} · {step.type}</p>
                        <h3 className="mt-1 font-black text-slate-950 dark:text-white">{step.label}</h3>
                      </div>
                      <Badge className={runStatusStyles[step.status]}>{step.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{step.message}</p>
                    <pre className="mt-3 max-h-44 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">
{JSON.stringify(step.dataPassed, null, 2)}
                    </pre>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
                  <History className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Step data will populate after the worker completes this run.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
