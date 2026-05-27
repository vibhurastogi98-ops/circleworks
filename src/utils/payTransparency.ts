const PAY_TRANSPARENCY_STATES = [
  { code: "CA", names: ["california", ", ca", "san francisco", "los angeles"], label: "California" },
  { code: "CO", names: ["colorado", ", co", "denver", "boulder"], label: "Colorado" },
  { code: "NY", names: ["new york", ", ny", "nyc"], label: "New York" },
  { code: "WA", names: ["washington", ", wa", "seattle"], label: "Washington" },
  { code: "IL", names: ["illinois", ", il", "chicago"], label: "Illinois" },
  { code: "NV", names: ["nevada", ", nv", "las vegas", "reno"], label: "Nevada" },
  { code: "RI", names: ["rhode island", ", ri", "providence"], label: "Rhode Island" },
  { code: "MD", names: ["maryland", ", md", "baltimore"], label: "Maryland" },
];

const INTERNAL_PAY_BANDS: Record<string, { min: number; max: number }> = {
  Engineering: { min: 110000, max: 185000 },
  Product: { min: 120000, max: 170000 },
  Marketing: { min: 70000, max: 110000 },
  Sales: { min: 80000, max: 160000 },
  General: { min: 65000, max: 135000 },
};

export function getPayTransparencyState(location: string) {
  const normalized = location.toLowerCase();
  return PAY_TRANSPARENCY_STATES.find((state) =>
    state.names.some((name) => normalized.includes(name)),
  ) || null;
}

export function getInternalPayBand(department: string) {
  return INTERNAL_PAY_BANDS[department] || INTERNAL_PAY_BANDS.General;
}

export function validatePayTransparencyPosting(input: {
  location: string;
  department: string;
  salaryMin: string | number;
  salaryMax: string | number;
}) {
  const state = getPayTransparencyState(input.location);
  const salaryMin = Number(input.salaryMin);
  const salaryMax = Number(input.salaryMax);
  const band = getInternalPayBand(input.department || "General");
  const errors: string[] = [];
  const warnings: string[] = [];

  if (state && (!salaryMin || !salaryMax || salaryMin <= 0 || salaryMax <= 0 || salaryMin > salaryMax)) {
    errors.push(`Pay Range (Min-Max) is required for jobs in ${state.label}.`);
  }

  if (salaryMin && salaryMax && (salaryMin < band.min || salaryMax > band.max)) {
    const direction = salaryMin < band.min ? "minimum below" : "maximum above";
    warnings.push(`Pay range ${direction} internal ${input.department || "General"} band (${band.min.toLocaleString()}-${band.max.toLocaleString()}).`);
  }

  return {
    required: Boolean(state),
    state,
    band,
    errors,
    warnings,
    canPublish: errors.length === 0,
  };
}
