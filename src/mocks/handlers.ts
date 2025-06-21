import { http, HttpResponse } from 'msw';

const base = 'http://localhost:3001';          // keep prod URLs untouched

export const handlers = [
  // Core API endpoints
  http.get('/api/volume', () => {
    return HttpResponse.json({ data: [{ hour: '10:00', count: 420, sum_amount: 61234 }] });
  }),
  http.get('/api/transactions', () => {
    return HttpResponse.json({ data: [{ id: 'demo', created_at: Date.now() }], count: 1 });
  }),
  http.get('/api/category-mix', () => {
    return HttpResponse.json({ data: [{ category: 'Snacks', count: 1337, share: 42 }] });
  }),
  http.get('/api/substitution', () => {
    return HttpResponse.json({ data: [{ from_brand: 'A', to_brand: 'B', count: 12 }] });
  }),
  http.get('/api/demographics', () => {
    return HttpResponse.json({
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: { count: 99 },
        geometry: { type: 'Point', coordinates: [121, 14] }
      }]
    });
  }),
  http.get('/api/profiles', () => {
    return HttpResponse.json({ value: 87.5 });
  }),
  http.post('/api/ai-insights', () => {
    return HttpResponse.json({ insights: ['Mock insight 1', 'Mock insight 2', 'Mock insight 3'] });
  }),
  
  // AI endpoints
  http.post('/api/ask', () => {
    return HttpResponse.json({ 
      response: "Based on your transaction data, I've identified several optimization opportunities. Peak sales occur between 6-8 PM, representing 23% of daily volume. Consider adjusting staffing and inventory during these hours."
    });
  }),
  http.post('/api/retailbot', () => {
    return HttpResponse.json({
      actions: [
        {
          id: 'pricing-optimization',
          title: 'Optimize Pricing for Beverages Category',
          description: 'Analysis shows 15% price elasticity in beverages. Recommend 8% price increase on premium SKUs during peak hours (6-8 PM) to maximize revenue without significant volume loss.',
          confidence: 89,
          category: 'pricing',
          filters: { categories: ['Beverages'], hour: '18-20' }
        }
      ],
      diagnostics: {
        data_quality: 'good',
        response_time_ms: 842,
        model_used: 'gpt-4',
        filters_applied: 2
      }
    });
  }),
  
  // Chat endpoints
  http.get('/api/chats/:id', () => {
    return HttpResponse.json({ id: 'demo-chat', messages: [] });
  }),
  http.post('/api/chats', () => {
    return HttpResponse.json({ id: 'new-chat', created: true });
  }),
  
  // Project endpoints
  http.get('/api/project/:id', () => {
    return HttpResponse.json({ id: 'demo-project', name: 'Scout Analytics' });
  }),
  http.get('/api/project/integrations/supabase/:id', () => {
    return HttpResponse.json({ integrated: true, status: 'connected' });
  }),
  
  // Auth endpoints
  http.get('/api/auth/session', () => {
    return HttpResponse.json({ user: { id: 'demo-user', email: 'demo@example.com' } });
  }),
  
  // Analytics endpoints
  http.get('/api/analytics/:type', () => {
    return HttpResponse.json({ data: [], type: 'mock' });
  }),
  
  // Catch-all for other API routes
  http.get('/api/*', () => {
    return HttpResponse.json({ error: 'Not implemented in mock' }, { status: 404 });
  }),
];