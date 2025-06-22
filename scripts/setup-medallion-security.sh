#!/bin/bash

# Setup Medallion Architecture Security for Scout Analytics
# Bronze → Silver → Gold with proper access controls

set -e

# Configuration
RESOURCE_GROUP="scout-dashboard-rg"
STORAGE_ACCOUNT="scoutanalyticsdata"
SUBSCRIPTION_ID="c03c092c-443c-4f25-9efe-33f092621251"

echo "🏛️ Setting up Medallion Architecture Security..."
echo "Resource Group: $RESOURCE_GROUP"
echo "Storage Account: $STORAGE_ACCOUNT"
echo ""

# 1. Create containers for each medallion layer
echo "1️⃣ Creating medallion layer containers..."

# Bronze layer - Raw data (PRIVATE)
az storage container create \
  --account-name $STORAGE_ACCOUNT \
  --name bronze \
  --public-access off \
  --resource-group $RESOURCE_GROUP

# Silver layer - Cleaned/conformed data (PRIVATE)
az storage container create \
  --account-name $STORAGE_ACCOUNT \
  --name silver \
  --public-access off \
  --resource-group $RESOURCE_GROUP

# Gold layer - Business-ready data (CONTROLLED PUBLIC ACCESS)
az storage container create \
  --account-name $STORAGE_ACCOUNT \
  --name gold \
  --public-access off \
  --resource-group $RESOURCE_GROUP

echo "✅ Medallion containers created"
echo ""

# 2. Set up role-based access control
echo "2️⃣ Configuring role-based access control..."

# Get current user principal ID
CURRENT_USER=$(az ad signed-in-user show --query id --output tsv)

# Grant Storage Blob Data Owner to current user for all layers
az role assignment create \
  --assignee $CURRENT_USER \
  --role "Storage Blob Data Owner" \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Storage/storageAccounts/$STORAGE_ACCOUNT"

echo "✅ RBAC configured for admin access"
echo ""

# 3. Create SAS token for Gold layer only (7-day expiry)
echo "3️⃣ Generating SAS token for Gold layer..."

# Calculate expiry date (7 days from now)
EXPIRY_DATE=$(date -u -d '+7 days' '+%Y-%m-%dT%H:%M:%SZ')

# Generate SAS token for Gold container only
GOLD_SAS=$(az storage container generate-sas \
  --account-name $STORAGE_ACCOUNT \
  --name gold \
  --permissions r \
  --expiry $EXPIRY_DATE \
  --output tsv)

echo "✅ SAS token generated for Gold layer"
echo "   Expiry: $EXPIRY_DATE"
echo ""

# 4. Create Delta Sharing configuration
echo "4️⃣ Creating Delta Sharing configuration..."

mkdir -p delta-sharing

cat > delta-sharing/share-config.json << EOF
{
  "shares": [
    {
      "name": "scout_analytics_public",
      "schemas": [
        {
          "name": "gold_analytics",
          "tables": [
            {
              "name": "transactions_aggregated",
              "location": "abfss://gold@${STORAGE_ACCOUNT}.dfs.core.windows.net/transactions/aggregated/"
            },
            {
              "name": "regional_performance",
              "location": "abfss://gold@${STORAGE_ACCOUNT}.dfs.core.windows.net/regional/performance/"
            },
            {
              "name": "category_insights",
              "location": "abfss://gold@${STORAGE_ACCOUNT}.dfs.core.windows.net/categories/insights/"
            },
            {
              "name": "customer_demographics",
              "location": "abfss://gold@${STORAGE_ACCOUNT}.dfs.core.windows.net/customers/demographics/"
            }
          ]
        }
      ]
    }
  ],
  "version": "1.0"
}
EOF

echo "✅ Delta Sharing configuration created"
echo ""

# 5. Create access policy document
echo "5️⃣ Creating access policy documentation..."

cat > MEDALLION_ACCESS_POLICY.md << EOF
# Scout Analytics Medallion Architecture Access Policy

## 🏛️ Data Layer Security

### 🔴 Bronze Layer (Raw Data) - PRIVATE
- **Access**: ETL processes only
- **Location**: \`abfss://bronze@${STORAGE_ACCOUNT}.dfs.core.windows.net/\`
- **Security**: No public access, service principal authentication only
- **Content**: Raw transaction logs, unprocessed files, system exports

### 🟡 Silver Layer (Cleaned Data) - INTERNAL ONLY
- **Access**: Data engineering team + approved internal consumers
- **Location**: \`abfss://silver@${STORAGE_ACCOUNT}.dfs.core.windows.net/\`
- **Security**: RBAC with Azure AD groups
- **Content**: Cleaned, validated, and conformed data

### 🟢 Gold Layer (Business-Ready) - CONTROLLED PUBLIC
- **Access**: Public via SAS tokens or Delta Sharing
- **Location**: \`abfss://gold@${STORAGE_ACCOUNT}.dfs.core.windows.net/\`
- **Security**: SAS tokens with read-only permissions
- **Content**: Aggregated business metrics, curated datasets

## 📊 Available Gold Tables

### 1. Transactions Aggregated
- **Path**: \`gold/transactions/aggregated/\`
- **Schema**: \`transaction_date, region, category, total_amount, transaction_count\`
- **Update Frequency**: Daily

### 2. Regional Performance
- **Path**: \`gold/regional/performance/\`
- **Schema**: \`region, revenue, growth_rate, market_share, period\`
- **Update Frequency**: Weekly

### 3. Category Insights
- **Path**: \`gold/categories/insights/\`
- **Schema**: \`category, revenue, transaction_volume, top_products\`
- **Update Frequency**: Daily

### 4. Customer Demographics
- **Path**: \`gold/customers/demographics/\`
- **Schema**: \`age_group, region, income_bracket, spending_pattern\`
- **Update Frequency**: Monthly

## 🔑 Access Methods

### Option 1: SAS Token (Temporary Access)
\`\`\`bash
# Current Gold SAS Token (expires: $EXPIRY_DATE)
export GOLD_SAS_TOKEN="$GOLD_SAS"

# Example usage with Azure CLI
az storage blob list \\
  --container-name gold \\
  --account-name $STORAGE_ACCOUNT \\
  --sas-token "\$GOLD_SAS_TOKEN"
\`\`\`

### Option 2: Delta Sharing (Recommended)
\`\`\`python
import delta_sharing

# Connect to shared tables
profile = {
    "shareCredentialsVersion": 1,
    "endpoint": "https://scout-analytics-sharing.azurewebsites.net/",
    "bearerToken": "<provided-token>"
}

# Read Gold data
df = delta_sharing.load_as_pandas(
    "scout_analytics_public.gold_analytics.transactions_aggregated"
)
\`\`\`

### Option 3: Scout Analytics API (Current Implementation)
\`\`\`bash
# Public API endpoints expose Gold layer data
curl "https://scout-analytics-dashboard.azurewebsites.net/scout/analytics"
\`\`\`

## 🛡️ Security Best Practices

1. **Never expose Bronze/Silver layers publicly**
2. **Rotate SAS tokens regularly (current: 7-day expiry)**
3. **Monitor access logs for unusual patterns**
4. **Use Delta Sharing for long-term partnerships**
5. **Document schema changes with versioning**

## 📞 Support

For access requests or questions:
- **Data Team**: data-team@tbwa.com
- **API Issues**: scout-support@tbwa.com
- **Security Concerns**: security@tbwa.com

---
Generated: $(date)
EOF

echo "✅ Access policy documentation created"
echo ""

# 6. Output summary
echo "🎉 Medallion Architecture Security Setup Complete!"
echo ""
echo "📂 Layer Structure:"
echo "   🔴 Bronze: abfss://bronze@${STORAGE_ACCOUNT}.dfs.core.windows.net/ (PRIVATE)"
echo "   🟡 Silver: abfss://silver@${STORAGE_ACCOUNT}.dfs.core.windows.net/ (INTERNAL)"
echo "   🟢 Gold: abfss://gold@${STORAGE_ACCOUNT}.dfs.core.windows.net/ (CONTROLLED PUBLIC)"
echo ""
echo "🔑 Gold Layer Access:"
echo "   SAS Token: $GOLD_SAS"
echo "   Expires: $EXPIRY_DATE"
echo ""
echo "📋 Next Steps:"
echo "   1. Review MEDALLION_ACCESS_POLICY.md"
echo "   2. Configure Delta Sharing server (optional)"
echo "   3. Update ETL pipelines to use proper layers"
echo "   4. Test Gold layer access with SAS token"
echo ""
echo "🔄 To regenerate SAS token, run: ./scripts/rotate-gold-sas.sh"