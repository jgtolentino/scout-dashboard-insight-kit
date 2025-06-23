#!/bin/bash

# GitHub Notification Management Script
# Helps configure GitHub notifications for optimal CI/CD experience

echo "🔔 GitHub Notification Management Tool"
echo ""

# Function to show current notification settings
show_notification_guide() {
    echo "📱 **NOTIFICATION OPTIMIZATION GUIDE**"
    echo ""
    echo "🎯 **Recommended Settings for CI/CD:**"
    echo ""
    echo "✅ **Keep These Notifications:**"
    echo "  • Failed workflow runs (critical issues need attention)"
    echo "  • Deployment failures (production issues)"
    echo "  • Security alerts (vulnerabilities)"
    echo "  • Pull request reviews (collaboration)"
    echo ""
    echo "❌ **Disable These Notifications:**"
    echo "  • Successful workflow runs (reduces noise)"
    echo "  • Deployment successes (you'll know it worked)"
    echo "  • Pushes to branches (too frequent)"
    echo ""
    echo "⚙️ **How to Configure:**"
    echo ""
    echo "1. **GitHub Web Interface:**"
    echo "   → Go to: https://github.com/settings/notifications"
    echo "   → Under 'Actions': Uncheck 'Successful workflows'"
    echo "   → Under 'Actions': Keep 'Failed workflows' checked"
    echo "   → Under 'Deployments': Keep 'Failed deployments' checked"
    echo ""
    echo "2. **Repository Level:**"
    echo "   → Go to: https://github.com/jgtolentino/scout-dashboard-insight-kit/settings/notifications"
    echo "   → Configure per-repo notification preferences"
    echo ""
    echo "3. **Email Filters (Gmail/Outlook):**
    echo "   → Create filter: from:notifications@github.com AND subject:\"Success\""
    echo "   → Action: Skip inbox, apply label 'GitHub Success'"
    echo ""
    echo "4. **Mobile Notifications:**"
    echo "   → iOS/Android: GitHub app → Settings → Notifications"
    echo "   → Disable 'Workflow runs' for success"
    echo "   → Keep 'Workflow runs' for failures"
    echo ""
}

# Function to create GitHub CLI aliases for quick status checks
setup_github_cli_helpers() {
    echo "🛠️ **Setting up GitHub CLI helpers...**"
    echo ""
    
    # Check if GitHub CLI is installed
    if ! command -v gh &> /dev/null; then
        echo "📦 GitHub CLI not found. Install with:"
        echo "   brew install gh"
        echo "   # or visit: https://cli.github.com/"
        echo ""
        return 1
    fi
    
    echo "✅ GitHub CLI found. Setting up helpful aliases..."
    
    # Create useful aliases
    gh alias set status 'run list --limit 10'
    gh alias set builds 'run list --limit 5 --json status,name,createdAt --template "{{range .}}{{.name}}: {{.status}} ({{timeago .createdAt}}){{\"\\n\"}}{{end}}"'
    gh alias set watch-latest 'run watch $(gh run list --limit 1 --json databaseId --jq ".[0].databaseId")'
    
    echo "✅ GitHub CLI aliases created:"
    echo "  • gh status     - Show recent workflow runs"
    echo "  • gh builds     - Show build status summary"
    echo "  • gh watch-latest - Watch the latest workflow run"
    echo ""
}

# Function to create notification summary script
create_notification_summary() {
    cat > scripts/check-ci-status.sh << 'EOF'
#!/bin/bash

# Quick CI/CD Status Check
echo "🚀 Scout Analytics CI/CD Status"
echo "================================"

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
    echo ""
    echo "📊 Recent Workflow Runs:"
    gh run list --limit 5 --json status,name,createdAt,conclusion --template '{{range .}}{{.name}}: {{.status}} {{if .conclusion}}({{.conclusion}}){{end}} - {{timeago .createdAt}}{{"\n"}}{{end}}'
    
    echo ""
    echo "🔍 Latest Run Details:"
    gh run list --limit 1 --json url,status,conclusion --template '{{range .}}Status: {{.status}} {{if .conclusion}}({{.conclusion}}){{end}}{{"\nURL: "}}{{.url}}{{end}}'
else
    echo "⚠️ GitHub CLI not installed. Install with: brew install gh"
    echo "💡 Or check manually at: https://github.com/jgtolentino/scout-dashboard-insight-kit/actions"
fi

echo ""
echo "🔗 Quick Links:"
echo "  • Actions: https://github.com/jgtolentino/scout-dashboard-insight-kit/actions"
echo "  • Notifications: https://github.com/settings/notifications"
echo "  • Repo Settings: https://github.com/jgtolentino/scout-dashboard-insight-kit/settings"

EOF
    
    chmod +x scripts/check-ci-status.sh
    echo "✅ Created scripts/check-ci-status.sh for quick status checks"
}

# Main execution
main() {
    show_notification_guide
    echo ""
    setup_github_cli_helpers
    echo ""
    create_notification_summary
    echo ""
    echo "🎉 **Notification Management Setup Complete!**"
    echo ""
    echo "📋 **Next Steps:**"
    echo "1. Visit https://github.com/settings/notifications"
    echo "2. Disable successful workflow notifications"
    echo "3. Run: ./scripts/check-ci-status.sh anytime"
    echo "4. Use: gh status for quick GitHub CLI checks"
    echo ""
    echo "💡 **Pro Tip:** Bookmark the notification settings page for easy access!"
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi