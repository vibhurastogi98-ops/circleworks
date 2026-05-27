"use client";

import Link from "next/link";
import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getJobById, getCandidatesByJob, STAGES, CandidateStage, AtsCandidate, addCandidate, updateCandidateStage } from "@/data/mockAts";
import { Link as LinkIcon, Plus, Edit, Pause, Play, X, Star, Hand, User, FileText, CheckCircle, Clock, Mail, Activity, MessageSquare, ShieldAlert, ShieldCheck, AlertTriangle, Briefcase, GripVertical, ExternalLink, Search, UserPlus, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { canInitiateBackgroundCheck } from "@/utils/compliance";
import { validatePayTransparencyPosting } from "@/utils/payTransparency";
import { formatDate } from "@/utils/formatDate";
import { toast } from "sonner";
import { useSocketStore } from "@/store/useSocketStore";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// --- DND KIT COMPONENTS ---

function SortableCandidateCard({ candidate, onClick }: { candidate: AtsCandidate, onClick: (c: AtsCandidate) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} onClick={(e) => { e.stopPropagation(); onClick(candidate); }}>
      <CandidateCard candidate={candidate} dragAttributes={attributes} dragListeners={listeners} />
    </div>
  );
}

function hashName(name: string) {
  return name.split("").reduce((hash, char) => hash + char.charCodeAt(0), 0);
}

const avatarColors = ["bg-blue-500", "bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-cyan-500", "bg-rose-500"];

function SourceIcon({ source }: { source: string }) {
  const normalized = source.toLowerCase();
  if (normalized.includes("linkedin")) return <LinkIcon size={12} className="text-[#0A66C2]" />;
  if (normalized.includes("indeed")) return <Search size={12} className="text-blue-500" />;
  if (normalized.includes("referral")) return <UserPlus size={12} className="text-emerald-500" />;
  return <Send size={12} className="text-slate-400" />;
}

function CandidateCard({ candidate, dragAttributes, dragListeners }: { candidate: AtsCandidate; dragAttributes?: any; dragListeners?: any }) {
  const initials = candidate.firstName.charAt(0) + candidate.lastName.charAt(0);
  const avatarColor = avatarColors[hashName(`${candidate.firstName} ${candidate.lastName}`) % avatarColors.length];

  const getScoreColor = (score: number) => {
     if (score >= 80) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
     if (score >= 60) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
     return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col gap-3 group relative">
      <button
        type="button"
        {...dragAttributes}
        {...dragListeners}
        className="absolute top-2 right-2 cursor-grab rounded p-1 text-slate-300 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing group-hover:opacity-100 dark:text-slate-600 dark:hover:bg-slate-700"
        aria-label={`Drag ${candidate.firstName} ${candidate.lastName}`}
      >
        <GripVertical size={15} />
      </button>

      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full ${avatarColor} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <h4 className="font-bold text-slate-900 dark:text-white truncate">{candidate.firstName} {candidate.lastName}</h4>
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
             <SourceIcon source={candidate.source} />
             <span className="truncate">{candidate.source}</span>
             <span>•</span>
             <span>Applied {formatDate(candidate.appliedDate)}</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-slate-100 dark:border-slate-700/50">
         &ldquo;{candidate.resumeSnippet || "Experienced candidate with relevant background and strong interest in the role."}&rdquo;
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
            )) : null}
            <div className="ml-2 text-[10px] font-semibold text-slate-400">{candidate.daysInStage}d here</div>
         </div>
      </div>
    </div>
  );
}

function StageColumn({ stage, candidates, onCandidateClick }: { stage: (typeof STAGES)[number]; candidates: AtsCandidate[]; onCandidateClick: (candidate: AtsCandidate) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div className={`flex flex-col w-[300px] shrink-0 border rounded-xl overflow-hidden h-full transition-colors ${isOver ? "bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-800" : "bg-slate-100/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"}`}>
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${stage.color}`} />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">{stage.title}</h3>
        </div>
        <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm">
          {candidates.length}
        </span>
      </div>

      <div ref={setNodeRef} className="p-3 flex-1 overflow-y-auto space-y-3">
        <SortableContext items={candidates.map(c => c.id)} strategy={horizontalListSortingStrategy}>
          {candidates.map(candidate => (
            <SortableCandidateCard key={candidate.id} candidate={candidate} onClick={onCandidateClick} />
          ))}
        </SortableContext>
        {candidates.length === 0 && (
          <div className={`h-24 border-2 border-dashed rounded-xl flex items-center justify-center text-xs font-medium transition-colors ${isOver ? "border-blue-300 text-blue-500" : "border-slate-300 dark:border-slate-700 text-slate-400"}`}>
            Drop candidates here
          </div>
        )}
      </div>
    </div>
  );
}

// --- MAIN PAGE ---

export default function KanbanBoard() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { on: onSocketEvent, off: offSocketEvent } = useSocketStore();
  const initialJob = useMemo(() => getJobById(id as string), [id]);
  const initialCandidates = useMemo(() => getCandidatesByJob(id as string), [id]);

  const [job, setJob] = useState(initialJob);
  const [candidates, setCandidates] = useState(initialCandidates);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Drawer State
  const [selectedCandidate, setSelectedCandidate] = useState<AtsCandidate | null>(null);
  const [drawerTab, setDrawerTab] = useState<'Overview'|'Resume'|'Scorecard'|'Notes'|'Emails'|'Activity'|'Background'>('Overview');
  
  // Background Check State
  const [bgStatuses, setBgStatuses] = useState<Record<string, 'Not Started' | 'Pending' | 'Clear' | 'Adverse'>>({});
  const [nycChecklists, setNycChecklists] = useState<Record<string, boolean>>({});

  // Add Candidate Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ firstName: "", lastName: "", email: "", source: "Manual" });
  const [pendingMove, setPendingMove] = useState<{ candidate: AtsCandidate; newStage: CandidateStage; previousStage: CandidateStage } | null>(null);
  const [disqualificationReason, setDisqualificationReason] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor));

  const stageMutation = useMutation({
    mutationFn: async ({ candidateId, newStage }: { candidateId: string; newStage: CandidateStage }) => {
      const response = await fetch(`/api/ats/candidates/${candidateId}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStage }),
      });

      if (!response.ok) {
        throw new Error("Unable to update candidate stage");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      updateCandidateStage(variables.candidateId, variables.newStage);
      queryClient.invalidateQueries({ queryKey: ["ats", "job", id] });
    },
  });

  useEffect(() => {
    const eventName = `ats.candidate.${id}.moved`;
    const handleCandidateMoved = (payload: { candidateId: string; newStage: CandidateStage; movedBy?: string }) => {
      setCandidates(prev => prev.map(candidate =>
        candidate.id === payload.candidateId ? { ...candidate, stage: payload.newStage, daysInStage: 0 } : candidate,
      ));
      toast.info("Pipeline updated", {
        description: `${payload.movedBy || "A teammate"} moved a candidate to ${STAGES.find(stage => stage.id === payload.newStage)?.title || payload.newStage}.`,
      });
    };

    onSocketEvent(eventName, handleCandidateMoved);
    return () => offSocketEvent(eventName, handleCandidateMoved);
  }, [id, offSocketEvent, onSocketEvent]);

  useEffect(() => {
    if (!selectedCandidate) return;
    const updated = candidates.find(candidate => candidate.id === selectedCandidate.id);
    if (updated) setSelectedCandidate(updated);
  }, [candidates, selectedCandidate]);

  const persistStageMove = async (candidate: AtsCandidate, newStage: CandidateStage, previousStage: CandidateStage) => {
    try {
      await stageMutation.mutateAsync({ candidateId: candidate.id, newStage });
      toast.success("Stage updated", {
        description: `${candidate.firstName} moved to ${STAGES.find(stage => stage.id === newStage)?.title}.`,
      });
    } catch {
      setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, stage: previousStage } : c));
      toast.error("Stage update failed", {
        description: `${candidate.firstName} was moved back to ${STAGES.find(stage => stage.id === previousStage)?.title}.`,
      });
    }
  };

  const moveCandidate = (candidate: AtsCandidate, newStage: CandidateStage) => {
    const previousStage = candidate.stage;
    setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, stage: newStage, daysInStage: 0 } : c));

    if (newStage === "Withdrawn" || newStage === "Hired") {
      setPendingMove({ candidate, newStage, previousStage });
      setDisqualificationReason("");
      return;
    }

    void persistStageMove(candidate, newStage, previousStage);
  };

  const cancelPendingMove = () => {
    if (pendingMove) {
      setCandidates(prev => prev.map(c => c.id === pendingMove.candidate.id ? { ...c, stage: pendingMove.previousStage } : c));
    }
    setPendingMove(null);
    setDisqualificationReason("");
  };

  const confirmPendingMove = () => {
    if (!pendingMove) return;
    if (pendingMove.newStage === "Withdrawn" && !disqualificationReason.trim()) {
      toast.error("Disqualification reason is required");
      return;
    }

    if (pendingMove.newStage === "Hired") {
      toast.success("Onboarding flow queued", {
        description: `${pendingMove.candidate.firstName} will be converted into a new hire profile.`,
      });
    }

    void persistStageMove(pendingMove.candidate, pendingMove.newStage, pendingMove.previousStage);
    setPendingMove(null);
    setDisqualificationReason("");
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const candidateId = String(active.id);
    const overId = String(over.id);

    const candidate = candidates.find(c => c.id === candidateId);
    const targetStage = STAGES.find(s => s.id === overId)?.id || candidates.find(c => c.id === overId)?.stage;

    if (candidate && targetStage && targetStage !== candidate.stage) {
       moveCandidate(candidate, targetStage as CandidateStage);
    }
  };

  const handleCopyJobLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Internal link copied!");
  };

  const handleTogglePause = () => {
    if (!job) return;
    const newStatus = job.status === 'Paused' ? 'Active' : 'Paused';
    setJob({ ...job, status: newStatus as any });
    toast.success(newStatus === 'Paused' ? "Job paused" : "Job reactivated");
  };

  const handleAddCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !newCandidate.firstName || !newCandidate.lastName || !newCandidate.email) {
       toast.error("Please fill all required fields");
       return;
    }
    const created = addCandidate({
       jobId: job.id,
       firstName: newCandidate.firstName,
       lastName: newCandidate.lastName,
       email: newCandidate.email,
       source: newCandidate.source,
       stage: "New",
       reviewers: []
    });
    setCandidates([created, ...candidates]);
    setShowAddModal(false);
    setNewCandidate({ firstName: "", lastName: "", email: "", source: "Manual" });
    toast.success("Candidate added successfully!");
  };

  const currentActiveCandidate = useMemo(() => candidates.find(c => c.id === activeId), [activeId, candidates]);

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Briefcase className="text-slate-400" size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Job Post Not Found</h2>
        <p className="text-slate-500 max-w-xs mb-6">The job posting you are looking for might have been deleted or the link is incorrect.</p>
        <Link href="/hiring/jobs" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">
          Back to Jobs
        </Link>
      </div>
    );
  }

  if (!isMounted) return null;
  const payTransparency = validatePayTransparencyPosting({
    location: job.location,
    department: job.department,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
  });

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
            {payTransparency.required && (
               <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300">
                  <ShieldCheck size={14} />
                  Public posting pay range: ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
               </div>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm font-medium">
               <div className="text-slate-700 dark:text-slate-300"><span className="text-blue-600 dark:text-blue-400">{candidates.length}</span> Total Applicants</div>
               <div className="text-slate-700 dark:text-slate-300"><span className="text-indigo-600 dark:text-indigo-400">{candidates.filter(c=>c.stage==='Screening').length}</span> Screening</div>
               <div className="text-slate-700 dark:text-slate-300"><span className="text-amber-600 dark:text-amber-400">{candidates.filter(c=>c.stage==='Onsite').length}</span> Interviewing</div>
               <div className="text-slate-700 dark:text-slate-300"><span className="text-green-600 dark:text-green-400">{candidates.filter(c=>c.stage==='Offer').length}</span> Offers Out</div>
               <div className="text-slate-500 border-l border-slate-300 dark:border-slate-700 pl-4">{job.daysOpen} Days Open</div>
            </div>
         </div>

         <div className="flex flex-wrap items-center gap-2">
            <Link href={`/hiring/jobs/${job?.id}/edit`} className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-semibold" title="Edit Job">
               <Edit size={16} /> Edit Job
            </Link>
            <button 
              onClick={handleTogglePause}
              className={`flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm transition-colors text-sm font-semibold ${job?.status === 'Paused' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`} 
              title={job?.status === 'Paused' ? "Resume Post" : "Pause Post"}
            >
              {job?.status === 'Paused' ? <Play size={16} /> : <Pause size={16} />}
              {job?.status === 'Paused' ? "Resume Posting" : "Pause Posting"}
            </button>
            <button onClick={handleCopyJobLink} className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-semibold" title="Copy Link"><LinkIcon size={16} /> Share Job Link</button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
               <Plus size={16} /> Add Candidate
            </button>
         </div>
      </div>

      {/* KANBAN BOARD */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
         <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 h-full" style={{ minWidth: `${STAGES.length * 300}px` }}>
               
               {STAGES.map(stage => (
                  <StageColumn
                    key={stage.id}
                    stage={stage}
                    candidates={candidates.filter(c => c.stage === stage.id)}
                    onCandidateClick={setSelectedCandidate}
                  />
               ))}

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
                     {['Overview', 'Resume', 'Scorecard', 'Notes', 'Emails', 'Activity', 'Background'].map(tab => (
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
                                 <span className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Phone</span>
                                 <div className="text-sm text-slate-900 dark:text-white font-medium">{selectedCandidate.phone || "+1 (555) 123-4567"}</div>
                              </div>
                              <div>
                                 <span className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Source</span>
                                 <div className="text-sm text-slate-900 dark:text-white font-medium flex items-center gap-1"><SourceIcon source={selectedCandidate.source} /> {selectedCandidate.source}</div>
                              </div>
                              <div>
                                 <span className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Applied Date</span>
                                 <div className="text-sm text-slate-900 dark:text-white font-medium">{formatDate(selectedCandidate.appliedDate)}</div>
                              </div>
                              <div>
                                 <span className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Current Stage</span>
                                 <div className="text-sm text-slate-900 dark:text-white font-medium">{STAGES.find(stage => stage.id === selectedCandidate.stage)?.title || selectedCandidate.stage}</div>
                              </div>
                              <div>
                                 <span className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">AI Match Score</span>
                                 <div className="text-sm text-green-600 dark:text-green-400 font-black">{selectedCandidate.aiScore}%</div>
                              </div>
                           </div>

                           <a
                              href={selectedCandidate.linkedinUrl || "https://linkedin.com"}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800"
                           >
                              LinkedIn profile <ExternalLink size={14} />
                           </a>

                           <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-blue-50 dark:bg-blue-900/10">
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><FileText size={16}/> Resume Preview Extract</h3>
                              <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                                 &ldquo;{selectedCandidate.resumeSnippet || "Passionate candidate with relevant experience and a strong match for this role."}&rdquo;
                              </p>
                              <button onClick={() => setDrawerTab("Resume")} className="mt-4 text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">View Full PDF Resume &rarr;</button>
                           </div>
                        </div>
                     )}

                     {drawerTab === 'Resume' && (
                        <div className="flex flex-col gap-4 animate-in fade-in">
                           <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
                              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3">
                                 <div className="text-sm font-bold text-slate-900 dark:text-white">Resume PDF</div>
                                 <button className="text-xs font-bold text-blue-600 hover:underline">Download</button>
                              </div>
                              <div className="h-[560px] bg-slate-100 dark:bg-slate-800 p-5">
                                 <div className="mx-auto h-full max-w-[360px] rounded bg-white p-6 shadow-sm">
                                    <div className="h-5 w-40 rounded bg-slate-900" />
                                    <div className="mt-2 h-3 w-56 rounded bg-slate-200" />
                                    <div className="mt-8 space-y-3">
                                       {[80, 100, 92, 70, 96, 88, 74, 100, 65, 90].map((width, index) => (
                                          <div key={index} className="h-2 rounded bg-slate-200" style={{ width: `${width}%` }} />
                                       ))}
                                    </div>
                                    <div className="mt-8 rounded-lg border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-slate-600">
                                       Inline react-pdf viewer placeholder. Connect a candidate resume URL to render the PDF page here.
                                    </div>
                                 </div>
                              </div>
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
                        const backgroundGuard = canInitiateBackgroundCheck(job.location, selectedCandidate.stage);
                        const isBanTheBoxRestricted = !backgroundGuard.allowed;
                        const status = bgStatuses[selectedCandidate.id] || 'Not Started';
                        const isNyc = backgroundGuard.jurisdiction?.fairChanceAssessment === 'nyc';

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
                                             {backgroundGuard.reason} (Offer Extended or later).
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
                                                <p className="text-sm mt-1 text-amber-800 dark:text-amber-500">Before you can rescind the offer or take adverse action based on these NYC results, you <b>must</b> complete an individualized assessment.</p>
                                             </div>
                                          </div>
                                          
                                          <div className="space-y-3 bg-white dark:bg-slate-900/50 p-4 rounded-lg border border-amber-200 dark:border-amber-800/50">
                                             <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Assessment Checklist</h5>
                                             {[
                                                'Nature of crime was evaluated',
                                                'Time elapsed since the offense was reviewed',
                                                'Nature of the job was considered',
                                                'Evidence of rehabilitation was requested'
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

      {/* Add Candidate Modal */}
      <AnimatePresence>
         {showAddModal && (
            <>
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowAddModal(false)}
                  className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
               />
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-[101] overflow-hidden"
               >
                  <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Manually</h2>
                     <button onClick={() => setShowAddModal(false)} className="p-2 -mr-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} />
                     </button>
                  </div>
                  
                  <form onSubmit={handleAddCandidateSubmit} className="p-6">
                     <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                              <input 
                                 type="text" 
                                 required
                                 value={newCandidate.firstName}
                                 onChange={e=>setNewCandidate({...newCandidate, firstName: e.target.value})}
                                 className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:border-blue-500" 
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
                              <input 
                                 type="text" 
                                 required
                                 value={newCandidate.lastName}
                                 onChange={e=>setNewCandidate({...newCandidate, lastName: e.target.value})}
                                 className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:border-blue-500" 
                              />
                           </div>
                        </div>
                        <div>
                           <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                           <input 
                              type="email" 
                              required
                              value={newCandidate.email}
                              onChange={e=>setNewCandidate({...newCandidate, email: e.target.value})}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:border-blue-500" 
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Source</label>
                           <select 
                              value={newCandidate.source}
                              onChange={e=>setNewCandidate({...newCandidate, source: e.target.value})}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:border-blue-500"
                           >
                              <option>Manual</option>
                              <option>Referral</option>
                              <option>LinkedIn</option>
                              <option>Agency</option>
                           </select>
                        </div>
                     </div>
                     <div className="mt-8 flex justify-end gap-3">
                        <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                           Cancel
                        </button>
                        <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
                           Create Candidate
                        </button>
                     </div>
                  </form>
               </motion.div>
            </>
         )}
      </AnimatePresence>

      <Dialog open={!!pendingMove} onOpenChange={(open) => { if (!open) cancelPendingMove(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingMove?.newStage === "Withdrawn" ? "Disqualify candidate" : "Start onboarding flow"}
            </DialogTitle>
            <DialogDescription>
              {pendingMove?.newStage === "Withdrawn"
                ? "A disqualification reason is required before moving this candidate to Withdrawn."
                : "Confirm this candidate should be marked as hired and queued for employee onboarding creation."}
            </DialogDescription>
          </DialogHeader>

          {pendingMove?.newStage === "Withdrawn" ? (
            <div className="p-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Disqualification reason *
              </label>
              <select
                value={disqualificationReason}
                onChange={(event) => setDisqualificationReason(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">Select a reason...</option>
                <option value="skills_mismatch">Skills mismatch</option>
                <option value="compensation_misalignment">Compensation misalignment</option>
                <option value="candidate_withdrew">Candidate withdrew</option>
                <option value="role_closed">Role closed</option>
              </select>
            </div>
          ) : (
            <div className="p-6">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
                CircleWorks will create the onboarding case, draft Day 1 tasks, and prepare employee profile creation for {pendingMove?.candidate.firstName} {pendingMove?.candidate.lastName}.
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={cancelPendingMove}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmPendingMove}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
            >
              Confirm
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
