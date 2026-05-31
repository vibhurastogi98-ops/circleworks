"use client";

import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Download,
  FileSpreadsheet,
  Loader2,
  Plus,
  Search,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import ErrorState from "@/components/ErrorState";
import { Skeleton } from "@/components/skeletons/Skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  assignAgencyWorker,
  buildAgencyClientSummaries,
  calculateAssignmentFinancials,
  createAgencyBillingClient,
  createAgencyProject,
  fetchAgencyClientBillingData,
  type AgencyAssignmentStatus,
  type AgencyClientBillingData,
  type AgencyClientStatus,
  type AgencyClientSummary,
  type AgencyProjectStatus,
  type AgencyWorker,
  type AgencyWorkerAssignment,
  type AgencyWorkerType,
} from "@/lib/agency-client-billing-data";
import { normalizeAccountType } from "@/lib/creator-mode";
import { usePlatformStore } from "@/store/usePlatformStore";

const CLIENT_QUERY_KEY = ["agency-client-billing"];

type ClientFormState = {
  name: string;
  billingContact: string;
  email: string;
  industry: string;
  paymentTerms: string;
  firstProjectName: string;
};

type ProjectFormState = {
  name: string;
  code: string;
  budget: string;
};

type AssignmentFormState = {
  workerId: string;
  projectId: string;
  role: string;
  payRate: string;
  billRate: string;
  hoursPerMonth: string;
};

const blankClientForm: ClientFormState = {
  name: "",
  billingContact: "",
  email: "",
  industry: "",
  paymentTerms: "Net 30",
  firstProjectName: "",
};

const blankProjectForm: ProjectFormState = {
  name: "",
  code: "",
  budget: "",
};

const blankAssignmentForm: AssignmentFormState = {
  workerId: "",
  projectId: "",
  role: "",
  payRate: "",
  billRate: "",
  hoursPerMonth: "80",
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

function percent(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

function numberFromForm(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function statusClasses(status: AgencyClientStatus | AgencyProjectStatus | AgencyAssignmentStatus) {
  const styles: Record<string, string> = {
    Active:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
    Paused:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300",
    Draft:
      "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
    Complete:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300",
  };

  return styles[status] ?? styles.Draft;
}

function workerTypeClasses(type: AgencyWorkerType) {
  return type === "Employee"
    ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300"
    : "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-300";
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xs font-black uppercase tracking-wide text-[var(--text-tertiary)]"
    >
      {children}
    </label>
  );
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
          <p className="text-sm font-semibold text-[var(--text-secondary)]">{label}</p>
          <p className="mt-1 text-2xl font-black text-[var(--text-primary)]">{value}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-tertiary)]">{detail}</p>
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
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--surface-card)] px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-inset)] text-[var(--text-secondary)]">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-black text-[var(--text-primary)]">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="space-y-4 p-6">
          <Skeleton height={28} width={280} />
          <Skeleton height={18} width="60%" />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 p-5">
              <Skeleton height={40} width={40} />
              <Skeleton height={24} width={110} />
              <Skeleton height={16} width="70%" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="space-y-3 p-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} height={44} width="100%" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function getClientExportRows(data: AgencyClientBillingData, clientId: string) {
  const client = data.clients.find((item) => item.id === clientId);
  if (!client) return null;

  const projects = data.projects.filter((project) => project.clientId === clientId);
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const assignments = data.assignments.filter((assignment) => assignment.clientId === clientId);
  const summary = buildAgencyClientSummaries(data).find((item) => item.id === clientId);

  return {
    client,
    summary,
    projects: projects.map((project) => ({
      Project: project.name,
      Code: project.code,
      Status: project.status,
      Budget: project.budget,
      "Assigned workers": assignments.filter((assignment) => assignment.projectId === project.id).length,
    })),
    assignments: assignments.map((assignment) => {
      const financials = calculateAssignmentFinancials(assignment);
      return {
        Worker: assignment.workerName,
        Type: assignment.workerType,
        Role: assignment.role,
        Project: projectById.get(assignment.projectId)?.name ?? "Unassigned",
        Status: assignment.status,
        "Pay rate": assignment.payRate,
        "Bill rate": assignment.billRate,
        "Hours/month": assignment.hoursPerMonth,
        "Monthly pay": financials.monthlyPay,
        "Monthly bill": financials.monthlyBill,
        "Monthly margin": financials.monthlyMargin,
        "Margin %": financials.marginRate,
      };
    }),
  };
}

async function exportClientWorkbook(data: AgencyClientBillingData, clientId: string) {
  const exportRows = getClientExportRows(data, clientId);
  if (!exportRows?.summary) return;

  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();
  const summarySheet = XLSX.utils.json_to_sheet([
    {
      Client: exportRows.client.name,
      "Billing contact": exportRows.client.billingContact,
      Email: exportRows.client.email,
      Industry: exportRows.client.industry,
      Status: exportRows.client.status,
      "Payment terms": exportRows.client.paymentTerms,
      "Active headcount": exportRows.summary.activeHeadcount,
      "Monthly pay": exportRows.summary.monthlyPay,
      "Monthly bill": exportRows.summary.monthlyBill,
      "Monthly margin": exportRows.summary.monthlyMargin,
      "Margin %": exportRows.summary.marginRate,
    },
  ]);
  const projectsSheet = XLSX.utils.json_to_sheet(exportRows.projects);
  const assignmentsSheet = XLSX.utils.json_to_sheet(exportRows.assignments);

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
  XLSX.utils.book_append_sheet(workbook, projectsSheet, "Projects");
  XLSX.utils.book_append_sheet(workbook, assignmentsSheet, "Assignments");
  XLSX.writeFile(workbook, `${slugify(exportRows.client.name)}-client-billing.xlsx`);
}

async function exportClientCsv(data: AgencyClientBillingData, clientId: string) {
  const exportRows = getClientExportRows(data, clientId);
  if (!exportRows) return;

  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(exportRows.assignments);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(exportRows.client.name)}-assignments.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function ClientList({
  clients,
  selectedClientId,
  onSelectClient,
}: {
  clients: AgencyClientSummary[];
  selectedClientId: string;
  onSelectClient: (clientId: string) => void;
}) {
  if (!clients.length) {
    return (
      <EmptyPanel
        icon={Building2}
        title="No clients match this view"
        description="Create a client or clear the search filter to return to your active agency roster."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>Active headcount</TableHead>
          <TableHead>Monthly margin</TableHead>
          <TableHead>Projects</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow
            key={client.id}
            className={cx(
              "cursor-pointer",
              selectedClientId === client.id && "bg-indigo-50/70 dark:bg-indigo-500/10",
            )}
            onClick={() => onSelectClient(client.id)}
          >
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-sm font-black text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-500/10 dark:text-indigo-200">
                  {initials(client.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[var(--text-primary)]">{client.name}</p>
                  <p className="truncate text-xs text-[var(--text-tertiary)]">
                    {client.billingContact} · {client.paymentTerms}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell className="font-black text-[var(--text-primary)]">{client.activeHeadcount}</TableCell>
            <TableCell>
              <div className="font-black text-emerald-700 dark:text-emerald-300">
                {money(client.monthlyMargin)}
              </div>
              <div className="text-xs text-[var(--text-tertiary)]">{percent(client.marginRate)} margin</div>
            </TableCell>
            <TableCell className="font-bold">{client.projectCount}</TableCell>
            <TableCell>
              <Badge variant="outline" className={statusClasses(client.status)}>
                {client.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function AddClientForm({
  form,
  isSubmitting,
  onChange,
  onSubmit,
}: {
  form: ClientFormState;
  isSubmitting: boolean;
  onChange: (updates: Partial<ClientFormState>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <FieldLabel htmlFor="client-name">Client name</FieldLabel>
        <Input
          id="client-name"
          value={form.name}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="Atlas Media Group"
        />
      </div>
      <div className="space-y-2">
        <FieldLabel htmlFor="billing-contact">Billing contact</FieldLabel>
        <Input
          id="billing-contact"
          value={form.billingContact}
          onChange={(event) => onChange({ billingContact: event.target.value })}
          placeholder="Dana Finance"
        />
      </div>
      <div className="space-y-2">
        <FieldLabel htmlFor="client-email">Billing email</FieldLabel>
        <Input
          id="client-email"
          type="email"
          value={form.email}
          onChange={(event) => onChange({ email: event.target.value })}
          placeholder="ap@client.com"
        />
      </div>
      <div className="space-y-2">
        <FieldLabel htmlFor="client-industry">Industry</FieldLabel>
        <Input
          id="client-industry"
          value={form.industry}
          onChange={(event) => onChange({ industry: event.target.value })}
          placeholder="Creative agency"
        />
      </div>
      <div className="space-y-2">
        <FieldLabel>Payment terms</FieldLabel>
        <Select value={form.paymentTerms} onValueChange={(value) => onChange({ paymentTerms: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Payment terms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Net 15">Net 15</SelectItem>
            <SelectItem value="Net 30">Net 30</SelectItem>
            <SelectItem value="Net 45">Net 45</SelectItem>
            <SelectItem value="Due on receipt">Due on receipt</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <FieldLabel htmlFor="first-project">First project</FieldLabel>
        <Input
          id="first-project"
          value={form.firstProjectName}
          onChange={(event) => onChange({ firstProjectName: event.target.value })}
          placeholder="Monthly production"
        />
      </div>
      <div className="flex items-end md:col-span-2">
        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Create client
        </Button>
      </div>
    </form>
  );
}

function DetailSummary({ client }: { client: AgencyClientSummary }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[
        ["Active headcount", String(client.activeHeadcount), "Workers currently assigned"],
        ["Monthly bill", money(client.monthlyBill), "Projected client invoice"],
        ["Monthly pay", money(client.monthlyPay), "Payroll and contractor cost"],
        ["Monthly margin", money(client.monthlyMargin), `${percent(client.marginRate)} contribution margin`],
      ].map(([label, value, detail]) => (
        <div key={label} className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-inset)] p-4">
          <p className="text-xs font-black uppercase tracking-wide text-[var(--text-tertiary)]">{label}</p>
          <p className="mt-2 text-xl font-black text-[var(--text-primary)]">{value}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{detail}</p>
        </div>
      ))}
    </div>
  );
}

function ProjectList({ projects }: { projects: AgencyClientBillingData["projects"] }) {
  if (!projects.length) {
    return (
      <EmptyPanel
        icon={BriefcaseBusiness}
        title="No projects yet"
        description="Add a project so assignments can carry client/project billing codes."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Budget</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell className="font-black text-[var(--text-primary)]">{project.name}</TableCell>
            <TableCell className="font-mono text-xs font-bold">{project.code}</TableCell>
            <TableCell>{money(project.budget)}</TableCell>
            <TableCell>
              <Badge variant="outline" className={statusClasses(project.status)}>
                {project.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function AssignmentList({
  assignments,
  projectById,
}: {
  assignments: AgencyWorkerAssignment[];
  projectById: Map<string, AgencyClientBillingData["projects"][number]>;
}) {
  if (!assignments.length) {
    return (
      <EmptyPanel
        icon={Users}
        title="No workers assigned"
        description="Assign W-2 employees or 1099 contractors with pay and bill rates to see margin by person."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Worker</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Pay rate</TableHead>
          <TableHead>Bill rate</TableHead>
          <TableHead>Monthly margin</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((assignment) => {
          const financials = calculateAssignmentFinancials(assignment);
          return (
            <TableRow key={assignment.id}>
              <TableCell>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-black text-[var(--text-primary)]">{assignment.workerName}</p>
                    <Badge variant="outline" className={workerTypeClasses(assignment.workerType)}>
                      {assignment.workerType}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-tertiary)]">{assignment.role}</p>
                </div>
              </TableCell>
              <TableCell className="font-bold">{projectById.get(assignment.projectId)?.name ?? "Unassigned"}</TableCell>
              <TableCell>{money(assignment.payRate)}/hr</TableCell>
              <TableCell>{money(assignment.billRate)}/hr</TableCell>
              <TableCell>
                <div className="font-black text-emerald-700 dark:text-emerald-300">
                  {money(financials.monthlyMargin)}
                </div>
                <div className="text-xs text-[var(--text-tertiary)]">
                  {assignment.hoursPerMonth} hrs · {percent(financials.marginRate)}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={statusClasses(assignment.status)}>
                  {assignment.status}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function AgencyClientsModuleScreen() {
  const queryClient = useQueryClient();
  const { accountType, currentCompany } = usePlatformStore();
  const [mounted, setMounted] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [clientForm, setClientForm] = useState<ClientFormState>(blankClientForm);
  const [projectForm, setProjectForm] = useState<ProjectFormState>(blankProjectForm);
  const [assignmentForm, setAssignmentForm] = useState<AssignmentFormState>(blankAssignmentForm);

  useEffect(() => {
    setMounted(true);
  }, []);

  const normalizedAccountType = normalizeAccountType(accountType ?? currentCompany.accountType);
  const isAgencyAccount = normalizedAccountType === "agency";

  const clientsQuery = useQuery({
    queryKey: CLIENT_QUERY_KEY,
    queryFn: fetchAgencyClientBillingData,
    enabled: mounted && isAgencyAccount,
    retry: 1,
  });

  const data = clientsQuery.data;
  const summaries = useMemo(() => (data ? buildAgencyClientSummaries(data) : []), [data]);
  const filteredSummaries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return summaries;
    return summaries.filter((client) =>
      [client.name, client.billingContact, client.email, client.industry].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [searchTerm, summaries]);

  useEffect(() => {
    if (!filteredSummaries.length) {
      setSelectedClientId("");
      return;
    }

    if (!filteredSummaries.some((client) => client.id === selectedClientId)) {
      setSelectedClientId(filteredSummaries[0].id);
    }
  }, [filteredSummaries, selectedClientId]);

  const selectedClient = summaries.find((client) => client.id === selectedClientId) ?? summaries[0];
  const selectedProjects = useMemo(
    () => (data && selectedClient ? data.projects.filter((project) => project.clientId === selectedClient.id) : []),
    [data, selectedClient],
  );
  const selectedAssignments = useMemo(
    () =>
      data && selectedClient
        ? data.assignments.filter((assignment) => assignment.clientId === selectedClient.id)
        : [],
    [data, selectedClient],
  );
  const projectById = useMemo(
    () => new Map((data?.projects ?? []).map((project) => [project.id, project])),
    [data?.projects],
  );
  const workerById = useMemo(
    () => new Map((data?.workers ?? []).map((worker) => [worker.id, worker])),
    [data?.workers],
  );

  const createClientMutation = useMutation({
    mutationFn: createAgencyBillingClient,
    onSuccess: async ({ client }) => {
      toast.success("Client created", { description: client.name });
      setClientForm(blankClientForm);
      await queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEY });
      setSelectedClientId(client.id);
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: createAgencyProject,
    onSuccess: (project) => {
      toast.success("Project added", { description: project.name });
      setProjectForm(blankProjectForm);
      void queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEY });
    },
  });

  const assignWorkerMutation = useMutation({
    mutationFn: assignAgencyWorker,
    onSuccess: (assignment) => {
      toast.success("Worker assigned", { description: assignment.workerName });
      setAssignmentForm((current) => ({
        ...blankAssignmentForm,
        projectId: current.projectId,
      }));
      void queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEY });
    },
  });

  const totals = summaries.reduce(
    (sum, client) => ({
      clients: sum.clients + (client.status === "Active" ? 1 : 0),
      headcount: sum.headcount + client.activeHeadcount,
      monthlyBill: sum.monthlyBill + client.monthlyBill,
      monthlyMargin: sum.monthlyMargin + client.monthlyMargin,
    }),
    { clients: 0, headcount: 0, monthlyBill: 0, monthlyMargin: 0 },
  );
  const marginRate = totals.monthlyBill > 0 ? totals.monthlyMargin / totals.monthlyBill : 0;

  const handleCreateClient = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clientForm.name.trim()) {
      toast.error("Client name is required");
      return;
    }
    createClientMutation.mutate(clientForm);
  };

  const handleCreateProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedClient) return;
    if (!projectForm.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    createProjectMutation.mutate({
      clientId: selectedClient.id,
      name: projectForm.name,
      code: projectForm.code,
      budget: numberFromForm(projectForm.budget),
    });
  };

  const handleWorkerChange = (workerId: string) => {
    const worker: AgencyWorker | undefined = workerById.get(workerId);
    setAssignmentForm((current) => ({
      ...current,
      workerId,
      role: worker?.title ?? current.role,
      payRate: worker ? String(worker.defaultPayRate) : current.payRate,
      billRate: worker ? String(worker.defaultBillRate) : current.billRate,
    }));
  };

  const handleAssignWorker = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedClient) return;
    if (!assignmentForm.workerId || !assignmentForm.projectId) {
      toast.error("Choose a worker and project before assigning.");
      return;
    }

    const payRate = numberFromForm(assignmentForm.payRate);
    const billRate = numberFromForm(assignmentForm.billRate);
    if (billRate < payRate) {
      toast.error("Bill rate should be greater than or equal to pay rate.");
      return;
    }

    assignWorkerMutation.mutate({
      clientId: selectedClient.id,
      projectId: assignmentForm.projectId,
      workerId: assignmentForm.workerId,
      role: assignmentForm.role,
      payRate,
      billRate,
      hoursPerMonth: numberFromForm(assignmentForm.hoursPerMonth),
    });
  };

  const handleExportXlsx = async () => {
    if (!data || !selectedClient) return;
    await exportClientWorkbook(data, selectedClient.id);
    toast.success("Excel export generated", { description: selectedClient.name });
  };

  const handleExportCsv = async () => {
    if (!data || !selectedClient) return;
    await exportClientCsv(data, selectedClient.id);
    toast.success("CSV export generated", { description: selectedClient.name });
  };

  if (!mounted) {
    return <LoadingState />;
  }

  if (!isAgencyAccount) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300">
                Agency only
              </Badge>
              <h1 className="mt-3 text-2xl font-black text-[var(--text-primary)]">Client billing is available for agency accounts.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                This workspace is currently set to {normalizedAccountType.replace("_", " ")}. Switch to an agency workspace to manage client rosters, projects, rates, and margins.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (clientsQuery.isError) {
    const message =
      clientsQuery.error instanceof Error
        ? clientsQuery.error.message
        : "Client billing data could not be loaded.";
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <ErrorState
          title="Unable to load client billing"
          description={message}
          retry={() => void clientsQuery.refetch()}
        />
      </div>
    );
  }

  if (clientsQuery.isLoading || !data) {
    return <LoadingState />;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-300">Agency workspace</p>
                <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Clients & Projects</h1>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                  Create clients, assign employees and contractors to projects, set pay and bill rates, and monitor margin in one place.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={handleExportCsv} disabled={!selectedClient}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button type="button" onClick={handleExportXlsx} disabled={!selectedClient}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={Building2} label="Active clients" value={String(totals.clients)} detail="Agency clients currently in flight" />
        <MetricCard icon={Users} label="Active headcount" value={String(totals.headcount)} detail="Employees and contractors assigned" />
        <MetricCard icon={WalletCards} label="Monthly margin" value={money(totals.monthlyMargin)} detail={`${percent(marginRate)} blended margin`} />
        <MetricCard icon={BriefcaseBusiness} label="Monthly billings" value={money(totals.monthlyBill)} detail="Projected labor billing this month" />
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader className="flex flex-col gap-4 border-b border-[var(--border-muted)] p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Client list</CardTitle>
              <CardDescription>Name, active headcount, and monthly margin.</CardDescription>
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search clients"
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ClientList clients={filteredSummaries} selectedClientId={selectedClient?.id ?? ""} onSelectClient={setSelectedClientId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-5">
            <CardTitle>Add client</CardTitle>
            <CardDescription>Create the billing shell and first project.</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <AddClientForm
              form={clientForm}
              isSubmitting={createClientMutation.isPending}
              onChange={(updates) => setClientForm((current) => ({ ...current, ...updates }))}
              onSubmit={handleCreateClient}
            />
          </CardContent>
        </Card>
      </section>

      {selectedClient ? (
        <Card>
          <CardHeader className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{selectedClient.name}</CardTitle>
                <Badge variant="outline" className={statusClasses(selectedClient.status)}>
                  {selectedClient.status}
                </Badge>
              </div>
              <CardDescription>
                {selectedClient.billingContact} · {selectedClient.email} · {selectedClient.industry}
              </CardDescription>
            </div>
            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-inset)] px-4 py-3 text-sm">
              <span className="font-black text-[var(--text-primary)]">{selectedClient.paymentTerms}</span>
              <span className="ml-2 text-[var(--text-secondary)]">payment terms</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-5">
            <DetailSummary client={selectedClient} />

            <Tabs defaultValue="workers">
              <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
                <TabsTrigger value="workers">Assigned workers</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="billing">Billing summary</TabsTrigger>
              </TabsList>

              <TabsContent value="workers" className="mt-5">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <AssignmentList assignments={selectedAssignments} projectById={projectById} />

                  <form onSubmit={handleAssignWorker} className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-inset)] p-4">
                    <h3 className="text-sm font-black text-[var(--text-primary)]">Assign worker</h3>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                      Add W-2 employees or 1099 contractors with per-person pay and bill rates.
                    </p>
                    <div className="mt-4 space-y-3">
                      <div className="space-y-2">
                        <FieldLabel>Worker</FieldLabel>
                        <Select value={assignmentForm.workerId} onValueChange={handleWorkerChange}>
                          <SelectTrigger>
                            <span>
                              {workerById.get(assignmentForm.workerId)?.name ?? "Choose worker"}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            {data.workers.map((worker) => (
                              <SelectItem key={worker.id} value={worker.id}>
                                {worker.name} · {worker.type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <FieldLabel>Project</FieldLabel>
                        <Select
                          value={assignmentForm.projectId}
                          onValueChange={(projectId) => setAssignmentForm((current) => ({ ...current, projectId }))}
                        >
                          <SelectTrigger>
                            <span>
                              {projectById.get(assignmentForm.projectId)?.name ?? "Choose project"}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            {selectedProjects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <FieldLabel htmlFor="assignment-role">Role</FieldLabel>
                        <Input
                          id="assignment-role"
                          value={assignmentForm.role}
                          onChange={(event) => setAssignmentForm((current) => ({ ...current, role: event.target.value }))}
                          placeholder="Production designer"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <FieldLabel htmlFor="pay-rate">Pay rate</FieldLabel>
                          <Input
                            id="pay-rate"
                            type="number"
                            min={0}
                            value={assignmentForm.payRate}
                            onChange={(event) => setAssignmentForm((current) => ({ ...current, payRate: event.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <FieldLabel htmlFor="bill-rate">Bill rate</FieldLabel>
                          <Input
                            id="bill-rate"
                            type="number"
                            min={0}
                            value={assignmentForm.billRate}
                            onChange={(event) => setAssignmentForm((current) => ({ ...current, billRate: event.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <FieldLabel htmlFor="hours-month">Hours per month</FieldLabel>
                        <Input
                          id="hours-month"
                          type="number"
                          min={0}
                          value={assignmentForm.hoursPerMonth}
                          onChange={(event) => setAssignmentForm((current) => ({ ...current, hoursPerMonth: event.target.value }))}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={assignWorkerMutation.isPending || !selectedProjects.length}>
                        {assignWorkerMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                        Assign to client
                      </Button>
                    </div>
                  </form>
                </div>
              </TabsContent>

              <TabsContent value="projects" className="mt-5">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <ProjectList projects={selectedProjects} />

                  <form onSubmit={handleCreateProject} className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-inset)] p-4">
                    <h3 className="text-sm font-black text-[var(--text-primary)]">Add project</h3>
                    <div className="mt-4 space-y-3">
                      <div className="space-y-2">
                        <FieldLabel htmlFor="project-name">Project name</FieldLabel>
                        <Input
                          id="project-name"
                          value={projectForm.name}
                          onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))}
                          placeholder="Retainer support"
                        />
                      </div>
                      <div className="space-y-2">
                        <FieldLabel htmlFor="project-code">Project code</FieldLabel>
                        <Input
                          id="project-code"
                          value={projectForm.code}
                          onChange={(event) => setProjectForm((current) => ({ ...current, code: event.target.value }))}
                          placeholder="RET-001"
                        />
                      </div>
                      <div className="space-y-2">
                        <FieldLabel htmlFor="project-budget">Budget</FieldLabel>
                        <Input
                          id="project-budget"
                          type="number"
                          min={0}
                          value={projectForm.budget}
                          onChange={(event) => setProjectForm((current) => ({ ...current, budget: event.target.value }))}
                          placeholder="50000"
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={createProjectMutation.isPending}>
                        {createProjectMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        Add project
                      </Button>
                    </div>
                  </form>
                </div>
              </TabsContent>

              <TabsContent value="billing" className="mt-5">
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-inset)] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="text-base font-black text-[var(--text-primary)]">Billing summary</h3>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        Margin is calculated as bill minus pay for active assignments.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button type="button" variant="outline" onClick={handleExportCsv}>
                        <Download className="mr-2 h-4 w-4" />
                        CSV
                      </Button>
                      <Button type="button" onClick={handleExportXlsx}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Excel
                      </Button>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl bg-[var(--surface-card)] p-4">
                      <p className="text-xs font-black uppercase tracking-wide text-[var(--text-tertiary)]">Client bill</p>
                      <p className="mt-2 text-2xl font-black text-[var(--text-primary)]">{money(selectedClient.monthlyBill)}</p>
                    </div>
                    <div className="rounded-xl bg-[var(--surface-card)] p-4">
                      <p className="text-xs font-black uppercase tracking-wide text-[var(--text-tertiary)]">Agency pay cost</p>
                      <p className="mt-2 text-2xl font-black text-[var(--text-primary)]">{money(selectedClient.monthlyPay)}</p>
                    </div>
                    <div className="rounded-xl bg-[var(--surface-card)] p-4">
                      <p className="text-xs font-black uppercase tracking-wide text-[var(--text-tertiary)]">Margin</p>
                      <p className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-300">{money(selectedClient.monthlyMargin)}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <EmptyPanel
          icon={Building2}
          title="No agency clients yet"
          description="Create your first client to start assigning workers, projects, and bill rates."
        />
      )}
    </div>
  );
}
