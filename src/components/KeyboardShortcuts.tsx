"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Keyboard, X } from "lucide-react";

import { usePlatformStore } from "@/store/usePlatformStore";

const SHORTCUTS = [
  ["Cmd/Ctrl + K", "Open command palette"],
  ["/", "Open global search"],
  ["G then D", "Go to Dashboard"],
  ["G then P", "Go to Payroll"],
  ["G then E", "Go to Employees"],
  ["G then H", "Go to Hiring"],
  ["?", "Open shortcuts reference"],
  ["Escape", "Close open modal or drawer"],
];

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

export default function KeyboardShortcuts() {
  const router = useRouter();
  const { isCommandPaletteOpen, setCommandPaletteOpen, closeTransientUi } = usePlatformStore();
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const waitingForGRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const clearGSequence = () => {
      waitingForGRef.current = false;
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const navigateFromGSequence = (key: string) => {
      const routes: Record<string, string> = {
        d: "/dashboard",
        p: "/payroll",
        e: "/employees",
        h: "/hiring",
      };

      const href = routes[key.toLowerCase()];
      if (href) router.push(href);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isCommandPaletteOpen) return;
        setShowShortcutsModal(false);
        closeTransientUi();
        window.dispatchEvent(new CustomEvent("circleworks:escape"));
        return;
      }

      if (isTypingTarget(event.target)) return;

      const cmdOrCtrl = event.metaKey || event.ctrlKey;

      if (cmdOrCtrl && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      if (!cmdOrCtrl && !event.altKey && event.key === "/") {
        event.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      if (!cmdOrCtrl && !event.altKey && event.key === "?") {
        event.preventDefault();
        setShowShortcutsModal(true);
        return;
      }

      if (!cmdOrCtrl && !event.altKey) {
        if (waitingForGRef.current) {
          event.preventDefault();
          navigateFromGSequence(event.key);
          clearGSequence();
          return;
        }

        if (event.key.toLowerCase() === "g") {
          waitingForGRef.current = true;
          timeoutRef.current = window.setTimeout(clearGSequence, 1500);
        }
      }
    };

    const handleShowShortcuts = () => setShowShortcutsModal(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("circleworks:show-shortcuts", handleShowShortcuts);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("circleworks:show-shortcuts", handleShowShortcuts);
      clearGSequence();
    };
  }, [closeTransientUi, isCommandPaletteOpen, router, setCommandPaletteOpen]);

  return (
    <AnimatePresence>
      {showShortcutsModal && (
        <>
          <motion.button
            type="button"
            aria-label="Close shortcuts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShortcutsModal(false)}
            className="fixed inset-0 z-[9990] bg-slate-950/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            className="fixed left-1/2 top-1/2 z-[9999] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                  <Keyboard size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Keyboard Shortcuts</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Quick navigation for the platform shell.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Close shortcuts"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <table className="w-full border-collapse text-left text-sm">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {SHORTCUTS.map(([shortcut, action]) => (
                    <tr key={shortcut}>
                      <th className="w-40 py-3 pr-4 font-semibold text-slate-900 dark:text-white">
                        <kbd className="rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                          {shortcut}
                        </kbd>
                      </th>
                      <td className="py-3 text-slate-600 dark:text-slate-300">{action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
