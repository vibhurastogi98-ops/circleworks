"use client";

import React, { useState } from "react";
import { Plus, Copy, Trash2, GripVertical, ChevronRight, LayoutTemplate, Briefcase, UserMinus, Package, Laptop, Monitor, Smartphone, Keyboard, CreditCard, CarFront } from "lucide-react";
import { mockOnboardingTemplates } from "@/data/mockOnboarding";
import { ASSET_TYPES, ASSET_TYPE_ICONS, type AssetType } from "@/data/mockAssets";
import { formatDate } from "@/utils/formatDate";

type TaskType = 'standard' | 'assign_equipment';

interface NewTask {
  id: string;
  title: string;
  assignee: string;
  dueOffset: number;
  taskType: TaskType;
  equipmentTypes?: AssetType[];
}

export default function TemplateLibrary() {
  const [typeFilter, setTypeFilter] = useState<'all' | 'onboarding' | 'offboarding'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [tasks, setTasks] = useState<NewTask[]>([
    { id: 'new-1', title: 'Send welcome email', assignee: 'HR', dueOffset: -3, taskType: 'standard' },
  ]);

  const filtered = mockOnboardingTemplates.filter(t => typeFilter === 'all' || t.type === typeFilter);

  const addTask = (type: TaskType = 'standard') => {
    const newTask: NewTask = {
      id: `new-${Date.now()}`,
      title: type === 'assign_equipment' ? 'Assign Equipment' : '',
      assignee: type === 'assign_equipment' ? 'IT' : 'HR',
      dueOffset: 0,
      taskType: type,
      equipmentTypes: type === 'assign_equipment' ? ['Laptop'] : undefined,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTask = (id: string, field: string, value: any) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const toggleEquipmentType = (taskId: string, type: AssetType) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const current = t.equipmentTypes || [];
      if (current.includes(type)) {
        return { ...t, equipmentTypes: current.filter(et => et !== type) };
      } else {
        return { ...t, equipmentTypes: [...current, type] };
      }
    }));
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Template Library</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage reusable task checklists for onboarding and offboarding flows.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} /> Create Template
        </button>
      </div>

      {/* Filter */}
      <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {([['all','All'], ['onboarding','Onboarding'], ['offboarding','Offboarding']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setTypeFilter(val)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${typeFilter === val ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Inline Create Form */}
      {showCreate && (
        <div className="bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">New Template</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Template Name</label>
              <input type="text" className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="e.g., Engineering Fast Track" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Type</label>
              <select className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                <option value="onboarding">Onboarding</option>
                <option value="offboarding">Offboarding</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Department Rule</label>
              <select className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                <option value="">All Departments</option>
                <option>Engineering</option>
                <option>Product</option>
                <option>Sales</option>
                <option>Marketing</option>
              </select>
            </div>
          </div>

          {/* Task Builder */}
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Tasks</h4>
          <div className="flex flex-col gap-2 mb-4">
            {tasks.map(task => (
              <div key={task.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <GripVertical size={16} className="text-slate-400 cursor-move" />

                  {task.taskType === 'assign_equipment' ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                        <Package size={12} className="text-blue-600" />
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Equipment</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">Assign Equipment</span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => updateTask(task.id, 'title', e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-900 dark:text-white"
                      placeholder="Task title..."
                    />
                  )}

                  <select
                    value={task.assignee}
                    onChange={(e) => updateTask(task.id, 'assignee', e.target.value)}
                    className="text-xs border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 bg-white dark:bg-slate-900"
                  >
                    <option>HR</option><option>Manager</option><option>IT</option><option>Employee</option>
                  </select>

                  <input
                    type="number"
                    value={task.dueOffset}
                    onChange={(e) => updateTask(task.id, 'dueOffset', parseInt(e.target.value))}
                    className="w-20 text-xs border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 bg-white dark:bg-slate-900 text-center"
                    title="Days offset"
                  />
                  <span className="text-[10px] text-slate-500">days</span>

                  <button onClick={() => removeTask(task.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Equipment Type Selection — only for assign_equipment tasks */}
                {task.taskType === 'assign_equipment' && (
                  <div className="ml-8 p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg animate-in slide-in-from-top-1 duration-200">
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2">Select equipment to assign on start date:</p>
                    <div className="flex flex-wrap gap-2">
                      {ASSET_TYPES.map(type => {
                        const isSelected = task.equipmentTypes?.includes(type);
                        return (
                          <button
                            key={type}
                            onClick={() => toggleEquipmentType(task.id, type)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300 ring-2 ring-blue-500/20'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-200 dark:hover:border-blue-800'
                            }`}
                          >
                            <span>{ASSET_TYPE_ICONS[type]}</span> {type}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-blue-600/70 dark:text-blue-400/60 mt-2">
                      💡 On the employee's start date, IT will receive assignment tasks for each selected type from the inventory.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Task Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => addTask('standard')}
              className="flex-1 py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={16} /> Add Task
            </button>
            <button
              onClick={() => addTask('assign_equipment')}
              className="flex-1 py-2.5 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center gap-2 transition-colors"
            >
              <Package size={16} /> Add Equipment Assignment
            </button>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Cancel</button>
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors">Save Template</button>
          </div>
        </div>
      )}

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(tmpl => (
          <div key={tmpl.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tmpl.type === 'onboarding' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                  {tmpl.type === 'onboarding' ? <LayoutTemplate size={20} /> : <UserMinus size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{tmpl.name}</h3>
                  <span className="text-xs text-slate-500">{tmpl.department || 'All Departments'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">{tmpl.taskCount} tasks</span>
              <span>Last used: {formatDate(tmpl.lastUsed)}</span>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button className="flex-1 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center gap-1">
                Edit <ChevronRight size={12} />
              </button>
              <button className="flex-1 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1">
                <Copy size={12} /> Clone
              </button>
              <button className="py-1.5 px-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
