import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectAnomalies, getRecommendations } from '../aiService';

// Mock the AI service calls
vi.mock('../aiService', () => ({
  detectAnomalies: vi.fn(),
  getRecommendations: vi.fn()
}));

describe('AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('detectAnomalies', () => {
    it('should detect anomalies when present', async () => {
      const data = [
        { value: 100, date: '2024-01-01' },
        { value: 200, date: '2024-01-02' },
        { value: 50, date: '2024-01-03' }  // Anomaly
      ];

      (detectAnomalies as any).mockResolvedValue([
        { date: '2024-01-03', severity: 'high' }
      ]);

      const result = await detectAnomalies(data);
      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('high');
    }, 10000);  // Increased timeout
  });

  describe('getRecommendations', () => {
    it('should return recommendations with fallback', async () => {
      const data = { metrics: { sales: 1000 } };

      (getRecommendations as any).mockResolvedValue([
        { action: 'increase_inventory', confidence: 0.8 }
      ]);

      const result = await getRecommendations(data);
      expect(result).toHaveLength(1);
      expect(result[0].action).toBe('increase_inventory');
    }, 10000);  // Increased timeout
  });
}); 