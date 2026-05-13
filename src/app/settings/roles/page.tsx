"use client";

import React, { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Edit3,
  Eye,
  Lock,
  Plus,
  Save,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  allPermissions,
  builtInRoles,
  permissionModules,
  summarizePermissions,
} from "@/lib/rbac";

type RoleType = "Built-in" | "Custom";

interface RoleState {
  id: string;
  name: string;
  description: string;
  type: RoleType;
  userCount: number;
  permissions: string[];
  basedOn?: string;
}

const starterCustomRoles: RoleState[] = [
  {
    id: "recruiter_only",
    name: "Recruiter Only",
    type: "Custom",
    description: "ATS and onboarding access without employee compensation or payroll.",
    userCount: 5,
    basedOn: "HR Manager",
    permissions: [
      "view_jobs",
      "manage_jobs",
      "view_candidates",
      "manage_candidates",
      "send_offers",
      "manage_interviews",
      "view_interview_feedback",
      "view_ats_reports",
      "view_onboarding",
      "manage_onboarding",
      "send_onboarding_packets",
    ],
  },
  {
    id: "audit_read_only",
    name: "Audit Read Only",
    type: "Custom",
    description: "Read-only access to reports, compliance, payroll filings, and audit logs.",
    userCount: 2,
    basedOn: "Finance",
    permissions: [
      "view_reports",
      "export_reports",
      "view_compliance",
      "view_audit_log",
      "export_audit_log",
      "view_tax_filings",
      "view_payroll_reports",
      "view_finance_reports",
      "view_expenses",
    ],
  },
];

const builtInRoleState: RoleState[] = builtInRoles.map((role) => ({
  id: role.id,
  name: role.name,
  description: role.description,
  type: "Built-in",
  userCount: role.userCount,
  permissions: role.permissions,
}));

function getPermissionCount(permissions: string[]) {
  return new Set(permissions).size;
}

function createDraftRole(templateName = "Employee"): RoleState {
  const template = builtInRoleState.find((role) => role.name === templateName) ?? builtInRoleState[0];
  return {
    id: `custom_${Date.now()}`,
    name: "",
    description: "",
    type: "Custom",
    userCount: 0,
    basedOn: template.name,
    permissions: [...template.permissions],
  };
}

export default function RolesSettingsPage() {
  const [roles, setRoles] = useState<RoleState[]>([...builtInRoleState, ...starterCustomRoles]);
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id ?? "");
  const [draftRole, setDraftRole] = useState<RoleState | null>(null);
  const [deleteRole, setDeleteRole] = useState<RoleState | null>(null);

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0];
  const selectedPermissions = new Set((draftRole ?? selectedRole)?.permissions ?? []);
  const isEditing = Boolean(draftRole);

  const moduleStats = useMemo(() => {
    return permissionModules.map((permissionModule) => {
      const granted = permissionModule.permissions.filter((permission) => selectedPermissions.has(permission.key));
      return { permissionModule, grantedCount: granted.length, totalCount: permissionModule.permissions.length };
    });
  }, [selectedPermissions]);

  const startCreate = () => {
    const draft = createDraftRole("Employee");
    setDraftRole(draft);
    setSelectedRoleId(draft.id);
  };

  const startEdit = (role: RoleState) => {
    setDraftRole({ ...role, permissions: [...role.permissions] });
    setSelectedRoleId(role.id);
  };

  const applyTemplate = (templateName: string) => {
    const template = roles.find((role) => role.name === templateName) ?? builtInRoleState[0];
    setDraftRole((current) =>
      current
        ? {
            ...current,
            basedOn: template.name,
            permissions: [...template.permissions],
          }
        : current
    );
  };

  const togglePermission = (permission: string) => {
    setDraftRole((current) => {
      if (!current) return current;
      const nextPermissions = new Set(current.permissions);
      if (nextPermissions.has(permission)) {
        nextPermissions.delete(permission);
      } else {
        nextPermissions.add(permission);
      }
      return { ...current, permissions: Array.from(nextPermissions) };
    });
  };

  const toggleModule = (moduleId: string) => {
    setDraftRole((current) => {
      if (!current) return current;
      const permissionModule = permissionModules.find((item) => item.id === moduleId);
      if (!permissionModule) return current;
      const nextPermissions = new Set(current.permissions);
      const allModuleGranted = permissionModule.permissions.every((permission) => nextPermissions.has(permission.key));
      permissionModule.permissions.forEach((permission) => {
        if (allModuleGranted) {
          nextPermissions.delete(permission.key);
        } else {
          nextPermissions.add(permission.key);
        }
      });
      return { ...current, permissions: Array.from(nextPermissions) };
    });
  };

  const saveDraft = () => {
    if (!draftRole?.name.trim()) {
      toast.error("Role name is required.");
      return;
    }

    const savedRole = { ...draftRole, name: draftRole.name.trim(), description: draftRole.description.trim() };
    const exists = roles.some((role) => role.id === savedRole.id);
    setRoles((current) => (exists ? current.map((role) => (role.id === savedRole.id ? savedRole : role)) : [...current, savedRole]));
    setSelectedRoleId(savedRole.id);
    setDraftRole(null);
    toast.success(`Role "${savedRole.name}" saved.`);
  };

  const deleteCustomRole = () => {
    if (!deleteRole || deleteRole.type !== "Custom") return;
    setRoles((current) => current.filter((role) => role.id !== deleteRole.id));
    setSelectedRoleId("owner");
    setDeleteRole(null);
    toast.success(`Role "${deleteRole.name}" deleted.`);
  };

  const activeRole = draftRole ?? selectedRole;

  return (
    <div className="flex max-w-6xl flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Shield size={22} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Roles & Permissions</h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {allPermissions.length} permissions across {permissionModules.length} modules.
          </p>
        </div>
        <button
          onClick={startCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus size={16} /> Create Custom Role
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-4 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Role Matrix</h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {roles.map((role) => {
              const selected = activeRole?.id === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => {
                    if (!isEditing) setSelectedRoleId(role.id);
                  }}
                  className={`flex w-full items-start gap-3 p-4 text-left transition-colors ${
                    selected ? "bg-blue-50 dark:bg-blue-950/30" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  } ${isEditing ? "cursor-default" : ""}`}
                >
                  <div className={`mt-1 rounded-md p-1.5 ${role.type === "Built-in" ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"}`}>
                    {role.type === "Built-in" ? <Lock size={14} /> : <Shield size={14} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-bold text-slate-900 dark:text-white">{role.name}</span>
                      <span className="text-xs font-semibold text-slate-500">{getPermissionCount(role.permissions)}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{role.description}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>{role.type}</span>
                      <span>{role.userCount} users</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {isEditing ? (
                    <input
                      value={draftRole?.name ?? ""}
                      onChange={(event) => setDraftRole((current) => (current ? { ...current, name: event.target.value } : current))}
                      placeholder="Role name"
                      className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-base font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  ) : (
                    <h2 className="truncate text-xl font-bold text-slate-900 dark:text-white">{activeRole.name}</h2>
                  )}
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${activeRole.type === "Built-in" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"}`}>
                    {activeRole.type}
                  </span>
                </div>

                {isEditing ? (
                  <textarea
                    value={draftRole?.description ?? ""}
                    onChange={(event) => setDraftRole((current) => (current ? { ...current, description: event.target.value } : current))}
                    placeholder="Description"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">{activeRole.description}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {!isEditing && activeRole.type === "Custom" && (
                  <>
                    <button
                      onClick={() => startEdit(activeRole)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Edit3 size={15} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteRole(activeRole)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </>
                )}
                {!isEditing && (
                  <button
                    onClick={() => {
                      const clone = {
                        ...activeRole,
                        id: `custom_${Date.now()}`,
                        name: `${activeRole.name} Copy`,
                        type: "Custom" as const,
                        userCount: 0,
                        basedOn: activeRole.name,
                        permissions: [...activeRole.permissions],
                      };
                      setDraftRole(clone);
                      setSelectedRoleId(clone.id);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Copy size={15} /> Duplicate
                  </button>
                )}
                {isEditing && (
                  <>
                    <button
                      onClick={() => {
                        setDraftRole(null);
                        setSelectedRoleId(roles[0]?.id ?? "");
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <X size={15} /> Cancel
                    </button>
                    <button
                      onClick={saveDraft}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700"
                    >
                      <Save size={15} /> Save
                    </button>
                  </>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-5 grid gap-4 md:grid-cols-[240px_minmax(0,1fr)]">
                <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Based on
                  <select
                    value={draftRole?.basedOn ?? "Employee"}
                    onChange={(event) => applyTemplate(event.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-900/50 dark:bg-blue-950/30">
                  <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                    <Eye size={14} /> Preview
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {summarizePermissions(activeRole.permissions)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {moduleStats.slice(0, 8).map(({ permissionModule, grantedCount, totalCount }) => (
              <div key={permissionModule.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{permissionModule.label}</span>
                  <span className="text-xs font-semibold text-slate-500">
                    {grantedCount}/{totalCount}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${(grantedCount / totalCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="grid grid-cols-[220px_minmax(0,1fr)] border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="p-4">Module</div>
              <div className="p-4">Permissions</div>
            </div>

            {permissionModules.map((permissionModule) => {
              const moduleGranted = permissionModule.permissions.filter((permission) => selectedPermissions.has(permission.key)).length;
              const allModuleGranted = moduleGranted === permissionModule.permissions.length;

              return (
                <div key={permissionModule.id} className="grid grid-cols-1 border-b border-slate-200 last:border-b-0 dark:border-slate-800 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/30 lg:border-b-0 lg:border-r">
                    <div className="flex items-center justify-between gap-3 lg:block">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{permissionModule.label}</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{permissionModule.description}</p>
                      </div>
                      <div className="mt-0 shrink-0 text-xs font-bold text-slate-500 lg:mt-3">
                        {moduleGranted}/{permissionModule.permissions.length}
                      </div>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => toggleModule(permissionModule.id)}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        {allModuleGranted ? <X size={13} /> : <Check size={13} />}
                        {allModuleGranted ? "Clear" : "Grant all"}
                      </button>
                    )}
                  </div>

                  <div className="grid gap-2 p-4 sm:grid-cols-2">
                    {permissionModule.permissions.map((permission) => {
                      const granted = selectedPermissions.has(permission.key);
                      return (
                        <label
                          key={permission.key}
                          className={`flex min-h-[76px] gap-3 rounded-lg border p-3 transition-colors ${
                            granted
                              ? "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/30"
                              : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                          } ${isEditing ? "cursor-pointer hover:border-blue-300" : ""}`}
                        >
                          <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${granted ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 text-transparent dark:border-slate-700"}`}>
                            <Check size={13} />
                          </span>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={granted}
                            disabled={!isEditing}
                            onChange={() => togglePermission(permission.key)}
                          />
                          <span className="min-w-0">
                            <span className="block text-sm font-bold text-slate-900 dark:text-white">{permission.label}</span>
                            <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{permission.description}</span>
                            {permission.scope && (
                              <span className="mt-2 inline-flex rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800">
                                {permission.scope.replace("_", " ")}
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {deleteRole && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDeleteRole(null)} />
          <div className="relative w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete {deleteRole.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Users assigned to this custom role will need a replacement role before their next sign-in.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteRole(null)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={deleteCustomRole}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
