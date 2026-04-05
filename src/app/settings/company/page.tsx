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
    website: "https://circleworks.io",
    address: "123 Main Street",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
  });

  useEffect(() => {
    if (currentUser?.companyName && currentUser.companyName !== formData.companyName) {
      setFormData(prev => ({
        ...prev,
        companyName: currentUser.companyName
      }));
    }
  }, [currentUser?.companyName]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          companyName: formData.companyName,
          // Other fields could go here too if we update the API to handle them
        }),
      });

      if (!response.ok) throw new Error("Failed to update settings");
      
      // Update Clerk user's metadata locally if possible or wait for sync
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
                <input type="text" defaultValue="123 Main Street" className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
              <div className="space-y-1.5 md:col-span-3">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-1">City</label>
                <input type="text" defaultValue="San Francisco" className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-1">State</label>
                <input type="text" defaultValue="CA" className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-1">Zip Code</label>
                <input type="text" defaultValue="94105" className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 transition-all" />
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
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">hr@circleworks.inc</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
