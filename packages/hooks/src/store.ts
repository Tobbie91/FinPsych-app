/**
 * Minimal Zustand store for app-wide state.
 * Keep this minimal - use TanStack Query for server state.
 */

import { create } from 'zustand';

interface AppState {
  /**
   * Whether the sidebar is collapsed (for responsive layouts).
   */
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

/**
 * Minimal app store using Zustand.
 * Extend as needed for client-only state.
 */
export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
