"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserMinus, CheckCircle2, Circle, Clock, AlertTriangle,
  Laptop, Monitor, Smartphone, Keyboard, CreditCard, CarFront, Package,
  RotateCcw, Bell
} from "lucide-react";
import { mockOffboardingCases } from "@/data/mockOnboarding";
import { mockAssetAssignments, ASSET_TYPE_ICONS, type AssetType, getAssetsForEmployeeName } from "@/data/mockAssets";

// Extend offboarding cases with asset return tasks
function getOffboardingWithAssets(cases: typeof mockOffboardingCases) {
  return cases.map(c => {
    const assignedAssets = getAssetsForEmployeeName(c.employeeName);

    // Generate asset return tasks from assignments
    const assetTasks = assignedAssets.map(asset => ({
      id: `asset-return-${asset.id}`,
      title: `Return ${asset.assetName} (S/N: ${asset.serialNumber})`,
      assignee: 'IT' as const,
      status: 'Pending' as const,
      isAssetReturn: true,
      assetType: asset.assetType,
      serialNumber: asset.serialNumber,
    }));

    return {
      ...c,
      tasks: [...c.tasks.map(t => ({ ...t, isAssetReturn: false, assetType: null as AssetType | null, serialNumber: null as string | null })), ...assetTasks],
      hasUnreturnedAssets: assetTasks.length > 0,
      unreturnedCount: assetTasks.filter(t => t.status === 'Pending').length,
    };
  });
}

// Asset type icon component
function AssetTypeIcon({ type, size = 14 }: { type: AssetType; size?: number }) {
  const iconMap: Record<AssetType, React.ReactNode> = {
    'Laptop': <Laptop size={size} />,
    'Monitor': <Monitor size={size} />,
    'Phone': <Smartphone size={size} />,
    'Keyboard': <Keyboard size={size} />,
    'Badge': <CreditCard size={size} />,
    'Parking Pass': <CarFront size={size} />,
    'Other': <Package size={size} />,
  };
  return <>{iconMap[type] || <Package size={size} />}</>;
}

import { toast } from "sonner";
import { formatDate } from "@/utils/formatDate";

export default function OffboardingPage() {
  const enrichedCases = getOffboardingWithAssets(mockOffboardingCases);
  const [taskStates, setTaskStates] = useState<Record<string, 'Pending' | 'Complete'>>({});

  const toggleTask = (taskId: string, isAssetReturn: boolean = false, assetName: string = "") => {
    const isNowComplete = taskStates[taskId] !== 'Complete';
    
    setTaskStates(prev => ({
      ...prev,
      [taskId]: isNowComplete ? 'Complete' : 'Pending',
    }));

    if (isAssetReturn && isNowComplete) {
      toast.success(`${assetName} returned to available inventory`);
    } else if (isNowComplete) {
      toast.success("Task marked as complete");
    }
  };

  const getTaskStatus = (taskId: string, originalStatus: string) => {
    return taskStates[taskId] || originalStatus;
  };

  // Check if any cases have unreturned assets past termination date
  const overdueAlerts = enrichedCases.filter(c => {
    const termDate = new Date(c.terminationDate);
    const today = new Date();
    return c.hasUnreturnedAssets && termDate < today;
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Offboarding</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage active offboarding cases and ensure compliance tasks are completed.</p>
        </div>
        <Link href="/onboarding" className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors">
          ← Back to Onboarding
        </Link>
      </div>

      {/* Asset Return Alerts */}
      {overdueAlerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-red-800 dark:text-red-300">Equipment Not Returned</h3>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              {overdueAlerts.length} terminated employee{overdueAlerts.length > 1 ? 's have' : ' has'} unreturned company equipment past their termination date.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {overdueAlerts.map(c => (
                <span key={c.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-bold">
                  <Bell size={10} className="animate-pulse" /> {c.employeeName} — {c.unreturnedCount} item{c.unreturnedCount > 1 ? 's' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Offboarding Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {enrichedCases.map(c => {
          const completed = c.tasks.filter(t => getTaskStatus(t.id, t.status) === 'Complete').length;
          const total = c.tasks.length;
          const pct = Math.round((completed / total) * 100);
          const assetTasks = c.tasks.filter(t => t.isAssetReturn);
          const regularTasks = c.tasks.filter(t => !t.isAssetReturn);

          return (
            <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
              {/* Case Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <UserMinus size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white">{c.employeeName}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{c.department}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    <span>{c.reason}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-500">Termination Date</div>
                  <div className="font-bold text-sm text-red-600 dark:text-red-400">{formatDate(c.terminationDate)}</div>
                </div>
              </div>

              {/* Progress */}
              <div className="px-5 pt-4 pb-2">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-bold text-slate-900 dark:text-white">Task Completion</span>
                  <span className="font-black text-slate-900 dark:text-white">{pct}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${pct >= 80 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>

              {/* Regular Task List */}
              <div className="flex-1 p-5 pt-3">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {regularTasks.map(task => {
                    const status = getTaskStatus(task.id, task.status);
                    return (
                      <div key={task.id} className="flex items-center gap-3 py-3 group">
                        {status === 'Complete' ? (
                          <CheckCircle2 size={18} className="text-green-500 shrink-0 cursor-pointer" onClick={() => toggleTask(task.id)} />
                        ) : (
                          <Circle size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 cursor-pointer transition-colors shrink-0" onClick={() => toggleTask(task.id)} />
                        )}
                        <span className={`flex-1 text-sm ${status === 'Complete' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white font-medium'}`}>
                          {task.title}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0
                          ${task.assignee === 'HR' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                          {task.assignee}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Asset Return Section */}
                {assetTasks.length > 0 && (
                  <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Package size={14} className="text-blue-600 dark:text-blue-400" />
                      <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Equipment Returns</h4>
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-bold">
                        {assetTasks.length}
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {assetTasks.map(task => {
                        const status = getTaskStatus(task.id, task.status);
                        return (
                          <div key={task.id} className="flex items-center gap-3 py-3 group">
                            {status === 'Complete' ? (
                              <CheckCircle2 size={18} className="text-emerald-500 shrink-0 cursor-pointer" onClick={() => toggleTask(task.id, true, task.title.replace('Return ', ''))} />
                            ) : (
                              <Circle size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 cursor-pointer transition-colors shrink-0" onClick={() => toggleTask(task.id, true, task.title.replace('Return ', ''))} />
                            )}
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {task.assetType && (
                                <div className="w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                  <AssetTypeIcon type={task.assetType} size={14} />
                                </div>
                              )}
                              <span className={`text-sm truncate ${status === 'Complete' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white font-medium'}`}>
                                {task.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {status === 'Complete' ? (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-1">
                                  <RotateCcw size={10} /> Returned
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                  IT
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
