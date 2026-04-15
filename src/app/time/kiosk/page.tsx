"use client";

import React, { useState, useEffect } from "react";
import { Fingerprint, QrCode, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function KioskPage() {
  const [pin, setPin] = useState("");
  const [time, setTime] = useState(new Date());
  const [mode, setMode] = useState<"pin" | "qr">("pin");
  const [flash, setFlash] = useState<"success" | "error" | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    
    async function fetchProjects() {
      try {
        const res = await fetch("/api/agency/projects");
        const data = await res.json();
        if (data.success) setProjects(data.projects);
      } catch (err) { console.error(err); }
    }
    fetchProjects();

    return () => clearInterval(t);
  }, []);

  const handleKey = (k: string) => {
    if (k === "clear") { setPin(""); return; }
    if (k === "back") { setPin(p => p.slice(0, -1)); return; }
    if (pin.length < 6) setPin(p => p + k);
  };

  const handleSubmit = async () => {
    if (pin.length < 4) return;
    setIsProcessing(true);
    try {
      // In a real app, we'd have a specific endpoint to verify PIN and get employeeId
      // For this migration demo, we use the PIN as a mock employeeId if it's numeric
      const employeeId = parseInt(pin) || 1; 
      
      const res = await fetch("/api/time/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          pin,
          projectId: selectedProject,
          companyId: 1 // Default company for demo
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setFlash("success");
        setMessage(data.action === 'clock-in' ? "✓ Clock-in successful!" : "✓ Clock-out successful!");
        setTimeout(() => { setFlash(null); setPin(""); setSelectedProject(""); }, 3000);
      } else {
        setFlash("error");
        setMessage("✗ Invalid PIN or identity");
        setTimeout(() => setFlash(null), 2000);
      }
    } catch (err) {
      setFlash("error");
      setMessage("✗ Connection error");
    } finally {
      setIsProcessing(false);
    }
  };

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  const dateStr = time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex flex-col items-center justify-center">
      {/* Exit button */}
      <Link href="/time" className="absolute top-6 left-6 flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Exit Kiosk
      </Link>

      {/* Company Logo Area */}
      <div className="mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <div className="w-6 h-6 bg-white rounded-full opacity-90" />
        </div>
      </div>

      {/* Clock */}
      <div className="text-center mb-8 select-none">
        <div className="text-7xl sm:text-8xl font-black text-white tracking-tight font-mono">
          {hours}<span className="animate-pulse text-violet-400">:</span>{minutes}
          <span className="text-3xl sm:text-4xl text-white/40 font-bold ml-1">{seconds}</span>
        </div>
        <div className="text-lg text-white/50 font-medium mt-2">{dateStr}</div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1 mb-8">
        <button onClick={() => setMode("pin")} className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${mode === "pin" ? "bg-white text-slate-900 shadow-md" : "text-white/60 hover:text-white"}`}>
          <Fingerprint size={16} className="inline mr-2" /> PIN Entry
        </button>
        <button onClick={() => setMode("qr")} className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${mode === "qr" ? "bg-white text-slate-900 shadow-md" : "text-white/60 hover:text-white"}`}>
          <QrCode size={16} className="inline mr-2" /> QR Code
        </button>
      </div>

      {mode === "pin" ? (
        <div className="flex flex-col items-center gap-6">
          {/* PIN Display */}
          <div className="flex gap-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-black transition-all ${
                i < pin.length
                  ? "border-violet-500 bg-violet-500/20 text-white shadow-lg shadow-violet-500/20"
                  : "border-white/20 bg-white/5 text-white/20"
              }`}>
                {i < pin.length ? "●" : ""}
              </div>
            ))}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3">
            {["1","2","3","4","5","6","7","8","9","clear","0","back"].map(key => (
              <button
                key={key}
                onClick={() => key === "clear" || key === "back" ? handleKey(key) : handleKey(key)}
                className={`w-20 h-16 rounded-xl text-xl font-bold transition-all active:scale-95 ${
                  key === "clear"
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm"
                    : key === "back"
                    ? "bg-white/10 text-white/60 hover:bg-white/20 text-sm"
                    : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                }`}
              >
                {key === "clear" ? "CLR" : key === "back" ? "⌫" : key}
              </button>
            ))}
          </div>

          <div className="w-[268px]">
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 ml-1">Assign to Project</label>
            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full h-12 rounded-xl bg-white/10 border border-white/20 text-white px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-white">General / Internal</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">{p.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={pin.length < 4 || isProcessing}
            className="w-[268px] h-16 rounded-2xl text-lg font-black transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/30 active:scale-[0.98]"
          >
            {isProcessing ? "PROCESSING..." : "CLOCK IN / OUT"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <div className="w-64 h-64 bg-white rounded-2xl flex items-center justify-center shadow-xl">
            <div className="w-48 h-48 border-2 border-slate-200 rounded-xl flex items-center justify-center">
              <QrCode size={120} className="text-slate-800" />
            </div>
          </div>
          <p className="text-white/50 text-sm font-medium text-center max-w-xs">
            Scan this QR code with your phone to clock in or out instantly
          </p>
        </div>
      )}

      {/* Flash Messages */}
      {flash && (
        <div className={`absolute bottom-12 px-8 py-4 rounded-2xl text-lg font-bold animate-in fade-in zoom-in-95 duration-200 ${
          flash === "success"
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
            : "bg-red-500 text-white shadow-lg shadow-red-500/30"
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
