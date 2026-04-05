"use client";

import React, { useState } from "react";
import { Plus, Calendar, Clock, Edit3, Trash2, X } from "lucide-react";
import { mockPaySchedules } from "@/data/mockSettings";
import { toast } from "sonner";

export default function PaySchedulesSettingsPage() {
  const [schedules, setSchedules] = useState(mockPaySchedules);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFreq, setNewFreq] = useState("Bi-weekly");
  const [editSchedule, setEditSchedule] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<any>(null);

  const handleDeleteSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
    setShowDeleteConfirm(null);
    toast.success("Pay schedule removed.");
  };

  const handleUpdateSchedule = () => {
    if (!editSchedule || !editSchedule.name) return;
    setSchedules(schedules.map(s => s.id === editSchedule.id ? editSchedule : s));
    setEditSchedule(null);
    toast.success(`Pay schedule "${editSchedule.name}" updated.`);
  };

  const handleCreateSchedule = () => {
    if (!newName) return;
    const newSchedule = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      frequency: newFreq,
      employees: 0,
      nextPayDay: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      cutoff: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      default: false
    };
    setSchedules([...schedules, newSchedule]);
    setShowModal(false);
    setNewName("");
    toast.success(`Pay schedule "${newName}" created.`);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pay Schedules</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure how and when your employees are paid.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} /> New Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{schedule.name}</h3>
                    {schedule.default && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 font-medium">{schedule.frequency}</p>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setEditSchedule({...schedule})}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                  {!schedule.default && (
                    <button 
                      onClick={() => setShowDeleteConfirm(schedule)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-y border-slate-100 dark:border-slate-800 mt-2 mb-4">
                 <div className="flex flex-col">
                   <span className="text-xs text-slate-500 font-bold uppercase mb-1">Assigned</span>
                   <span className="text-sm font-medium text-slate-900 dark:text-white">{schedule.employees} Employees</span>
                 </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5"><Calendar size={14} /> Next Pay Day</span>
                  <span className="font-bold text-slate-900 dark:text-white">{new Date(schedule.nextPayDay).toDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5"><Clock size={14} /> Timesheet Cutoff</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(schedule.cutoff).toDateString()}</span>
                </div>
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Pay Schedule</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Schedule Name</label>
                <input 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Salaried Semi-monthly" 
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Frequency</label>
                <select 
                  value={newFreq}
                  onChange={(e) => setNewFreq(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white appearance-none"
                >
                  <option>Weekly</option>
                  <option>Bi-weekly</option>
                  <option>Semi-monthly</option>
                  <option>Monthly</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
              <button 
                onClick={handleCreateSchedule}
                disabled={!newName}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-sm"
              >
                Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {editSchedule && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditSchedule(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Schedule: {editSchedule.name}</h3>
              <button onClick={() => setEditSchedule(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Schedule Name</label>
                <input 
                  value={editSchedule.name}
                  onChange={(e) => setEditSchedule({...editSchedule, name: e.target.value})}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Frequency</label>
                <select 
                  value={editSchedule.frequency}
                  onChange={(e) => setEditSchedule({...editSchedule, frequency: e.target.value})}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white appearance-none"
                >
                  <option>Weekly</option>
                  <option>Bi-weekly</option>
                  <option>Semi-monthly</option>
                  <option>Monthly</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button onClick={() => setEditSchedule(null)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
              <button 
                onClick={handleUpdateSchedule}
                disabled={!editSchedule.name}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Pay Schedule</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Are you sure you want to delete the <span className="font-bold text-slate-900 dark:text-white">"{showDeleteConfirm.name}"</span> pay schedule? 
                Employees assigned to this schedule will need to be re-assigned.
              </p>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
              <button 
                onClick={() => handleDeleteSchedule(showDeleteConfirm.id)}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95"
              >
                Delete Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
