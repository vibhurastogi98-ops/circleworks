"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle, DollarSign, Hash, Loader2, Plus, ToggleLeft, Users } from "lucide-react";
import { projectSetups, type ProjectSetup } from "@/data/mockProjectAllocation";

interface AgencyClient {
  id: string | number;
  name: string;
}

interface EmployeeOption {
  id: string | number;
  firstName?: string;
  lastName?: string;
  name?: string;
  department?: string;
}

interface ProjectFormData {
  name: string;
  clientId: string;
  client: string;
  code: string;
  billingRate: string;
  budgetHours: string;
  billable: boolean;
  status: ProjectSetup["status"];
  assignedEmployeeIds: string[];
}

const defaultFormData: ProjectFormData = {
  name: "",
  clientId: "",
  client: "",
  code: "",
  billingRate: "",
  budgetHours: "",
  billable: true,
  status: "Active",
  assignedEmployeeIds: [],
};

function employeeName(employee: EmployeeOption) {
  return employee.name || [employee.firstName, employee.lastName].filter(Boolean).join(" ") || `Employee ${employee.id}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function normalizeProject(project: ProjectSetup | Record<string, unknown>): ProjectSetup {
  const raw = project as Record<string, unknown>;
  const client = raw.client as { name?: string } | string | undefined;
  const budget = Number(raw.budget || 0);

  return {
    id: String(raw.id || `proj-${Date.now()}`),
    name: String(raw.name || "Untitled Project"),
    client: typeof client === "string" ? client : client?.name || String(raw.clientName || "Internal"),
    code: String(raw.code || raw.projectCode || "UNSET"),
    billingRate: Number(raw.billingRate || 0),
    budgetHours: Number(raw.budgetHours || Math.round(budget / 100) || 0),
    billable: Boolean(raw.billable ?? true),
    status: (raw.status as ProjectSetup["status"]) || "Active",
    assignedEmployeeIds: Array.isArray(raw.assignedEmployeeIds) ? raw.assignedEmployeeIds.map(String) : [],
  };
}

export default function TimeAndProjectsSettings() {
  const [showCreate, setShowCreate] = useState(false);
  const [projects, setProjects] = useState<ProjectSetup[]>(projectSetups);
  const [clients, setClients] = useState<AgencyClient[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ProjectFormData>(defaultFormData);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, cliRes, empRes] = await Promise.all([
          fetch("/api/agency/projects"),
          fetch("/api/agency/clients"),
          fetch("/api/employees"),
        ]);
        const [proj, cli, emp] = await Promise.all([
          projRes.json(),
          cliRes.json(),
          empRes.json(),
        ]);

        if (proj.success && proj.projects?.length > 0) {
          const apiProjects = (proj.projects as Record<string, unknown>[]).map(normalizeProject);
          const apiIds = new Set(apiProjects.map((project) => project.id));
          setProjects([...apiProjects, ...projectSetups.filter((project) => !apiIds.has(project.id))]);
        }
        if (cli.success) setClients(cli.clients);
        if (emp.success) setEmployees(emp.employees);
      } catch (err) {
        console.error("Failed to fetch settings data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const displayEmployees = useMemo<EmployeeOption[]>(() => {
    if (employees.length > 0) return employees;
    return [
      { id: "emp-1", name: "Sarah Johnson", department: "Engineering" },
      { id: "emp-2", name: "Mike Chen", department: "Engineering" },
      { id: "emp-3", name: "Amy Park", department: "Operations" },
      { id: "emp-4", name: "Carlos Diaz", department: "Sales" },
      { id: "emp-7", name: "Rachel Torres", department: "Marketing" },
    ];
  }, [employees]);

  const toggleEmployee = (employeeId: string) => {
    setFormData((current) => ({
      ...current,
      assignedEmployeeIds: current.assignedEmployeeIds.includes(employeeId)
        ? current.assignedEmployeeIds.filter((id) => id !== employeeId)
        : [...current.assignedEmployeeIds, employeeId],
    }));
  };

  const handleCreate = async () => {
    const clientName = clients.find((client) => String(client.id) === formData.clientId)?.name || formData.client || "Internal";
    const project: ProjectSetup = {
      id: `proj-${formData.code.toLowerCase() || Date.now()}`,
      name: formData.name || "New Project",
      client: clientName,
      code: formData.code || "UNSET",
      billingRate: Number(formData.billingRate || 0),
      budgetHours: Number(formData.budgetHours || 0),
      billable: formData.billable,
      status: formData.status,
      assignedEmployeeIds: formData.assignedEmployeeIds,
    };

    try {
      const res = await fetch("/api/agency/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: project.name,
          clientId: formData.clientId,
          companyId: 1,
          status: project.status,
          budget: project.budgetHours * 100,
          code: project.code,
          billingRate: project.billingRate,
          budgetHours: project.budgetHours,
          billable: project.billable,
          assignedEmployeeIds: project.assignedEmployeeIds,
        }),
      });
      const data = await res.json();
      setProjects([data.success ? normalizeProject({ ...project, ...data.project }) : project, ...projects]);
    } catch (err) {
      console.error("Failed to create project:", err);
      setProjects([project, ...projects]);
    } finally {
      setShowCreate(false);
      setFormData(defaultFormData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Time & Projects</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Set up project codes, billable rates, budgets, and who can log time.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: "Active Projects", value: projects.length, icon: Hash },
          { label: "Billable Projects", value: projects.filter((project) => project.billable).length, icon: ToggleLeft },
          { label: "Assigned Employees", value: new Set(projects.flatMap((project) => project.assignedEmployeeIds)).size, icon: Users },
          { label: "Avg Billing Rate", value: `$${Math.round(projects.filter((project) => project.billable).reduce((sum, project) => sum + project.billingRate, 0) / Math.max(projects.filter((project) => project.billable).length, 1))}/hr`, icon: DollarSign },
        ].map((metric) => (
          <div key={metric.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{metric.label}</span>
              <metric.icon className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{metric.value}</div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Project Setup</h2>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Project Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
                placeholder="Website Redesign"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Client</label>
              {clients.length > 0 ? (
                <select
                  value={formData.clientId}
                  onChange={(event) => setFormData({ ...formData, clientId: event.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.client}
                  onChange={(event) => setFormData({ ...formData, client: event.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
                  placeholder="Client name"
                />
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Project Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(event) => setFormData({ ...formData, code: event.target.value.toUpperCase() })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
                placeholder="ACM-RED"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Billing Rate ($/hr)</label>
              <input
                type="number"
                value={formData.billingRate}
                onChange={(event) => setFormData({ ...formData, billingRate: event.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
                placeholder="150"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Budget Hours</label>
              <input
                type="number"
                value={formData.budgetHours}
                onChange={(event) => setFormData({ ...formData, budgetHours: event.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
                placeholder="420"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
              <select
                value={formData.status}
                onChange={(event) => setFormData({ ...formData, status: event.target.value as ProjectSetup["status"] })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
              >
                <option>Active</option>
                <option>Paused</option>
                <option>Complete</option>
              </select>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-700/50">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Billable Project</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Billable companies require a project on clock-in and manual time entries.</p>
            </div>
            <button
              onClick={() => setFormData({ ...formData, billable: !formData.billable })}
              className={`relative h-6 w-11 rounded-full transition ${formData.billable ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"}`}
              aria-label="Toggle billable project"
            >
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${formData.billable ? "left-6" : "left-1"}`} />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Assign Employees</h3>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-700/50">
              <div className="flex flex-wrap gap-2">
                {displayEmployees.map((employee) => {
                  const id = String(employee.id);
                  const name = employeeName(employee);
                  const selected = formData.assignedEmployeeIds.includes(id);
                  return (
                    <label key={id} className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium ${selected ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300" : "border-slate-200 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                      <input type="checkbox" checked={selected} onChange={() => toggleEmployee(id)} className="rounded text-indigo-600" />
                      {name}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => setShowCreate(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">Cancel</button>
            <button onClick={handleCreate} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Save Project</button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-700/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3 font-medium">Project</th>
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Code</th>
                <th className="px-6 py-3 font-medium">Billing</th>
                <th className="px-6 py-3 font-medium">Budget</th>
                <th className="px-6 py-3 font-medium">Team</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                  </td>
                </tr>
              ) : projects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{project.name}</div>
                    <div className="text-xs text-slate-500">{project.billable ? "Billable" : "Non-billable"}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{project.client}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">{project.code}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {project.billable ? `$${project.billingRate}/hr` : "Internal"}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{project.budgetHours.toLocaleString()}h</td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                      {project.assignedEmployeeIds.slice(0, 4).map((id) => {
                        const employee = displayEmployees.find((item) => String(item.id) === id);
                        return (
                          <div key={id} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-xs font-medium text-indigo-700 dark:border-slate-800">
                            {initials(employee ? employeeName(employee) : id)}
                          </div>
                        );
                      })}
                      {project.assignedEmployeeIds.length > 4 && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-700 dark:text-slate-300">
                          +{project.assignedEmployeeIds.length - 4}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle className="h-3.5 w-3.5" />
                      {project.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
