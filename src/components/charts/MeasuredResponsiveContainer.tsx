"use client";

import React, { useEffect, useRef, useState } from "react";

type MeasuredResponsiveContainerProps = {
  children: React.ReactElement<{ width?: number; height?: number }>;
  className?: string;
  height?: number | string;
  minHeight?: number;
  minWidth?: number;
  width?: number | string;
};

function sizeValue(value: number | string | undefined, fallback: string) {
  if (typeof value === "number") return `${value}px`;
  return value || fallback;
}

export default function MeasuredResponsiveContainer({
  children,
  className,
  height = "100%",
  minHeight = 1,
  minWidth = 1,
  width = "100%",
}: MeasuredResponsiveContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({
          width: Math.max(minWidth, Math.floor(rect.width)),
          height: Math.max(minHeight, Math.floor(rect.height)),
        });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [minHeight, minWidth]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        height: sizeValue(height, "100%"),
        minHeight,
        minWidth,
        width: sizeValue(width, "100%"),
      }}
    >
      {size ? React.cloneElement(children, size) : null}
    </div>
  );
}
