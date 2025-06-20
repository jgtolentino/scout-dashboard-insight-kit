# AdsBot - TBWA Project Scout Dashboard

AI-powered marketing intelligence dashboard that analyzes campaign performance, creative effectiveness, and forecast accuracy for TBWA Project Scout.

## 🎯 Features

### 📊 Performance Overview
- Campaign KPI dashboard with real-time metrics
- Timeline visualization of campaign performance
- Status distribution and trend analysis

### 🔮 Forecast vs Actual
- Business prediction accuracy tracking
- Variance analysis and confidence bands
- Predictive modeling insights

### 🎨 Creative Performance  
- Creative asset ranking and performance scoring
- Engagement heatmaps by creative type
- Visual gallery with performance filters

### 📈 Data Quality Monitoring
- Metadata quality scoring
- Data completeness tracking
- Validation error reporting

### 🤖 ScoutBot AI Assistant
- Natural language querying of campaign data
- Intelligent insights and recommendations
- Anomaly detection and trend analysis

## 🏗️ Architecture

### Data Sources
- **Azure SQL Database**: `SQL-TBWA-ProjectScout-Reporting-Prod`
- **Schema**: `ces`
- **Tables**:
  - `tbwa_campaigns` - Campaign master data
  - `tbwa_creative_analysis` - Creative performance metrics
  - `tbwa_business_predictions` - Forecast and prediction data
  - `tbwa_campaign_documents` - Campaign assets and documents
  - `tbwa_data_metadata` - Data quality and metadata

### Technology Stack
- **Frontend**: Next.js 14 + React + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js + Recharts
- **AI**: OpenAI GPT-4 for ScoutBot
- **Database**: Azure SQL Database
- **Deployment**: Vercel
- **Authentication**: Azure AD

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Azure CLI
- Vercel CLI
- Access to TBWA Azure subscription

### 1. Clone and Setup
```bash
git clone <repository-url>
cd adsbot-deployment
chmod +x deploy-adsbot.sh
./deploy-adsbot.sh
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Fill in your Azure SQL and OpenAI credentials
```

### 3. Development
```bash
cd adsbot-dashboard
npm run dev
# Visit http://localhost:3000
```

### 4. Deploy to Production
```bash
./deploy-adsbot.sh deploy
```

## 📋 Database Schema Analysis

Based on the TBWA Project Scout database, here's what AdsBot analyzes:

### Campaign Metrics
- Total campaigns and active status
- Campaign duration and timeline analysis
- Performance by campaign type
- ROI and engagement tracking

### Creative Performance
- Creative asset effectiveness scoring
- Engagement rates by creative type
- CTR and conversion analysis
- Visual performance correlation

### Business Predictions
- Forecast accuracy measurement
- Predicted vs actual performance
- Confidence score tracking
- Trend analysis and projections

### Data Quality
- Metadata completeness scoring
- Validation status monitoring
- Data freshness indicators
- Quality trend reporting

## 🤖 ScoutBot Capabilities

ScoutBot can answer questions like:
- "Which campaign had the highest ROI last quarter?"
- "Show me underperforming creatives in the NCR region"
- "What's the forecast accuracy for Q4 2024 campaigns?"
- "Compare creative engagement across different campaign types"
- "Identify campaigns that exceeded their predicted performance"

### Sample Queries
```
GET /api/scoutbot/query
{
  "query": "Show me top 5 campaigns by ROI",
  "context": "campaigns"
}
```

## 📊 Dashboard Pages

### 1. Overview (`/`)
- KPI grid with key metrics
- Campaign performance timeline
- Status distribution charts

### 2. Forecast Analysis (`/forecast`)
- Prediction accuracy charts
- Variance analysis tables
- Confidence band visualization

### 3. Creative Performance (`/creatives`)
- Performance ranking tables
- Creative type heatmaps
- Asset gallery with filters

### 4. Data Quality (`/quality`)
- Quality score dashboard
- Metadata status tracking
- Validation error logs

### 5. AI Assistant (`/ai`)
- ScoutBot chat interface
- Query builder tools
- Insights feed

## 🔧 Configuration

### Environment Variables
```bash
# Azure SQL Database
AZURE_SQL_SERVER=sql-tbwa-projectscout-prod.database.windows.net
AZURE_SQL_DATABASE=SQL-TBWA-ProjectScout-Reporting-Prod
AZURE_SQL_USERNAME=your_username
AZURE_SQL_PASSWORD=your_password

# OpenAI API for ScoutBot
OPENAI_API_KEY=your_openai_key

# Next.js
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app/api
```

### Vercel Deployment
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "regions": ["sin1"]
}
```

## 📈 Monitoring & Analytics

- **Performance**: Vercel Analytics integration
- **Error Tracking**: Custom telemetry
- **Usage Metrics**: Query execution tracking
- **User Analytics**: Dashboard interaction monitoring

## 🔒 Security

- **Authentication**: Azure AD integration
- **Authorization**: Role-based access control
- **Data Security**: Row-level security for sensitive data
- **API Security**: Rate limiting and input validation

## 🛠️ Development

### Project Structure
```
adsbot-dashboard/
├── src/
│   ├── app/           # Next.js app router
│   ├── components/    # React components
│   ├── services/      # API services
│   ├── hooks/         # Custom React hooks
│   └── utils/         # Utility functions
├── public/            # Static assets
├── agents/            # ScoutBot configuration
└── styles/            # Global styles
```

### Custom Components
- `KpiCard` - Metric display cards
- `ForecastChart` - Prediction visualization
- `CreativeGallery` - Asset performance display
- `ScoutBot` - AI assistant interface
- `DataQualityDashboard` - Quality metrics

## 📝 API Documentation

### Campaign Endpoints
```
GET /api/campaigns           # List all campaigns
GET /api/campaigns/{id}      # Get campaign details
GET /api/metrics/campaigns   # Campaign metrics
```

### Creative Endpoints
```
GET /api/creatives          # List creative assets
GET /api/metrics/creatives  # Creative performance
```

### Prediction Endpoints
```
GET /api/predictions        # Business predictions
GET /api/metrics/forecast   # Forecast accuracy
```

### ScoutBot Endpoints
```
POST /api/scoutbot/query    # Natural language query
GET /api/scoutbot/insights  # Generated insights
```

## 🚨 Troubleshooting

### Database Connection Issues
1. Verify Azure SQL credentials
2. Check firewall rules
3. Validate connection string format

### ScoutBot Not Responding
1. Check OpenAI API key
2. Verify model permissions
3. Review query format

### Deployment Failures
1. Check Vercel environment variables
2. Verify build logs
3. Test locally first

## 📞 Support

For issues related to:
- **Database Access**: Contact Azure admin
- **Deployment**: Check Vercel dashboard
- **ScoutBot**: Review OpenAI API status
- **General**: Create GitHub issue

## 📄 License

TBWA Internal Use Only - Proprietary Software