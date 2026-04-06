"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Zap, Play, Pause, Clock, FileText, ArrowRight, Activity, CalendarDays, Key, MoreHorizontal } from "lucide-react";
import { MOCK_ACTIVE_WORKFLOWS, MOCK_TEMPLATES } from "@/data/mockWorkflows";
import { motion } from "framer-motion";

export default function WorkflowsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "templates">("active");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Automations
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Build rules to automate HR, IT, and payroll tasks across your company.
          </p>
        </div>
        <Link 
          href="/settings/workflows/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Workflow
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-4 text-sm font-semibold transition-colors relative ${
            activeTab === "active" 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          }`}
        >
          Your Workflows
          {activeTab === "active" && (
            <motion.div layoutId="wf-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`pb-4 text-sm font-semibold transition-colors relative ${
            activeTab === "templates" 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          }`}
        >
          Templates Archive
          {activeTab === "templates" && (
            <motion.div layoutId="wf-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === "active" && (
        <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {MOCK_ACTIVE_WORKFLOWS.length === 0 ? (
            <div className="px-6 py-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No automations yet</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm">
                Save time by automating repetitive tasks like onboarding emails, task creation, and notifications.
              </p>
              <Link 
                href="/settings/workflows/new"
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg text-sm transition-transform hover:scale-105 active:scale-95"
              >
                Create your first workflow
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Name & Trigger</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                    <th className="px-6 py-4">Last Run</th>
                    <th className="px-6 py-4">Runs</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {MOCK_ACTIVE_WORKFLOWS.map((wf) => (
                    <tr key={wf.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <Link href={`/settings/workflows/${wf.id}`} className="block">
                          <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {wf.name}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                            <Activity className="w-3.5 h-3.5" />
                            {wf.triggerEvent}
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          wf.status === "Active" 
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20" 
                            : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"
                        }`}>
                          {wf.status === "Active" ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
                          {wf.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {wf.nodes.filter(n => n.type === 'action').length} actions
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {wf.lastRun || "Never"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {wf.runCount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {MOCK_TEMPLATES.map((template) => (
            <Link 
              key={template.id} 
              href={`/settings/workflows/${template.id}`}
              className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all group flex flex-col h-full"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                {template.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex-1">
                {template.description}
              </p>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  <Activity className="w-3 h-3" /> Trigger
                </div>
                <div className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                  Use Template <ArrowRight className="w-3 h-3" />
                </div>
              </div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1 truncate">
                {template.triggerEvent}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
