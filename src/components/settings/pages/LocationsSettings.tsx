"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Building, Loader2, MapPin, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

type Location = {
  id: number;
  name: string;
  address: string | null;
  timezone: string | null;
  isHeadquarters: boolean;
};

const TZ_OPTIONS = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "UTC",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function LocationsSettingsPage() {
  const [locations, setLocations] = useState<Location[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [isHq, setIsHq] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<Location | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/company-locations", { cache: "no-store", credentials: "include" });
      if (r.status === 401) { setErr("Please sign in."); return; }
      if (!r.ok) { setErr(`Failed (HTTP ${r.status})`); return; }
      const data = await r.json();
      setLocations(data.locations ?? []);
      setErr(null);
    } catch { setErr("Network error"); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function openCreate() { setEditing(null); setName(""); setAddress(""); setTimezone("America/New_York"); setIsHq(false); setShowModal(true); }
  function openEdit(l: Location) { setEditing(l); setName(l.name); setAddress(l.address ?? ""); setTimezone(l.timezone ?? "America/New_York"); setIsHq(l.isHeadquarters); setShowModal(true); }

  async function save() {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setBusy(true);
    const method = editing ? "PATCH" : "POST";
    const body = editing
      ? { id: editing.id, name, address, timezone, isHeadquarters: isHq }
      : { name, address, timezone, isHeadquarters: isHq };
    const r = await fetch("/api/company-locations", { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(d.error === "name_in_use" ? "A location with that name already exists." : (d.error || `save_failed_${r.status}`)); return; }
    toast.success(editing ? `Location "${name}" updated.` : `Location "${name}" added.`);
    setShowModal(false);
    void load();
  }

  async function remove(l: Location) {
    const r = await fetch(`/api/company-locations?id=${l.id}`, { method: "DELETE", credentials: "include" });
    if (!r.ok) { toast.error("delete_failed"); return; }
    toast.success(`Location "${l.name}" removed.`);
    setDeleting(null);
    void load();
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Locations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Physical offices and workspaces. Separate from time-clock kiosks (configured in Time settings).
          </p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold">
          <Plus size={16} /> New Location
        </button>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{err}</div>
      )}

      {!locations && !err && <p className="text-sm text-slate-500">Loading…</p>}
      {locations?.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          No locations configured. Click <strong>New Location</strong> to add one.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations?.map((l) => (
          <div key={l.id} className="rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"><Building className="h-5 w-5" /></span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-950 dark:text-white">{l.name}</h3>
                    {l.isHeadquarters && <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">HQ</span>}
                  </div>
                  {l.address && <p className="mt-0.5 text-xs text-slate-500 flex items-center gap-1"><MapPin size={12} /> {l.address}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(l)} className="p-1.5 text-slate-400 hover:text-blue-600 text-sm font-bold">Edit</button>
                <button onClick={() => setDeleting(l)} className="p-1.5 text-slate-400 hover:text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="text-slate-500">Timezone</span>
              <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{l.timezone ?? "—"}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-950 dark:text-white">{editing ? "Edit location" : "New location"}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm"><span className="font-bold text-slate-600 dark:text-slate-300">Name</span><input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="e.g. HQ Brooklyn" /></label>
              <label className="flex flex-col gap-1 text-sm"><span className="font-bold text-slate-600 dark:text-slate-300">Address</span><input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
              <label className="flex flex-col gap-1 text-sm"><span className="font-bold text-slate-600 dark:text-slate-300">Timezone</span>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                  {TZ_OPTIONS.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={isHq} onChange={(e) => setIsHq(e.target.checked)} />
                Set as headquarters (only one location can be HQ)
              </label>
            </div>
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
              <button onClick={save} disabled={busy || !name.trim()} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editing ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm p-6">
            <p className="text-sm">Delete <strong>{deleting.name}</strong>?</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setDeleting(null)} className="flex-1 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
              <button onClick={() => remove(deleting)} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
