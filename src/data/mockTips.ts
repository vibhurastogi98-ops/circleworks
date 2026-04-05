export interface TipRecord {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  hoursWorked: number;
  declaredTips: number;
  allocatedTips: number;
  totalTips: number;
  ficaOnTips: number;
  netTipCredit: number;
}

export const mockTipRecords: TipRecord[] = [
  { id: "tp-1", employeeId: "EMP-1042", name: "Maria Santos", role: "Bartender", hoursWorked: 65, declaredTips: 1250.00, allocatedTips: 0, totalTips: 1250.00, ficaOnTips: 95.63, netTipCredit: 82.10 },
  { id: "tp-2", employeeId: "EMP-1105", name: "David Martinez", role: "Server", hoursWorked: 72, declaredTips: 1420.50, allocatedTips: 0, totalTips: 1420.50, ficaOnTips: 108.67, netTipCredit: 94.20 },
  { id: "tp-3", employeeId: "EMP-1089", name: "Aisha Johnson", role: "Server", hoursWorked: 50, declaredTips: 890.00, allocatedTips: 0, totalTips: 890.00, ficaOnTips: 68.08, netTipCredit: 52.30 },
  { id: "tp-4", employeeId: "EMP-1135", name: "Raj Patel", role: "Busser", hoursWorked: 40, declaredTips: 320.00, allocatedTips: 0, totalTips: 320.00, ficaOnTips: 24.48, netTipCredit: 12.00 },
  { id: "tp-5", employeeId: "EMP-1140", name: "Lisa Thompson", role: "Server", hoursWorked: 80, declaredTips: 1100.00, allocatedTips: 0, totalTips: 1100.00, ficaOnTips: 84.15, netTipCredit: 65.00 },
];

export interface TipPool {
  id: string;
  name: string;
  distributionMethod: "hours" | "points" | "percentage";
  totalPoolAmount: number;
  participatingEmployees: number;
  status: "active" | "draft";
  stateRuleFlag?: string;
}

export const mockTipPools: TipPool[] = [
  { id: "pool-1", name: "Front of House Weekly", distributionMethod: "hours", totalPoolAmount: 4500.00, participatingEmployees: 8, status: "active" },
  { id: "pool-2", name: "Bar Staff specific", distributionMethod: "points", totalPoolAmount: 1200.00, participatingEmployees: 3, status: "active" },
  { id: "pool-3", name: "BOH Shared Pool", distributionMethod: "percentage", totalPoolAmount: 850.00, participatingEmployees: 4, status: "draft", stateRuleFlag: "CA labor code 351 limits BOH mandatory pooling participation." }
];

export const mockForm8027Data = {
  grossReceipts: 42500.00,
  chargeReceipts: 38000.00,
  chargedTips: 6840.00,
  totalDeclaredTips: 4980.50, // This is < 8% of Gross Receipts (8% of 42.5k = 3400, so 4980 > 3400. Setup mock data to be slightly under later for testing if needed)
  allocationMethod: "hours",
  eightPercentThreshold: 3400.00
};
