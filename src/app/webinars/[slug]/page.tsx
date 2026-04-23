import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { WEBINARS } from "../../api/webinars/route";
import { Calendar, Clock, User, PlayCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export function generateStaticParams() {
  return WEBINARS.map((w) => ({
    slug: w.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const webinar = WEBINARS.find((w) => w.slug === resolvedParams.slug);
  
  if (!webinar) return {};

  return {
    title: `${webinar.title} | CircleWorks Webinars`,
    description: webinar.description,
    alternates: {
      canonical: `https://circleworks.com/webinars/${webinar.slug}`,
    },
  };
}

export default async function WebinarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const webinar = WEBINARS.find((w) => w.slug === resolvedParams.slug);

  if (!webinar) {
    notFound();
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationEvent",
    "name": webinar.title,
    "description": webinar.description,
    "startDate": webinar.date,
    "endDate": new Date(new Date(webinar.date).getTime() + parseInt(webinar.duration) * 60000).toISOString(),
    "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "location": {
      "@type": "VirtualLocation",
      "url": `https://circleworks.com/webinars/${webinar.slug}`
    },
    "organizer": {
      "@type": "Organization",
      "name": "CircleWorks",
      "url": "https://circleworks.com"
    },
    "performer": {
      "@type": "Person",
      "name": webinar.speaker
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200 selection:text-navy">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Navbar />

      <section className="pt-32 pb-24 lg:pt-40 lg:pb-32 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/webinars" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold mb-8">
          <ArrowLeft className="w-5 h-5" />
          Back to all webinars
        </Link>
        
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200">
          {/* Header Image or Video Player */}
          {webinar.type === "ondemand" && webinar.videoUrl ? (
            <div className="aspect-video bg-black relative">
              <iframe 
                src={webinar.videoUrl} 
                className="w-full h-full absolute inset-0" 
                frameBorder="0" 
                allow="autoplay; fullscreen; picture-in-picture" 
                allowFullScreen
              />
            </div>
          ) : (
            <div className="h-64 md:h-96 w-full relative">
              <img src={webinar.thumbnail} alt={webinar.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  {webinar.topics.map((t: string) => (
                    <span key={t} className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {t}
                    </span>
                  ))}
                  <span className="bg-white/20 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {webinar.type === 'upcoming' ? 'Upcoming Session' : 'On-Demand'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-5xl font-black text-[#0A1628] mb-6 leading-tight">
              {webinar.title}
            </h1>
            
            <div className="flex flex-wrap gap-6 mb-10 pb-10 border-b border-slate-100">
              <div className="flex items-center text-slate-600 font-medium">
                <Calendar className="w-6 h-6 mr-3 text-blue-500" />
                {new Date(webinar.date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
              </div>
              <div className="flex items-center text-slate-600 font-medium">
                <Clock className="w-6 h-6 mr-3 text-blue-500" />
                {webinar.duration}
              </div>
              <div className="flex items-center text-slate-600 font-medium">
                <User className="w-6 h-6 mr-3 text-blue-500" />
                {webinar.speaker}
              </div>
            </div>

            <div className="prose prose-lg text-slate-600 max-w-none">
              <p className="text-xl leading-relaxed">{webinar.description}</p>
              
              <h3 className="text-2xl font-bold text-[#0A1628] mt-10 mb-4">What you'll learn:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">✓</span>
                  Actionable insights from our top experts in {webinar.topics[0]?.toLowerCase() || 'the field'}.
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">✓</span>
                  Live Q&A session answers and common pitfalls to avoid.
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">✓</span>
                  Exclusive access to templates and guides mentioned during the session.
                </li>
              </ul>
            </div>

            {webinar.type === "upcoming" && (
              <div className="mt-12 bg-blue-50 rounded-2xl p-8 border border-blue-100 text-center">
                <h3 className="text-2xl font-bold text-[#0A1628] mb-4">Save Your Seat</h3>
                <p className="text-slate-600 mb-6">Spots are limited. Register now to receive the calendar invite and Zoom link.</p>
                <Link href="/webinars" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl transition-colors shadow-lg shadow-blue-500/30 text-lg">
                  Register for Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
