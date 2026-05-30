import { Skeleton } from "./Skeleton";

export function PayStubSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <Skeleton width={170} height={30} />
          <Skeleton width="min(100%, 620px)" height={14} />
        </div>
        <Skeleton width={160} height={40} />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Skeleton width="min(100%, 420px)" height={40} />
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton width={160} height={18} />
                <Skeleton width={112} height={13} />
              </div>
              <Skeleton width={22} height={22} />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((__, cellIndex) => (
                <div key={cellIndex} className="space-y-2">
                  <Skeleton width={48} height={10} />
                  <Skeleton width={70} height={16} />
                </div>
              ))}
            </div>
            <Skeleton height={40} className="mt-5" />
          </div>
        ))}
      </section>
    </div>
  );
}
