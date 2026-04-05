"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlatformStore } from "@/store/usePlatformStore";
import { useSidebarStore } from "@/store/useSidebarStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Command, Keyboard } from "lucide-react";

export default function KeyboardShortcuts() {
  const router = useRouter();
  const { isAdmin, setPayrollRunning } = usePlatformStore();
  const { setSidebarOpen } = useSidebarStore();
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [gKeyPressed, setGKeyPressed] = useState(false);

  useEffect(() => {
    let gTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts inside inputs or textareas
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement || 
        (e.target as HTMLElement).isContentEditable
      ) {
        // Exception: Handle ESC to blur or close modal even inside input
        if (e.key === "Escape") {
          (e.target as HTMLElement).blur();
          setShowShortcutsModal(false);
          setSidebarOpen(false);
        }
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (e.key === "Escape") {
        setShowShortcutsModal(false);
        setSidebarOpen(false);
        // Additional ESC behavior (closing drawers) can be added here or handled by those components directly.
        return;
      }

      if (cmdOrCtrl && e.key === "k") {
        e.preventDefault();
        // Typically handled in AppTopBar.tsx, but we can emit a global event or handle here
        console.log("Global Search triggered from KeyboardShortcuts (Cmd+K)");
        return;
      }

      if (cmdOrCtrl && e.shiftKey && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        if (isAdmin) {
          setPayrollRunning(true);
        } else {
          console.warn("User is not admin, cannot run payroll via shortcut.");
        }
        return;
      }

      if (cmdOrCtrl && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        router.push("/employees/new"); // assuming an add employee route exists
        return;
      }

      if (cmdOrCtrl && e.key === "/") {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }

      // Handle 'G' sequence
      if (!cmdOrCtrl && !e.altKey && !e.shiftKey) {
        if (gKeyPressed) {
          const char = e.key.toLowerCase();
          switch (char) {
            case 'd':
              router.push("/dashboard");
              break;
            case 'p':
              router.push("/payroll/run");
              break;
            case 'e':
              router.push("/employees");
              break;
            case 'h':
              router.push("/hiring");
              break;
            case 't':
              router.push("/time");
              break;
            case 'r':
              router.push("/reports");
              break;
            default:
              break; // Unrecognized sequence
          }
          setGKeyPressed(false);
          clearTimeout(gTimeout);
          return;
        }

        if (e.key.toLowerCase() === "g") {
          setGKeyPressed(true);
          clearTimeout(gTimeout);
          gTimeout = setTimeout(() => setGKeyPressed(false), 1500); // 1.5s to press next key
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(gTimeout);
    };
  }, [isAdmin, router, setPayrollRunning, gKeyPressed]);

  return (
    <AnimatePresence>
      {showShortcutsModal && (
        <React.Fragment>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShortcutsModal(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9990]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-[9999] overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3 text-slate-800 dark:text-white">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Keyboard size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Keyboard Shortcuts</h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Work faster without leaving your keyboard</p>
                </div>
              </div>
              <button 
                onClick={() => setShowShortcutsModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-white dark:bg-slate-900">
              {/* Global Actions */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 px-2">Global Actions</h3>
                <ul className="space-y-3 px-2">
                  <li className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Open Global Search</span>
                    <kbd className="inline-flex gap-1 items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 shadow-sm">
                      <Command size={12} className="opacity-70"/> <span>K</span>
                    </kbd>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Add New Employee</span>
                    <kbd className="inline-flex gap-1 items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 shadow-sm">
                      <Command size={12} className="opacity-70"/> <span>N</span>
                    </kbd>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Open Shortcuts</span>
                    <kbd className="inline-flex gap-1 items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 shadow-sm">
                      <Command size={12} className="opacity-70"/> <span>/</span>
                    </kbd>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Run Payroll</span>
                    <div className="flex gap-1">
                      <kbd className="inline-flex gap-1 items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 shadow-sm">
                        <Command size={12} className="opacity-70"/> <span>⇧</span> <span>P</span>
                      </kbd>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Navigation (G then X) */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 px-2">Navigation</h3>
                <ul className="space-y-3 px-2">
                  <li className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Go to Dashboard</span>
                    <div className="flex gap-1">
                      <kbd className="inline-flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 shadow-sm">G</kbd>
                      <kbd className="inline-flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 shadow-sm">D</kbd>
                    </div>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Go to Payroll</span>
                    <div className="flex gap-1">
                      <kbd className="inline-flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 shadow-sm">G</kbd>
                      <kbd className="inline-flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 shadow-sm">P</kbd>
                    </div>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Go to Employees</span>
                    <div className="flex gap-1">
                      <kbd className="inline-flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 shadow-sm">G</kbd>
                      <kbd className="inline-flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 shadow-sm">E</kbd>
                    </div>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Go to Time</span>
                    <div className="flex gap-1">
                      <kbd className="inline-flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 shadow-sm">G</kbd>
                      <kbd className="inline-flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 shadow-sm">T</kbd>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
              Press <kbd className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 mx-1">ESC</kbd> to close this modal at any time.
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
