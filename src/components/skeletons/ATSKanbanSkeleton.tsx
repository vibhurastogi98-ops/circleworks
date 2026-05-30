import { Skeleton } from "./Skeleton";

export function ATSKanbanSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <Skeleton width={170} height={30} />
          <Skeleton width="min(100%, 520px)" height={14} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton width={130} height={40} />
          <Skeleton width={122} height={40} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} height={112} className="rounded-xl" />
        ))}
      </div>

      <div className="min-h-[520px] overflow-x-auto pb-3">
        <div className="flex gap-4" style={{ minWidth: 1630 }}>
          {Array.from({ length: 5 }).map((_, columnIndex) => (
            <div key={columnIndex} className="flex h-[520px] w-[310px] shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Skeleton width={10} height={10} className="rounded-full" />
                  <Skeleton width={92} height={14} />
                </div>
                <Skeleton width={28} height={20} className="rounded-full" />
              </div>
              <div className="min-h-0 flex-1 space-y-3 overflow-y-hidden p-3">
                {Array.from({ length: 4 }).map((__, cardIndex) => (
                  <div key={cardIndex} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-3">
                      <Skeleton width={40} height={40} className="rounded-full" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton width="80%" height={14} />
                        <Skeleton width="60%" height={12} />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Skeleton width={64} height={24} className="rounded-full" />
                      <Skeleton width={58} height={24} className="rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
