import { create } from 'zustand';

interface SidebarState {
  sidebarOpen: boolean;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  sidebarOpen: false,
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => {
    const next = !state.sidebarOpen;
    return { sidebarOpen: next, isSidebarOpen: next };
  }),
  setSidebarOpen: (open) => set({ sidebarOpen: open, isSidebarOpen: open }),
}));
