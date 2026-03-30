import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlatformState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isAdmin: boolean;
  isPayrollRunning: boolean;
  hasComplianceAlert: boolean;
  dismissComplianceAlert: () => void;
  setPayrollRunning: (val: boolean) => void;
}

export const usePlatformStore = create<PlatformState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      isAdmin: true, // Default to true so you can see the admin buttons
      isPayrollRunning: false,
      hasComplianceAlert: true, // Default to true to show the banner
      dismissComplianceAlert: () => set({ hasComplianceAlert: false }),
      setPayrollRunning: (val: boolean) => set({ isPayrollRunning: val }),
    }),
    {
      name: 'platform-storage',
      partialize: (state) => ({ isDarkMode: state.isDarkMode }),
    }
  )
);
