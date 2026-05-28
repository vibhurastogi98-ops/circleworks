import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getJobBySlug, jobs } from "@/data/careers";

const SITE_URL = "https://circleworks.com";

type RolePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return jobs.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: RolePageProps) {
  const { slug } = await params;
  const job = getJobBySlug(slug);

  if (!job) {
    return {
      title: "Role Not Found | CircleWorks",
    };
  }

  return {
    title: `${job.title} | Careers at CircleWorks`,
    description: job.description,
    alternates: {
      canonical: `${SITE_URL}/careers/${job.slug}`,
    },
    openGraph: {
      title: `${job.title} | Careers at CircleWorks`,
      description: job.description,
      url: `${SITE_URL}/careers/${job.slug}`,
      type: "article",
    },
  };
}

export default async function CareerRolePage({ params }: RolePageProps) {
  const { slug } = await params;
  const job = getJobBySlug(slug);

  if (!job) notFound();

  return (
    <main className="min-h-screen bg-white font-sans">
      <Navbar />

      <section className="pt-32 pb-16 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/careers#open-roles" className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800 mb-8">
            <ArrowLeft size={16} />
            Back to Open Roles
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-700 mb-5">
                <BriefcaseBusiness size={14} />
                {job.department}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-[#0A1628] tracking-tight leading-tight">{job.title}</h1>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={15} />
                  {job.location}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span>{job.type}</span>
              </div>
            </div>

            <a href={`mailto:careers@circleworks.com?subject=Application: ${encodeURIComponent(job.title)}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
              Apply for this Role
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.7fr_0.3fr] gap-10">
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-black text-[#0A1628]">The Role</h2>
              <p className="mt-4 text-slate-600 leading-8">{job.description}</p>
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#0A1628]">Your Impact</h2>
              <p className="mt-4 text-slate-600 leading-8">{job.impact}</p>
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#0A1628]">What We Are Looking For</h2>
              <ul className="mt-5 space-y-3">
                {job.requirements.map((requirement) => (
                  <li key={requirement} className="flex gap-3 text-slate-600 leading-7">
                    <span className="mt-2 w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 h-fit rounded-lg border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#0A1628]">Role Snapshot</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="font-bold text-slate-500">Department</dt>
                <dd className="mt-1 text-[#0A1628] font-bold">{job.department}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">Location</dt>
                <dd className="mt-1 text-[#0A1628] font-bold">{job.location}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">Employment Type</dt>
                <dd className="mt-1 text-[#0A1628] font-bold">{job.type}</dd>
              </div>
            </dl>
            <a href={`mailto:careers@circleworks.com?subject=Application: ${encodeURIComponent(job.title)}`} className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
              Apply Now
              <ArrowRight size={16} />
            </a>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}
