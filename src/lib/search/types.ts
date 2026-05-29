export type SearchEntityType =
  | "employees"
  | "payroll"
  | "documents"
  | "reports"
  | "jobs"
  | "candidates"
  | "settings";

export type SearchSection =
  | "EMPLOYEES"
  | "PAYROLL RUNS"
  | "DOCUMENTS"
  | "REPORTS"
  | "JOBS/CANDIDATES"
  | "SETTINGS";

export type SearchSource = "elasticsearch" | "database" | "mock";

export interface SearchResult {
  id: string;
  entityType: SearchEntityType;
  section: SearchSection;
  title: string;
  subtitle: string;
  href: string;
  icon: string;
  score?: number;
  avatarUrl?: string | null;
  badge?: string | null;
  metadata?: Record<string, string | number | null | undefined>;
}

export interface SearchResponse {
  companyId: number | string | null;
  query: string;
  tookMs: number;
  resultCount: number;
  source: SearchSource;
  results: SearchResult[];
}
