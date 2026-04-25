/**
 * lib/apiVersioning.ts — Section 35: API Versioning Strategy
 *
 * Strategy:
 *   - Path-based major versioning:  /v1/ (stable) → /v2/ (breaking changes only)
 *   - Header-based minor versioning: API-Version: YYYY-MM-DD (within /v1/)
 *   - Deprecation headers:          Deprecation: true + Sunset: <date>
 *   - /v1/ supported minimum 18 months after its deprecation notice
 *
 * Current stable: v1 (API-Version: 2025-01-01)
 * Next version:   v2 (introduced alongside v1 for breaking changes)
 */

import { NextResponse } from "next/server";

// ─── Version Registry ─────────────────────────────────────────────────────────

export const API_VERSIONS = {
  v1: {
    introduced: "2024-01-01",
    currentMinorVersion: "2025-01-01",
    deprecated: false,
    deprecationDate: null as string | null,
    sunsetDate: null as string | null,
    minSupportedAfterDeprecation: "18 months",
  },
  v2: {
    introduced: "2025-06-01",
    currentMinorVersion: "2025-06-01",
    deprecated: false,
    deprecationDate: null as string | null,
    sunsetDate: null as string | null,
    minSupportedAfterDeprecation: "18 months",
  },
} as const;

export type ApiMajorVersion = keyof typeof API_VERSIONS;

// ─── Minor Version Resolution ─────────────────────────────────────────────────

const VALID_MINOR_VERSIONS = ["2024-01-01", "2025-01-01", "2025-06-01"] as const;
type MinorVersion = (typeof VALID_MINOR_VERSIONS)[number];

/**
 * Resolves the requested API-Version header to a valid minor version.
 * Falls back to the current stable version for /v1/ if header is absent or unrecognized.
 */
export function resolveMinorVersion(
  requestedVersion: string | null,
  majorVersion: ApiMajorVersion
): MinorVersion {
  if (!requestedVersion) return API_VERSIONS[majorVersion].currentMinorVersion as MinorVersion;
  if (VALID_MINOR_VERSIONS.includes(requestedVersion as MinorVersion)) {
    return requestedVersion as MinorVersion;
  }
  // Unknown version → default to current
  return API_VERSIONS[majorVersion].currentMinorVersion as MinorVersion;
}

// ─── Response Header Helpers ─────────────────────────────────────────────────

/**
 * Adds standard API versioning headers to a NextResponse.
 * Call this on every /v1/ and /v2/ route response.
 */
export function addVersionHeaders(
  response: NextResponse,
  majorVersion: ApiMajorVersion,
  resolvedMinorVersion: string
): NextResponse {
  const versionConfig = API_VERSIONS[majorVersion];

  response.headers.set("X-CircleWorks-Api-Version", majorVersion);
  response.headers.set("X-CircleWorks-Api-Minor-Version", resolvedMinorVersion);

  if (versionConfig.deprecated) {
    response.headers.set("Deprecation", "true");
    if (versionConfig.sunsetDate) {
      response.headers.set("Sunset", versionConfig.sunsetDate);
    }
    if (versionConfig.deprecationDate) {
      response.headers.set("X-CircleWorks-Deprecation-Date", versionConfig.deprecationDate);
    }
    response.headers.set(
      "X-CircleWorks-Migration-Guide",
      "https://docs.circleworks.io/api/migration"
    );
  }

  return response;
}

/**
 * Returns a 410 Gone response when a version has fully sunset.
 */
export function versionSunsetResponse(majorVersion: ApiMajorVersion): NextResponse {
  const versionConfig = API_VERSIONS[majorVersion];
  return NextResponse.json(
    {
      error: "api_version_sunset",
      message: `API ${majorVersion} reached its sunset date (${versionConfig.sunsetDate}). Please migrate to a supported version.`,
      migration_guide: "https://docs.circleworks.io/api/migration",
    },
    { status: 410 }
  );
}

// ─── Versioned Response Factory ───────────────────────────────────────────────

/**
 * Creates a versioned JSON response with all required headers.
 *
 * Usage in a /v1/ route:
 *   return versionedResponse({ data }, 'v1', req, 200);
 */
export function versionedResponse(
  body: unknown,
  majorVersion: ApiMajorVersion,
  req: Request,
  status = 200
): NextResponse {
  const requestedMinor = req.headers.get("API-Version");
  const resolvedMinor = resolveMinorVersion(requestedMinor, majorVersion);

  const res = NextResponse.json(body, { status });
  return addVersionHeaders(res, majorVersion, resolvedMinor);
}

// ─── Version Contract Reference ────────────────────────────────────────────────

/**
 * Returns the full version contract for documentation / discovery endpoints.
 */
export function getVersionContract() {
  return {
    versions: Object.entries(API_VERSIONS).map(([key, value]) => ({
      version: key,
      introduced: value.introduced,
      current_minor: value.currentMinorVersion,
      deprecated: value.deprecated,
      deprecation_date: value.deprecationDate,
      sunset_date: value.sunsetDate,
    })),
    versioning_strategy: {
      major: "Path-based (/v1/, /v2/). Breaking changes only.",
      minor: "Header-based (API-Version: YYYY-MM-DD). Non-breaking additions.",
      deprecation_policy: "Minimum 18 months support after deprecation notice.",
      deprecation_headers: ["Deprecation: true", "Sunset: <ISO-date>"],
    },
    docs: "https://docs.circleworks.io/api",
  };
}
