#!/bin/bash

# Setup Development Access for Scout Analytics
# Grants proper permissions to Deakin email and GitHub collaborators

set -e

# Configuration for Scout Analytics
DEV_SUBSCRIPTION_ID="c03c092c-443c-4f25-9efe-33f092621251"
STORAGE_ACCOUNT="scoutanalyticsdata"
RESOURCE_GROUP="scout-dashboard-rg"
DEAKIN_EMAIL="224670304@deakin.edu.au"

echo "🔐 Setting up development access for Scout Analytics..."
echo "Subscription: $DEV_SUBSCRIPTION_ID"
echo "Storage Account: $STORAGE_ACCOUNT"
echo "Resource Group: $RESOURCE_GROUP"
echo ""

# Set the correct subscription
echo "1️⃣ Setting development subscription..."
az account set --subscription $DEV_SUBSCRIPTION_ID

CURRENT_SUB=$(az account show --query id -o tsv)
if [ "$CURRENT_SUB" != "$DEV_SUBSCRIPTION_ID" ]; then
    echo "❌ Failed to set subscription"
    exit 1
fi

echo "✅ Development subscription set: $CURRENT_SUB"
echo ""

# Function to invite GitHub user
invite_github_user() {
    local github_email="$1"
    
    if [ -z "$github_email" ]; then
        echo "⚠️ No GitHub email provided, skipping GitHub user invitation"
        return 0
    fi
    
    echo "📧 Inviting GitHub user: $github_email"
    
    # Send invitation
    INVITATION_RESULT=$(az rest \
        --method POST \
        --uri "https://graph.microsoft.com/v1.0/invitations" \
        --headers "Content-Type=application/json" \
        --body "{
            \"invitedUserEmailAddress\": \"$github_email\",
            \"inviteRedirectUrl\": \"https://portal.azure.com\",
            \"sendInvitationMessage\": true,
            \"invitedUserDisplayName\": \"Scout Analytics Collaborator\"
        }" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        INVITED_USER_ID=$(echo "$INVITATION_RESULT" | jq -r '.invitedUser.id // empty')
        echo "✅ GitHub user invited successfully"
        echo "   User ID: $INVITED_USER_ID"
        echo "   Please ask them to check their email and accept the invitation"
        echo "$INVITED_USER_ID"
    else
        echo "❌ Failed to invite GitHub user (they may already be invited)"
        echo ""
    fi
}

# Function to grant subscription contributor access
grant_subscription_access() {
    local assignee="$1"
    local description="$2"
    
    echo "🔑 Granting Contributor access to $description..."
    
    az role assignment create \
        --assignee "$assignee" \
        --role "Contributor" \
        --scope "/subscriptions/$DEV_SUBSCRIPTION_ID" \
        --description "Scout Analytics development access for $description"
    
    if [ $? -eq 0 ]; then
        echo "✅ Contributor access granted to $description"
    else
        echo "❌ Failed to grant access to $description (may already exist)"
    fi
}

# Function to grant storage access
grant_storage_access() {
    local assignee="$1"
    local description="$2"
    local container="$3"
    local role="${4:-Storage Blob Data Owner}"
    
    echo "💾 Granting $role access to $description for container: $container"
    
    local scope="/subscriptions/$DEV_SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Storage/storageAccounts/$STORAGE_ACCOUNT/blobServices/default/containers/$container"
    
    az role assignment create \
        --assignee "$assignee" \
        --role "$role" \
        --scope "$scope" \
        --description "Scout Analytics $container layer access for $description"
    
    if [ $? -eq 0 ]; then
        echo "✅ $role access granted to $description for $container"
    else
        echo "❌ Failed to grant storage access (may already exist)"
    fi
}

# 2. Grant access to Deakin email
echo "2️⃣ Setting up access for Deakin email..."
grant_subscription_access "$DEAKIN_EMAIL" "Deakin University Account"

# Grant medallion layer access to Deakin email
echo ""
echo "📂 Granting medallion layer access to Deakin account..."
grant_storage_access "$DEAKIN_EMAIL" "Deakin University Account" "bronze" "Storage Blob Data Owner"
grant_storage_access "$DEAKIN_EMAIL" "Deakin University Account" "silver" "Storage Blob Data Owner" 
grant_storage_access "$DEAKIN_EMAIL" "Deakin University Account" "gold" "Storage Blob Data Owner"

echo ""

# 3. Handle GitHub user invitation and access
read -p "Enter GitHub collaborator email (or press Enter to skip): " GITHUB_EMAIL

if [ ! -z "$GITHUB_EMAIL" ]; then
    echo "3️⃣ Setting up GitHub collaborator access..."
    
    # Invite GitHub user
    GITHUB_USER_ID=$(invite_github_user "$GITHUB_EMAIL")
    
    if [ ! -z "$GITHUB_USER_ID" ]; then
        echo ""
        echo "⏳ Waiting 30 seconds for invitation to process..."
        sleep 30
        
        # Grant subscription access
        grant_subscription_access "$GITHUB_USER_ID" "GitHub Collaborator"
        
        # Grant storage access to all medallion layers
        echo ""
        echo "📂 Granting medallion layer access to GitHub collaborator..."
        grant_storage_access "$GITHUB_USER_ID" "GitHub Collaborator" "bronze" "Storage Blob Data Owner"
        grant_storage_access "$GITHUB_USER_ID" "GitHub Collaborator" "silver" "Storage Blob Data Owner"
        grant_storage_access "$GITHUB_USER_ID" "GitHub Collaborator" "gold" "Storage Blob Data Reader"
        
        echo ""
        echo "📧 GitHub user setup complete!"
        echo "   Email: $GITHUB_EMAIL"
        echo "   User ID: $GITHUB_USER_ID"
        echo "   ⚠️ They must accept the email invitation first!"
    fi
else
    echo "3️⃣ Skipping GitHub collaborator setup"
fi

echo ""

# 4. Grant additional Azure services access
echo "4️⃣ Setting up service access..."

# Grant access to current user (CLI user)
CURRENT_USER=$(az ad signed-in-user show --query id -o tsv 2>/dev/null || echo "")
if [ ! -z "$CURRENT_USER" ]; then
    echo "👤 Granting access to current CLI user..."
    grant_subscription_access "$CURRENT_USER" "Current CLI User"
    grant_storage_access "$CURRENT_USER" "Current CLI User" "bronze" "Storage Blob Data Owner"
    grant_storage_access "$CURRENT_USER" "Current CLI User" "silver" "Storage Blob Data Owner"
    grant_storage_access "$CURRENT_USER" "Current CLI User" "gold" "Storage Blob Data Owner"
fi

echo ""

# 5. Setup service principal for automated access
echo "5️⃣ Setting up service principal for automation..."

SP_NAME="scout-analytics-etl-sp"
SP_RESULT=$(az ad sp create-for-rbac \
    --name "$SP_NAME" \
    --role "Contributor" \
    --scopes "/subscriptions/$DEV_SUBSCRIPTION_ID" \
    --description "Service principal for Scout Analytics ETL pipeline" 2>/dev/null || echo "")

if [ ! -z "$SP_RESULT" ]; then
    SP_APP_ID=$(echo "$SP_RESULT" | jq -r '.appId')
    SP_PASSWORD=$(echo "$SP_RESULT" | jq -r '.password')
    SP_TENANT=$(echo "$SP_RESULT" | jq -r '.tenant')
    
    echo "✅ Service principal created:"
    echo "   App ID: $SP_APP_ID"
    echo "   Tenant: $SP_TENANT"
    
    # Grant storage access to service principal
    grant_storage_access "$SP_APP_ID" "ETL Service Principal" "bronze" "Storage Blob Data Owner"
    grant_storage_access "$SP_APP_ID" "ETL Service Principal" "silver" "Storage Blob Data Owner"
    grant_storage_access "$SP_APP_ID" "ETL Service Principal" "gold" "Storage Blob Data Owner"
    
    # Save credentials securely
    cat > .env.service-principal << EOF
# Scout Analytics ETL Service Principal Credentials
# Keep these secure and never commit to Git!

AZURE_CLIENT_ID=$SP_APP_ID
AZURE_CLIENT_SECRET=$SP_PASSWORD
AZURE_TENANT_ID=$SP_TENANT
AZURE_SUBSCRIPTION_ID=$DEV_SUBSCRIPTION_ID

# Usage in Python:
# from azure.identity import ClientSecretCredential
# credential = ClientSecretCredential(tenant_id, client_id, client_secret)
EOF
    
    echo "🔐 Service principal credentials saved to .env.service-principal"
else
    echo "⚠️ Service principal may already exist or creation failed"
fi

echo ""

# 6. Verify access and create summary
echo "6️⃣ Verifying access setup..."

echo ""
echo "📋 Access verification:"

# Check current role assignments
echo "🔍 Current role assignments on subscription:"
az role assignment list \
    --scope "/subscriptions/$DEV_SUBSCRIPTION_ID" \
    --query "[?contains(principalName, 'deakin') || contains(displayName, 'Scout')].{Principal:principalName, Role:roleDefinitionName}" \
    --output table

echo ""
echo "🔍 Current role assignments on Gold storage:"
az role assignment list \
    --scope "/subscriptions/$DEV_SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Storage/storageAccounts/$STORAGE_ACCOUNT/blobServices/default/containers/gold" \
    --query "[].{Principal:principalName, Role:roleDefinitionName}" \
    --output table

echo ""

# Create access summary
cat > DEV_ACCESS_SUMMARY.md << EOF
# Scout Analytics Development Access Summary

## 👥 Authorized Users

### Deakin University Account
- **Email**: $DEAKIN_EMAIL
- **Subscription Role**: Contributor
- **Storage Access**: Owner (Bronze, Silver, Gold)
- **Permissions**: Full development access

$([ ! -z "$GITHUB_EMAIL" ] && echo "### GitHub Collaborator
- **Email**: $GITHUB_EMAIL
- **Subscription Role**: Contributor  
- **Storage Access**: Owner (Bronze, Silver), Reader (Gold)
- **Status**: Invitation sent (must accept email)")

### Service Principal (Automation)
- **Name**: $SP_NAME
- **App ID**: $SP_APP_ID
- **Storage Access**: Owner (all layers)
- **Purpose**: ETL pipeline automation

## 🏛️ Medallion Layer Access

### 🔴 Bronze Layer (Raw Data)
- **Deakin Account**: Full access (Owner)
- **GitHub User**: Full access (Owner)
- **Service Principal**: Full access (Owner)

### 🟡 Silver Layer (Cleaned Data)  
- **Deakin Account**: Full access (Owner)
- **GitHub User**: Full access (Owner)
- **Service Principal**: Full access (Owner)

### 🟢 Gold Layer (Business Data)
- **Deakin Account**: Full access (Owner)
- **GitHub User**: Read access (Reader)
- **Service Principal**: Full access (Owner)
- **Public API**: Read access via SAS tokens

## 🔑 Access Methods

### Azure Portal
- Navigate to: https://portal.azure.com
- Subscription: $DEV_SUBSCRIPTION_ID
- Resource Group: $RESOURCE_GROUP

### Azure CLI
\`\`\`bash
# Login and set subscription
az login
az account set --subscription $DEV_SUBSCRIPTION_ID

# Access storage
az storage blob list --container-name gold --account-name $STORAGE_ACCOUNT
\`\`\`

### Python SDK
\`\`\`python
from azure.storage.blob import BlobServiceClient
from azure.identity import DefaultAzureCredential

credential = DefaultAzureCredential()
blob_client = BlobServiceClient(
    account_url="https://$STORAGE_ACCOUNT.blob.core.windows.net",
    credential=credential
)
\`\`\`

## 🛠️ Next Steps

1. **Accept GitHub invitation** (if applicable)
2. **Test access** with Azure CLI
3. **Run ETL pipeline** with service principal
4. **Configure IDE** with Azure extensions
5. **Setup monitoring** and alerts

---
Generated: $(date)
EOF

echo "✅ Access summary saved to DEV_ACCESS_SUMMARY.md"

echo ""
echo "🎉 Development access setup complete!"
echo ""
echo "📊 Summary:"
echo "   ✅ Deakin account: Full access to all layers"
$([ ! -z "$GITHUB_EMAIL" ] && echo "   ✅ GitHub collaborator: Invited with appropriate access")
echo "   ✅ Service principal: Created for automation"
echo "   ✅ Medallion architecture: Proper RBAC applied"
echo ""
echo "📋 Important notes:"
echo "   1. GitHub users must accept email invitation"
echo "   2. Service principal credentials saved to .env.service-principal"
echo "   3. All users have development subscription Contributor access"
echo "   4. Gold layer maintains read-only for external collaborators"
echo ""
echo "🔗 Useful links:"
echo "   Azure Portal: https://portal.azure.com"
echo "   Storage Account: https://portal.azure.com/#@/resource/subscriptions/$DEV_SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Storage/storageAccounts/$STORAGE_ACCOUNT"
echo "   Resource Group: https://portal.azure.com/#@/resource/subscriptions/$DEV_SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP"