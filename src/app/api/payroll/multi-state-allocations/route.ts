import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { recordCompanyRealtimeEvent } from "@/lib/realtime-event-log";

type AllocationInput = {
  state: string;
  percentage: number;
};

type MultiStateAllocation = {
  id: string;
  employeeId: string;
  employeeName: string;
  avatar: string;
  role: string;
  primaryState: string;
  additionalStates: string[];
  allocations: Array<AllocationInput & {
    taxRate: number;
    proratedGross: number;
    estimatedStateTax: number;
  }>;
  effectiveDate: string;
  updatedAt: string;
  grossPayBasis: number;
  history: Array<{
    id: string;
    date: string;
    description: string;
  }>;
};

const STATE_TAX_RATES: Record<string, number> = {
  AL: 0.05,
  AZ: 0.025,
  CA: 0.093,
  CO: 0.044,
  CT: 0.055,
  DC: 0.085,
  GA: 0.0575,
  IL: 0.0495,
  MA: 0.05,
  MD: 0.0575,
  MI: 0.0425,
  MN: 0.068,
  NC: 0.045,
  NJ: 0.0637,
  NY: 0.0685,
  OH: 0.0399,
  OR: 0.0875,
  PA: 0.0307,
  TX: 0,
  VA: 0.0575,
  WA: 0,
  WI: 0.053,
};

const saveSchema = z
  .object({
    employeeId: z.string().min(1),
    employeeName: z.string().min(1),
    role: z.string().min(1),
    avatar: z.string().min(1),
    primaryState: z.string().length(2),
    effectiveDate: z.string().min(1),
    allocations: z
      .array(
        z.object({
          state: z.string().length(2),
          percentage: z.coerce.number().min(0).max(100),
        })
      )
      .min(1),
  })
  .superRefine((value, ctx) => {
    const total = value.allocations.reduce((sum, row) => sum + row.percentage, 0);
    if (total !== 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Allocation must equal 100%",
        path: ["allocations"],
      });
    }
  });

const removeSchema = z.object({
  action: z.literal("remove"),
  employeeId: z.string().min(1),
});

const DEFAULT_GROSS_PAY = 10_000;

let allocations: MultiStateAllocation[] = [
  buildAllocation({
    employeeId: "1",
    employeeName: "Sarah Smith",
    role: "Lead Engineer",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=transparent",
    primaryState: "NY",
    effectiveDate: "2026-06-05",
    allocations: [
      { state: "NY", percentage: 60 },
      { state: "NJ", percentage: 40 },
    ],
  }),
  buildAllocation({
    employeeId: "4",
    employeeName: "David Lee",
    role: "Sales Director",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=David&backgroundColor=transparent",
    primaryState: "TX",
    effectiveDate: "2026-06-05",
    allocations: [
      { state: "TX", percentage: 70 },
      { state: "CA", percentage: 30 },
    ],
  }),
  buildAllocation({
    employeeId: "6",
    employeeName: "James Patterson",
    role: "Finance Manager",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=James&backgroundColor=transparent",
    primaryState: "DC",
    effectiveDate: "2026-06-05",
    allocations: [
      { state: "DC", percentage: 50 },
      { state: "MD", percentage: 30 },
      { state: "VA", percentage: 20 },
    ],
  }),
];

function money(value: number) {
  return Math.round(value * 100) / 100;
}

function buildAllocation(input: z.infer<typeof saveSchema>): MultiStateAllocation {
  const now = new Date().toISOString();
  const enrichedAllocations = input.allocations.map((allocation) => {
    const proratedGross = money(DEFAULT_GROSS_PAY * (allocation.percentage / 100));
    const taxRate = STATE_TAX_RATES[allocation.state] ?? 0.045;
    return {
      ...allocation,
      taxRate,
      proratedGross,
      estimatedStateTax: money(proratedGross * taxRate),
    };
  });

  return {
    id: `msa-${input.employeeId}`,
    employeeId: input.employeeId,
    employeeName: input.employeeName,
    avatar: input.avatar,
    role: input.role,
    primaryState: input.primaryState,
    additionalStates: input.allocations
      .map((allocation) => allocation.state)
      .filter((state) => state !== input.primaryState),
    allocations: enrichedAllocations,
    effectiveDate: input.effectiveDate,
    updatedAt: now,
    grossPayBasis: DEFAULT_GROSS_PAY,
    history: [
      {
        id: `hist-${input.employeeId}-${Date.now()}`,
        date: now,
        description: `Allocation set to ${input.allocations
          .map((allocation) => `${allocation.state} ${allocation.percentage}%`)
          .join(", ")}`,
      },
    ],
  };
}

function emitMultiStateUpdated(payload: Record<string, unknown>) {
  recordCompanyRealtimeEvent(1, "payroll.multistate.updated", payload);

  const globalWithIo = globalThis as typeof globalThis & {
    io?: {
      to: (room: string) => {
        emit: (event: string, data: Record<string, unknown>) => void;
      };
    };
  };

  globalWithIo.io?.to("company:1").emit("payroll.multistate.updated", payload);
}

export async function GET() {
  return NextResponse.json({
    success: true,
    allocations,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const removeParse = removeSchema.safeParse(body);
    if (removeParse.success) {
      allocations = allocations.filter((allocation) => allocation.employeeId !== removeParse.data.employeeId);
      emitMultiStateUpdated({
        action: "remove",
        employeeId: removeParse.data.employeeId,
      });
      return NextResponse.json({ success: true });
    }

    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid allocation payload",
        },
        { status: 400 }
      );
    }

    const existing = allocations.find((allocation) => allocation.employeeId === parsed.data.employeeId);
    const nextAllocation = buildAllocation(parsed.data);
    if (existing) {
      nextAllocation.history = [
        nextAllocation.history[0],
        ...existing.history,
      ];
    }

    allocations = [
      nextAllocation,
      ...allocations.filter((allocation) => allocation.employeeId !== parsed.data.employeeId),
    ];

    emitMultiStateUpdated({
      action: existing ? "update" : "create",
      employeeId: nextAllocation.employeeId,
      allocationId: nextAllocation.id,
      effectiveDate: nextAllocation.effectiveDate,
    });

    return NextResponse.json({
      success: true,
      allocation: nextAllocation,
    });
  } catch (error) {
    console.error("[POST /api/payroll/multi-state-allocations]", error);
    return NextResponse.json(
      { success: false, error: "Failed to save allocation" },
      { status: 500 }
    );
  }
}
