import { create } from 'zustand'

export const dateRangeOptions = [
  { label: 'Yesterday', days: 1 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 14 Days', days: 14 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 3 Months', days: 90 },
  { label: 'Last 6 Months', days: 180 },
  { label: 'Last 12 Months', days: 365 },
]

export const businessTags = ['Finito', 'Solar', 'Umzug', 'Different']

// Load persisted tags from localStorage
const loadTags = () => {
  try {
    return JSON.parse(localStorage.getItem('seo-website-tags') || '{}')
  } catch { return {} }
}

const persistTags = (tags) => {
  localStorage.setItem('seo-website-tags', JSON.stringify(tags))
}

export const useAppStore = create((set, get) => ({
  sidebarCollapsed: false,
  searchQuery: '',
  dateRange: 30,
  activeBusinessFilter: null, // null = "All", or a tag name like "Finito"
  websiteTags: loadTags(), // { 'domain.com': 'Finito', ... }

  setSidebarCollapsed: (val) => set({ sidebarCollapsed: val }),
  setSearchQuery: (val) => set({ searchQuery: val }),
  setDateRange: (val) => set({ dateRange: val }),
  setActiveBusinessFilter: (val) => set({ activeBusinessFilter: val }),

  setWebsiteTag: (domain, tag) => {
    const updated = { ...get().websiteTags }
    if (tag) {
      updated[domain] = tag
    } else {
      delete updated[domain]
    }
    persistTags(updated)
    set({ websiteTags: updated })
  },
}))
