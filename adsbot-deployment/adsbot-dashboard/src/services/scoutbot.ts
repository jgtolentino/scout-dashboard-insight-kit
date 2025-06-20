import { OpenAI } from 'openai';

interface QueryResponse {
  answer: string;
  data?: any;
  sql?: string;
}

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
  defaultQuery: { 'api-version': '2024-02-15-preview' },
  defaultHeaders: {
    'api-key': process.env.AZURE_OPENAI_API_KEY,
  },
});

export async function analyzeQuery(query: string): Promise<QueryResponse> {
  try {
    const systemPrompt = `You are ScoutBot, an AI assistant for TBWA Project Scout marketing intelligence.
    
Database Schema (ces):
- tbwa_campaigns: id, campaign_name, client_name, campaign_type, predicted_roi, predicted_ctr, confidence_score, budget, start_date, end_date, status, created_at
- tbwa_creative_analysis: id, document_id, has_logo, has_product_shot, has_call_to_action, is_minimalist, uses_bold_typography, emotional_appeal, color_vibrancy, text_density, composition_score, analysis_timestamp
- tbwa_business_predictions: id, document_id, predicted_ctr, predicted_roi, predicted_engagement_rate, predicted_conversion_rate, predicted_brand_recall, predicted_revenue_impact, confidence_score, prediction_timestamp
- tbwa_campaign_documents: id, document_id, filename, file_type, campaign_name, client_name, file_size, upload_date, processed_date, status
- tbwa_data_metadata: id, table_name, record_count, last_updated, data_source, quality_score

Current data shows:
- 163 campaigns total (Salesforce, Expedia, Nike and others)
- Average predicted ROI: 3.2x
- Average predicted CTR: 2.8%
- Data quality score: 96%

Answer marketing questions about campaigns, creatives, and predictions. Be specific and data-driven.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const answer = completion.choices[0]?.message?.content || 'I apologize, but I could not process your query.';

    // For demo purposes, return mock data based on query keywords
    let mockData = null;
    if (query.toLowerCase().includes('campaign') && query.toLowerCase().includes('roi')) {
      mockData = {
        campaigns: [
          { name: 'Seasonal Expedia Q2 2024', roi: 3.01, client: 'Expedia' },
          { name: 'Product Launch Salesforce Q4 2024', roi: 2.68, client: 'Salesforce' },
          { name: 'Brand Awareness Nike Spring', roi: 2.45, client: 'Nike' }
        ]
      };
    }

    return {
      answer,
      data: mockData,
    };
  } catch (error) {
    console.error('ScoutBot query error:', error);
    return {
      answer: 'I encountered an error processing your query. Please try again or rephrase your question.',
    };
  }
}