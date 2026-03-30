"use client";

import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  variant?: "light" | "dark";
}

export default function Breadcrumb({ items, variant = "dark" }: BreadcrumbProps) {
  const isDark = variant === "dark";
  
  return (
    <nav className="flex items-center gap-2 text-sm font-medium">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <span className={isDark ? "text-slate-600" : "text-slate-300"}>/</span>
          )}
          {item.href && index < items.length - 1 ? (
            <Link 
              href={item.href} 
              className={`transition-colors ${
                isDark 
                ? "text-slate-400 hover:text-white" 
                : "text-slate-500 hover:text-[#0A1628]"
              }`}
            >
              {item.label}
            </Link>
          ) : (
            <span className={`font-bold ${
              isDark ? "text-white" : "text-[#0A1628]"
            }`}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
