import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  formatWebinarDateTime,
  getWebinarBySlug,
  getWebinarEndDate,
  WEBINARS,
} from "@/data/webinars";
import WebinarWatchGate from "./WebinarWatchGate";

export const dynamicParams = false;

type WebinarDetailParams = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return WEBINARS.map((webinar) => ({
    slug: webinar.slug,
  }));
}

export async function generateMetadata({ params }: WebinarDetailParams): Promise<Metadata> {
  const { slug } = await params;
  const webinar = getWebinarBySlug(slug);

  if (!webinar) return {};

  return {
    metadataBase: new URL("https://circleworks.com"),
    title: `${webinar.title} | CircleWorks Webinars`,
    description: webinar.description,
    alternates: {
      canonical: `https://circleworks.com/webinars/${webinar.slug}`,
    },
    openGraph: {
      title: webinar.title,
      description: webinar.description,
      url: `https://circleworks.com/webinars/${webinar.slug}`,
      siteName: "CircleWorks",
      images: [{ url: webinar.thumbnail }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: webinar.title,
      description: webinar.description,
      images: [webinar.thumbnail],
    },
  };
}

export default async function WebinarDetailPage({ params }: WebinarDetailParams) {
  const { slug } = await params;
  const webinar = getWebinarBySlug(slug);

  if (!webinar) {
    notFound();
  }

  const webinarUrl = `https://circleworks.com/webinars/${webinar.slug}`;
  const schema =
    webinar.type === "upcoming"
      ? {
          "@context": "https://schema.org",
          "@type": "EducationEvent",
          name: webinar.title,
          description: webinar.description,
          image: webinar.thumbnail,
          startDate: webinar.date,
          endDate: getWebinarEndDate(webinar).toISOString(),
          eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: {
            "@type": "VirtualLocation",
            url: webinarUrl,
          },
          organizer: {
            "@type": "Organization",
            name: "CircleWorks",
            url: "https://circleworks.com",
          },
          performer: {
            "@type": "Person",
            name: webinar.speaker,
            jobTitle: webinar.speakerTitle,
          },
        }
      : {
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: webinar.title,
          description: webinar.description,
          thumbnailUrl: [webinar.thumbnail],
          uploadDate: webinar.date,
          duration: `PT${webinar.durationMinutes}M`,
          contentUrl: webinarUrl,
          embedUrl: webinar.videoUrl,
          publisher: {
            "@type": "Organization",
            name: "CircleWorks",
            url: "https://circleworks.com",
          },
        };

  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200 selection:text-navy">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Navbar />

      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/webinars"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to all webinars
        </Link>

        <article className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200">
          <div className="h-64 md:h-96 w-full relative">
            <img src={webinar.thumbnail} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
              <div className="flex flex-wrap gap-2">
                {webinar.topics.map((topic) => (
                  <span
                    key={topic}
                    className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider"
                  >
                    {topic}
                  </span>
                ))}
                <span className="bg-white/20 backdrop-blur text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {webinar.type === "upcoming" ? "Upcoming Session" : "On Demand"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-5xl font-black text-[#0A1628] mb-6 leading-tight tracking-tight">
              {webinar.title}
            </h1>

            <div className="flex flex-wrap gap-6 mb-10 pb-10 border-b border-slate-100">
              <div className="flex items-start text-slate-600 font-semibold">
                <Calendar className="w-6 h-6 mr-3 text-blue-500 shrink-0" />
                {formatWebinarDateTime(webinar)}
              </div>
              <div className="flex items-center text-slate-600 font-semibold">
                <Clock className="w-6 h-6 mr-3 text-blue-500" />
                {webinar.durationMinutes} minutes
              </div>
              <div className="flex items-start text-slate-600 font-semibold">
                <User className="w-6 h-6 mr-3 text-blue-500 shrink-0" />
                <span>
                  {webinar.speaker}
                  <span className="block text-slate-400 font-bold">{webinar.speakerTitle}</span>
                </span>
              </div>
            </div>

            <div className="prose prose-lg text-slate-600 max-w-none">
              <p className="text-xl leading-relaxed">{webinar.description}</p>

              <h2 className="text-2xl font-black text-[#0A1628] mt-10 mb-4">What you'll learn</h2>
              <ul className="space-y-3">
                <li>How the topic affects payroll, HR, or compliance operations.</li>
                <li>Practical controls and workflows your team can apply immediately.</li>
                <li>Where CircleWorks automation removes manual follow-up.</li>
              </ul>
            </div>

            {webinar.type === "ondemand" && webinar.videoUrl && (
              <div className="mt-12">
                <WebinarWatchGate webinar={webinar} />
              </div>
            )}

            {webinar.type === "upcoming" && (
              <div className="mt-12 bg-blue-50 rounded-2xl p-8 border border-blue-100 text-center">
                <h2 className="text-2xl font-black text-[#0A1628] mb-4">Save Your Seat</h2>
                <p className="text-slate-600 mb-6 font-medium">
                  Register from the webinars page to receive your confirmation email and calendar file.
                </p>
                <Link
                  href="/webinars"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-10 rounded-xl transition-colors shadow-lg shadow-blue-500/25 text-lg"
                >
                  Register Free
                </Link>
              </div>
            )}
          </div>
        </article>
      </section>

      <Footer />
    </main>
  );
}
