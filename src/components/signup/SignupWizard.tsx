"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Eye,
  EyeOff,
  FileText,
  HeartPulse,
  Loader2,
  Mail,
  Plus,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import type { Provider } from "@supabase/supabase-js";
import type { PlaidLinkOnSuccessMetadata } from "react-plaid-link";
import { usePlaidLink } from "react-plaid-link";
import { z } from "zod";

import { createSupabaseBrowserClient } from "@/lib/supabase";

const DRAFT_KEY = "signup_in_progress";
const FULL_FLOW_STEP_COUNT = 8;

const TESTIMONIALS = [
  {
    quote:
      "CircleWorks helped us replace disconnected payroll, HR, and benefits workflows with one clean operating system.",
    name: "Avery Morgan",
    role: "People Ops, Meridian Health",
    initials: "AM",
  },
  {
    quote:
      "We opened payroll in three states without adding another admin hire. The setup flow made every next step obvious.",
    name: "Priya Shah",
    role: "COO, Northstar Labs",
    initials: "PS",
  },
  {
    quote:
      "Our first run was approved in minutes, and the compliance defaults saved us from a dozen spreadsheets.",
    name: "Marcus Lee",
    role: "Founder, Bluebird Retail",
    initials: "ML",
  },
];

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
  "District of Columbia",
];

const COMPANY_SIZES = ["1–10", "11–50", "51–250", "251–1,000", "1,000+"];
const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Retail",
  "Professional Services",
  "Construction",
  "Non-Profit",
  "Other",
];

const FEDERAL_HOLIDAYS = [
  "2026-01-01",
  "2026-01-19",
  "2026-02-16",
  "2026-05-25",
  "2026-06-19",
  "2026-07-03",
  "2026-09-07",
  "2026-10-12",
  "2026-11-11",
  "2026-11-26",
  "2026-12-25",
  "2027-01-01",
  "2027-01-18",
  "2027-02-15",
  "2027-05-31",
  "2027-06-18",
  "2027-07-05",
  "2027-09-06",
  "2027-10-11",
  "2027-11-11",
  "2027-11-25",
  "2027-12-24",
];

const PAY_SCHEDULES = [
  {
    value: "bi-weekly",
    label: "Bi-Weekly",
    detail: "Every 2 weeks",
    icon: CalendarDays,
  },
  {
    value: "semi-monthly",
    label: "Semi-Monthly",
    detail: "Twice monthly",
    icon: CircleDollarSign,
  },
  {
    value: "weekly",
    label: "Weekly",
    detail: "Every week",
    icon: Mail,
  },
  {
    value: "monthly",
    label: "Monthly",
    detail: "Once a month",
    icon: BriefcaseBusiness,
  },
] as const;

type PaySchedule = (typeof PAY_SCHEDULES)[number]["value"];
type SignupProvider = Extract<Provider, "google" | "azure">;
type SignupMode = "email" | "google" | "microsoft";
type AccountType = "company" | "agency" | "creator";
type CreatorEntityType = "sole_prop" | "smllc" | "mmllc" | "s_corp" | "";
type CompanyEntityType = "sole_prop" | "smllc" | "mmllc" | "s_corp" | "c_corp" | "none" | "";
type FundingMethod = "plaid" | "manual" | "";
type AdminRole = "owner" | "admin";
type AgencyType = "staffing" | "creative" | "marketing" | "talent" | "";
type AgencyWorkerGroup = "staff" | "contractors";
type AgencyWorkerType = "w2" | "contractor";

const ACCOUNT_TYPES = [
  {
    value: "company",
    title: "Company",
    description: "Run W-2 payroll, HR, benefits, and compliance for your team.",
    icon: Building2,
  },
  {
    value: "agency",
    title: "Agency",
    description: "Manage payroll, people, clients, and contractor operations.",
    icon: BriefcaseBusiness,
  },
  {
    value: "creator",
    title: "Creator / Solo",
    description: "Set up your owner profile and contractor count without team payroll.",
    icon: UserRound,
  },
] as const;

const CREATOR_ENTITY_TYPES = [
  { value: "sole_prop", label: "Sole Prop" },
  { value: "smllc", label: "Single-member LLC" },
  { value: "mmllc", label: "Multi-member LLC" },
  { value: "s_corp", label: "S-Corp" },
] as const;

const COMPANY_ENTITY_TYPES = [
  { value: "sole_prop", label: "Sole proprietorship" },
  { value: "smllc", label: "Single-member LLC" },
  { value: "mmllc", label: "Multi-member LLC" },
  { value: "s_corp", label: "S corp" },
  { value: "c_corp", label: "C corp" },
  { value: "none", label: "Not sure yet" },
] as const;

const AGENCY_TYPES = [
  { value: "staffing", label: "Staffing" },
  { value: "creative", label: "Creative" },
  { value: "marketing", label: "Marketing" },
  { value: "talent", label: "Talent" },
] as const;

const AGENCY_WORKER_GROUPS = [
  { value: "staff", label: "Internal W-2 staff" },
  { value: "contractors", label: "Contractors" },
] as const;

const DEFAULT_AGENCY_PAY_SCHEDULES = [
  {
    id: "contractors",
    workerGroup: "contractors" as const,
    frequency: "weekly" as const,
    firstPayDate: "",
  },
  {
    id: "staff",
    workerGroup: "staff" as const,
    frequency: "bi-weekly" as const,
    firstPayDate: "",
  },
];

type BankFundingData = {
  method: FundingMethod;
  institutionName: string;
  accountType: "checking" | "savings";
  accountMask: string;
  routingMask: string;
  bankAccountToken: string;
  verified: boolean;
};

type WizardData = {
  account: {
    accountType: AccountType | "";
  };
  step1: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreedToTerms: boolean;
    role: AdminRole;
  };
  companyBusiness: {
    legalName: string;
    dba: string;
    ein: string;
    entityType: CompanyEntityType;
    industry: string;
    employeeCount: string;
    workStates: string[];
  };
  companyBankFunding: BankFundingData;
  companyTaxSetup: {
    federalEinConfirmed: boolean;
    stateTaxIdText: string;
    registrationStates: string[];
  };
  companyPaySchedule: {
    frequency: PaySchedule | "";
    firstPayDate: string;
    payPeriodStart: string;
    payPeriodEnd: string;
  };
  companyInvites: {
    emails: string;
    skip: boolean;
  };
  agencyDetails: {
    legalName: string;
    ein: string;
    agencyType: AgencyType;
    internalStaffCount: string;
    contractorCount: string;
  };
  agencyBankFunding: BankFundingData;
  agencyTaxSetup: {
    federalEinConfirmed: boolean;
    stateTaxIdText: string;
  };
  agencyFirstClient: {
    skip: boolean;
    clientName: string;
    projectName: string;
    workerType: AgencyWorkerType;
    payRate: string;
    billRate: string;
  };
  agencyPaySchedules: {
    schedules: Array<{
      id: string;
      workerGroup: AgencyWorkerGroup;
      frequency: PaySchedule | "";
      firstPayDate: string;
    }>;
  };
  step2: {
    companyName: string;
    companySize: string;
    industry: string;
    primaryState: string;
    multipleStates: boolean;
  };
  step3: {
    ein: string;
    paySchedule: PaySchedule | "";
    firstPayrollDate: string;
    skipPayroll: boolean;
  };
  step4: {
    isAdminEmployee: boolean;
    firstName: string;
    lastName: string;
    workEmail: string;
    jobTitle: string;
    startDate: string;
    payType: "salary" | "hourly";
    payRate: string;
    skip: boolean;
  };
  creator: {
    entityType: CreatorEntityType;
    paySelfAsOwner: boolean;
    contractorCount: number;
  };
  creatorIdentity: {
    legalName: string;
    businessName: string;
    ein: string;
    homeState: string;
    workState: string;
  };
  creatorBankFunding: BankFundingData;
};

const INITIAL_DATA: WizardData = {
  account: {
    accountType: "",
  },
  step1: {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
    role: "owner",
  },
  companyBusiness: {
    legalName: "",
    dba: "",
    ein: "",
    entityType: "",
    industry: "",
    employeeCount: "",
    workStates: [],
  },
  companyBankFunding: {
    method: "",
    institutionName: "",
    accountType: "checking",
    accountMask: "",
    routingMask: "",
    bankAccountToken: "",
    verified: false,
  },
  companyTaxSetup: {
    federalEinConfirmed: false,
    stateTaxIdText: "",
    registrationStates: [],
  },
  companyPaySchedule: {
    frequency: "",
    firstPayDate: "",
    payPeriodStart: "",
    payPeriodEnd: "",
  },
  companyInvites: {
    emails: "",
    skip: false,
  },
  agencyDetails: {
    legalName: "",
    ein: "",
    agencyType: "",
    internalStaffCount: "",
    contractorCount: "",
  },
  agencyBankFunding: {
    method: "",
    institutionName: "",
    accountType: "checking",
    accountMask: "",
    routingMask: "",
    bankAccountToken: "",
    verified: false,
  },
  agencyTaxSetup: {
    federalEinConfirmed: false,
    stateTaxIdText: "",
  },
  agencyFirstClient: {
    skip: false,
    clientName: "",
    projectName: "",
    workerType: "contractor",
    payRate: "",
    billRate: "",
  },
  agencyPaySchedules: {
    schedules: DEFAULT_AGENCY_PAY_SCHEDULES.map((schedule) => ({ ...schedule })),
  },
  step2: {
    companyName: "",
    companySize: "",
    industry: "",
    primaryState: "",
    multipleStates: false,
  },
  step3: {
    ein: "",
    paySchedule: "",
    firstPayrollDate: "",
    skipPayroll: false,
  },
  step4: {
    isAdminEmployee: true,
    firstName: "",
    lastName: "",
    workEmail: "",
    jobTitle: "Founder",
    startDate: "",
    payType: "salary",
    payRate: "",
    skip: false,
  },
  creator: {
    entityType: "",
    paySelfAsOwner: true,
    contractorCount: 0,
  },
  creatorIdentity: {
    legalName: "",
    businessName: "",
    ein: "",
    homeState: "",
    workState: "",
  },
  creatorBankFunding: {
    method: "",
    institutionName: "",
    accountType: "checking",
    accountMask: "",
    routingMask: "",
    bankAccountToken: "",
    verified: false,
  },
};

const inputBase =
  "h-12 w-full rounded-lg border bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-100 lg:h-10";
const selectBase =
  "h-12 w-full rounded-lg border bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-100 lg:h-10";
const labelBase = "mb-1.5 block text-sm font-bold text-slate-800 lg:mb-1 lg:text-xs";
const errorBase = "mt-1.5 text-sm font-medium text-red-600 lg:mt-1 lg:text-xs";

const accountTypeSchema = z
  .object({
    accountType: z.enum(["company", "agency", "creator"]).or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (!data.accountType) {
      ctx.addIssue({
        code: "custom",
        path: ["accountType"],
        message: "Choose the account type that best fits your setup",
      });
    }
  });

const hiddenBooleanSchema = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean());

const step1Schema = z
  .object({
    fullName: z.string().trim().min(2, "Full name is required"),
    email: z.string().trim().email("Enter a valid work email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    agreedToTerms: z.boolean().refine((value) => value, {
      message: "You must agree to the Terms of Service and Privacy Policy",
    }),
    role: z.enum(["owner", "admin"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const companyBusinessSchema = z.object({
  legalName: z.string().trim().min(2, "Legal business name is required"),
  dba: z.string().trim(),
  ein: z
    .string()
    .min(10, "EIN is required")
    .regex(/^\d{2}-\d{7}$/, "EIN must be formatted as XX-XXXXXXX"),
  entityType: z.enum(["sole_prop", "smllc", "mmllc", "s_corp", "c_corp", "none"]).or(z.literal("")),
  industry: z.string().min(1, "Select an industry"),
  employeeCount: z.string().trim().min(1, "Employee count is required"),
  workStates: z.array(z.string()).min(1, "Select at least one work state"),
}).superRefine((data, ctx) => {
  if (!data.entityType) {
    ctx.addIssue({
      code: "custom",
      path: ["entityType"],
      message: "Select an entity type",
    });
  }

  const employeeCount = Number(data.employeeCount);
  if (!Number.isInteger(employeeCount) || employeeCount < 1) {
    ctx.addIssue({
      code: "custom",
      path: ["employeeCount"],
      message: "Enter at least 1 employee",
    });
  }
});

const companyBankFundingSchema = z.object({
  method: z.enum(["plaid", "manual"]).or(z.literal("")),
  institutionName: z.string().trim(),
  accountType: z.enum(["checking", "savings"]),
  accountMask: z.string(),
  routingMask: z.string(),
  bankAccountToken: z.string(),
  verified: hiddenBooleanSchema,
}).superRefine((data, ctx) => {
  if (!data.method) {
    ctx.addIssue({
      code: "custom",
      path: ["method"],
      message: "Choose a funding method",
    });
    return;
  }

  if (!data.bankAccountToken || !data.accountMask || !data.routingMask) {
    ctx.addIssue({
      code: "custom",
      path: ["method"],
      message: "Complete bank verification before continuing",
    });
  }
});

const companyTaxSetupSchema = z.object({
  federalEinConfirmed: z.boolean().refine((value) => value, {
    message: "Confirm the federal EIN before continuing",
  }),
  stateTaxIdText: z.string(),
  registrationStates: z.array(z.string()),
});

const companyPayScheduleSchema = z
  .object({
    frequency: z.enum(["bi-weekly", "semi-monthly", "weekly", "monthly", ""]),
    firstPayDate: z.string(),
    payPeriodStart: z.string(),
    payPeriodEnd: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!data.frequency) {
      ctx.addIssue({
        code: "custom",
        path: ["frequency"],
        message: "Select a pay frequency",
      });
    }

    if (!data.firstPayDate) {
      ctx.addIssue({
        code: "custom",
        path: ["firstPayDate"],
        message: "Choose a first pay date",
      });
    } else if (data.firstPayDate < getMinPayrollDate()) {
      ctx.addIssue({
        code: "custom",
        path: ["firstPayDate"],
        message: "First pay date must be at least 4 business days from today",
      });
    }

    if (!data.payPeriodStart) {
      ctx.addIssue({
        code: "custom",
        path: ["payPeriodStart"],
        message: "Choose a pay period start",
      });
    }

    if (!data.payPeriodEnd) {
      ctx.addIssue({
        code: "custom",
        path: ["payPeriodEnd"],
        message: "Choose a pay period end",
      });
    } else if (data.payPeriodStart && data.payPeriodEnd < data.payPeriodStart) {
      ctx.addIssue({
        code: "custom",
        path: ["payPeriodEnd"],
        message: "Pay period end must be after the start date",
      });
    }
  });

const companyInvitesSchema = z
  .object({
    emails: z.string(),
    skip: hiddenBooleanSchema,
  })
  .superRefine((data, ctx) => {
    if (data.skip) return;

    const emails = parseInviteEmails(data.emails);
    if (emails.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["emails"],
        message: "Enter at least one employee email or skip for later",
      });
      return;
    }

    const invalid = emails.find((email) => !z.string().email().safeParse(email).success);
    if (invalid) {
      ctx.addIssue({
        code: "custom",
        path: ["emails"],
        message: `${invalid} is not a valid email`,
      });
    }
  });

const agencyDetailsSchema = z
  .object({
    legalName: z.string().trim().min(2, "Agency legal name is required"),
    ein: z
      .string()
      .min(10, "EIN is required")
      .regex(/^\d{2}-\d{7}$/, "EIN must be formatted as XX-XXXXXXX"),
    agencyType: z.enum(["staffing", "creative", "marketing", "talent"]).or(z.literal("")),
    internalStaffCount: z.string().trim(),
    contractorCount: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    if (!data.agencyType) {
      ctx.addIssue({
        code: "custom",
        path: ["agencyType"],
        message: "Select an agency type",
      });
    }

    const internalStaffCount = Number(data.internalStaffCount);
    if (!Number.isInteger(internalStaffCount) || internalStaffCount < 0) {
      ctx.addIssue({
        code: "custom",
        path: ["internalStaffCount"],
        message: "Enter the number of internal W-2 staff",
      });
    }

    const contractorCount = Number(data.contractorCount);
    if (!Number.isInteger(contractorCount) || contractorCount < 0) {
      ctx.addIssue({
        code: "custom",
        path: ["contractorCount"],
        message: "Enter the number of contractors",
      });
    }
  });

const agencyTaxSetupSchema = z.object({
  federalEinConfirmed: z.boolean().refine((value) => value, {
    message: "Confirm the federal EIN before continuing",
  }),
  stateTaxIdText: z.string().trim().min(1, "Add state tax IDs or registration notes"),
});

const agencyFirstClientSchema = z
  .object({
    skip: hiddenBooleanSchema,
    clientName: z.string(),
    projectName: z.string(),
    workerType: z.enum(["w2", "contractor"]),
    payRate: z.string(),
    billRate: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.skip) return;

    if (data.clientName.trim().length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["clientName"],
        message: "Client name is required",
      });
    }

    if (data.projectName.trim().length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["projectName"],
        message: "Project name is required",
      });
    }

    const payRate = getCurrencyAmount(data.payRate);
    const billRate = getCurrencyAmount(data.billRate);
    if (payRate <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["payRate"],
        message: "Enter the worker pay rate",
      });
    }

    if (billRate <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["billRate"],
        message: "Enter the client bill rate",
      });
    } else if (payRate > 0 && billRate < payRate) {
      ctx.addIssue({
        code: "custom",
        path: ["billRate"],
        message: "Bill rate should be at least the pay rate",
      });
    }
  });

const agencyPaySchedulesSchema = z
  .object({
    schedules: z
      .array(
        z.object({
          id: z.string(),
          workerGroup: z.enum(["staff", "contractors"]),
          frequency: z.enum(["bi-weekly", "semi-monthly", "weekly", "monthly", ""]),
          firstPayDate: z.string(),
        }),
      )
      .min(1, "Add at least one pay schedule"),
  })
  .superRefine((data, ctx) => {
    data.schedules.forEach((schedule, index) => {
      if (!schedule.frequency) {
        ctx.addIssue({
          code: "custom",
          path: ["schedules", index, "frequency"],
          message: "Select a pay frequency",
        });
      }

      if (!schedule.firstPayDate) {
        ctx.addIssue({
          code: "custom",
          path: ["schedules", index, "firstPayDate"],
          message: "Choose a first pay date",
        });
      } else if (schedule.firstPayDate < getMinPayrollDate()) {
        ctx.addIssue({
          code: "custom",
          path: ["schedules", index, "firstPayDate"],
          message: "First pay date must be at least 4 business days from today",
        });
      }
    });
  });

const step2Schema = z.object({
  companyName: z.string().trim().min(2, "Company legal name is required"),
  companySize: z.string().min(1, "Select a company size"),
  industry: z.string().min(1, "Select an industry"),
  primaryState: z.string().min(1, "Select a primary state"),
  multipleStates: z.boolean(),
});

const step3Schema = z
  .object({
    ein: z.string(),
    paySchedule: z.enum(["bi-weekly", "semi-monthly", "weekly", "monthly", ""]),
    firstPayrollDate: z.string(),
    skipPayroll: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.skipPayroll) return;

    if (!data.ein) {
      ctx.addIssue({
        code: "custom",
        path: ["ein"],
        message: "EIN is required",
      });
    } else if (!/^\d{2}-\d{7}$/.test(data.ein)) {
      ctx.addIssue({
        code: "custom",
        path: ["ein"],
        message: "EIN must be formatted as XX-XXXXXXX",
      });
    }

    if (!data.paySchedule) {
      ctx.addIssue({
        code: "custom",
        path: ["paySchedule"],
        message: "Select a pay schedule",
      });
    }

    if (!data.firstPayrollDate) {
      ctx.addIssue({
        code: "custom",
        path: ["firstPayrollDate"],
        message: "Choose a first payroll date",
      });
      return;
    }

    if (data.firstPayrollDate < getMinPayrollDate()) {
      ctx.addIssue({
        code: "custom",
        path: ["firstPayrollDate"],
        message: "First payroll date must be at least 4 business days from today",
      });
    }
  });

const step4Schema = z
  .object({
    isAdminEmployee: z.boolean(),
    firstName: z.string(),
    lastName: z.string(),
    workEmail: z.string(),
    jobTitle: z.string(),
    startDate: z.string(),
    payType: z.enum(["salary", "hourly"]),
    payRate: z.string(),
    skip: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.skip) return;

    if (data.firstName.trim().length < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["firstName"],
        message: "First name is required",
      });
    }

    if (data.lastName.trim().length < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["lastName"],
        message: "Last name is required",
      });
    }

    const emailResult = z.string().email().safeParse(data.workEmail.trim());
    if (!emailResult.success) {
      ctx.addIssue({
        code: "custom",
        path: ["workEmail"],
        message: "Enter a valid work email",
      });
    }

    if (!data.jobTitle.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["jobTitle"],
        message: "Job title is required",
      });
    }

    if (!data.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "Start date is required",
      });
    }

    const numericRate = Number(data.payRate.replace(/[$,\s]/g, ""));
    if (!Number.isFinite(numericRate) || numericRate <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["payRate"],
        message: "Enter a pay rate",
      });
    }
  });

const creatorSchema = z
  .object({
    entityType: z.enum(["sole_prop", "smllc", "mmllc", "s_corp"]).or(z.literal("")),
    paySelfAsOwner: z.boolean(),
    contractorCount: z
      .number({
        message: "Enter the number of contractors",
      })
      .int("Use a whole number")
      .min(0, "Contractor count cannot be negative")
      .max(999, "Enter fewer than 1,000 contractors"),
  })
  .superRefine((data, ctx) => {
    if (!data.entityType) {
      ctx.addIssue({
        code: "custom",
        path: ["entityType"],
        message: "Select your entity type",
      });
    }
  });

const creatorIdentitySchema = z
  .object({
    legalName: z.string().trim().min(2, "Legal name is required"),
    businessName: z.string().trim().min(2, "Business name is required"),
    ein: z.string(),
    homeState: z.string().min(1, "Select your home state"),
    workState: z.string().min(1, "Select your work state"),
  })
  .superRefine((data, ctx) => {
    if (!data.ein.trim()) return;

    if (!/^\d{2}-\d{7}$/.test(data.ein)) {
      ctx.addIssue({
        code: "custom",
        path: ["ein"],
        message: "EIN must be formatted as XX-XXXXXXX",
      });
    }
  });

type AccountTypeValues = z.infer<typeof accountTypeSchema>;
type Step1Values = z.infer<typeof step1Schema>;
type CompanyBusinessValues = z.infer<typeof companyBusinessSchema>;
type CompanyBankFundingFormValues = z.input<typeof companyBankFundingSchema>;
type CompanyBankFundingValues = z.output<typeof companyBankFundingSchema>;
type CompanyTaxSetupValues = z.infer<typeof companyTaxSetupSchema>;
type CompanyPayScheduleValues = z.infer<typeof companyPayScheduleSchema>;
type CompanyInvitesFormValues = z.input<typeof companyInvitesSchema>;
type CompanyInvitesValues = z.output<typeof companyInvitesSchema>;
type AgencyDetailsValues = z.infer<typeof agencyDetailsSchema>;
type AgencyTaxSetupValues = z.infer<typeof agencyTaxSetupSchema>;
type AgencyFirstClientFormValues = z.input<typeof agencyFirstClientSchema>;
type AgencyFirstClientValues = z.output<typeof agencyFirstClientSchema>;
type AgencyPaySchedulesValues = z.infer<typeof agencyPaySchedulesSchema>;
type Step2Values = z.infer<typeof step2Schema>;
type Step3Values = z.infer<typeof step3Schema>;
type Step4Values = z.infer<typeof step4Schema>;
type CreatorValues = z.infer<typeof creatorSchema>;
type CreatorIdentityValues = z.infer<typeof creatorIdentitySchema>;

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (!password) return { score: 0, label: "", color: "bg-slate-200" };
  if (score <= 2) return { score: 1, label: "Weak", color: "bg-red-500" };
  if (score === 3) return { score: 2, label: "Fair", color: "bg-amber-500" };
  if (score === 4) return { score: 3, label: "Strong", color: "bg-blue-500" };
  return { score: 4, label: "Very Strong", color: "bg-green-500" };
}

function isFederalHoliday(date: Date) {
  return FEDERAL_HOLIDAYS.includes(formatDateInput(date));
}

function addBusinessDays(date: Date, days: number) {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6 && !isFederalHoliday(result)) added += 1;
  }
  return result;
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMinPayrollDate() {
  return formatDateInput(addBusinessDays(new Date(), 4));
}

function formatEin(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  return digits.length > 2 ? `${digits.slice(0, 2)}-${digits.slice(2)}` : digits;
}

function maskEin(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 4 ? `**-***${digits.slice(-4)}` : "";
}

function last4(value: string) {
  return value.replace(/\D/g, "").slice(-4);
}

function getCurrencyAmount(value: string) {
  const amount = Number(value.replace(/[$,\s]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
}

function createBankToken(method: Exclude<FundingMethod, "">) {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "")
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

  return `bank_${method}_${randomPart.slice(0, 32)}`;
}

function createLocalId(prefix: string) {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

  return `${prefix}_${randomPart}`;
}

function parseInviteEmails(value: string) {
  return value
    .split(/[\n,;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function formatEmailsSummary(value: string) {
  const emails = parseInviteEmails(value);
  if (emails.length === 0) return "No invitations queued";
  if (emails.length === 1) return emails[0];
  return `${emails.length} invitations queued`;
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

function fieldClass(hasError: boolean) {
  return `${inputBase} ${hasError ? "border-red-400 bg-red-50" : "border-slate-300"}`;
}

function selectClass(hasError: boolean) {
  return `${selectBase} ${hasError ? "border-red-400 bg-red-50" : "border-slate-300"}`;
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <span className="grid h-5 w-5 shrink-0 grid-cols-2 gap-0.5" aria-hidden="true">
      <span className="bg-[#F25022]" />
      <span className="bg-[#7FBA00]" />
      <span className="bg-[#00A4EF]" />
      <span className="bg-[#FFB900]" />
    </span>
  );
}

function CircleWorksLogo() {
  return (
    <span className="inline-flex items-center gap-3">
      <svg width="34" height="34" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="3" />
        <path
          d="M18 9.5a8.5 8.5 0 0 0 0 17"
          stroke="#3B82F6"
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
      <span className="text-2xl font-black">CircleWorks</span>
    </span>
  );
}

function InlineError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" aria-live="polite" className={errorBase}>
      {message}
    </p>
  );
}

function isFullFlow(accountType: AccountType | "") {
  return accountType === "company" || accountType === "agency" || !accountType;
}

function getFlowSteps(accountType: AccountType | "") {
  if (accountType === "company") {
    return [
      { title: "Type", detail: "Choose workspace" },
      { title: "Business", detail: "Company details" },
      { title: "Admin", detail: "Owner account" },
      { title: "Bank", detail: "Funding source" },
      { title: "Taxes", detail: "Federal & state" },
      { title: "Schedule", detail: "Pay calendar" },
      { title: "Invite", detail: "Employees" },
      { title: "Review", detail: "Finish setup" },
    ];
  }

  if (accountType === "creator") {
    return [
      { title: "Type", detail: "Choose workspace" },
      { title: "Account", detail: "Create your login" },
      { title: "Creator", detail: "Entity setup" },
      { title: "Identity", detail: "Business details" },
      { title: "Bank", detail: "Funding source" },
      { title: "Review", detail: "Finish setup" },
    ];
  }

  if (accountType === "agency") {
    return [
      { title: "Type", detail: "Choose workspace" },
      { title: "Agency", detail: "Agency details" },
      { title: "Admin", detail: "Owner account" },
      { title: "Bank", detail: "Funding source" },
      { title: "Taxes", detail: "Federal & state" },
      { title: "Client", detail: "First project" },
      { title: "Schedules", detail: "Worker pay" },
      { title: "Review", detail: "Finish setup" },
    ];
  }

  return [
    { title: "Type", detail: "Choose workspace" },
    { title: "Account", detail: "Create your login" },
    { title: "Company", detail: "Legal profile" },
    { title: "Payroll", detail: "Schedule basics" },
    { title: "Employees", detail: "First team member" },
    { title: "Ready", detail: "Launch CircleWorks" },
  ];
}

function getSuccessStep(accountType: AccountType | "") {
  return getFlowSteps(accountType).length - 1;
}

function StepProgress({ step, accountType }: { step: number; accountType: AccountType | "" }) {
  const steps = getFlowSteps(accountType);
  const displayStep = Math.min(step, steps.length - 1);
  const progress = ((displayStep + 1) / steps.length) * 100;

  return (
    <div className="mb-8 lg:mb-5">
      <div className="h-1 overflow-hidden rounded-full bg-slate-100" aria-label="Signup progress">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-500 lg:mt-2 lg:text-xs">
        Step {displayStep + 1} of {steps.length}
      </p>
    </div>
  );
}

function LeftStepRail({ step, accountType }: { step: number; accountType: AccountType | "" }) {
  const steps = getFlowSteps(accountType);

  return (
    <ol className="space-y-2.5">
      {steps.map((wizardStep, index) => {
        const complete = index < step;
        const active = index === step;
        return (
          <li key={wizardStep.title} className="flex items-center gap-3">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold xl:h-8 xl:w-8 xl:text-sm ${
                complete
                  ? "bg-green-500 text-white"
                  : active
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-white/55"
              }`}
            >
              {complete ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
            </span>
            <span>
              <span className={`block text-[13px] font-bold ${active ? "text-white" : "text-white/70"}`}>
                {wizardStep.title}
              </span>
              <span className="block text-[11px] leading-4 text-white/45">{wizardStep.detail}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function RotatingTestimonial() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % TESTIMONIALS.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  const testimonial = TESTIMONIALS[index];

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key={testimonial.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="space-y-3.5"
        >
          <p className="max-w-md text-[13px] leading-5 text-blue-100">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
          <div className="flex items-center gap-3 border-t border-white/15 pt-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-sm font-bold">
              {testimonial.initials}
            </span>
            <span>
              <span className="block text-sm font-bold leading-5">{testimonial.name}</span>
              <span className="block text-xs leading-5 text-blue-100">{testimonial.role}</span>
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AccountTypeForm({
  data,
  onComplete,
}: {
  data: WizardData["account"];
  onComplete: (data: WizardData["account"]) => void;
}) {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountTypeValues>({
    resolver: zodResolver(accountTypeSchema),
    defaultValues: data,
  });
  const accountType = watch("accountType");

  return (
    <form onSubmit={handleSubmit((values) => onComplete(values as WizardData["account"]))} noValidate className="space-y-5 lg:space-y-4">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">
          What are you setting up?
        </h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          Choose the workspace type so signup only asks for what you need.
        </p>
      </header>

      <fieldset>
        <legend className="sr-only">Account type</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {ACCOUNT_TYPES.map(({ value, title, description, icon: Icon }) => {
            const active = accountType === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setValue("accountType", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className={`min-h-40 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:min-h-32 ${
                  active
                    ? "border-blue-600 bg-blue-50 shadow-sm"
                    : "border-slate-300 bg-white hover:bg-slate-50"
                }`}
                aria-pressed={active}
              >
                <span
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${
                    active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="block text-base font-bold text-slate-950">{title}</span>
                <span className="mt-2 block text-sm leading-5 text-slate-500">{description}</span>
              </button>
            );
          })}
        </div>
        <InlineError id="accountType-error" message={errors.accountType?.message} />
      </fieldset>

      <WizardActions />
    </form>
  );
}

function Step1Form({
  data,
  onComplete,
  onOAuth,
  oauthLoading,
}: {
  data: WizardData["step1"];
  onComplete: (data: WizardData["step1"]) => void;
  onOAuth: (provider: SignupProvider) => void;
  oauthLoading: SignupProvider | null;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    setFocus,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: data,
  });

  const password = watch("password");
  const agreedToTerms = watch("agreedToTerms");
  const role = watch("role");
  const strength = getPasswordStrength(password);

  const handleOAuthClick = (provider: SignupProvider) => {
    if (!agreedToTerms) {
      setError("agreedToTerms", {
        type: "manual",
        message: "You must agree to the Terms of Service and Privacy Policy",
      });
      setFocus("agreedToTerms");
      return;
    }

    onOAuth(provider);
  };

  return (
    <form onSubmit={handleSubmit(onComplete)} noValidate className="space-y-5 lg:space-y-3">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">Create your account</h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          Start your CircleWorks workspace in a few minutes.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleOAuthClick("google")}
          disabled={oauthLoading !== null}
          className="flex h-12 items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60 lg:h-10"
        >
          {oauthLoading === "google" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <GoogleLogo />
          )}
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => handleOAuthClick("azure")}
          disabled={oauthLoading !== null}
          className="flex h-12 items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60 lg:h-10"
        >
          {oauthLoading === "azure" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <MicrosoftLogo />
          )}
          Continue with Microsoft
        </button>
      </div>

      <div className="flex items-center gap-3 text-sm font-semibold text-slate-400 lg:text-xs">
        <span className="h-px flex-1 bg-slate-200" />
        <span>— or sign up with email —</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-3">
        <div>
          <label htmlFor="fullName" className={labelBase}>
            Full name
          </label>
          <input
            id="fullName"
            autoFocus
            autoComplete="name"
            {...register("fullName")}
            className={fieldClass(Boolean(errors.fullName))}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
          />
          <InlineError id="fullName-error" message={errors.fullName?.message} />
        </div>

        <div>
          <label htmlFor="email" className={labelBase}>
            Work email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className={fieldClass(Boolean(errors.email))}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          <InlineError id="email-error" message={errors.email?.message} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-3">
        <div>
          <label htmlFor="password" className={labelBase}>
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("password")}
              className={`${fieldClass(Boolean(errors.password))} pr-11`}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : "password-strength"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          <div id="password-strength" className="mt-2 lg:mt-1">
            <div className="grid h-1.5 grid-cols-4 gap-1 lg:h-1">
              {[1, 2, 3, 4].map((bar) => (
                <span
                  key={bar}
                  className={`rounded-full ${
                    password && bar <= strength.score ? strength.color : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
            {password && (
              <p className="mt-1 text-xs font-bold text-slate-500 lg:text-[11px]">
                Password strength: {strength.label}
              </p>
            )}
          </div>
          <InlineError id="password-error" message={errors.password?.message} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={labelBase}>
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              {...register("confirmPassword")}
              className={`${fieldClass(Boolean(errors.confirmPassword))} pr-11`}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((visible) => !visible)}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"}
              title={showConfirm ? "Hide confirmation password" : "Show confirmation password"}
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          <InlineError id="confirmPassword-error" message={errors.confirmPassword?.message} />
        </div>
      </div>

      <fieldset>
        <legend className={labelBase}>Admin role</legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Owner", value: "owner" as const },
            { label: "Admin", value: "admin" as const },
          ].map((option) => {
            const active = role === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setValue("role", option.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className={`h-12 rounded-lg border text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:h-10 ${
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label className="flex items-start gap-3 text-sm font-medium text-slate-700">
          <input
            id="agreedToTerms"
            type="checkbox"
            {...register("agreedToTerms", {
              onChange: () => clearErrors("agreedToTerms"),
            })}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            aria-invalid={Boolean(errors.agreedToTerms)}
            aria-describedby={errors.agreedToTerms ? "terms-error" : undefined}
          />
          <span>
            I agree to{" "}
            <Link href="/terms" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-700 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-700 hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>
        <InlineError id="terms-error" message={errors.agreedToTerms?.message} />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="flex h-12 min-w-32 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 lg:h-10"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <p className="text-center text-sm italic text-slate-500 lg:text-xs">
        Start for free — no credit card required
      </p>
    </form>
  );
}

function CompanyBusinessDetailsForm({
  data,
  onComplete,
}: {
  data: WizardData["companyBusiness"];
  onComplete: (data: WizardData["companyBusiness"]) => void;
}) {
  const [stateToAdd, setStateToAdd] = useState("");
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompanyBusinessValues>({
    resolver: zodResolver(companyBusinessSchema),
    defaultValues: data,
  });
  const entityType = watch("entityType");
  const workStates = watch("workStates") ?? [];
  const availableStates = US_STATES.filter((state) => !workStates.includes(state));

  const addWorkState = () => {
    if (!stateToAdd || workStates.includes(stateToAdd)) return;
    setValue("workStates", [...workStates, stateToAdd], {
      shouldDirty: true,
      shouldValidate: true,
    });
    setStateToAdd("");
  };

  const removeWorkState = (state: string) => {
    setValue("workStates", workStates.filter((item) => item !== state), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <form onSubmit={handleSubmit((values) => onComplete(values as WizardData["companyBusiness"]))} noValidate className="space-y-5 lg:space-y-4">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">Business details</h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          These details drive employer payroll, tax, and compliance setup.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="legalName" className={labelBase}>Legal business name</label>
          <input
            id="legalName"
            autoFocus
            {...register("legalName")}
            className={fieldClass(Boolean(errors.legalName))}
            aria-invalid={Boolean(errors.legalName)}
            aria-describedby={errors.legalName ? "legalName-error" : undefined}
          />
          <InlineError id="legalName-error" message={errors.legalName?.message} />
        </div>

        <div>
          <label htmlFor="dba" className={labelBase}>DBA</label>
          <input
            id="dba"
            placeholder="Optional"
            {...register("dba")}
            className={fieldClass(Boolean(errors.dba))}
            aria-invalid={Boolean(errors.dba)}
            aria-describedby={errors.dba ? "dba-error" : undefined}
          />
          <InlineError id="dba-error" message={errors.dba?.message} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="companyEin" className={labelBase}>EIN</label>
          <Controller
            name="ein"
            control={control}
            render={({ field }) => (
              <input
                id="companyEin"
                type="password"
                inputMode="numeric"
                maxLength={10}
                placeholder="XX-XXXXXXX"
                autoComplete="off"
                value={field.value}
                onBlur={field.onBlur}
                ref={field.ref}
                onChange={(event) => field.onChange(formatEin(event.target.value))}
                className={`${fieldClass(Boolean(errors.ein))} font-mono`}
                aria-invalid={Boolean(errors.ein)}
                aria-describedby={errors.ein ? "companyEin-error" : undefined}
              />
            )}
          />
          <InlineError id="companyEin-error" message={errors.ein?.message} />
        </div>

        <div>
          <label htmlFor="employeeCount" className={labelBase}>Employee count</label>
          <input
            id="employeeCount"
            inputMode="numeric"
            placeholder="12"
            {...register("employeeCount")}
            className={fieldClass(Boolean(errors.employeeCount))}
            aria-invalid={Boolean(errors.employeeCount)}
            aria-describedby={errors.employeeCount ? "employeeCount-error" : undefined}
          />
          <InlineError id="employeeCount-error" message={errors.employeeCount?.message} />
        </div>
      </div>

      <fieldset>
        <legend className={labelBase}>Entity type</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {COMPANY_ENTITY_TYPES.map((option) => {
            const active = entityType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setValue("entityType", option.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className={`min-h-12 rounded-lg border px-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <InlineError id="companyEntityType-error" message={errors.entityType?.message} />
      </fieldset>

      <div>
        <label htmlFor="companyIndustry" className={labelBase}>Industry</label>
        <select
          id="companyIndustry"
          {...register("industry")}
          className={selectClass(Boolean(errors.industry))}
          aria-invalid={Boolean(errors.industry)}
          aria-describedby={errors.industry ? "companyIndustry-error" : undefined}
        >
          <option value="">Select industry</option>
          {INDUSTRIES.map((industry) => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
        <InlineError id="companyIndustry-error" message={errors.industry?.message} />
      </div>

      <div>
        <label htmlFor="workState" className={labelBase}>Work states</label>
        <div className="flex gap-2">
          <select
            id="workState"
            value={stateToAdd}
            onChange={(event) => setStateToAdd(event.target.value)}
            className={selectClass(Boolean(errors.workStates))}
          >
            <option value="">Select state</option>
            {availableStates.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={addWorkState}
            className="h-12 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:h-10"
          >
            Add
          </button>
        </div>
        {workStates.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {workStates.map((state) => (
              <button
                key={state}
                type="button"
                onClick={() => removeWorkState(state)}
                className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"
                title={`Remove ${state}`}
              >
                {state} ×
              </button>
            ))}
          </div>
        )}
        <InlineError id="workStates-error" message={errors.workStates?.message} />
      </div>

      <WizardActions />
    </form>
  );
}

function AgencyDetailsForm({
  data,
  onComplete,
}: {
  data: WizardData["agencyDetails"];
  onComplete: (data: WizardData["agencyDetails"]) => void;
}) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AgencyDetailsValues>({
    resolver: zodResolver(agencyDetailsSchema),
    defaultValues: data,
  });
  const agencyType = watch("agencyType");

  return (
    <form onSubmit={handleSubmit((values) => onComplete(values as WizardData["agencyDetails"]))} noValidate className="space-y-5 lg:space-y-4">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">Agency details</h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          Set up the agency profile for payroll, client billing, and contractor operations.
        </p>
      </header>

      <div>
        <label htmlFor="agencyLegalName" className={labelBase}>Legal agency name</label>
        <input
          id="agencyLegalName"
          autoFocus
          {...register("legalName")}
          className={fieldClass(Boolean(errors.legalName))}
          aria-invalid={Boolean(errors.legalName)}
          aria-describedby={errors.legalName ? "agencyLegalName-error" : undefined}
        />
        <InlineError id="agencyLegalName-error" message={errors.legalName?.message} />
      </div>

      <div>
        <label htmlFor="agencyEin" className={labelBase}>EIN</label>
        <Controller
          name="ein"
          control={control}
          render={({ field }) => (
            <input
              id="agencyEin"
              type="password"
              inputMode="numeric"
              maxLength={10}
              placeholder="XX-XXXXXXX"
              autoComplete="off"
              value={field.value}
              onBlur={field.onBlur}
              ref={field.ref}
              onChange={(event) => field.onChange(formatEin(event.target.value))}
              className={`${fieldClass(Boolean(errors.ein))} font-mono`}
              aria-invalid={Boolean(errors.ein)}
              aria-describedby={errors.ein ? "agencyEin-error" : undefined}
            />
          )}
        />
        <InlineError id="agencyEin-error" message={errors.ein?.message} />
      </div>

      <fieldset>
        <legend className={labelBase}>Agency type</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {AGENCY_TYPES.map((option) => {
            const active = agencyType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setValue("agencyType", option.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className={`min-h-12 rounded-lg border px-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <InlineError id="agencyType-error" message={errors.agencyType?.message} />
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="internalStaffCount" className={labelBase}>Internal W-2 staff</label>
          <input
            id="internalStaffCount"
            inputMode="numeric"
            placeholder="8"
            {...register("internalStaffCount")}
            className={fieldClass(Boolean(errors.internalStaffCount))}
            aria-invalid={Boolean(errors.internalStaffCount)}
            aria-describedby={errors.internalStaffCount ? "internalStaffCount-error" : undefined}
          />
          <InlineError id="internalStaffCount-error" message={errors.internalStaffCount?.message} />
        </div>

        <div>
          <label htmlFor="agencyContractorCount" className={labelBase}>Contractors</label>
          <input
            id="agencyContractorCount"
            inputMode="numeric"
            placeholder="24"
            {...register("contractorCount")}
            className={fieldClass(Boolean(errors.contractorCount))}
            aria-invalid={Boolean(errors.contractorCount)}
            aria-describedby={errors.contractorCount ? "agencyContractorCount-error" : undefined}
          />
          <InlineError id="agencyContractorCount-error" message={errors.contractorCount?.message} />
        </div>
      </div>

      <WizardActions />
    </form>
  );
}

function CompanyBankFundingForm({
  data,
  onComplete,
}: {
  data: WizardData["companyBankFunding"];
  onComplete: (data: WizardData["companyBankFunding"]) => void;
}) {
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [pendingPlaidOpen, setPendingPlaidOpen] = useState(false);
  const [plaidLoading, setPlaidLoading] = useState(false);
  const [plaidError, setPlaidError] = useState("");
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompanyBankFundingFormValues, unknown, CompanyBankFundingValues>({
    resolver: zodResolver(companyBankFundingSchema),
    defaultValues: data,
  });
  const method = watch("method");
  const accountType = watch("accountType");
  const accountMask = watch("accountMask");
  const routingMask = watch("routingMask");

  const clearTokenizedBank = () => {
    setValue("bankAccountToken", "", { shouldDirty: true });
    setValue("accountMask", "", { shouldDirty: true });
    setValue("routingMask", "", { shouldDirty: true });
    setValue("verified", false, { shouldDirty: true });
  };

  const applyPlaidFunding = useCallback(
    ({
      institutionName,
      accountMask: nextAccountMask,
      routingMask: nextRoutingMask,
      accountType: nextAccountType,
    }: {
      institutionName: string;
      accountMask: string;
      routingMask: string;
      accountType: "checking" | "savings";
    }) => {
      setValue("method", "plaid", { shouldDirty: true, shouldValidate: true });
      setValue("institutionName", institutionName, { shouldDirty: true });
      setValue("accountType", nextAccountType, { shouldDirty: true });
      setValue("accountMask", nextAccountMask, { shouldDirty: true });
      setValue("routingMask", nextRoutingMask, { shouldDirty: true });
      setValue("bankAccountToken", createBankToken("plaid"), {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("verified", true, { shouldDirty: true });
      setAccountNumber("");
      setRoutingNumber("");
      clearErrors("method");
    },
    [clearErrors, setValue],
  );

  const handlePlaidSuccess = useCallback(
    async (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
      setPlaidLoading(true);
      setPlaidError("");

      try {
        const response = await fetch("/api/plaid/exchange-public-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_token: publicToken }),
        });
        const accountData = await response.json();

        if (!response.ok) {
          throw new Error(accountData?.error || "Plaid verification failed");
        }

        const plaidAccount = accountData.account || accountData.mock_account || {};
        const selectedAccount = metadata.accounts?.[0];
        const selectedSubtype = selectedAccount?.subtype === "savings" ? "savings" : "checking";

        applyPlaidFunding({
          institutionName:
            metadata.institution?.name ||
            plaidAccount.name ||
            selectedAccount?.name ||
            "Plaid verified bank",
          accountMask: last4(plaidAccount.account || selectedAccount?.mask || "0000"),
          routingMask: last4(plaidAccount.routing || "0000"),
          accountType: selectedSubtype,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Plaid is unavailable right now. You can enter bank details manually.";
        setPlaidError(message);
        setError("method", { type: "plaid", message });
      } finally {
        setPlaidLoading(false);
      }
    },
    [applyPlaidFunding, setError],
  );

  const { open: openPlaid, ready: plaidReady } = usePlaidLink({
    token: linkToken,
    onSuccess: handlePlaidSuccess,
    onExit: (error) => {
      setPendingPlaidOpen(false);
      setPlaidLoading(false);
      if (error) {
        const message = error.display_message || error.error_message || "Plaid Link closed before verification completed.";
        setPlaidError(message);
        setError("method", { type: "plaid", message });
      }
    },
  });

  useEffect(() => {
    if (!pendingPlaidOpen || !linkToken || !plaidReady) return;
    openPlaid();
    setPendingPlaidOpen(false);
  }, [linkToken, openPlaid, pendingPlaidOpen, plaidReady]);

  const connectPlaid = async () => {
    setPlaidLoading(true);
    setPlaidError("");
    clearErrors("method");
    setValue("method", "plaid", { shouldDirty: true, shouldValidate: true });

    try {
      const response = await fetch("/api/plaid/create-link-token", { method: "POST" });
      const tokenData = await response.json();

      if (!response.ok || !tokenData.link_token) {
        throw new Error(tokenData?.error || "Could not start Plaid Link");
      }

      if (tokenData.is_mock) {
        applyPlaidFunding({
          institutionName: "Plaid Sandbox Bank",
          accountMask: "1111",
          routingMask: "5678",
          accountType: "checking",
        });
        return;
      }

      setLinkToken(tokenData.link_token);
      setPendingPlaidOpen(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Plaid is unavailable right now. You can enter bank details manually.";
      setPlaidError(message);
      setError("method", { type: "plaid", message });
    } finally {
      setPlaidLoading(false);
    }
  };

  const tokenizeManualAccount = () => {
    const accountDigits = accountNumber.replace(/\D/g, "");
    const routingDigits = routingNumber.replace(/\D/g, "");

    if (routingDigits.length !== 9) {
      setError("method", { type: "manual", message: "Routing number must be 9 digits" });
      return;
    }

    if (accountDigits.length < 4) {
      setError("method", { type: "manual", message: "Account number must include at least 4 digits" });
      return;
    }

    setValue("method", "manual", { shouldDirty: true, shouldValidate: true });
    setValue("institutionName", "Manual bank account", { shouldDirty: true });
    setValue("accountMask", last4(accountDigits), { shouldDirty: true });
    setValue("routingMask", last4(routingDigits), { shouldDirty: true });
    setValue("bankAccountToken", createBankToken("manual"), {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("verified", false, { shouldDirty: true });
    setAccountNumber("");
    setRoutingNumber("");
  };

  return (
    <form onSubmit={handleSubmit((values) => onComplete(values as WizardData["companyBankFunding"]))} noValidate className="space-y-5 lg:space-y-4">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">Bank funding</h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          Connect payroll funding. Manual account details are tokenized and never saved as raw values.
        </p>
      </header>

      <fieldset>
        <legend className={labelBase}>Funding method</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={connectPlaid}
            disabled={plaidLoading}
            className={`min-h-24 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              method === "plaid" ? "border-blue-600 bg-blue-50" : "border-slate-300 bg-white hover:bg-slate-50"
            } disabled:cursor-not-allowed disabled:opacity-70`}
          >
            <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
              {plaidLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Connect with Plaid
            </span>
            <span className="mt-2 block text-sm leading-5 text-slate-500">Fast bank verification for payroll funding.</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setValue("method", "manual", { shouldDirty: true, shouldValidate: true });
              clearTokenizedBank();
            }}
            className={`min-h-24 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              method === "manual" ? "border-blue-600 bg-blue-50" : "border-slate-300 bg-white hover:bg-slate-50"
            }`}
          >
            <span className="block text-sm font-bold text-slate-900">Enter manually</span>
            <span className="mt-2 block text-sm leading-5 text-slate-500">Type routing and account details for tokenization.</span>
          </button>
        </div>
        <InlineError id="fundingMethod-error" message={errors.method?.message} />
        {plaidError && !errors.method?.message && (
          <p className="mt-2 text-sm font-medium text-red-600 lg:text-xs">{plaidError}</p>
        )}
      </fieldset>

      {method === "manual" && (
        <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <fieldset>
            <legend className={labelBase}>Account type</legend>
            <div className="grid grid-cols-2 gap-3">
              {(["checking", "savings"] as const).map((option) => {
                const active = accountType === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setValue("accountType", option, { shouldDirty: true })}
                    className={`h-11 rounded-lg border text-sm font-bold capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      active
                        ? "border-blue-600 bg-white text-blue-700"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="routingNumber" className={labelBase}>Routing number</label>
              <input
                id="routingNumber"
                type="password"
                inputMode="numeric"
                value={routingNumber}
                onChange={(event) => {
                  setRoutingNumber(event.target.value.replace(/\D/g, "").slice(0, 9));
                  clearTokenizedBank();
                }}
                className={fieldClass(false)}
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="accountNumber" className={labelBase}>Account number</label>
              <input
                id="accountNumber"
                type="password"
                inputMode="numeric"
                value={accountNumber}
                onChange={(event) => {
                  setAccountNumber(event.target.value.replace(/\D/g, ""));
                  clearTokenizedBank();
                }}
                className={fieldClass(false)}
                autoComplete="off"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={tokenizeManualAccount}
            className="h-11 rounded-lg bg-[#0A1628] px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Tokenize account
          </button>
        </div>
      )}

      {(accountMask || routingMask) && (
        <dl className="grid gap-3 rounded-lg border border-green-200 bg-green-50 p-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase text-green-700">Account</dt>
            <dd className="mt-1 font-mono text-sm font-bold text-slate-900">••••{accountMask}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-green-700">Routing</dt>
            <dd className="mt-1 font-mono text-sm font-bold text-slate-900">••••{routingMask}</dd>
          </div>
        </dl>
      )}

      <input type="hidden" {...register("method")} />
      <input type="hidden" {...register("institutionName")} />
      <input type="hidden" {...register("accountType")} />
      <input type="hidden" {...register("accountMask")} />
      <input type="hidden" {...register("routingMask")} />
      <input type="hidden" {...register("bankAccountToken")} />
      <input type="hidden" {...register("verified")} />

      <WizardActions />
    </form>
  );
}

function CompanyTaxSetupForm({
  data,
  business,
  onComplete,
}: {
  data: WizardData["companyTaxSetup"];
  business: WizardData["companyBusiness"];
  onComplete: (data: WizardData["companyTaxSetup"]) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompanyTaxSetupValues>({
    resolver: zodResolver(companyTaxSetupSchema),
    defaultValues: data,
  });
  const registrationStates = watch("registrationStates") ?? [];

  const toggleRegistrationState = (state: string) => {
    const next = registrationStates.includes(state)
      ? registrationStates.filter((item) => item !== state)
      : [...registrationStates, state];
    setValue("registrationStates", next, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit((values) => onComplete(values as WizardData["companyTaxSetup"]))} noValidate className="space-y-5 lg:space-y-4">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">Tax setup</h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          Confirm federal details and tell us where state registrations are still needed.
        </p>
      </header>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <dt className="text-xs font-bold uppercase text-slate-500">Federal EIN</dt>
        <dd className="mt-1 font-mono text-lg font-bold text-slate-900">{maskEin(business.ein)}</dd>
        <label className="mt-4 flex items-start gap-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            {...register("federalEinConfirmed")}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            aria-invalid={Boolean(errors.federalEinConfirmed)}
            aria-describedby={errors.federalEinConfirmed ? "federalEinConfirmed-error" : undefined}
          />
          <span>I confirm this EIN is correct for federal payroll tax filings.</span>
        </label>
        <InlineError id="federalEinConfirmed-error" message={errors.federalEinConfirmed?.message} />
      </div>

      <div>
        <label htmlFor="stateTaxIdText" className={labelBase}>State tax IDs</label>
        <textarea
          id="stateTaxIdText"
          rows={4}
          placeholder="Example: California SIT 1234567, New York UI 7654321"
          {...register("stateTaxIdText")}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <fieldset>
        <legend className={labelBase}>Trigger state registration where missing</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {business.workStates.map((state) => {
            const active = registrationStates.includes(state);
            return (
              <button
                key={state}
                type="button"
                onClick={() => toggleRegistrationState(state)}
                className={`min-h-11 rounded-lg border px-3 text-left text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {state}
              </button>
            );
          })}
        </div>
      </fieldset>

      <WizardActions />
    </form>
  );
}

function AgencyTaxSetupForm({
  data,
  agency,
  onComplete,
}: {
  data: WizardData["agencyTaxSetup"];
  agency: WizardData["agencyDetails"];
  onComplete: (data: WizardData["agencyTaxSetup"]) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AgencyTaxSetupValues>({
    resolver: zodResolver(agencyTaxSetupSchema),
    defaultValues: data,
  });

  return (
    <form onSubmit={handleSubmit((values) => onComplete(values as WizardData["agencyTaxSetup"]))} noValidate className="space-y-5 lg:space-y-4">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">Tax setup</h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          Confirm the federal EIN and add the state IDs needed for mixed-workforce payroll.
        </p>
      </header>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <dt className="text-xs font-bold uppercase text-slate-500">Federal EIN</dt>
        <dd className="mt-1 font-mono text-lg font-bold text-slate-900">{maskEin(agency.ein)}</dd>
        <label className="mt-4 flex items-start gap-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            {...register("federalEinConfirmed")}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            aria-invalid={Boolean(errors.federalEinConfirmed)}
            aria-describedby={errors.federalEinConfirmed ? "agencyFederalEinConfirmed-error" : undefined}
          />
          <span>I confirm this EIN is correct for federal payroll tax filings.</span>
        </label>
        <InlineError id="agencyFederalEinConfirmed-error" message={errors.federalEinConfirmed?.message} />
      </div>

      <div>
        <label htmlFor="agencyStateTaxIdText" className={labelBase}>State tax IDs</label>
        <textarea
          id="agencyStateTaxIdText"
          rows={5}
          placeholder="Example: California SIT 1234567, New York UI pending registration"
          {...register("stateTaxIdText")}
          className={`w-full rounded-lg border bg-white px-3 py-3 text-sm text-slate-950 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
            errors.stateTaxIdText ? "border-red-400 bg-red-50" : "border-slate-300"
          }`}
          aria-invalid={Boolean(errors.stateTaxIdText)}
          aria-describedby={errors.stateTaxIdText ? "agencyStateTaxIdText-error" : undefined}
        />
        <InlineError id="agencyStateTaxIdText-error" message={errors.stateTaxIdText?.message} />
      </div>

      <WizardActions />
    </form>
  );
}

function CompanyPayScheduleForm({
  data,
  onComplete,
}: {
  data: WizardData["companyPaySchedule"];
  onComplete: (data: WizardData["companyPaySchedule"]) => void;
}) {
  const minPayrollDate = useMemo(() => getMinPayrollDate(), []);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompanyPayScheduleValues>({
    resolver: zodResolver(companyPayScheduleSchema),
    defaultValues: data,
  });
  const frequency = watch("frequency");

  return (
    <form onSubmit={handleSubmit((values) => onComplete(values as WizardData["companyPaySchedule"]))} noValidate className="space-y-5 lg:space-y-4">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">Pay schedule</h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          Set the cadence, first pay date, and first pay period.
        </p>
      </header>

      <fieldset>
        <legend className={labelBase}>Frequency</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {PAY_SCHEDULES.map(({ value, label, detail, icon: Icon }) => {
            const active = frequency === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setValue("frequency", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className={`min-h-24 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:min-h-20 lg:p-3 ${
                  active
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-300 bg-white hover:bg-slate-50"
                }`}
              >
                <Icon className={`mb-3 h-5 w-5 lg:mb-2 lg:h-4 lg:w-4 ${active ? "text-blue-700" : "text-slate-500"}`} aria-hidden="true" />
                <span className="block text-sm font-bold text-slate-900">{label}</span>
                <span className="mt-1 block text-sm text-slate-500 lg:text-xs">{detail}</span>
              </button>
            );
          })}
        </div>
        <InlineError id="companyFrequency-error" message={errors.frequency?.message} />
      </fieldset>

      <div>
        <label htmlFor="firstPayDate" className={labelBase}>First pay date</label>
        <input
          id="firstPayDate"
          type="date"
          min={minPayrollDate}
          {...register("firstPayDate")}
          className={fieldClass(Boolean(errors.firstPayDate))}
          aria-invalid={Boolean(errors.firstPayDate)}
          aria-describedby={errors.firstPayDate ? "firstPayDate-error" : undefined}
        />
        <InlineError id="firstPayDate-error" message={errors.firstPayDate?.message} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="payPeriodStart" className={labelBase}>Pay period start</label>
          <input
            id="payPeriodStart"
            type="date"
            {...register("payPeriodStart")}
            className={fieldClass(Boolean(errors.payPeriodStart))}
            aria-invalid={Boolean(errors.payPeriodStart)}
            aria-describedby={errors.payPeriodStart ? "payPeriodStart-error" : undefined}
          />
          <InlineError id="payPeriodStart-error" message={errors.payPeriodStart?.message} />
        </div>
        <div>
          <label htmlFor="payPeriodEnd" className={labelBase}>Pay period end</label>
          <input
            id="payPeriodEnd"
            type="date"
            {...register("payPeriodEnd")}
            className={fieldClass(Boolean(errors.payPeriodEnd))}
            aria-invalid={Boolean(errors.payPeriodEnd)}
            aria-describedby={errors.payPeriodEnd ? "payPeriodEnd-error" : undefined}
          />
          <InlineError id="payPeriodEnd-error" message={errors.payPeriodEnd?.message} />
        </div>
      </div>

      <WizardActions />
    </form>
  );
}

function AgencyFirstClientForm({
  data,
  onComplete,
  onSkip,
}: {
  data: WizardData["agencyFirstClient"];
  onComplete: (data: WizardData["agencyFirstClient"]) => void;
  onSkip: () => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AgencyFirstClientFormValues, unknown, AgencyFirstClientValues>({
    resolver: zodResolver(agencyFirstClientSchema),
    defaultValues: data,
  });
  const workerType = watch("workerType");
  const payRate = getCurrencyAmount(watch("payRate") || "");
  const billRate = getCurrencyAmount(watch("billRate") || "");
  const spread = billRate > 0 && payRate > 0 ? billRate - payRate : 0;

  return (
    <form onSubmit={handleSubmit((values) => onComplete(values as WizardData["agencyFirstClient"]))} noValidate className="space-y-5 lg:space-y-4">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">First client</h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          Add an initial client and project with worker pay rate versus client bill rate.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="clientName" className={labelBase}>Client name</label>
          <input
            id="clientName"
            autoFocus
            {...register("clientName")}
            className={fieldClass(Boolean(errors.clientName))}
            aria-invalid={Boolean(errors.clientName)}
            aria-describedby={errors.clientName ? "clientName-error" : undefined}
          />
          <InlineError id="clientName-error" message={errors.clientName?.message} />
        </div>

        <div>
          <label htmlFor="projectName" className={labelBase}>Project</label>
          <input
            id="projectName"
            {...register("projectName")}
            className={fieldClass(Boolean(errors.projectName))}
            aria-invalid={Boolean(errors.projectName)}
            aria-describedby={errors.projectName ? "projectName-error" : undefined}
          />
          <InlineError id="projectName-error" message={errors.projectName?.message} />
        </div>
      </div>

      <fieldset>
        <legend className={labelBase}>Worker type</legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "W-2 worker", value: "w2" as const },
            { label: "Contractor", value: "contractor" as const },
          ].map((option) => {
            const active = workerType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setValue("workerType", option.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className={`h-12 rounded-lg border text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:h-10 ${
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="workerPayRate" className={labelBase}>Pay rate</label>
          <div className="relative">
            <input
              id="workerPayRate"
              inputMode="decimal"
              placeholder="45"
              {...register("payRate")}
              className={`${fieldClass(Boolean(errors.payRate))} pr-20`}
              aria-invalid={Boolean(errors.payRate)}
              aria-describedby={errors.payRate ? "workerPayRate-error" : undefined}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
              / hour
            </span>
          </div>
          <InlineError id="workerPayRate-error" message={errors.payRate?.message} />
        </div>

        <div>
          <label htmlFor="clientBillRate" className={labelBase}>Bill rate</label>
          <div className="relative">
            <input
              id="clientBillRate"
              inputMode="decimal"
              placeholder="85"
              {...register("billRate")}
              className={`${fieldClass(Boolean(errors.billRate))} pr-20`}
              aria-invalid={Boolean(errors.billRate)}
              aria-describedby={errors.billRate ? "clientBillRate-error" : undefined}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
              / hour
            </span>
          </div>
          <InlineError id="clientBillRate-error" message={errors.billRate?.message} />
        </div>
      </div>

      {spread > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-bold text-green-800">
            Spread: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(spread)} per hour
          </p>
        </div>
      )}

      <input type="hidden" {...register("skip")} />

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onSkip}
          className="h-12 rounded-lg border border-slate-300 px-5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:h-10"
        >
          Skip for later
        </button>
        <button
          type="submit"
          className="flex h-12 min-w-32 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 lg:h-10"
        >
          Add client
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

function AgencyPaySchedulesForm({
  data,
  onComplete,
}: {
  data: WizardData["agencyPaySchedules"];
  onComplete: (data: WizardData["agencyPaySchedules"]) => void;
}) {
  const minPayrollDate = useMemo(() => getMinPayrollDate(), []);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AgencyPaySchedulesValues>({
    resolver: zodResolver(agencyPaySchedulesSchema),
    defaultValues: {
      schedules: data.schedules.length
        ? data.schedules
        : DEFAULT_AGENCY_PAY_SCHEDULES.map((schedule) => ({ ...schedule })),
    },
  });
  const schedules = watch("schedules") ?? [];

  const addSchedule = () => {
    setValue(
      "schedules",
      [
        ...schedules,
        {
          id: createLocalId("schedule"),
          workerGroup: "contractors",
          frequency: "",
          firstPayDate: "",
        },
      ],
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const removeSchedule = (index: number) => {
    setValue(
      "schedules",
      schedules.filter((_, scheduleIndex) => scheduleIndex !== index),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  return (
    <form onSubmit={handleSubmit((values) => onComplete(values as WizardData["agencyPaySchedules"]))} noValidate className="space-y-5 lg:space-y-4">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">Pay schedules</h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          Agencies can run separate schedules for contractors and internal staff.
        </p>
      </header>

      <div className="space-y-3">
        {schedules.map((schedule, index) => (
          <div key={schedule.id || index} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-900">Schedule {index + 1}</p>
              {schedules.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSchedule(index)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  aria-label={`Remove schedule ${index + 1}`}
                  title={`Remove schedule ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor={`agencyScheduleGroup-${index}`} className={labelBase}>Group</label>
                <select
                  id={`agencyScheduleGroup-${index}`}
                  {...register(`schedules.${index}.workerGroup` as const)}
                  className={selectClass(Boolean(errors.schedules?.[index]?.workerGroup))}
                  aria-invalid={Boolean(errors.schedules?.[index]?.workerGroup)}
                >
                  {AGENCY_WORKER_GROUPS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor={`agencyScheduleFrequency-${index}`} className={labelBase}>Frequency</label>
                <select
                  id={`agencyScheduleFrequency-${index}`}
                  {...register(`schedules.${index}.frequency` as const)}
                  className={selectClass(Boolean(errors.schedules?.[index]?.frequency))}
                  aria-invalid={Boolean(errors.schedules?.[index]?.frequency)}
                  aria-describedby={errors.schedules?.[index]?.frequency ? `agencyScheduleFrequency-${index}-error` : undefined}
                >
                  <option value="">Select frequency</option>
                  {PAY_SCHEDULES.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <InlineError id={`agencyScheduleFrequency-${index}-error`} message={errors.schedules?.[index]?.frequency?.message} />
              </div>

              <div>
                <label htmlFor={`agencyScheduleFirstPay-${index}`} className={labelBase}>First pay date</label>
                <input
                  id={`agencyScheduleFirstPay-${index}`}
                  type="date"
                  min={minPayrollDate}
                  {...register(`schedules.${index}.firstPayDate` as const)}
                  className={fieldClass(Boolean(errors.schedules?.[index]?.firstPayDate))}
                  aria-invalid={Boolean(errors.schedules?.[index]?.firstPayDate)}
                  aria-describedby={errors.schedules?.[index]?.firstPayDate ? `agencyScheduleFirstPay-${index}-error` : undefined}
                />
                <InlineError id={`agencyScheduleFirstPay-${index}-error`} message={errors.schedules?.[index]?.firstPayDate?.message} />
              </div>
            </div>

            <input type="hidden" {...register(`schedules.${index}.id` as const)} />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={addSchedule}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:h-10"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add schedule
        </button>
        <button
          type="submit"
          className="flex h-12 min-w-32 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 lg:h-10"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {typeof errors.schedules?.message === "string" && (
        <InlineError id="agencySchedules-error" message={errors.schedules.message} />
      )}
    </form>
  );
}

function CompanyInviteEmployeesForm({
  data,
  onComplete,
  onSkip,
}: {
  data: WizardData["companyInvites"];
  onComplete: (data: WizardData["companyInvites"]) => void;
  onSkip: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyInvitesFormValues, unknown, CompanyInvitesValues>({
    resolver: zodResolver(companyInvitesSchema),
    defaultValues: data,
  });

  return (
    <form onSubmit={handleSubmit((values) => onComplete(values as WizardData["companyInvites"]))} noValidate className="space-y-5 lg:space-y-4">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">Invite employees</h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          Paste emails separated by commas or new lines. You can also skip and invite later.
        </p>
      </header>

      <div>
        <label htmlFor="inviteEmails" className={labelBase}>Employee emails</label>
        <textarea
          id="inviteEmails"
          rows={7}
          placeholder="alex@company.com, jordan@company.com"
          {...register("emails")}
          className={`w-full rounded-lg border bg-white px-3 py-3 text-sm text-slate-950 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
            errors.emails ? "border-red-400 bg-red-50" : "border-slate-300"
          }`}
          aria-invalid={Boolean(errors.emails)}
          aria-describedby={errors.emails ? "inviteEmails-error" : undefined}
        />
        <InlineError id="inviteEmails-error" message={errors.emails?.message} />
      </div>

      <input type="hidden" {...register("skip")} />

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onSkip}
          className="h-12 rounded-lg border border-slate-300 px-5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:h-10"
        >
          Skip for later
        </button>
        <button
          type="submit"
          className="flex h-12 min-w-32 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 lg:h-10"
        >
          Queue invites
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

function CompanyReviewFinish({
  data,
  loading,
  onFinish,
}: {
  data: WizardData;
  loading: boolean;
  onFinish: () => void;
}) {
  const summaryRows = [
    ["Legal name", data.companyBusiness.legalName],
    ["DBA", data.companyBusiness.dba || "None"],
    ["EIN", maskEin(data.companyBusiness.ein)],
    ["Entity", COMPANY_ENTITY_TYPES.find((type) => type.value === data.companyBusiness.entityType)?.label || "Not set"],
    ["Work states", data.companyBusiness.workStates.join(", ") || "Not set"],
    ["Funding", data.companyBankFunding.method === "plaid" ? "Plaid connected" : `Manual account ••••${data.companyBankFunding.accountMask}`],
    ["Tax registration", data.companyTaxSetup.registrationStates.length ? data.companyTaxSetup.registrationStates.join(", ") : "No missing registrations marked"],
    ["Pay schedule", data.companyPaySchedule.frequency || "Not set"],
    ["First pay date", data.companyPaySchedule.firstPayDate || "Not set"],
    ["Invites", data.companyInvites.skip ? "Skipped for later" : formatEmailsSummary(data.companyInvites.emails)],
  ];

  return (
    <div className="space-y-6 lg:space-y-5">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">Review & finish</h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          Confirm your employer setup. Finishing marks onboarding complete and opens your company dashboard.
        </p>
      </header>

      <dl className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
        {summaryRows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm font-bold text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onFinish}
          disabled={loading}
          className="flex h-12 min-w-44 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 lg:h-10"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Finishing...
            </>
          ) : (
            <>
              Finish setup
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function AgencyReviewFinish({
  data,
  loading,
  onFinish,
}: {
  data: WizardData;
  loading: boolean;
  onFinish: () => void;
}) {
  const agencyTypeLabel =
    AGENCY_TYPES.find((type) => type.value === data.agencyDetails.agencyType)?.label || "Not set";
  const scheduleSummary = data.agencyPaySchedules.schedules
    .map((schedule) => {
      const group = AGENCY_WORKER_GROUPS.find((item) => item.value === schedule.workerGroup)?.label || "Workers";
      const frequency = PAY_SCHEDULES.find((item) => item.value === schedule.frequency)?.label || "Not set";
      return `${group}: ${frequency}${schedule.firstPayDate ? ` from ${schedule.firstPayDate}` : ""}`;
    })
    .join("; ");
  const firstClient = data.agencyFirstClient.skip
    ? "Skipped for later"
    : `${data.agencyFirstClient.clientName || "Client"} / ${data.agencyFirstClient.projectName || "Project"}`;
  const firstRate = data.agencyFirstClient.skip
    ? "Not set"
    : `$${data.agencyFirstClient.payRate || "0"} pay / $${data.agencyFirstClient.billRate || "0"} bill`;
  const funding =
    data.agencyBankFunding.method === "plaid"
      ? "Plaid connected"
      : `Manual account ••••${data.agencyBankFunding.accountMask}`;
  const summaryRows = [
    ["Legal name", data.agencyDetails.legalName],
    ["EIN", maskEin(data.agencyDetails.ein)],
    ["Agency type", agencyTypeLabel],
    ["Internal staff", data.agencyDetails.internalStaffCount || "0"],
    ["Contractors", data.agencyDetails.contractorCount || "0"],
    ["Funding", funding],
    ["State tax IDs", data.agencyTaxSetup.stateTaxIdText || "Not set"],
    ["First client", firstClient],
    ["Rates", firstRate],
    ["Pay schedules", scheduleSummary || "Not set"],
  ];

  return (
    <div className="space-y-6 lg:space-y-5">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">Review & finish</h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          Finishing marks onboarding complete and opens the agency dashboard with clients and contractors enabled.
        </p>
      </header>

      <dl className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
        {summaryRows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm font-bold text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onFinish}
          disabled={loading}
          className="flex h-12 min-w-44 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 lg:h-10"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Finishing...
            </>
          ) : (
            <>
              Finish setup
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Step2Form({
  data,
  onComplete,
}: {
  data: WizardData["step2"];
  onComplete: (data: WizardData["step2"]) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: data,
  });
  const multipleStates = watch("multipleStates");

  return (
    <form onSubmit={handleSubmit(onComplete)} noValidate className="space-y-5 lg:space-y-4">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">
          Tell us about your company
        </h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          We use this to tune payroll, taxes, and compliance defaults.
        </p>
      </header>

      <div>
        <label htmlFor="companyName" className={labelBase}>
          Company legal name
        </label>
        <input
          id="companyName"
          {...register("companyName")}
          className={fieldClass(Boolean(errors.companyName))}
          aria-invalid={Boolean(errors.companyName)}
          aria-describedby={errors.companyName ? "companyName-error" : undefined}
        />
        <InlineError id="companyName-error" message={errors.companyName?.message} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="companySize" className={labelBase}>
            Company size
          </label>
          <select
            id="companySize"
            {...register("companySize")}
            className={selectClass(Boolean(errors.companySize))}
            aria-invalid={Boolean(errors.companySize)}
            aria-describedby={errors.companySize ? "companySize-error" : undefined}
          >
            <option value="">Select size</option>
            {COMPANY_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <InlineError id="companySize-error" message={errors.companySize?.message} />
        </div>

        <div>
          <label htmlFor="industry" className={labelBase}>
            Industry
          </label>
          <select
            id="industry"
            {...register("industry")}
            className={selectClass(Boolean(errors.industry))}
            aria-invalid={Boolean(errors.industry)}
            aria-describedby={errors.industry ? "industry-error" : undefined}
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
          <InlineError id="industry-error" message={errors.industry?.message} />
        </div>
      </div>

      <div>
        <label htmlFor="primaryState" className={labelBase}>
          Primary state
        </label>
        <select
          id="primaryState"
          {...register("primaryState")}
          className={selectClass(Boolean(errors.primaryState))}
          aria-invalid={Boolean(errors.primaryState)}
          aria-describedby={errors.primaryState ? "primaryState-error" : undefined}
        >
          <option value="">Select state</option>
          {US_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        <InlineError id="primaryState-error" message={errors.primaryState?.message} />
      </div>

      <fieldset>
        <legend className={labelBase}>Do you operate in multiple states?</legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Yes", value: true },
            { label: "No", value: false },
          ].map((option) => {
            const active = multipleStates === option.value;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setValue("multipleStates", option.value, { shouldDirty: true })}
                className={`h-12 rounded-lg border text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:h-10 ${
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <WizardActions />
    </form>
  );
}

function Step3Form({
  data,
  onComplete,
  onSkip,
}: {
  data: WizardData["step3"];
  onComplete: (data: WizardData["step3"]) => void;
  onSkip: () => void;
}) {
  const minPayrollDate = useMemo(() => getMinPayrollDate(), []);
  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: { ...data, skipPayroll: false },
  });
  const paySchedule = watch("paySchedule");

  return (
    <form onSubmit={handleSubmit((values) => onComplete(values as WizardData["step3"]))} noValidate className="space-y-5 lg:space-y-4">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">Set up payroll basics</h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          Add the minimum details needed to prepare your first run.
        </p>
      </header>

      <div>
        <label htmlFor="ein" className={labelBase}>
          EIN
        </label>
        <Controller
          name="ein"
          control={control}
          render={({ field }) => (
            <input
              id="ein"
              inputMode="numeric"
              maxLength={10}
              placeholder="XX-XXXXXXX"
              value={field.value}
              onBlur={field.onBlur}
              ref={field.ref}
              onChange={(event) => field.onChange(formatEin(event.target.value))}
              className={`${fieldClass(Boolean(errors.ein))} font-mono`}
              aria-invalid={Boolean(errors.ein)}
              aria-describedby={errors.ein ? "ein-error" : undefined}
            />
          )}
        />
        <InlineError id="ein-error" message={errors.ein?.message} />
      </div>

      <fieldset>
        <legend className={labelBase}>Pay schedule</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {PAY_SCHEDULES.map(({ value, label, detail, icon: Icon }) => {
            const active = paySchedule === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setValue("paySchedule", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className={`min-h-24 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:min-h-20 lg:p-3 ${
                  active
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-300 bg-white hover:bg-slate-50"
                }`}
              >
                <Icon
                  className={`mb-3 h-5 w-5 lg:mb-2 lg:h-4 lg:w-4 ${active ? "text-blue-700" : "text-slate-500"}`}
                  aria-hidden="true"
                />
                <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  {label}
                  {value === "bi-weekly" && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      Most popular
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-sm text-slate-500 lg:text-xs">{detail}</span>
              </button>
            );
          })}
        </div>
        <InlineError id="paySchedule-error" message={errors.paySchedule?.message} />
      </fieldset>

      <div>
        <label htmlFor="firstPayrollDate" className={labelBase}>
          First payroll date
        </label>
        <input
          id="firstPayrollDate"
          type="date"
          min={minPayrollDate}
          {...register("firstPayrollDate")}
          className={fieldClass(Boolean(errors.firstPayrollDate))}
          aria-invalid={Boolean(errors.firstPayrollDate)}
          aria-describedby={errors.firstPayrollDate ? "firstPayrollDate-error" : undefined}
        />
        <p className="mt-1.5 text-xs font-medium text-slate-500">
          We need 4 business days to process your first run.
        </p>
        <InlineError id="firstPayrollDate-error" message={errors.firstPayrollDate?.message} />
      </div>

      <WizardActions />

      <button
        type="button"
        onClick={onSkip}
        className="w-full rounded-lg py-2 text-sm font-bold text-slate-500 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        I&apos;ll set this up later
      </button>
    </form>
  );
}

function Step4Form({
  adminEmail,
  adminName,
  data,
  loading,
  onComplete,
  onSkip,
}: {
  adminEmail: string;
  adminName: string;
  data: WizardData["step4"];
  loading: boolean;
  onComplete: (data: WizardData["step4"]) => void;
  onSkip: () => void;
}) {
  const adminNameParts = useMemo(() => splitName(adminName), [adminName]);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step4Values>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      ...data,
      firstName: data.firstName || adminNameParts.firstName,
      lastName: data.lastName || adminNameParts.lastName,
      workEmail: data.workEmail || adminEmail,
      skip: false,
    },
  });
  const isAdminEmployee = watch("isAdminEmployee");
  const payType = watch("payType");
  const payRate = watch("payRate");
  const numericPayRate = Number(payRate.replace(/[$,\s]/g, ""));
  const convertedPay = Number.isFinite(numericPayRate) && numericPayRate > 0
    ? payType === "hourly"
      ? `${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(numericPayRate * 2080)} per year`
      : `${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 2,
        }).format(numericPayRate / 2080)} per hour`
    : "";

  useEffect(() => {
    if (!isAdminEmployee) return;
    setValue("firstName", adminNameParts.firstName, { shouldDirty: true });
    setValue("lastName", adminNameParts.lastName, { shouldDirty: true });
    setValue("workEmail", adminEmail, { shouldDirty: true });
  }, [adminEmail, adminNameParts.firstName, adminNameParts.lastName, isAdminEmployee, setValue]);

  return (
    <form onSubmit={handleSubmit((values) => onComplete(values as WizardData["step4"]))} noValidate className="space-y-5 lg:space-y-4">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">
          Add your first employee (or yourself)
        </h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          Add yourself or one teammate so employee setup is ready.
        </p>
      </header>

      <fieldset>
        <legend className={labelBase}>Is one of the employees you?</legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Yes", value: true },
            { label: "No", value: false },
          ].map((option) => {
            const active = isAdminEmployee === option.value;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() =>
                  setValue("isAdminEmployee", option.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className={`h-12 rounded-lg border text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:h-10 ${
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={labelBase}>
            First name
          </label>
          <input
            id="firstName"
            autoComplete="given-name"
            {...register("firstName")}
            className={fieldClass(Boolean(errors.firstName))}
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
          />
          <InlineError id="firstName-error" message={errors.firstName?.message} />
        </div>

        <div>
          <label htmlFor="lastName" className={labelBase}>
            Last name
          </label>
          <input
            id="lastName"
            autoComplete="family-name"
            {...register("lastName")}
            className={fieldClass(Boolean(errors.lastName))}
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
          />
          <InlineError id="lastName-error" message={errors.lastName?.message} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="workEmail" className={labelBase}>
            Work email
          </label>
          <input
            id="workEmail"
            type="email"
            autoComplete="email"
            {...register("workEmail")}
            className={fieldClass(Boolean(errors.workEmail))}
            aria-invalid={Boolean(errors.workEmail)}
            aria-describedby={errors.workEmail ? "workEmail-error" : undefined}
          />
          <InlineError id="workEmail-error" message={errors.workEmail?.message} />
        </div>

        <div>
          <label htmlFor="jobTitle" className={labelBase}>
            Job title
          </label>
          <input
            id="jobTitle"
            {...register("jobTitle")}
            className={fieldClass(Boolean(errors.jobTitle))}
            aria-invalid={Boolean(errors.jobTitle)}
            aria-describedby={errors.jobTitle ? "jobTitle-error" : undefined}
          />
          <InlineError id="jobTitle-error" message={errors.jobTitle?.message} />
        </div>
      </div>

      <fieldset>
        <legend className={labelBase}>Pay type</legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Salary", value: "salary" as const },
            { label: "Hourly", value: "hourly" as const },
          ].map((option) => {
            const active = payType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setValue("payType", option.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className={`h-12 rounded-lg border text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:h-10 ${
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className={labelBase}>
            Start date
          </label>
          <input
            id="startDate"
            type="date"
            {...register("startDate")}
            className={fieldClass(Boolean(errors.startDate))}
            aria-invalid={Boolean(errors.startDate)}
            aria-describedby={errors.startDate ? "startDate-error" : undefined}
          />
          <InlineError id="startDate-error" message={errors.startDate?.message} />
        </div>

        <div>
          <label htmlFor="payRate" className={labelBase}>
            Pay rate
          </label>
          <div className="relative">
            <input
              id="payRate"
              inputMode="decimal"
              placeholder={payType === "hourly" ? "35" : "75000"}
              {...register("payRate")}
              className={`${fieldClass(Boolean(errors.payRate))} pr-24`}
              aria-invalid={Boolean(errors.payRate)}
              aria-describedby={errors.payRate ? "payRate-error" : "payRate-conversion"}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
              {payType === "hourly" ? "per hour" : "per year"}
            </span>
          </div>
          {convertedPay && (
            <p id="payRate-conversion" className="mt-1.5 text-xs font-medium text-slate-500">
              Equivalent to {convertedPay}
            </p>
          )}
          <InlineError id="payRate-error" message={errors.payRate?.message} />
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 min-w-40 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 lg:h-10"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Setting up...
            </>
          ) : (
            <>
              Submit
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={onSkip}
        disabled={loading}
        className="w-full rounded-lg py-2 text-sm font-bold text-slate-500 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Add more employees after setup
      </button>
    </form>
  );
}

function CreatorSoloForm({
  data,
  onComplete,
}: {
  data: WizardData["creator"];
  onComplete: (data: WizardData["creator"]) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatorValues>({
    resolver: zodResolver(creatorSchema),
    defaultValues: data,
  });
  const entityType = watch("entityType");
  const paySelfAsOwner = watch("paySelfAsOwner");

  return (
    <form onSubmit={handleSubmit((values) => onComplete(values as WizardData["creator"]))} noValidate className="space-y-5 lg:space-y-4">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">
          Creator setup
        </h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          Choose your entity type, owner pay preference, and contractor count.
        </p>
      </header>

      <fieldset>
        <legend className={labelBase}>Entity type</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {CREATOR_ENTITY_TYPES.map((option) => {
            const active = entityType === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setValue("entityType", option.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className={`h-12 rounded-lg border text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:h-10 ${
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <InlineError id="entityType-error" message={errors.entityType?.message} />
      </fieldset>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <label className="flex items-start justify-between gap-4">
          <span>
            <span className="block text-sm font-bold text-slate-900">
              Pay yourself as owner
            </span>
            <span className="mt-1 block text-sm leading-5 text-slate-500">
              Keep owner compensation in your setup checklist.
            </span>
          </span>
          <input
            type="checkbox"
            {...register("paySelfAsOwner")}
            className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            aria-label="Pay yourself as owner"
          />
        </label>
        <p className="mt-3 text-xs font-semibold text-slate-500">
          {paySelfAsOwner ? "Owner pay will be included in onboarding." : "Owner pay will be skipped for now."}
        </p>
      </div>

      {entityType === "s_corp" && paySelfAsOwner && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-bold text-blue-900">Reasonable salary helper</p>
          <p className="mt-1 text-sm leading-5 text-blue-800">
            S-Corp owners who work in the business typically review a market-based salary before taking distributions. This is informational and not tax or legal advice.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="contractorCount" className={labelBase}>
          Editors, VAs, or designers you pay
        </label>
        <input
          id="contractorCount"
          type="number"
          min={0}
          inputMode="numeric"
          {...register("contractorCount", { valueAsNumber: true })}
          className={fieldClass(Boolean(errors.contractorCount))}
          aria-invalid={Boolean(errors.contractorCount)}
          aria-describedby={errors.contractorCount ? "contractorCount-error" : undefined}
        />
        <InlineError id="contractorCount-error" message={errors.contractorCount?.message} />
      </div>

      <WizardActions />
    </form>
  );
}

function CreatorIdentityBusinessForm({
  data,
  onComplete,
}: {
  data: WizardData["creatorIdentity"];
  onComplete: (data: WizardData["creatorIdentity"]) => void;
}) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatorIdentityValues>({
    resolver: zodResolver(creatorIdentitySchema),
    defaultValues: data,
  });

  return (
    <form onSubmit={handleSubmit((values) => onComplete(values as WizardData["creatorIdentity"]))} noValidate className="space-y-5 lg:space-y-4">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">
          Identity & business
        </h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          Add the owner and business details needed for creator payments.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="creatorLegalName" className={labelBase}>Legal name</label>
          <input
            id="creatorLegalName"
            autoFocus
            autoComplete="name"
            {...register("legalName")}
            className={fieldClass(Boolean(errors.legalName))}
            aria-invalid={Boolean(errors.legalName)}
            aria-describedby={errors.legalName ? "creatorLegalName-error" : undefined}
          />
          <InlineError id="creatorLegalName-error" message={errors.legalName?.message} />
        </div>

        <div>
          <label htmlFor="creatorBusinessName" className={labelBase}>Business name</label>
          <input
            id="creatorBusinessName"
            {...register("businessName")}
            className={fieldClass(Boolean(errors.businessName))}
            aria-invalid={Boolean(errors.businessName)}
            aria-describedby={errors.businessName ? "creatorBusinessName-error" : undefined}
          />
          <InlineError id="creatorBusinessName-error" message={errors.businessName?.message} />
        </div>
      </div>

      <div>
        <label htmlFor="creatorEin" className={labelBase}>EIN</label>
        <Controller
          name="ein"
          control={control}
          render={({ field }) => (
            <input
              id="creatorEin"
              type="password"
              inputMode="numeric"
              maxLength={10}
              placeholder="Optional"
              autoComplete="off"
              value={field.value}
              onBlur={field.onBlur}
              ref={field.ref}
              onChange={(event) => field.onChange(formatEin(event.target.value))}
              className={`${fieldClass(Boolean(errors.ein))} font-mono`}
              aria-invalid={Boolean(errors.ein)}
              aria-describedby={errors.ein ? "creatorEin-error" : undefined}
            />
          )}
        />
        <InlineError id="creatorEin-error" message={errors.ein?.message} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="creatorHomeState" className={labelBase}>Home state</label>
          <select
            id="creatorHomeState"
            {...register("homeState")}
            className={selectClass(Boolean(errors.homeState))}
            aria-invalid={Boolean(errors.homeState)}
            aria-describedby={errors.homeState ? "creatorHomeState-error" : undefined}
          >
            <option value="">Select state</option>
            {US_STATES.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <InlineError id="creatorHomeState-error" message={errors.homeState?.message} />
        </div>

        <div>
          <label htmlFor="creatorWorkState" className={labelBase}>Work state</label>
          <select
            id="creatorWorkState"
            {...register("workState")}
            className={selectClass(Boolean(errors.workState))}
            aria-invalid={Boolean(errors.workState)}
            aria-describedby={errors.workState ? "creatorWorkState-error" : undefined}
          >
            <option value="">Select state</option>
            {US_STATES.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <InlineError id="creatorWorkState-error" message={errors.workState?.message} />
        </div>
      </div>

      <WizardActions />
    </form>
  );
}

function CreatorReviewFinish({
  data,
  loading,
  onFinish,
}: {
  data: WizardData;
  loading: boolean;
  onFinish: () => void;
}) {
  const entityLabel =
    CREATOR_ENTITY_TYPES.find((type) => type.value === data.creator.entityType)?.label || "Not set";
  const funding =
    data.creatorBankFunding.method === "plaid"
      ? "Plaid connected"
      : `Manual account ••••${data.creatorBankFunding.accountMask}`;
  const summaryRows = [
    ["Entity type", entityLabel],
    ["Pay yourself", data.creator.paySelfAsOwner ? "Yes" : "No"],
    ["Contractors", String(data.creator.contractorCount)],
    ["Legal name", data.creatorIdentity.legalName],
    ["Business name", data.creatorIdentity.businessName],
    ["EIN", data.creatorIdentity.ein ? maskEin(data.creatorIdentity.ein) : "Not provided"],
    ["Home state", data.creatorIdentity.homeState],
    ["Work state", data.creatorIdentity.workState],
    ["Funding", funding],
  ];

  return (
    <div className="space-y-6 lg:space-y-5">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">Review & finish</h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          Confirm your creator setup. Finishing opens your simplified Creator dashboard.
        </p>
      </header>

      <dl className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
        {summaryRows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm font-bold text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onFinish}
          disabled={loading}
          className="flex h-12 min-w-44 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 lg:h-10"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Finishing...
            </>
          ) : (
            <>
              Finish setup
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Step5Success({ data }: { data: WizardData }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  }, []);

  const accountType = data.account.accountType || "company";
  const accountTypeLabel = ACCOUNT_TYPES.find((type) => type.value === accountType)?.title || "Company";
  const payrollDate = !isFullFlow(accountType)
    ? "Not needed"
    : data.step3.skipPayroll
    ? "Not set"
    : data.step3.firstPayrollDate
      ? new Date(`${data.step3.firstPayrollDate}T00:00:00`).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Not set";
  const employees = accountType === "creator"
    ? `${data.creator.contractorCount} contractors`
    : data.step4.skip
      ? "1 admin"
      : data.step4.isAdminEmployee
        ? "1 employee"
        : "2 employees";

  const actionCards = accountType === "creator"
    ? [
        {
          title: "Open Contractors",
          description: "Invite collaborators and collect W-9s.",
          href: "/contractors",
          icon: FileText,
          tone: "bg-blue-50 text-blue-700 border-blue-100",
        },
        {
          title: "Set Owner Pay",
          description: "Review owner compensation tasks.",
          href: "/app/payroll/run",
          icon: CircleDollarSign,
          tone: "bg-green-50 text-green-700 border-green-100",
        },
        {
          title: "Company Settings",
          description: "Finish entity and account details.",
          href: "/settings/company",
          icon: UserRound,
          tone: "bg-cyan-50 text-cyan-700 border-cyan-100",
        },
      ]
    : [
        {
          title: "Run Your First Payroll",
          description: "Review your pay schedule and launch your first run.",
          href: "/app/payroll/run",
          icon: CircleDollarSign,
          tone: "bg-blue-50 text-blue-700 border-blue-100",
        },
        {
          title: "Add Employees",
          description: "Invite your team and finish employee records.",
          href: "/app/employees/new",
          icon: Users,
          tone: "bg-green-50 text-green-700 border-green-100",
        },
        {
          title: "Set Up Benefits",
          description: "Configure medical, dental, vision, and 401k options.",
          href: "/app/benefits",
          icon: HeartPulse,
          tone: "bg-cyan-50 text-cyan-700 border-cyan-100",
        },
      ];

  return (
    <div className="space-y-7 lg:space-y-5">
      <header className="text-center">
        <h2 className="text-[40px] font-bold leading-tight text-[#0A1628]">
          🎉 You&apos;re all set!
        </h2>
        <p className="mt-3 text-base font-medium text-slate-500 lg:mt-2 lg:text-sm">
          {data.step2.companyName || data.step1.fullName || "Your account"} is on the Starter plan. Estimated first payroll date: {payrollDate}.
        </p>
      </header>

      <dl className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
        {[
          ["Account type", accountTypeLabel],
          ["Account", data.step2.companyName || data.step1.fullName || "Not set"],
          ["Employees", employees],
          ["Plan", "Starter"],
          ["Next payroll", payrollDate],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm font-bold text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-3 lg:grid-cols-3">
        {actionCards.map(({ title, description, href, icon: Icon, tone }) => (
          <Link
            key={href}
            href={href}
            className={`group rounded-lg border p-4 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${tone}`}
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
            <span className="mt-3 block text-sm font-bold leading-tight text-slate-900">
              {title}
            </span>
            <span className="mt-2 block text-xs leading-5 text-slate-600">
              {description}
            </span>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-700">
              Continue
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/app"
        className="flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 lg:h-10"
      >
        Go to dashboard
      </Link>
    </div>
  );
}

function WizardActions({ label = "Next" }: { label?: string }) {
  return (
    <div className="flex justify-end pt-1">
      <button
        type="submit"
        className="flex h-12 min-w-32 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 lg:h-10"
      >
        {label}
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

const stepVariants = {
  initial: (direction: number) => ({ opacity: 0, x: direction * 24 }),
  animate: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -24 }),
};

function sanitizeDraft(data: WizardData) {
  return {
    ...data,
    step1: {
      ...data.step1,
      password: "",
      confirmPassword: "",
    },
    companyBankFunding: {
      ...data.companyBankFunding,
      accountMask: data.companyBankFunding.accountMask,
      routingMask: data.companyBankFunding.routingMask,
      bankAccountToken: data.companyBankFunding.bankAccountToken,
    },
    agencyBankFunding: {
      ...data.agencyBankFunding,
      accountMask: data.agencyBankFunding.accountMask,
      routingMask: data.agencyBankFunding.routingMask,
      bankAccountToken: data.agencyBankFunding.bankAccountToken,
    },
    creatorBankFunding: {
      ...data.creatorBankFunding,
      accountMask: data.creatorBankFunding.accountMask,
      routingMask: data.creatorBankFunding.routingMask,
      bankAccountToken: data.creatorBankFunding.bankAccountToken,
    },
  };
}

function toCompletePayload(data: WizardData, signupMode: SignupMode) {
  const accountType = data.account.accountType || "company";
  const isCompany = accountType === "company";
  const isAgency = accountType === "agency";
  const isCreator = accountType === "creator";
  const adminName = splitName(data.step1.fullName);
  const firstAgencySchedule = data.agencyPaySchedules.schedules[0];
  const agencyTypeLabel =
    AGENCY_TYPES.find((type) => type.value === data.agencyDetails.agencyType)?.label || "Agency";
  const companyStep2 = {
    companyName: data.companyBusiness.legalName,
    companySize: data.companyBusiness.employeeCount,
    industry: data.companyBusiness.industry,
    primaryState: data.companyBusiness.workStates[0] || "",
    multipleStates: data.companyBusiness.workStates.length > 1,
    dba: data.companyBusiness.dba,
    ein: data.companyBusiness.ein,
    entityType: data.companyBusiness.entityType,
    workStates: data.companyBusiness.workStates,
  };
  const companyStep3 = {
    ein: data.companyBusiness.ein,
    paySchedule: data.companyPaySchedule.frequency,
    firstPayrollDate: data.companyPaySchedule.firstPayDate,
    payPeriodStart: data.companyPaySchedule.payPeriodStart,
    payPeriodEnd: data.companyPaySchedule.payPeriodEnd,
    skipPayroll: false,
  };
  const companyStep4 = {
    isAdminEmployee: true,
    firstName: adminName.firstName,
    lastName: adminName.lastName,
    employeeEmail: data.step1.email,
    title: data.step1.role === "owner" ? "Owner" : "Administrator",
    startDate: "",
    payType: "salary",
    payRate: "",
    skip: true,
  };
  const agencyStep2 = {
    companyName: data.agencyDetails.legalName,
    companySize: data.agencyDetails.internalStaffCount,
    industry: `${agencyTypeLabel} agency`,
    primaryState: "",
    multipleStates: false,
    ein: data.agencyDetails.ein,
    agencyType: data.agencyDetails.agencyType,
    internalStaffCount: data.agencyDetails.internalStaffCount,
    contractorCount: data.agencyDetails.contractorCount,
  };
  const agencyStep3 = {
    ein: data.agencyDetails.ein,
    paySchedule: firstAgencySchedule?.frequency || "",
    firstPayrollDate: firstAgencySchedule?.firstPayDate || "",
    skipPayroll: false,
  };
  const agencyStep4 = {
    isAdminEmployee: true,
    firstName: adminName.firstName,
    lastName: adminName.lastName,
    employeeEmail: data.step1.email,
    title: data.step1.role === "owner" ? "Owner" : "Administrator",
    startDate: "",
    payType: "salary",
    payRate: "",
    skip: true,
  };
  const creatorAccountName =
    data.creatorIdentity.businessName ||
    data.creatorIdentity.legalName ||
    `${data.step1.fullName || "Creator"} Studio`;
  const creatorStep2 = {
    companyName: creatorAccountName,
    companySize: "1",
    industry: "Creator",
    primaryState: data.creatorIdentity.workState || data.creatorIdentity.homeState,
    multipleStates:
      Boolean(data.creatorIdentity.homeState && data.creatorIdentity.workState) &&
      data.creatorIdentity.homeState !== data.creatorIdentity.workState,
    legalName: data.creatorIdentity.legalName,
    businessName: data.creatorIdentity.businessName,
    ein: data.creatorIdentity.ein,
    entityType: data.creator.entityType,
  };
  const creatorStep3 = {
    ...INITIAL_DATA.step3,
    skipPayroll: true,
  };
  const creatorStep4 = {
    ...INITIAL_DATA.step4,
    firstName: adminName.firstName,
    lastName: adminName.lastName,
    employeeEmail: data.step1.email,
    title: "Owner",
    skip: true,
  };

  return {
    account: data.account,
    step1: data.step1,
    step2: isCompany ? companyStep2 : isAgency ? agencyStep2 : isCreator ? creatorStep2 : data.step2,
    step3: isCompany ? companyStep3 : isAgency ? agencyStep3 : isCreator ? creatorStep3 : data.step3,
    step4: isCompany
      ? companyStep4
      : isAgency
        ? agencyStep4
        : isCreator
          ? creatorStep4
          : {
          isAdminEmployee: data.step4.isAdminEmployee,
          firstName: data.step4.firstName,
          lastName: data.step4.lastName,
          employeeEmail: data.step4.workEmail,
          title: data.step4.jobTitle,
          startDate: data.step4.startDate,
          payType: data.step4.payType,
          payRate: data.step4.payRate,
          skip: data.step4.skip,
        },
    business: isCompany ? data.companyBusiness : null,
    bankFunding: isCompany ? data.companyBankFunding : null,
    taxSetup: isCompany ? data.companyTaxSetup : null,
    paySchedule: isCompany ? data.companyPaySchedule : null,
    employeeInvites: isCompany
      ? {
          emails: parseInviteEmails(data.companyInvites.emails),
          skip: data.companyInvites.skip,
        }
      : null,
    agencyDetails: isAgency ? data.agencyDetails : null,
    agencyBankFunding: isAgency ? data.agencyBankFunding : null,
    agencyTaxSetup: isAgency ? data.agencyTaxSetup : null,
    agencyFirstClient: isAgency ? data.agencyFirstClient : null,
    agencyPaySchedules: isAgency ? data.agencyPaySchedules : null,
    creator: data.creator,
    creatorIdentity: isCreator ? data.creatorIdentity : null,
    creatorBankFunding: isCreator ? data.creatorBankFunding : null,
    googleAuth: signupMode !== "email",
  };
}

function isDraftShape(value: unknown): value is { step: number; data: Partial<WizardData> } {
  if (!value || typeof value !== "object") return false;
  const draft = value as { step?: unknown; data?: unknown };
  return typeof draft.step === "number" && !!draft.data && typeof draft.data === "object";
}

function getSignupMode(rawMode: string | null): SignupMode {
  if (rawMode === "google") return "google";
  if (rawMode === "microsoft") return "microsoft";
  return "email";
}

function getAdminRoleFromSearch(rawRole: string | null): AdminRole {
  return rawRole === "admin" ? "admin" : "owner";
}

function normalizeAccountType(value: unknown): AccountType | "" {
  if (typeof value !== "string") return "";
  const normalized = value.trim().toLowerCase().replace(/[/-]+/g, "_").replace(/\s+/g, "_");
  if (normalized === "creator_solo" || normalized === "solo_creator" || normalized === "solo") return "creator";
  return normalized === "company" || normalized === "agency" || normalized === "creator" ? normalized : "";
}

function normalizeCreatorEntityType(value: unknown): CreatorEntityType {
  if (typeof value !== "string") return "";
  const normalized = value.trim().toLowerCase().replace(/[/-]+/g, "_").replace(/\s+/g, "_");
  if (normalized === "sole_prop" || normalized === "sole_proprietorship") return "sole_prop";
  if (normalized === "llc" || normalized === "smllc" || normalized === "single_member_llc") return "smllc";
  if (normalized === "mmllc" || normalized === "multi_member_llc") return "mmllc";
  if (normalized === "s_corp" || normalized === "scorp" || normalized === "s_corporation") return "s_corp";
  return "";
}

function getAccountTypeFromSearch(rawType: string | null, rawPlan: string | null): AccountType | "" {
  const accountType = normalizeAccountType(rawType);
  if (accountType) return accountType;
  if (rawPlan === "contractor") return "creator";
  return "";
}

function getStepFromSearch(rawStep: string | null) {
  if (!rawStep) return null;
  const parsed = Number(rawStep);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= FULL_FLOW_STEP_COUNT
    ? parsed - 1
    : null;
}

function SignupWizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signupMode = getSignupMode(searchParams.get("mode"));
  const isOAuthSignup = signupMode !== "email";
  const oauthEmail = searchParams.get("email") || "";
  const oauthName = searchParams.get("name") || "";
  const initialAccountType = getAccountTypeFromSearch(
    searchParams.get("accountType"),
    searchParams.get("plan")
  );
  const requestedStep = getStepFromSearch(searchParams.get("step"));
  const requestedRole = getAdminRoleFromSearch(searchParams.get("role"));

  const [step, setStep] = useState(() => {
    const initialStep =
      requestedStep && !initialAccountType
        ? 0
          : requestedStep !== null
            ? requestedStep
            : isOAuthSignup && initialAccountType
            ? initialAccountType === "company" || initialAccountType === "agency"
              ? 3
              : 2
            : 0;

    return Math.min(initialStep, getSuccessStep(initialAccountType));
  });
  const [direction, setDirection] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>(() => ({
    ...INITIAL_DATA,
    account: {
      accountType: initialAccountType,
    },
    step1: isOAuthSignup
      ? {
          fullName: oauthName,
          email: oauthEmail,
          password: "__oauth_password__",
          confirmPassword: "__oauth_password__",
          agreedToTerms: true,
          role: requestedRole,
        }
      : {
          ...INITIAL_DATA.step1,
          role: requestedRole,
        },
    step4: isOAuthSignup
      ? {
          ...INITIAL_DATA.step4,
          firstName: splitName(oauthName).firstName,
          lastName: splitName(oauthName).lastName,
          workEmail: oauthEmail,
        }
      : INITIAL_DATA.step4,
  }));
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [draftCandidate, setDraftCandidate] = useState<{ step: number; data: Partial<WizardData> } | null>(null);
  const [apiError, setApiError] = useState("");
  const [completionLoading, setCompletionLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<SignupProvider | null>(null);

  const accountType = wizardData.account.accountType;
  const companyPath = accountType === "company";
  const agencyPath = accountType === "agency";
  const creatorPath = accountType === "creator";
  const successStep = getSuccessStep(accountType);
  const hasProgress = step > 0 && step < successStep;

  const updateStepUrl = useCallback(
    (nextStep: number, nextAccountType = accountType) => {
      const params = new URLSearchParams(window.location.search);
      params.set("step", String(nextStep + 1));
      if (nextAccountType) {
        params.set("accountType", nextAccountType);
      }
      router.replace(`/signup?${params.toString()}`, { scroll: false });
    },
    [accountType, router]
  );

  const goTo = useCallback((nextStep: number, nextDirection = 1, nextAccountType = accountType) => {
    setDirection(nextDirection);
    setStep(nextStep);
    updateStepUrl(nextStep, nextAccountType);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, [accountType, updateStepUrl]);

  useEffect(() => {
    if (!searchParams.get("step")) {
      updateStepUrl(step);
    }
  }, [searchParams, step, updateStepUrl]);

  const saveDraftLocal = useCallback((nextStep: number, nextData: WizardData) => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          step: nextStep,
          data: sanitizeDraft(nextData),
          savedAt: new Date().toISOString(),
        })
      );
    } catch {
      // Local draft persistence is best effort.
    }
  }, []);

  const saveDraftBackend = useCallback(async (nextStep: number, nextData: WizardData) => {
    try {
      await fetch("/api/auth/signup/partial", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: nextData.step1.email,
          step: nextStep,
          data: sanitizeDraft(nextData),
        }),
      });
    } catch {
      // The user can still proceed if autosave is unavailable.
    }
  }, []);

  const clearDrafts = useCallback(async () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}

    try {
      await fetch("/api/auth/signup/partial", {
        method: "DELETE",
        credentials: "include",
      });
    } catch {}
  }, []);

  const advance = useCallback(
    async (patch: Partial<WizardData>, nextStep: number) => {
      const nextData = { ...wizardData, ...patch };
      setWizardData(nextData);
      saveDraftLocal(nextStep, nextData);
      await saveDraftBackend(nextStep, nextData);
      goTo(nextStep, 1, nextData.account.accountType);
    },
    [goTo, saveDraftBackend, saveDraftLocal, wizardData]
  );

  useEffect(() => {
    if (isOAuthSignup) return;

    async function loadDraft() {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as unknown;
          if (isDraftShape(parsed) && parsed.step > 0) {
            setDraftCandidate(parsed);
            setShowDraftBanner(true);
            return;
          }
        }
      } catch {}

      try {
        const response = await fetch("/api/auth/signup/partial", {
          credentials: "include",
        });
        if (!response.ok) return;
        const body = (await response.json()) as unknown;
        const payload = body as { draft?: unknown };
        if (isDraftShape(payload.draft) && payload.draft.step > 0) {
          setDraftCandidate(payload.draft);
          setShowDraftBanner(true);
        }
      } catch {}
    }

    void loadDraft();
  }, [isOAuthSignup]);

  useEffect(() => {
    if (!hasProgress) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasProgress]);

  const restoreDraft = () => {
    if (!draftCandidate) return;
    const draftData = draftCandidate.data;
    const restoredAccountType = normalizeAccountType(draftData.account?.accountType);
    const restored: WizardData = {
      ...INITIAL_DATA,
      account: {
        accountType: restoredAccountType,
      },
      step1: {
        ...INITIAL_DATA.step1,
        ...(draftData.step1 ?? {}),
      },
      companyBusiness: {
        ...INITIAL_DATA.companyBusiness,
        ...(draftData.companyBusiness ?? {}),
      },
      companyBankFunding: {
        ...INITIAL_DATA.companyBankFunding,
        ...(draftData.companyBankFunding ?? {}),
      },
      companyTaxSetup: {
        ...INITIAL_DATA.companyTaxSetup,
        ...(draftData.companyTaxSetup ?? {}),
      },
      companyPaySchedule: {
        ...INITIAL_DATA.companyPaySchedule,
        ...(draftData.companyPaySchedule ?? {}),
      },
      companyInvites: {
        ...INITIAL_DATA.companyInvites,
        ...(draftData.companyInvites ?? {}),
      },
      agencyDetails: {
        ...INITIAL_DATA.agencyDetails,
        ...(draftData.agencyDetails ?? {}),
      },
      agencyBankFunding: {
        ...INITIAL_DATA.agencyBankFunding,
        ...(draftData.agencyBankFunding ?? {}),
      },
      agencyTaxSetup: {
        ...INITIAL_DATA.agencyTaxSetup,
        ...(draftData.agencyTaxSetup ?? {}),
      },
      agencyFirstClient: {
        ...INITIAL_DATA.agencyFirstClient,
        ...(draftData.agencyFirstClient ?? {}),
      },
      agencyPaySchedules: {
        ...INITIAL_DATA.agencyPaySchedules,
        ...(draftData.agencyPaySchedules ?? {}),
      },
      step2: {
        ...INITIAL_DATA.step2,
        ...(draftData.step2 ?? {}),
      },
      step3: {
        ...INITIAL_DATA.step3,
        ...(draftData.step3 ?? {}),
      },
      step4: {
        ...INITIAL_DATA.step4,
        ...(draftData.step4 ?? {}),
      },
      creator: {
        ...INITIAL_DATA.creator,
        ...(draftData.creator ?? {}),
        entityType: normalizeCreatorEntityType(draftData.creator?.entityType),
      },
      creatorIdentity: {
        ...INITIAL_DATA.creatorIdentity,
        ...(draftData.creatorIdentity ?? {}),
      },
      creatorBankFunding: {
        ...INITIAL_DATA.creatorBankFunding,
        ...(draftData.creatorBankFunding ?? {}),
      },
    };

    setWizardData(restored);
    setShowDraftBanner(false);
    setDraftCandidate(null);
    const resumeStep = restored.step1.password
      ? Math.min(draftCandidate.step, getSuccessStep(restored.account.accountType))
      : restored.account.accountType
        ? 1
        : 0;
    goTo(
      resumeStep,
      1,
      restored.account.accountType
    );
  };

  const discardDraft = async () => {
    setShowDraftBanner(false);
    setDraftCandidate(null);
    await clearDrafts();
  };

  const handleOAuthSignup = async (provider: SignupProvider) => {
    setOauthLoading(provider);
    setApiError("");

    const supabase = createSupabaseBrowserClient();
    const callbackParams = new URLSearchParams();
    if (accountType) callbackParams.set("accountType", accountType);
    if (accountType === "company" || accountType === "agency") callbackParams.set("step", "4");
    callbackParams.set("role", wizardData.step1.role);
    const callbackQuery = callbackParams.toString();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback${callbackQuery ? `?${callbackQuery}` : ""}`,
      },
    });

    if (error) {
      setApiError(error.message || "SSO signup failed. Please try again.");
      setOauthLoading(null);
    }
  };

  const completeSignup = async (
    nextData: WizardData,
    options: { redirectToDashboard?: boolean } = {},
  ) => {
    setCompletionLoading(true);
    setApiError("");

    try {
      const nextSuccessStep = getSuccessStep(nextData.account.accountType);
      await saveDraftBackend(nextSuccessStep, nextData);

      const response = await fetch("/api/auth/signup/complete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toCompletePayload(nextData, signupMode)),
      });

      if (!response.ok) {
        let message = "Something went wrong. Please try again.";
        try {
          const body = (await response.json()) as { error?: string };
          message = body.error || message;
        } catch {}
        setApiError(message);
        return;
      }

      setWizardData(nextData);
      await clearDrafts();
      if (options.redirectToDashboard) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }
      goTo(nextSuccessStep, 1, nextData.account.accountType);
      router.refresh();
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setCompletionLoading(false);
    }
  };

  const finishCompanySignup = () => {
    void completeSignup(wizardData, { redirectToDashboard: true });
  };

  const finishAgencySignup = () => {
    void completeSignup(wizardData, { redirectToDashboard: true });
  };

  const finishCreatorSignup = () => {
    void completeSignup(wizardData, { redirectToDashboard: true });
  };

  const handleStep4Complete = (step4: WizardData["step4"]) => {
    const nextData = { ...wizardData, step4 };
    void completeSignup(nextData);
  };

  const handleStep4Skip = () => {
    const nextData = {
      ...wizardData,
      step4: {
        ...INITIAL_DATA.step4,
        skip: true,
      },
    };
    void completeSignup(nextData);
  };

  return (
    <main className="flex min-h-screen bg-white text-slate-950 selection:bg-blue-200 lg:h-screen lg:overflow-hidden">
      <AnimatePresence>
        {showDraftBanner && (
          <motion.div
            initial={{ y: -56 }}
            animate={{ y: 0 }}
            exit={{ y: -56 }}
            className="fixed inset-x-0 top-0 z-50 flex min-h-14 items-center justify-between gap-4 bg-blue-600 px-4 py-3 text-white shadow-lg"
          >
            <p className="text-sm font-bold">You have an unfinished signup — continue?</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={restoreDraft}
                className="rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-blue-700"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={() => void discardDraft()}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
                aria-label="Dismiss unfinished signup"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="hidden h-screen w-1/2 flex-col overflow-y-auto overflow-x-hidden bg-[#0A1628] px-8 py-7 text-white lg:flex xl:px-12">
        <div>
          <Link
            href="/"
            className="inline-flex rounded-lg text-white transition-colors hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <CircleWorksLogo />
            <span className="sr-only">Home</span>
          </Link>

          <h1 className="mt-8 max-w-md text-[38px] font-bold leading-[1.1] xl:text-[42px]">
            Join 5,000+ US companies
          </h1>
        </div>

        <div className="mt-8 space-y-5">
          <div>
            <p className="text-sm font-bold uppercase text-blue-200">Signup progress</p>
            <div className="mt-3">
              <LeftStepRail step={step} accountType={accountType} />
            </div>
          </div>

          <RotatingTestimonial />
        </div>
      </aside>

      <section className="relative flex min-h-screen min-w-0 w-full flex-col overflow-x-hidden bg-white lg:h-screen lg:w-1/2 lg:overflow-y-auto">
        <div className="sticky top-0 z-20 flex items-center justify-between bg-white px-5 py-5 sm:px-8">
          {step > 0 && step < successStep ? (
            <button
              type="button"
              onClick={() => goTo(isOAuthSignup && accountType === "creator" && step === 2 ? 0 : step - 1, -1)}
              className="inline-flex items-center gap-2 rounded-lg px-1 py-2 text-sm font-bold text-slate-600 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
          ) : (
            <span aria-hidden="true" />
          )}
          <Link
            href="/login"
            className="rounded-lg bg-[#0A1628] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Sign in
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 pb-16 sm:px-8 lg:max-w-2xl lg:justify-start lg:px-10 lg:py-8 xl:max-w-3xl xl:px-12">
          <StepProgress step={step} accountType={accountType} />

          {apiError && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
            >
              {apiError}
            </div>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.18 }}
            >
              {step === 0 && (
                <AccountTypeForm
                  data={wizardData.account}
                  onComplete={(account) =>
                    void advance(
                      { account },
                      account.accountType === "creator" && isOAuthSignup ? 2 : 1,
                    )
                  }
                />
              )}

              {step === 1 && companyPath && (
                <CompanyBusinessDetailsForm
                  data={wizardData.companyBusiness}
                  onComplete={(companyBusiness) => void advance({ companyBusiness }, 2)}
                />
              )}

              {step === 1 && agencyPath && (
                <AgencyDetailsForm
                  data={wizardData.agencyDetails}
                  onComplete={(agencyDetails) => void advance({ agencyDetails }, 2)}
                />
              )}

              {step === 1 && creatorPath && (
                <Step1Form
                  data={wizardData.step1}
                  onComplete={(step1) => void advance({ step1 }, 2)}
                  onOAuth={handleOAuthSignup}
                  oauthLoading={oauthLoading}
                />
              )}

              {step === 2 && companyPath && (
                <Step1Form
                  data={wizardData.step1}
                  onComplete={(step1) => void advance({ step1 }, 3)}
                  onOAuth={handleOAuthSignup}
                  oauthLoading={oauthLoading}
                />
              )}

              {step === 2 && accountType === "agency" && (
                <Step1Form
                  data={wizardData.step1}
                  onComplete={(step1) => void advance({ step1 }, 3)}
                  onOAuth={handleOAuthSignup}
                  oauthLoading={oauthLoading}
                />
              )}

              {step === 2 && creatorPath && (
                <CreatorSoloForm
                  data={wizardData.creator}
                  onComplete={(creator) => void advance({ creator }, 3)}
                />
              )}

              {step === 3 && companyPath && (
                <CompanyBankFundingForm
                  data={wizardData.companyBankFunding}
                  onComplete={(companyBankFunding) => void advance({ companyBankFunding }, 4)}
                />
              )}

              {step === 3 && accountType === "agency" && (
                <CompanyBankFundingForm
                  data={wizardData.agencyBankFunding}
                  onComplete={(agencyBankFunding) => void advance({ agencyBankFunding }, 4)}
                />
              )}

              {step === 3 && creatorPath && (
                <CreatorIdentityBusinessForm
                  data={wizardData.creatorIdentity}
                  onComplete={(creatorIdentity) => void advance({ creatorIdentity }, 4)}
                />
              )}

              {step === 4 && companyPath && (
                <CompanyTaxSetupForm
                  data={wizardData.companyTaxSetup}
                  business={wizardData.companyBusiness}
                  onComplete={(companyTaxSetup) => void advance({ companyTaxSetup }, 5)}
                />
              )}

              {step === 4 && accountType === "agency" && (
                <AgencyTaxSetupForm
                  data={wizardData.agencyTaxSetup}
                  agency={wizardData.agencyDetails}
                  onComplete={(agencyTaxSetup) => void advance({ agencyTaxSetup }, 5)}
                />
              )}

              {step === 4 && creatorPath && (
                <CompanyBankFundingForm
                  data={wizardData.creatorBankFunding}
                  onComplete={(creatorBankFunding) => void advance({ creatorBankFunding }, 5)}
                />
              )}

              {step === 5 && companyPath && (
                <CompanyPayScheduleForm
                  data={wizardData.companyPaySchedule}
                  onComplete={(companyPaySchedule) => void advance({ companyPaySchedule }, 6)}
                />
              )}

              {step === 5 && agencyPath && (
                <AgencyFirstClientForm
                  data={wizardData.agencyFirstClient}
                  onComplete={(agencyFirstClient) => void advance({ agencyFirstClient }, 6)}
                  onSkip={() =>
                    void advance(
                      {
                        agencyFirstClient: {
                          ...INITIAL_DATA.agencyFirstClient,
                          skip: true,
                        },
                      },
                      6,
                    )
                  }
                />
              )}

              {step === 6 && companyPath && (
                <CompanyInviteEmployeesForm
                  data={wizardData.companyInvites}
                  onComplete={(companyInvites) => void advance({ companyInvites }, 7)}
                  onSkip={() =>
                    void advance(
                      {
                        companyInvites: {
                          emails: "",
                          skip: true,
                        },
                      },
                      7,
                    )
                  }
                />
              )}

              {step === 6 && agencyPath && (
                <AgencyPaySchedulesForm
                  data={wizardData.agencyPaySchedules}
                  onComplete={(agencyPaySchedules) => void advance({ agencyPaySchedules }, 7)}
                />
              )}

              {step === 7 && companyPath && (
                <CompanyReviewFinish
                  data={wizardData}
                  loading={completionLoading}
                  onFinish={finishCompanySignup}
                />
              )}

              {step === 7 && agencyPath && (
                <AgencyReviewFinish
                  data={wizardData}
                  loading={completionLoading}
                  onFinish={finishAgencySignup}
                />
              )}

              {step === 5 && creatorPath && (
                <CreatorReviewFinish
                  data={wizardData}
                  loading={completionLoading}
                  onFinish={finishCreatorSignup}
                />
              )}

              {step === successStep && !companyPath && !agencyPath && !creatorPath && <Step5Success data={wizardData} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}

export default function SignupWizard() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-label="Loading signup" />
        </div>
      }
    >
      <SignupWizardInner />
    </Suspense>
  );
}
