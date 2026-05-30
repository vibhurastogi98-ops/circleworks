import { Skeleton } from "./Skeleton";

export function ChartSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-label="Loading chart"
      className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton width={160} height={18} />
          <Skeleton width={230} height={12} />
        </div>
        <Skeleton width={92} height={32} />
      </div>
      <div className="flex h-[240px] items-end gap-3 border-b border-l border-slate-100 pb-4 pl-4 dark:border-slate-800">
        {[45, 68, 56, 82, 72, 94, 64, 88, 76, 98, 84, 92].map((height, index) => (
          <Skeleton key={index} className="flex-1" height={`${height}%`} />
        ))}
      </div>
      <div className="mt-4 flex justify-between gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} width={42} height={10} />
        ))}
      </div>
    </div>
  );
}
