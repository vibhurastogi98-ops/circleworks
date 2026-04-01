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
    top: "50", 
    middle: "States", 
    bottom: "Full USA Payroll Coverage" 
  },
  { 
    top: "$2B+", 
    middle: "", 
    bottom: "Payroll Processed for Creators & Agencies" 
  },
  { 
    top: "99.99%", 
    middle: "", 
    bottom: "Platform Uptime, SOC 2 Certified" 
  },
  { 
    top: "<24", 
    middle: "Hrs", 
    bottom: "Average First Payroll Setup" 
  },
];

export default function StatsSection() {
  return (
    <section className="bg-white py-16 w-full">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-16 lg:gap-y-0">
          {STATS_DATA.map((stat, idx) => {
            const isLast = idx === STATS_DATA.length - 1;
            const dividerClasses = !isLast ? "lg:border-r lg:border-slate-100" : "";

            return (
              <div 
                key={idx} 
                className={`flex flex-col items-center text-center px-6 ${dividerClasses}`}
              >
                {/* Responsive Gradient Statistic Wrapper */}
                <div className="flex flex-col items-center justify-center min-h-[120px]">
                  {/* SEO Update ── 20% font size reduction ── */}
                  <div className="text-[42px] md:text-[52px] font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 leading-[0.85] tracking-tight flex flex-col items-center">
                    {stat.top && <CountUpNumber endString={stat.top} />}
                    {stat.middle && <span className="mt-[-2px]">{stat.middle}</span>}
                  </div>
                </div>
                
                {/* Slate Label with Refined Font Size */}
                <div className="text-[13px] md:text-[15px] font-bold text-[#0F172A] mt-5 max-w-[150px] leading-snug">
                  {stat.bottom}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
