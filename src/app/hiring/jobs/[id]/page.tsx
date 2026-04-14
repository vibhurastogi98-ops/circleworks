"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getJobById, getCandidatesByJob, STAGES, CandidateStage, AtsCandidate } from "@/data/mockAts";
import { MoreHorizontal, Link as LinkIcon, Plus, Edit, Pause, X, Star, Hand, User, FileText, CheckCircle, Clock, Mail, Activity, MessageSquare, ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getBanTheBoxJurisdiction } from "@/utils/compliance";
import { formatDate } from "@/utils/formatDate";

// --- DND KIT COMPONENTS ---

function SortableCandidateCard({ candidate, onClick }: { candidate: AtsCandidate, onClick: (c: AtsCandidate) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={(e) => { e.stopPropagation(); onClick(candidate); }}>
      <CandidateCard candidate={candidate} />
    </div>
  );
}

function CandidateCard({ candidate }: { candidate: AtsCandidate }) {
  const initials = candidate.firstName.charAt(0) + candidate.lastName.charAt(0);
  const colorMap: Record<string, string> = { 'A': 'bg-blue-500', 'S': 'bg-indigo-500', 'J': 'bg-green-500', 'C': 'bg-amber-500' };
  const avatarColor = colorMap[candidate.firstName.charAt(0)] || 'bg-slate-500';

  const getScoreColor = (score: number) => {
     if (score >= 80) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
     if (score >= 60) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
     return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-4 cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing flex flex-col gap-3 group relative">
      {/* Drag handle styling - visual only */}
      <div className="absolute top-2 right-2 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"><GripIcon /></div>

      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full ${avatarColor} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <h4 className="font-bold text-slate-900 dark:text-white truncate">{candidate.firstName} {candidate.lastName}</h4>
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
             <span className="truncate">{candidate.source}</span>
             <span>•</span>
             <span>Applied {formatDate(candidate.appliedDate)}</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-slate-100 dark:border-slate-700/50">
         "Passionate developer with 5 years building scalable..."
      </div>

      <div className="flex items-center justify-between pt-1">
         <div className="flex items-center gap-2">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getScoreColor(candidate.aiScore)}`}>
               Match {candidate.aiScore}%
            </span>
            {candidate.rating && (
               <span className="flex items-center gap-0.5 text-amber-500 text-[10px] font-bold px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 rounded">
                 <Star size={10} className="fill-amber-500" /> {candidate.rating}
               </span>
            )}
         </div>
         
         <div className="flex items-center">
            {candidate.reviewers.length > 0 ? candidate.reviewers.map((r, i) => (
               <img key={i} src={r} className="w-5 h-5 rounded-full border border-white dark:border-slate-800 -ml-1 first:ml-0" alt="" />
            )) : <div className="text-[10px] text-slate-400">0 days here</div>}
         </div>
      </div>
    </div>
  );
}

const GripIcon = () => (
   <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 3C4.5 2.44772 4.94772 2 5.5 2C6.05228 2 6.5 2.44772 6.5 3C6.5 3.55228 6.05228 4 5.5 4C4.94772 4 4.5 3.55228 4.5 3ZM10.5 3C10.5 2.44772 10.9477 2 11.5 2C12.0523 2 12.5 2.44772 12.5 3C12.5 3.55228 12.0523 4 11.5 4C10.9477 4 10.5 3.55228 10.5 3ZM4.5 7.5C4.5 6.94772 4.94772 6.5 5.5 6.5C6.05228 6.5 6.5 6.94772 6.5 7.5C6.5 8.05228 6.05228 8.5 5.5 8.5C4.94772 8.5 4.5 8.05228 4.5 7.5ZM10.5 7.5C10.5 6.94772 10.9477 6.5 11.5 6.5C12.0523 6.5 12.5 6.94772 12.5 7.5C12.5 8.05228 12.0523 8.5 11.5 8.5C10.9477 8.5 10.5 8.05228 10.5 7.5ZM4.5 12C4.5 11.4477 4.94772 11 5.5 11C6.05228 11 6.5 11.4477 6.5 12C6.5 12.5523 6.05228 13 5.5 13C4.94772 13 4.5 12.5523 4.5 12ZM10.5 12C10.5 11.4477 10.9477 11 11.5 11C12.0523 11 12.5 11.4477 12.5 12C12.5 12.5523 12.0523 13 11.5 13C10.9477 13 10.5 12.5523 10.5 12Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
)

// --- MAIN PAGE ---

export default function KanbanBoard() {
  const { id } = useParams();
  const job = useMemo(() => getJobById(id as string), [id]);
  const initialCandidates = useMemo(() => getCandidatesByJob(id as string), [id]);

  const [candidates, setCandidates] = useState(initialCandidates);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Drawer State
  const [selectedCandidate, setSelectedCandidate] = useState<AtsCandidate | null>(null);
  const [drawerTab, setDrawerTab] = useState<'Overview'|'Scorecard'|'Notes'|'Emails'|'Activity'|'Background'>('Overview');
  
  // Background Check State
  const [bgStatuses, setBgStatuses] = useState<Record<string, 'Not Started' | 'Pending' | 'Clear' | 'Adverse'>>({});
  const [nycChecklists, setNycChecklists] = useState<Record<string, boolean>>({});

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor));

  if (!job) return <div>Job not found</div>;

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    const candidateId = active.id;
    const overId = over.id;

    // Detect if dropped on a column container or another card
    const targetStage = STAGES.find(s => s.id === overId)?.id || candidates.find(c => c.id === overId)?.stage;

    if (targetStage && targetStage !== candidates.find(c=>c.id===candidateId)?.stage) {
       // Optimistic update
       setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage: targetStage as CandidateStage } : c));
       
       if (targetStage === 'Withdrawn') {
          // In real app: open DQ modal
       } else if (targetStage === 'Hired') {
          // In real app: open onboard modal
       }
       // POST /api/ats/candidates/{id}/stage -> body: {newStage: targetStage}
    }
    setActiveId(null);
  };

  const currentActiveCandidate = useMemo(() => candidates.find(c => c.id === activeId), [activeId, candidates]);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] relative overflow-hidden -mx-4 sm:-mx-6 -my-6 px-4 sm:px-6 py-6 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
         <div>
            <div className="flex items-center gap-3 mb-1">
               <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{job.title}</h1>
               <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                  {job.status}
               </span>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
               <span>{job.department}</span> • <span>{job.location}</span> • <span>{job.type}</span> 
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm font-medium">
               <div className="text-slate-700 dark:text-slate-300"><span className="text-blue-600 dark:text-blue-400">{candidates.length}</span> Total Applicants</div>
               <div className="text-slate-700 dark:text-slate-300"><span className="text-indigo-600 dark:text-indigo-400">{candidates.filter(c=>c.stage==='Screening').length}</span> Screening</div>
               <div className="text-slate-700 dark:text-slate-300"><span className="text-amber-600 dark:text-amber-400">{candidates.filter(c=>c.stage==='Onsite').length}</span> Interviewing</div>
               <div className="text-slate-700 dark:text-slate-300"><span className="text-green-600 dark:text-green-400">{candidates.filter(c=>c.stage==='Offer').length}</span> Offers Out</div>
               <div className="text-slate-500 border-l border-slate-300 dark:border-slate-700 pl-4">{job.daysOpen} Days Open</div>
            </div>
         </div>

         <div className="flex items-center gap-2">
            <button className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700" title="Edit Job"><Edit size={16} /></button>
            <button className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700" title="Pause Post"><Pause size={16} /></button>
            <button className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700" title="Copy Link"><LinkIcon size={16} /></button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm ml-2">
               <Plus size={16} /> Add Candidate
            </button>
         </div>
      </div>

      {/* KANBAN BOARD */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
         <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 h-full" style={{ minWidth: `${STAGES.length * 300}px` }}>
               
               {STAGES.map(stage => {
                  const stageCandidates = candidates.filter(c => c.stage === stage.id);
                  return (
                     <div key={stage.id} className="flex flex-col w-[300px] shrink-0 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden h-full">
                        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">{stage.title}</h3>
                           </div>
                           <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm">
                              {stageCandidates.length}
                           </span>
                        </div>

                        {/* Droppable Zone for Empty Columns. Need sortable context for items. */}
                        <div className="p-3 flex-1 overflow-y-auto space-y-3" id={stage.id}>
                           <SortableContext items={stageCandidates.map(c=>c.id)} strategy={horizontalListSortingStrategy}>
                              {stageCandidates.map(candidate => (
                                 <SortableCandidateCard key={candidate.id} candidate={candidate} onClick={setSelectedCandidate} />
                              ))}
                           </SortableContext>
                           {stageCandidates.length === 0 && (
                              <div className="h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium">
                                 Drop candidates here
                              </div>
                           )}
                        </div>
                     </div>
                  );
               })}

            </div>

            <DragOverlay>
               {activeId && currentActiveCandidate ? (
                  <CandidateCard candidate={currentActiveCandidate} />
               ) : null}
            </DragOverlay>

         </DndContext>
      </div>

      {/* DRAWER LAYER (Framer Motion replacing Radix Sheet) */}
      <AnimatePresence>
         {selectedCandidate && (
            <>
               <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm z-40"
                  onClick={() => setSelectedCandidate(null)}
               />
               <motion.div 
                  initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col"
               >
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xl">
                           {selectedCandidate.firstName.charAt(0)}{selectedCandidate.lastName.charAt(0)}
                        </div>
                        <div>
                           <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedCandidate.firstName} {selectedCandidate.lastName}</h2>
                           <div className="text-sm text-slate-500">Applying for {job.title}</div>
                        </div>
                     </div>
                     <button onClick={() => setSelectedCandidate(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-200 dark:bg-slate-800 rounded-full">
                        <X size={20} />
                     </button>
                  </div>

                  {/* Drawer Tabs Navigation */}
                  <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 shrink-0 px-6 hide-scrollbar">
                     {['Overview', 'Scorecard', 'Notes', 'Emails', 'Activity', 'Background'].map(tab => (
                        <button 
                           key={tab}
                           onClick={() => setDrawerTab(tab as any)}
                           className={`px-4 py-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${drawerTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                        >
                           {tab}
                        </button>
                     ))}
                  </div>

                  {/* Drawer Content Area */}
                  <div className="flex-1 overflow-y-auto p-6">
                     {drawerTab === 'Overview' && (
                        <div className="flex flex-col gap-6 animate-in fade-in">
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <span className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Email</span>
                                 <div className="text-sm text-slate-900 dark:text-white font-medium">{selectedCandidate.email}</div>
                              </div>
                              <div>
                                 <span className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Source</span>
                                 <div className="text-sm text-slate-900 dark:text-white font-medium">{selectedCandidate.source}</div>
                              </div>
                              <div>
                                 <span className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Applied Date</span>
                                 <div className="text-sm text-slate-900 dark:text-white font-medium">{formatDate(selectedCandidate.appliedDate)}</div>
                              </div>
                              <div>
                                 <span className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">AI Match Score</span>
                                 <div className="text-sm text-green-600 dark:text-green-400 font-black">{selectedCandidate.aiScore}%</div>
                              </div>
                           </div>

                           <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-blue-50 dark:bg-blue-900/10">
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><FileText size={16}/> Resume Preview Extract</h3>
                              <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                                 "Passionate developer with 5 years building scalable web architectures using React, Node.js, and AWS. Proven track record leading multidisciplinary teams to deliver on time."
                              </p>
                              <button className="mt-4 text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">View Full PDF Resume &rarr;</button>
                           </div>
                        </div>
                     )}

                     {drawerTab === 'Scorecard' && (
                        <div className="flex flex-col gap-6 animate-in fade-in">
                           <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                              <div>
                                 <h4 className="font-bold text-slate-900 dark:text-white">Overall Recommendation</h4>
                                 <p className="text-xs text-slate-500">Based on 2 reviewer feedback</p>
                              </div>
                              <div className="text-2xl font-black text-green-600 flex items-center gap-1">
                                 <Hand size={24} /> Hire
                              </div>
                           </div>

                           <div className="space-y-4">
                              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                 <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Technical Skills</span>
                                 <div className="flex gap-1 text-amber-500"><Star size={14} className="fill-amber-500"/><Star size={14} className="fill-amber-500"/><Star size={14} className="fill-amber-500"/><Star size={14} className="fill-amber-500"/><Star size={14} /></div>
                              </div>
                              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                 <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Communication</span>
                                 <div className="flex gap-1 text-amber-500"><Star size={14} className="fill-amber-500"/><Star size={14} className="fill-amber-500"/><Star size={14} className="fill-amber-500"/><Star size={14} className="fill-amber-500"/><Star size={14} className="fill-amber-500"/></div>
                              </div>
                              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                 <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Culture Add</span>
                                 <div className="flex gap-1 text-amber-500"><Star size={14} className="fill-amber-500"/><Star size={14} className="fill-amber-500"/><Star size={14} className="fill-amber-500"/><Star size={14} /><Star size={14} /></div>
                              </div>
                           </div>
                           <button className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold shadow transition-colors">Submit My Scorecard</button>
                        </div>
                     )}

                     {drawerTab === 'Notes' && (
                        <div className="flex flex-col h-full animate-in fade-in">
                           <div className="flex-1 space-y-4 mb-4">
                              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-sm border border-slate-200 dark:border-slate-700">
                                 <div className="font-bold mb-1 text-blue-600">Alex (HR)</div>
                                 <p className="text-slate-700 dark:text-slate-300">Great phone screen. Moving them to hiring manager review.</p>
                                 <div className="text-xs text-slate-400 mt-2">Sep 15, 2:30 PM</div>
                              </div>
                           </div>
                           <div className="relative">
                              <textarea placeholder="Write a note... @mention to tag" className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-3 text-sm min-h-[100px] outline-none focus:border-blue-500" />
                              <button className="absolute bottom-3 right-3 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow">Save</button>
                           </div>
                        </div>
                     )}

                     {drawerTab === 'Emails' && (
                        <div className="text-center text-slate-500 py-12 flex flex-col items-center animate-in fade-in">
                           <Mail className="opacity-20 w-16 h-16 mb-4" />
                           <p>No emails logged via platform yet.</p>
                        </div>
                     )}

                     {drawerTab === 'Activity' && (
                        <div className="space-y-6 pt-2 animate-in fade-in">
                           <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 pb-6">
                              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900" />
                              <div className="text-sm font-bold text-slate-900 dark:text-white">Moved to {selectedCandidate.stage}</div>
                              <div className="text-xs text-slate-500 mt-1">by Automation • 2 days ago</div>
                           </div>
                           <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 pb-6">
                              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900" />
                              <div className="text-sm font-bold text-slate-900 dark:text-white">Completed Take-Home Test</div>
                              <div className="text-xs text-slate-500 mt-1">System Action • 5 days ago</div>
                           </div>
                           <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800">
                              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900" />
                              <div className="text-sm font-bold text-slate-900 dark:text-white">Applied via {selectedCandidate.source}</div>
                              <div className="text-xs text-slate-500 mt-1">on {formatDate(selectedCandidate.appliedDate)}</div>
                           </div>
                        </div>
                     )}

                     {drawerTab === 'Background' && (() => {
                        const banTheBoxJurisdiction = getBanTheBoxJurisdiction(job.location);
                        const isEarlyStage = selectedCandidate.stage !== 'Offer' && selectedCandidate.stage !== 'Hired';
                        const isBanTheBoxRestricted = !!banTheBoxJurisdiction && isEarlyStage;
                        const status = bgStatuses[selectedCandidate.id] || 'Not Started';
                        const isNyc = banTheBoxJurisdiction === 'New York';

                        const initiateBgCheck = () => {
                           setBgStatuses({...bgStatuses, [selectedCandidate.id]: 'Pending'});
                           setTimeout(() => {
                              // We simulate an adverse event for NYC to demo Fair Chance Act
                              setBgStatuses(prev => ({...prev, [selectedCandidate.id]: isNyc ? 'Adverse' : 'Clear'}));
                           }, 2000);
                        };

                        return (
                           <div className="flex flex-col gap-6 animate-in fade-in h-full">
                              {/* Background check content */}
                              {status === 'Not Started' && (
                                 <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                                    <ShieldAlert size={48} className="text-slate-400 mb-4" />
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">No Background Check on File</h4>
                                    <p className="text-sm text-slate-500 mb-6">Initiate a standardized criminal and employment history check via Checkr.</p>
                                    
                                    <div className="relative group flex flex-col items-center cursor-pointer">
                                       <button 
                                          onClick={initiateBgCheck}
                                          disabled={isBanTheBoxRestricted}
                                          className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${
                                             isBanTheBoxRestricted 
                                                ? 'bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400' 
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                          }`}
                                       >
                                          Initiate Background Check
                                       </button>
                                       {isBanTheBoxRestricted && (
                                          <div className="absolute bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl text-center z-10 animate-in fade-in">
                                             Background checks in {banTheBoxJurisdiction} can only be initiated after a conditional offer (Offer Stage or later).
                                             <div className="absolute top-full left-1/2 -mt-1 -ml-1 border-4 border-transparent border-t-slate-900"></div>
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              )}

                              {status === 'Pending' && (
                                 <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                                    <h4 className="font-bold text-blue-900 dark:text-blue-400 mb-2">Check in Progress...</h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">Awaiting results from Checkr.</p>
                                 </div>
                              )}

                              {status === 'Clear' && (
                                 <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800 flex flex-col items-center text-center">
                                    <ShieldCheck size={48} className="text-green-500 mb-4" />
                                    <h4 className="font-bold text-green-900 dark:text-green-400 mb-2">Background Check Cleared</h4>
                                    <p className="text-sm text-green-700 dark:text-green-300 mb-4">No adverse records found. Candidate is cleared for hire.</p>
                                    <button className="text-green-700 dark:text-green-400 text-sm font-bold hover:underline">View Full Report</button>
                                 </div>
                              )}

                              {status === 'Adverse' && (
                                 <div className="flex flex-col gap-4">
                                    <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800 flex flex-col items-center text-center">
                                       <AlertTriangle size={48} className="text-red-500 mb-4" />
                                       <h4 className="font-bold text-red-900 dark:text-red-400 mb-2">Adverse Results Found</h4>
                                       <p className="text-sm text-red-700 dark:text-red-300 mb-4">Records require manual review before proceeding with hire.</p>
                                       <button className="text-red-700 dark:text-red-400 text-sm font-bold hover:underline">View Full Report</button>
                                    </div>
                                    
                                    {isNyc && !nycChecklists[selectedCandidate.id] && (
                                       <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl p-5 mt-2 shadow-sm">
                                          <div className="flex gap-3 mb-4 text-amber-900 dark:text-amber-400">
                                             <AlertTriangle size={24} className="shrink-0" />
                                             <div>
                                                <h4 className="font-bold">NYC Fair Chance Act Compliance</h4>
                                                <p className="text-sm mt-1 text-amber-800 dark:text-amber-500">Before you can rescind the offer or take adverse action based on these results, you <b>must</b> complete an Individualized Assessment.</p>
                                             </div>
                                          </div>
                                          
                                          <div className="space-y-3 bg-white dark:bg-slate-900/50 p-4 rounded-lg border border-amber-200 dark:border-amber-800/50">
                                             <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Assessment Checklist</h5>
                                             {[
                                                'Nature and gravity of the offense was evaluated',
                                                'Time elapsed since the offense was reviewed',
                                                'Nature of this specific job role was considered',
                                                'Evidence of rehabilitation / good conduct was requested'
                                             ].map((item, idx) => (
                                                <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                                                   <input type="checkbox" className="mt-1 w-4 h-4 rounded text-amber-600 border-amber-300 focus:ring-amber-500" />
                                                   <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item}</span>
                                                </label>
                                             ))}
                                          </div>
                                          
                                          <div className="mt-4">
                                             <button 
                                                onClick={() => setNycChecklists({...nycChecklists, [selectedCandidate.id]: true})}
                                                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm">
                                                Mark Assessment Complete
                                             </button>
                                          </div>
                                       </div>
                                    )}

                                    {isNyc && nycChecklists[selectedCandidate.id] && (
                                       <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-center">
                                          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3"><ShieldCheck size={24}/></div>
                                          <h4 className="font-bold text-slate-900 dark:text-white">NYC Assessment Completed</h4>
                                          <p className="text-sm text-slate-500 mt-1">You may now share the Fair Chance Notice and wait 5 days before rescinding the offer.</p>
                                       </div>
                                    )}
                                 </div>
                              )}
                           </div>
                        );
                     })()}
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>

    </div>
  );
}
