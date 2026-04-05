"use client";

import React, { useState } from "react";
import { Upload, Building2, Save, AlertTriangle } from "lucide-react";
import { mockCompanyProfile } from "@/data/mockSettings";
import { toast } from "sonner";

export default function CompanySettingsPage() {
  const [profile, setProfile] = useState(mockCompanyProfile);
  const [deleteInput, setDeleteInput] = useState("");

  const handleSave = () => {
    localStorage.setItem(
      "circleworks_signup_progress",
      JSON.stringify({ data: { companyName: profile.legalName } })
    );
    toast.success("Company profile saved successfully.", {
       description: "The dashboard and sidebar will reflect these changes."
    });
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Company Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your organization's legal and contact information.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Basic Information</h2>
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Save size={16} /> Save Changes
          </button>
        </div>
        <div className="p-6 flex flex-col gap-6">
          {/* Logo */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Company Logo</label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-800 overflow-hidden">
                {profile.logoUrl ? (
                  <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building2 size={32} className="text-slate-400" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">
                  <Upload size={16} /> Upload New Logo
                </button>
                <p className="text-xs text-slate-500">Recommended: 512x512px transparent PNG or SVG.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Legal Name</label>
              <input value={profile.legalName} onChange={(e) => setProfile({...profile, legalName: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Doing Business As (DBA)</label>
              <input value={profile.dba} onChange={(e) => setProfile({...profile, dba: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Employer Identification Number (EIN)</label>
              <input value={profile.ein} disabled className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 cursor-not-allowed" />
              <p className="text-[10px] text-slate-500 mt-1">Contact support to update your EIN.</p>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Entity Type</label>
              <select value={profile.entityType} onChange={(e) => setProfile({...profile, entityType: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white">
                <option>C-Corporation</option>
                <option>S-Corporation</option>
                <option>LLC</option>
                <option>Sole Proprietorship</option>
                <option>Non-Profit</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Industry</label>
              <input value={profile.industry} onChange={(e) => setProfile({...profile, industry: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Fiscal Year End</label>
              <input value={profile.fiscalYearEnd} placeholder="MM-DD" onChange={(e) => setProfile({...profile, fiscalYearEnd: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white" />
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Primary Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Street Address</label>
                <input value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white" />
              </div>
              <div className="md:col-span-2 grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">City</label>
                  <input value={profile.city} onChange={(e) => setProfile({...profile, city: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white" />
                </div>
                <div className="col-span-1">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">State</label>
                  <input value={profile.state} onChange={(e) => setProfile({...profile, state: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white" />
                </div>
                <div className="col-span-1">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">ZIP Code</label>
                  <input value={profile.zip} onChange={(e) => setProfile({...profile, zip: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white" />
                </div>
              </div>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
              ✓ Address successfully validated with USPS.
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-red-700 dark:text-red-400 flex items-center gap-2 mb-2">
          <AlertTriangle size={18} /> Danger Zone
        </h3>
        <p className="text-sm text-red-600 dark:text-red-300 mb-4 pb-4 border-b border-red-200 dark:border-red-900/50">
          Permanently delete your company account and all associated data. This action cannot be undone.
        </p>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-red-700 dark:text-red-400 mb-1.5 block">
              Type "{profile.dba}" to confirm
            </label>
            <input 
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" 
            />
          </div>
          <button 
            disabled={deleteInput !== profile.dba}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
