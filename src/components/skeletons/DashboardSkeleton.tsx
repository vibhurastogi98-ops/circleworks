import { ChartSkeleton } from "./ChartSkeleton";
import { Skeleton } from "./Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <Skeleton width={150} height={16} />
            <div className="flex flex-wrap items-end gap-3">
              <Skeleton width={190} height={38} />
              <Skeleton width={132} height={30} className="rounded-full" />
            </div>
            <Skeleton width="min(100%, 520px)" height={14} />
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton width={130} height={40} />
              <Skeleton width={120} height={40} />
              <Skeleton width={120} height={40} />
            </div>
            <Skeleton width={170} height={40} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <Skeleton width={112} height={14} />
              <Skeleton width={40} height={40} className="rounded-lg" />
            </div>
            <Skeleton width={120} height={34} className="mt-5" />
            <Skeleton width={180} height={14} className="mt-3" />
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <Skeleton width={230} height={22} />
                <Skeleton width={360} height={14} />
              </div>
              <Skeleton width={145} height={40} />
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} height={82} />
              ))}
            </div>
          </div>
          <section className="grid gap-6 lg:grid-cols-[3fr_2fr]">
            <ChartSkeleton />
            <ChartSkeleton />
          </section>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} height={124} className="rounded-xl" />
            ))}
          </div>
        </div>
        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Skeleton width={132} height={20} />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton width={36} height={36} className="rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton width="100%" height={12} />
                  <Skeleton width="70%" height={10} />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
