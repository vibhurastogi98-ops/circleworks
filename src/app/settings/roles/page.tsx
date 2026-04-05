"use client";

import React, { useState } from "react";
import { Plus, Edit3, Settings2, Users } from "lucide-react";
import { mockRoles } from "@/data/mockSettings";

export default function RolesSettingsPage() {
  const [roles, setRoles] = useState(mockRoles);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Roles & Permissions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage custom access levels and predefined roles.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
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
    </div>
  );
}
