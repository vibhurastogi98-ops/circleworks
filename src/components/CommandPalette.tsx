"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, User, DollarSign, FileText, Settings, CreditCard, HeartPulse, ShieldAlert, PlayCircle, UserPlus, ExternalLink, File, ChevronRight, CornerDownLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePlatformStore } from "@/store/usePlatformStore";

interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  url: string;
}

// Icon Mapping
const getIcon = (name: string, className = "") => {
  const IconComponent = {
    User, DollarSign, FileText, Settings, CreditCard, HeartPulse, ShieldAlert, PlayCircle, UserPlus, ExternalLink, File
  }[name] || FileText;
  return <IconComponent className={className} size={18} />;
};

export default function CommandPalette() {
  const router = useRouter();
  const { isCommandPaletteOpen, setCommandPaletteOpen } = usePlatformStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // All flattened items available for keyboard nav
  const [flattenedItems, setFlattenedItems] = useState<any[]>([]);

  // Open/Close bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K globally
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      
      // Escape
      if (e.key === "Escape" && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; }
  }, [isCommandPaletteOpen]);

  // Debounced API Search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const debounceTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
        setSelectedIndex(0);
      } catch (err) {
        console.error("Search API failed", err);
      } finally {
        setIsLoading(false);
      }
    }, 150); // 150ms debounce

    return () => clearTimeout(debounceTimeout);
  }, [query]);

  // Handle Flattening logic to navigate via Keyboard correctly
  useEffect(() => {
    if (!query.trim()) {
      // Empty state items
      setFlattenedItems([
        { title: "Run Payroll", url: "/payroll/run" },
        { title: "Add New Employee", url: "/employees/new" },
        { title: "Open Compliance", url: "/compliance" },
        { title: "View Reports", url: "/reports" },
      ]);
    } else {
      setFlattenedItems(results);
    }
  }, [query, results]);

  // Keyboard Navigation logic
  useEffect(() => {
    if (!isCommandPaletteOpen) return;

    const navHandler = (e: KeyboardEvent) => {
      if (flattenedItems.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % flattenedItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + flattenedItems.length) % flattenedItems.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const activeItem = flattenedItems[selectedIndex];
        if (activeItem && activeItem.url) {
          setCommandPaletteOpen(false);
          router.push(activeItem.url);
        }
      }
    };

    window.addEventListener("keydown", navHandler);
    return () => window.removeEventListener("keydown", navHandler);
  }, [isCommandPaletteOpen, flattenedItems, selectedIndex, router, setCommandPaletteOpen]);


  // Group Results by Type
  const groupedResults = results.reduce((acc, curr) => {
    if (!acc[curr.type]) acc[curr.type] = [];
    acc[curr.type].push(curr);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // Grouped Keys logic ensuring consistent order
  const groupOrder = ["EMPLOYEES", "RECENT PAYROLL RUNS", "REPORTS", "PAGES", "ACTIONS", "DOCUMENTS"];
  const renderedGroups = Object.keys(groupedResults).sort((a,b) => groupOrder.indexOf(a) - groupOrder.indexOf(b));

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10dvh]">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-[640px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden m-4"
          >
            {/* Header / Input */}
            <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-4">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input 
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search employees, reports, run payroll..."
                className="flex-1 h-16 bg-transparent border-0 outline-none focus:ring-0 text-slate-900 dark:text-white text-[16px] placeholder:text-slate-400 px-4"
              />
              {isLoading && (
                <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin shrink-0 mr-2" />
              )}
              {query.length > 0 && (
                <button 
                  onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="max-h-[60dvh] overflow-y-auto w-full pb-2 no-scrollbar">
              
              {/* NO QUERY STATE */}
              {!query.trim() && (
                <div className="py-2">
                  <div className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Recent
                  </div>
                  <div className="px-2">
                    <button onClick={() => { setCommandPaletteOpen(false); router.push("/employees/john-doe"); }} className="w-full flex items-center justify-between p-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer text-left transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                           <User size={16} />
                         </div>
                         <div>
                           <p className="text-[14px] font-bold text-slate-900 dark:text-white">John Doe</p>
                           <p className="text-[12px] text-slate-500">Account Executive · Sales</p>
                         </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </button>
                    <button onClick={() => { setCommandPaletteOpen(false); router.push("/reports/headcount"); }} className="w-full flex items-center justify-between p-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer text-left transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                           <FileText size={16} />
                         </div>
                         <div>
                           <p className="text-[14px] font-bold text-slate-900 dark:text-white">Headcount Summary</p>
                           <p className="text-[12px] text-slate-500">Report · Analytics</p>
                         </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </button>
                    <button onClick={() => { setCommandPaletteOpen(false); router.push("/payroll/run/pr_1"); }} className="w-full flex items-center justify-between p-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer text-left transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                           <DollarSign size={16} />
                         </div>
                         <div>
                           <p className="text-[14px] font-bold text-slate-900 dark:text-white">Regular Payroll - Apr 1-15</p>
                           <p className="text-[12px] text-slate-500">Payroll Run · Processed</p>
                         </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </button>
                  </div>

                  <div className="px-4 pt-4 pb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Quick Actions
                  </div>
                  <div className="px-2">
                    {flattenedItems.map((action, i) => (
                      <button 
                        key={action.title}
                        onClick={() => { setCommandPaletteOpen(false); router.push(action.url); }}
                        className={`w-full flex items-center justify-between p-3 rounded-md cursor-pointer text-left transition-colors ${selectedIndex === i ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                        onMouseEnter={() => setSelectedIndex(i)}
                      >
                        <span className={`text-[14px] font-semibold ${selectedIndex === i ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {action.title}
                        </span>
                        {selectedIndex === i && <CornerDownLeft size={16} className="text-blue-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* QUERY STATE */}
              {query.trim() && renderedGroups.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                   <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                      <Search className="w-6 h-6 text-slate-400" />
                   </div>
                   <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">No results found</h3>
                   <p className="text-[13px] text-slate-500 mt-1 max-w-[80%]">We couldn't find anything matching "{query}". Try adjusting your search.</p>
                </div>
              )}

              {query.trim() && renderedGroups.map((group) => (
                <div key={group} className="py-2">
                   <div className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                     {group}
                   </div>
                   <div className="px-2">
                     {groupedResults[group].map((result) => {
                       const globalIndex = flattenedItems.findIndex(i => i.id === result.id);
                       const isSelected = selectedIndex === globalIndex;
                       
                       return (
                         <div 
                           key={result.id}
                           onClick={() => { setCommandPaletteOpen(false); router.push(result.url); }}
                           onMouseEnter={() => setSelectedIndex(globalIndex)}
                           className={`flex items-center justify-between p-3 rounded-md cursor-pointer text-left transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
                         >
                           <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                               {getIcon(result.icon)}
                             </div>
                             <div>
                               <p className={`text-[14px] font-bold ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-white'}`}>
                                 {result.title}
                               </p>
                               <p className="text-[12px] text-slate-500">{result.subtitle}</p>
                             </div>
                           </div>
                           {isSelected && <CornerDownLeft size={16} className="text-blue-500 dark:text-blue-400" />}
                         </div>
                       )
                     })}
                   </div>
                </div>
              ))}
            </div>

            {/* Footer Hints */}
            <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-center gap-6">
               <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                 <kbd className="h-5 px-1.5 rounded border border-slate-300 dark:border-slate-700 font-mono font-bold bg-white dark:bg-slate-800 text-[10px]">↑</kbd>
                 <kbd className="h-5 px-1.5 rounded border border-slate-300 dark:border-slate-700 font-mono font-bold bg-white dark:bg-slate-800 text-[10px]">↓</kbd>
                 to navigate
               </div>
               <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                 <kbd className="h-5 px-1.5 rounded border border-slate-300 dark:border-slate-700 font-mono font-bold bg-white dark:bg-slate-800 text-[10px]">↵</kbd>
                 to select
               </div>
               <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                 <kbd className="h-5 px-1.5 rounded border border-slate-300 dark:border-slate-700 font-mono font-bold bg-white dark:bg-slate-800 text-[10px]">ESC</kbd>
                 to close
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
