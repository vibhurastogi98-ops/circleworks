import { cacheKeys, cacheTtlSec } from "@/lib/cache-keys";
import { setCacheJson } from "@/lib/redis-cache";

/**
 * Sec. 02 — pre-populate dashboard cache on successful login (best-effort).
 */
export async function warmDashboardCacheOnLogin(userId: number, companyId: number): Promise<void> {
  await setCacheJson(
    cacheKeys.companyDashboard(companyId),
    { warmedAt: new Date().toISOString(), userId },
    cacheTtlSec.companyDashboard
  );
}
