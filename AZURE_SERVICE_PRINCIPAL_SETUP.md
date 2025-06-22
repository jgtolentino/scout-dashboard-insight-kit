# Azure Service Principal Setup for Scout Analytics

## For Developer/Owner: s224670304@deakin.edu.au

### Understanding Service Principal Permissions

**Service Principals ARE NOT the same as Owner access**. They are:
- Application identities (like a "robot user")
- Given ONLY specific permissions needed
- More secure than using your personal account
- Can be revoked without affecting your personal access

### Your Setup Options

## Option 1: Keep Using Your Email (Simplest)
Since you're the developer/owner, you can:
```bash
# Deploy directly with your email
export AZURE_USER_EMAIL="s224670304@deakin.edu.au"
./scripts/deploy-production-managed-identity.sh
```

## Option 2: Create Limited Service Principal (Recommended)
Service principal with ONLY needed permissions:
```bash
# Create service principal with Contributor role (NOT Owner)
az ad sp create-for-rbac \
  --name "scout-analytics-sp" \
  --role "Contributor" \
  --scopes "/subscriptions/{your-subscription-id}/resourceGroups/scout-analytics-rg"

# This gives:
# ✅ Deploy and manage app resources
# ✅ Read/write storage and databases
# ❌ Cannot change billing
# ❌ Cannot delete resource groups
# ❌ Cannot manage other users
```

## Option 3: Hybrid Approach (Best for Development)
Use your email for development, service principal for automation:

```bash
# 1. Development work - use your email
az login --username s224670304@deakin.edu.au

# 2. Create service principal for CI/CD only
az ad sp create-for-rbac \
  --name "scout-ci-cd-sp" \
  --role "Website Contributor" \
  --scopes "/subscriptions/{subscription-id}/resourceGroups/scout-analytics-rg"

# 3. Your email keeps full access, service principal has limited access
```

### Quick Setup Script for Your Scenario

```bash
#!/bin/bash
# setup-for-deakin-developer.sh

echo "Setting up Scout Analytics for s224670304@deakin.edu.au"

# Your email keeps Owner access
DEVELOPER_EMAIL="s224670304@deakin.edu.au"

# Create LIMITED service principal for the app
echo "Creating service principal with LIMITED permissions..."
az ad sp create-for-rbac \
  --name "scout-app-identity" \
  --role "Contributor" \
  --scopes "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/scout-analytics-rg" \
  --output json > service-principal.json

echo "Service Principal created with:"
echo "- Contributor access (NOT Owner)"
echo "- Limited to scout-analytics-rg resource group only"
echo "- Your email $DEVELOPER_EMAIL still has full Owner access"

# Store credentials securely
echo "Storing credentials in Azure Key Vault..."
az keyvault secret set \
  --vault-name "scout-keyvault" \
  --name "sp-credentials" \
  --value "@service-principal.json"
```

### Permissions Comparison

| Permission | Your Email (Owner) | Service Principal (Contributor) |
|------------|-------------------|--------------------------------|
| Deploy Apps | ✅ | ✅ |
| Manage Storage | ✅ | ✅ |
| Access Databases | ✅ | ✅ |
| View Billing | ✅ | ❌ |
| Delete Resource Groups | ✅ | ❌ |
| Manage User Access | ✅ | ❌ |
| Create New Subscriptions | ✅ | ❌ |

### Recommended Approach for You

Since you're the developer and using an educational email:

1. **Keep your Owner access** - Don't reduce your own permissions
2. **Create service principals for automated tasks** - More secure than using your password
3. **Use your email for development** - Full access when you need it

```bash
# One-command setup
curl -sL https://raw.githubusercontent.com/your-repo/scout-analytics/main/scripts/quick-setup.sh | bash -s -- --email s224670304@deakin.edu.au --create-sp
```

### Security Note for Educational Accounts

Since you're using a Deakin email:
- Enable MFA on your Deakin account if not already
- Service principals don't expire with student accounts
- Consider transferring ownership before graduation

Would you like me to create a specific setup script for your Deakin account that maintains your full access while creating limited service principals for the app?