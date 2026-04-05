"use client";

import React, { useState } from "react";
import { Plus, Edit3, Trash2, Users, CornerDownRight, X, Briefcase, Hash } from "lucide-react";
import { mockDepartments } from "@/data/mockSettings";
import { useDashboardData } from "@/hooks/useDashboardData";
import { toast } from "sonner";

export default function DepartmentsSettingsPage() {
  const { isNewUser } = useDashboardData();
  const [departments, setDepartments] = useState(mockDepartments);
  const [showModal, setShowModal] = useState(false);
  
  // New Dept Form State
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newParent, setNewParent] = useState("");
  const [newHead, setNewHead] = useState("");

  const handleSave = () => {
    if (!newName || !newCode) return;
    const newDept = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      code: newCode,
      head: newHead || "Unassigned",
      employeeCount: 0,
      parent: newParent || null
    };
    setDepartments([...departments, newDept] as any);
    setShowModal(false);
    resetForm();
    toast.success(`Department "${newName}" created successfully.`);
  };

  const handleDelete = (id: string, name: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
    toast.info(`Department "${name}" removed.`);
  };

  const resetForm = () => {
    setNewName("");
    setNewCode("");
    setNewParent("");
    setNewHead("");
  };

  const displayDepartments = isNewUser 
    ? departments.map(d => ({ ...d, employeeCount: 0 }))
    : departments;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Departments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Organize your company into departments and sub-departments.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} /> Add Department
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Department Name</th>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Department Head</th>
                <th className="px-6 py-3 text-right">Employees</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayDepartments.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {dept.parent && <CornerDownRight size={14} className="text-slate-400 ml-4" />}
                    {dept.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">{dept.code}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{dept.head}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 font-medium text-slate-900 dark:text-white">
                      <Users size={14} className="text-slate-400" />
                      {dept.employeeCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 transition-colors">
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(dept.id, dept.name)}
                      className="p-1.5 ml-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Department</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block font-mono">Department Name</label>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Finance" 
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" 
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block font-mono">Department Code</label>
                <div className="relative">
                  <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="e.g. FIN-100" 
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-mono" 
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block font-mono">Parent (Parent Dept)</label>
                <select 
                  value={newParent}
                  onChange={(e) => setNewParent(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                >
                  <option value="">None (Top Level)</option>
                  {departments.filter(d => !d.parent).map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block font-mono">Department Head</label>
                <input 
                  value={newHead}
                  onChange={(e) => setNewHead(e.target.value)}
                  placeholder="Name of Head..." 
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" 
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
              <button 
                onClick={handleSave}
                disabled={!newName || !newCode}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-sm"
              >
                Create Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
