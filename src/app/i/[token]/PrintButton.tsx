"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-black text-white hover:bg-slate-700 print:hidden"
    >
      Print
    </button>
  );
}
