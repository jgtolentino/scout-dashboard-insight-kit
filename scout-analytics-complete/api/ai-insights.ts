import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.AZURE_OPENAI_KEY });

const keyFromFilters = (filters: any) =>
  'ai:' + Buffer.from(JSON.stringify(filters)).toString('base64url');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { filters } = req.body || {};
  if (!filters) return res.status(400).json({ error: 'Missing filters' });
  const cacheKey = keyFromFilters(filters);
  const cached = await kv.get(cacheKey);
  if (cached) return res.json(cached);
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a retail BI assistant.' },
      { role: 'user', content: `Generate 3 insights (with confidence 0‑1) for filters: ${JSON.stringify(filters)}` }
    ]
  });
  const output = { insights: completion.choices[0].message.content };
  await kv.set(cacheKey, output, { ex: 300 });
  res.json(output);
}
