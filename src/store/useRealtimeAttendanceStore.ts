import { create } from "zustand";

export type LiveAttendanceStatus = "clocked-in" | "clocked-out";

export interface LiveAttendanceRecord {
  employeeId: string;
  status: LiveAttendanceStatus;
  timestamp: string;
  hoursWorked?: number;
}

interface RealtimeAttendanceState {
  records: Record<string, LiveAttendanceRecord>;
  updateClockIn: (payload: { employeeId: string; timestamp: string }) => void;
  updateClockOut: (payload: {
    employeeId: string;
    timestamp: string;
    hoursWorked: number;
  }) => void;
  clear: () => void;
}

export const useRealtimeAttendanceStore = create<RealtimeAttendanceState>(
  (set) => ({
    records: {},
    updateClockIn: ({ employeeId, timestamp }) =>
      set((state) => ({
        records: {
          ...state.records,
          [employeeId]: { employeeId, status: "clocked-in", timestamp },
        },
      })),
    updateClockOut: ({ employeeId, timestamp, hoursWorked }) =>
      set((state) => ({
        records: {
          ...state.records,
          [employeeId]: {
            employeeId,
            status: "clocked-out",
            timestamp,
            hoursWorked,
          },
        },
      })),
    clear: () => set({ records: {} }),
  }),
);
