"use client";

import React, { useEffect, useRef, useState } from "react";

type CountUpOptions = {
  end: number;
  decimals?: number;
  duration?: number;
  formatter: (value: number) => string;
};

function useCountUp({ end, decimals = 0, duration = 1600, formatter }: CountUpOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const [displayValue, setDisplayValue] = useState(formatter(0));

  useEffect(() => {
    const element = ref.current;
    let animationFrame = 0;

    if (!element) {
      return;
    }

    const animate = () => {
      if (hasAnimated.current) {
        return;
      }

      hasAnimated.current = true;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setDisplayValue(formatter(end));
        return;
      }

      let startTime: number | null = null;

      const step = (timestamp: number) => {
        if (startTime === null) {
          startTime = timestamp;
        }

        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const nextValue = Number((easedProgress * end).toFixed(decimals));

        setDisplayValue(formatter(nextValue));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(step);
        } else {
          setDisplayValue(formatter(end));
        }
      };

      animationFrame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.unobserve(element);
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [decimals, duration, end, formatter]);

  return { ref, displayValue };
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
    number: (value: number) => `<${Math.round(value)} Min`,
    label: "Average First Payroll Setup",
    subLabel: "From signup to first run",
  },
];

function StatCard({ stat, isLast }: { stat: (typeof stats)[number]; isLast: boolean }) {
  const { ref, displayValue } = useCountUp({
    end: stat.end,
    decimals: stat.decimals,
    formatter: stat.number,
  });

  return (
    <div className={`flex flex-col items-center px-6 text-center ${isLast ? "" : "lg:border-r lg:border-gray-200"}`}>
      <div
        ref={ref}
        className="min-h-[78px] bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500 bg-clip-text text-[64px] font-black leading-none text-transparent"
      >
        {displayValue}
      </div>
      <div className="mt-5 text-[20px] font-semibold leading-tight text-gray-900">{stat.label}</div>
      <div className="mt-2 text-[14px] leading-6 text-gray-500">{stat.subLabel}</div>
    </div>
  );
}

export function StatsSection() {
  return (
    <section className="w-full bg-white py-16">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-y-14 lg:grid-cols-4 lg:gap-y-0">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} isLast={index === stats.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
