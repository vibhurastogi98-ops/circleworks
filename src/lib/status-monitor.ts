import snapshot from "../../public/status-history.json";

export type ComponentStatus =
  | "Operational"
  | "Degraded Performance"
  | "Partial Outage"
  | "Major Outage"
  | "Maintenance";

export type OverallStatus = "operational" | "partial" | "major";

export type StatusSeverity = "maintenance" | "minor" | "major";

export type UptimeDay = {
  date: string;
  status: ComponentStatus;
  uptime: number;
};

export type StatusComponent = {
  id: string;
  name: string;
  status: ComponentStatus;
  uptime30: number;
  history: UptimeDay[];
};

export type IncidentTimelineEntry = {
  status: "Investigating" | "Identified" | "Monitoring" | "Resolved";
  timestamp: string;
  message: string;
};

export type StatusIncident = {
  id: string;
  title: string;
  severity: StatusSeverity;
  startedAt: string;
  endedAt: string;
  duration: string;
  affectedComponents: string[];
  timeline: IncidentTimelineEntry[];
};

export type StatusPayload = {
  source: "better-uptime" | "static-json";
  lastCheckedAt: string;
  generatedAt: string;
  overallStatus: OverallStatus;
  affectedComponents: string[];
  components: StatusComponent[];
  incidents: StatusIncident[];
};

type HistoryOverride = {
  offset: number;
  status: StatusCode;
  uptime?: number;
};

type StatusCode = "O" | "D" | "P" | "X" | "M";

type SnapshotComponent = {
  id: string;
  name: string;
  betterUptimeName?: string;
  currentStatus: ComponentStatus;
  history: {
    days: number;
    default: StatusCode;
    overrides?: HistoryOverride[];
  };
};

const statusFromCode: Record<StatusCode, ComponentStatus> = {
  O: "Operational",
  D: "Degraded Performance",
  P: "Partial Outage",
  X: "Major Outage",
  M: "Maintenance",
};

const uptimeByStatus: Record<ComponentStatus, number> = {
  Operational: 100,
  "Degraded Performance": 99.1,
  "Partial Outage": 96.2,
  "Major Outage": 88.4,
  Maintenance: 99.8,
};

const typedSnapshot = snapshot as {
  generatedAt: string;
  startsOn: string;
  components: SnapshotComponent[];
  incidents: StatusIncident[];
};

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function addUtcDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function expandHistory(component: SnapshotComponent, currentStatus: ComponentStatus) {
  const overrides = new Map(
    (component.history.overrides || []).map((override) => [
      override.offset,
      override,
    ]),
  );

  return Array.from({ length: component.history.days }, (_, index) => {
    const override = overrides.get(index);
    const status =
      index === component.history.days - 1
        ? currentStatus
        : statusFromCode[override?.status || component.history.default];

    return {
      date: addUtcDays(typedSnapshot.startsOn, index),
      status,
      uptime: override?.uptime ?? uptimeByStatus[status],
    };
  });
}

function calculateUptime30(history: UptimeDay[]) {
  const recent = history.slice(-30);
  const total = recent.reduce((sum, day) => sum + day.uptime, 0);
  return Number((total / recent.length).toFixed(2));
}

function deriveOverallStatus(components: StatusComponent[]): {
  overallStatus: OverallStatus;
  affectedComponents: string[];
} {
  const affected = components.filter(
    (component) => component.status !== "Operational",
  );

  if (affected.some((component) => component.status === "Major Outage")) {
    return {
      overallStatus: "major",
      affectedComponents: affected.map((component) => component.name),
    };
  }

  if (affected.length > 0) {
    return {
      overallStatus: "partial",
      affectedComponents: affected.map((component) => component.name),
    };
  }

  return { overallStatus: "operational", affectedComponents: [] };
}

function mapBetterUptimeStatus(status: string): ComponentStatus {
  const normalized = status.toLowerCase();

  if (normalized.includes("maintenance")) return "Maintenance";
  if (normalized.includes("paused")) return "Maintenance";
  if (normalized.includes("down")) return "Major Outage";
  if (normalized.includes("partial")) return "Partial Outage";
  if (normalized.includes("degraded")) return "Degraded Performance";
  if (normalized.includes("validating")) return "Degraded Performance";
  return "Operational";
}

async function fetchBetterUptimeStatuses() {
  const token =
    process.env.BETTER_UPTIME_API_TOKEN ||
    process.env.BETTERSTACK_API_TOKEN;

  if (!token) return null;

  const response = await fetch("https://uptime.betterstack.com/api/v2/monitors", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Better Uptime returned ${response.status}`);
  }

  const body = (await response.json()) as {
    data?: Array<{
      attributes?: {
        pronouncable_name?: string;
        name?: string;
        url?: string;
        status?: string;
      };
    }>;
  };
  const statuses = new Map<string, ComponentStatus>();

  for (const monitor of body.data || []) {
    const attributes = monitor.attributes || {};
    const name =
      attributes.pronouncable_name || attributes.name || attributes.url || "";
    if (!name || !attributes.status) continue;
    statuses.set(normalizeName(name), mapBetterUptimeStatus(attributes.status));
  }

  return statuses;
}

export async function getStatusPayload(): Promise<StatusPayload> {
  let externalStatuses: Map<string, ComponentStatus> | null = null;

  try {
    externalStatuses = await fetchBetterUptimeStatuses();
  } catch (error) {
    console.warn("[Status API] Better Uptime unavailable; using static JSON.", error);
  }

  const components = typedSnapshot.components.map((component) => {
    const currentStatus =
      externalStatuses?.get(normalizeName(component.betterUptimeName || component.name)) ||
      component.currentStatus;
    const history = expandHistory(component, currentStatus);

    return {
      id: component.id,
      name: component.name,
      status: currentStatus,
      uptime30: calculateUptime30(history),
      history,
    };
  });
  const { overallStatus, affectedComponents } = deriveOverallStatus(components);

  return {
    source: externalStatuses ? "better-uptime" : "static-json",
    lastCheckedAt: new Date().toISOString(),
    generatedAt: typedSnapshot.generatedAt,
    overallStatus,
    affectedComponents,
    components,
    incidents: typedSnapshot.incidents.slice(0, 10),
  };
}
