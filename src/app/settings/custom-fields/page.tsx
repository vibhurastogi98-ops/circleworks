"use client";

import React, { useState } from "react";
import { Plus, Settings2, Trash2, ShieldCheck } from "lucide-react";
import { mockCustomFields } from "@/data/mockSettings";
import {
  FIELD_VISIBILITY_RULES,
  type FieldVisibilityRule,
  type FieldVisibilityRole,
} from "@/lib/fieldVisibility";

const Toggle = ({ checked, onChange, disabled = false }: { checked: boolean, onChange: (v: boolean) => void, disabled?: boolean }) => (
  <button 
    onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    title={disabled ? "Cannot change this field" : "Toggle visibility"}
  >
    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-1'}`} />
  </button>
);

const initialVisibility = FIELD_VISIBILITY_RULES.map((rule) => ({
  ...rule,
  roles: { ...rule.roles },
}));

export default function CustomFieldsSettingsPage() {
  const [fields] = useState(mockCustomFields);
  const [visibilities, setVisibilities] = useState(initialVisibility);
  const [activeTab, setActiveTab] = useState<'custom' | 'visibility'>('custom');

  const handleToggle = (id: string, role: FieldVisibilityRole, newValue: boolean) => {
    setVisibilities(prev => prev.map(v => {
      if (v.id === id) {
        if (role === 'everyone' && newValue) {
          return { ...v, roles: { employee: true, manager: true, hr: true, admin: true, everyone: true } };
        }
        const updatedRoles = { ...v.roles, [role]: newValue };
        if (role !== 'everyone' && !newValue) {
          updatedRoles.everyone = false;
        }
        return { ...v, roles: updatedRoles };
      }
      return v;
    }));
  };

  const applyPIIDefaults = () => {
    setVisibilities(prev => prev.map(v => {
      if (v.sensitive) {
        return {
          ...v,
          roles: {
            employee: false,
            manager: false,
            hr: true,
            admin: true,
            everyone: false,
          },
        };
      }
      return v;
    }));
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile & Fields</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage custom fields and field-level privacy controls for employee profiles.</p>
        </div>
        {activeTab === 'custom' ? (
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus size={16} /> Create Field
          </button>
        ) : (
          <button onClick={applyPIIDefaults} className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <ShieldCheck size={16} /> Apply PII Defaults
          </button>
        )}
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'custom' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Custom Fields
        </button>
        <button
          onClick={() => setActiveTab('visibility')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'visibility' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Field Visibility
        </button>
      </div>

      {activeTab === 'custom' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Field Name</th>
                  <th className="px-6 py-3">Target Model</th>
                  <th className="px-6 py-3">Data Type</th>
                  <th className="px-6 py-3">Access Level</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {fields.map((field) => (
                  <tr key={field.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{field.name}</td>
                    <td className="px-6 py-4">
                       <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {field.target}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          field.type === 'Dropdown' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                          field.type === 'File' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                       }`}>
                          {field.type}
                       </span>
                       {field.type === 'Dropdown' && <span className="text-xs text-slate-400 ml-2">({field.options.length} options)</span>}
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <Settings2 size={14} /> {field.access}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 ml-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'visibility' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Directory & Profile Privacy</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure which roles can view specific fields on an employee's profile. Employee access applies to their own profile.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Field Name</th>
                  <th className="px-4 py-3">Field Type</th>
                  <th className="px-4 py-3 text-center">Employee</th>
                  <th className="px-4 py-3 text-center">Manager</th>
                  <th className="px-4 py-3 text-center">HR</th>
                  <th className="px-4 py-3 text-center">Admin</th>
                  <th className="px-4 py-3 text-center">Everyone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {visibilities.map((v: FieldVisibilityRule) => (
                  <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{v.name}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        v.type === 'System' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {v.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Toggle checked={v.roles.employee} onChange={(val) => handleToggle(v.id, 'employee', val)} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Toggle checked={v.roles.manager} onChange={(val) => handleToggle(v.id, 'manager', val)} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Toggle checked={v.roles.hr} onChange={(val) => handleToggle(v.id, 'hr', val)} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Toggle checked={v.roles.admin} onChange={(val) => handleToggle(v.id, 'admin', val)} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Toggle checked={v.roles.everyone} onChange={(val) => handleToggle(v.id, 'everyone', val)} disabled={!!v.sensitive} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
