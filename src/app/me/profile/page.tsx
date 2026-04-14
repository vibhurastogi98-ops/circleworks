"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, MapPin, Phone, Shield, CreditCard, FileText, Lock, Smartphone, Monitor, Save, Edit2, Eye, EyeOff } from "lucide-react";
import { mockEmployeeProfile } from "@/data/mockEmployeePortal";
import { useEmployeePortal } from "@/hooks/useEmployeePortal";
import { toast } from "sonner";
import { PlaidBankSection } from "@/components/PlaidBankSection";

export default function ProfilePage() {
  const { data } = useEmployeePortal();
  const portalProfile = data?.profile;
  const p = {
    ...mockEmployeeProfile,
    ...portalProfile,
    fullName: portalProfile ? `${portalProfile.firstName} ${portalProfile.lastName || ""}`.trim() : mockEmployeeProfile.fullName,
    bankAccount: portalProfile?.bankAccount
      ? { ...mockEmployeeProfile.bankAccount, ...portalProfile.bankAccount }
      : mockEmployeeProfile.bankAccount,
    startDate: portalProfile?.startDate || mockEmployeeProfile.startDate,
  };

  const [editing, setEditing] = useState<string | null>(null);
  const [showBankDetails, setShowBankDetails] = useState(false);

  const [profile, setProfile] = useState({
    phone: p.phone,
    pronouns: p.pronouns,
    street: p.homeAddress.street,
    city: p.homeAddress.city,
    state: p.homeAddress.state,
    zip: p.homeAddress.zip,
    emergency1Name: p.emergencyContacts[0].name,
    emergency1Phone: p.emergencyContacts[0].phone,
    emergency1Relation: p.emergencyContacts[0].relationship,
  });

  const handleSave = (section: string) => {
    toast.success(`${section} updated successfully`);
    setEditing(null);
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your personal information and security</p>
      </div>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0 overflow-hidden">
            <img src={p.avatarUrl} alt={p.fullName} className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{p.fullName}</h2>
            <p className="text-[13px] text-slate-500 dark:text-slate-400">{p.jobTitle} · {p.department}</p>
            <p className="text-[12px] text-slate-400 mt-1">Employee since {new Date(p.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} · {p.employeeType}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40">
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700/40">
            <h3 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2"><User size={16} className="text-violet-500" /> Personal Info</h3>
            <button onClick={() => editing === "personal" ? handleSave("Personal info") : setEditing("personal")} className="text-[12px] font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1 hover:underline">
              {editing === "personal" ? <><Save size={13} /> Save</> : <><Edit2 size={13} /> Edit</>}
            </button>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: "Email", value: p.email, readonly: true },
              { label: "Phone", key: "phone" as const },
              { label: "Pronouns", key: "pronouns" as const },
            ].map(field => (
              <div key={field.label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 w-24 flex-shrink-0">{field.label}</span>
                {editing === "personal" && !field.readonly ? (
                  <input value={profile[field.key!]} onChange={e => setProfile({ ...profile, [field.key!]: e.target.value })} className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-900 dark:text-white flex-1" />
                ) : (
                  <span className="text-[13px] font-semibold text-slate-900 dark:text-white">{field.readonly ? field.value : profile[field.key!]}</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Home Address */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40">
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700/40">
            <h3 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2"><MapPin size={16} className="text-violet-500" /> Home Address</h3>
            <button onClick={() => editing === "address" ? handleSave("Address") : setEditing("address")} className="text-[12px] font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1 hover:underline">
              {editing === "address" ? <><Save size={13} /> Save</> : <><Edit2 size={13} /> Edit</>}
            </button>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: "Street", key: "street" as const },
              { label: "City", key: "city" as const },
              { label: "State", key: "state" as const },
              { label: "ZIP", key: "zip" as const },
            ].map(field => (
              <div key={field.label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 w-24 flex-shrink-0">{field.label}</span>
                {editing === "address" ? (
                  <input value={profile[field.key]} onChange={e => setProfile({ ...profile, [field.key]: e.target.value })} className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-900 dark:text-white flex-1" />
                ) : (
                  <span className="text-[13px] font-semibold text-slate-900 dark:text-white">{profile[field.key]}</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Emergency Contacts */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40">
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700/40">
            <h3 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2"><Phone size={16} className="text-red-500" /> Emergency Contacts</h3>
            <button onClick={() => editing === "emergency" ? handleSave("Emergency contacts") : setEditing("emergency")} className="text-[12px] font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1 hover:underline">
              {editing === "emergency" ? <><Save size={13} /> Save</> : <><Edit2 size={13} /> Edit</>}
            </button>
          </div>
          <div className="p-5">
            {p.emergencyContacts.map((contact, i) => (
              <div key={i} className={`flex items-center gap-3 ${i > 0 ? 'mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/40' : ''}`}>
                <div className="w-9 h-9 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 text-[12px] font-bold">{contact.name.charAt(0)}</div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white">{contact.name}</p>
                  <p className="text-[11px] text-slate-500">{contact.relationship} · {contact.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bank Account */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40">
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700/40">
            <h3 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2"><CreditCard size={16} className="text-emerald-500" /> Bank Account</h3>
          </div>
          <div className="p-5">
             <PlaidBankSection initialData={p.bankAccount} onSave={(data: any) => {
                 setProfile({ ...profile, ...data });
                 toast.success('Bank account verified instantly — ready for direct deposit');
             }} />
          </div>
        </motion.div>
      </div>

      {/* W-4 & Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* W-4 */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40">
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700/40">
            <h3 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2"><FileText size={16} className="text-amber-500" /> W-4 Tax Withholding</h3>
            <Link href="/me/w4" className="text-[12px] font-bold text-violet-600 dark:text-violet-400 hover:underline">Update W-4</Link>
          </div>
          <div className="p-5 space-y-2">
            <div className="flex justify-between text-[13px]"><span className="text-slate-500">Filing Status</span><span className="font-semibold text-slate-900 dark:text-white">{p.w4.filingStatus}</span></div>
            <div className="flex justify-between text-[13px]"><span className="text-slate-500">Allowances</span><span className="font-semibold text-slate-900 dark:text-white">{p.w4.allowances}</span></div>
            <div className="flex justify-between text-[13px]"><span className="text-slate-500">Extra Withholding</span><span className="font-semibold text-slate-900 dark:text-white">${p.w4.additionalWithholding}</span></div>
            <p className="text-[11px] text-slate-400 pt-2">Last updated: {new Date(p.w4.lastUpdated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </motion.div>

        {/* Login & Security */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700/40">
            <h3 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2"><Lock size={16} className="text-violet-500" /> Login & Security</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Lock size={14} className="text-slate-400" /><span className="text-[13px] text-slate-700 dark:text-slate-300">Password</span></div>
              <button onClick={() => toast("Password change flow will open")} className="text-[12px] font-bold text-violet-600 dark:text-violet-400 hover:underline">Change</button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Shield size={14} className="text-emerald-500" /><span className="text-[13px] text-slate-700 dark:text-slate-300">Two-Factor Auth (MFA)</span></div>
              <span className="px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">Enabled</span>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700/40">
              <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2">Active Sessions</p>
              {p.activeSessions.map((session, i) => (
                <div key={i} className={`flex items-center gap-3 ${i > 0 ? 'mt-2' : ''}`}>
                  {session.device.includes("MacBook") ? <Monitor size={14} className="text-slate-400" /> : <Smartphone size={14} className="text-slate-400" />}
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold text-slate-900 dark:text-white">{session.device}</p>
                    <p className="text-[11px] text-slate-500">{session.location} {session.current && <span className="text-emerald-500 font-bold">· Current</span>}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
