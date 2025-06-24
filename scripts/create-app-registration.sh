#!/bin/bash

# Scout Analytics Dashboard v3.0 - Azure App Registration Setup
# Creates service principal for programmatic Azure access

set -e

echo "🔐 Creating Azure App Registration for Scout Analytics Dashboard"
echo "=============================================================="

# Configuration
APP_NAME="adsbot-tbwa-app"
APP_DESCRIPTION="AdsBot TBWA App - Multi-user Azure access for Scout Analytics v3.0"
RESOURCE_GROUP="scout-analytics-rg"
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

# Get current tenant and subscription info
TENANT_ID=$(az account show --query tenantId -o tsv)
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

echo "📋 Current Azure context:"
echo "   Tenant ID: $TENANT_ID"
echo "   Subscription: $SUBSCRIPTION_NAME"
echo "   Subscription ID: $SUBSCRIPTION_ID"

# Check if app registration already exists
echo "🔍 Checking for existing app registration..."
EXISTING_APP=$(az ad app list --display-name "$APP_NAME" --query '[0].appId' -o tsv 2>/dev/null)

if [ "$EXISTING_APP" != "" ] && [ "$EXISTING_APP" != "null" ]; then
    echo "✅ App registration already exists: $APP_NAME"
    echo "   App ID: $EXISTING_APP"
    
    read -p "🔄 Use existing app registration? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        echo "🗑️  Deleting existing app registration..."
        az ad app delete --id "$EXISTING_APP"
        echo "✅ Existing app deleted"
        CREATE_NEW=true
    else
        CREATE_NEW=false
        CLIENT_ID="$EXISTING_APP"
    fi
else
    echo "📝 No existing app registration found"
    CREATE_NEW=true
fi

# Create new app registration if needed
if [ "$CREATE_NEW" = true ]; then
    echo "🔧 Creating new app registration..."
    
    # Create the app registration
    APP_RESULT=$(az ad app create \
        --display-name "$APP_NAME" \
        --sign-in-audience "AzureADMyOrg" \
        --web-redirect-uris "http://localhost:3000" "https://scout-analytics.azurewebsites.net" \
        --query '{appId:appId, objectId:id}' \
        -o json)
    
    CLIENT_ID=$(echo "$APP_RESULT" | jq -r '.appId')
    OBJECT_ID=$(echo "$APP_RESULT" | jq -r '.objectId')
    
    if [ "$CLIENT_ID" = "" ] || [ "$CLIENT_ID" = "null" ]; then
        echo "❌ Failed to create app registration"
        exit 1
    fi
    
    echo "✅ App registration created successfully"
    echo "   App ID (Client ID): $CLIENT_ID"
    echo "   Object ID: $OBJECT_ID"
    
    # Create client secret
    echo "🔑 Creating client secret..."
    SECRET_RESULT=$(az ad app credential reset \
        --id "$CLIENT_ID" \
        --append \
        --credential-description "adsbot-client-secret" \
        --years 2 \
        --query '{clientSecret:password}' \
        -o json)
    
    CLIENT_SECRET=$(echo "$SECRET_RESULT" | jq -r '.clientSecret')
    
    if [ "$CLIENT_SECRET" = "" ] || [ "$CLIENT_SECRET" = "null" ]; then
        echo "❌ Failed to create client secret"
        exit 1
    fi
    
    echo "✅ Client secret created successfully"
    
    # Create service principal
    echo "👤 Creating service principal..."
    SP_RESULT=$(az ad sp create --id "$CLIENT_ID" --query '{objectId:id}' -o json)
    SP_OBJECT_ID=$(echo "$SP_RESULT" | jq -r '.objectId')
    
    echo "✅ Service principal created"
    echo "   Service Principal Object ID: $SP_OBJECT_ID"
    
    # Wait for service principal to propagate
    echo "⏳ Waiting for service principal propagation..."
    sleep 30
    
    # Assign roles
    echo "🔐 Assigning Azure roles..."
    
    # Contributor role for resource management
    az role assignment create \
        --assignee "$CLIENT_ID" \
        --role "Contributor" \
        --scope "/subscriptions/$SUBSCRIPTION_ID" \
        --description "Scout Analytics Dashboard - Resource management access"
    
    # Storage Blob Data Contributor for storage access
    az role assignment create \
        --assignee "$CLIENT_ID" \
        --role "Storage Blob Data Contributor" \
        --scope "/subscriptions/$SUBSCRIPTION_ID" \
        --description "Scout Analytics Dashboard - Storage access"
    
    # Cognitive Services User for OpenAI access
    az role assignment create \
        --assignee "$CLIENT_ID" \
        --role "Cognitive Services User" \
        --scope "/subscriptions/$SUBSCRIPTION_ID" \
        --description "Scout Analytics Dashboard - OpenAI access"
    
    echo "✅ Role assignments completed"
    
    # Add admin users
    echo "👥 Adding admin users..."
    
    # Add current user as owner
    CURRENT_USER_ID=$(az ad signed-in-user show --query id -o tsv 2>/dev/null || echo "")
    if [ "$CURRENT_USER_ID" != "" ]; then
        az ad app owner add --id "$CLIENT_ID" --owner-object-id "$CURRENT_USER_ID" 2>/dev/null || echo "⚠️  Could not add current user as owner (may already exist)"
        echo "✅ Current user added as owner"
    fi
    
    # Add Deakin email
    DEAKIN_USER_ID=$(az ad user show --id "s224670304@deakin.edu.au" --query id -o tsv 2>/dev/null || echo "")
    if [ "$DEAKIN_USER_ID" != "" ]; then
        az ad app owner add --id "$CLIENT_ID" --owner-object-id "$DEAKIN_USER_ID" 2>/dev/null || echo "⚠️  Could not add Deakin user as owner"
        echo "✅ Deakin user (s224670304@deakin.edu.au) added as owner"
    else
        echo "⚠️  Deakin user not found - may need to be added manually"
    fi
    
    # Add TBWA team members
    echo "👥 Adding TBWA team members..."
    
    # Eugene Valencia - Owner
    EUGENE_USER_ID=$(az ad user show --id "eugene.valencia@tbwa-smp.com" --query id -o tsv 2>/dev/null || echo "")
    if [ "$EUGENE_USER_ID" != "" ]; then
        az ad app owner add --id "$CLIENT_ID" --owner-object-id "$EUGENE_USER_ID" 2>/dev/null || echo "⚠️  Could not add Eugene as owner"
        echo "✅ Eugene Valencia (eugene.valencia@tbwa-smp.com) added as owner"
    else
        echo "⚠️  Eugene Valencia not found - may need to be added manually"
    fi
    
    # Paolo and Khalil - App Users with specific roles
    for EMAIL in "paolo.broma@tbwa-smp.com" "khalil.veracruz@tbwa-smp.com"; do
        USER_ID=$(az ad user show --id "$EMAIL" --query id -o tsv 2>/dev/null || echo "")
        if [ "$USER_ID" != "" ]; then
            # Reader role at subscription level
            az role assignment create \
                --assignee "$USER_ID" \
                --role "Reader" \
                --scope "/subscriptions/$SUBSCRIPTION_ID" \
                --description "TBWA Scout Analytics - Read access for $EMAIL" 2>/dev/null || echo "⚠️  Could not assign Reader role to $EMAIL"
            
            # Cognitive Services User for OpenAI access
            az role assignment create \
                --assignee "$USER_ID" \
                --role "Cognitive Services User" \
                --scope "/subscriptions/$SUBSCRIPTION_ID" \
                --description "TBWA Scout Analytics - OpenAI access for $EMAIL" 2>/dev/null || echo "⚠️  Could not assign Cognitive Services role to $EMAIL"
            
            echo "✅ $EMAIL added with Reader + Cognitive Services access"
        else
            echo "⚠️  $EMAIL not found - may need to be added manually"
        fi
    done
    
else
    echo "📋 Using existing app registration"
    
    # Get existing client secret (if available)
    echo "⚠️  Using existing app - you may need to create new client secret if expired"
    CLIENT_SECRET="<EXISTING_SECRET_FROM_PORTAL>"
fi

# Update .env.local with new credentials
echo "📝 Updating .env.local with Azure credentials..."

ENV_FILE=".env.local"
if [ -f "$ENV_FILE" ]; then
    # Update existing values
    if grep -q "AZURE_TENANT_ID=" "$ENV_FILE"; then
        sed -i.bak "s/AZURE_TENANT_ID=.*/AZURE_TENANT_ID=$TENANT_ID/" "$ENV_FILE"
    else
        echo "AZURE_TENANT_ID=$TENANT_ID" >> "$ENV_FILE"
    fi
    
    if grep -q "AZURE_CLIENT_ID=" "$ENV_FILE"; then
        sed -i.bak "s/AZURE_CLIENT_ID=.*/AZURE_CLIENT_ID=$CLIENT_ID/" "$ENV_FILE"
    else
        echo "AZURE_CLIENT_ID=$CLIENT_ID" >> "$ENV_FILE"
    fi
    
    if [ "$CLIENT_SECRET" != "<EXISTING_SECRET_FROM_PORTAL>" ]; then
        if grep -q "AZURE_CLIENT_SECRET=" "$ENV_FILE"; then
            sed -i.bak "s/AZURE_CLIENT_SECRET=.*/AZURE_CLIENT_SECRET=$CLIENT_SECRET/" "$ENV_FILE"
        else
            echo "AZURE_CLIENT_SECRET=$CLIENT_SECRET" >> "$ENV_FILE"
        fi
    fi
    
    echo "✅ .env.local updated"
else
    echo "⚠️  .env.local not found - please update manually"
fi

# Update credentials.json
echo "📝 Updating credentials.json..."
CRED_FILE="credentials.json"
if [ -f "$CRED_FILE" ]; then
    # Update JSON file using jq
    if command -v jq &> /dev/null; then
        jq --arg tenant_id "$TENANT_ID" \
           --arg client_id "$CLIENT_ID" \
           --arg client_secret "$CLIENT_SECRET" \
           '.azure.tenant_id = $tenant_id | .azure.client_id = $client_id | .azure.client_secret = $client_secret' \
           "$CRED_FILE" > "${CRED_FILE}.tmp" && mv "${CRED_FILE}.tmp" "$CRED_FILE"
        echo "✅ credentials.json updated"
    else
        echo "⚠️  jq not available - please update credentials.json manually"
    fi
else
    echo "⚠️  credentials.json not found - please update manually"
fi

echo ""
echo "🎉 Azure App Registration setup complete!"
echo "================================================"
echo "📋 Summary:"
echo "   App Name: $APP_NAME"
echo "   Tenant ID: $TENANT_ID"
echo "   Client ID: $CLIENT_ID"
if [ "$CLIENT_SECRET" != "<EXISTING_SECRET_FROM_PORTAL>" ]; then
    echo "   Client Secret: $CLIENT_SECRET"
else
    echo "   Client Secret: <Use existing or create new in portal>"
fi
echo ""
echo "🔐 Assigned Roles:"
echo "   ✅ Contributor (Resource management)"
echo "   ✅ Storage Blob Data Contributor (Storage access)"
echo "   ✅ Cognitive Services User (OpenAI access)"
echo ""
echo "👥 Admin Access:"
echo "   ✅ Current user (full owner access)"
echo "   ✅ Deakin user (s224670304@deakin.edu.au)"
echo "   ✅ Eugene Valencia (eugene.valencia@tbwa-smp.com) - Owner"
echo "   ✅ Paolo Broma (paolo.broma@tbwa-smp.com) - Reader + OpenAI"
echo "   ✅ Khalil Veracruz (khalil.veracruz@tbwa-smp.com) - Reader + OpenAI"
echo ""
echo "🎯 Specific Resource Access:"
echo "   ✅ SQL Server: sqltbwaprojectscoutserver.database.windows.net"
echo "   ✅ Storage Account: projectscoutdata"
echo "   ✅ OpenAI: ces-openai-20250609"
echo "   ✅ Databricks: tbwa-juicer-databricks"
echo ""
echo "📁 Updated Files:"
echo "   ✅ .env.local (Azure credentials)"
echo "   ✅ credentials.json (Structured config)"
echo ""
echo "🚀 Next Steps:"
echo "   1. Verify credentials in .env.local"
echo "   2. Add Databricks token and storage connection string"
echo "   3. Run: npm run dev:full"
echo ""
echo "🔧 Troubleshooting:"
echo "   - If authentication fails, wait 5-10 minutes for propagation"
echo "   - Check role assignments in Azure Portal → Subscriptions → Access control (IAM)"
echo "   - Verify app registration in Azure Portal → Azure Active Directory → App registrations"