#!/bin/bash

# Make Scout Analytics Dashboard API publicly accessible
# This script removes all authentication and access restrictions

set -e

# Configuration
RESOURCE_GROUP="scout-dashboard-rg"
APP_NAME="scout-analytics-dashboard"

echo "🚀 Making Scout Analytics Dashboard API publicly accessible..."
echo "Resource Group: $RESOURCE_GROUP"
echo "App Name: $APP_NAME"
echo ""

# 1) Turn off Easy Auth entirely
echo "1️⃣ Disabling Easy Auth..."
az webapp auth update \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --enabled false

if [ $? -eq 0 ]; then
    echo "✅ Easy Auth disabled successfully"
else
    echo "❌ Failed to disable Easy Auth"
    exit 1
fi

echo ""

# 2) Allow ALL origins in CORS
echo "2️⃣ Setting CORS to allow all origins..."
az webapp cors add \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --allowed-origins '*'

if [ $? -eq 0 ]; then
    echo "✅ CORS configured to allow all origins"
else
    echo "❌ Failed to configure CORS"
    exit 1
fi

echo ""

# 3) Remove existing access restriction rules and add AllowAll rule
echo "3️⃣ Managing access restriction rules..."

# List existing rules
echo "📋 Listing current access restriction rules..."
EXISTING_RULES=$(az webapp config access-restriction list \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --query "ipSecurityRestrictions[].name" \
  --output tsv)

# Remove existing rules (if any)
if [ ! -z "$EXISTING_RULES" ]; then
    echo "🗑️ Removing existing access restriction rules..."
    for rule in $EXISTING_RULES; do
        echo "   Removing rule: $rule"
        az webapp config access-restriction remove \
          --resource-group $RESOURCE_GROUP \
          --name $APP_NAME \
          --rule-name "$rule"
    done
    echo "✅ Existing rules removed"
else
    echo "ℹ️ No existing access restriction rules found"
fi

# Add AllowAll rule
echo "➕ Adding AllowAll access restriction rule..."
az webapp config access-restriction add \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --rule-name AllowAll \
  --priority 100 \
  --action Allow \
  --ip-address 0.0.0.0/0

if [ $? -eq 0 ]; then
    echo "✅ AllowAll rule added successfully"
else
    echo "❌ Failed to add AllowAll rule"
    exit 1
fi

echo ""

# Optional: Set up API definition (Swagger/OpenAPI)
echo "4️⃣ Setting up API definition (optional)..."
API_URL="https://$APP_NAME.azurewebsites.net/api/swagger.json"

az webapp api-definition set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --specification-url $API_URL

if [ $? -eq 0 ]; then
    echo "✅ API definition configured"
    echo "   Swagger URL: $API_URL"
else
    echo "⚠️ API definition setup failed (this is optional)"
fi

echo ""
echo "🎉 Scout Analytics Dashboard API is now publicly accessible!"
echo ""
echo "📍 Your API endpoints are now available at:"
echo "   Base URL: https://$APP_NAME.azurewebsites.net"
echo "   Scout Analytics: https://$APP_NAME.azurewebsites.net/scout/analytics"
echo "   Transactions: https://$APP_NAME.azurewebsites.net/api/transactions"
echo "   Regional Performance: https://$APP_NAME.azurewebsites.net/api/regional-performance"
echo ""
echo "⚙️ Configuration applied:"
echo "   ✅ Easy Auth: DISABLED"
echo "   ✅ CORS: ALL origins allowed (*)"
echo "   ✅ Access Restrictions: AllowAll rule (0.0.0.0/0)"
echo ""
echo "🔒 To lock down later, run: ./scripts/secure-api.sh"