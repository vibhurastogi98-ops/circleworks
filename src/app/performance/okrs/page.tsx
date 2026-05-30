"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  GitBranch,
  Link2,
  Plus,
  RefreshCw,
  Target,
  UserRound,
} from "lucide-react";

import {
  flattenOkrs,
  getOkrProgress,
  okrTree,
  type KeyResult,
  type Okr,
  type OkrLevel,
} from "@/data/mockPerformance";
import { formatDate } from "@/utils/formatDate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const levelClasses: Record<OkrLevel, string> = {
  Company: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-400/30 dark:bg-purple-500/10 dark:text-purple-300",
  Department: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300",
  Individual:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
};

function keyResultProgress(keyResult: KeyResult) {
  if (!keyResult.target) return 0;
  return Math.min(100, Math.round((keyResult.current / keyResult.target) * 100));
}

function updateKeyResult(tree: Okr[], keyResultId: string, currentValue: number): Okr[] {
  return tree.map((okr) => ({
    ...okr,
    keyResults: okr.keyResults.map((keyResult) =>
      keyResult.id === keyResultId ? { ...keyResult, current: currentValue } : keyResult,
    ),
    children: okr.children ? updateKeyResult(okr.children, keyResultId, currentValue) : undefined,
  }));
}

function OkrNode({
  okr,
  level = 0,
  onUpdate,
}: {
  okr: Okr;
  level?: number;
  onUpdate: (okr: Okr, keyResult: KeyResult) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = Boolean(okr.children?.length);
  const progress = getOkrProgress(okr);

  return (
    <div className="space-y-3">
      <Card className={level > 0 ? "ml-4 md:ml-8" : ""}>
        <CardContent className="p-5">
          <div className="flex gap-3">
            <button
              type="button"
              className={`mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 dark:border-slate-700 ${
                hasChildren ? "opacity-100" : "opacity-0"
              }`}
              onClick={() => setExpanded((value) => !value)}
              aria-label={expanded ? "Collapse OKR" : "Expand OKR"}
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={levelClasses[okr.level]}>{okr.level}</Badge>
                    <Badge variant="secondary">{okr.status}</Badge>
                  </div>
                  <h2 className="mt-2 text-base font-bold text-slate-950 dark:text-white">{okr.objective}</h2>
                  <p className="mt-1 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <UserRound size={13} />
                      {okr.owner}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={13} />
                      Due {formatDate(okr.dueDate)}
                    </span>
                    {okr.parentId ? (
                      <span className="inline-flex items-center gap-1">
                        <Link2 size={13} />
                        Aligned to parent
                      </span>
                    ) : null}
                  </p>
                </div>
                <div className="w-full md:w-48">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Objective progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                {okr.keyResults.map((keyResult) => {
                  const krProgress = keyResultProgress(keyResult);
                  return (
                    <div
                      key={keyResult.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                        <div>
                          <p className="text-sm font-bold text-slate-950 dark:text-white">{keyResult.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {keyResult.metric}: {keyResult.current}
                            {keyResult.unit} / {keyResult.target}
                            {keyResult.unit}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => onUpdate(okr, keyResult)}>
                          <RefreshCw size={14} />
                          Update
                        </Button>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${krProgress}%` }} />
                      </div>
                      <p className="mt-1 text-right text-xs font-black text-slate-500">{krProgress}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {expanded && hasChildren ? (
        <div className="space-y-3">
          {okr.children?.map((child) => (
            <OkrNode key={child.id} okr={child} level={level + 1} onUpdate={onUpdate} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function OkrManagementPage() {
  const [tree, setTree] = useState<Okr[]>(okrTree);
  const [selectedKr, setSelectedKr] = useState<{ okr: Okr; keyResult: KeyResult } | null>(null);
  const [currentValue, setCurrentValue] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const flatOkrs = useMemo(() => flattenOkrs(tree), [tree]);
  const ownerOptions = Array.from(new Set(flatOkrs.map((okr) => okr.owner)));
  const parentOptions = flatOkrs.filter((okr) => okr.level !== "Individual");

  const openUpdate = (okr: Okr, keyResult: KeyResult) => {
    setSelectedKr({ okr, keyResult });
    setCurrentValue(String(keyResult.current));
  };

  const saveUpdate = () => {
    if (!selectedKr) return;
    const nextValue = Number(currentValue);
    if (Number.isNaN(nextValue)) return;
    setTree((current) => updateKeyResult(current, selectedKr.keyResult.id, nextValue));
    setSelectedKr(null);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">OKR Management</p>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Company, Department, and Individual OKRs</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Align objectives from company priorities down to measurable individual key results.
          </p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateOpen(true)}>
          <Plus size={18} />
          Create OKR
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Company OKRs", flatOkrs.filter((okr) => okr.level === "Company").length],
          ["Department OKRs", flatOkrs.filter((okr) => okr.level === "Department").length],
          ["Individual OKRs", flatOkrs.filter((okr) => okr.level === "Individual").length],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                <GitBranch size={22} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-950 dark:text-white">{value}</p>
                <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hierarchical OKR Tree</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tree.map((okr) => (
            <OkrNode key={okr.id} okr={okr} onUpdate={openUpdate} />
          ))}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedKr)} onOpenChange={(open) => !open && setSelectedKr(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Key Result</DialogTitle>
            <DialogDescription>
              Enter the current value and progress will be recalculated automatically.
            </DialogDescription>
          </DialogHeader>
          {selectedKr ? (
            <div className="space-y-4 p-6">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                <p className="text-sm font-bold text-slate-950 dark:text-white">{selectedKr.keyResult.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Target: {selectedKr.keyResult.target}
                  {selectedKr.keyResult.unit}
                </p>
              </div>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-500">Current value</span>
                <Input value={currentValue} onChange={(event) => setCurrentValue(event.target.value)} type="number" />
              </label>
              <div className="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-800">
                Calculated progress:{" "}
                <span className="font-black text-blue-600">
                  {Math.min(100, Math.round((Number(currentValue || 0) / selectedKr.keyResult.target) * 100))}%
                </span>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedKr(null)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={saveUpdate}>
              Save Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen} contentClassName="max-w-3xl">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create OKR Wizard</DialogTitle>
            <DialogDescription>
              Define one objective, up to five measurable key results, an owner, due date, and parent alignment.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-bold uppercase text-slate-500">Objective</span>
                <Input defaultValue="Improve customer onboarding completion" />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-500">Owner</span>
                <select className="h-11 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-sm text-[var(--text-primary)]">
                  {ownerOptions.map((owner) => (
                    <option key={owner}>{owner}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-500">Due date</span>
                <Input type="date" defaultValue="2026-09-30" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-bold uppercase text-slate-500">Link to parent OKR</span>
                <select className="h-11 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-sm text-[var(--text-primary)]">
                  {parentOptions.map((okr) => (
                    <option key={okr.id}>{okr.objective}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase text-slate-500">Key results</p>
              {[1, 2, 3].map((item) => (
                <div key={item} className="grid gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800 md:grid-cols-[1fr_120px_120px]">
                  <Input placeholder={`Key result ${item}`} defaultValue={item === 1 ? "Raise onboarding completion to 92%" : ""} />
                  <Input placeholder="Target" type="number" defaultValue={item === 1 ? "92" : ""} />
                  <Input placeholder="Unit" defaultValue={item === 1 ? "%" : ""} />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateOpen(false)}>
              <Target size={16} />
              Save OKR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
