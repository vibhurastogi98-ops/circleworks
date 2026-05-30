import { Skeleton } from "./Skeleton";

export function ProfileSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 py-6 sm:px-6">
      <Skeleton width={128} height={18} />
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Skeleton width={96} height={96} className="rounded-full" />
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton width={220} height={36} />
                  <Skeleton width={82} height={26} className="rounded-full" />
                </div>
                <Skeleton width={180} height={18} />
                <div className="flex flex-wrap gap-2">
                  <Skeleton width={92} height={26} className="rounded-full" />
                  <Skeleton width={110} height={26} className="rounded-full" />
                  <Skeleton width={96} height={26} className="rounded-full" />
                </div>
              </div>
            </div>
            <Skeleton width={118} height={40} />
          </div>
        </div>
        <div className="overflow-x-auto border-b border-slate-200 px-4 dark:border-slate-800">
          <div className="flex gap-2 py-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} width={96} height={18} />
            ))}
          </div>
        </div>
      </div>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Skeleton width={160} height={22} />
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton width={88} height={12} />
                  <Skeleton width="90%" height={18} />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Skeleton width={170} height={22} />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} height={52} />
              ))}
            </div>
          </div>
        </div>
        <aside className="space-y-4">
          <Skeleton height={160} className="rounded-xl" />
          <Skeleton height={220} className="rounded-xl" />
        </aside>
      </section>
    </div>
  );
}
