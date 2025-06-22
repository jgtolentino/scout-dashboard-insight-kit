#!/bin/bash

# Secure Scout Analytics Dashboard API
# This script re-enables authentication and access restrictions

set -e

# Configuration
RESOURCE_GROUP="scout-dashboard-rg"
APP_NAME="scout-analytics-dashboard"
FRONTEND_URL="https://scout-dashboard-insight-kit.vercel.app"  # Update with your actual frontend URL

echo "🔒 Securing Scout Analytics Dashboard API..."
echo "Resource Group: $RESOURCE_GROUP"
echo "App Name: $APP_NAME"
echo ""

# 1) Enable Easy Auth with Azure AD
echo "1️⃣ Enabling Easy Auth with Azure AD..."
az webapp auth update \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --enabled true \
  --action LoginWithAzureActiveDirectory

if [ $? -eq 0 ]; then
    echo "✅ Easy Auth enabled successfully"
else
    echo "❌ Failed to enable Easy Auth"
    exit 1
fi

echo ""

# 2) Remove wildcard CORS and add specific frontend origin
echo "2️⃣ Configuring CORS for specific frontend..."

# Remove wildcard CORS
az webapp cors remove \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --allowed-origins '*'

# Add specific frontend URL
az webapp cors add \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --allowed-origins $FRONTEND_URL

if [ $? -eq 0 ]; then
    echo "✅ CORS configured for frontend: $FRONTEND_URL"
else
    echo "❌ Failed to configure CORS"
    exit 1
fi

echo ""

# 3) Remove AllowAll rule and add restrictive rules
echo "3️⃣ Configuring access restrictions..."

# Remove AllowAll rule
echo "🗑️ Removing AllowAll access rule..."
az webapp config access-restriction remove \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --rule-name AllowAll

# Add rule to allow only from Azure services and your specific IPs
echo "➕ Adding restrictive access rules..."

# Allow Azure services
az webapp config access-restriction add \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --rule-name AllowAzureServices \
  --priority 100 \
  --action Allow \
  --service-tag AzureCloud

# Add your office/home IP (you'll need to update this)
# Get current public IP
CURRENT_IP=$(curl -s https://ipinfo.io/ip)
if [ ! -z "$CURRENT_IP" ]; then
    echo "🏠 Adding current IP: $CURRENT_IP"
    az webapp config access-restriction add \
      --resource-group $RESOURCE_GROUP \
      --name $APP_NAME \
      --rule-name AllowCurrentIP \
      --priority 200 \
      --action Allow \
      --ip-address "$CURRENT_IP/32"
fi

if [ $? -eq 0 ]; then
    echo "✅ Access restrictions configured"
else
    echo "❌ Failed to configure access restrictions"
    exit 1
fi

echo ""
echo "🔒 Scout Analytics Dashboard API is now secured!"
echo ""
echo "⚙️ Security configuration applied:"
echo "   ✅ Easy Auth: ENABLED (Azure AD)"
echo "   ✅ CORS: Restricted to $FRONTEND_URL"
echo "   ✅ Access Restrictions: Azure services + Current IP"
echo ""
echo "📝 Next steps:"
echo "   1. Configure Azure AD app registration"
echo "   2. Update frontend to handle authentication"
echo "   3. Add additional authorized IPs if needed"
echo ""
echo "🔓 To make public again, run: ./scripts/make-api-public.sh"