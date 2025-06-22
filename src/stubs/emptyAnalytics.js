// Empty analytics stub to silence Blitz VM wrapper and GitHub integration calls
// This file replaces analytics.client-CWr-exsP.js and github-DEL0KHVL.js

export function initAnalytics() {
  // no-op
}

export function fetchSupabaseIntegration() {
  return Promise.resolve();
}

export function trackEvent() {
  // no-op
}

export function trackProjectIntegration() {
  // no-op
}

export function getTarball() {
  return Promise.resolve();
}

export function getGitHubUser() {
  return Promise.resolve({});
}

export function analyzeProjectStructure() {
  return Promise.resolve({});
}

export function sendAnalyticsEvent() {
  // no-op
}

// React hooks stubs
export function useAIInsights() {
  return { data: null, loading: false, error: null };
}

export function useVolumeData() {
  return { data: [], loading: false, error: null };
}

export function useCategoryMixData() {
  return { data: [], loading: false, error: null };
}

export function useTransactionData() {
  return { data: [], loading: false, error: null };
}

export function useDemographicsData() {
  return { data: [], loading: false, error: null };
}

export function useSubstitutionData() {
  return { data: [], loading: false, error: null };
}

export function useAIChat() {
  return { messages: [], sendMessage: () => {}, loading: false };
}

export function useRetailBot() {
  return { messages: [], sendMessage: () => {}, loading: false };
}

// Default export for any other imports
export default {
  initAnalytics,
  fetchSupabaseIntegration,
  trackEvent,
  trackProjectIntegration,
  getTarball,
  getGitHubUser,
  analyzeProjectStructure,
  sendAnalyticsEvent,
  useAIInsights,
  useVolumeData,
  useCategoryMixData,
  useTransactionData,
  useDemographicsData,
  useSubstitutionData,
  useAIChat,
  useRetailBot
};