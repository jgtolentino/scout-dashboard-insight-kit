# Azure OpenAI Integration Setup

## Overview
AdsBot now uses **real Azure OpenAI APIs** instead of mock responses for production-ready AI functionality.

## Environment Configuration

### Required Environment Variables

Create these environment variables in your deployment environment:

```bash
# Azure OpenAI Configuration
VITE_AZURE_OPENAI_ENDPOINT=https://your-openai-resource.openai.azure.com
VITE_AZURE_OPENAI_KEY=your-azure-openai-api-key
VITE_AZURE_OPENAI_DEPLOYMENT=gpt-4
VITE_AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

### Local Development (.env.local)

```bash
# Copy these to your .env.local file
VITE_AZURE_OPENAI_ENDPOINT=https://tbwa-openai.openai.azure.com
VITE_AZURE_OPENAI_KEY=your-actual-api-key-here
VITE_AZURE_OPENAI_DEPLOYMENT=gpt-4
VITE_AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

## Azure OpenAI Resource Setup

### 1. Create Azure OpenAI Resource

```bash
# Using Azure CLI
az cognitiveservices account create \
  --name tbwa-openai \
  --resource-group scout-dashboard-rg \
  --location eastus \
  --kind OpenAI \
  --sku S0
```

### 2. Deploy GPT-4 Model

```bash
# Deploy GPT-4 model
az cognitiveservices account deployment create \
  --name tbwa-openai \
  --resource-group scout-dashboard-rg \
  --deployment-name gpt-4 \
  --model-name gpt-4 \
  --model-version "2024-02-15-preview" \
  --model-format OpenAI \
  --scale-settings-scale-type Standard
```

### 3. Get API Keys

```bash
# Get API keys
az cognitiveservices account keys list \
  --name tbwa-openai \
  --resource-group scout-dashboard-rg
```

## Vercel Deployment Setup

### Environment Variables in Vercel

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add the following:

```
VITE_AZURE_OPENAI_ENDPOINT = https://tbwa-openai.openai.azure.com
VITE_AZURE_OPENAI_KEY = [Your API Key]
VITE_AZURE_OPENAI_DEPLOYMENT = gpt-4
VITE_AZURE_OPENAI_API_VERSION = 2024-02-15-preview
```

### Azure App Service Setup

```bash
# Set environment variables in Azure App Service
az webapp config appsettings set \
  --name scout-analytics-dashboard \
  --resource-group scout-dashboard-rg \
  --settings \
    VITE_AZURE_OPENAI_ENDPOINT="https://tbwa-openai.openai.azure.com" \
    VITE_AZURE_OPENAI_KEY="your-api-key" \
    VITE_AZURE_OPENAI_DEPLOYMENT="gpt-4" \
    VITE_AZURE_OPENAI_API_VERSION="2024-02-15-preview"
```

## Features

### 🤖 Real AI-Powered Insights
- **Insights Generation**: GPT-4 analyzes your retail data and generates actionable insights
- **Conversational Chat**: Natural language queries about your analytics data
- **Contextual Responses**: AI understands your current filters and data context
- **Professional Prompting**: Specialized system prompts for retail analytics

### 📊 Structured Outputs
- **JSON Insights**: Structured insight objects with confidence scores
- **Action Items**: Specific recommendations for business action
- **Data Points**: Relevant metrics and percentage changes
- **Impact Assessment**: High/medium/low impact categorization

### 🔄 Fallback System
- **Graceful Degradation**: Falls back to mock data if Azure OpenAI unavailable
- **Error Handling**: Comprehensive error handling and logging
- **Development Mode**: Uses mocks when API keys not configured

## API Response Formats

### Insights Response
```json
{
  "insights": [
    {
      "id": "insight-123",
      "type": "trend",
      "title": "NCR Revenue Surge",
      "description": "National Capital Region showing 15.2% growth...",
      "confidence": 0.94,
      "impact": "high",
      "actionItems": [
        "Increase inventory allocation for NCR stores",
        "Launch targeted promotions in beverage category"
      ],
      "dataPoints": [
        {"metric": "Revenue Growth", "value": "15.2%", "change": "+3.1%"}
      ]
    }
  ]
}
```

### Chat Response
```json
{
  "message": {
    "id": "msg-456",
    "role": "assistant",
    "content": "Based on your current data, total revenue is ₱2,847,392...",
    "timestamp": "2024-01-15T10:30:00Z",
    "metadata": {
      "confidence": 0.92,
      "sources": ["azure_openai", "scout_analytics"]
    }
  },
  "suggestedQuestions": [
    "What's driving the NCR revenue growth?",
    "How can we improve weekend sales?"
  ]
}
```

## System Prompts

### Insights System Prompt
```
You are AdsBot, an AI analytics assistant for Scout Analytics, a retail analytics platform.

Your role is to analyze retail transaction data and provide actionable business insights. You specialize in:
- Revenue and performance analysis
- Customer behavior patterns  
- Product substitution trends
- Regional performance comparisons
- Promotional optimization
- Inventory recommendations

IMPORTANT: Always respond with insights in JSON format...
```

### Chat System Prompt
```
You are AdsBot, an AI analytics assistant for Scout Analytics, a retail analytics platform.

You help retail managers understand their data through conversational analysis. Provide:
- Clear, actionable insights
- Specific recommendations
- Data-driven explanations
- Follow-up questions
```

## Testing

### Test Azure OpenAI Connection

```bash
curl -X POST \
  "https://tbwa-openai.openai.azure.com/openai/deployments/gpt-4/chat/completions?api-version=2024-02-15-preview" \
  -H "Content-Type: application/json" \
  -H "api-key: YOUR_API_KEY" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ],
    "max_tokens": 100
  }'
```

### Check Configuration

```javascript
// In browser console
console.log('Azure OpenAI Endpoint:', import.meta.env.VITE_AZURE_OPENAI_ENDPOINT);
console.log('Deployment:', import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT);
console.log('API Version:', import.meta.env.VITE_AZURE_OPENAI_API_VERSION);
console.log('Key configured:', !!import.meta.env.VITE_AZURE_OPENAI_KEY);
```

## Cost Management

### Usage Monitoring
- Monitor token usage in Azure Portal
- Set up budget alerts for OpenAI resource
- Use appropriate max_tokens limits (800 for chat, 1500 for insights)

### Optimization
- **Temperature**: 0.7 for balanced creativity/consistency
- **Top_p**: 0.9 for focused responses
- **Frequency/Presence Penalty**: 0 for natural language

## Security

### API Key Protection
- ⚠️ **Never commit API keys to code**
- Use environment variables only
- Rotate keys regularly
- Use Azure Key Vault for production

### Network Security
- Configure Azure OpenAI with network restrictions if needed
- Use managed identity when possible
- Monitor API access logs

## Troubleshooting

### Common Issues

1. **"Azure OpenAI not configured"**
   - Check environment variables are set correctly
   - Verify API key is valid

2. **"API error: 401"**
   - API key is invalid or expired
   - Check resource name and deployment name

3. **"API error: 429"**
   - Rate limit exceeded
   - Check quotas in Azure Portal

4. **"Failed to parse insights response"**
   - AI response format issue
   - Falls back to mock data automatically

### Debug Mode

```javascript
// Enable debug logging
localStorage.setItem('adsbot-debug', 'true');
```

---

**Ready for Production**: AdsBot now uses real Azure OpenAI for intelligent retail analytics! 🚀