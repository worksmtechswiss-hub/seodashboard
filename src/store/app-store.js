import { create } from 'zustand'

export const useAppStore = create((set) => ({
  sidebarCollapsed: false,
  searchQuery: '',
  setSidebarCollapsed: (val) => set({ sidebarCollapsed: val }),
  setSearchQuery: (val) => set({ searchQuery: val }),
}))
