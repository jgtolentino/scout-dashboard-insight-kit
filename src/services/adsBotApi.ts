// AdsBot API Integration for Scout Analytics
// Provides AI-generated insights and chat functionality

export interface AdsBotInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionItems: string[];
  dataPoints: {
    metric: string;
    value: string | number;
    change?: string;
  }[];
  timestamp: string;
}

export interface AdsBotChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    confidence?: number;
    sources?: string[];
    chartData?: any;
  };
}

export interface AdsBotChatResponse {
  message: AdsBotChatMessage;
  suggestedQuestions?: string[];
  chartData?: any;
}

class AdsBotApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_ADSBOT_API_URL || 'https://adsbot-api.azurewebsites.net';
    this.apiKey = import.meta.env.VITE_ADSBOT_API_KEY || 'adsbot-demo-key-2024';
  }

  async getInsights(dataContext?: any): Promise<AdsBotInsight[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          context: dataContext || {},
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`AdsBot API error: ${response.status}`);
      }

      const data = await response.json();
      return data.insights || this.getMockInsights();
    } catch (error) {
      console.warn('AdsBot API unavailable, using mock insights:', error);
      return this.getMockInsights();
    }
  }

  async sendChatMessage(message: string, context?: any): Promise<AdsBotChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          message,
          context: context || {},
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`AdsBot API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('AdsBot API unavailable, using mock response:', error);
      return this.getMockChatResponse(message);
    }
  }

  private getMockInsights(): AdsBotInsight[] {
    return [
      {
        id: 'insight-1',
        type: 'trend',
        title: 'NCR Revenue Surge',
        description: 'National Capital Region showing 15.2% growth this week, driven by beverage category performance.',
        confidence: 0.94,
        impact: 'high',
        actionItems: [
          'Increase inventory allocation for NCR stores',
          'Launch targeted promotions in beverage category',
          'Monitor competitor pricing in the region'
        ],
        dataPoints: [
          { metric: 'Revenue Growth', value: '15.2%', change: '+3.1%' },
          { metric: 'Transaction Volume', value: 2847, change: '+12%' },
          { metric: 'AOV', value: '₱285', change: '+2.8%' }
        ],
        timestamp: new Date().toISOString()
      },
      {
        id: 'insight-2',
        type: 'anomaly',
        title: 'Unusual Product Substitution Pattern',
        description: 'Significant shift from Coca-Cola to Pepsi in Region VII stores. Potential supply chain or pricing issue.',
        confidence: 0.87,
        impact: 'medium',
        actionItems: [
          'Check Coca-Cola stock levels in Region VII',
          'Review pricing strategy for cola products',
          'Contact suppliers for supply chain status'
        ],
        dataPoints: [
          { metric: 'Substitution Rate', value: '34%', change: '+18%' },
          { metric: 'Affected Stores', value: 12 },
          { metric: 'Revenue Impact', value: '₱45,200', change: '-8.2%' }
        ],
        timestamp: new Date().toISOString()
      },
      {
        id: 'insight-3',
        type: 'opportunity',
        title: 'Weekend Performance Gap',
        description: 'Saturday sales underperforming compared to Friday by 23%. Opportunity for weekend-specific campaigns.',
        confidence: 0.91,
        impact: 'medium',
        actionItems: [
          'Design weekend flash sales campaign',
          'Analyze customer behavior on Saturdays',
          'Test extended hours for high-traffic stores'
        ],
        dataPoints: [
          { metric: 'Saturday vs Friday', value: '-23%' },
          { metric: 'Potential Revenue', value: '₱125,000' },
          { metric: 'Customer Visits', value: 1205, change: '-18%' }
        ],
        timestamp: new Date().toISOString()
      },
      {
        id: 'insight-4',
        type: 'recommendation',
        title: 'Cross-Selling Opportunity: Snacks + Beverages',
        description: 'High correlation between beverage and snack purchases. Bundle promotions could increase basket size by 15%.',
        confidence: 0.88,
        impact: 'high',
        actionItems: [
          'Create beverage + snack combo deals',
          'Position complementary products near each other',
          'Train staff on suggestive selling techniques'
        ],
        dataPoints: [
          { metric: 'Correlation Score', value: '0.76' },
          { metric: 'Potential AOV Increase', value: '15%' },
          { metric: 'Customer Segments Affected', value: '67%' }
        ],
        timestamp: new Date().toISOString()
      }
    ];
  }

  private getMockChatResponse(userMessage: string): AdsBotChatResponse {
    const responses = {
      'revenue': {
        content: `Based on current data, total revenue is ₱2,847,392 with a 12.3% growth rate. The strongest performing region is NCR with ₱1,200,000 in revenue this period.

Key drivers:
• Beverage category leading with 28.5% market share
• Weekend sales showing room for improvement
• Cross-selling opportunities in snacks + beverages

Would you like me to dive deeper into any specific region or category?`,
        suggestedQuestions: [
          'What\'s driving the NCR revenue growth?',
          'How can we improve weekend sales?',
          'Show me top-performing products'
        ]
      },
      'trends': {
        content: `I've identified several key trends in your data:

📈 **Positive Trends:**
• NCR region growth (+15.2% this week)
• Beverage category expansion (+8.4%)
• Customer retention improving (+3.1%)

📉 **Areas of Concern:**
• Saturday sales lag (-23% vs Friday)
• Product substitution anomaly in Region VII
• Inventory turnover slowing in household items

**Actionable Insights:**
Focus on weekend promotions and investigate Region VII supply chain issues.`,
        suggestedQuestions: [
          'What\'s causing the Region VII substitution?',
          'How to boost Saturday performance?',
          'Best products for weekend promotions?'
        ]
      },
      'default': {
        content: `I'm AdsBot, your AI assistant for Scout Analytics. I can help you analyze trends, identify opportunities, and provide actionable recommendations based on your retail data.

**What I can help with:**
• Revenue and performance analysis
• Customer behavior insights  
• Product substitution patterns
• Regional performance comparisons
• Promotional optimization
• Inventory recommendations

What would you like to explore in your data today?`,
        suggestedQuestions: [
          'Show me revenue trends',
          'What are the top opportunities?',
          'Analyze customer segments',
          'Compare regional performance'
        ]
      }
    };

    const messageKey = userMessage.toLowerCase().includes('revenue') ? 'revenue' :
                      userMessage.toLowerCase().includes('trend') ? 'trends' : 'default';

    const response = responses[messageKey];

    return {
      message: {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        metadata: {
          confidence: 0.92,
          sources: ['transactions_summary', 'regional_kpis', 'product_insights']
        }
      },
      suggestedQuestions: response.suggestedQuestions
    };
  }
}

export const adsBotApi = new AdsBotApiClient();
export default adsBotApi;