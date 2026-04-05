"use client";

import React, { useState } from "react";
import { Plus, Edit3, Settings2, Users, Shield, X } from "lucide-react";
import { mockRoles } from "@/data/mockSettings";
import { toast } from "sonner";

export default function RolesSettingsPage() {
  const [roles, setRoles] = useState(mockRoles);
  const [showModal, setShowModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  const handleCreateRole = () => {
    if (!newRoleName) return;
    const newRole = {
      id: Math.random().toString(36).substr(2, 9),
      name: newRoleName,
      type: "Custom" as const,
      description: newRoleDesc,
      userCount: 0
    };
    setRoles([...roles, newRole]);
    setShowModal(false);
    setNewRoleName("");
    setNewRoleDesc("");
    toast.success(`Role "${newRoleName}" created successfully.`);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Roles & Permissions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage custom access levels and predefined roles.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} /> Create Custom Role
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {roles.map((role, i) => (
          <div key={role.id} className={`p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${i !== roles.length - 1 ? 'border-b border-slate-200 dark:border-slate-800' : ''}`}>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{role.name}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${role.type === "Built-in" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"}`}>
                  {role.type}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{role.description}</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Users size={16} /> {role.userCount} users
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5">
                  <Settings2 size={14} /> Permissions
                </button>
                {role.type === "Custom" && (
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Edit3 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Custom Role</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Role Name</label>
                <input 
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. Audit Manager" 
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Description</label>
                <textarea 
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="What can this role do?" 
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none" 
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
              <button 
                onClick={handleCreateRole}
                disabled={!newRoleName}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-sm"
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
