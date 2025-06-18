import { create } from 'zustand';
import { FilterState } from '../types';

interface DrilldownLevel {
  level: string;
  value: string;
  filters: Record<string, any>;
  timestamp: Date;
}

interface FilterStore extends FilterState {
  // Existing filter methods
  setDateRange: (from: Date | null, to: Date | null) => void;
  setBarangays: (barangays: string[]) => void;
  setCategories: (categories: string[]) => void;
  setBrands: (brands: string[]) => void;
  setStores: (stores: string[]) => void;
  resetFilters: () => void;
  getActiveFilterCount: () => number;
  initializeFromURL: () => void;
  syncToURL: () => void;
  
  // Drilldown functionality
  drilldownPath: DrilldownLevel[];
  addDrilldown: (level: string, value: string) => void;
  removeDrilldown: (index: number) => void;
  clearDrilldown: () => void;
  
  // Cross-filter functionality
  crossFilters: Map<string, Set<string>>;
  setCrossFilter: (chartId: string, values: string[]) => void;
  clearCrossFilter: (chartId: string) => void;
  clearAllCrossFilters: () => void;
}

const initialState: FilterState = {
  dateRange: { from: null, to: null },
  barangays: [],
  categories: [],
  brands: [],
  stores: [],
};

const initialDrilldownState = {
  drilldownPath: [],
  crossFilters: new Map(),
};

export const useFilterStore = create<FilterStore>((set, get) => ({
  ...initialState,
  ...initialDrilldownState,

  setDateRange: (from, to) => {
    set({ dateRange: { from, to } });
    get().syncToURL();
  },

  setBarangays: (barangays) => {
    set({ barangays });
    get().syncToURL();
  },

  setCategories: (categories) => {
    set({ categories });
    get().syncToURL();
  },

  setBrands: (brands) => {
    set({ brands });
    get().syncToURL();
  },

  setStores: (stores) => {
    set({ stores });
    get().syncToURL();
  },

  resetFilters: () => {
    set(initialState);
    get().syncToURL();
  },

  getActiveFilterCount: () => {
    const state = get();
    let count = 0;
    if (state.dateRange.from || state.dateRange.to) count++;
    if (state.barangays.length > 0) count++;
    if (state.categories.length > 0) count++;
    if (state.brands.length > 0) count++;
    if (state.stores.length > 0) count++;
    return count;
  },

  initializeFromURL: () => {
    const params = new URLSearchParams(window.location.search);
    const filters: Partial<FilterState> = {};

    const fromDate = params.get('from');
    const toDate = params.get('to');
    if (fromDate || toDate) {
      filters.dateRange = {
        from: fromDate ? new Date(fromDate) : null,
        to: toDate ? new Date(toDate) : null,
      };
    }

    const barangays = params.get('barangays');
    if (barangays) filters.barangays = barangays.split(',');

    const categories = params.get('categories');
    if (categories) filters.categories = categories.split(',');

    const brands = params.get('brands');
    if (brands) filters.brands = brands.split(',');

    const stores = params.get('stores');
    if (stores) filters.stores = stores.split(',');

    set({ ...initialState, ...filters });
  },

  syncToURL: () => {
    const state = get();
    const params = new URLSearchParams();

    if (state.dateRange.from) params.set('from', state.dateRange.from.toISOString());
    if (state.dateRange.to) params.set('to', state.dateRange.to.toISOString());
    if (state.barangays.length > 0) params.set('barangays', state.barangays.join(','));
    if (state.categories.length > 0) params.set('categories', state.categories.join(','));
    if (state.brands.length > 0) params.set('brands', state.brands.join(','));
    if (state.stores.length > 0) params.set('stores', state.stores.join(','));
    if (state.drilldownPath.length > 0) params.set('drill', JSON.stringify(state.drilldownPath));

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  },

  // Drilldown methods
  addDrilldown: (level, value) => {
    const state = get();
    const newDrilldown: DrilldownLevel = {
      level,
      value,
      filters: {
        barangays: [...state.barangays],
        categories: [...state.categories],
        brands: [...state.brands],
        stores: [...state.stores],
      },
      timestamp: new Date(),
    };
    
    set({ drilldownPath: [...state.drilldownPath, newDrilldown] });
    get().syncToURL();
  },

  removeDrilldown: (index) => {
    const state = get();
    const newPath = state.drilldownPath.slice(0, index);
    
    // Restore filters from previous level if exists
    if (index > 0 && state.drilldownPath[index - 1]) {
      const previousFilters = state.drilldownPath[index - 1].filters;
      set({
        drilldownPath: newPath,
        barangays: previousFilters.barangays || [],
        categories: previousFilters.categories || [],
        brands: previousFilters.brands || [],
        stores: previousFilters.stores || [],
      });
    } else {
      set({
        drilldownPath: newPath,
        barangays: [],
        categories: [],
        brands: [],
        stores: [],
      });
    }
    get().syncToURL();
  },

  clearDrilldown: () => {
    set({ 
      drilldownPath: [],
      barangays: [],
      categories: [],
      brands: [],
      stores: [],
    });
    get().syncToURL();
  },

  // Cross-filter methods
  setCrossFilter: (chartId, values) => {
    const state = get();
    const newCrossFilters = new Map(state.crossFilters);
    newCrossFilters.set(chartId, new Set(values));
    set({ crossFilters: newCrossFilters });
  },

  clearCrossFilter: (chartId) => {
    const state = get();
    const newCrossFilters = new Map(state.crossFilters);
    newCrossFilters.delete(chartId);
    set({ crossFilters: newCrossFilters });
  },

  clearAllCrossFilters: () => {
    set({ crossFilters: new Map() });
  },
}));