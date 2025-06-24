# Manual Azure App Registration Setup Instructions

## Current Status
- ✅ Tenant ID: `e56592a9-7582-4ce4-ac69-8e53c4b39b44`
- ✅ Subscription ID: `c03c092c-443c-4f25-9efe-33f092621251`
- ⚠️ Current account lacks privileges to create app registrations via CLI

## Required Manual Steps

### 1. Create App Registration
Navigate to Azure Portal → Azure Active Directory → App registrations → New registration

**Settings:**
- **Name:** `adsbot-tbwa-app`
- **Account types:** Accounts in this organizational directory only
- **Redirect URI:** 
  - Type: Web
  - URI 1: `http://localhost:3000`
  - URI 2: `https://scout-analytics.azurewebsites.net`

### 2. Generate Client Secret
In the new app registration:
1. Go to "Certificates & secrets"
2. Click "New client secret"
3. Description: `adsbot-client-secret`
4. Expires: 24 months
5. Copy the secret value (you won't see it again!)

### 3. Assign Azure Roles
Navigate to Subscriptions → TBWA-ProjectScout-Prod → Access control (IAM)

**For the App Registration Service Principal:**
- Role: `Contributor`
- Role: `Storage Blob Data Contributor`
- Role: `Cognitive Services User`

### 4. Add Team Members

**Eugene Valencia (eugene.valencia@tbwa-smp.com):**
- App Registration → Owners → Add owner
- Subscription → Access control → Add role assignment → Owner

**Paolo Broma (paolo.broma@tbwa-smp.com):**
- Subscription → Access control → Add role assignment:
  - Role: `Reader`
  - Role: `Cognitive Services User`

**Khalil Veracruz (khalil.veracruz@tbwa-smp.com):**
- Subscription → Access control → Add role assignment:
  - Role: `Reader`
  - Role: `Cognitive Services User`

### 5. Update Environment Files

Once you have the Client ID and Client Secret, update:

**`.env.local`:**
```bash
AZURE_CLIENT_ID=<your-client-id>
AZURE_CLIENT_SECRET=<your-client-secret>
```

**`credentials.json`:**
```json
{
  "azure": {
    "client_id": "<your-client-id>",
    "client_secret": "<your-client-secret>"
  }
}
```

### 6. Verification Commands

After setup, test the authentication:

```bash
# Test Azure CLI access
az login --service-principal -u <client-id> -p <client-secret> --tenant e56592a9-7582-4ce4-ac69-8e53c4b39b44

# Test Databricks access
az databricks workspace list

# Test Storage access
az storage blob list --account-name projectscoutdata --container-name bronze
```

## Alternative: Request Admin to Create

Send this request to an Azure AD administrator:

---

**Subject:** Azure App Registration Request for Scout Analytics Dashboard

Please create an app registration with these specifications:

- **Name:** adsbot-tbwa-app
- **Description:** AdsBot TBWA App - Multi-user Azure access for Scout Analytics v3.0
- **Account types:** Single tenant (current directory only)
- **Redirect URIs:** 
  - http://localhost:3000
  - https://scout-analytics.azurewebsites.net

**Required Roles:**
- Contributor
- Storage Blob Data Contributor  
- Cognitive Services User

**Team Access:**
- Eugene Valencia (eugene.valencia@tbwa-smp.com) - Owner
- Paolo Broma (paolo.broma@tbwa-smp.com) - Reader + Cognitive Services User
- Khalil Veracruz (khalil.veracruz@tbwa-smp.com) - Reader + Cognitive Services User

Please provide the Client ID and Client Secret for integration.

---

## Next Steps After App Registration

1. Run Databricks setup: `npm run setup:databricks`
2. Test full stack: `npm run dev:full`
3. Verify dashboard access for all team members