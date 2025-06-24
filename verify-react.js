// Verify React is properly loaded
console.log('React version:', React?.version || 'Not loaded');
console.log('createContext available:', typeof React?.createContext === 'function');

// Check all context providers
const contexts = document.querySelectorAll('[data-react-context]');
console.log('Active contexts:', contexts.length);
