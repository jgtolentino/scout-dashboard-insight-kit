#!/bin/bash

# Rotate SAS token for Gold layer access
# Run this weekly or when token is compromised

set -e

STORAGE_ACCOUNT="scoutanalyticsdata"
DAYS_VALID=${1:-7}  # Default 7 days, can override with parameter

echo "🔄 Rotating Gold layer SAS token..."
echo "Storage Account: $STORAGE_ACCOUNT"
echo "Validity Period: $DAYS_VALID days"
echo ""

# Calculate new expiry date
EXPIRY_DATE=$(date -u -d "+${DAYS_VALID} days" '+%Y-%m-%dT%H:%M:%SZ')

# Generate new SAS token
NEW_SAS=$(az storage container generate-sas \
  --account-name $STORAGE_ACCOUNT \
  --name gold \
  --permissions r \
  --expiry $EXPIRY_DATE \
  --output tsv)

echo "✅ New SAS token generated"
echo "   Token: $NEW_SAS"
echo "   Expires: $EXPIRY_DATE"
echo ""

# Update environment files
if [ -f ".env.production" ]; then
    sed -i.bak "s/VITE_GOLD_SAS_TOKEN=.*/VITE_GOLD_SAS_TOKEN=$NEW_SAS/" .env.production
    echo "✅ Updated .env.production"
fi

# Create access instructions
cat > GOLD_ACCESS_INSTRUCTIONS.md << EOF
# Gold Layer Access Instructions

## 🔑 Current SAS Token
\`\`\`
Token: $NEW_SAS
Expires: $EXPIRY_DATE
\`\`\`

## 📊 Example Usage

### Azure CLI
\`\`\`bash
az storage blob list \\
  --container-name gold \\
  --account-name $STORAGE_ACCOUNT \\
  --sas-token "$NEW_SAS"
\`\`\`

### Python with Azure Storage
\`\`\`python
from azure.storage.blob import BlobServiceClient

sas_url = "https://$STORAGE_ACCOUNT.blob.core.windows.net/?$NEW_SAS"
blob_service = BlobServiceClient(account_url=sas_url)

# List Gold tables
container_client = blob_service.get_container_client("gold")
for blob in container_client.list_blobs():
    print(blob.name)
\`\`\`

### Spark/Databricks
\`\`\`python
# Configure SAS token
spark.conf.set(
    f"fs.azure.sas.gold.$STORAGE_ACCOUNT.dfs.core.windows.net",
    "$NEW_SAS"
)

# Read Gold data
df = spark.read.format("delta").load(
    "abfss://gold@$STORAGE_ACCOUNT.dfs.core.windows.net/transactions/aggregated/"
)
df.show()
\`\`\`

---
Generated: $(date)
Valid until: $EXPIRY_DATE
EOF

echo "📋 Access instructions saved to GOLD_ACCESS_INSTRUCTIONS.md"
echo ""
echo "🔔 Don't forget to:"
echo "   1. Update API configuration with new token"
echo "   2. Notify authorized consumers"
echo "   3. Update documentation"
echo "   4. Test access before old token expires"