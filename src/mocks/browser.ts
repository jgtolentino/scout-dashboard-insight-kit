import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Setup MSW worker for development
export const worker = setupWorker(...handlers);

// Start the worker and provide helpful development feedback
if (process.env.NODE_ENV === 'development') {
  worker.start({
    onUnhandledRequest: 'warn',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  }).then(() => {
    console.log('🚀 MSW (Mock Service Worker) started successfully');
    console.log('📊 Scout Analytics API endpoints are now mocked');
    console.log('🔧 All network requests to /api/* and /scout/* will be intercepted');
  }).catch((error) => {
    console.error('❌ Failed to start MSW:', error);
  });
}