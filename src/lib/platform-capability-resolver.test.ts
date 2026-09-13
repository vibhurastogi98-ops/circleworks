import { describe, expect, it } from "vitest";

import { __testCombineLayers } from "@/lib/platform-capability-resolver";
import { CAPABILITY_MATRIX, type Capabilities, type CapabilityKey } from "@/lib/capabilities";

type Layers = Parameters<typeof __testCombineLayers>[0];

function mkLayers(partial: Partial<Layers> & { base: Capabilities }): Layers {
  return {
    plan: {},
    override: {},
    killed: new Set<CapabilityKey>(),
    ...partial,
  } as Layers;
}

describe("resolveCapabilities layering", () => {
  it("matrix off cannot be turned on by any layer", () => {
    const layers = mkLayers({
      base: { ...CAPABILITY_MATRIX.creator } as Capabilities,
      plan: { payroll: true },
      override: { payroll: true },
    });
    const out = __testCombineLayers(layers);
    expect(out.payroll).toBe(false);
  });

  it("plan can turn off a matrix-on capability", () => {
    const layers = mkLayers({
      base: { ...CAPABILITY_MATRIX.company } as Capabilities,
      plan: { hiring: false },
    });
    expect(__testCombineLayers(layers).hiring).toBe(false);
    expect(__testCombineLayers(layers).payroll).toBe(true);
  });

  it("per-tenant override can turn off a matrix-on capability", () => {
    const layers = mkLayers({
      base: { ...CAPABILITY_MATRIX.company } as Capabilities,
      override: { benefits: false },
    });
    expect(__testCombineLayers(layers).benefits).toBe(false);
  });

  it("kill switch turns capability off across the layered result", () => {
    const layers = mkLayers({
      base: { ...CAPABILITY_MATRIX.company } as Capabilities,
      killed: new Set<CapabilityKey>(["automations"]),
    });
    expect(__testCombineLayers(layers).automations).toBe(false);
  });

  it("with no layers active, base matrix wins", () => {
    const layers = mkLayers({
      base: { ...CAPABILITY_MATRIX.agency } as Capabilities,
    });
    const out = __testCombineLayers(layers);
    expect(out.clients).toBe(true);
    expect(out.ownerPayroll).toBe(false); // matrix
  });
});
