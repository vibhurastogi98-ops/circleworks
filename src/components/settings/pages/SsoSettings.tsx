"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2, Copy, RefreshCw, Globe, Loader2 } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { toast } from "sonner";

export default function SSOSettingsPage() {
  const { currentUser } = useDashboardData();
  const [ssoEnabled, setSsoEnabled] = useState(true);
  const [scimToken, setScimToken] = useState("cw_scim_live_1234567890");
  const [isRotating, setIsRotating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleRotateToken = () => {
    setIsRotating(true);
    setTimeout(() => {
      const newToken = "cw_scim_live_" + Math.random().toString(36).substr(2, 10);
      setScimToken(newToken);
      setIsRotating(false);
      toast.success("SCIM Bearer Token rotated.", {
        description: "Please update your Identity Provider with the new token."
      });
    }, 1200);
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      toast.success("SSO Connection Successful!", {
        description: "CircleWorks successfully authenticated with your Identity Provider."
      });
    }, 1500);
  };

  const companySlug = currentUser.companyName?.toLowerCase().replace(/\s+/g, '-') || "circleworks";

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SSO & Provisioning</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure SAML 2.0 Identity Provider (IdP) and SCIM provisioning.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">SAML 2.0 Configuration</h2>
            <p className="text-xs text-slate-500 mt-1">Status: <span className="text-green-600 dark:text-green-400 font-bold">Active & Enforced</span></p>
          </div>
          <button 
            onClick={() => setSsoEnabled(!ssoEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${ssoEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
          >
            <span className={`${ssoEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Identity Provider Metadata</label>
            <p className="text-xs text-slate-500 mb-2">Upload your IdP metadata XML file to automatically configure endpoints and certificates.</p>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <UploadCloud size={32} className="text-slate-400 mb-3" />
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1">Click to upload XML file</p>
              <p className="text-xs text-slate-500">or drag and drop</p>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs font-bold text-green-600 dark:text-green-400">
               <CheckCircle2 size={14} /> okta_metadata_v2.xml uploaded recently.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 mt-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Manual Configuration</h3>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">IdP Entity ID (Issuer)</label>
              <input value="http://www.okta.com/exk1234567890" readOnly className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 font-mono" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">IdP SSO URL</label>
              <input value={`https://${companySlug}.okta.com/app/circleworks/exk.../sso/saml`} readOnly className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 font-mono" />
            </div>
          </div>

          <div className="flex justify-end pt-4">
             <button 
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-bold transition-colors shadow-sm text-slate-700 dark:text-slate-300"
              >
                {isTesting ? <Loader2 size={14} className="animate-spin" /> : null}
                Test Connection
             </button>
          </div>
        </div>
      </div>

       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden mt-2">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
           <h2 className="text-base font-bold text-slate-900 dark:text-white">SCIM Provisioning</h2>
           <p className="text-xs text-slate-500 mt-1">Automatically sync employees from your IdP.</p>
        </div>
        <div className="p-6 grid grid-cols-1 gap-4">
           <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Base URL</label>
              <div className="flex bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <input value="https://api.circleworks.com/scim/v2" readOnly className="w-full px-3 py-2 bg-transparent text-sm text-slate-600 dark:text-slate-400 font-mono focus:outline-none" />
                <button className="px-3 border-l border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                  <Copy size={16} />
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Bearer Token</label>
              <div className="flex bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <input type="password" value={scimToken} readOnly className="w-full px-3 py-2 bg-transparent text-sm text-slate-600 dark:text-slate-400 font-mono focus:outline-none" />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(scimToken);
                    toast.success("Token copied to clipboard");
                  }}
                  className="px-3 border-l border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                >
                  <Copy size={16} />
                </button>
              </div>
               <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 font-medium">Keep this token secure. You can only view it once upon creation.</p>
            </div>
            <button 
              onClick={handleRotateToken}
              disabled={isRotating}
              className="mt-4 flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors w-max"
            >
               {isRotating ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
               Rotate Token
            </button>
        </div>
       </div>

    </div>
  );
}
