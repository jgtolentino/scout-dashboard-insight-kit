# 🚀 Scout Dashboard v4.0 Azure - Claude Code CLI Handoff

**Status: ✅ READY FOR BRUNO/REPOAGENT DEPLOYMENT**

---

## 🤖 Exact Two-Step Deployment Sequence

**Copy & paste these commands into Claude Code CLI:**

```bash
# 1. Grant your DATABASE_URL from Key Vault
:keykey grant_env --vault kv-projectscout-prod --secret sql-password \
  --format "postgresql://scout_admin:{SECRET}@sqltbwaprojectscoutserver.postgres.database.azure.com:5432/scout?sslmode=require"

# 2. Open a PR wiring in the Azure integration changes
/repo cherry . --branch-wire-azure
```

---

## 🔄 Automated Deployment Flow

Once you run those commands:

1. **KeyKey** will inject the real connection string at build time
2. **RepoAgent** will branch & push your bootstrap + docs + end-state spec
3. **GitHub Actions** will pick it up, deploy a Vercel preview
4. **Percy** will snapshot—approve them
5. **Merge** → production goes live with your existing Azure infra

---

## 🎯 What's Been Prepared

### ✅ Azure Integration Complete
- **Key Vault**: `kv-projectscout-prod` configured in KeyKey
- **SQL Server**: `sqltbwaprojectscoutserver` connection string formatted
- **Storage**: `projectscoutdata` mapped in configuration
- **Resource Groups**: `RG-TBWA-ProjectScout-Data` & `RG-TBWA-ProjectScout-Compute`

### ✅ KeyKey Configuration
- **File**: `agents/keykey/agent.yaml`
- **Vault**: `kv-projectscout-prod`
- **Secret**: `sql-password`
- **Format**: PostgreSQL connection string with your actual server

### ✅ Azure Resource Mapping
- **File**: `scout-mvp/azure-data-pipeline/azure-config.sh`
- **All resources**: Mapped to your existing Azure infrastructure
- **Tested**: Configuration verified and working

### ✅ Documentation Package
- **Integration Summary**: `AZURE_INTEGRATION_COMPLETE.md`
- **CLI Commands**: `CLAUDE_CODE_CLI_COMMANDS.md`
- **Setup Guide**: `CREDENTIAL_SETUP_COMPLETE.md`
- **Pre-deployment Check**: `scripts/pre-deployment-check.sh` (all passed ✅)

---

## 🔐 Security & Infrastructure

### Zero Secrets in Git
- All credentials managed through Azure Key Vault
- KeyKey handles secure secret injection at build time
- No manual environment variable management needed

### Existing Infrastructure Reuse
- Uses your current SQL Server in Australia East
- Leverages your Key Vault in East US
- Integrates with your storage account
- No new Azure resources required

---

## 📊 Expected Results

### URLs After Deployment
- **Preview**: `https://scout-dashboard-v4-azure-git-wire-azure.vercel.app`
- **Production**: `https://scout-dashboard-v4-azure.vercel.app`

### Database Connection
- **Server**: `sqltbwaprojectscoutserver.postgres.database.azure.com`
- **Database**: `scout`
- **User**: `scout_admin`
- **Password**: Pulled from `kv-projectscout-prod/sql-password`

---

## 🎉 Ready for Handoff

**Everything is configured and verified. The Scout Dashboard v4.0 Azure integration is ready for Bruno/RepoAgent deployment via Claude Code CLI.**

### Next Steps
1. **Copy the two commands above** into Claude Code CLI
2. **Monitor the automated deployment** pipeline
3. **Approve Percy snapshots** when they're captured
4. **Merge the PR** to deploy to production

### Support
- All configuration files are in place
- Pre-deployment checks passed
- Documentation is complete
- Ready for immediate deployment

---

*Integration completed: June 18, 2025 at 7:24 AM Manila Time*  
*Status: 🎯 READY FOR CLAUDE CODE CLI DEPLOYMENT*
