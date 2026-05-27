export type ViewerRole = "employee" | "manager" | "hr" | "admin";

export type FieldVisibilityRole = ViewerRole | "everyone";

export type FieldVisibilityRoles = Record<FieldVisibilityRole, boolean>;

export interface FieldVisibilityRule {
  id: string;
  name: string;
  type: "System" | "Custom";
  roles: FieldVisibilityRoles;
  keys: string[];
  sensitive?: boolean;
}

export interface VisibilityContext {
  requesterRole: string | null | undefined;
  isSelf: boolean;
  isManager: boolean;
}

const roles = (
  employee: boolean,
  manager: boolean,
  hr: boolean,
  admin: boolean,
  everyone = false,
): FieldVisibilityRoles => ({ employee, manager, hr, admin, everyone });

export const DEFAULT_FIELD_VISIBILITY: FieldVisibilityRule[] = [
  {
    id: "ssn_tax_id",
    name: "SSN / Tax ID",
    type: "System",
    roles: roles(false, false, true, true),
    keys: ["ssn", "taxId", "taxIdentifier"],
    sensitive: true,
  },
  {
    id: "bank_account",
    name: "Bank Account",
    type: "System",
    roles: roles(true, false, false, true),
    keys: ["bankAccounts", "bankInfo", "directDeposit"],
    sensitive: true,
  },
  {
    id: "salary_compensation",
    name: "Salary/Compensation",
    type: "System",
    roles: roles(false, true, true, true),
    keys: ["salary", "compensation", "payType"],
    sensitive: true,
  },
  {
    id: "personal_contact",
    name: "Personal Phone / Email",
    type: "System",
    roles: roles(true, false, true, true),
    keys: ["personalPhone", "personalEmail"],
    sensitive: true,
  },
  {
    id: "work_phone",
    name: "Work Phone",
    type: "System",
    roles: roles(true, true, true, true, true),
    keys: ["workPhone"],
  },
  {
    id: "title",
    name: "Title",
    type: "System",
    roles: roles(true, true, true, true, true),
    keys: ["jobTitle"],
  },
  {
    id: "department",
    name: "Department",
    type: "System",
    roles: roles(true, true, true, true, true),
    keys: ["department", "departmentId"],
  },
  {
    id: "location",
    name: "Location",
    type: "System",
    roles: roles(true, true, true, true, true),
    keys: ["location", "locationId", "locationType"],
  },
  {
    id: "emergency_contact",
    name: "Emergency Contact",
    type: "System",
    roles: roles(true, false, true, true),
    keys: ["emergencyContact", "emergencyContacts"],
    sensitive: true,
  },
  {
    id: "performance_scores",
    name: "Performance scores",
    type: "System",
    roles: roles(true, true, true, false),
    keys: ["performanceScore", "performanceScores", "performanceRating"],
    sensitive: true,
  },
];

export const CUSTOM_FIELD_VISIBILITY: FieldVisibilityRule[] = [
  {
    id: "cf_tshirt_size",
    name: "T-Shirt Size",
    type: "Custom",
    roles: roles(true, true, true, true, true),
    keys: ["customFields.tshirtSize"],
  },
  {
    id: "cf_dietary_restrictions",
    name: "Dietary Restrictions",
    type: "Custom",
    roles: roles(true, true, true, true),
    keys: ["customFields.dietaryRestrictions"],
    sensitive: true,
  },
];

export const FIELD_VISIBILITY_RULES = [
  ...DEFAULT_FIELD_VISIBILITY,
  ...CUSTOM_FIELD_VISIBILITY,
];

export const PII_DEFAULT_VISIBILITY = FIELD_VISIBILITY_RULES.map((rule) =>
  rule.sensitive
    ? {
        ...rule,
        roles: roles(false, false, true, true),
      }
    : { ...rule },
);

export const normalizeViewerRole = (role: string | null | undefined): ViewerRole => {
  if (role === "admin" || role === "hr") {
    return role;
  }

  return "employee";
};

export const canViewField = (
  rule: FieldVisibilityRule,
  context: VisibilityContext,
) => {
  if (rule.roles.everyone) {
    return true;
  }

  if (context.requesterRole === "admin" && rule.roles.admin) {
    return true;
  }

  if (context.requesterRole === "hr" && rule.roles.hr) {
    return true;
  }

  if (context.isManager && rule.roles.manager) {
    return true;
  }

  if (context.isSelf && rule.roles.employee) {
    return true;
  }

  return false;
};

export const applyEmployeeFieldVisibility = <T extends Record<string, any>>(
  employee: T,
  context: VisibilityContext,
) => {
  const sanitized: Record<string, any> = { ...employee };

  FIELD_VISIBILITY_RULES.forEach((rule) => {
    if (canViewField(rule, context)) {
      return;
    }

    rule.keys.forEach((key) => {
      if (!key.includes(".")) {
        delete sanitized[key];
        return;
      }

      const [parentKey, childKey] = key.split(".");
      if (sanitized[parentKey] && typeof sanitized[parentKey] === "object") {
        sanitized[parentKey] = { ...sanitized[parentKey] };
        delete sanitized[parentKey][childKey];
      }
    });
  });

  return sanitized as Partial<T>;
};

export const getOrgChartSafeEmployee = <T extends Record<string, any>>(employee: T) => ({
  id: employee.id,
  firstName: employee.firstName,
  lastName: employee.lastName,
  avatar: employee.avatar,
  jobTitle: employee.jobTitle,
  managerId: employee.managerId,
});
