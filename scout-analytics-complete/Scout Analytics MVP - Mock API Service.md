# Scout Analytics MVP - Mock API Service

## 🎯 Overview

This is a complete **Scout Analytics MVP Mock Service** that provides:

- **Flask API** with SQLite database
- **Azure OpenAI integration** (ScoutBot AI assistant)
- **Real Philippine retail data** from cleaned CSV files
- **Natural language to SQL** capabilities
- **RESTful endpoints** for dashboard integration

## 🚀 Live API Endpoints

**Base URL**: `https://5000-icbji9l1k5o6jqrefi14i-7ba1830f.manusvm.computer`

### Core Analytics Endpoints

- `GET /api/transactions` - Get transaction data with filtering
- `GET /api/volume` - Get transaction volume data for charts
- `GET /api/category-mix` - Get product category distribution
- `GET /api/demographics` - Get customer demographics
- `GET /api/stores` - Get all store locations
- `GET /api/products` - Get product catalog

### AI-Powered Endpoints

- `POST /api/ask` - **ScoutBot AI Assistant** (Azure OpenAI)
  ```json
  {
    "query": "What are the top selling categories in Metro Manila?"
  }
  ```

- `POST /api/sql` - Execute SQL queries against the database
  ```json
  {
    "sql": "SELECT category, COUNT(*) FROM products GROUP BY category"
  }
  ```

- `POST /api/retailbot` - Legacy RetailBot endpoint (compatibility)

## 🔧 Technical Stack

- **Backend**: Flask + SQLAlchemy + SQLite
- **AI**: Azure OpenAI (GPT-4) with custom ScoutBot prompt
- **Data**: 18,000+ Philippine retail transactions
- **Security**: CORS enabled, SQL injection protection

## 📊 Database Schema

```sql
-- Core tables loaded from CSV data
transactions (transaction_id, timestamp, store_id, total_amount, ...)
stores (store_id, name, location, barangay, city, region, ...)
products (product_id, name, category, brand_id, price, cost)
customers (customer_id, age, gender, location, region, ...)
transaction_items (transaction_id, product_id, quantity, ...)
```

## 🤖 ScoutBot AI Features

ScoutBot is an AI-powered retail analyst that can:

1. **Interpret natural language queries** about retail data
2. **Generate SQL queries** for complex analysis
3. **Recommend chart types** (bar, line, pie, table)
4. **Provide Philippine retail insights** (NCR, Cebu, Davao regions)
5. **Understand retail categories** (Beverages, Snacks, Personal Care)

### Example Queries

- "What are the top selling products in NCR?"
- "Show me revenue trends by region"
- "Which payment methods are most popular?"
- "Compare sales between weekdays and weekends"

## 🔗 Frontend Integration

### React Dashboard Integration

Update your React dashboard to use the mock API:

```javascript
// In your React components
const API_BASE = 'https://5000-icbji9l1k5o6jqrefi14i-7ba1830f.manusvm.computer/api';

// Fetch transactions
const response = await fetch(`${API_BASE}/transactions`);
const data = await response.json();

// Ask ScoutBot
const askScoutBot = async (query) => {
  const response = await fetch(`${API_BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  return await response.json();
};
```

### Vite Proxy Configuration

For local development, add to `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': 'https://5000-icbji9l1k5o6jqrefi14i-7ba1830f.manusvm.computer'
    }
  }
});
```

## 🔐 Environment Variables

The API uses these Azure OpenAI credentials:

```env
AZURE_OPENAI_API_KEY=31119320b14e4ff4bccefa768f4adaa8
AZURE_OPENAI_ENDPOINT=https://ces-openai-20250609.openai.azure.com/
AZURE_DEPLOYMENT_NAME=gpt-4
AZURE_API_VERSION=2024-02-15-preview
```

## 📈 Usage Examples

### Get Transaction Volume Data
```bash
curl "https://5000-icbji9l1k5o6jqrefi14i-7ba1830f.manusvm.computer/api/volume"
```

### Ask ScoutBot a Question
```bash
curl -X POST "https://5000-icbji9l1k5o6jqrefi14i-7ba1830f.manusvm.computer/api/ask" \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the top 5 product categories by revenue?"}'
```

### Execute Custom SQL
```bash
curl -X POST "https://5000-icbji9l1k5o6jqrefi14i-7ba1830f.manusvm.computer/api/sql" \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT region, COUNT(*) as store_count FROM stores GROUP BY region"}'
```

## 🎯 Use Cases

This mock service is perfect for:

- **Dashboard prototyping** with real retail data
- **AI assistant testing** with natural language queries
- **Client demonstrations** of Scout Analytics capabilities
- **Local development** without production database dependencies
- **API integration testing** for frontend applications

## 🔄 Data Quality

- **1,000 transactions** loaded successfully
- **5 stores** across Philippine regions
- **25 products** with synthetic pricing
- **10 brands** across categories
- **Partial data loading** with graceful error handling

The service continues to operate even with incomplete CSV data, making it robust for testing and demonstration purposes.

