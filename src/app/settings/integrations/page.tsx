"use client";

import React, { useState } from "react";
import { Activity, KeyRound, Link2, Unlink, X } from "lucide-react";
import { mockIntegrations } from "@/data/mockSettings";
import * as Icons from "lucide-react";

type Integration = (typeof mockIntegrations)[number];

export default function IntegrationsSettingsPage() {
  const [integrations] = useState(mockIntegrations);
  const [activeIntegration, setActiveIntegration] = useState<Integration | null>(null);

  const getIcon = (iconName: string) => {
    const pascalName = iconName.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
    const IconComponent = (Icons as Record<string, React.ElementType>)[pascalName] || Icons.Box;
    return <IconComponent size={24} strokeWidth={1.5} />;
  };

  return (
    <div className="flex max-w-5xl animate-in flex-col gap-6 fade-in duration-500">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Integrations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Connected integrations show live sync health. Available integrations open OAuth or API key setup.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => {
          const connected = integration.status === "Connected";

          return (
            <div key={integration.id} className="flex min-h-56 flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${connected ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                  {getIcon(integration.icon)}
                </div>
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${connected ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                  {integration.status}
                </span>
              </div>

              <div>
                <h3 className="mb-1 text-base font-bold text-slate-900 dark:text-white">{integration.name}</h3>
                <p className="mb-3 text-xs font-medium text-slate-500">{integration.category} integration</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Activity size={13} className={connected ? "text-emerald-500" : "text-slate-400"} />
                  <span>{connected ? `Healthy - last sync ${integration.lastSync}` : "Ready to connect"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {connected ? "OAuth active" : "OAuth / API key"}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveIntegration(integration)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    connected
                      ? "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300"
                  }`}
                >
                  {connected ? <><Unlink size={12} /> Manage</> : <><Link2 size={12} /> Connect</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {activeIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{activeIntegration.name}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Configure connection method, credentials, and sync health.</p>
              </div>
              <button type="button" onClick={() => setActiveIntegration(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <button className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                <span>
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">OAuth connection</span>
                  <span className="mt-1 block text-xs text-slate-500">Open secure authorization flow.</span>
                </span>
                <Link2 size={18} className="text-blue-600" />
              </button>
              <button className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                <span>
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">API key setup</span>
                  <span className="mt-1 block text-xs text-slate-500">Paste vendor key, workspace ID, and sync scope.</span>
                </span>
                <KeyRound size={18} className="text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
