import { Skeleton } from "./Skeleton";

export function PayrollRunSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <Skeleton width={190} height={30} />
          <Skeleton width="min(100%, 560px)" height={14} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton width={120} height={40} />
          <Skeleton width={154} height={40} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton width={210} height={26} />
              <Skeleton width={84} height={26} className="rounded-full" />
            </div>
            <Skeleton width={145} height={14} />
          </div>
          <Skeleton width={120} height={40} />
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Skeleton width={112} height={14} />
            <Skeleton width={130} height={30} className="mt-3" />
          </div>
        ))}
      </section>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 border-b border-slate-200 p-4 dark:border-slate-800 xl:grid-cols-[minmax(240px,1fr)_160px_140px_150px_auto_auto]">
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={40} />
        </div>
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
          <div className="grid grid-cols-[64px_2fr_repeat(7,1fr)] gap-4">
            {Array.from({ length: 9 }).map((_, index) => (
              <Skeleton key={index} height={12} />
            ))}
          </div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[64px_2fr_repeat(7,1fr)] items-center gap-4 px-4 py-4">
              <Skeleton width={38} height={18} />
              <div className="flex items-center gap-3">
                <Skeleton width={36} height={36} className="rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton width="72%" height={13} />
                  <Skeleton width="48%" height={11} />
                </div>
              </div>
              {Array.from({ length: 7 }).map((__, cellIndex) => (
                <Skeleton key={cellIndex} height={14} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
