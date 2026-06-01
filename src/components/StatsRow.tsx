"use client";

import React, { useEffect, useRef, useState } from "react";

const COUNT_UP_DURATION_MS = 1800;

function easeOutQuart(progress: number) {
  return 1 - Math.pow(1 - progress, 4);
}

function useCountUp(
  target: number,
  duration: number,
  easing: (progress: number) => number,
  shouldAnimate: boolean,
) {
  const hasAnimated = useRef(false);
  const frameRef = useRef<number | null>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!shouldAnimate || hasAnimated.current) {
      return;
    }

    hasAnimated.current = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }

    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const nextValue = target * easing(progress);

      setValue(progress < 1 ? nextValue : target);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [duration, easing, shouldAnimate, target]);

  return value;
}

function useStatsAnimationTrigger() {
  const ref = useRef<HTMLElement | null>(null);
  const hasAnimated = useRef(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element || hasAnimated.current) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      hasAnimated.current = true;
      setShouldAnimate(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.3) {
          hasAnimated.current = true;
          setShouldAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { ref, shouldAnimate };
}

const stats = [
  {
    end: 50,
    number: (value: number) => `${Math.round(value)} States`,
    label: "Full USA Payroll Coverage",
    subLabel: "+ DC, no extra charge",
  },
  {
    end: 2,
    number: (value: number) => `$${Math.round(value)}B+`,
    label: "Payroll Processed",
    subLabel: "By US companies on CircleWorks",
  },
  {
    end: 99.97,
    decimals: 2,
    number: (value: number) => `${value.toFixed(2)}%`,
    label: "Platform Uptime",
    subLabel: "SLA-guaranteed, SOC 2 certified",
  },
  {
    end: 5,
    number: (value: number) => `<${Math.max(1, Math.round(value))} Min`,
    label: "Average First Payroll Setup",
    subLabel: "From signup to first run",
  },
];

function StatCard({
  stat,
  isLast,
  shouldAnimate,
}: {
  stat: (typeof stats)[number];
  isLast: boolean;
  shouldAnimate: boolean;
}) {
  const count = useCountUp(stat.end, COUNT_UP_DURATION_MS, easeOutQuart, shouldAnimate);
  const displayValue = stat.number(count);

  return (
    <div className={`flex flex-col items-center px-6 text-center ${isLast ? "" : "lg:border-r lg:border-gray-200"}`}>
      <div className="min-h-[78px] bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500 bg-clip-text text-[64px] font-black leading-none text-transparent">
        {displayValue}
      </div>
      <div className="mt-5 text-[20px] font-semibold leading-tight text-gray-900">{stat.label}</div>
      <div className="mt-2 text-[14px] leading-6 text-gray-500">{stat.subLabel}</div>
    </div>
  );
}

export function StatsSection() {
  const { ref, shouldAnimate } = useStatsAnimationTrigger();

  return (
    <section ref={ref} className="w-full bg-white py-16">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-y-14 lg:grid-cols-4 lg:gap-y-0">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              stat={stat}
              isLast={index === stats.length - 1}
              shouldAnimate={shouldAnimate}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
