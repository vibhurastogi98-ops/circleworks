import { create } from "zustand";

type PayrollStatus = {
  isRunning: boolean;
  employeeCount: number;
};

type DashboardRealtimeState = {
  payrollStatus: PayrollStatus;
  employeeDelta: number;
  notificationDelta: number;
  setPayrollStatus: (status: PayrollStatus) => void;
  incrementEmployeeDelta: () => void;
  incrementNotificationDelta: () => void;
};

export const useDashboardRealtimeStore = create<DashboardRealtimeState>((set) => ({
  payrollStatus: {
    isRunning: false,
    employeeCount: 47,
  },
  employeeDelta: 0,
  notificationDelta: 0,
  setPayrollStatus: (payrollStatus) => set({ payrollStatus }),
  incrementEmployeeDelta: () => set((state) => ({ employeeDelta: state.employeeDelta + 1 })),
  incrementNotificationDelta: () => set((state) => ({ notificationDelta: state.notificationDelta + 1 })),
}));
