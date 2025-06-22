#!/bin/bash

# Manual Development Access Setup for Scout Analytics
# Provides commands to run manually when you have sufficient privileges

set -e

# Configuration
DEV_SUBSCRIPTION_ID="c03c092c-443c-4f25-9efe-33f092621251"
STORAGE_ACCOUNT="scoutanalyticsdata"
RESOURCE_GROUP="scout-dashboard-rg"
DEAKIN_EMAIL="224670304@deakin.edu.au"

echo "🔐 Scout Analytics Development Access Setup (Manual)"
echo "Subscription: $DEV_SUBSCRIPTION_ID"
echo "Storage Account: $STORAGE_ACCOUNT"
echo "Resource Group: $RESOURCE_GROUP"
echo ""

# Create comprehensive manual instructions
cat > MANUAL_ACCESS_SETUP.md << 'EOF'
# Scout Analytics Manual Access Setup

## Prerequisites
- You must be logged in as a user with **User Administrator** or **Global Administrator** privileges
- Azure CLI must be authenticated with sufficient permissions

## 1. Set Development Subscription

```bash
# Set the correct subscription
az account set --subscription c03c092c-443c-4f25-9efe-33f092621251

# Verify subscription
az account show --query "{Name:name, Id:id, State:state}" --output table
```

## 2. Grant Subscription Access

### For Deakin University Account
```bash
az role assignment create \
  --assignee 224670304@deakin.edu.au \
  --role "Contributor" \
  --scope /subscriptions/c03c092c-443c-4f25-9efe-33f092621251
```

### For GitHub Collaborators (after invitation)
```bash
# First, invite the GitHub user to your tenant
az rest \
  --method POST \
  --uri "https://graph.microsoft.com/v1.0/invitations" \
  --headers "Content-Type=application/json" \
  --body '{
    "invitedUserEmailAddress": "github-user@example.com",
    "inviteRedirectUrl": "https://portal.azure.com",
    "sendInvitationMessage": true,
    "invitedUserDisplayName": "Scout Analytics Collaborator"
  }'

# After they accept, grant contributor access (replace with their Object ID)
az role assignment create \
  --assignee <github-user-object-id> \
  --role "Contributor" \
  --scope /subscriptions/c03c092c-443c-4f25-9efe-33f092621251
```

## 3. Grant Storage Access (Medallion Layers)

### Bronze Layer (Raw Data - Full Access)
```bash
# Deakin account
az role assignment create \
  --assignee 224670304@deakin.edu.au \
  --role "Storage Blob Data Owner" \
  --scope "/subscriptions/c03c092c-443c-4f25-9efe-33f092621251/resourceGroups/scout-dashboard-rg/providers/Microsoft.Storage/storageAccounts/scoutanalyticsdata/blobServices/default/containers/bronze"

# GitHub collaborator (replace with Object ID)
az role assignment create \
  --assignee <github-user-object-id> \
  --role "Storage Blob Data Owner" \
  --scope "/subscriptions/c03c092c-443c-4f25-9efe-33f092621251/resourceGroups/scout-dashboard-rg/providers/Microsoft.Storage/storageAccounts/scoutanalyticsdata/blobServices/default/containers/bronze"
```

### Silver Layer (Cleaned Data - Full Access)
```bash
# Deakin account
az role assignment create \
  --assignee 224670304@deakin.edu.au \
  --role "Storage Blob Data Owner" \
  --scope "/subscriptions/c03c092c-443c-4f25-9efe-33f092621251/resourceGroups/scout-dashboard-rg/providers/Microsoft.Storage/storageAccounts/scoutanalyticsdata/blobServices/default/containers/silver"

# GitHub collaborator (replace with Object ID)
az role assignment create \
  --assignee <github-user-object-id> \
  --role "Storage Blob Data Owner" \
  --scope "/subscriptions/c03c092c-443c-4f25-9efe-33f092621251/resourceGroups/scout-dashboard-rg/providers/Microsoft.Storage/storageAccounts/scoutanalyticsdata/blobServices/default/containers/silver"
```

### Gold Layer (Business Data)
```bash
# Deakin account - Full access
az role assignment create \
  --assignee 224670304@deakin.edu.au \
  --role "Storage Blob Data Owner" \
  --scope "/subscriptions/c03c092c-443c-4f25-9efe-33f092621251/resourceGroups/scout-dashboard-rg/providers/Microsoft.Storage/storageAccounts/scoutanalyticsdata/blobServices/default/containers/gold"

# GitHub collaborator - Read-only (safer for external collaborators)
az role assignment create \
  --assignee <github-user-object-id> \
  --role "Storage Blob Data Reader" \
  --scope "/subscriptions/c03c092c-443c-4f25-9efe-33f092621251/resourceGroups/scout-dashboard-rg/providers/Microsoft.Storage/storageAccounts/scoutanalyticsdata/blobServices/default/containers/gold"
```

## 4. Create Service Principal for Automation

```bash
# Create service principal for ETL pipeline
az ad sp create-for-rbac \
  --name "scout-analytics-etl-sp" \
  --role "Contributor" \
  --scopes "/subscriptions/c03c092c-443c-4f25-9efe-33f092621251" \
  --description "Service principal for Scout Analytics ETL pipeline"

# Note down the output:
# {
#   "appId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
#   "displayName": "scout-analytics-etl-sp",
#   "password": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
#   "tenant": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
# }

# Grant storage access to service principal (use appId from above)
az role assignment create \
  --assignee <service-principal-appId> \
  --role "Storage Blob Data Owner" \
  --scope "/subscriptions/c03c092c-443c-4f25-9efe-33f092621251/resourceGroups/scout-dashboard-rg/providers/Microsoft.Storage/storageAccounts/scoutanalyticsdata"
```

## 5. Verification Commands

### Check Subscription Access
```bash
az role assignment list \
  --scope "/subscriptions/c03c092c-443c-4f25-9efe-33f092621251" \
  --query "[?contains(principalName, 'deakin')].{Principal:principalName, Role:roleDefinitionName}" \
  --output table
```

### Check Storage Access
```bash
az role assignment list \
  --scope "/subscriptions/c03c092c-443c-4f25-9efe-33f092621251/resourceGroups/scout-dashboard-rg/providers/Microsoft.Storage/storageAccounts/scoutanalyticsdata" \
  --query "[].{Principal:principalName, Role:roleDefinitionName, Scope:scope}" \
  --output table
```

### Test Storage Access
```bash
# Test as Deakin user
az storage blob list \
  --container-name gold \
  --account-name scoutanalyticsdata \
  --output table

# Test authentication
az storage account show \
  --name scoutanalyticsdata \
  --resource-group scout-dashboard-rg \
  --query "primaryEndpoints.blob"
```

## 6. Alternative: Using Object IDs

If email addresses don't work, you can use Object IDs instead:

```bash
# Find Object ID for a user
az ad user show --id 224670304@deakin.edu.au --query id --output tsv

# Use Object ID in role assignments
az role assignment create \
  --assignee-object-id <object-id> \
  --assignee-principal-type User \
  --role "Contributor" \
  --scope /subscriptions/c03c092c-443c-4f25-9efe-33f092621251
```

## 📞 Troubleshooting

### Common Issues

1. **"Insufficient privileges"**: You need User Administrator or Global Administrator role
2. **"User not found"**: User might not be in the tenant yet (send invitation first)
3. **"Role assignment already exists"**: Check existing assignments with `az role assignment list`

### Support Commands
```bash
# Check your current permissions
az role assignment list --assignee $(az ad signed-in-user show --query id --output tsv) --output table

# List all users in tenant
az ad user list --query "[].{DisplayName:displayName, UserPrincipalName:userPrincipalName}" --output table

# Check tenant information
az account tenant list --output table
```

---
**Important**: Replace `<github-user-object-id>` and `<service-principal-appId>` with actual values from your setup.
EOF

echo "📋 Manual setup guide created: MANUAL_ACCESS_SETUP.md"

# Try to get current user info
echo ""
echo "🔍 Current Azure CLI context:"
CURRENT_USER=$(az ad signed-in-user show --query userPrincipalName --output tsv 2>/dev/null || echo "Unable to determine")
CURRENT_SUB=$(az account show --query name --output tsv 2>/dev/null || echo "Unable to determine")

echo "   User: $CURRENT_USER"
echo "   Subscription: $CURRENT_SUB"

# Check permissions
echo ""
echo "🔑 Checking current permissions..."
echo "Your current role assignments:"

az role assignment list \
  --assignee $(az ad signed-in-user show --query id --output tsv 2>/dev/null) \
  --query "[].{Role:roleDefinitionName, Scope:scope}" \
  --output table 2>/dev/null || echo "Unable to check role assignments"

echo ""
echo "📋 To complete the setup:"
echo "   1. Open MANUAL_ACCESS_SETUP.md"
echo "   2. Run the commands with appropriate privileges"
echo "   3. Test access with verification commands"
echo ""
echo "⚠️ Important notes:"
echo "   - You need User Administrator or Global Administrator privileges"
echo "   - GitHub users must be invited to your tenant first"
echo "   - Replace placeholder values with actual Object IDs"
echo "   - Test each step before proceeding to the next"

# Create a simple test script
cat > test-access.sh << 'EOF'
#!/bin/bash

# Test Scout Analytics Access
echo "🧪 Testing Scout Analytics access..."

# Set subscription
az account set --subscription c03c092c-443c-4f25-9efe-33f092621251

echo "1️⃣ Testing subscription access..."
az account show --query "{Name:name, State:state}" --output table

echo ""
echo "2️⃣ Testing storage account access..."
az storage account show \
  --name scoutanalyticsdata \
  --resource-group scout-dashboard-rg \
  --query "{Name:name, Location:location, Kind:kind}" \
  --output table

echo ""
echo "3️⃣ Testing Gold layer access..."
az storage blob list \
  --container-name gold \
  --account-name scoutanalyticsdata \
  --output table

echo ""
echo "✅ Access test complete!"
EOF

chmod +x test-access.sh

echo ""
echo "🧪 Test script created: test-access.sh"
echo "   Run this after setting up access to verify everything works"