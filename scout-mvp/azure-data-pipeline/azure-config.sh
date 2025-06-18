#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# 🔧 AZURE RESOURCE CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════
# Configuration for existing Azure resources

export RG="RG-TBWA-ProjectScout-Data"
export RG_COMPUTE="RG-TBWA-ProjectScout-Compute"
export SQL_SERVER="sqltbwaprojectscoutserver"
export KEY_VAULT="kv-projectscout-prod"
export ST_STORAGE="projectscoutdata"
export ST_CONTAINER="scout-data"
export DBX_WORKSPACE="adb-scout-prod"
export AOAI_NAME="aoai-scout-prod"
export SQL_ADMIN_USER="TBWA"

echo "✅ Azure resource configuration loaded"
echo "  📦 Resource Group: $RG"
echo "  🗄️ SQL Server: $SQL_SERVER"
echo "  🔐 Key Vault: $KEY_VAULT"
echo "  🗂️ Storage: $ST_STORAGE"
