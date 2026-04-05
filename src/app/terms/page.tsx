import React from "react";
import fs from "fs";
import path from "path";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { Download } from "lucide-react";
import AppTopBar from "@/components/AppTopBar";

const components = {
  h1: (props: any) => <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight" {...props} />,
  h2: (props: any) => {
    // Generate an ID for the heading to allow jump links
    // "1. Acceptance" -> "1-acceptance"
    const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return <h2 id={id} className="text-xl md:text-2xl font-bold text-slate-900 mt-12 mb-4 tracking-tight scroll-mt-24" {...props} />;
  },
  h3: (props: any) => <h3 className="text-lg font-bold text-slate-800 mt-8 mb-3" {...props} />,
  p: (props: any) => <p className="text-base text-slate-600 leading-relaxed mb-6" {...props} />,
  ul: (props: any) => <ul className="list-disc list-inside text-base text-slate-600 leading-relaxed mb-6 space-y-2" {...props} />,
  li: (props: any) => <li className="" {...props} />,
  strong: (props: any) => <strong className="font-bold text-slate-900" {...props} />,
  a: (props: any) => <a className="text-blue-600 font-medium hover:underline" {...props} />,
};

// Extremely simple naive regex to extract h2 from markdown
function extractTOC(content: string) {
  const headings = content.match(/^##\s+(.*)/gm);
  if (!headings) return [];
  return headings.map(h => {
    const text = h.replace(/^##\s+/, "");
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return { text, id };
  });
}

export default async function TermsPage() {
  const filePath = path.join(process.cwd(), "src/content/terms.mdx");
  const content = fs.readFileSync(filePath, "utf-8");
  const toc = extractTOC(content);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between h-16 px-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="#0A1628" strokeWidth="3" />
            <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="font-bold text-slate-900 tracking-tight text-lg">CircleWorks Legal</span>
        </Link>
        <Link href="/dashboard" className="text-sm font-bold text-slate-600 hover:text-slate-900">
          Back to App →
        </Link>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex gap-12 relative items-start">
        
        {/* Sticky Sidebar TOC */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-28 bg-slate-50 rounded-xl p-6 border border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Contents</h3>
          <nav className="space-y-3">
            {toc.map(item => (
              <a 
                key={item.id} 
                href={`#${item.id}`} 
                className="block text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                {item.text}
              </a>
            ))}
          </nav>
          
          <div className="mt-8 pt-8 border-t border-slate-200">
             <button className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm">
                <Download size={16} />
                Download PDF
             </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-3xl min-w-0">
          <MDXRemote source={content} components={components} />
        </main>
      </div>
    </div>
  );
}
