import type { CSSProperties } from "react";

type SkeletonProps = {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  className?: string;
  delayMs?: number;
};

export function Skeleton({
  width,
  height,
  className = "",
  delayMs = 300,
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded-md bg-gray-200 dark:bg-slate-800 ${className}`}
      style={{ width, height, animationDelay: `${delayMs}ms` }}
    />
  );
}
