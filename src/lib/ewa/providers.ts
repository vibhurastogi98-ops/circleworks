export type EwaProviderId = "dailypay" | "clair";
export type EwaTransferRail = "Instant ACH" | "Same-day ACH" | "Debit card";

export type EwaProviderConfig = {
  id: EwaProviderId;
  name: string;
  displayName: string;
  transferRail: EwaTransferRail;
  settlementTiming: string;
  feeCoveredByEmployer: boolean;
  supportsInstantFunding: boolean;
  supportUrl: string;
};

export type EwaAvailabilityInput = {
  earnedWages: number;
  accessiblePercent: number;
  maxPerPayPeriod: number;
  alreadyAdvanced?: number;
};

export type EwaAvailability = {
  grossAccessible: number;
  availableAmount: number;
  percentOfEarnedAccessible: number;
};

export const ewaProviders: Record<EwaProviderId, EwaProviderConfig> = {
  dailypay: {
    id: "dailypay",
    name: "DailyPay",
    displayName: "DailyPay",
    transferRail: "Instant ACH",
    settlementTiming: "Usually within minutes",
    feeCoveredByEmployer: true,
    supportsInstantFunding: true,
    supportUrl: "https://www.dailypay.com/",
  },
  clair: {
    id: "clair",
    name: "Clair",
    displayName: "Clair",
    transferRail: "Debit card",
    settlementTiming: "Instant to Clair card",
    feeCoveredByEmployer: true,
    supportsInstantFunding: true,
    supportUrl: "https://getclair.com/",
  },
};

export function getEwaProvider(providerId: EwaProviderId = "dailypay") {
  return ewaProviders[providerId];
}

export function calculateEwaAvailability({
  earnedWages,
  accessiblePercent,
  maxPerPayPeriod,
  alreadyAdvanced = 0,
}: EwaAvailabilityInput): EwaAvailability {
  const grossAccessible = roundCurrency(
    Math.min(maxPerPayPeriod, earnedWages * accessiblePercent),
  );
  const availableAmount = roundCurrency(
    Math.max(0, grossAccessible - alreadyAdvanced),
  );
  const percentOfEarnedAccessible =
    earnedWages > 0 ? Math.round((availableAmount / earnedWages) * 100) : 0;

  return {
    grossAccessible,
    availableAmount,
    percentOfEarnedAccessible,
  };
}

export function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}
