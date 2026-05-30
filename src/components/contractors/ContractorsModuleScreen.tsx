"use client";

import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Banknote,
  Download,
  FileText,
  Landmark,
  Loader2,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Upload,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import ErrorState from "@/components/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/skeletons/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  addContractor,
  efileContractor1099s,
  fetchContractorModuleData,
  generateContractor1099s,
  maskTinDigits,
  submitContractorPayments,
  type AddContractorInput,
  type Contractor1099Record,
  type ContractorAccountType,
  type ContractorPaymentMethodType,
  type ContractorRecord,
  type ContractorType,
} from "@/lib/contractor-module-data";

const REPORTING_THRESHOLD = 600;
const contractorTypes: ContractorType[] = ["Individual", "LLC", "S-Corp", "C-Corp"];
const taxYearOptions = [
  new Date().getFullYear(),
  new Date().getFullYear() - 1,
  new Date().getFullYear() - 2,
];

type ContractorFormState = {
  clientName: string;
  name: string;
  email: string;
  type: ContractorType;
  tinDigits: string;
  w9FileName: string;
  paymentMethodType: ContractorPaymentMethodType;
  plaidConnected: boolean;
  plaidLast4: string;
  manualRouting: string;
  manualAccount: string;
};

const blankContractorForm: ContractorFormState = {
  clientName: "",
  name: "",
  email: "",
  type: "Individual",
  tinDigits: "",
  w9FileName: "",
  paymentMethodType: "Plaid",
  plaidConnected: false,
  plaidLast4: "4829",
  manualRouting: "",
  manualAccount: "",
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function contractorScopeMatches(
  contractor: ContractorRecord,
  accountType: ContractorAccountType,
) {
  return contractor.accountType === accountType;
}

function statusClasses(status: string) {
  const styles: Record<string, string> = {
    "On file":
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
    "Pending review":
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300",
    Missing:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300",
    Ready:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300",
    Draft:
      "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
    "E-filed":
      "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-indigo-300",
    Delivered:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
    "Below $600":
      "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
    "Needs W-9":
      "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300",
  };

  return styles[status] ?? styles.Draft;
}

function get1099Status(
  contractor: ContractorRecord,
  forms: Contractor1099Record[],
  taxYear: number,
) {
  const existingForm = forms.find(
    (form) => form.contractorId === contractor.id && form.taxYear === taxYear,
  );
  if (existingForm) return existingForm.status;
  if (contractor.ytdPaid < REPORTING_THRESHOLD) return "Below $600";
  if (contractor.w9Status !== "On file") return "Needs W-9";
  return "Ready";
}

function isPayBlocked(contractor: ContractorRecord) {
  return contractor.w9Status === "Missing" || !contractor.paymentMethod.verified;
}

function download1099(record: Contractor1099Record) {
  const lines = [
    "CircleWorks 1099-NEC export",
    `Tax year: ${record.taxYear}`,
    `Contractor: ${record.contractorName}`,
    `TIN: ${record.tinMasked}`,
    `Box 1 nonemployee compensation: ${money(record.amount)}`,
    `Status: ${record.status}`,
  ];
  const url = URL.createObjectURL(
    new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${record.taxYear}-1099-nec-${record.contractorName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}.txt`;
  link.click();
  URL.revokeObjectURL(url);
  toast.success("1099-NEC download started", {
    description: record.contractorName,
  });
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--text-secondary)]">
            {label}
          </p>
          <p className="mt-1 text-2xl font-black text-[var(--text-primary)]">
            {value}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-tertiary)]">
            {detail}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--surface-card)] px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-inset)] text-[var(--text-secondary)]">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-black text-[var(--text-primary)]">
        {title}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <Skeleton height={28} width={260} />
          <Skeleton height={18} width="55%" />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 p-5">
              <Skeleton height={40} width={40} />
              <Skeleton height={24} width={96} />
              <Skeleton height={16} width="70%" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="space-y-3 p-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} height={42} width="100%" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ModuleHeader({
  accountType,
  onAccountTypeChange,
}: {
  accountType: ContractorAccountType;
  onAccountTypeChange: (accountType: ContractorAccountType) => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
                Contractor 1099 Module
              </h1>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                Manage contractor profiles, ACH payments, W-9 readiness, and
                year-end 1099-NEC filing from one operating view.
              </p>
            </div>
          </div>
        </div>
        <div className="flex w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-inset)] p-1 sm:w-auto">
          {(["Creator", "Agency"] satisfies ContractorAccountType[]).map(
            (scope) => (
              <button
                key={scope}
                type="button"
                onClick={() => onAccountTypeChange(scope)}
                className={cx(
                  "flex-1 rounded-lg px-4 py-2 text-sm font-black transition sm:flex-none",
                  accountType === scope
                    ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                )}
              >
                {scope}
              </button>
            ),
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ContractorListScreen({
  contractors,
  forms,
  taxYear,
  accountType,
}: {
  contractors: ContractorRecord[];
  forms: Contractor1099Record[];
  taxYear: number;
  accountType: ContractorAccountType;
}) {
  const [search, setSearch] = useState("");

  const filteredContractors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return contractors;
    return contractors.filter((contractor) =>
      [
        contractor.name,
        contractor.email,
        contractor.type,
        contractor.clientName ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [contractors, search]);

  if (contractors.length === 0) {
    return (
      <EmptyPanel
        icon={Users}
        title={`No ${accountType.toLowerCase()} contractors yet`}
        description="New contractor profiles will appear here with their type, YTD paid amount, and 1099 readiness."
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>Contractor List</CardTitle>
          <CardDescription>
            Names, contractor type, YTD paid, and 1099 status for the selected
            account.
          </CardDescription>
        </div>
        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
            placeholder="Search contractors"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filteredContractors.length === 0 ? (
          <div className="p-6">
            <EmptyPanel
              icon={Search}
              title="No matching contractors"
              description="Try a different name, email, client, or contractor type."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                {accountType === "Agency" ? <TableHead>Client</TableHead> : null}
                <TableHead className="text-right">YTD Paid</TableHead>
                <TableHead>1099 Status</TableHead>
                <TableHead>W-9</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContractors.map((contractor) => {
                const status = get1099Status(contractor, forms, taxYear);
                return (
                  <TableRow key={contractor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">
                          {initials(contractor.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-[var(--text-primary)]">
                            {contractor.name}
                          </p>
                          <p className="truncate text-xs text-[var(--text-tertiary)]">
                            {contractor.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{contractor.type}</Badge>
                    </TableCell>
                    {accountType === "Agency" ? (
                      <TableCell className="font-semibold">
                        {contractor.clientName ?? "Unassigned"}
                      </TableCell>
                    ) : null}
                    <TableCell className="text-right font-black text-[var(--text-primary)]">
                      {money(contractor.ytdPaid)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusClasses(status)}>{status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusClasses(contractor.w9Status)}>
                        {contractor.w9Status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function AddContractorScreen({
  accountType,
}: {
  accountType: ContractorAccountType;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ContractorFormState>(blankContractorForm);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const addMutation = useMutation({
    mutationFn: addContractor,
    onSuccess: async (contractor) => {
      await queryClient.invalidateQueries({ queryKey: ["contractors-module"] });
      toast.success("Contractor added", {
        description: `${contractor.name} is ready for W-9 review.`,
      });
      setForm(blankContractorForm);
      setFileInputKey((key) => key + 1);
      setErrors([]);
    },
    onError: (error) => {
      toast.error("Could not add contractor", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  const updateForm = <K extends keyof ContractorFormState>(
    key: K,
    value: ContractorFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = () => {
    const nextErrors: string[] = [];
    const tinDigits = form.tinDigits.replace(/\D/g, "");

    if (!form.name.trim()) nextErrors.push("Name is required.");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      nextErrors.push("A valid email is required.");
    }
    if (accountType === "Agency" && !form.clientName.trim()) {
      nextErrors.push("Agency contractors need a client assignment.");
    }
    if (!form.w9FileName) nextErrors.push("Upload a W-9 form.");
    if (tinDigits.length !== 9) nextErrors.push("TIN must be 9 digits.");
    if (form.paymentMethodType === "Plaid" && !form.plaidConnected) {
      nextErrors.push("Connect a Plaid payment method.");
    }
    if (form.paymentMethodType === "Manual ACH") {
      if (form.manualRouting.replace(/\D/g, "").length !== 9) {
        nextErrors.push("Routing number must be 9 digits.");
      }
      if (form.manualAccount.replace(/\D/g, "").length < 4) {
        nextErrors.push("Account number must include at least 4 digits.");
      }
    }

    setErrors(nextErrors);
    return nextErrors.length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    const payload: AddContractorInput = {
      accountType,
      clientName: form.clientName,
      name: form.name,
      email: form.email,
      type: form.type,
      tinDigits: form.tinDigits,
      w9FileName: form.w9FileName,
      paymentMethodType: form.paymentMethodType,
      plaidConnected: form.plaidConnected,
      plaidLast4: form.plaidLast4,
      manualRouting: form.manualRouting,
      manualAccount: form.manualAccount,
    };

    addMutation.mutate(payload);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Contractor</CardTitle>
        <CardDescription>
          Collect identity, tax, W-9, and ACH payment details for a 1099
          contractor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6" onSubmit={handleSubmit}>
          {errors.length > 0 ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
              {errors[0]}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-[var(--text-primary)]">
              Contractor name
              <Input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                placeholder="Jordan Blake"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[var(--text-primary)]">
              Email
              <Input
                type="email"
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                placeholder="jordan@example.com"
              />
            </label>
            {accountType === "Agency" ? (
              <label className="grid gap-2 text-sm font-bold text-[var(--text-primary)]">
                Client
                <Input
                  value={form.clientName}
                  onChange={(event) =>
                    updateForm("clientName", event.target.value)
                  }
                  placeholder="Client account"
                />
              </label>
            ) : null}
            <label className="grid gap-2 text-sm font-bold text-[var(--text-primary)]">
              Contractor type
              <Select
                value={form.type}
                onValueChange={(value) =>
                  updateForm("type", value as ContractorType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {contractorTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-[var(--text-primary)]">
              TIN
              <Input
                type="password"
                inputMode="numeric"
                value={form.tinDigits}
                onChange={(event) =>
                  updateForm(
                    "tinDigits",
                    event.target.value.replace(/\D/g, "").slice(0, 9),
                  )
                }
                placeholder="9 digits"
              />
              <span className="text-xs font-medium text-[var(--text-tertiary)]">
                Stored as {maskTinDigits(form.tinDigits) || "**-***-****"}
              </span>
            </label>
            <label className="grid gap-2 text-sm font-bold text-[var(--text-primary)]">
              W-9 form
              <Input
                key={fileInputKey}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(event) =>
                  updateForm("w9FileName", event.target.files?.[0]?.name ?? "")
                }
              />
              {form.w9FileName ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <Upload className="h-3.5 w-3.5" />
                  {form.w9FileName}
                </span>
              ) : null}
            </label>
          </div>

          <div className="rounded-xl border border-[var(--border-default)] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-black text-[var(--text-primary)]">
                  Payment Method
                </h3>
                <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                  ACH payments can use Plaid verification or manual bank entry.
                </p>
              </div>
              <div className="flex rounded-xl border border-[var(--border-default)] bg-[var(--surface-inset)] p-1">
                {(["Plaid", "Manual ACH"] satisfies ContractorPaymentMethodType[]).map(
                  (method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => updateForm("paymentMethodType", method)}
                      className={cx(
                        "rounded-lg px-3 py-2 text-xs font-black transition",
                        form.paymentMethodType === method
                          ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                      )}
                    >
                      {method}
                    </button>
                  ),
                )}
              </div>
            </div>

            {form.paymentMethodType === "Plaid" ? (
              <div className="mt-4 flex flex-col gap-3 rounded-xl bg-[var(--surface-inset)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[var(--text-primary)]">
                      {form.plaidConnected
                        ? "Plaid verified account"
                        : "Plaid account"}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {form.plaidConnected
                        ? `Account ending ${form.plaidLast4}`
                        : "Open Plaid Link to verify bank access."}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant={form.plaidConnected ? "secondary" : "outline"}
                  onClick={() => {
                    updateForm("plaidConnected", true);
                    updateForm("plaidLast4", "4829");
                    toast.success("Plaid account connected");
                  }}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  {form.plaidConnected ? "Connected" : "Connect Plaid"}
                </Button>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-[var(--text-primary)]">
                  Routing number
                  <Input
                    inputMode="numeric"
                    value={form.manualRouting}
                    onChange={(event) =>
                      updateForm(
                        "manualRouting",
                        event.target.value.replace(/\D/g, "").slice(0, 9),
                      )
                    }
                    placeholder="9 digits"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-[var(--text-primary)]">
                  Account number
                  <Input
                    type="password"
                    inputMode="numeric"
                    value={form.manualAccount}
                    onChange={(event) =>
                      updateForm(
                        "manualAccount",
                        event.target.value.replace(/\D/g, "").slice(0, 17),
                      )
                    }
                    placeholder="Account number"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Contractor
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PayContractorsScreen({
  contractors,
}: {
  contractors: ContractorRecord[];
}) {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const submitMutation = useMutation({
    mutationFn: submitContractorPayments,
    onSuccess: async (batch) => {
      await queryClient.invalidateQueries({ queryKey: ["contractors-module"] });
      toast.success("ACH batch submitted", {
        description: `${batch.count} contractor payments totaling ${money(batch.total)}.`,
      });
      setSelectedIds([]);
      setAmounts({});
    },
    onError: (error) => {
      toast.error("Could not submit ACH batch", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  const selectableIds = useMemo(
    () =>
      contractors
        .filter((contractor) => !isPayBlocked(contractor))
        .map((contractor) => contractor.id),
    [contractors],
  );

  const selectedPayments = useMemo(
    () =>
      selectedIds
        .map((contractorId) => ({
          contractorId,
          amount: Number(amounts[contractorId] || 0),
        }))
        .filter((payment) => payment.amount > 0),
    [amounts, selectedIds],
  );

  const selectedTotal = selectedPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  useEffect(() => {
    const visibleIds = new Set(contractors.map((contractor) => contractor.id));
    setSelectedIds((current) => current.filter((id) => visibleIds.has(id)));
    setAmounts((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([contractorId]) =>
          visibleIds.has(contractorId),
        ),
      ),
    );
  }, [contractors]);

  const toggleSelection = (contractorId: string) => {
    setSelectedIds((current) =>
      current.includes(contractorId)
        ? current.filter((id) => id !== contractorId)
        : [...current, contractorId],
    );
  };

  const toggleAll = () => {
    setSelectedIds((current) =>
      current.length === selectableIds.length ? [] : selectableIds,
    );
  };

  const handleSubmit = () => {
    if (selectedPayments.length === 0) {
      toast.error("Enter at least one payment amount.");
      return;
    }
    submitMutation.mutate(selectedPayments);
  };

  if (contractors.length === 0) {
    return (
      <EmptyPanel
        icon={Banknote}
        title="No contractors to pay"
        description="Add contractors with verified bank details before creating an ACH batch."
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>Pay Contractors</CardTitle>
          <CardDescription>
            Select contractors, enter row amounts, and submit one ACH batch.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">{selectedIds.length} selected</Badge>
          <p className="text-sm font-black text-[var(--text-primary)]">
            {money(selectedTotal)}
          </p>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitMutation.isPending || selectedPayments.length === 0}
          >
            {submitMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Submit ACH
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <input
                  type="checkbox"
                  aria-label="Select all payable contractors"
                  checked={
                    selectableIds.length > 0 &&
                    selectedIds.length === selectableIds.length
                  }
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-slate-300"
                />
              </TableHead>
              <TableHead>Contractor</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead className="text-right">YTD Paid</TableHead>
              <TableHead className="w-44">Amount</TableHead>
              <TableHead>$600 Flag</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contractors.map((contractor) => {
              const isSelected = selectedIds.includes(contractor.id);
              const amount = Number(amounts[contractor.id] || 0);
              const nextYtd = contractor.ytdPaid + amount;
              const crossesThreshold =
                contractor.ytdPaid < REPORTING_THRESHOLD &&
                nextYtd >= REPORTING_THRESHOLD;
              const blocked = isPayBlocked(contractor);
              const thresholdLabel = crossesThreshold
                ? "Crosses $600"
                : nextYtd >= REPORTING_THRESHOLD
                  ? "Reportable"
                  : `${money(REPORTING_THRESHOLD - nextYtd)} left`;

              return (
                <TableRow
                  key={contractor.id}
                  className={blocked ? "opacity-60" : undefined}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      aria-label={`Select ${contractor.name}`}
                      checked={isSelected}
                      disabled={blocked}
                      onChange={() => toggleSelection(contractor.id)}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-black text-[var(--text-primary)]">
                        {contractor.name}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {blocked
                          ? "W-9 or bank verification required"
                          : contractor.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <WalletCards className="h-4 w-4 text-[var(--text-tertiary)]" />
                      <span className="font-semibold">
                        {contractor.paymentMethod.type} ending{" "}
                        {contractor.paymentMethod.last4}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-black text-[var(--text-primary)]">
                    {money(contractor.ytdPaid)}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      disabled={!isSelected || blocked}
                      value={amounts[contractor.id] ?? ""}
                      onChange={(event) =>
                        setAmounts((current) => ({
                          ...current,
                          [contractor.id]: event.target.value,
                        }))
                      }
                      placeholder="0.00"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        crossesThreshold
                          ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300"
                          : nextYtd >= REPORTING_THRESHOLD
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                            : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }
                    >
                      {thresholdLabel}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function NEC1099CenterScreen({
  contractors,
  forms,
  accountType,
}: {
  contractors: ContractorRecord[];
  forms: Contractor1099Record[];
  accountType: ContractorAccountType;
}) {
  const queryClient = useQueryClient();
  const [taxYear, setTaxYear] = useState(String(taxYearOptions[0]));
  const selectedTaxYear = Number(taxYear);
  const contractorIds = useMemo(
    () => new Set(contractors.map((contractor) => contractor.id)),
    [contractors],
  );
  const scopedForms = forms.filter(
    (form) => form.taxYear === selectedTaxYear && contractorIds.has(form.contractorId),
  );
  const reportableContractors = contractors.filter(
    (contractor) => contractor.ytdPaid >= REPORTING_THRESHOLD,
  );
  const blockedReportable = reportableContractors.filter(
    (contractor) => contractor.w9Status !== "On file",
  );
  const readyToEfile = scopedForms.filter(
    (form) => form.status === "Draft" || form.status === "Ready",
  );

  const generateMutation = useMutation({
    mutationFn: generateContractor1099sForScope,
    onSuccess: async (generatedForms) => {
      await queryClient.invalidateQueries({ queryKey: ["contractors-module"] });
      toast.success("1099-NEC forms generated", {
        description: `${generatedForms.length} forms prepared for ${selectedTaxYear}.`,
      });
    },
    onError: (error) => {
      toast.error("Could not generate forms", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  const efileMutation = useMutation({
    mutationFn: efileContractor1099s,
    onSuccess: async ({ filedCount }) => {
      await queryClient.invalidateQueries({ queryKey: ["contractors-module"] });
      toast.success("1099-NEC e-file submitted", {
        description: `${filedCount} forms sent for IRS filing.`,
      });
    },
    onError: (error) => {
      toast.error("Could not e-file forms", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  function generateContractor1099sForScope() {
    return generateContractor1099s({
      accountType,
      taxYear: selectedTaxYear,
    });
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={FileText}
          label="Reportable Contractors"
          value={String(reportableContractors.length)}
          detail="YTD payments at or above $600"
        />
        <MetricCard
          icon={ShieldCheck}
          label="W-9 Issues"
          value={String(blockedReportable.length)}
          detail="Blocking generation or e-file"
        />
        <MetricCard
          icon={Send}
          label="Ready to E-file"
          value={String(readyToEfile.length)}
          detail={`Tax year ${selectedTaxYear}`}
        />
      </div>

      {blockedReportable.length > 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-black">W-9 review needed</p>
            <p className="mt-1 text-sm leading-6">
              {blockedReportable.length} reportable contractor
              {blockedReportable.length === 1 ? "" : "s"} cannot be e-filed
              until W-9 details are on file.
            </p>
          </div>
        </div>
      ) : null}

      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>1099-NEC Center</CardTitle>
            <CardDescription>
              Generate year-end forms, e-file ready forms, and download each
              contractor copy.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-36">
              <Select value={taxYear} onValueChange={setTaxYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Tax year" />
                </SelectTrigger>
                <SelectContent>
                  {taxYearOptions.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Generate
            </Button>
            <Button
              type="button"
              onClick={() =>
                efileMutation.mutate({ accountType, taxYear: selectedTaxYear })
              }
              disabled={efileMutation.isPending || readyToEfile.length === 0}
            >
              {efileMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              E-file
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {scopedForms.length === 0 ? (
            <div className="p-6">
              <EmptyPanel
                icon={FileText}
                title="No 1099-NEC forms generated"
                description="Generate forms for contractors who crossed the $600 reporting threshold and have W-9 details on file."
                action={
                  <Button
                    type="button"
                    onClick={() => generateMutation.mutate()}
                    disabled={generateMutation.isPending}
                  >
                    {generateMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="mr-2 h-4 w-4" />
                    )}
                    Generate Forms
                  </Button>
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contractor</TableHead>
                  <TableHead>TIN</TableHead>
                  <TableHead className="text-right">Box 1</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Download</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scopedForms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell className="font-black text-[var(--text-primary)]">
                      {form.contractorName}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {form.tinMasked}
                    </TableCell>
                    <TableCell className="text-right font-black text-[var(--text-primary)]">
                      {money(form.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusClasses(form.status)}>
                        {form.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => download1099(form)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function ContractorsModuleScreen() {
  const [accountType, setAccountType] =
    useState<ContractorAccountType>("Creator");
  const activeTaxYear = taxYearOptions[0];
  const moduleQuery = useQuery({
    queryKey: ["contractors-module"],
    queryFn: fetchContractorModuleData,
  });

  const scopedContractors = useMemo(() => {
    return (moduleQuery.data?.contractors ?? []).filter((contractor) =>
      contractorScopeMatches(contractor, accountType),
    );
  }, [accountType, moduleQuery.data?.contractors]);

  const scopedForms = useMemo(() => {
    const contractorIds = new Set(
      scopedContractors.map((contractor) => contractor.id),
    );
    return (moduleQuery.data?.forms1099 ?? []).filter((form) =>
      contractorIds.has(form.contractorId),
    );
  }, [moduleQuery.data?.forms1099, scopedContractors]);

  const metrics = useMemo(() => {
    const ytdPaid = scopedContractors.reduce(
      (sum, contractor) => sum + contractor.ytdPaid,
      0,
    );
    const reportable = scopedContractors.filter(
      (contractor) => contractor.ytdPaid >= REPORTING_THRESHOLD,
    ).length;
    const missingW9 = scopedContractors.filter(
      (contractor) => contractor.w9Status !== "On file",
    ).length;
    const efiled = scopedForms.filter(
      (form) => form.taxYear === activeTaxYear && form.status === "E-filed",
    ).length;

    return { ytdPaid, reportable, missingW9, efiled };
  }, [activeTaxYear, scopedContractors, scopedForms]);

  if (moduleQuery.isLoading) return <LoadingState />;

  if (moduleQuery.isError) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
        <ModuleHeader
          accountType={accountType}
          onAccountTypeChange={setAccountType}
        />
        <ErrorState
          title="Contractor module could not load"
          description={
            moduleQuery.error instanceof Error
              ? moduleQuery.error.message
              : "Refresh the contractor module and try again."
          }
          retry={() => {
            void moduleQuery.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
      <ModuleHeader
        accountType={accountType}
        onAccountTypeChange={setAccountType}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Contractors"
          value={String(scopedContractors.length)}
          detail={`${accountType} account view`}
        />
        <MetricCard
          icon={Banknote}
          label="YTD Paid"
          value={money(metrics.ytdPaid)}
          detail="ACH and manual contractor payments"
        />
        <MetricCard
          icon={FileText}
          label="1099 Reportable"
          value={String(metrics.reportable)}
          detail="$600 threshold reached"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Tax Review"
          value={String(metrics.missingW9)}
          detail="W-9 missing or pending"
        />
      </div>

      <Tabs defaultValue="list" className="grid gap-4">
        <div className="overflow-x-auto pb-1">
          <TabsList className="w-max">
            <TabsTrigger value="list" className="gap-2 px-4">
              <Users className="h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="add" className="gap-2 px-4">
              <Plus className="h-4 w-4" />
              Add
            </TabsTrigger>
            <TabsTrigger value="pay" className="gap-2 px-4">
              <WalletCards className="h-4 w-4" />
              Pay
            </TabsTrigger>
            <TabsTrigger value="nec" className="gap-2 px-4">
              <FileText className="h-4 w-4" />
              1099-NEC
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="mt-0">
          <ContractorListScreen
            contractors={scopedContractors}
            forms={scopedForms}
            taxYear={activeTaxYear}
            accountType={accountType}
          />
        </TabsContent>
        <TabsContent value="add" className="mt-0">
          <AddContractorScreen accountType={accountType} />
        </TabsContent>
        <TabsContent value="pay" className="mt-0">
          <PayContractorsScreen contractors={scopedContractors} />
        </TabsContent>
        <TabsContent value="nec" className="mt-0">
          <NEC1099CenterScreen
            contractors={scopedContractors}
            forms={scopedForms}
            accountType={accountType}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
