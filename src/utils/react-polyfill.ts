/**
 * React Context Polyfill
 * Ensures React is available globally for legacy code
 */

// Only apply in development/browser environment
if (typeof window !== 'undefined' && !window.React) {
  import('react').then((React) => {
    window.React = React.default || React;
    console.log('✅ React polyfill applied');
  }).catch(err => {
    console.error('Failed to load React polyfill:', err);
  });
}
