"use client";

import type { MidPeriodHandlingOption, PayrollCompensationChange, PayrollEmployee, TaxBreakdown } from "@/store/usePayrollRunStore";

export interface PayrollPeriodWindow {
  start: string;
  end: string;
}

export interface SavedCompensationChange {
  employeeId: string;
  employeeName: string;
  oldRate: number;
  newRate: number;
  effectiveDate: string;
  handling: MidPeriodHandlingOption;
  payType: PayrollEmployee["payType"];
  savedAt: string;
}

const STORAGE_KEY = "cw:compensation-sync:changes";
const DRAFT_KEY = "cw:payroll:draft-created-at";

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function toDateOnly(value: string) {
  return new Date(`${value}T00:00:00`);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getPeriodDayCount(period: PayrollPeriodWindow) {
  const start = toDateOnly(period.start);
  const end = toDateOnly(period.end);
  return Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
}

export function classifyEffectiveDate(effectiveDate: string, period: PayrollPeriodWindow) {
  const effective = toDateOnly(effectiveDate);
  const start = toDateOnly(period.start);
  const end = toDateOnly(period.end);

  if (effective < start) return "past";
  if (effective > end) return "future";
  return "mid_period";
}

export function saveCompensationChange(change: SavedCompensationChange) {
  const storage = getStorage();
  if (!storage) return;

  const existing = getSavedCompensationChanges().filter(
    (entry) => !(entry.employeeId === change.employeeId && entry.effectiveDate === change.effectiveDate)
  );
  existing.unshift(change);
  storage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
}

export function getSavedCompensationChanges(): SavedCompensationChange[] {
  const storage = getStorage();
  if (!storage) return [];

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as SavedCompensationChange[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getDraftCreatedAt() {
  const storage = getStorage();
  if (!storage) return null;
  return storage.getItem(DRAFT_KEY);
}

export function ensureDraftCreatedAt() {
  const storage = getStorage();
  if (!storage) return null;

  const existing = storage.getItem(DRAFT_KEY);
  if (existing) return existing;

  const createdAt = new Date().toISOString();
  storage.setItem(DRAFT_KEY, createdAt);
  return createdAt;
}

export function clearDraftCreatedAt() {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(DRAFT_KEY);
}

function annualToBiweekly(rate: number) {
  return rate / 26;
}

function hourlyToPeriodGross(rate: number, hours: number) {
  return rate * hours;
}

export function applyGrossToTaxes(taxes: TaxBreakdown, previousGross: number, nextGross: number): TaxBreakdown {
  if (previousGross <= 0) return taxes;

  const scale = nextGross / previousGross;
  return {
    federalIT: roundCurrency(taxes.federalIT * scale),
    ficaSS: roundCurrency(taxes.ficaSS * scale),
    ficaMed: roundCurrency(taxes.ficaMed * scale),
    stateIT: roundCurrency(taxes.stateIT * scale),
    localIT: roundCurrency(taxes.localIT * scale),
  };
}

export function buildPayrollCompensationChange(
  employee: PayrollEmployee,
  change: SavedCompensationChange,
  period: PayrollPeriodWindow
): PayrollCompensationChange | null {
  if (change.handling === "next_period_only") return null;

  const periodDays = getPeriodDayCount(period);
  const periodStart = toDateOnly(period.start);
  const effective = toDateOnly(change.effectiveDate);
  const daysBefore = Math.max(0, Math.floor((effective.getTime() - periodStart.getTime()) / 86400000));
  const daysAfter = Math.max(0, periodDays - daysBefore);

  const defaultHours = employee.hours ?? employee.timesheetImport?.totalHours ?? 80;
  const oldPeriodEarnings = employee.payType === "salary"
    ? annualToBiweekly(change.oldRate)
    : hourlyToPeriodGross(change.oldRate, defaultHours);
  const newPeriodEarnings = employee.payType === "salary"
    ? annualToBiweekly(change.newRate)
    : hourlyToPeriodGross(change.newRate, defaultHours);

  const grossPay = change.handling === "full_period"
    ? roundCurrency(newPeriodEarnings)
    : roundCurrency((oldPeriodEarnings * (daysBefore / periodDays)) + (newPeriodEarnings * (daysAfter / periodDays)));

  const oldEarnings = change.handling === "full_period"
    ? 0
    : roundCurrency(oldPeriodEarnings * (daysBefore / periodDays));
  const newEarnings = change.handling === "full_period"
    ? roundCurrency(newPeriodEarnings)
    : roundCurrency(newPeriodEarnings * (daysAfter / periodDays));

  const tooltip =
    change.handling === "prorate"
      ? `Rate changed from ${formatCurrency(change.oldRate)} to ${formatCurrency(change.newRate)} effective ${formatDate(change.effectiveDate)} — prorated`
      : `Rate changed from ${formatCurrency(change.oldRate)} to ${formatCurrency(change.newRate)} effective ${formatDate(change.effectiveDate)} — applied to full period`;

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    oldRate: change.oldRate,
    newRate: change.newRate,
    effectiveDate: change.effectiveDate,
    handling: change.handling,
    savedAt: change.savedAt,
    daysBefore,
    daysAfter,
    periodDays,
    grossPay,
    oldEarnings,
    newEarnings,
    tooltip,
  };
}

export function getCompensationChangesSinceDraft(
  employees: PayrollEmployee[],
  period: PayrollPeriodWindow
) {
  const draftCreatedAt = getDraftCreatedAt();
  if (!draftCreatedAt) {
    return { count: 0, byEmployeeId: new Map<string, PayrollCompensationChange>() };
  }

  const draftMillis = new Date(draftCreatedAt).getTime();
  const byEmployeeId = new Map<string, PayrollCompensationChange>();

  getSavedCompensationChanges().forEach((change) => {
    if (new Date(change.savedAt).getTime() <= draftMillis) return;

    const employee = employees.find((entry) => entry.id === change.employeeId);
    if (!employee) return;

    if (classifyEffectiveDate(change.effectiveDate, period) !== "mid_period") return;

    const normalized = buildPayrollCompensationChange(employee, change, period);
    if (!normalized) return;

    byEmployeeId.set(employee.id, normalized);
  });

  return { count: byEmployeeId.size, byEmployeeId };
}
