import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Pre-Boarding | CircleWorks",
  description: "Complete your pre-boarding steps before your first day.",
};

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Minimal header — logo only */}
      <header className="w-full h-16 flex items-center justify-center px-6 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/30">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2.5}>
              <circle cx="12" cy="12" r="9" strokeOpacity="0.4" />
              <path d="M12 3C16.97 3 21 7.03 21 12" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">CircleWorks</span>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="py-8 text-center text-[12px] text-slate-400">
        &copy; {new Date().getFullYear()} CircleWorks · Secure Pre-Boarding Portal · 
        <a href="/privacy" className="underline ml-1 hover:text-slate-600 transition-colors">Privacy Policy</a>
      </footer>
    </div>
  );
}
