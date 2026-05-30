import { Skeleton } from "./Skeleton";

export function EmployeeTableSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <Skeleton width={180} height={30} />
          <Skeleton width="min(100%, 560px)" height={14} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton width={132} height={40} />
          <Skeleton width={116} height={40} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton width={112} height={28} className="rounded-full" />
          <Skeleton width={92} height={28} className="rounded-full" />
          <Skeleton width={92} height={28} className="rounded-full" />
          <Skeleton width={76} height={28} className="rounded-full" />
          <Skeleton width={178} height={40} className="ml-auto" />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[minmax(220px,1.3fr)_repeat(3,minmax(140px,1fr))]">
          <Skeleton height={40} className="md:col-span-2 xl:col-span-3 2xl:col-span-1" />
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} height={40} />
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/70">
          <div className="grid grid-cols-[48px_2fr_repeat(6,1fr)] gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} height={12} />
            ))}
          </div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[48px_2fr_repeat(6,1fr)] items-center gap-4 px-5 py-4">
              <Skeleton width={16} height={16} />
              <div className="flex items-center gap-3">
                <Skeleton width={36} height={36} className="rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton width="72%" height={13} />
                  <Skeleton width="52%" height={11} />
                </div>
              </div>
              {Array.from({ length: 6 }).map((__, cellIndex) => (
                <Skeleton key={cellIndex} height={14} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
