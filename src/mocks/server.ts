import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Define request handlers
export const handlers = [
  // Health endpoint
  http.get('/health', () => {
    return HttpResponse.json({ status: 'ok' });
  }),

  // API base endpoint
  http.get('/api', () => {
    return HttpResponse.json({ 
      message: 'Scout Analytics API',
      version: '1.0.0'
    });
  }),

  // Mock analytics endpoint
  http.get('/api/analytics', () => {
    return HttpResponse.json({
      data: {
        overview: {
          revenue: 1000000,
          transactions: 5000,
          customers: 1000
        },
        regions: []
      }
    });
  }),
];

// Create the server
export const server = setupServer(...handlers);
EOF < /dev/null