"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Building2, MapPin, Globe, Mail, Phone, FileText, Check, Loader2, Upload } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

export default function CompanySettingsPage() {
  const { currentUser } = useDashboardData();
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Max 5MB allowed before resizing.");
      return;
    }

    setIsUploadingLogo(true);
    try {
      // Resize helper using canvas
      const resizeImage = (dataUrl: string): Promise<string> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 120; // Enough for a small sidebar/settings logo
            const scale = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scale;
            
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // JPEG quality 0.7 usually results in < 8KB for a 120px wide logo
            resolve(canvas.toDataURL("image/jpeg", 0.7));
          };
          img.src = dataUrl;
        });
      };

      const reader = new FileReader();
      reader.onloadend = async () => {
        const fullBase64 = reader.result as string;
        const resizedBase64 = await resizeImage(fullBase64);
        
        console.log("Resized Logo Size:", Math.round(resizedBase64.length / 1024), "KB");

        const response = await fetch("/api/users/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            companyLogoUrl: resizedBase64
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Logo upload API error:", errorData);
          throw new Error(errorData.error || "Failed to upload logo (metadata limit reached)");
        }
        
        if (user) await user.reload();
        toast.success("Logo updated successfully!");
        setIsUploadingLogo(false);
      };
      reader.onerror = (err) => {
        console.error("FileReader error:", err);
        toast.error("Failed to read image file.");
        setIsUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Caught upload error:", error);
      toast.error(error.message || "Failed to upload logo. Please try again.");
      setIsUploadingLogo(false);
    }
  };
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
             <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-slate-800 shadow-md overflow-hidden transition-all duration-500 hover:scale-105 group relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {currentUser?.logoUrl ? (
                  <img src={currentUser.logoUrl} alt="Company Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building2 size={40} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                )}
                {isUploadingLogo && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 size={24} className="text-white animate-spin" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Upload size={20} className="text-white" />
                </div>
             </div>
             <h4 className="font-bold text-slate-900 dark:text-white mb-1">Company Logo</h4>
             <p className="text-[10px] text-slate-500 mb-4 font-medium uppercase tracking-widest">Square PNG/JPG preferred</p>
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleLogoUpload} 
               accept="image/*" 
               className="hidden" 
             />
             <button 
               onClick={() => fileInputRef.current?.click()}
               disabled={isUploadingLogo}
               className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
             >
               {isUploadingLogo ? "Uploading..." : "Change Logo"}
             </button>
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
