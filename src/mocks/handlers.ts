import { rest } from 'msw';

const base = 'http://localhost:3001';          // keep prod URLs untouched

export const handlers = [
  rest.get('/api/volume', (_req, res, ctx) =>
    res(ctx.json({ data: [{ hour: '10:00', count: 420, sum_amount: 61234 }] }))
  ),
  rest.get('/api/transactions', (_req, res, ctx) =>
    res(ctx.json({ data: [{ id: 'demo', created_at: Date.now() }], count: 1 }))
  ),
  rest.get('/api/category-mix', (_req, res, ctx) =>
    res(ctx.json({ data: [{ category: 'Snacks', count: 1337, share: 42 }] }))
  ),
  rest.get('/api/substitution', (_req, res, ctx) =>
    res(ctx.json({ data: [{ from_brand: 'A', to_brand: 'B', count: 12 }] }))
  ),
  rest.get('/api/demographics', (_req, res, ctx) =>
    res(ctx.json({
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: { count: 99 },
        geometry: { type: 'Point', coordinates: [121, 14] }
      }]
    }))
  ),
  rest.get('/api/profiles', (_req, res, ctx) =>
    res(ctx.json({ value: 87.5 }))
  ),
  rest.post('/api/ai-insights', (_req, res, ctx) =>
    res(ctx.json({ insights: ['Mock insight 1', 'Mock insight 2', 'Mock insight 3'] }))
  ),
];