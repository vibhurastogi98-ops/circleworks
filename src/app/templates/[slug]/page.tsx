import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TEMPLATES, getTemplateBySlug } from "@/data/templates";
import { FileText, Download, ArrowLeft, CheckCircle2, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import TemplateDownloadButton from "../TemplateDownloadButton";

export const dynamicParams = false;

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({
    slug: t.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const template = getTemplateBySlug(resolvedParams.slug);
  
  if (!template) return {};

  return {
    title: `${template.title} | Free HR Download | CircleWorks`,
    description: template.description,
    alternates: {
      canonical: `https://circleworks.com/templates/${template.slug}`,
    },
  };
}

export default async function TemplateDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const template = getTemplateBySlug(resolvedParams.slug);

  if (!template) {
    notFound();
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: template.title,
    description: template.description,
    url: `https://circleworks.com/templates/${template.slug}`,
    mainEntity: {
      "@type": "DigitalDocument",
      name: template.title,
      description: template.description,
      fileFormat: template.type,
      encodingFormat: template.type,
      author: {
        "@type": "Organization",
        name: "CircleWorks",
      },
      isAccessibleForFree: true,
    },
  };

  const getIcon = (type: string) => {
    if (type.includes("Word")) return <FileText className="w-16 h-16 text-blue-500" />;
    if (type.includes("Excel")) return <FileSpreadsheet className="w-16 h-16 text-emerald-500" />;
    return <FileText className="w-16 h-16 text-red-500" />;
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200 selection:text-navy">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Navbar />

      <section className="pt-32 pb-24 lg:pt-40 lg:pb-32 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/templates" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold mb-8">
          <ArrowLeft className="w-5 h-5" />
          Back to all templates
        </Link>
        
        <div className="bg-white rounded-lg overflow-hidden shadow-xl border border-slate-200">
          <div className="flex flex-col md:flex-row">
            
            {/* Left side: Graphic/Icon */}
            <div className="md:w-1/3 bg-[#0A1628] p-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
               <div className="bg-white p-6 rounded-lg shadow-2xl relative z-10 mb-6">
                 {getIcon(template.type)}
               </div>
                 <span className="text-white font-bold bg-white/10 px-4 py-2 rounded-md uppercase tracking-wider text-sm relative z-10">
                 {template.type}
               </span>
            </div>

            {/* Right side: Content & Lead Gate CTA */}
            <div className="md:w-2/3 p-8 md:p-12 flex flex-col">
               <div className="flex items-center gap-2 mb-4">
                 <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                   {template.category}
                 </span>
                 <span className="text-xs font-bold text-slate-400">
                   {template.downloads.toLocaleString()}+ Downloads
                 </span>
               </div>
               
               <h1 className="text-3xl md:text-5xl font-black text-[#0A1628] mb-6 leading-tight">
                 {template.title}
               </h1>
               
               <p className="text-xl text-slate-600 leading-relaxed mb-8">
                 {template.description}
               </p>

               <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 mb-8">
                  <h3 className="font-bold text-[#0A1628] mb-3">What's included:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center text-slate-600">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" /> Fully editable {template.type} format
                    </li>
                    <li className="flex items-center text-slate-600">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" /> Reviewed by HR professionals
                    </li>
                    <li className="flex items-center text-slate-600">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" /> Ready to use immediately
                    </li>
                  </ul>
               </div>
               
               <div className="mt-auto">
                 <TemplateDownloadButton
                   template={template}
                   className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700 sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
                 >
                   <Download className="w-5 h-5" />
                   Download Free Template
                 </TemplateDownloadButton>
                 <p className="text-sm text-slate-400 mt-4 font-medium text-center sm:text-left">
                   *Requires email registration. We'll send the download link directly to your inbox.
                 </p>
               </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
