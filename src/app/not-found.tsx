import Link from "next/link";

import { NotFoundIllustration } from "@/components/StateIllustrations";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-gray-50 px-4 py-12 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-32 w-32 items-center justify-center">
          <NotFoundIllustration />
        </div>
        <p className="mt-5 text-sm font-black uppercase tracking-wide text-blue-600 dark:text-blue-300">404</p>
        <h1 className="mt-2 text-2xl font-black">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
          The page you&apos;re looking for doesn&apos;t exist or was moved.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      </section>
    </main>
  );
}
