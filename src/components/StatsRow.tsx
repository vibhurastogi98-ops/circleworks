"use client";

import React, { useState, useEffect, useRef } from "react";

/**
 * Custom hook and component to animate numeric strings on scroll.
 * Extracts prefixes and suffixes to animate just the number.
 */
function CountUpNumber({ endString }: { endString: string }) {
  const elementRef = useRef<HTMLSpanElement>(null);
  
  // Set initial default value to 0 with matching prefix/suffix
  const parseMatch = endString.match(/([0-9.,]+)/);
  const initialDisplay = parseMatch 
    ? endString.replace(parseMatch[0], "0")
    : "0";

  const [displayValue, setDisplayValue] = useState(initialDisplay);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      // Trigger animation exclusively once when 30% of the element hits viewport
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;

        const match = endString.match(/[0-9.]+/);
        if (!match) {
          setDisplayValue(endString);
          return;
        }

        const numStr = match[0];
        const isFloat = numStr.includes('.');
        const targetNumber = parseFloat(numStr);
        const prefix = endString.substring(0, match.index);
        const suffix = endString.substring(match.index! + numStr.length);

        let startTimestamp: number | null = null;
        const duration = 2000; // 2 seconds

        const step = (timestamp: number) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          
          // easeOutCubic easing curve for smooth deceleration
          const easeOut = 1 - Math.pow(1 - progress, 3);
          let currentNum: number | string = easeOut * targetNumber;
          
          if (isFloat) {
            currentNum = currentNum.toFixed(2);
          } else {
            currentNum = Math.floor(currentNum);
          }

          setDisplayValue(`${prefix}${currentNum}${suffix}`);

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            // Guarantee exact final value string
            setDisplayValue(endString);
          }
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    
    return () => observer.disconnect();
  }, [endString]);

  return <span ref={elementRef}>{displayValue}</span>;
}

const STATS_DATA = [
  { 
    value: "50 States", 
    label: "Full USA Payroll Coverage", 
    subLabel: "+ DC, no extra charge" 
  },
  { 
    value: "$2B+", 
    label: "Creator Payroll Processed", 
    subLabel: "Trusted by 500+ agencies" 
  },
  { 
    value: "99.99%", 
    label: "Platform Uptime", 
    subLabel: "SOC 2 Certified & Secure" 
  },
  { 
    value: "<24 Hrs", 
    label: "From Signup to First Payroll Run", 
    subLabel: "Set up in record time" 
  },
];

export default function StatsSection() {
  return (
    <section className="bg-white py-16 w-full">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-12 lg:gap-y-0">
          {STATS_DATA.map((stat, idx) => {
            // Add right border divider only for desktop screens, omitting the last item
            const isLast = idx === STATS_DATA.length - 1;
            const dividerClasses = !isLast ? "lg:border-r lg:border-slate-200" : "";

            return (
              <div 
                key={idx} 
                className={`flex flex-col items-center text-center px-4 md:px-6 ${dividerClasses}`}
              >
                {/* 64px Numeric Gradient Statistic */}
                <div className="text-[64px] font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 leading-tight tracking-tight">
                  <CountUpNumber endString={stat.value} />
                </div>
                
                {/* 20px Bold Slate Title */}
                <div className="text-[20px] font-semibold text-slate-900 mt-3 mb-1.5 leading-snug">
                  {stat.label}
                </div>
                
                {/* 14px Sub-label Metadata */}
                <div className="text-[14px] text-slate-500 max-w-[220px]">
                  {stat.subLabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
