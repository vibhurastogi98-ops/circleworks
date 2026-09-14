import { z } from "zod";

// Zod v4's `allowsEval()` uses a `try { new Function(""); } catch {}` probe to
// detect JIT support. Strict CSPs (no 'unsafe-eval' in production) report the
// caught throw as a `securitypolicyviolation` even though Zod handles it
// gracefully. Setting `jitless: true` tells Zod to skip the probe entirely
// and always take the non-JIT path — silencing the noise without loosening CSP.
z.config({ jitless: true });

export {};
