# 🎭 VisualDiffAgent - Self-Hosted Visual Regression Testing

**A self-hosted visual regression testing agent using Playwright and pixelmatch for pixel-perfect comparisons.**

## 🎯 Overview

VisualDiffAgent is a first-class AI agent that captures full-page screenshots via Playwright and compares them pixel-by-pixel against checked-in baselines using pixelmatch. It fails CI on visual regressions that exceed the configured threshold.

## ✨ Features

- **🎭 Self-hosted** - No external dependencies or accounts required
- **📸 Full-page screenshots** - Captures complete page layouts
- **🔍 Pixel-perfect comparisons** - Uses pixelmatch for precise diff detection
- **📊 Configurable thresholds** - Set acceptable diff percentages
- **🎨 Visual diff images** - Generates highlighted diff images for review
- **🔒 Git-based baselines** - Visual baselines stored in your repository
- **⚡ CI/CD ready** - Integrates seamlessly with GitHub Actions
- **🎯 Scout Dashboard optimized** - Pre-configured for all dashboard pages

## 🚀 Usage

### Capture Baselines

```bash
# Capture baselines for all Scout Dashboard pages
/visual-diff baseline

# Capture baselines for specific URLs
/visual-diff baseline --urls "/" "/trends" "/products"
```

### Run Visual Tests

```bash
# Test all pages against baselines
/visual-diff test

# Test specific URLs
/visual-diff test --urls "/" "/trends"
```

## 📋 Scout Dashboard Pages

The agent is pre-configured to test these Scout Dashboard pages:

- `/` - Executive Summary
- `/trends` - Transaction Trends
- `/products` - Product Mix & SKU Dynamics
- `/behaviour` - Consumer Behaviour & Preference
- `/consumers` - Consumer Profiling

## 🔧 Configuration

### Environment Variables

- `PREVIEW_URL` - Base URL for testing (e.g., Vercel preview URL)
- `VERCEL_URL` - Alternative base URL (auto-detected in Vercel)

### Thresholds

- **Default threshold**: 10% pixel difference allowed
- **Configurable** in the agent implementation
- **Per-page customization** possible

## 📁 Directory Structure

```
visual-baseline/     # Baseline screenshots (committed to Git)
├── root.png        # Homepage baseline
├── _trends.png     # Trends page baseline
├── _products.png   # Products page baseline
├── _behaviour.png  # Behaviour page baseline
└── _consumers.png  # Consumers page baseline

visual-current/      # Current screenshots (temporary)
├── root.png        # Current homepage
└── ...

visual-diffs/        # Diff images (when regressions detected)
├── root_diff.png   # Highlighted differences
└── ...
```

## 🎨 Visual Diff Output

When regressions are detected, the agent generates:

1. **Markdown report** with pass/fail status for each page
2. **Diff images** highlighting pixel differences in red
3. **Percentage calculations** showing exact diff amounts
4. **Actionable recommendations** for next steps

### Example Report

```markdown
# 🎭 Visual Diff Report

- ✅ **/**: 0.05% diff (within threshold)
- ❌ **/trends**: 12.34% diff (> 10%) — [View diff](visual-diffs/_trends_diff.png)
- ✅ **/products**: 2.15% diff (within threshold)

## Summary

✅ Passed: 2/3 pages
❌ Failed: Visual regressions detected

**Action required:** Review diff images and update baselines if changes are intentional
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
jobs:
  visual-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install Dependencies
        run: npm ci
      - name: Run Visual Regression Test
        run: npx pulser run visual-diff test
        env:
          PREVIEW_URL: ${{ steps.deploy-preview.outputs.url }}
```

### Baseline Management

```bash
# Update baselines after intentional UI changes
/visual-diff baseline
git add visual-baseline/*
git commit -m "chore: update visual baselines for new UI"
git push
```

## 🛠 Technical Details

### Dependencies

- **Playwright** - Browser automation and screenshot capture
- **pixelmatch** - Pixel-by-pixel image comparison
- **pngjs** - PNG image processing

### Browser Configuration

- **Headless Chrome** - Consistent rendering environment
- **1280x720 viewport** - Standard desktop resolution
- **Network idle wait** - Ensures complete page load
- **Animation disabled** - Prevents timing-based flakiness

### Performance

- **Parallel execution** - Tests multiple pages concurrently
- **Efficient storage** - Only stores baselines and diffs
- **Fast comparisons** - Optimized pixelmatch configuration

## 🔒 Security

- **Hash-locked agent** - Integrity verification via SHA256
- **No external dependencies** - Completely self-contained
- **Git-based storage** - Baselines tracked in version control
- **No secrets required** - No tokens or API keys needed

## 🎯 Agent Configuration

```yaml
id: visual-diff
name: VisualDiffAgent
permissions:
  - fs:project        # Read/write project files
  - bash:execute      # Run Playwright commands
  - test:execute      # Execute test suites
triggers:
  - "/visual-diff baseline"
  - "/visual-diff test"
outputs:
  - report_markdown   # Test results in Markdown
  - exit_code        # Pass/fail status
```

## 🚀 Getting Started

1. **Agent is already configured** in your monorepo
2. **Capture initial baselines** for your deployed site
3. **Run tests on every PR** to catch regressions
4. **Review diff images** when tests fail
5. **Update baselines** when changes are intentional

## 🎉 Benefits

### vs. Percy/External Services

- ✅ **No subscription costs** - Completely free
- ✅ **No usage limits** - Test as much as you want
- ✅ **Full control** - Own your testing pipeline
- ✅ **No vendor lock-in** - Self-hosted solution
- ✅ **Git integration** - Baselines in version control

### vs. Manual Testing

- ✅ **Automated detection** - Catches subtle regressions
- ✅ **Pixel-perfect accuracy** - No human error
- ✅ **Consistent testing** - Same conditions every time
- ✅ **Scalable** - Test multiple pages simultaneously
- ✅ **CI integration** - Blocks bad deployments

---

**🎭 VisualDiffAgent: Self-hosted visual regression testing for Scout Dashboard**

*No external dependencies • Pixel-perfect accuracy • Git-based baselines*
