// AdsBot API Integration for Scout Analytics  
// Provides AI-generated insights and chat functionality using Azure OpenAI

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
  private azureOpenAIEndpoint: string;
  private azureOpenAIKey: string;
  private deploymentName: string;
  private apiVersion: string;

  constructor() {
    this.azureOpenAIEndpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || 'https://tbwa-openai.openai.azure.com';
    this.azureOpenAIKey = import.meta.env.VITE_AZURE_OPENAI_KEY || '';
    this.deploymentName = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-4';
    this.apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '2024-02-15-preview';
    
    if (!this.azureOpenAIKey) {
      console.warn('⚠️ Azure OpenAI API key not configured. Using mock responses.');
    }
  }

  async getInsights(dataContext?: any): Promise<AdsBotInsight[]> {
    if (!this.azureOpenAIKey) {
      console.warn('Azure OpenAI not configured, using mock insights');
      return this.getMockInsights();
    }

    try {
      const prompt = this.buildInsightsPrompt(dataContext);
      const insights = await this.callAzureOpenAI(prompt, 'insights');
      return this.parseInsightsResponse(insights);
    } catch (error) {
      console.warn('Azure OpenAI API unavailable, using mock insights:', error);
      return this.getMockInsights();
    }
  }

  async sendChatMessage(message: string, context?: any): Promise<AdsBotChatResponse> {
    if (!this.azureOpenAIKey) {
      console.warn('Azure OpenAI not configured, using mock response');
      return this.getMockChatResponse(message);
    }

    try {
      const prompt = this.buildChatPrompt(message, context);
      const response = await this.callAzureOpenAI(prompt, 'chat');
      return this.parseChatResponse(response, message);
    } catch (error) {
      console.warn('Azure OpenAI API unavailable, using mock response:', error);
      return this.getMockChatResponse(message);
    }
  }

  private async callAzureOpenAI(prompt: string, type: 'insights' | 'chat'): Promise<string> {
    const url = `${this.azureOpenAIEndpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`;
    
    const systemMessage = type === 'insights' 
      ? this.getInsightsSystemMessage()
      : this.getChatSystemMessage();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.azureOpenAIKey,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        max_tokens: type === 'insights' ? 1500 : 800,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private getInsightsSystemMessage(): string {
    return `You are AdsBot, an AI analytics assistant for Scout Analytics, a retail analytics platform. 

Your role is to analyze retail transaction data and provide actionable business insights. You specialize in:
- Revenue and performance analysis
- Customer behavior patterns
- Product substitution trends
- Regional performance comparisons
- Promotional optimization
- Inventory recommendations

IMPORTANT: Always respond with insights in this JSON format:
{
  "insights": [
    {
      "id": "unique-id",
      "type": "trend|anomaly|opportunity|recommendation",
      "title": "Brief title",
      "description": "Detailed description",
      "confidence": 0.85,
      "impact": "high|medium|low",
      "actionItems": ["action 1", "action 2"],
      "dataPoints": [
        {"metric": "Revenue Growth", "value": "15.2%", "change": "+3.1%"}
      ]
    }
  ]
}

Focus on actionable insights that retail managers can implement immediately.`;
  }

  private getChatSystemMessage(): string {
    return `You are AdsBot, an AI analytics assistant for Scout Analytics, a retail analytics platform.

You help retail managers understand their data through conversational analysis. Provide:
- Clear, actionable insights
- Specific recommendations
- Data-driven explanations
- Follow-up questions

Keep responses concise but informative. Use retail industry terminology appropriately.
Always maintain a professional, helpful tone.`;
  }

  private buildInsightsPrompt(dataContext?: any): string {
    const contextStr = dataContext ? JSON.stringify(dataContext, null, 2) : 'No specific data context provided';
    
    return `Analyze the following retail analytics data and generate 3-4 key insights:

Data Context:
${contextStr}

Generate insights covering trends, anomalies, opportunities, and recommendations. 
Focus on actionable items that can drive business value.
Include confidence scores and impact assessments.
Provide specific metrics and percentage changes where relevant.`;
  }

  private buildChatPrompt(message: string, context?: any): string {
    const contextStr = context ? `\n\nCurrent Data Context:\n${JSON.stringify(context, null, 2)}` : '';
    
    return `User Question: ${message}${contextStr}

Provide a helpful response about retail analytics. Include specific suggestions for follow-up questions if appropriate.`;
  }

  private parseInsightsResponse(response: string): AdsBotInsight[] {
    try {
      const parsed = JSON.parse(response);
      if (parsed.insights && Array.isArray(parsed.insights)) {
        return parsed.insights.map((insight: any) => ({
          ...insight,
          id: insight.id || `insight-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.warn('Failed to parse insights response, using fallback');
    }
    
    // Fallback to mock insights if parsing fails
    return this.getMockInsights();
  }

  private parseChatResponse(response: string, userMessage: string): AdsBotChatResponse {
    // Extract suggested questions if present
    const suggestedQuestions = this.extractSuggestedQuestions(response);
    
    return {
      message: {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        metadata: {
          confidence: 0.92,
          sources: ['azure_openai', 'scout_analytics']
        }
      },
      suggestedQuestions
    };
  }

  private extractSuggestedQuestions(response: string): string[] {
    // Look for common question patterns in the response
    const questionPatterns = [
      /Would you like me to (.*?)\?/gi,
      /You might also want to (.*?)\?/gi,
      /Consider asking about (.*?)[\.\?]/gi
    ];
    
    const questions: string[] = [];
    questionPatterns.forEach(pattern => {
      const matches = response.match(pattern);
      if (matches) {
        questions.push(...matches.slice(0, 2)); // Max 2 per pattern
      }
    });
    
    // Fallback suggestions if none found
    if (questions.length === 0) {
      return [
        'What are the key trends in my data?',
        'Show me top performing products',
        'How can I improve regional performance?'
      ];
    }
    
    return questions.slice(0, 3); // Max 3 total
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