import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type TipRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  payPeriod: string;
  hoursWorked: number;
  grossReceipts: number;
  declaredTips: number;
  allocatedTips: number;
  totalTips: number;
  ficaOnTips: number;
  minimumWageTipPortion: number;
  netTipCredit: number;
  state: string;
  source: "manual" | "Square" | "Toast" | "Clover";
};

type TipPool = {
  id: string;
  name: string;
  distributionMethod: "hours" | "points" | "percentage";
  participatingEmployeeIds: string[];
  payPeriod: string;
  poolAmount: number;
  overrides: Record<string, number>;
  state: string;
  complianceFlag?: string;
  status: "active" | "draft";
};

const FICA_RATE = 0.0765;
const FEDERAL_MINIMUM_WAGE = 7.25;
const PAY_PERIOD = "May 1-15, 2026";

const employees = [
  { id: "EMP-1042", name: "Maria Santos", role: "Bartender", state: "CA" },
  { id: "EMP-1105", name: "David Martinez", role: "Server", state: "NY" },
  { id: "EMP-1089", name: "Aisha Johnson", role: "Server", state: "IL" },
  { id: "EMP-1135", name: "Raj Patel", role: "Busser", state: "TX" },
  { id: "EMP-1140", name: "Lisa Thompson", role: "Server", state: "CO" },
];

let tipRecords: TipRecord[] = [
  createTipRecord({ employeeId: "EMP-1042", employeeName: "Maria Santos", role: "Bartender", state: "CA", hoursWorked: 65, grossReceipts: 17_400, declaredTips: 1_250, source: "Toast" }),
  createTipRecord({ employeeId: "EMP-1105", employeeName: "David Martinez", role: "Server", state: "NY", hoursWorked: 72, grossReceipts: 19_200, declaredTips: 1_420.5, source: "Square" }),
  createTipRecord({ employeeId: "EMP-1089", employeeName: "Aisha Johnson", role: "Server", state: "IL", hoursWorked: 50, grossReceipts: 13_900, declaredTips: 890, source: "Clover" }),
  createTipRecord({ employeeId: "EMP-1135", employeeName: "Raj Patel", role: "Busser", state: "TX", hoursWorked: 40, grossReceipts: 7_600, declaredTips: 320, source: "manual" }),
  createTipRecord({ employeeId: "EMP-1140", employeeName: "Lisa Thompson", role: "Server", state: "CO", hoursWorked: 80, grossReceipts: 18_900, declaredTips: 1_100, source: "Square" }),
];

let tipPools: TipPool[] = [
  {
    id: "pool-1",
    name: "Front of House Weekly",
    distributionMethod: "hours",
    participatingEmployeeIds: ["EMP-1042", "EMP-1105", "EMP-1089", "EMP-1140"],
    payPeriod: PAY_PERIOD,
    poolAmount: 4_500,
    overrides: {},
    state: "NY",
    status: "active",
  },
  {
    id: "pool-2",
    name: "Bar Team",
    distributionMethod: "points",
    participatingEmployeeIds: ["EMP-1042", "EMP-1135"],
    payPeriod: PAY_PERIOD,
    poolAmount: 1_200,
    overrides: { "EMP-1042": 750 },
    state: "CA",
    status: "active",
    complianceFlag: "CA requires careful treatment of mandatory tip pools and manager participation.",
  },
];

let form8027 = {
  isLargeEstablishment: false,
  allocationMethod: "hours" as "hours" | "gross" | "goodfaith",
  grossReceipts: 77_000,
  chargeReceipts: 52_400,
  chargedTips: 7_250,
};

const updateDeclaredSchema = z.object({
  action: z.literal("update_declared"),
  id: z.string(),
  declaredTips: z.coerce.number().min(0),
});

const importCsvSchema = z.object({
  action: z.literal("import_csv"),
  provider: z.enum(["Square", "Toast", "Clover"]).default("Square"),
  rows: z.array(
    z.object({
      employeeId: z.string().optional(),
      employeeName: z.string().optional(),
      declaredTips: z.coerce.number().min(0),
      grossReceipts: z.coerce.number().min(0).optional(),
      hoursWorked: z.coerce.number().min(0).optional(),
    })
  ),
});

const set8027Schema = z.object({
  action: z.literal("set_8027"),
  isLargeEstablishment: z.boolean().optional(),
  allocationMethod: z.enum(["hours", "gross", "goodfaith"]).optional(),
});

const createPoolSchema = z.object({
  action: z.literal("create_pool"),
  pool: z.object({
    name: z.string().min(1),
    distributionMethod: z.enum(["hours", "points", "percentage"]),
    participatingEmployeeIds: z.array(z.string()).min(1),
    poolAmount: z.coerce.number().min(0),
    state: z.string().length(2).default("CA"),
  }),
});

const updatePoolOverrideSchema = z.object({
  action: z.literal("update_pool_override"),
  poolId: z.string(),
  employeeId: z.string(),
  amount: z.coerce.number().min(0),
});

function money(value: number) {
  return Math.round(value * 100) / 100;
}

function calculateTips(input: Omit<TipRecord, "totalTips" | "ficaOnTips" | "minimumWageTipPortion" | "netTipCredit">): TipRecord {
  const totalTips = money(input.declaredTips + input.allocatedTips);
  const ficaOnTips = money(totalTips * FICA_RATE);
  const minimumWageTipPortion = money(Math.min(totalTips, input.hoursWorked * FEDERAL_MINIMUM_WAGE));
  const ficaAttributableToMinimumWage = money(minimumWageTipPortion * FICA_RATE);
  const netTipCredit = money(Math.max(0, ficaOnTips - ficaAttributableToMinimumWage));

  return {
    ...input,
    totalTips,
    ficaOnTips,
    minimumWageTipPortion,
    netTipCredit,
  };
}

function createTipRecord(input: {
  employeeId: string;
  employeeName: string;
  role: string;
  state: string;
  hoursWorked: number;
  grossReceipts: number;
  declaredTips: number;
  source: TipRecord["source"];
  allocatedTips?: number;
}): TipRecord {
  return calculateTips({
    id: `tip-${input.employeeId}`,
    employeeId: input.employeeId,
    employeeName: input.employeeName,
    role: input.role,
    payPeriod: PAY_PERIOD,
    hoursWorked: input.hoursWorked,
    grossReceipts: input.grossReceipts,
    declaredTips: input.declaredTips,
    allocatedTips: input.allocatedTips ?? 0,
    state: input.state,
    source: input.source,
  });
}

function buildForm8027(records: TipRecord[]) {
  const totalDeclaredTips = money(records.reduce((sum, row) => sum + row.declaredTips, 0));
  const eightPercentThreshold = money(form8027.grossReceipts * 0.08);
  const allocationShortfall = money(Math.max(0, eightPercentThreshold - totalDeclaredTips));

  return {
    ...form8027,
    totalDeclaredTips,
    eightPercentThreshold,
    allocationShortfall,
    needsAllocation: allocationShortfall > 0,
  };
}

function buildSummary(records: TipRecord[]) {
  const totalFicaPaid = money(records.reduce((sum, row) => sum + row.ficaOnTips, 0));
  const portionAttributableToMinimumWage = money(
    records.reduce((sum, row) => sum + row.minimumWageTipPortion * FICA_RATE, 0)
  );
  return {
    totalFicaPaid,
    portionAttributableToMinimumWage,
    eligibleCredit: money(Math.max(0, totalFicaPaid - portionAttributableToMinimumWage)),
    totalDeclaredTips: money(records.reduce((sum, row) => sum + row.declaredTips, 0)),
    totalAllocatedTips: money(records.reduce((sum, row) => sum + row.allocatedTips, 0)),
    totalTips: money(records.reduce((sum, row) => sum + row.totalTips, 0)),
  };
}

function responsePayload() {
  return {
    tipRecords,
    tipPools,
    employees,
    form8027: buildForm8027(tipRecords),
    summary: buildSummary(tipRecords),
  };
}

function autoAllocate8027() {
  const status = buildForm8027(tipRecords);
  if (!status.needsAllocation) return;

  const eligibleRows = tipRecords.filter((row) => row.grossReceipts > 0 && row.declaredTips / row.grossReceipts < 0.08);
  const denominator =
    form8027.allocationMethod === "gross"
      ? eligibleRows.reduce((sum, row) => sum + row.grossReceipts, 0)
      : eligibleRows.reduce((sum, row) => sum + row.hoursWorked, 0);

  tipRecords = tipRecords.map((row) => {
    if (!eligibleRows.some((eligible) => eligible.id === row.id) || denominator <= 0) {
      return calculateTips({ ...row, allocatedTips: 0 });
    }

    const basis = form8027.allocationMethod === "gross" ? row.grossReceipts : row.hoursWorked;
    const allocatedTips = money(status.allocationShortfall * (basis / denominator));
    return calculateTips({ ...row, allocatedTips });
  });
}

export async function GET() {
  return NextResponse.json(responsePayload());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const updateDeclared = updateDeclaredSchema.safeParse(body);
    if (updateDeclared.success) {
      tipRecords = tipRecords.map((record) =>
        record.id === updateDeclared.data.id
          ? calculateTips({ ...record, declaredTips: updateDeclared.data.declaredTips })
          : record
      );
      return NextResponse.json(responsePayload());
    }

    const importCsv = importCsvSchema.safeParse(body);
    if (importCsv.success) {
      importCsv.data.rows.forEach((row) => {
        const matchedEmployee =
          employees.find((employee) => employee.id === row.employeeId) ??
          employees.find((employee) => employee.name.toLowerCase() === row.employeeName?.toLowerCase());
        if (!matchedEmployee) return;

        tipRecords = tipRecords.map((record) =>
          record.employeeId === matchedEmployee.id
            ? calculateTips({
                ...record,
                declaredTips: row.declaredTips,
                grossReceipts: row.grossReceipts || record.grossReceipts,
                hoursWorked: row.hoursWorked || record.hoursWorked,
                source: importCsv.data.provider,
              })
            : record
        );
      });
      return NextResponse.json(responsePayload());
    }

    const set8027 = set8027Schema.safeParse(body);
    if (set8027.success) {
      form8027 = {
        ...form8027,
        ...set8027.data,
      };
      return NextResponse.json(responsePayload());
    }

    if (body.action === "auto_allocate_8027") {
      autoAllocate8027();
      return NextResponse.json(responsePayload());
    }

    const createPool = createPoolSchema.safeParse(body);
    if (createPool.success) {
      const state = createPool.data.pool.state;
      tipPools = [
        {
          id: `pool-${Date.now()}`,
          name: createPool.data.pool.name,
          distributionMethod: createPool.data.pool.distributionMethod,
          participatingEmployeeIds: createPool.data.pool.participatingEmployeeIds,
          poolAmount: createPool.data.pool.poolAmount,
          payPeriod: PAY_PERIOD,
          overrides: {},
          state,
          status: "active",
          complianceFlag: ["CA", "NY", "MA"].includes(state)
            ? `${state} has state-specific tip pooling restrictions; exclude owners, managers, and supervisors.`
            : undefined,
        },
        ...tipPools,
      ];
      return NextResponse.json(responsePayload());
    }

    const poolOverride = updatePoolOverrideSchema.safeParse(body);
    if (poolOverride.success) {
      tipPools = tipPools.map((pool) =>
        pool.id === poolOverride.data.poolId
          ? {
              ...pool,
              overrides: {
                ...pool.overrides,
                [poolOverride.data.employeeId]: poolOverride.data.amount,
              },
            }
          : pool
      );
      return NextResponse.json(responsePayload());
    }

    if (body.action === "publish") {
      return NextResponse.json({
        ...responsePayload(),
        published: true,
        message: "Tip payroll inputs queued for the next payroll preview.",
      });
    }

    return NextResponse.json({ error: "Unknown tip action" }, { status: 400 });
  } catch (error) {
    console.error("[POST /api/payroll/tips]", error);
    return NextResponse.json({ error: "Failed to update tip data" }, { status: 500 });
  }
}
