/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const SITE_URL = "https://circleworks.com";
const LASTMOD = new Date().toISOString();

const tsModuleCache = new Map();

function loadJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, relativePath), "utf8"));
}

function loadTsModule(relativePath) {
  const filename = path.join(__dirname, relativePath);

  if (tsModuleCache.has(filename)) {
    return tsModuleCache.get(filename).exports;
  }

  const source = fs.readFileSync(filename, "utf8");
  const virtualModule = { exports: {} };
  tsModuleCache.set(filename, virtualModule);

  const compiled = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      resolveJsonModule: true,
      target: ts.ScriptTarget.ES2020,
    },
  });

  const localRequire = (request) => {
    if (request.startsWith("@/")) {
      return loadTsModule(path.join("src", request.slice(2)));
    }

    if (request.startsWith(".")) {
      const resolved = path.resolve(path.dirname(filename), request);
      if (fs.existsSync(`${resolved}.ts`)) return loadTsModule(`${resolved}.ts`);
      if (fs.existsSync(`${resolved}.tsx`)) return loadTsModule(`${resolved}.tsx`);
      if (fs.existsSync(`${resolved}.js`)) return require(`${resolved}.js`);
      if (fs.existsSync(`${resolved}.json`)) return require(`${resolved}.json`);
      return require(resolved);
    }

    return require(request);
  };

  vm.runInNewContext(
    compiled.outputText,
    {
      console,
      exports: virtualModule.exports,
      module: virtualModule,
      require: localRequire,
      __dirname: path.dirname(filename),
      __filename: filename,
    },
    { filename },
  );

  return virtualModule.exports;
}

function stateGuideSlug(state) {
  return `${state.slug.replace(/^payroll-/, "")}-payroll-guide`;
}

function createEntry(loc, priority, lastmod = LASTMOD) {
  return {
    loc,
    changefreq: "weekly",
    priority,
    lastmod,
  };
}

function priorityForPath(pathname) {
  if (pathname === "/") return 1.0;
  if (pathname === "/pricing" || pathname.startsWith("/product")) return 0.9;
  if (pathname === "/blog" || pathname.startsWith("/blog/")) return 0.8;
  if (pathname === "/glossary" || pathname.startsWith("/glossary/")) return 0.7;
  if (pathname.startsWith("/solutions/") || pathname.startsWith("/integrations/")) return 0.9;
  if (
    pathname.startsWith("/guides/") ||
    pathname.startsWith("/customers/") ||
    pathname.startsWith("/compare/")
  ) {
    return 0.8;
  }

  return 0.7;
}

async function additionalPaths() {
  const { blogPosts } = loadTsModule("src/app/blog/blogData.ts");
  const { glossaryTerms } = loadTsModule("src/lib/glossary.ts");
  const { integrations, generateSlug } = loadTsModule("src/data/integrations.ts");
  const { CASE_STUDIES } = loadTsModule("src/app/customers/customersData.ts");
  const { COMPETITORS } = loadTsModule("src/app/compare/competitors.ts");
  const { segments } = loadTsModule("src/app/solutions/[segment]/segmentData.ts");
  const states = loadJson("data/states.json");

  return [
    ...blogPosts.map((post) =>
      createEntry(`/blog/${post.slug}`, 0.8, new Date(post.publishedAt).toISOString()),
    ),
    ...glossaryTerms.map((term) => createEntry(`/glossary/${term.slug}`, 0.7)),
    ...states.map((state) => createEntry(`/guides/${stateGuideSlug(state)}`, 0.8)),
    ...integrations.map((integration) => createEntry(`/integrations/${generateSlug(integration.name)}`, 0.9)),
    ...CASE_STUDIES.map((study) => createEntry(`/customers/${study.slug}`, 0.8)),
    ...COMPETITORS.map((competitor) => createEntry(`/compare/${competitor}`, 0.8)),
    ...Object.keys(segments).map((segment) => createEntry(`/solutions/${segment}`, 0.9)),
  ];
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  sitemapSize: 5000,
  changefreq: "weekly",
  priority: 0.7,
  exclude: ["/api/*", "/app/*", "/_next/*", "/guides/payroll-*"],
  transform: async (_config, pathname) => createEntry(pathname, priorityForPath(pathname)),
  additionalPaths,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
  },
};
