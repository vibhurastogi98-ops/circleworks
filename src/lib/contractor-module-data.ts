export type ContractorAccountType = "Creator" | "Agency";

export type ContractorType = "Individual" | "LLC" | "S-Corp" | "C-Corp";

export type W9Status = "On file" | "Pending review" | "Missing";

export type ContractorPaymentMethodType = "Plaid" | "Manual ACH";

export type ContractorPaymentMethod = {
  type: ContractorPaymentMethodType;
  label: string;
  last4: string;
  verified: boolean;
};

export type ContractorRecord = {
  id: string;
  accountType: ContractorAccountType;
  clientName?: string;
  name: string;
  email: string;
  type: ContractorType;
  tinMasked: string;
  w9Status: W9Status;
  ytdPaid: number;
  paymentMethod: ContractorPaymentMethod;
  createdAt: string;
};

export type Contractor1099Status = "Draft" | "Ready" | "E-filed" | "Delivered";

export type Contractor1099Record = {
  id: string;
  contractorId: string;
  contractorName: string;
  taxYear: number;
  tinMasked: string;
  amount: number;
  status: Contractor1099Status;
  generatedAt: string;
  filedAt?: string;
  deliveredAt?: string;
};

export type ContractorPaymentBatch = {
  id: string;
  submittedAt: string;
  count: number;
  total: number;
  status: "ACH submitted";
};

export type ContractorModuleData = {
  contractors: ContractorRecord[];
  forms1099: Contractor1099Record[];
  paymentBatches: ContractorPaymentBatch[];
};

export type AddContractorInput = {
  accountType: ContractorAccountType;
  clientName?: string;
  name: string;
  email: string;
  type: ContractorType;
  tinDigits: string;
  w9FileName: string;
  paymentMethodType: ContractorPaymentMethodType;
  plaidConnected: boolean;
  plaidLast4?: string;
  manualRouting: string;
  manualAccount: string;
};

export type ContractorPaymentInput = {
  contractorId: string;
  amount: number;
};

export type Generate1099Input = {
  accountType: ContractorAccountType;
  taxYear: number;
};

const currentTaxYear = new Date().getFullYear();

const initialContractors: ContractorRecord[] = [
  {
    id: "ctr-creator-001",
    accountType: "Creator",
    name: "Maya Torres",
    email: "maya@northstar.video",
    type: "Individual",
    tinMasked: "**-***-4920",
    w9Status: "On file",
    ytdPaid: 18500,
    paymentMethod: {
      type: "Plaid",
      label: "Chase Business Checking",
      last4: "4920",
      verified: true,
    },
    createdAt: "2026-01-18",
  },
  {
    id: "ctr-creator-002",
    accountType: "Creator",
    name: "Evan Brooks",
    email: "evan@editbench.co",
    type: "LLC",
    tinMasked: "**-***-1188",
    w9Status: "On file",
    ytdPaid: 540,
    paymentMethod: {
      type: "Manual ACH",
      label: "Manual ACH",
      last4: "1188",
      verified: true,
    },
    createdAt: "2026-02-07",
  },
  {
    id: "ctr-creator-003",
    accountType: "Creator",
    name: "Priya Raman",
    email: "priya@studioledger.com",
    type: "S-Corp",
    tinMasked: "**-***-7304",
    w9Status: "Pending review",
    ytdPaid: 7200,
    paymentMethod: {
      type: "Plaid",
      label: "Mercury Operating",
      last4: "7304",
      verified: true,
    },
    createdAt: "2026-03-03",
  },
  {
    id: "ctr-agency-001",
    accountType: "Agency",
    clientName: "Orbit & Co.",
    name: "Ari Kim",
    email: "ari@motionstack.io",
    type: "LLC",
    tinMasked: "**-***-2219",
    w9Status: "On file",
    ytdPaid: 43200,
    paymentMethod: {
      type: "Plaid",
      label: "Bank of America Business",
      last4: "2219",
      verified: true,
    },
    createdAt: "2026-01-05",
  },
  {
    id: "ctr-agency-002",
    accountType: "Agency",
    clientName: "Bluebird Social",
    name: "Jules Nguyen",
    email: "jules@julescopy.com",
    type: "Individual",
    tinMasked: "**-***-8841",
    w9Status: "Missing",
    ytdPaid: 3600,
    paymentMethod: {
      type: "Manual ACH",
      label: "Manual ACH",
      last4: "8841",
      verified: false,
    },
    createdAt: "2026-02-22",
  },
  {
    id: "ctr-agency-003",
    accountType: "Agency",
    clientName: "Vela Skincare",
    name: "Rowan Patel",
    email: "rowan@pateldevops.dev",
    type: "C-Corp",
    tinMasked: "**-***-6428",
    w9Status: "On file",
    ytdPaid: 12400,
    paymentMethod: {
      type: "Manual ACH",
      label: "Manual ACH",
      last4: "6428",
      verified: true,
    },
    createdAt: "2026-02-10",
  },
];

const initialForms1099: Contractor1099Record[] = [
  {
    id: "nec-creator-001",
    contractorId: "ctr-creator-001",
    contractorName: "Maya Torres",
    taxYear: currentTaxYear,
    tinMasked: "**-***-4920",
    amount: 18500,
    status: "Ready",
    generatedAt: "2026-05-01",
  },
  {
    id: "nec-agency-001",
    contractorId: "ctr-agency-001",
    contractorName: "Ari Kim",
    taxYear: currentTaxYear,
    tinMasked: "**-***-2219",
    amount: 43200,
    status: "Draft",
    generatedAt: "2026-05-01",
  },
  {
    id: "nec-agency-002",
    contractorId: "ctr-agency-003",
    contractorName: "Rowan Patel",
    taxYear: currentTaxYear - 1,
    tinMasked: "**-***-6428",
    amount: 39800,
    status: "Delivered",
    generatedAt: "2026-01-08",
    filedAt: "2026-01-20",
    deliveredAt: "2026-01-21",
  },
];

let contractorsStore = [...initialContractors];
let forms1099Store = [...initialForms1099];
let paymentBatchesStore: ContractorPaymentBatch[] = [
  {
    id: "ach-batch-001",
    submittedAt: "2026-05-15T16:20:00.000Z",
    count: 3,
    total: 31800,
    status: "ACH submitted",
  },
];

function wait(ms = 450) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function todayIsoTimestamp() {
  return new Date().toISOString();
}

function forceErrorEnabled() {
  return (
    typeof window !== "undefined" &&
    window.localStorage.getItem("circleworks-contractors-force-error") === "1"
  );
}

export function maskTinDigits(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (!digits) return "";
  return `**-***-${digits.slice(-4).padStart(4, "*")}`;
}

export function accountLast4(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.slice(-4).padStart(4, "*");
}

export async function fetchContractorModuleData(): Promise<ContractorModuleData> {
  await wait();
  if (forceErrorEnabled()) {
    throw new Error("Contractor service is temporarily unavailable.");
  }

  return clone({
    contractors: contractorsStore,
    forms1099: forms1099Store,
    paymentBatches: paymentBatchesStore,
  });
}

export async function addContractor(input: AddContractorInput) {
  await wait(650);

  const id = `ctr-${input.accountType.toLowerCase()}-${Date.now()}`;
  const isPlaid = input.paymentMethodType === "Plaid";
  const paymentMethod: ContractorPaymentMethod = isPlaid
    ? {
        type: "Plaid",
        label: input.plaidConnected ? "Plaid verified account" : "Plaid pending",
        last4: input.plaidConnected
          ? accountLast4(input.plaidLast4 ?? "4829")
          : "****",
        verified: input.plaidConnected,
      }
    : {
        type: "Manual ACH",
        label: "Manual ACH",
        last4: accountLast4(input.manualAccount),
        verified:
          input.manualRouting.replace(/\D/g, "").length >= 9 &&
          input.manualAccount.replace(/\D/g, "").length >= 4,
      };

  const contractor: ContractorRecord = {
    id,
    accountType: input.accountType,
    clientName: input.accountType === "Agency" ? input.clientName?.trim() : undefined,
    name: input.name.trim(),
    email: input.email.trim(),
    type: input.type,
    tinMasked: maskTinDigits(input.tinDigits),
    w9Status: input.w9FileName ? "Pending review" : "Missing",
    ytdPaid: 0,
    paymentMethod,
    createdAt: todayIsoDate(),
  };

  contractorsStore = [contractor, ...contractorsStore];
  return clone(contractor);
}

export async function submitContractorPayments(payments: ContractorPaymentInput[]) {
  await wait(900);

  const normalizedPayments = payments.filter((payment) => payment.amount > 0);
  const paymentMap = new Map(
    normalizedPayments.map((payment) => [payment.contractorId, payment.amount]),
  );

  contractorsStore = contractorsStore.map((contractor) => {
    const amount = paymentMap.get(contractor.id);
    if (!amount) return contractor;
    return {
      ...contractor,
      ytdPaid: contractor.ytdPaid + amount,
    };
  });

  const batch: ContractorPaymentBatch = {
    id: `ach-batch-${Date.now()}`,
    submittedAt: todayIsoTimestamp(),
    count: normalizedPayments.length,
    total: normalizedPayments.reduce((sum, payment) => sum + payment.amount, 0),
    status: "ACH submitted",
  };

  paymentBatchesStore = [batch, ...paymentBatchesStore];
  return clone(batch);
}

export async function generateContractor1099s(input: Generate1099Input) {
  await wait(700);

  const reportableContractors = contractorsStore.filter(
    (contractor) =>
      contractor.accountType === input.accountType &&
      contractor.ytdPaid >= 600 &&
      contractor.w9Status === "On file",
  );

  const generatedForms = reportableContractors.map<Contractor1099Record>(
    (contractor) => {
      const existing = forms1099Store.find(
        (form) =>
          form.contractorId === contractor.id && form.taxYear === input.taxYear,
      );

      return {
        id: existing?.id ?? `nec-${contractor.id}-${input.taxYear}`,
        contractorId: contractor.id,
        contractorName: contractor.name,
        taxYear: input.taxYear,
        tinMasked: contractor.tinMasked,
        amount: contractor.ytdPaid,
        status:
          existing?.status === "E-filed" || existing?.status === "Delivered"
            ? existing.status
            : "Ready",
        generatedAt: todayIsoDate(),
        filedAt: existing?.filedAt,
        deliveredAt: existing?.deliveredAt,
      };
    },
  );

  const generatedIds = new Set(generatedForms.map((form) => form.id));
  forms1099Store = [
    ...generatedForms,
    ...forms1099Store.filter((form) => !generatedIds.has(form.id)),
  ];

  return clone(generatedForms);
}

export async function efileContractor1099s(input: Generate1099Input) {
  await wait(900);

  const eligibleContractorIds = new Set(
    contractorsStore
      .filter((contractor) => contractor.accountType === input.accountType)
      .map((contractor) => contractor.id),
  );

  const filedAt = todayIsoDate();
  let filedCount = 0;

  forms1099Store = forms1099Store.map((form) => {
    const isEligible =
      form.taxYear === input.taxYear &&
      eligibleContractorIds.has(form.contractorId) &&
      (form.status === "Draft" || form.status === "Ready");

    if (!isEligible) return form;
    filedCount += 1;
    return {
      ...form,
      status: "E-filed",
      filedAt,
    };
  });

  return { filedCount };
}
