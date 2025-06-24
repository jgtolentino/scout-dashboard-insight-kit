#!/bin/bash

# Scout Analytics Dashboard v3.0 - TBWA Team Role Assignment
# Standalone script for adding TBWA team members to existing app registration

set -e

echo "👥 Adding TBWA Team Members to App Registration"
echo "=============================================="

# Configuration
APP_NAME="adsbot-tbwa-app"
SUBSCRIPTION_NAME="TBWA-ProjectScout-Prod"

# Check if already logged in
if ! az account show &> /dev/null; then
    echo "❌ Not logged in to Azure CLI"
    echo "🔧 Please run: az login"
    exit 1
fi

# Verify subscription
CURRENT_SUB=$(az account show --query name -o tsv)
if [ "$CURRENT_SUB" != "$SUBSCRIPTION_NAME" ]; then
    echo "⚠️  Current subscription: $CURRENT_SUB"
    echo "🎯 Expected subscription: $SUBSCRIPTION_NAME"
    
    read -p "🔄 Switch to correct subscription? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        az account set --subscription "$SUBSCRIPTION_NAME"
        echo "✅ Switched to subscription: $SUBSCRIPTION_NAME"
    else
        echo "❌ Please switch to correct subscription first"
        exit 1
    fi
fi

# Get subscription info
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "📋 Working with subscription: $SUBSCRIPTION_NAME ($SUBSCRIPTION_ID)"

# Find app registration
echo "🔍 Finding app registration: $APP_NAME"
APP_ID=$(az ad app list --display-name "$APP_NAME" --query "[0].appId" -o tsv 2>/dev/null)

if [ "$APP_ID" = "" ] || [ "$APP_ID" = "null" ]; then
    echo "❌ App registration '$APP_NAME' not found"
    echo "🔧 Please create the app registration first:"
    echo "   npm run setup:app-registration"
    exit 1
fi

echo "✅ Found app registration: $APP_NAME (ID: $APP_ID)"

# TBWA Team Member Assignments
echo ""
echo "👥 Adding TBWA team members..."

# Eugene Valencia - Owner
echo "🔑 Adding Eugene Valencia as Owner..."
EUGENE_USER_ID=$(az ad user show --id "eugene.valencia@tbwa-smp.com" --query id -o tsv 2>/dev/null || echo "")
if [ "$EUGENE_USER_ID" != "" ] && [ "$EUGENE_USER_ID" != "null" ]; then
    az ad app owner add --id "$APP_ID" --owner-object-id "$EUGENE_USER_ID" 2>/dev/null || echo "ℹ️  Eugene may already be an owner"
    echo "✅ Eugene Valencia (eugene.valencia@tbwa-smp.com) - Owner access"
else
    echo "⚠️  Eugene Valencia not found in directory"
    echo "   Manual addition required in Azure Portal"
fi

echo ""

# Paolo and Khalil - App Users with specific roles
TEAM_MEMBERS=("paolo.broma@tbwa-smp.com" "khalil.veracruz@tbwa-smp.com")

for EMAIL in "${TEAM_MEMBERS[@]}"; do
    echo "👤 Processing: $EMAIL"
    
    USER_ID=$(az ad user show --id "$EMAIL" --query id -o tsv 2>/dev/null || echo "")
    if [ "$USER_ID" != "" ] && [ "$USER_ID" != "null" ]; then
        echo "   Found user ID: $USER_ID"
        
        # Reader role at subscription level
        echo "   🔍 Assigning Reader role..."
        if az role assignment create \
            --assignee "$USER_ID" \
            --role "Reader" \
            --scope "/subscriptions/$SUBSCRIPTION_ID" \
            --description "TBWA Scout Analytics - Read access for $EMAIL" &>/dev/null; then
            echo "   ✅ Reader role assigned"
        else
            echo "   ℹ️  Reader role may already be assigned"
        fi
        
        # Cognitive Services User for OpenAI access
        echo "   🤖 Assigning Cognitive Services User role..."
        if az role assignment create \
            --assignee "$USER_ID" \
            --role "Cognitive Services User" \
            --scope "/subscriptions/$SUBSCRIPTION_ID" \
            --description "TBWA Scout Analytics - OpenAI access for $EMAIL" &>/dev/null; then
            echo "   ✅ Cognitive Services User role assigned"
        else
            echo "   ℹ️  Cognitive Services User role may already be assigned"
        fi
        
        echo "   ✅ $EMAIL - Reader + Cognitive Services access"
    else
        echo "   ⚠️  $EMAIL not found in directory"
        echo "   Manual addition required in Azure Portal"
    fi
    echo ""
done

# Summary
echo "🎉 TBWA Team Role Assignment Complete!"
echo "====================================="
echo ""
echo "📋 Final Access Summary:"
echo "┌─────────────────────────────────────┬─────────────────────────────┐"
echo "│ User                                │ Access Level                │"
echo "├─────────────────────────────────────┼─────────────────────────────┤"
echo "│ eugene.valencia@tbwa-smp.com        │ 🔑 Owner (Full Access)      │"
echo "│ paolo.broma@tbwa-smp.com            │ 👤 Reader + OpenAI          │"
echo "│ khalil.veracruz@tbwa-smp.com        │ 👤 Reader + OpenAI          │"
echo "└─────────────────────────────────────┴─────────────────────────────┘"
echo ""
echo "🔗 To verify assignments:"
echo "   Azure Portal → Subscriptions → Access control (IAM) → Role assignments"
echo "   Azure Portal → Azure Active Directory → App registrations → $APP_NAME → Owners"
echo ""
echo "🚀 Next steps:"
echo "   - Test Scout Analytics Dashboard access with team members"
echo "   - Verify OpenAI ScoutBot functionality works for all users"
echo "   - Run: npm run dev:full"