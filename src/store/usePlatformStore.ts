import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlatformState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isAdmin: boolean;
  isPayrollRunning: boolean;
  hasComplianceAlert: boolean;
  notificationCount: number;
  isCommandPaletteOpen: boolean;
  isCirceOpen: boolean;
  dismissComplianceAlert: () => void;
  setPayrollRunning: (val: boolean) => void;
  incrementNotificationCount: () => void;
  clearNotifications: () => void;
  setCommandPaletteOpen: (val: boolean) => void;
  setIsCirceOpen: (val: boolean) => void;
  toggleCirce: () => void;
}

export const usePlatformStore = create<PlatformState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      isAdmin: true, // Default to true so you can see the admin buttons
      isPayrollRunning: false,
      hasComplianceAlert: false, // Start clean
      notificationCount: 0, // Start clean
      isCommandPaletteOpen: false,
      isCirceOpen: false,
      dismissComplianceAlert: () => set({ hasComplianceAlert: false }),
      setPayrollRunning: (val: boolean) => set({ isPayrollRunning: val }),
      incrementNotificationCount: () => set((state) => ({ notificationCount: state.notificationCount + 1 })),
      clearNotifications: () => set({ notificationCount: 0 }),
      setCommandPaletteOpen: (val: boolean) => set({ isCommandPaletteOpen: val }),
      setIsCirceOpen: (val: boolean) => set({ isCirceOpen: val }),
      toggleCirce: () => set((state) => ({ isCirceOpen: !state.isCirceOpen })),
    }),
    {
      name: 'platform-storage',
      partialize: (state) => ({ isDarkMode: state.isDarkMode }),
    }
  )
);
