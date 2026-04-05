"use client";
import React, { useState, useMemo } from "react";
import { Plus, Calendar as CalIcon, Edit2, CheckCircle2, X, Save, AlignLeft, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Schedule = {
  id: string;
  name: string;
  frequency: "Bi-Weekly" | "Monthly" | "Semi-Monthly" | "Weekly";
  anchorDate: string;
  active: boolean;
  color: string;
};

const MOCK_SCHEDULES: Schedule[] = [
  { id: "1", name: "Bi-Weekly (Default)", frequency: "Bi-Weekly", anchorDate: "2026-03-20", active: true, color: "emerald" },
  { id: "2", name: "Monthly (Execs)", frequency: "Monthly", anchorDate: "2026-03-31", active: true, color: "blue" },
];

function generateUpcoming(freq: string): { period: string, payDate: string }[] {
  if (freq === "Monthly") {
    return [
      { period: "Mar 1 – Mar 31", payDate: "Mar 31" },
      { period: "Apr 1 – Apr 30", payDate: "Apr 30" },
      { period: "May 1 – May 31", payDate: "May 31" },
      { period: "Jun 1 – Jun 30", payDate: "Jun 30" },
      { period: "Jul 1 – Jul 31", payDate: "Jul 31" },
      { period: "Aug 1 – Aug 31", payDate: "Aug 31" },
    ];
  } else if (freq === "Bi-Weekly") {
    return [
      { period: "Mar 16 – Mar 29", payDate: "Apr 3" },
      { period: "Mar 30 – Apr 12", payDate: "Apr 17" },
      { period: "Apr 13 – Apr 26", payDate: "May 1" },
      { period: "Apr 27 – May 10", payDate: "May 15" },
      { period: "May 11 – May 24", payDate: "May 29" },
      { period: "May 25 – Jun 7", payDate: "Jun 12" },
    ];
  } else if (freq === "Semi-Monthly") {
    return [
      { period: "Mar 1 – Mar 15", payDate: "Mar 15" },
      { period: "Mar 16 – Mar 31", payDate: "Mar 31" },
      { period: "Apr 1 – Apr 15", payDate: "Apr 15" },
      { period: "Apr 16 – Apr 30", payDate: "Apr 30" },
      { period: "May 1 – May 15", payDate: "May 15" },
      { period: "May 16 – May 31", payDate: "May 31" },
    ];
  } else {
    // Weekly
    return [
      { period: "Mar 23 – Mar 29", payDate: "Apr 3" },
      { period: "Mar 30 – Apr 5", payDate: "Apr 10" },
      { period: "Apr 6 – Apr 12", payDate: "Apr 17" },
      { period: "Apr 13 – Apr 19", payDate: "Apr 24" },
      { period: "Apr 20 – Apr 26", payDate: "May 1" },
      { period: "Apr 27 – May 3", payDate: "May 8" },
    ];
  }
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>(MOCK_SCHEDULES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<Schedule>>({ frequency: "Bi-Weekly", color: "purple" });

  const handleOpenNew = () => {
    setEditingPlan({ name: "", frequency: "Bi-Weekly", anchorDate: new Date().toISOString().split('T')[0], active: true, color: "purple" });
    setModalOpen(true);
  };

  const handleOpenEdit = (sch: Schedule) => {
    setEditingPlan(sch);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlan.id) {
      setSchedules(prev => prev.map(s => s.id === editingPlan.id ? { ...s, ...editingPlan } as Schedule : s));
    } else {
      setSchedules(prev => [...prev, { ...editingPlan, id: Math.random().toString() } as Schedule]);
    }
    setModalOpen(false);
  };

  const previewDates = useMemo(() => {
    return generateUpcoming(editingPlan.frequency || "Bi-Weekly");
  }, [editingPlan.frequency]);

  return (
    <div className="flex flex-col gap-6 pb-24 text-slate-900 dark:text-slate-100">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><CalIcon size={20} className="text-purple-600" /></div>
            Pay Schedules
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-[52px]">Manage how often your employees get paid.</p>
        </div>
        <button onClick={handleOpenNew} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 border border-transparent transition-colors">
          <Plus size={16} /> New Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
         {schedules.map(sch => {
           const upcoming = generateUpcoming(sch.frequency).slice(0, 3);
           const colorClass = sch.color === 'emerald' ? 'bg-emerald-500' :
                              sch.color === 'blue' ? 'bg-blue-500' :
                              sch.color === 'purple' ? 'bg-purple-500' : 'bg-orange-500';
           const badgeClass = sch.color === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
                              sch.color === 'blue' ? 'bg-blue-50 text-blue-700' :
                              sch.color === 'purple' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700';

           return (
             <div key={sch.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden group">
                <div className={`absolute top-0 inset-x-0 h-1 ${colorClass}`} />
                <div className="flex justify-between items-start mb-6">
                  <div>
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white">{sch.name}</h2>
                     <p className="text-slate-500 text-sm mt-1">{sch.frequency} frequency</p>
                     <span className={`inline-flex mt-3 ${badgeClass} px-2.5 py-1 rounded-md text-xs font-bold uppercase items-center gap-1`}>
                       {sch.active && <CheckCircle2 size={14}/>} {sch.active ? 'Active' : 'Inactive'}
                     </span>
                  </div>
                  <button onClick={() => handleOpenEdit(sch)} className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={18}/></button>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Upcoming Runs</p>
                   <div className="space-y-2.5">
                     {upcoming.map((u, i) => (
                       <div key={i} className="flex justify-between text-sm">
                         <span className="text-slate-600 dark:text-slate-400 font-medium">{u.period}</span>
                         <span className="font-bold text-slate-900 dark:text-white">{u.payDate}</span>
                       </div>
                     ))}
                   </div>
                   <button onClick={() => handleOpenEdit(sch)} className="w-full mt-4 py-2 text-sm font-bold text-blue-600 hover:text-blue-700 border border-blue-200 bg-white dark:bg-slate-900 rounded-lg transition-colors">
                     View 12 Month Calendar
                   </button>
                </div>
             </div>
           );
         })}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              
              <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex overflow-hidden pointer-events-auto max-h-[90vh]">
                
                {/* Left Side: Form */}
                <div className="flex-1 border-r border-slate-200 dark:border-slate-800 flex flex-col">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CalendarDays size={18} className="text-blue-600"/> 
                      {editingPlan.id ? "Edit Pay Schedule" : "Create Pay Schedule"}
                    </h2>
                    <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  </div>
                  
                  <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5">
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Schedule Name</label>
                      <input required type="text" placeholder="e.g. Weekly Contractors" value={editingPlan.name || ''} onChange={e => setEditingPlan({...editingPlan, name: e.target.value})} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:ring-1 focus:ring-blue-500 font-medium text-slate-900" />
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Pay Frequency</label>
                      <select value={editingPlan.frequency} onChange={e => setEditingPlan({...editingPlan, frequency: e.target.value as any})} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:ring-1 focus:ring-blue-500">
                        <option value="Weekly">Weekly</option>
                        <option value="Bi-Weekly">Bi-Weekly</option>
                        <option value="Semi-Monthly">Semi-Monthly (15th and Last Day)</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">First Pay Date (Anchor)</label>
                      <input required type="date" value={editingPlan.anchorDate || ''} onChange={e => setEditingPlan({...editingPlan, anchorDate: e.target.value})} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:ring-1 focus:ring-blue-500" />
                    </div>

                    <div className="pt-2">
                       <label className="flex items-center gap-3 cursor-pointer">
                         <input type="checkbox" checked={editingPlan.active} onChange={e => setEditingPlan({...editingPlan, active: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>
                         <span className="font-bold text-sm text-slate-700 dark:text-slate-300">Set as active schedule</span>
                       </label>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex gap-3">
                      <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                      <button type="submit" className="flex-[2] py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition-colors flex items-center justify-center gap-2"><Save size={18}/> Save Schedule</button>
                    </div>
                  </form>
                </div>

                {/* Right Side: Visual Preview */}
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-8 overflow-y-auto">
                   <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2"><AlignLeft size={16}/> Next 6 Pay Dates Preview</h3>
                   <div className="space-y-3">
                     {previewDates.map((d, i) => (
                       <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex justify-between items-center">
                         <div>
                           <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Pay Period</p>
                           <p className="text-slate-900 dark:text-white font-medium mt-0.5">{d.period}</p>
                         </div>
                         <div className="text-right">
                           <p className="text-xs text-blue-500 font-bold uppercase tracking-wide">Payday</p>
                           <p className="text-slate-900 dark:text-white font-extrabold mt-0.5 text-lg">{d.payDate}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
