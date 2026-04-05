"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, MapPin, Globe, Mail, Phone, FileText, Check, Loader2 } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

export default function CompanySettingsPage() {
  const { currentUser } = useDashboardData();
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    ein: "XX-XXXXXXX",
    website: "https://",
    email: "admin@company.com",
    phone: "+1 (555) 000-0000",
    address: "---",
    city: "---",
    state: "--",
    zip: "-----",
  });

  useEffect(() => {
    if (user) {
      const emailDomain = user.primaryEmailAddress?.emailAddress.split("@")[1] || "company.com";
      setFormData(prev => ({
        ...prev,
        companyName: currentUser?.companyName || "Your Company",
        email: `hr@${emailDomain}`,
      }));
    }
  }, [user, currentUser?.companyName]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          companyName: formData.companyName,
          // In a real app we would save all other fields too
        }),
      });

      if (!response.ok) throw new Error("Failed to update settings");
      
      if (user) {
        await user.reload();
      }

      toast.success("Company settings updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Company Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Manage your organization's legal info, workplace settings, and compliance details.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* General Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Legal Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-1">Company Legal Name</label>
                <input 
                  type="text" 
                  value={formData.companyName} 
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-1">EIN (Tax ID)</label>
                <input 
                  type="text" 
                  value={formData.ein} 
                  onChange={(e) => setFormData({ ...formData, ein: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 transition-all" 
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-1">Company Website</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    value={formData.website} 
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 transition-all" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
              <MapPin size={18} className="text-blue-600" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Headquarters Address</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="space-y-1.5 md:col-span-6">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-1">Street Address</label>
                <input 
                  type="text" 
                  value={formData.address} 
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 transition-all" 
                />
              </div>
              <div className="space-y-1.5 md:col-span-3">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-1">City</label>
                <input 
                  type="text" 
                  value={formData.city} 
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 transition-all" 
                />
              </div>
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-1">State</label>
                <input 
                  type="text" 
                  value={formData.state} 
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 transition-all" 
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-1">Zip Code</label>
                <input 
                  type="text" 
                  value={formData.zip} 
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 transition-all" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Logo */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm">
             <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">
                <Building2 size={40} className="text-blue-600" />
             </div>
             <h4 className="font-bold text-slate-900 dark:text-white mb-1">Company Logo</h4>
             <p className="text-xs text-slate-500 mb-4 font-medium uppercase tracking-widest">Square PNG/JPG preferred</p>
             <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Change Logo</button>
          </div>

          {/* Contact Details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
              <Mail size={16} className="text-blue-600" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Contact Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Support Email</label>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-slate-400" />
                  <input 
                    type="text" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-transparent border-0 p-0 text-sm font-bold text-slate-900 dark:text-white focus:ring-0" 
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Support Phone</label>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-slate-400" />
                  <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-transparent border-0 p-0 text-sm font-bold text-slate-900 dark:text-white focus:ring-0" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
