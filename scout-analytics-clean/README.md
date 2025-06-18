# Scout Analytics Platform

> AI-Powered Philippine FMCG Intelligence Platform with Power BI-Style Interactivity

Scout Analytics is a modern, interactive business intelligence platform specifically designed for the Philippine Fast-Moving Consumer Goods (FMCG) market. Built with React, TypeScript, and Tailwind CSS, it provides Power BI-like filtering capabilities, AI-powered insights, and comprehensive regional analytics.

![Scout Analytics Dashboard](./docs/images/dashboard-preview.png)

## 🚀 Features

### 📊 **Power BI-Style Analytics**
- **Cross-Filtering**: Click any chart element to filter all visualizations
- **Drill-Down Navigation**: Double-click to explore detailed views
- **Breadcrumb Navigation**: Visual path through drill-down hierarchy
- **URL Persistence**: Shareable filter states and analysis paths
- **Multi-Select Filtering**: Build complex filters across multiple dimensions

### 🇵🇭 **Philippine Market Focus**
- **Regional Analytics**: 17 accurate Philippine administrative regions
- **Interactive Maps**: Multiple view modes (regions, heatmap, clusters)
- **Local Insights**: Population demographics and major cities data
- **FMCG Optimization**: Retail store density and transaction clustering

### 🤖 **AI-Powered Intelligence**
- **LearnBot**: Contextual help system with chat interface
- **RetailBot**: AI data validation with confidence scores
- **Smart Insights**: Automated anomaly detection and recommendations
- **Real-time Analysis**: Live performance monitoring and alerts

### 🎨 **Modern UI/UX**
- **Cruip-Inspired Design**: Clean, professional aesthetic
- **Responsive Layout**: Mobile-first design for all devices
- **TBWA Branding**: Custom color scheme and brand integration
- **Dark/Light Themes**: Adaptive interface preferences

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS v4, Headless UI |
| **Charts** | Recharts, Custom SVG Maps |
| **State** | Zustand, URL Sync |
| **Icons** | Lucide React |
| **Routing** | React Router v7 |

## 📦 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/tbwa-philippines/scout-analytics-platform.git
cd scout-analytics-platform

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview

# Deploy dist/ folder to your hosting platform
```

## 🎯 Dashboard Routes

| Route | Description | Features |
|-------|-------------|----------|
| `/` | Modern Dashboard | Clean Cruip-style interface with AI insights |
| `/powerbi` | **Power BI Dashboard** | Interactive cross-filtering and drill-downs |
| `/legacy/*` | Legacy Interface | Traditional sidebar navigation |

## 🔧 Key Components

### **PowerBIDashboard**
Complete interactive dashboard with cross-filtering capabilities:

```typescript
import PowerBIDashboard from './components/dashboard/PowerBIDashboard';

// Features:
// - Real-time KPI cards
// - Interactive chart grid
// - Cross-filtering between all visualizations
// - Philippine regional map integration
```

### **CrossFilterVisualization** 
Power BI-style chart component with click-to-filter functionality:

```typescript
<CrossFilterVisualization
  data={salesData}
  dimension="region"
  metric="revenue"
  chartType="bar"
  title="Revenue by Region"
  onDrilldown={(dimension, value) => handleDrilldown(dimension, value)}
/>
```

### **EnhancedPhilippineMap**
Interactive map with multiple visualization modes:

```typescript
<EnhancedPhilippineMap
  data={regionalData}
  viewMode="regions" // 'regions' | 'heatmap' | 'clusters'
  onRegionClick={(region) => addRegionFilter(region)}
/>
```

### **AI Components**
Integrated AI-powered assistance:

```typescript
import { LearnBotTooltip, InsightCard } from './components/ai';

// LearnBot provides contextual help
<LearnBotTooltip context="dashboard" position="bottom" />

// InsightCard validates data with AI
<InsightCard 
  enableRetailBotValidation={true}
  threshold={{ warning: 1000000, critical: 500000 }}
/>
```

## 🎨 Customization

### **Branding**
Update brand colors in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'tbwa-navy': '#1e3a8a',
        'tbwa-yellow': '#fbbf24',
        // Add your brand colors
      }
    }
  }
}
```

### **Adding New Charts**
Create custom visualizations using the CrossFilterVisualization template:

```typescript
// 1. Add your data source
const myData = useMyDataSource();

// 2. Use the component
<CrossFilterVisualization
  data={myData}
  dimension="yourDimension"
  metric="yourMetric"
  chartType="bar" // 'bar' | 'line' | 'doughnut'
  title="Your Chart Title"
/>
```

### **Philippine Regions**
Regional data is defined in `components/maps/EnhancedPhilippineMap.tsx`. Update region boundaries or add new administrative levels as needed.

## 🧪 Testing

```bash
# Run type checking
npm run typecheck

# Run linting
npm run lint

# Run tests (when implemented)
npm run test
```

## 📱 Mobile Support

Scout Analytics is fully responsive with:
- **Mobile-first design**: Optimized for small screens
- **Touch interactions**: Tap to filter, swipe navigation  
- **Responsive charts**: Charts adapt to screen size
- **Collapsible filters**: Mobile-friendly filter interface

## 🌐 Deployment

### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Netlify**
```bash
# Build and deploy
npm run build
# Upload dist/ folder to Netlify
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🏢 About TBWA Philippines

Scout Analytics is developed by [TBWA Philippines](https://tbwa.com.ph), a leading advertising agency specializing in data-driven marketing solutions for the Philippine market.

---

**Built with ❤️ for the Philippine FMCG Industry**