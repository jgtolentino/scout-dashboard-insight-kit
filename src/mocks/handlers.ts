import { http, HttpResponse } from 'msw';

const base = 'http://localhost:3001';          // keep prod URLs untouched

export const handlers = [
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
];