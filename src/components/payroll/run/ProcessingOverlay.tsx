"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { usePayrollRunStore, type ProcessingStep } from "@/store/usePayrollRunStore";

const STEPS: { key: ProcessingStep; label: string; icon: string }[] = [
  { key: "calculating", label: "Calculating taxes…", icon: "🧮" },
  { key: "submitting_ach", label: "Submitting ACH transfers…", icon: "🏦" },
  { key: "generating_stubs", label: "Generating pay stubs…", icon: "📄" },
  { key: "notifying", label: "Notifying employees…", icon: "📧" },
  { key: "complete", label: "Complete!", icon: "🎉" },
];

export default function ProcessingOverlay() {
  const { showProcessing, processingStep, setProcessingStep, setShowProcessing, setRunState } =
    usePayrollRunStore();

  useEffect(() => {
    if (!showProcessing) return;

    const stepOrder: ProcessingStep[] = [
      "calculating",
      "submitting_ach",
      "generating_stubs",
      "notifying",
      "complete",
    ];

    let idx = 0;
    setProcessingStep(stepOrder[0]);

    const interval = setInterval(() => {
      idx++;
      if (idx < stepOrder.length) {
        setProcessingStep(stepOrder[idx]);
      }
      if (idx >= stepOrder.length - 1) {
        clearInterval(interval);
        setTimeout(() => {
          setRunState("complete");
          setShowProcessing(false);
        }, 2000);
      }
    }, 2200);

    return () => clearInterval(interval);
  }, [showProcessing, setProcessingStep, setShowProcessing, setRunState]);

  const currentIdx = STEPS.findIndex((s) => s.key === processingStep);
  const progress = ((currentIdx + 1) / STEPS.length) * 100;

  return (
    <AnimatePresence>
      {showProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-lg mx-4 text-center"
          >
            {/* Animated Icon */}
            <motion.div
              animate={{ rotate: processingStep === "complete" ? 0 : 360 }}
              transition={{
                repeat: processingStep === "complete" ? 0 : Infinity,
                duration: 2,
                ease: "linear",
              }}
              className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_60px_rgba(59,130,246,0.4)]"
            >
              {processingStep === "complete" ? (
                <CheckCircle2 size={48} className="text-white" />
              ) : (
                <Loader2 size={48} className="text-white" />
              )}
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl font-extrabold text-white mb-2">
              {processingStep === "complete"
                ? "Payroll Complete!"
                : "Processing Payroll…"}
            </h2>
            <p className="text-slate-400 text-sm mb-10">
              {processingStep === "complete"
                ? "All employees have been paid successfully."
                : "Please don't close this window."}
            </p>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-700 rounded-full mb-8 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-3 text-left max-w-sm mx-auto">
              {STEPS.map((step, idx) => {
                const isComplete = idx < currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: idx <= currentIdx ? 1 : 0.3,
                      x: 0,
                    }}
                    transition={{ delay: idx * 0.1, duration: 0.3 }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                      isCurrent
                        ? "bg-blue-500/10 border border-blue-500/30"
                        : isComplete
                        ? "bg-emerald-500/5"
                        : ""
                    }`}
                  >
                    <span className="text-lg">{step.icon}</span>
                    <span
                      className={`text-sm font-semibold flex-1 ${
                        isComplete
                          ? "text-emerald-400 line-through"
                          : isCurrent
                          ? "text-white"
                          : "text-slate-500"
                      }`}
                    >
                      {step.label}
                    </span>
                    {isComplete && (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    )}
                    {isCurrent && step.key !== "complete" && (
                      <Loader2
                        size={16}
                        className="text-blue-400 animate-spin"
                      />
                    )}
                    {isCurrent && step.key === "complete" && (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
