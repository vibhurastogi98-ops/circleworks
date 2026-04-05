"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, BookOpen, GripVertical, Send, Clock, CheckCircle2,
  Plus, History, FileText, Edit3, Eye, ChevronRight, Globe
} from "lucide-react";
import { handbookSections, handbookVersions } from "@/data/mockCompliance";

export default function HandbookPage() {
  const [sections, setSections] = useState(handbookSections);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const currentVersion = handbookVersions[0];
  const totalWords = sections.reduce((s, sec) => s + sec.wordCount, 0);
  const stateSpecificCount = sections.filter((s) => s.stateSpecific.length > 0).length;
  const signedPct = Math.round((currentVersion.signedCount / currentVersion.totalEmployees) * 100);
  const pendingSigs = currentVersion.totalEmployees - currentVersion.signedCount;

  // Drag reorder (simple swap for demo)
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const handleDragStart = (idx: number) => {
    setDragIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const newSections = [...sections];
    const [removed] = newSections.splice(dragIdx, 1);
    newSections.splice(idx, 0, removed);
    setSections(newSections.map((s, i) => ({ ...s, order: i + 1 })));
    setDragIdx(idx);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/compliance/dashboard" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={18} className="text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen size={22} className="text-blue-600" />
              Employee Handbook
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Build, manage, and distribute your company handbook.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowVersionHistory(true)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
          >
            <History size={16} /> Version History
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Send size={16} /> Send for E-Sign
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-1">Current Version</h4>
          <div className="text-2xl font-black text-slate-900 dark:text-white">v{currentVersion.version}</div>
          <p className="text-xs text-slate-500 mt-1">
            Published {new Date(currentVersion.publishedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-1">Sections</h4>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{sections.length}</div>
          <p className="text-xs text-slate-500 mt-1">{totalWords.toLocaleString()} total words</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-1">E-Signatures</h4>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{signedPct}%</span>
            <span className="text-sm text-slate-500">{currentVersion.signedCount}/{currentVersion.totalEmployees}</span>
          </div>
          {pendingSigs > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">{pendingSigs} pending</p>
          )}
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-1">State-Specific Policies</h4>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{stateSpecificCount}</div>
          <p className="text-xs text-slate-500 mt-1">Auto-included by work state</p>
        </div>
      </div>

      {/* Sections List with Drag-Reorder */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Handbook Sections</h3>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
            <Plus size={14} /> Add Section
          </button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {sections.map((section, idx) => (
            <div
              key={section.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-move ${
                dragIdx === idx ? "opacity-50 bg-blue-50 dark:bg-blue-950/20" : ""
              } ${selectedSection === section.id ? "bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500" : ""}`}
              onClick={() => setSelectedSection(selectedSection === section.id ? null : section.id)}
            >
              <GripVertical size={16} className="text-slate-400 flex-shrink-0 cursor-grab" />
              <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                {section.order}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{section.title}</h4>
                  {section.stateSpecific.length > 0 && (
                    <div className="flex items-center gap-1">
                      {section.stateSpecific.map((state) => (
                        <span key={state} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                          {state}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {section.wordCount.toLocaleString()} words · Modified {new Date(section.lastModified).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <Eye size={14} />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600">
                  <Edit3 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inline Editor Preview */}
      {selectedSection && (() => {
        const sec = sections.find((s) => s.id === selectedSection);
        if (!sec) return null;
        return (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 size={16} className="text-blue-600" />
                Editing: {sec.title}
              </h3>
              {sec.stateSpecific.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Globe size={12} className="text-purple-500" />
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    State-specific: {sec.stateSpecific.join(", ")}
                  </span>
                </div>
              )}
            </div>
            <div className="p-6">
              <div
                contentEditable
                suppressContentEditableWarning
                className="min-h-[200px] p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 prose dark:prose-invert max-w-none"
              >
                {sec.content}
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => setSelectedSection(null)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowVersionHistory(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History size={18} className="text-slate-500" /> Version History
              </h3>
            </div>
            <div className="p-6 flex flex-col gap-4 max-h-[400px] overflow-y-auto">
              {handbookVersions.map((ver, i) => (
                <div
                  key={ver.version}
                  className={`border rounded-xl p-4 ${
                    i === 0
                      ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-900 dark:text-white">v{ver.version}</span>
                      {i === 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 uppercase tracking-wider">
                          Current
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(ver.publishedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{ver.changeNotes}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>By: {ver.publishedBy}</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={10} className="text-green-500" />
                      {ver.signedCount}/{ver.totalEmployees} signed
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button onClick={() => setShowVersionHistory(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
