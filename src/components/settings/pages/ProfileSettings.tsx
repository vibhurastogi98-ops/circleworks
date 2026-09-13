"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building, Loader2, Mail, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

type ProfileData = {
  userId: number;
  role: string | null;
  accountType: string | null;
  firstName: string;
  lastName: string;
  email: string;
  personalEmail: string | null;
  jobTitle: string | null;
  companyName: string | null;
};

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/profile", { cache: "no-store", credentials: "include" });
      if (r.status === 401) { setErr("Please sign in."); return; }
      if (!r.ok) { setErr(`Failed (HTTP ${r.status})`); return; }
      const d = (await r.json()) as ProfileData;
      setData(d);
      setFirstName(d.firstName);
      setLastName(d.lastName);
      setEmail(d.email);
      setJobTitle(d.jobTitle ?? "");
      setPersonalEmail(d.personalEmail ?? "");
      setErr(null);
    } catch { setErr("Network error"); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function save() {
    setSaving(true);
    const r = await fetch("/api/profile", {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, jobTitle, personalEmail }),
    });
    setSaving(false);
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(d.error || `save_failed_${r.status}`); return; }
    toast.success("Profile saved");
    void load();
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">My Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Update your name, contact email, and role information.</p>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{err}</div>
      )}

      {!data && !err && <p className="text-sm text-slate-500">Loading…</p>}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <User size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{firstName || "—"} {lastName}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{data.jobTitle || data.role || "Team member"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <Field label="First name">
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Last name">
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Corporate email">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Job title">
                <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Personal email (optional)">
                <input type="email" value={personalEmail} onChange={(e) => setPersonalEmail(e.target.value)} className={inputCls} />
              </Field>

              <button
                onClick={save}
                disabled={saving || !firstName.trim() || !email.trim()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save changes
              </button>
            </div>
          </section>

          <section className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-500" /> Account
            </h3>
            <div className="space-y-3 text-sm">
              <Row icon={<Mail size={16} className="text-slate-400" />} label="Signed in as">{data.email}</Row>
              <Row icon={<Building size={16} className="text-slate-400" />} label="Workspace">{data.companyName || "—"}</Row>
              <Row icon={<ShieldCheck size={16} className="text-slate-400" />} label="Role">{data.role || "member"}</Row>
              <Row icon={<User size={16} className="text-slate-400" />} label="Account type">{data.accountType || "—"}</Row>
            </div>
          </section>
        </div>
      )}
    </motion.div>
  );
}

const inputCls = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
      {children}
    </label>
  );
}
function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
      </div>
      <span className="text-sm font-black text-slate-900 dark:text-white">{children}</span>
    </div>
  );
}
