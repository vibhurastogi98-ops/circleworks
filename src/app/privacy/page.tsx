import React from "react";
import fs from "fs";
import path from "path";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { Download, ShieldCheck } from "lucide-react";

const components = {
  h1: (props: any) => <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight" {...props} />,
  h2: (props: any) => {
    const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return <h2 id={id} className="text-xl md:text-2xl font-bold text-slate-900 mt-12 mb-4 tracking-tight scroll-mt-24" {...props} />;
  },
  h3: (props: any) => <h3 className="text-lg font-bold text-slate-800 mt-8 mb-3" {...props} />,
  p: (props: any) => <p className="text-base text-slate-600 leading-relaxed mb-6" {...props} />,
  ul: (props: any) => <ul className="list-disc list-inside text-base text-slate-600 leading-relaxed mb-6 space-y-2" {...props} />,
  li: (props: any) => <li className="" {...props} />,
  strong: (props: any) => <strong className="font-bold text-slate-900" {...props} />,
  a: (props: any) => <a className="text-blue-600 font-bold hover:underline hover:text-blue-700" {...props} />,
};

function extractTOC(content: string) {
  const headings = content.match(/^##\s+(.*)/gm);
  if (!headings) return [];
  return headings.map(h => {
    const text = h.replace(/^##\s+/, "");
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return { text, id };
  });
}

export default async function PrivacyPage() {
  const filePath = path.join(process.cwd(), "src/content/privacy.mdx");
  const content = fs.readFileSync(filePath, "utf-8");
  const toc = extractTOC(content);

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-500/30">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between h-16 px-6 relative">
        <Link href="/" className="inline-flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="#0A1628" strokeWidth="3" />
            <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="font-bold text-slate-900 tracking-tight text-lg">CircleWorks Legal</span>
        </Link>
        <Link href="/dashboard" className="text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">
          Back to App
        </Link>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex gap-12 relative items-start">
        
        {/* Sticky Sidebar TOC */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-28 auto-rows-max">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5">Privacy Topics</h3>
            <nav className="space-y-1.5 border-l-2 border-slate-100 pl-4">
              {toc.map(item => (
                <a 
                  key={item.id} 
                  href={`#${item.id}`} 
                  className="block text-[13px] font-semibold text-slate-500 hover:text-blue-600 transition-colors py-1 hover:translate-x-1 duration-200"
                >
                  {item.text}
                </a>
              ))}
            </nav>
            
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
               <button className="w-full flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-white px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-sm">
                  <Download size={16} />
                  Download PDF
               </button>
               <Link href="/contact" className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2.5 rounded-xl border border-blue-100 text-[13px] font-bold transition-colors">
                  <ShieldCheck size={16} />
                  Data Subject Request
               </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-3xl min-w-0 bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200">
          <MDXRemote source={content} components={components} />
        </main>
      </div>
    </div>
  );
}
