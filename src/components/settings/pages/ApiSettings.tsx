"use client";

import React, { useState } from "react";
import { CheckCircle2, Copy, Key, Plus, Send, Trash2, Webhook } from "lucide-react";
import { mockApiKeys } from "@/data/mockSettings";

const scopeOptions = ["employees:read", "employees:write", "payroll:read", "payroll:write", "documents:send", "webhooks:write"];
const webhookEvents = ["employee.created", "employee.terminated", "payroll.completed", "document.signed", "candidate.hired"];

export default function APISettingsPage() {
  const [keys] = useState(mockApiKeys);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [showNewSecret, setShowNewSecret] = useState(false);

  return (
    <div className="flex max-w-5xl animate-in flex-col gap-8 fade-in duration-500">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">API & Webhooks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Create scoped API keys, configure webhook endpoints, and test signed payload delivery.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">API Keys</h2>
            <p className="mt-1 text-xs text-slate-500">Keys are shown once on creation. Store them in a secure secret manager.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowCreateKey(true);
              setShowNewSecret(false);
            }}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <Plus size={16} /> Create key
          </button>
        </div>

        {showCreateKey && (
          <div className="border-b border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
              <input className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900" placeholder="Key name, e.g. Payroll warehouse sync" />
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
                <option>90 day expiry</option>
                <option>180 day expiry</option>
                <option>1 year expiry</option>
                <option>No expiry</option>
              </select>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {scopeOptions.map((scope) => (
                <label key={scope} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  <input type="checkbox" defaultChecked={scope.endsWith(":read")} /> {scope}
                </label>
              ))}
            </div>
            <button type="button" onClick={() => setShowNewSecret(true)} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
              Generate
            </button>
            {showNewSecret && (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <span className="font-mono text-emerald-900 dark:text-emerald-200">cw_live_shown_once_6PkV8nZy2m9...</span>
                <button className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300"><Copy size={14} /> Copy once</button>
              </div>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-3">Key Name & Prefix</th>
                <th className="px-6 py-3">Scopes</th>
                <th className="px-6 py-3">Created / Expiry</th>
                <th className="px-6 py-3">Last Used</th>
                <th className="px-6 py-3 text-right">Revoke</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {keys.map((key) => (
                <tr key={key.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4">
                    <div className="mb-1 flex items-center gap-2 font-bold text-slate-900 dark:text-white"><Key size={14} className="text-slate-400" /> {key.name}</div>
                    <div className="font-mono text-xs text-slate-500">{key.prefix}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex max-w-[240px] flex-wrap gap-1">
                      {key.scopes.map((scope) => <span key={scope} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">{scope}</span>)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400"><div>{key.createdAt}</div><div>Expires: {key.expiresAt}</div></td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">{key.lastUsed}</td>
                  <td className="px-6 py-4 text-right"><button className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Webhook configuration</h2>
            <p className="mt-1 text-xs text-slate-500">POST signed events to your URL with HMAC-SHA256 signing secrets.</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            <Plus size={16} /> Add endpoint
          </button>
        </div>
        <div className="grid gap-4 p-6 lg:grid-cols-[1fr_220px]">
          <input className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950" defaultValue="https://api.customer.com/circleworks/webhooks" />
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"><Send size={15} /> Send test payload</button>
        </div>
        <div className="flex flex-wrap gap-2 px-6 pb-6">
          {webhookEvents.map((event) => <span key={event} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"><CheckCircle2 size={13} /> {event}</span>)}
        </div>
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950">
          Signing secret: <span className="font-mono text-slate-700 dark:text-slate-300">whsec_...3f91</span>
        </div>
      </div>
    </div>
  );
}
