"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Loader2,
  X,
} from "lucide-react";

import type {
  OnboardingChecklistState,
  OnboardingChecklistTaskId,
} from "@/lib/onboarding-checklist";

type ChecklistResponse = OnboardingChecklistState & {
  accountId: number | null;
  serverTracked: boolean;
  shouldShow: boolean;
};

type ChecklistAction = "complete" | "reopen" | "dismiss";

type OnboardingChecklistWidgetProps = {
  companyId: string;
  accountType?: string | null;
  entityType?: string | null;
  creatorEntityType?: string | null;
};

function buildChecklistUrl({
  companyId,
  accountType,
  entityType,
  creatorEntityType,
}: OnboardingChecklistWidgetProps) {
  const params = new URLSearchParams();
  const numericCompanyId = Number(companyId);

  if (Number.isInteger(numericCompanyId) && numericCompanyId > 0) {
    params.set("accountId", String(numericCompanyId));
  }

  if (accountType) params.set("accountType", accountType);
  if (entityType) params.set("entityType", entityType);
  if (creatorEntityType) params.set("creatorEntityType", creatorEntityType);

  return `/api/onboarding/checklist?${params.toString()}`;
}

async function fetchChecklist(props: OnboardingChecklistWidgetProps) {
  const response = await fetch(buildChecklistUrl(props), {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Checklist could not be loaded.");
  }

  return response.json() as Promise<ChecklistResponse>;
}

async function updateChecklist({
  accountId,
  action,
  taskId,
}: {
  accountId: number | null;
  action: ChecklistAction;
  taskId?: OnboardingChecklistTaskId;
}) {
  const params = new URLSearchParams();
  if (accountId) params.set("accountId", String(accountId));

  const response = await fetch(`/api/onboarding/checklist?${params.toString()}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, taskId }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error || "Checklist could not be updated.");
  }

  return response.json() as Promise<ChecklistResponse>;
}

export default function OnboardingChecklistWidget({
  companyId,
  accountType,
  entityType,
  creatorEntityType,
}: OnboardingChecklistWidgetProps) {
  const queryClient = useQueryClient();
  const queryKey = [
    "onboarding-checklist",
    companyId,
    accountType ?? "",
    entityType ?? "",
    creatorEntityType ?? "",
  ] as const;

  const checklistQuery = useQuery({
    queryKey,
    queryFn: () =>
      fetchChecklist({
        companyId,
        accountType,
        entityType,
        creatorEntityType,
      }),
    enabled: Boolean(companyId),
    staleTime: 60 * 1000,
    retry: 1,
  });

  const mutation = useMutation({
    mutationFn: updateChecklist,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const checklist = checklistQuery.data;
  const currentTask = checklist?.tasks.find((task) => task.id === checklist.currentTaskId);
  const busy = checklistQuery.isLoading || mutation.isPending;
  const canUpdate = Boolean(checklist?.serverTracked);

  if (checklistQuery.isError || !checklist || !checklist.shouldShow) {
    return null;
  }

  return (
    <section className="rounded-lg border border-blue-200 bg-white p-5 shadow-sm dark:border-blue-400/20 dark:bg-slate-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              Setup checklist
            </span>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
              {checklist.percentComplete}% complete
            </span>
          </div>
          <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 dark:text-white">
            Finish your first-run setup
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {currentTask
              ? `Next: ${currentTask.title.toLowerCase()}.`
              : "Everything is ready."}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {currentTask ? (
            <Link
              href={currentTask.href}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Resume
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => mutation.mutate({ accountId: checklist.accountId, action: "dismiss" })}
            disabled={busy || !canUpdate}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Dismiss setup checklist"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <X className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${checklist.percentComplete}%` }}
        />
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {checklist.tasks.map((task) => {
          const action: ChecklistAction = task.completed ? "reopen" : "complete";

          return (
            <div
              key={task.id}
              className="flex gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={task.completed}
                aria-label={`${task.completed ? "Reopen" : "Complete"} ${task.title}`}
                onClick={() =>
                  mutation.mutate({
                    accountId: checklist.accountId,
                    action,
                    taskId: task.id,
                  })
                }
                disabled={busy || !canUpdate}
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  task.completed
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-300 text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700"
                }`}
              >
                {task.completed ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Circle className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-950 dark:text-white">
                      {task.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {task.description}
                    </p>
                  </div>
                  {task.completed ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                  ) : null}
                </div>
                <Link
                  href={task.href}
                  className="mt-2 inline-flex text-xs font-black text-blue-700 underline-offset-2 hover:underline dark:text-blue-300"
                >
                  Open
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

