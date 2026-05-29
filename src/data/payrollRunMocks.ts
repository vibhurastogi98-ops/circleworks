import type { Approver, PayrollEmployee } from "@/store/usePayrollRunStore";
import {
  employees as hrisEmployees,
  getEmployeeName,
} from "@/lib/hris-module-data";

function taxesFor(grossPay: number) {
  return {
    federalIT: Math.round(grossPay * 0.12 * 100) / 100,
    ficaSS: Math.round(grossPay * 0.062 * 100) / 100,
    ficaMed: Math.round(grossPay * 0.0145 * 100) / 100,
    stateIT: Math.round(grossPay * 0.052 * 100) / 100,
    localIT: Math.round(grossPay * 0.006 * 100) / 100,
  };
}

export const MOCK_EMPLOYEES: PayrollEmployee[] = hrisEmployees.map((employee, index) => {
  const name = getEmployeeName(employee);
  const payType = employee.payType === "Hourly" ? "hourly" : "salary";
  const hours = payType === "hourly" ? [82, 80, 76, 40][index % 4] : null;
  const compensationRate = payType === "hourly" ? employee.hourlyRate || 0 : employee.salary;
  const grossPay = Math.round((payType === "hourly" ? compensationRate * (hours || 80) : compensationRate / 24) * 100) / 100;
  const taxes = taxesFor(grossPay);
  const totalTaxes = Object.values(taxes).reduce((sum, value) => sum + value, 0);
  const deductions = Math.round(grossPay * (employee.employmentType === "Part-time" ? 0.025 : 0.055) * 100) / 100;
  const verifyStatus = employee.bankAccount === "Not connected" ? "error" : employee.status === "On Leave" ? "flagged" : "verified";

  return {
    id: employee.id,
    name,
    title: employee.title,
    department: employee.department,
    avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=transparent`,
    payType,
    compensationRate,
    compensationRateUnit: payType === "salary" ? "year" : "hour",
    hours,
    grossPay,
    deductions,
    netPay: Math.round((grossPay - totalTaxes - deductions) * 100) / 100,
    taxes,
    verifyStatus,
    flagReason: verifyStatus === "flagged" ? "Employee is currently on leave. Review pay eligibility." : undefined,
    errorMessage: verifyStatus === "error" ? "Direct deposit info missing." : undefined,
  };
});

export const MOCK_APPROVERS: Approver[] = [
  {
    id: "apr-01",
    name: getEmployeeName(hrisEmployees[3]),
    role: "Payroll Operations Lead",
    avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(getEmployeeName(hrisEmployees[3]))}&backgroundColor=transparent`,
    status: "pending",
  },
  {
    id: "apr-02",
    name: getEmployeeName(hrisEmployees[0]),
    role: "Chief People Officer",
    avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(getEmployeeName(hrisEmployees[0]))}&backgroundColor=transparent`,
    status: "pending",
  },
];

export const PAY_PERIOD = {
  start: "2026-06-01",
  end: "2026-06-15",
  checkDate: "2026-06-20",
};
