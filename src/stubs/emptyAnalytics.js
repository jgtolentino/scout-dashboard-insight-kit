// src/stubs/emptyAnalytics.js
export function fetchSupabaseIntegration(){ return Promise.resolve(); }
export function initAnalytics(){ /* no-op */ }
export function trackEvent(){ /* no-op */ }
export function useAIInsights(){ return { data: null, loading: false, error: null }; }
export function useVolumeData(){ return { data: [], loading: false, error: null }; }
export function useCategoryMixData(){ return { data: [], loading: false, error: null }; }
export function useTransactionData(){ return { data: [], loading: false, error: null }; }
export function useDemographicsData(){ return { data: [], loading: false, error: null }; }
export function useSubstitutionData(){ return { data: [], loading: false, error: null }; }
export function useAIChat(){ return { messages: [], sendMessage: () => {}, loading: false }; }
export function useRetailBot(){ return { messages: [], sendMessage: () => {}, loading: false }; }