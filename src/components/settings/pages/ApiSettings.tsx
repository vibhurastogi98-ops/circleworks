"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Copy, Key, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

type ApiKey = {
  id: number;
  label: string;
  keyPrefix: string;
  createdAt: string | null;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

export default function APISettingsPage() {
  const [keys, setKeys] = useState<ApiKey[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [freshPlaintext, setFreshPlaintext] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/api-keys", { cache: "no-store", credentials: "include" });
      if (r.status === 401) { setErr("Please sign in."); return; }
      if (!r.ok) { setErr(`Failed (HTTP ${r.status})`); return; }
      const data = await r.json();
      setKeys(data.keys ?? []);
      setErr(null);
    } catch { setErr("Network error"); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function create() {
    if (!newLabel.trim()) return;
    setBusy(true);
    const r = await fetch("/api/api-keys", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel.trim() }),
    });
    setBusy(false);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(data.error || `create_failed_${r.status}`); return; }
    setFreshPlaintext(data.plaintext);
    setShowCreate(false);
    setNewLabel("");
    void load();
  }

  async function revoke(k: ApiKey) {
    if (!confirm(`Revoke API key "${k.label}"? Any integration using it will start receiving 401.`)) return;
    const r = await fetch(`/api/api-keys?id=${k.id}`, { method: "DELETE", credentials: "include" });
    if (!r.ok) { toast.error("revoke_failed"); return; }
    toast.success("Key revoked.");
    void load();
  }

  async function copy(v: string) {
    try {
      await navigator.clipboard.writeText(v);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  }

  const active = keys?.filter((k) => !k.revokedAt) ?? [];
  const revoked = keys?.filter((k) => k.revokedAt) ?? [];

  return (
    <div className="flex max-w-5xl animate-in flex-col gap-8 fade-in duration-500">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">API Keys</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Bearer tokens for the public REST API at <code>/api/v1/*</code>. Each key is scoped to this workspace.
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-bold text-white">
          <Plus size={16} /> Generate key
        </button>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{err}</div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Active keys</h2>
            <p className="mt-1 text-xs text-slate-500">Keys are shown once on creation. Store them in a secure secret manager — there's no recovery flow.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-medium uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3">Label</th>
                <th className="px-6 py-3">Prefix</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3">Last used</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {keys === null && !err && <tr><td colSpan={5} className="p-6 text-center text-slate-500">Loading…</td></tr>}
              {keys && active.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-500">No active keys.</td></tr>}
              {active.map((k) => (
                <tr key={k.id}>
                  <td className="px-6 py-4 font-bold text-slate-950 dark:text-white">{k.label}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">{k.keyPrefix}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{k.createdAt ? new Date(k.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : "Never"}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => revoke(k)} className="inline-flex items-center gap-1 text-sm font-bold text-red-600 hover:underline">
                      <Trash2 size={14} /> Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {revoked.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-6 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Revoked keys</h2>
            <p className="mt-1 text-xs text-slate-500">Kept as an audit trail — they no longer authenticate.</p>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-medium uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3">Label</th>
                <th className="px-6 py-3">Prefix</th>
                <th className="px-6 py-3">Revoked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 opacity-60">
              {revoked.map((k) => (
                <tr key={k.id}>
                  <td className="px-6 py-4 line-through text-slate-500">{k.label}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{k.keyPrefix}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{k.revokedAt ? new Date(k.revokedAt).toLocaleDateString() : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-950 dark:text-white">Generate API key</h3>
              <button onClick={() => setShowCreate(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-5 flex flex-col gap-3 text-sm">
              <label className="flex flex-col gap-1">
                <span className="font-bold text-slate-600 dark:text-slate-300">Label</span>
                <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="e.g. Zapier integration" autoFocus />
              </label>
              <p className="text-xs text-slate-500">The key will be shown once. Copy it before closing the dialog.</p>
            </div>
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
              <button onClick={create} disabled={busy || !newLabel.trim()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 text-sm font-bold text-white">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {freshPlaintext && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-950 dark:text-white">Copy your API key now</h3>
              <p className="mt-1 text-xs text-slate-500">This is the only time it will be shown. Store it in a secret manager before closing this dialog.</p>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-950 dark:border-slate-700 dark:bg-slate-800 dark:text-white break-all">
                  {freshPlaintext}
                </code>
                <button onClick={() => copy(freshPlaintext)} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-700 px-3 py-2 text-sm font-bold text-white">
                  <Copy size={14} /> Copy
                </button>
              </div>
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-200">
                Send this on future requests as:<br />
                <code className="font-mono">Authorization: Bearer {freshPlaintext.slice(0, 16)}…</code>
              </div>
            </div>
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button onClick={() => setFreshPlaintext(null)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-bold text-white">I've saved it, close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
