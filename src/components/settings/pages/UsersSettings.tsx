"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Clock, Loader2, Mail, Plus, Shield, ShieldCheck, Trash2, X } from "lucide-react";
import { toast } from "sonner";

type Member = {
  employeeId: number;
  userId: number | null;
  firstName: string;
  lastName: string | null;
  email: string | null;
  role: string | null;
  status: string | null;
  jobTitle: string | null;
};

type Invite = {
  id: number;
  email: string;
  role: string;
  status: string;
  createdAt: string | null;
  expiresAt: string;
};

const ROLE_OPTIONS = ["admin", "hr", "accountant", "employee"];

export default function UsersSettingsPage() {
  const [active, setActive] = useState<Member[] | null>(null);
  const [pending, setPending] = useState<Invite[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("employee");
  const [busy, setBusy] = useState<string | null>(null);

  const [editUser, setEditUser] = useState<Member | null>(null);
  const [editRole, setEditRole] = useState("employee");

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/users-admin", { cache: "no-store", credentials: "include" });
      if (r.status === 401) { setErr("Please sign in."); return; }
      if (!r.ok) { setErr(`Failed (HTTP ${r.status})`); return; }
      const data = await r.json();
      setActive(data.active ?? []);
      setPending(data.pending ?? []);
      setErr(null);
    } catch { setErr("Network error"); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function invite() {
    if (!inviteEmail.trim()) return;
    setBusy("invite");
    const r = await fetch("/api/users-admin", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
    });
    setBusy(null);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      toast.error(data.error === "already_in_company" ? "That email is already a member." : (data.error || `invite_failed_${r.status}`));
      return;
    }
    toast.success(`Invite ${data.emailSent ? "emailed" : "created"} for ${inviteEmail}`, {
      description: data.emailSent ? undefined : "Email service not configured — link visible in DB.",
    });
    setShowInvite(false); setInviteEmail(""); setInviteRole("employee");
    void load();
  }

  async function saveRole() {
    if (!editUser) return;
    setBusy("role");
    const r = await fetch("/api/users-admin", {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "change-role", employeeId: editUser.employeeId, role: editRole }),
    });
    setBusy(null);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(data.error === "cannot_change_own_role" ? "You can't change your own role." : (data.error || `save_failed`)); return; }
    toast.success(`Role updated for ${editUser.firstName}.`);
    setEditUser(null);
    void load();
  }

  async function revokeInvite(id: number) {
    if (!confirm("Revoke this invite?")) return;
    const r = await fetch(`/api/users-admin?kind=invite&id=${id}`, { method: "DELETE", credentials: "include" });
    if (!r.ok) { toast.error("revoke_failed"); return; }
    toast.success("Invite revoked.");
    void load();
  }

  async function revokeMember(m: Member) {
    if (!confirm(`Deactivate ${m.firstName}? They'll lose access to the workspace.`)) return;
    const r = await fetch(`/api/users-admin?kind=member&id=${m.employeeId}`, { method: "DELETE", credentials: "include" });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      toast.error(d.error === "cannot_revoke_self" ? "You can't revoke your own access." : "revoke_failed");
      return;
    }
    toast.success("Member deactivated.");
    void load();
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Workspace Users</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {(active?.length ?? 0)} active member{active?.length === 1 ? "" : "s"}
            {pending && pending.length > 0 ? `, ${pending.length} pending invite${pending.length === 1 ? "" : "s"}` : ""}.
          </p>
        </div>
        <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold">
          <Plus size={16} /> Invite user
        </button>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{err}</div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <h2 className="text-base font-black text-slate-950 dark:text-white">Active members</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase text-slate-500 dark:border-slate-800">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {active === null && !err && <tr><td colSpan={5} className="p-5 text-center text-slate-500">Loading…</td></tr>}
            {active?.length === 0 && <tr><td colSpan={5} className="p-5 text-center text-slate-500">No members yet.</td></tr>}
            {active?.map((m) => (
              <tr key={m.employeeId}>
                <td className="px-5 py-3">
                  <div className="font-bold text-slate-950 dark:text-white">{m.firstName} {m.lastName}</div>
                  {m.jobTitle && <div className="text-xs text-slate-500">{m.jobTitle}</div>}
                </td>
                <td className="px-5 py-3 text-slate-500">{m.email ?? "—"}</td>
                <td className="px-5 py-3 font-mono text-xs">{m.role ?? "employee"}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${m.status === "Active" || m.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{m.status ?? "—"}</span></td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => { setEditUser(m); setEditRole(m.role ?? "employee"); }} className="mr-2 text-sm font-bold text-blue-600 hover:underline">Change role</button>
                  <button onClick={() => revokeMember(m)} className="p-1.5 text-slate-400 hover:text-red-600" aria-label="Deactivate"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {pending && pending.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <h2 className="text-base font-black text-slate-950 dark:text-white">Pending invites</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Sent</th>
                <th className="px-5 py-3">Expires</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pending.map((i) => (
                <tr key={i.id}>
                  <td className="px-5 py-3 font-bold text-slate-950 dark:text-white flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {i.email}</td>
                  <td className="px-5 py-3 font-mono text-xs">{i.role}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{i.createdAt ? new Date(i.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs flex items-center gap-1"><Clock size={12} /> {new Date(i.expiresAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => revokeInvite(i.id)} className="text-sm font-bold text-red-600 hover:underline">Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {showInvite && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowInvite(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-950 dark:text-white">Invite user</h3>
              <button onClick={() => setShowInvite(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-bold text-slate-600 dark:text-slate-300">Email</span>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="teammate@example.com" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-bold text-slate-600 dark:text-slate-300">Role</span>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                  {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
              <p className="text-xs text-slate-500">They'll get an email with a link to claim the account. Link expires in 7 days.</p>
            </div>
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button onClick={() => setShowInvite(false)} className="px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
              <button onClick={invite} disabled={busy === "invite" || !inviteEmail.trim()} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg">
                {busy === "invite" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Send invite
              </button>
            </div>
          </div>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setEditUser(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-950 dark:text-white">Change role: {editUser.firstName}</h3>
              <button onClick={() => setEditUser(null)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-5">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-bold text-slate-600 dark:text-slate-300">Role</span>
                <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                  {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
            </div>
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button onClick={() => setEditUser(null)} className="px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
              <button onClick={saveRole} disabled={busy === "role"} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg">
                {busy === "role" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
