"use client";

import React, { useState } from "react";
import { Link2, Unlink } from "lucide-react";
import { mockIntegrations } from "@/data/mockSettings";
import * as Icons from "lucide-react";

export default function IntegrationsSettingsPage() {
  const [integrations] = useState(mockIntegrations);

  const getIcon = (iconName: string) => {
    // Basic dynamic icon mapper for demo purposes
    const IconComponent = (Icons as any)[iconName.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')] || Icons.Box;
    return <IconComponent size={24} strokeWidth={1.5} />;
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Integrations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Connect CircleWorks to your existing tools and platforms.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between h-48">
            <div className="flex justify-between items-start">
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${integration.status === "Connected" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                 {getIcon(integration.icon)}
               </div>
               <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${integration.status === "Connected" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                 {integration.status}
               </span>
            </div>
            
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{integration.name}</h3>
              <p className="text-xs text-slate-500 font-medium mb-3">{integration.category} Integration</p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="text-[10px] text-slate-400 flex flex-col">
                {integration.status === "Connected" && (
                   <><span>Last Sync</span><span className="font-bold text-slate-600 dark:text-slate-300">{integration.lastSync}</span></>
                )}
              </span>
              <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                integration.status === "Connected" 
                  ? "bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-red-900/30 dark:hover:text-red-400" 
                  : "bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 dark:text-blue-400"
              }`}>
                {integration.status === "Connected" ? <><Unlink size={12}/> Disconnect</> : <><Link2 size={12}/> Connect</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
