# 🏛️ Scout Analytics Medallion Architecture

## Overview

The Scout Analytics platform implements a **Medallion Architecture** (Bronze → Silver → Gold) following data lakehouse best practices. This ensures proper data governance, security boundaries, and scalable analytics workflows.

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   🔴 BRONZE   │───▶│   🟡 SILVER   │───▶│   🟢 GOLD     │
│   Raw Data   │    │ Cleaned Data │    │Business Data│
│   PRIVATE    │    │  INTERNAL    │    │   PUBLIC    │
└─────────────┘    └─────────────┘    └─────────────┘
      ▲                    ▲                    ▲
      │                    │                    │
 ETL Processes      Data Engineering      API Consumers
    Only              Team Only           Delta Sharing
```

## 🔐 Security Model

### 🔴 Bronze Layer - PRIVATE ACCESS
- **Purpose**: Raw data ingestion from TBWA Project Scout
- **Access**: ETL processes only (service principals)
- **Location**: `abfss://bronze@scoutanalyticsdata.dfs.core.windows.net/`
- **Security**: No public access, authenticated connections only
- **Content**: 
  - Raw transaction logs
  - Unprocessed data exports
  - System dumps and backups

### 🟡 Silver Layer - INTERNAL ACCESS  
- **Purpose**: Cleaned, validated, and conformed data
- **Access**: Data engineering team + approved internal consumers
- **Location**: `abfss://silver@scoutanalyticsdata.dfs.core.windows.net/`
- **Security**: RBAC with Azure AD groups
- **Content**:
  - Data quality validated records
  - Standardized schemas
  - Historical snapshots

### 🟢 Gold Layer - CONTROLLED PUBLIC ACCESS
- **Purpose**: Business-ready, curated datasets
- **Access**: Public via SAS tokens or Delta Sharing
- **Location**: `abfss://gold@scoutanalyticsdata.dfs.core.windows.net/`
- **Security**: SAS tokens with read-only permissions
- **Content**:
  - Aggregated business metrics
  - API-ready datasets
  - Curated analytical views

## 📊 Gold Layer Data Assets

### 1. Transactions Summary
```sql
-- Schema: gold/transactions/summary/
SELECT 
    transaction_date,
    region,
    category,
    total_amount,
    transaction_count,
    avg_order_value,
    unique_customers
FROM transactions_summary
```

### 2. Regional KPIs
```sql
-- Schema: gold/regional/kpis/
SELECT 
    region,
    period,
    revenue,
    growth_rate,
    market_share,
    customer_acquisition
FROM regional_kpis
```

### 3. Product Insights
```sql
-- Schema: gold/products/insights/
SELECT 
    product_id,
    product_name,
    category,
    revenue,
    units_sold,
    substitution_score
FROM product_insights
```

### 4. Customer Segments
```sql
-- Schema: gold/customers/segments/
SELECT 
    segment_id,
    age_group,
    income_bracket,
    region,
    avg_spend,
    preferred_categories
FROM customer_segments
```

### 5. Market Trends
```sql
-- Schema: gold/trends/market/
SELECT 
    trend_date,
    category,
    trend_type,
    trend_value,
    confidence_score,
    forecast_period
FROM market_trends
```

## 🚀 Quick Start

### 1. Setup Medallion Security
```bash
# Configure layer access controls and SAS tokens
./scripts/setup-medallion-security.sh
```

### 2. Run ETL Pipeline
```bash
# Set environment variables
export SCOUT_DB_USERNAME="your-username"
export SCOUT_DB_PASSWORD="your-password"

# Execute medallion ETL
python pipelines/medallion-etl-pipeline.py
```

### 3. Setup Delta Sharing (Optional)
```bash
# Configure Delta Sharing server
python delta-sharing/setup-sharing-server.py

# Start sharing server
./delta-sharing/start-server.sh
```

### 4. Test Gold Layer Access
```bash
# Using SAS token
az storage blob list \
  --container-name gold \
  --account-name scoutanalyticsdata \
  --sas-token "your-sas-token"

# Using Delta Sharing
python delta-sharing/client-example.py
```

## 🔄 Data Pipeline Flow

### Bronze Ingestion (Daily)
```python
# Raw data from TBWA Project Scout
source → bronze/transactions/raw/
```

### Silver Transformation (Daily)
```python
# Data cleaning and validation
bronze/transactions/raw/ → silver/transactions/cleaned/
```

### Gold Curation (Daily)
```python
# Business aggregations
silver/transactions/cleaned/ → gold/{transactions,regional,products,customers,trends}/
```

## 🔑 Access Methods

### Method 1: SAS Token (Temporary)
```bash
# 7-day expiring token for Gold layer
export GOLD_SAS="sv=2022-11-02&ss=b&srt=c&sp=r&se=2024-..."

# Example usage
curl "https://scoutanalyticsdata.blob.core.windows.net/gold/transactions/summary/?${GOLD_SAS}"
```

### Method 2: Delta Sharing (Recommended)
```python
import delta_sharing

profile = {
    "shareCredentialsVersion": 1,
    "endpoint": "https://scout-sharing.azurewebsites.net/",
    "bearerToken": "scout-analytics-public-token-2024"
}

# Read Gold data
df = delta_sharing.load_as_pandas(
    profile,
    "scout_analytics_public.gold_layer.transactions_summary"
)
```

### Method 3: Scout Analytics API (Current)
```bash
# Public API exposing Gold layer
curl "https://scout-analytics-dashboard.azurewebsites.net/scout/analytics"
```

## 🛠️ Management Scripts

### Security Management
```bash
# Setup initial security
./scripts/setup-medallion-security.sh

# Rotate SAS tokens (weekly)
./scripts/rotate-gold-sas.sh

# Lock down API (when needed)
./scripts/secure-api.sh
```

### Pipeline Management
```bash
# Full ETL pipeline
python pipelines/medallion-etl-pipeline.py

# Delta Sharing setup
python delta-sharing/setup-sharing-server.py
```

## 📈 Monitoring & Governance

### Data Quality Checks
- **Bronze**: Ingestion completeness, schema validation
- **Silver**: Data quality scores, referential integrity  
- **Gold**: Business rule validation, freshness checks

### Access Auditing
- **Azure Monitor**: Storage access logs
- **Delta Lake**: Transaction logs and lineage
- **API Gateway**: Request/response monitoring

### Compliance
- **SOC2**: Encryption at rest and in transit
- **GDPR**: Data retention policies (2-7 years)
- **Audit Trail**: Complete data lineage tracking

## 🔧 Configuration Files

### Environment Variables
```bash
# Database connectivity
SCOUT_DB_USERNAME=your-username
SCOUT_DB_PASSWORD=your-password
SCOUT_JDBC_URL=jdbc:sqlserver://tbwa-scout.database.windows.net:1433;database=ProjectScout

# Storage access
AZURE_STORAGE_ACCOUNT=scoutanalyticsdata
GOLD_SAS_TOKEN=sv=2022-11-02&ss=b&srt=c&sp=r&se=...

# Delta Sharing
DELTA_SHARING_ENDPOINT=https://scout-sharing.azurewebsites.net
DELTA_SHARING_TOKEN=scout-analytics-public-token-2024
```

### Spark Configuration
```python
spark.conf.set("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
spark.conf.set("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog")
spark.conf.set("fs.azure.sas.gold.scoutanalyticsdata.dfs.core.windows.net", sas_token)
```

## 🎯 Best Practices

### Data Layer Principles
1. **Bronze**: Never expose publicly - ETL only
2. **Silver**: Internal consumers with proper RBAC
3. **Gold**: Public exposure via controlled access methods

### Security Guidelines
1. **Rotate SAS tokens weekly** (currently 7-day expiry)
2. **Use Delta Sharing for long-term partnerships**
3. **Monitor access patterns** for anomalies
4. **Document schema changes** with versioning

### Performance Optimization
1. **Partition Gold tables** by date and region
2. **Use Delta Lake optimizations** (OPTIMIZE, VACUUM)
3. **Implement incremental processing** for large datasets
4. **Cache frequently accessed Gold tables**

## 📞 Support & Contacts

- **Data Engineering**: data-team@tbwa.com
- **API Support**: scout-support@tbwa.com  
- **Security Issues**: security@tbwa.com
- **Delta Sharing**: sharing-admin@tbwa.com

---

**Last Updated**: December 2024  
**Architecture Version**: 1.0  
**Compliance Level**: SOC2 Ready