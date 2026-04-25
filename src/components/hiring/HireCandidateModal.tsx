"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, CheckCircle2, User, Mail, Phone, Calendar, Briefcase, DollarSign, Loader2, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface HireCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  offer: {
    id: string;
    salary: number;
    startDate: string;
    title: string;
    departmentId?: string;
    locationId?: string;
    employmentType?: string;
  };
}

export function HireCandidateModal({ isOpen, onClose, candidate, offer }: HireCandidateModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Editable Fields
  const [firstName, setFirstName] = useState(candidate.firstName || "");
  const [lastName, setLastName] = useState(candidate.lastName || "");
  const [email, setEmail] = useState(candidate.email || "");
  const [phone, setPhone] = useState(candidate.phone || "");
  const [startDate, setStartDate] = useState(offer.startDate || "");

  const [showEditor, setShowEditor] = useState(false);

  // Validation
  const hasName = !!firstName && !!lastName;
  const hasEmail = !!email;
  const hasPhone = !!phone;
  const hasStartDate = !!startDate;

  const isBlocked = !hasName || !hasEmail;

  const handleHire = async (ignoreDuplicate = false) => {
    setIsSubmitting(true);
    setErrorStatus(null);

    try {
      const response = await fetch("/api/hiring/hire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          candidateId: candidate.id, 
          offerId: offer.id,
          ignoreDuplicate,
          overrides: {
            firstName,
            lastName,
            email,
            phone,
            startDate
          }
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        setErrorStatus("CONFLICT");
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to hire candidate");
      }

      toast.success(data.message || `Employee created and pre-boarding invitation sent to ${email}`);
      onClose();
      router.push("/onboarding");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="text-blue-600" size={20} />
            Hire Candidate: {firstName} {lastName}
          </DialogTitle>
          <DialogDescription>
            Confirm final details and complete the pre-flight checklist before creating the employee record.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 my-4">
          {/* Pre-flight Checklist */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Pre-flight Checklist</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-[10px] gap-1 px-2"
                onClick={() => setShowEditor(!showEditor)}
              >
                <Edit3 size={12} />
                {showEditor ? "Done Editing" : "Update Details"}
              </Button>
            </div>

            {showEditor ? (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">First Name</label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Last Name</label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-8 text-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Personal Email</label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Phone</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Start Date</label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-8 text-sm" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={14} className={hasName ? "text-green-500" : "text-red-500"} />
                    <span className={hasName ? "text-slate-700 dark:text-slate-300" : "text-red-600 font-medium"}>Full Name Present</span>
                  </div>
                  {hasName ? <CheckCircle2 size={14} className="text-green-500" /> : <AlertTriangle size={14} className="text-red-500" />}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={14} className={hasEmail ? "text-green-500" : "text-red-500"} />
                    <span className={hasEmail ? "text-slate-700 dark:text-slate-300" : "text-red-600 font-medium"}>Personal Email Present</span>
                  </div>
                  {hasEmail ? <CheckCircle2 size={14} className="text-green-500" /> : <AlertTriangle size={14} className="text-red-500" />}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={14} className={hasPhone ? "text-green-500" : "text-amber-500"} />
                    <span className="text-slate-700 dark:text-slate-300">Personal Phone Present</span>
                  </div>
                  {!hasPhone && <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 px-1.5 py-0.5 rounded font-bold">WARN</span>}
                  {hasPhone && <CheckCircle2 size={14} className="text-green-500" />}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className={hasStartDate ? "text-green-500" : "text-amber-500"} />
                    <span className="text-slate-700 dark:text-slate-300">Start Date Confirmed</span>
                  </div>
                  {!hasStartDate && <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 px-1.5 py-0.5 rounded font-bold">WARN</span>}
                  {hasStartDate && <CheckCircle2 size={14} className="text-green-500" />}
                </div>
              </div>
            )}
          </div>

          {/* Conflict Warning */}
          {errorStatus === "CONFLICT" && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4 rounded-xl flex gap-3">
              <AlertTriangle className="text-amber-600 shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-amber-900 dark:text-amber-400">Potential Duplicate Detected</p>
                <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">An employee with the email <strong>{email}</strong> already exists. Would you like to merge or create a new record anyway?</p>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="h-8 text-xs border-amber-300 bg-white hover:bg-amber-50 text-amber-800" onClick={() => handleHire(true)}>
                    Create New Anyway
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs border-amber-300 bg-white hover:bg-amber-50 text-amber-800">
                    Merge Record
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Summary */}
          {!showEditor && (
            <div className="grid grid-cols-2 gap-4">
               <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Role</div>
                  <div className="text-sm font-semibold truncate flex items-center gap-2">
                     <Briefcase size={12} className="text-slate-400"/>
                     {offer.title}
                  </div>
               </div>
               <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Compensation</div>
                  <div className="text-sm font-semibold flex items-center gap-2 text-green-600">
                     <DollarSign size={12}/>
                     ${offer.salary?.toLocaleString()}/yr
                  </div>
               </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleHire()} 
            disabled={isSubmitting || isBlocked || errorStatus === "CONFLICT"}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Hiring...
              </>
            ) : (
              "Confirm & Move to Onboarding"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
