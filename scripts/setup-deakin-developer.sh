#!/bin/bash
# Setup script for Deakin developer/owner
# Maintains your full access while creating limited service principals

set -e

DEVELOPER_EMAIL="s224670304@deakin.edu.au"
RESOURCE_GROUP="scout-analytics-rg"
APP_NAME="scout-analytics"

echo "🎓 Scout Analytics Setup for Deakin Developer"
echo "Developer Email: $DEVELOPER_EMAIL"
echo ""

# Check if logged in
echo "1️⃣ Checking Azure login..."
if ! az account show >/dev/null 2>&1; then
    echo "Please login with your Deakin account:"
    az login --username $DEVELOPER_EMAIL
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "✅ Logged in to subscription: $SUBSCRIPTION_ID"

# Create resource group if needed
echo ""
echo "2️⃣ Setting up resource group..."
if ! az group show --name $RESOURCE_GROUP >/dev/null 2>&1; then
    echo "Creating resource group..."
    az group create --name $RESOURCE_GROUP --location "australiaeast"
else
    echo "✅ Resource group exists"
fi

# Create service principal for app (NOT owner)
echo ""
echo "3️⃣ Creating LIMITED service principal for app automation..."
SP_OUTPUT=$(az ad sp create-for-rbac \
    --name "${APP_NAME}-sp" \
    --role "Contributor" \
    --scopes "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP" \
    --output json)

# Save credentials
echo "$SP_OUTPUT" > service-principal-creds.json
echo "✅ Service principal created (saved to service-principal-creds.json)"

# Extract values
CLIENT_ID=$(echo $SP_OUTPUT | jq -r .appId)
CLIENT_SECRET=$(echo $SP_OUTPUT | jq -r .password)
TENANT_ID=$(echo $SP_OUTPUT | jq -r .tenant)

# Create .env.production file
echo ""
echo "4️⃣ Creating production environment file..."
cat > .env.production << EOF
# Production configuration for Scout Analytics
# Developer/Owner: $DEVELOPER_EMAIL

# Azure Service Principal (LIMITED permissions - Contributor only)
AZURE_CLIENT_ID=$CLIENT_ID
AZURE_CLIENT_SECRET=$CLIENT_SECRET
AZURE_TENANT_ID=$TENANT_ID
AZURE_SUBSCRIPTION_ID=$SUBSCRIPTION_ID

# Resource Configuration
AZURE_RESOURCE_GROUP=$RESOURCE_GROUP
AZURE_STORAGE_ACCOUNT=${APP_NAME}storage
AZURE_SQL_SERVER=${APP_NAME}server

# Your email still has FULL Owner access
# This service principal has LIMITED Contributor access only
EOF

echo "✅ Created .env.production"

# Show permission summary
echo ""
echo "📋 Permission Summary:"
echo "┌─────────────────────────────────────────────────────┐"
echo "│ Your Deakin Email ($DEVELOPER_EMAIL)               │"
echo "│ ✅ Full Owner Access - No changes                   │"
echo "├─────────────────────────────────────────────────────┤"
echo "│ Service Principal (${APP_NAME}-sp)                 │"
echo "│ ✅ Deploy and manage apps                          │"
echo "│ ✅ Read/write storage and databases                │"
echo "│ ❌ Cannot access billing                           │"
echo "│ ❌ Cannot delete resource groups                   │"
echo "│ ❌ Cannot manage other users                       │"
echo "└─────────────────────────────────────────────────────┘"

echo ""
echo "🚀 Setup complete! Next steps:"
echo "1. Review service-principal-creds.json (keep secure!)"
echo "2. Review .env.production"
echo "3. Deploy with: npm run deploy:production"
echo ""
echo "⚠️  Remember: Your Deakin email retains full Owner access"