"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Settings2, ShieldCheck, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  FIELD_VISIBILITY_RULES,
  type FieldVisibilityRule,
  type FieldVisibilityRole,
} from "@/lib/fieldVisibility";

type FieldType = "text" | "number" | "date" | "dropdown";
type AppliesTo = "employee" | "contractor";

type Definition = {
  id: number;
  name: string;
  fieldType: FieldType;
  options: string[];
  appliesTo: AppliesTo;
  required: boolean;
  createdAt: string | null;
};

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Text",
  number: "Number",
  date: "Date",
  dropdown: "Dropdown",
};

const Toggle = ({ checked, onChange, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
  <button
    onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    title={disabled ? "Cannot change this field" : "Toggle visibility"}
  >
    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-1"}`} />
  </button>
);

const initialVisibility = FIELD_VISIBILITY_RULES.map((rule) => ({ ...rule, roles: { ...rule.roles } }));

export default function CustomFieldsSettingsPage() {
  const [definitions, setDefinitions] = useState<Definition[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"custom" | "visibility">("custom");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Definition | null>(null);
  const [visibilities, setVisibilities] = useState(initialVisibility);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/custom-fields", { cache: "no-store", credentials: "include" });
      if (r.status === 401) { setErr("Please sign in."); return; }
      if (!r.ok) { setErr(`Failed (HTTP ${r.status})`); return; }
      const data = await r.json();
      setDefinitions(data.definitions ?? []);
      setErr(null);
    } catch { setErr("Network error"); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleToggle = (id: string, role: FieldVisibilityRole, newValue: boolean) => {
    setVisibilities((prev) => prev.map((v) => {
      if (v.id === id) {
        if (role === "everyone" && newValue) {
          return { ...v, roles: { employee: true, manager: true, hr: true, admin: true, everyone: true } };
        }
        const updatedRoles = { ...v.roles, [role]: newValue };
        if (role !== "everyone" && !newValue) updatedRoles.everyone = false;
        return { ...v, roles: updatedRoles };
      }
      return v;
    }));
  };

  const applyPIIDefaults = () => {
    setVisibilities((prev) => prev.map((v) => v.sensitive ? { ...v, roles: { employee: false, manager: false, hr: true, admin: true, everyone: false } } : v));
    toast.info("PII defaults staged (visibility save flow is a follow-up).");
  };

  async function remove(d: Definition) {
    if (!confirm(`Remove custom field "${d.name}"? Any stored values will be deleted.`)) return;
    const r = await fetch(`/api/custom-fields?id=${d.id}`, { method: "DELETE", credentials: "include" });
    if (!r.ok) { toast.error("delete_failed"); return; }
    toast.success(`Removed "${d.name}".`);
    void load();
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile & Fields</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage custom fields and field-level privacy controls for employee profiles.</p>
        </div>
        {activeTab === "custom" ? (
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus size={16} /> Create Field
          </button>
        ) : (
          <button onClick={applyPIIDefaults} className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <ShieldCheck size={16} /> Apply PII Defaults
          </button>
        )}
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => setActiveTab("custom")} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "custom" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>Custom Fields</button>
        <button onClick={() => setActiveTab("visibility")} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "visibility" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>Field Visibility</button>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{err}</div>
      )}

      {activeTab === "custom" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          {!definitions && !err && <p className="p-6 text-sm text-slate-500">Loading…</p>}
          {definitions?.length === 0 && (
            <p className="p-6 text-sm text-slate-500">No custom fields yet. Click <strong>Create Field</strong>.</p>
          )}
          {definitions && definitions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Field Name</th>
                    <th className="px-6 py-3">Applies To</th>
                    <th className="px-6 py-3">Data Type</th>
                    <th className="px-6 py-3">Required</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {definitions.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{d.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {d.appliesTo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          d.fieldType === "dropdown" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                          d.fieldType === "date" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                          d.fieldType === "number" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}>
                          {FIELD_TYPE_LABELS[d.fieldType]}
                        </span>
                        {d.fieldType === "dropdown" && <span className="text-xs text-slate-400 ml-2">({d.options.length} options)</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <Settings2 size={14} /> {d.required ? "Required" : "Optional"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setEditing(d)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 mr-1 text-xs font-bold">Edit</button>
                        <button onClick={() => remove(d)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "visibility" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Directory & Profile Privacy</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure which roles can view specific fields on an employee's profile. Visibility rules are read from <code>@/lib/fieldVisibility</code> — the toggle UI here is a preview; the save flow is a follow-up.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Field Name</th>
                  <th className="px-4 py-3">Field Type</th>
                  <th className="px-4 py-3 text-center">Employee</th>
                  <th className="px-4 py-3 text-center">Manager</th>
                  <th className="px-4 py-3 text-center">HR</th>
                  <th className="px-4 py-3 text-center">Admin</th>
                  <th className="px-4 py-3 text-center">Everyone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {visibilities.map((v: FieldVisibilityRule) => (
                  <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{v.name}</td>
                    <td className="px-4 py-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${v.type === "System" ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>{v.type}</span></td>
                    <td className="px-4 py-4 text-center"><Toggle checked={v.roles.employee} onChange={(val) => handleToggle(v.id, "employee", val)} /></td>
                    <td className="px-4 py-4 text-center"><Toggle checked={v.roles.manager} onChange={(val) => handleToggle(v.id, "manager", val)} /></td>
                    <td className="px-4 py-4 text-center"><Toggle checked={v.roles.hr} onChange={(val) => handleToggle(v.id, "hr", val)} /></td>
                    <td className="px-4 py-4 text-center"><Toggle checked={v.roles.admin} onChange={(val) => handleToggle(v.id, "admin", val)} /></td>
                    <td className="px-4 py-4 text-center"><Toggle checked={v.roles.everyone} onChange={(val) => handleToggle(v.id, "everyone", val)} disabled={!!v.sensitive} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(showCreate || editing) && (
        <DefinitionModal
          initial={editing}
          onClose={() => { setShowCreate(false); setEditing(null); }}
          onSaved={() => { setShowCreate(false); setEditing(null); void load(); }}
        />
      )}
    </div>
  );
}

function DefinitionModal({ initial, onClose, onSaved }: { initial: Definition | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [fieldType, setFieldType] = useState<FieldType>(initial?.fieldType ?? "text");
  const [appliesTo, setAppliesTo] = useState<AppliesTo>(initial?.appliesTo ?? "employee");
  const [optionsText, setOptionsText] = useState((initial?.options ?? []).join("\n"));
  const [required, setRequired] = useState<boolean>(initial?.required ?? false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim()) { toast.error("Name is required"); return; }
    const options = optionsText.split("\n").map((s) => s.trim()).filter(Boolean);
    if (fieldType === "dropdown" && options.length === 0) {
      toast.error("Dropdown fields need at least one option");
      return;
    }
    setBusy(true);
    const body = { id: initial?.id, name: name.trim(), fieldType, appliesTo, options, required };
    const r = await fetch("/api/custom-fields", {
      method: initial ? "PATCH" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      toast.error(data.error === "name_in_use" ? "A field with that name already exists for this entity." : (data.error || `save_failed_${r.status}`));
      return;
    }
    toast.success(initial ? "Field updated" : "Field created");
    onSaved();
  }

  const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">{initial ? "Edit custom field" : "New custom field"}</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="p-5 flex flex-col gap-3 text-sm">
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Field name</span><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="e.g. T-shirt size" /></label>
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Applies to</span>
            <select value={appliesTo} onChange={(e) => setAppliesTo(e.target.value as AppliesTo)} className={inputCls}>
              <option value="employee">Employees</option>
              <option value="contractor">Contractors</option>
            </select>
          </label>
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Field type</span>
            <select value={fieldType} onChange={(e) => setFieldType(e.target.value as FieldType)} className={inputCls}>
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="dropdown">Dropdown</option>
            </select>
          </label>
          {fieldType === "dropdown" && (
            <label className="flex flex-col gap-1">
              <span className="font-bold text-slate-600 dark:text-slate-300">Dropdown options (one per line)</span>
              <textarea value={optionsText} onChange={(e) => setOptionsText(e.target.value)} rows={4} className={inputCls} placeholder={"Small\nMedium\nLarge"} />
            </label>
          )}
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
            <span className="text-slate-700 dark:text-slate-300">Required</span>
          </label>
        </div>
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
          <button onClick={submit} disabled={busy || !name.trim()} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {initial ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
