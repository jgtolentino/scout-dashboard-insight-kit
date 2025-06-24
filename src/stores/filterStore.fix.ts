// Fixed Zustand filter store for Scout Analytics
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Filters {
  // Geography
  region: string
  city: string  
  municipality: string
  barangay: string
  location: string
  
  // Organization
  holding_company: string
  client: string
  category: string
  brand: string
  sku: string
  
  // Time
  dateRange: {
    start: string
    end: string
  }
}

interface FilterStore {
  filters: Filters
  setFilter: (key: keyof Filters, value: any) => void
  clearFilters: () => void
  clearDownstreamFilters: (level: string) => void
}

const defaultFilters: Filters = {
  region: '',
  city: '',
  municipality: '',
  barangay: '',
  location: '',
  holding_company: '',
  client: '',
  category: '',
  brand: '',
  sku: '',
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  }
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set, get) => ({
      filters: defaultFilters,
      
      setFilter: (key, value) => {
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value
          }
        }))
      },
      
      clearFilters: () => {
        set({ filters: defaultFilters })
      },
      
      clearDownstreamFilters: (level: string) => {
        const geographyLevels = ['region', 'city', 'municipality', 'barangay', 'location']
        const orgLevels = ['holding_company', 'client', 'category', 'brand', 'sku']
        
        const currentFilters = get().filters
        const newFilters = { ...currentFilters }
        
        // Clear downstream geography filters
        if (geographyLevels.includes(level)) {
          const levelIndex = geographyLevels.indexOf(level)
          for (let i = levelIndex + 1; i < geographyLevels.length; i++) {
            newFilters[geographyLevels[i] as keyof Filters] = '' as any
          }
        }
        
        // Clear downstream organization filters  
        if (orgLevels.includes(level)) {
          const levelIndex = orgLevels.indexOf(level)
          for (let i = levelIndex + 1; i < orgLevels.length; i++) {
            newFilters[orgLevels[i] as keyof Filters] = '' as any
          }
        }
        
        set({ filters: newFilters })
      }
    }),
    {
      name: 'scout-analytics-filters',
      version: 1
    }
  )
)