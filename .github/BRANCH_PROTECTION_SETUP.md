# Branch Protection & Verification Setup for Scout Analytics

## Overview

This guide implements "green = go" verification policies to ensure no code moves to production without **proven success** in all pipeline stages.

## 🛡️ GitHub Branch Protection Rules

### 1. Required Status Checks Setup

Go to **Settings → Branches → Add rule** for `main` branch:

#### **Protection Rules to Enable:**
- ✅ **Require a pull request before merging**
- ✅ **Require status checks to pass before merging**
- ✅ **Require branches to be up to date before merging**
- ✅ **Include administrators** (no bypassing rules)

#### **Required Status Checks:**
```
Scout Analytics CI/CD / build-and-test
Scout Analytics CI/CD / deploy-preview  
Scout Analytics CI/CD / e2e-tests
Scout Analytics CI/CD / security-scan
```

### 2. Additional Protection Settings

```yaml
# .github/settings.yml (if using Probot)
repository:
  has_issues: true
  has_projects: true
  has_wiki: false
  has_downloads: true
  default_branch: main

branches:
  - name: main
    protection:
      required_status_checks:
        strict: true
        contexts:
          - "Scout Analytics CI/CD / build-and-test"
          - "Scout Analytics CI/CD / deploy-preview"
          - "Scout Analytics CI/CD / e2e-tests"
          - "Scout Analytics CI/CD / security-scan"
      enforce_admins: true
      required_pull_request_reviews:
        required_approving_review_count: 1
        dismiss_stale_reviews: true
        require_code_owner_reviews: false
      restrictions: null
```

## 🔍 Azure DevOps Build Policies

### 1. Branch Policy Configuration

Navigate to **Repos → Branches → main → Branch policies**:

#### **Build Validation Policies:**
- ✅ **Build pipeline**: `Scout Analytics Pipeline`
- ✅ **Trigger**: Automatic (immediate)
- ✅ **Policy requirement**: Required
- ✅ **Build expiration**: 12 hours
- ✅ **Display name**: "Scout Analytics - All Tests Must Pass"

#### **Status Check Policy:**
```yaml
# Required checks that must pass:
- Build and unit tests
- TypeScript compilation  
- ESLint validation
- E2E tests (preview environment)
- Security scan (CodeQL)
- Performance tests
```

### 2. Pull Request Policies

```yaml
# Additional PR requirements:
- Minimum reviewers: 1
- Check for linked work items: Optional
- Check for comment resolution: Required
- Limit merge types: Squash merge only
```

## 📊 Enhanced Test Result Publishing

### Updated Pipeline Configuration

Both Azure DevOps and GitHub Actions now include:
- ✅ **JUnit XML test output** for detailed test reporting
- ✅ **Test result publishing** with pass/fail breakdown
- ✅ **Fail-fast behavior** - pipeline stops on test failures
- ✅ **Always publish results** even if tests fail (for debugging)

### Test Configuration

Add to `package.json`:
```json
{
  "devDependencies": {
    "jest-junit": "^16.0.0"
  },
  "jest": {
    "reporters": [
      "default",
      ["jest-junit", {
        "outputDirectory": "test-results",
        "outputName": "junit.xml"
      }]
    ]
  }
}
```

### Azure DevOps Test Publishing

```yaml
- task: PublishTestResults@2
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: 'test-results/junit.xml'
    mergeTestResults: true
    failTaskOnFailedTests: true
    testRunTitle: 'Unit Tests'
  displayName: 'Publish unit test results'
  condition: always()
```

### GitHub Actions Test Publishing

```yaml
- name: 📊 Publish test results
  uses: dorny/test-reporter@v1
  if: always()
  with:
    name: Unit Tests
    path: test-results/junit.xml
    reporter: jest-junit
    fail-on-error: true
```

## 🚨 Verification Gates

### 1. Pre-Deployment Verification

**Before ANY deployment happens:**
```yaml
# Health check endpoint validation
- name: 🏥 Health check verification
  run: |
    echo "Verifying build artifacts are healthy..."
    npm run build:verify
    
    # Test that critical endpoints will work
    echo "Testing API configuration..."
    node scripts/verify-api-config.js
    
    # Validate environment variables
    echo "Checking environment configuration..."
    node scripts/validate-env.js
```

### 2. Post-Deployment Verification

**After deployment, before marking success:**
```yaml
# Smoke tests on deployed environment
- name: 🔥 Smoke tests
  run: |
    # Wait for deployment to be ready
    timeout 300 bash -c 'until curl -f $DEPLOY_URL/health; do sleep 5; done'
    
    # Critical path testing
    curl -f $DEPLOY_URL/api/health || exit 1
    curl -f $DEPLOY_URL/api/insights || exit 1
    
    # Performance baseline
    curl -w "%{time_total}" $DEPLOY_URL/ | awk '{if($1 > 3.0) exit 1}'
```

### 3. E2E Verification Requirements

**Playwright tests must verify:**
- ✅ **Login flow** works end-to-end
- ✅ **Dashboard loads** within 3 seconds
- ✅ **API calls** return valid data (not 404s)
- ✅ **AI Chat** responds correctly
- ✅ **Data visualization** renders without errors
- ✅ **Mobile responsiveness** works

## 🏷️ Status Badges

### README Badges for Transparency

```markdown
<!-- In README.md -->

## Build Status

![GitHub Actions](https://github.com/jgtolentino/scout-dashboard-insight-kit/actions/workflows/ci-cd.yml/badge.svg)

![Azure DevOps](https://dev.azure.com/tbwa/scout-analytics/_apis/build/status/scout-dashboard-pipeline?branchName=main)

[![Deploy Status](https://img.shields.io/badge/deploy-passing-brightgreen)](https://scout-analytics-dashboard.azurewebsites.net)

[![Test Coverage](https://img.shields.io/badge/coverage-85%25-green)](https://github.com/jgtolentino/scout-dashboard-insight-kit/actions)
```

### Dashboard URLs with Status

```markdown
## Live Environments

| Environment | URL | Status | Last Deploy |
|-------------|-----|--------|-------------|
| 🟢 **Production** | [scout-analytics-dashboard.azurewebsites.net](https://scout-analytics-dashboard.azurewebsites.net) | ![Status](https://img.shields.io/badge/status-online-green) | ![Deploy](https://img.shields.io/github/last-commit/jgtolentino/scout-dashboard-insight-kit/main) |
| 🟡 **Preview** | [scout-analytics-dashboard-preview.azurewebsites.net](https://scout-analytics-dashboard-preview.azurewebsites.net) | ![Status](https://img.shields.io/badge/status-online-green) | ![Deploy](https://img.shields.io/github/last-commit/jgtolentino/scout-dashboard-insight-kit/develop) |
```

## 📱 Notifications Setup

### 1. GitHub Notifications

```yaml
# .github/workflows/notify.yml
name: Deployment Notifications

on:
  workflow_run:
    workflows: ["Scout Analytics CI/CD"]
    types: [completed]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Notify on success
        if: ${{ github.event.workflow_run.conclusion == 'success' }}
        run: |
          echo "🎉 Deployment successful!"
          # Add Slack/Teams webhook here
          
      - name: Notify on failure  
        if: ${{ github.event.workflow_run.conclusion == 'failure' }}
        run: |
          echo "❌ Deployment failed!"
          # Add alert webhook here
```

### 2. Azure DevOps Notifications

Configure in **Project Settings → Notifications**:
- ✅ **Build completion** → Email/Teams channel
- ✅ **Build failure** → Immediate alert
- ✅ **Pull request** → Code review notifications

## 🧪 Test Result Monitoring

### 1. Pipeline Test Dashboard

**Azure DevOps:**
- Navigate to **Pipelines → Your Pipeline → Tests**
- View test trends over time
- Identify flaky tests
- Monitor test execution time

**GitHub Actions:**
- Check **Actions → Workflow run → Tests tab**
- Download test artifacts for detailed analysis
- Use test-reporter action for rich UI

### 2. Test Quality Gates

```yaml
# Quality gates that must pass:
minimum_test_coverage: 80%
maximum_test_execution_time: 300s  # 5 minutes
zero_failing_tests: required
zero_flaky_tests: target
e2e_success_rate: 95%
```

## ✅ Verification Checklist

### Before Claiming "Fixed"

- [ ] **Local build** passes without warnings
- [ ] **All unit tests** pass locally
- [ ] **ESLint** shows no errors
- [ ] **TypeScript** compiles without errors
- [ ] **E2E tests** pass in preview environment
- [ ] **Smoke tests** verify deployed app works
- [ ] **API endpoints** return expected data (not 404s)
- [ ] **Performance** meets baseline requirements
- [ ] **Security scan** shows no critical issues

### PR Merge Requirements

- [ ] **All status checks** show green ✅
- [ ] **Preview deployment** accessible and working
- [ ] **Code review** approved
- [ ] **No merge conflicts** with main branch
- [ ] **Branch protection** rules satisfied

### Production Deployment Verification

- [ ] **Managed Identity** authentication working
- [ ] **Production API** endpoints responding correctly
- [ ] **Database connectivity** verified
- [ ] **Key Vault** secrets accessible
- [ ] **Azure OpenAI** integration functional
- [ ] **Performance monitoring** shows healthy metrics

## 🚨 Emergency Procedures

### Rollback Protocol

If production deployment fails verification:

```bash
# Immediate rollback
az webapp deployment slot swap \
  --name scout-analytics-dashboard \
  --resource-group scout-dashboard-rg \
  --slot staging \
  --target-slot production

# Verify rollback success
curl -f https://scout-analytics-dashboard.azurewebsites.net/health
```

### Incident Response

1. **Stop all deployments** until issue is resolved
2. **Notify stakeholders** via configured channels
3. **Create incident issue** with detailed logs
4. **Root cause analysis** before any new deployments
5. **Update verification gates** to prevent similar issues

---

## 🎯 Bottom Line

> **NO GREEN CHECK = NO MERGE = NO DEPLOYMENT**

With these protections in place:
- ✅ **Impossible to merge** failing code to main
- ✅ **Impossible to deploy** without all tests passing  
- ✅ **Impossible to ignore** test failures
- ✅ **Full visibility** into what's working/broken
- ✅ **Automatic rollback** on production issues

**Result**: Only verified, tested, working code reaches production! 🛡️