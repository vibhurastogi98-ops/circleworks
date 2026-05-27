import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";
import vm from "node:vm";

const budgetBytes = Number(process.env.ROUTE_BUNDLE_GZIP_BUDGET_BYTES ?? 200 * 1024);
const manifestPath = path.join(process.cwd(), ".next", "app-build-manifest.json");

function collectClientReferenceManifests(dir) {
  if (!existsSync(dir)) return [];

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectClientReferenceManifests(entryPath);
    return entry.name.endsWith("_client-reference-manifest.js") ? [entryPath] : [];
  });
}

function getAppRouteAssets() {
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    return manifest.pages ?? {};
  }

  const assetsByRoute = {};
  const manifestFiles = collectClientReferenceManifests(path.join(process.cwd(), ".next", "server", "app"));

  for (const file of manifestFiles) {
    const sandbox = { globalThis: {} };
    vm.runInNewContext(readFileSync(file, "utf8"), sandbox, { filename: file });
    const manifests = sandbox.globalThis.__RSC_MANIFEST ?? {};

    for (const [route, manifest] of Object.entries(manifests)) {
      const entryJSFiles = manifest?.entryJSFiles ?? {};
      const sharedAssets = Object.entries(entryJSFiles)
        .filter(([entry]) => entry.includes("/layout") || entry.includes("global-error"))
        .flatMap(([, assets]) => assets);
      const sharedAssetSet = new Set(sharedAssets);
      const assets = Object.entries(entryJSFiles)
        .filter(([entry]) => !entry.includes("/layout") && !entry.includes("global-error"))
        .flatMap(([, assets]) => assets.filter((asset) => !sharedAssetSet.has(asset)));

      assetsByRoute[route] = [...new Set([...(assetsByRoute[route] ?? []), ...assets])];
    }
  }

  return assetsByRoute;
}

const pages = getAppRouteAssets();
const oversizedRoutes = [];

for (const [route, assets] of Object.entries(pages)) {
  const jsAssets = [...new Set((assets ?? []).filter((asset) => asset.endsWith(".js")))];
  let gzipBytes = 0;

  for (const asset of jsAssets) {
    const normalizedAsset = asset.replace(/^\/?_next\//, "");
    const assetPath = path.join(process.cwd(), ".next", normalizedAsset);
    if (!existsSync(assetPath) || !statSync(assetPath).isFile()) continue;
    gzipBytes += gzipSync(readFileSync(assetPath), { level: 9 }).byteLength;
  }

  if (gzipBytes > budgetBytes) {
    oversizedRoutes.push({ route, gzipBytes });
  }
}

if (oversizedRoutes.length) {
  const formatted = oversizedRoutes
    .sort((a, b) => b.gzipBytes - a.gzipBytes)
    .map(({ route, gzipBytes }) => `${route}: ${(gzipBytes / 1024).toFixed(1)}KB gzip`)
    .join("\n");

  throw new Error(`Route bundle budget exceeded (${budgetBytes / 1024}KB gzip):\n${formatted}`);
}

console.log(`Route bundle budget ok: all app routes are <= ${(budgetBytes / 1024).toFixed(0)}KB gzip.`);
