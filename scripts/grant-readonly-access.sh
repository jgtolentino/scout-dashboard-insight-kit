#!/bin/bash

# Grant Read-Only Access to Scout Analytics Gold Layer
# For external partners, clients, or read-only collaborators

set -e

# Configuration
DEV_SUBSCRIPTION_ID="c03c092c-443c-4f25-9efe-33f092621251"
STORAGE_ACCOUNT="scoutanalyticsdata"
RESOURCE_GROUP="scout-dashboard-rg"

echo "👁️ Setting up read-only access to Scout Analytics Gold layer..."
echo ""

# Function to invite external user with read-only access
invite_readonly_user() {
    local user_email="$1"
    local user_description="$2"
    
    echo "📧 Inviting read-only user: $user_email"
    echo "Description: $user_description"
    
    # Send invitation
    INVITATION_RESULT=$(az rest \
        --method POST \
        --uri "https://graph.microsoft.com/v1.0/invitations" \
        --headers "Content-Type=application/json" \
        --body "{
            \"invitedUserEmailAddress\": \"$user_email\",
            \"inviteRedirectUrl\": \"https://portal.azure.com\",
            \"sendInvitationMessage\": true,
            \"invitedUserDisplayName\": \"$user_description (Read-Only)\"
        }" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        INVITED_USER_ID=$(echo "$INVITATION_RESULT" | jq -r '.invitedUser.id // empty')
        echo "✅ User invited successfully"
        echo "   User ID: $INVITED_USER_ID"
        
        # Wait for invitation to process
        echo "⏳ Waiting for invitation to process..."
        sleep 15
        
        # Grant read-only access to Gold layer only
        echo "🔑 Granting read-only access to Gold layer..."
        
        local scope="/subscriptions/$DEV_SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Storage/storageAccounts/$STORAGE_ACCOUNT/blobServices/default/containers/gold"
        
        az role assignment create \
            --assignee "$INVITED_USER_ID" \
            --role "Storage Blob Data Reader" \
            --scope "$scope" \
            --description "Read-only access to Scout Analytics Gold layer for $user_description"
        
        if [ $? -eq 0 ]; then
            echo "✅ Read-only access granted successfully"
        else
            echo "❌ Failed to grant storage access"
        fi
        
        # Create access instructions for the user
        create_user_instructions "$user_email" "$user_description"
        
        echo "$INVITED_USER_ID"
    else
        echo "❌ Failed to invite user"
        echo ""
    fi
}

# Function to create access instructions
create_user_instructions() {
    local user_email="$1"
    local user_description="$2"
    local filename="access_instructions_$(echo $user_email | sed 's/@/_/g' | sed 's/\./_/g').md"
    
    cat > "$filename" << EOF
# Scout Analytics Access Instructions

## Welcome $user_description!

You have been granted **read-only access** to the Scout Analytics Gold layer data.

## 📊 What You Can Access

### Available Datasets (Gold Layer)
- **Transactions Summary**: Daily aggregated transaction metrics
- **Regional KPIs**: Regional performance indicators and growth
- **Product Insights**: Product performance and substitution patterns  
- **Customer Segments**: Customer demographic and behavioral data
- **Market Trends**: Trend analysis and forecasting data

## 🔑 Access Methods

### Method 1: Azure Portal (Web Interface)
1. Check your email for the Azure invitation
2. Click "Accept invitation" 
3. Sign in to: https://portal.azure.com
4. Navigate to Storage Account: **$STORAGE_ACCOUNT**
5. Browse the **gold** container

### Method 2: Azure CLI (Command Line)
\`\`\`bash
# Install Azure CLI if needed
# https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Login with your invited account
az login

# Set the correct subscription
az account set --subscription $DEV_SUBSCRIPTION_ID

# List available Gold datasets
az storage blob list \\
    --container-name gold \\
    --account-name $STORAGE_ACCOUNT \\
    --output table
\`\`\`

### Method 3: Python SDK
\`\`\`python
from azure.storage.blob import BlobServiceClient
from azure.identity import DefaultAzureCredential
import pandas as pd

# Authenticate
credential = DefaultAzureCredential()
blob_client = BlobServiceClient(
    account_url="https://$STORAGE_ACCOUNT.blob.core.windows.net",
    credential=credential
)

# List Gold datasets
container_client = blob_client.get_container_client("gold")
for blob in container_client.list_blobs():
    print(f"📊 {blob.name}")
\`\`\`

### Method 4: Scout Analytics API (Public)
\`\`\`bash
# Public API endpoints (no authentication required)
curl "https://scout-analytics-dashboard.azurewebsites.net/scout/analytics"
\`\`\`

## 📋 Available API Endpoints

- **Analytics Summary**: \`/scout/analytics\`
- **Transactions**: \`/api/transactions\`
- **Regional Performance**: \`/api/regional-performance\`
- **Category Mix**: \`/api/category-mix\`
- **Volume Data**: \`/api/volume\`

## 🚫 Access Restrictions

### What You CAN Do:
✅ Read all Gold layer datasets  
✅ Download data for analysis  
✅ Use data in your applications  
✅ Create reports and visualizations  

### What You CANNOT Do:
❌ Access Bronze or Silver layers (raw/intermediate data)  
❌ Modify or delete any data  
❌ Create new datasets  
❌ Access other Azure resources  

## 📞 Support

For questions or issues:
- **Technical Support**: scout-support@tbwa.com
- **Data Questions**: data-team@tbwa.com
- **Access Issues**: $user_email (reply to invitation email)

## 🔗 Useful Resources

- **Azure Portal**: https://portal.azure.com
- **Storage Account**: https://portal.azure.com/#@/resource/subscriptions/$DEV_SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Storage/storageAccounts/$STORAGE_ACCOUNT
- **Scout Dashboard**: https://scout-analytics-dashboard.azurewebsites.net
- **API Documentation**: [Available in repository]

---
**Access Level**: Read-Only (Gold Layer)  
**Generated**: $(date)  
**Valid**: Until revoked
EOF
    
    echo "📋 Access instructions created: $filename"
}

# Main execution
echo "Please provide details for the read-only user:"
echo ""

read -p "Enter user email: " USER_EMAIL
read -p "Enter user description (e.g., 'Client Partner', 'External Analyst'): " USER_DESCRIPTION

if [ -z "$USER_EMAIL" ] || [ -z "$USER_DESCRIPTION" ]; then
    echo "❌ Email and description are required"
    exit 1
fi

echo ""
echo "🔍 Summary:"
echo "   Email: $USER_EMAIL"
echo "   Description: $USER_DESCRIPTION"
echo "   Access Level: Read-Only (Gold Layer)"
echo ""

read -p "Proceed with invitation? (y/N): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "❌ Operation cancelled"
    exit 0
fi

echo ""
echo "🚀 Processing invitation..."

# Set subscription
az account set --subscription $DEV_SUBSCRIPTION_ID

# Invite user
USER_ID=$(invite_readonly_user "$USER_EMAIL" "$USER_DESCRIPTION")

echo ""
echo "🎉 Read-only access setup complete!"
echo ""
echo "📧 Next steps:"
echo "   1. User will receive email invitation"
echo "   2. They must accept the invitation"
echo "   3. They can then access Gold layer data"
echo "   4. Share the access instructions file with them"
echo ""
echo "🔒 Security notes:"
echo "   - User has read-only access to Gold layer only"
echo "   - No access to Bronze or Silver layers"
echo "   - No modification permissions"
echo "   - Access can be revoked at any time"
echo ""
echo "📋 To revoke access later:"
echo "   az role assignment delete --assignee '$USER_EMAIL' --scope '/subscriptions/$DEV_SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Storage/storageAccounts/$STORAGE_ACCOUNT/blobServices/default/containers/gold'"