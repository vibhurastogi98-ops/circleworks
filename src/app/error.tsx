"use client";

import { useEffect } from "react";

import ErrorState from "@/components/ErrorState";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const sentryId = error.digest || "unavailable";

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-2xl items-center justify-center px-4 py-12">
      <div className="w-full space-y-4">
        <ErrorState
          code={500}
          title="Something went wrong on our end"
          description="Our team has been notified. Please try again in a moment."
          retry={reset}
        />
        <p className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          Sentry error ID: <span className="font-mono">{sentryId}</span>
        </p>
      </div>
    </main>
  );
}
