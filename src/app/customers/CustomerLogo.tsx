import type { CustomerStory } from "./customersData";

type LogoVariant = "featured" | "grid" | "detail" | "card";

const variantClasses: Record<LogoVariant, string> = {
  featured: "h-14 w-40 text-lg",
  grid: "h-12 w-[120px] text-sm",
  detail: "h-16 w-48 text-xl",
  card: "h-12 w-36 text-base",
};

export function CustomerLogo({
  story,
  variant = "card",
  interactive = false,
  className = "",
}: {
  story: CustomerStory;
  variant?: LogoVariant;
  interactive?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-3 rounded-xl bg-white text-left font-black tracking-tight transition duration-300 ${
        variantClasses[variant]
      } ${interactive ? "grayscale group-hover:grayscale-0 hover:grayscale-0" : ""} ${className}`}
      aria-label={`${story.company} logo`}
    >
      <span
        className="flex aspect-square h-10 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white shadow-sm"
        style={{ backgroundColor: story.logoColor }}
        aria-hidden="true"
      >
        {story.logoInitials}
      </span>
      <span className="min-w-0 truncate" style={{ color: story.logoTextColor }}>
        {story.logoWordmark}
      </span>
    </div>
  );
}
