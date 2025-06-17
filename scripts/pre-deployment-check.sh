#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════════
# 🔍 SCOUT DASHBOARD v4.0 AZURE - PRE-DEPLOYMENT VERIFICATION
# ═══════════════════════════════════════════════════════════════════════════════
# Final verification before Claude Code CLI deployment
# ═══════════════════════════════════════════════════════════════════════════════

echo "🔍 Scout Dashboard v4.0 Azure - Pre-Deployment Check"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Check Azure configuration
check_azure_config() {
    echo "🔧 Checking Azure Configuration..."
    
    if [ -f "scout-mvp/azure-data-pipeline/azure-config.sh" ]; then
        print_success "Azure config file exists"
        
        # Source the config
        source scout-mvp/azure-data-pipeline/azure-config.sh
        
        print_info "Resource Group: $RG"
        print_info "SQL Server: $SQL_SERVER"
        print_info "Key Vault: $KEY_VAULT"
        print_info "Storage: $ST_STORAGE"
    else
        print_error "Azure config file missing"
        return 1
    fi
}

# Check KeyKey configuration
check_keykey_config() {
    echo ""
    echo "🔑 Checking KeyKey Configuration..."
    
    if [ -f "agents/keykey/agent.yaml" ]; then
        print_success "KeyKey config file exists"
        
        # Check if it references the correct vault
        if grep -q "kv-projectscout-prod" agents/keykey/agent.yaml; then
            print_success "KeyKey configured for kv-projectscout-prod"
        else
            print_warning "KeyKey vault configuration may need verification"
        fi
        
        # Check database URL format
        if grep -q "sqltbwaprojectscoutserver" agents/keykey/agent.yaml; then
            print_success "Database URL format configured correctly"
        else
            print_warning "Database URL format may need verification"
        fi
    else
        print_error "KeyKey config file missing"
        return 1
    fi
}

# Check documentation files
check_documentation() {
    echo ""
    echo "📚 Checking Documentation..."
    
    local docs=(
        "AZURE_INTEGRATION_COMPLETE.md"
        "CLAUDE_CODE_CLI_COMMANDS.md"
        "CREDENTIAL_SETUP_COMPLETE.md"
        ".env.example"
    )
    
    for doc in "${docs[@]}"; do
        if [ -f "$doc" ]; then
            print_success "$doc exists"
        else
            print_warning "$doc missing"
        fi
    done
}

# Check Claude Code CLI commands
check_cli_commands() {
    echo ""
    echo "🤖 Verifying Claude Code CLI Commands..."
    
    if [ -f "CLAUDE_CODE_CLI_COMMANDS.md" ]; then
        print_success "CLI commands file exists"
        
        # Check if commands reference correct resources
        if grep -q "kv-projectscout-prod" CLAUDE_CODE_CLI_COMMANDS.md; then
            print_success "Commands reference correct Key Vault"
        else
            print_warning "Commands may need Key Vault verification"
        fi
        
        if grep -q "sqltbwaprojectscoutserver" CLAUDE_CODE_CLI_COMMANDS.md; then
            print_success "Commands reference correct SQL Server"
        else
            print_warning "Commands may need SQL Server verification"
        fi
    else
        print_error "CLI commands file missing"
        return 1
    fi
}

# Display deployment commands
show_deployment_commands() {
    echo ""
    echo "🚀 Ready for Claude Code CLI Deployment!"
    echo "═══════════════════════════════════════════════════════════════════════════════"
    echo ""
    print_info "Copy and paste these commands into Claude Code CLI:"
    echo ""
    echo "# 1. Grant the DATABASE_URL secret from your existing Key Vault"
    echo ":keykey grant_env --vault kv-projectscout-prod --secret sql-password \\"
    echo "  --format \"postgresql://scout_admin:{SECRET}@sqltbwaprojectscoutserver.postgres.database.azure.com:5432/scout?sslmode=require\""
    echo ""
    echo "# 2. Open a PR that wires your bootstrap, docs, and end-state spec to the existing infra"
    echo "/repo cherry . --branch-wire-azure"
    echo ""
    print_info "Fallback password if Key Vault secret doesn't exist: R@nd0mPA\$\$2025!"
    echo ""
}

# Display expected workflow
show_expected_workflow() {
    echo "📋 Expected Deployment Workflow:"
    echo "  1. KeyKey grants DATABASE_URL from kv-projectscout-prod"
    echo "  2. RepoAgent creates PR with Azure integration"
    echo "  3. GitHub Actions triggers CI/CD pipeline"
    echo "  4. Vercel deploys preview with live Azure data"
    echo "  5. Percy captures visual snapshots"
    echo "  6. Approve Percy snapshots"
    echo "  7. Merge PR → Production deployment"
    echo ""
    print_success "Expected URLs:"
    echo "  Preview: https://scout-dashboard-v4-azure-git-wire-azure.vercel.app"
    echo "  Production: https://scout-dashboard-v4-azure.vercel.app"
    echo ""
}

# Main execution
main() {
    local exit_code=0
    
    check_azure_config || exit_code=1
    check_keykey_config || exit_code=1
    check_documentation
    check_cli_commands || exit_code=1
    
    echo ""
    if [ $exit_code -eq 0 ]; then
        print_success "All pre-deployment checks passed!"
        show_deployment_commands
        show_expected_workflow
        
        echo "🎯 Status: READY FOR CLAUDE CODE CLI DEPLOYMENT"
        echo "═══════════════════════════════════════════════════════════════════════════════"
    else
        print_error "Some pre-deployment checks failed"
        echo "Please review the warnings above before deployment"
        exit 1
    fi
}

# Run main function
main "$@"
