import { Skeleton } from "./Skeleton";

export function CalendarSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <Skeleton width={230} height={34} />
          <Skeleton width="min(100%, 560px)" height={14} />
        </div>
        <Skeleton width={120} height={40} />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} width={98} height={40} />
        ))}
      </div>
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <Skeleton width={150} height={20} />
            <Skeleton width={360} height={14} />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Skeleton width={224} height={40} />
            <Skeleton width={176} height={40} />
          </div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[1.2fr_1fr_1fr_80px_1.5fr_100px_1.2fr_140px] items-center gap-4 px-4 py-4">
              {Array.from({ length: 8 }).map((__, cellIndex) => (
                <Skeleton key={cellIndex} height={14} />
              ))}
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton width={180} height={20} />
          <Skeleton width={124} height={34} />
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, index) => (
            <Skeleton key={index} height={92} />
          ))}
        </div>
      </section>
    </div>
  );
}
