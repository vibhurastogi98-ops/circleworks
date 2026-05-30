import type { ReactNode } from "react";

type IllustrationProps = {
  className?: string;
};

function Shell({ children, className = "" }: IllustrationProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 128 128"
      aria-hidden="true"
      className={`h-32 w-32 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

export function EmployeesEmptyIllustration(props: IllustrationProps) {
  return (
    <Shell {...props}>
      <circle cx="64" cy="64" r="54" fill="#EFF6FF" />
      <circle cx="48" cy="49" r="15" fill="#2563EB" />
      <circle cx="82" cy="54" r="12" fill="#10B981" />
      <path d="M25 103c5-20 18-31 35-31s31 11 36 31" fill="#DBEAFE" />
      <path d="M65 101c4-16 15-25 29-25 12 0 21 8 25 25" fill="#D1FAE5" />
    </Shell>
  );
}

export function PayrollEmptyIllustration(props: IllustrationProps) {
  return (
    <Shell {...props}>
      <rect x="23" y="28" width="82" height="72" rx="12" fill="#EFF6FF" />
      <path d="M38 50h52M38 66h36M38 82h46" stroke="#1D4ED8" strokeWidth="6" strokeLinecap="round" />
      <circle cx="94" cy="92" r="20" fill="#10B981" />
      <path d="M94 80v24M86 88h13a6 6 0 0 1 0 12H88" stroke="white" strokeWidth="5" strokeLinecap="round" />
    </Shell>
  );
}

export function HiringEmptyIllustration(props: IllustrationProps) {
  return (
    <Shell {...props}>
      <rect x="29" y="37" width="70" height="60" rx="10" fill="#EEF2FF" />
      <path d="M48 37v-7a8 8 0 0 1 8-8h16a8 8 0 0 1 8 8v7" stroke="#4F46E5" strokeWidth="6" />
      <path d="M45 61h38M45 77h26" stroke="#2563EB" strokeWidth="6" strokeLinecap="round" />
      <circle cx="96" cy="91" r="17" fill="#10B981" />
      <path d="M96 82v18M87 91h18" stroke="white" strokeWidth="5" strokeLinecap="round" />
    </Shell>
  );
}

export function CandidatesEmptyIllustration(props: IllustrationProps) {
  return (
    <Shell {...props}>
      <circle cx="59" cy="55" r="28" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="6" />
      <path d="m80 78 23 23" stroke="#0F172A" strokeWidth="8" strokeLinecap="round" />
      <circle cx="53" cy="48" r="9" fill="#2563EB" />
      <path d="M36 72c4-12 12-18 24-18s20 6 24 18" fill="#DBEAFE" />
    </Shell>
  );
}

export function ExpensesEmptyIllustration(props: IllustrationProps) {
  return (
    <Shell {...props}>
      <rect x="33" y="24" width="62" height="82" rx="10" fill="#EEF2FF" />
      <path d="M47 49h34M47 64h34M47 79h21" stroke="#4F46E5" strokeWidth="6" strokeLinecap="round" />
      <path d="M91 29 76 44" stroke="#10B981" strokeWidth="7" strokeLinecap="round" />
      <circle cx="93" cy="88" r="16" fill="#F59E0B" />
      <path d="M86 88h14" stroke="white" strokeWidth="5" strokeLinecap="round" />
    </Shell>
  );
}

export function PtoEmptyIllustration(props: IllustrationProps) {
  return (
    <Shell {...props}>
      <rect x="25" y="32" width="78" height="70" rx="12" fill="#ECFEFF" />
      <path d="M25 54h78M45 24v18M83 24v18" stroke="#0891B2" strokeWidth="6" strokeLinecap="round" />
      <path d="M48 74h8M64 74h8M80 74h8M48 88h8M64 88h8" stroke="#0E7490" strokeWidth="6" strokeLinecap="round" />
    </Shell>
  );
}

export function NotificationsEmptyIllustration(props: IllustrationProps) {
  return (
    <Shell {...props}>
      <circle cx="64" cy="64" r="50" fill="#EFF6FF" />
      <path d="M42 77h44l-6-9V54a16 16 0 0 0-32 0v14l-6 9Z" fill="#2563EB" />
      <path d="M56 84a9 9 0 0 0 16 0" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
      <path d="m88 34 6-9M98 45l11-3M29 45l-10-3" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
    </Shell>
  );
}

export function SearchEmptyIllustration(props: IllustrationProps) {
  return (
    <Shell {...props}>
      <circle cx="57" cy="56" r="29" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="7" />
      <path d="m79 78 24 24" stroke="#2563EB" strokeWidth="8" strokeLinecap="round" />
      <path d="M45 55h24" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
    </Shell>
  );
}

export function NotFoundIllustration(props: IllustrationProps) {
  return (
    <Shell {...props}>
      <circle cx="57" cy="56" r="30" fill="#E0F2FE" stroke="#0A1628" strokeWidth="7" />
      <path d="m80 79 25 25" stroke="#0A1628" strokeWidth="9" strokeLinecap="round" />
      <path d="M45 55h24" stroke="#0A1628" strokeWidth="6" strokeLinecap="round" />
      <path d="M57 43v4" stroke="#0A1628" strokeWidth="6" strokeLinecap="round" />
      <path d="M57 65v1" stroke="#0A1628" strokeWidth="7" strokeLinecap="round" />
    </Shell>
  );
}
