/**
 * Layered capability resolution:
 *   base (hardcoded CAPABILITY_MATRIX) — the security ceiling
 * × plan (tenant's plan.included_capabilities; missing key = true = no gate)
 * × per-tenant override (tenant_capability_overrides.overrides)
 * × platform kill switch (platform_kill_switches.enabled)
 *
 * base "off" cannot be turned "on" by any DB layer. base "on" can be turned
 * off by plan / override / kill switch.
 *
 * See docs/platform-admin-spec.md §6.5.
 *
 * This file lives in @/lib/ and is a HELPER — it's allowed to import from
 * @/lib/capabilities (the base matrix). It's imported by TENANT code, not
 * platform code, so the CI grep-check on platform code is unaffected.
 */

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  plans,
  tenantPlans,
  tenantCapabilityOverrides,
  platformKillSwitches,
} from "@/db/schema";
import { CAPABILITY_MATRIX, type Capabilities, type CapabilityKey } from "@/lib/capabilities";
import { normalizeAccountType } from "@/lib/account-types";

type Layers = {
  base: Capabilities;
  plan: Partial<Capabilities>;
  override: Partial<Capabilities>;
  killed: Set<CapabilityKey>;
};

const CACHE_TTL_MS = 60_000;
type CachedEntry = { at: number; layers: Layers };
const layersCache = new Map<string, CachedEntry>();
let killedCache: { at: number; set: Set<CapabilityKey> } | null = null;

async function loadKilledCapabilities(): Promise<Set<CapabilityKey>> {
  if (killedCache && killedCache.at + CACHE_TTL_MS > Date.now()) return killedCache.set;
  try {
    const rows = await db
      .select({ capability: platformKillSwitches.capability, enabled: platformKillSwitches.enabled })
      .from(platformKillSwitches)
      .where(eq(platformKillSwitches.enabled, false));
    const set = new Set<CapabilityKey>(rows.map((r) => r.capability as CapabilityKey));
    killedCache = { at: Date.now(), set };
    return set;
  } catch {
    // If the platform tables don't exist yet (migration not run), fall back
    // to "no kills active" — the base matrix is still enforced.
    return new Set();
  }
}

async function loadTenantLayers(input: { accountType: string; companyId: number | null }): Promise<Layers> {
  const normalized = normalizeAccountType(input.accountType);
  const base = { ...CAPABILITY_MATRIX[normalized] } as Capabilities;
  const layers: Layers = {
    base,
    plan: {},
    override: {},
    killed: await loadKilledCapabilities(),
  };
  if (!input.companyId) return layers;

  try {
    const [tp] = await db
      .select({
        planCaps: plans.includedCapabilities,
        status: tenantPlans.status,
      })
      .from(tenantPlans)
      .innerJoin(plans, eq(plans.id, tenantPlans.planId))
      .where(eq(tenantPlans.companyId, input.companyId))
      .limit(1);
    if (tp?.planCaps && Object.keys(tp.planCaps).length > 0) {
      layers.plan = tp.planCaps as Partial<Capabilities>;
    }
  } catch {
    // ignore — plan layer becomes noop
  }
  try {
    const [ov] = await db
      .select({ overrides: tenantCapabilityOverrides.overrides })
      .from(tenantCapabilityOverrides)
      .where(eq(tenantCapabilityOverrides.companyId, input.companyId))
      .limit(1);
    if (ov?.overrides) layers.override = ov.overrides as Partial<Capabilities>;
  } catch {
    // ignore
  }
  return layers;
}

function combineLayers(layers: Layers): Capabilities {
  const out = {} as Capabilities;
  for (const key of Object.keys(layers.base) as CapabilityKey[]) {
    const base = layers.base[key];
    if (!base) {
      out[key] = false; // matrix is the ceiling
      continue;
    }
    const planOk = layers.plan[key] ?? true;
    const overrideOk = layers.override[key] ?? true;
    const killed = layers.killed.has(key);
    out[key] = base && planOk && overrideOk && !killed;
  }
  return out;
}

/**
 * Async, DB-aware, cached per companyId+accountType.
 */
export async function resolveCapabilities(input: {
  accountType: string;
  companyId: number | null;
}): Promise<Capabilities> {
  const key = `${input.companyId ?? "null"}::${normalizeAccountType(input.accountType)}`;
  const cached = layersCache.get(key);
  if (cached && cached.at + CACHE_TTL_MS > Date.now()) {
    return combineLayers(cached.layers);
  }
  const layers = await loadTenantLayers(input);
  layersCache.set(key, { at: Date.now(), layers });
  return combineLayers(layers);
}

/** Invalidate cache after a platform-admin write to overrides/plan/kill. */
export function invalidateCapabilitiesCache(companyId?: number) {
  if (companyId) {
    for (const k of Array.from(layersCache.keys())) {
      if (k.startsWith(`${companyId}::`)) layersCache.delete(k);
    }
  } else {
    layersCache.clear();
  }
  killedCache = null;
}

/** Unit-test helper. */
export function __testCombineLayers(layers: Layers) {
  return combineLayers(layers);
}
