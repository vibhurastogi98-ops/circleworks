import React from "react";
import fs from "fs";
import path from "path";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { Settings2 } from "lucide-react";

const components = {
  h1: (props: any) => <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight" {...props} />,
  h2: (props: any) => <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-10 mb-4 tracking-tight" {...props} />,
  h3: (props: any) => <h3 className="text-[13px] uppercase tracking-widest font-black text-slate-400 mt-12 mb-6" {...props} />,
  p: (props: any) => <p className="text-base text-slate-600 leading-relaxed mb-6 font-medium" {...props} />,
  strong: (props: any) => <strong className="font-bold text-slate-900" {...props} />,
  a: (props: any) => <a className="text-blue-600 font-bold hover:underline" {...props} />,
  table: (props: any) => <div className="overflow-x-auto my-8 border border-slate-200 rounded-xl shadow-sm"><table className="w-full text-left border-collapse" {...props} /></div>,
  th: (props: any) => <th className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest py-4 px-5" {...props} />,
  td: (props: any) => <td className="border-b border-slate-100 py-4 px-5 text-sm text-slate-700 font-medium last:border-0" {...props} />,
  code: (props: any) => <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded-md font-mono text-xs font-bold" {...props} />,
  hr: (props: any) => <hr className="my-10 border-slate-200" {...props} />,
};

export default async function CookiesPage() {
  const filePath = path.join(process.cwd(), "src/content/cookies.mdx");
  const content = fs.readFileSync(filePath, "utf-8");

  return (
    <div className="min-h-screen bg-white selection:bg-blue-500/30">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 flex items-center justify-between h-16 px-6 relative">
        <Link href="/" className="inline-flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="#0A1628" strokeWidth="3" />
            <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="font-bold text-slate-900 tracking-tight text-lg">CircleWorks Legal</span>
        </Link>
        <Link href="/dashboard" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
          Back to App →
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col items-center">
        {/* Main Content */}
        <main className="w-full">
          <MDXRemote source={content} components={components} />
        </main>
      </div>
    </div>
  );
}
