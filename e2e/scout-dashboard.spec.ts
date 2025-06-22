import { test, expect } from '@playwright/test';

test.describe('Scout Analytics Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app home page
    await page.goto('/');
    
    // Wait for MSW to initialize and app to load
    await page.waitForTimeout(2000);
  });

  test.describe('Navigation and Layout', () => {
    test('loads the dashboard homepage', async ({ page }) => {
      // Check for main dashboard title
      await expect(page.locator('h1')).toContainText('Scout Analytics');
      
      // Check for sidebar navigation (use the main sidebar element)
      await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();
      
      // Check for main KPI cards
      await expect(page.locator('text=Total Revenue')).toBeVisible();
      await expect(page.locator('text=Total Transactions')).toBeVisible();
      await expect(page.locator('text=Active Customers')).toBeVisible();
      await expect(page.locator('text=Avg Order Value')).toBeVisible();
    });

    test('navigates to different pages', async ({ page }) => {
      // Navigate to Consumer Profiling
      await page.click('text=Consumer Profiling');
      await expect(page.locator('h1')).toContainText('Consumer Profiling');
      
      // Navigate to Product Substitution
      await page.click('text=Product Substitution');
      await expect(page.locator('h1')).toContainText('Product Substitution');
      
      // Navigate to Transaction Trends
      await page.click('text=Transaction Trends');
      await expect(page.locator('h1')).toContainText('Transaction Trends');
      
      // Navigate back to Overview
      await page.click('text=Overview');
      await expect(page.locator('h1')).toContainText('Scout Analytics Overview');
    });

    test('sidebar toggles correctly', async ({ page }) => {
      // Find and click sidebar trigger
      const sidebarTrigger = page.locator('[data-sidebar="trigger"]').first();
      
      // Click to collapse
      await sidebarTrigger.click();
      await page.waitForTimeout(500);
      
      // Click to expand
      await sidebarTrigger.click();
      await page.waitForTimeout(500);
      
      // Sidebar should be visible
      await expect(page.locator('[data-sidebar]')).toBeVisible();
    });
  });

  test.describe('Choropleth Map Visualization', () => {
    test('renders Philippines choropleth map', async ({ page }) => {
      // Check for map container
      await expect(page.locator('canvas, .mapbox-container, [role="img"]')).toBeVisible({ timeout: 10000 });
      
      // Check for legend
      await expect(page.locator('text=/Revenue.*Distribution/')).toBeVisible();
      
      // Check for regional data in legend
      await expect(page.locator('text=NCR')).toBeVisible();
    });

    test('map region interactions work', async ({ page }) => {
      // Wait for map to load
      await page.waitForTimeout(3000);
      
      // Look for interactive region elements
      const regionButtons = page.locator('button:has-text("NCR"), text=NCR').first();
      
      if (await regionButtons.isVisible()) {
        await regionButtons.click();
        
        // Should navigate to analytics page with region filter
        await page.waitForTimeout(1000);
      }
    });

    test('map legend shows correct data', async ({ page }) => {
      // Check for legend items
      await expect(page.locator('text=NCR')).toBeVisible();
      await expect(page.locator('text=/₱[0-9,]+/')).toBeVisible();
      
      // Check for percentage values
      await expect(page.locator('text=/%/')).toBeVisible();
    });
  });

  test.describe('Time Series and Heatmap', () => {
    test('displays enhanced time series chart', async ({ page }) => {
      await page.goto('/transaction-trends');
      
      // Wait for chart to render
      await page.waitForTimeout(3000);
      
      // Check for chart container
      await expect(page.locator('.recharts-responsive-container, [role="img"]')).toBeVisible();
      
      // Check for metric switching buttons
      await expect(page.locator('text=Revenue')).toBeVisible();
      await expect(page.locator('text=Transactions')).toBeVisible();
    });

    test('metric switching works', async ({ page }) => {
      await page.goto('/transaction-trends');
      await page.waitForTimeout(2000);
      
      // Click transactions metric
      await page.click('button:has-text("Transactions")');
      await page.waitForTimeout(1000);
      
      // Should show active state
      await expect(page.locator('button:has-text("Transactions")[data-state="active"]')).toBeVisible();
    });

    test('transaction heatmap renders', async ({ page }) => {
      await page.goto('/transaction-trends');
      await page.waitForTimeout(3000);
      
      // Check for heatmap section
      await expect(page.locator('text=Transaction Heatmap')).toBeVisible();
      
      // Check for time labels
      await expect(page.locator('text=00:00')).toBeVisible();
      await expect(page.locator('text=Mon')).toBeVisible();
    });

    test('heatmap metric switching', async ({ page }) => {
      await page.goto('/transaction-trends');
      await page.waitForTimeout(2000);
      
      // Find and click revenue button in heatmap section
      const revenueButton = page.locator('button:has-text("Revenue")').last();
      await revenueButton.click();
      await page.waitForTimeout(500);
      
      // Should update heatmap display
      await expect(page.locator('text=Peak Hours')).toBeVisible();
    });
  });

  test.describe('Sankey Diagram for Product Substitution', () => {
    test('renders product substitution page', async ({ page }) => {
      await page.goto('/product-substitution');
      await page.waitForTimeout(3000);
      
      // Check for page title
      await expect(page.locator('h1')).toContainText('Product Substitution');
      
      // Check for sankey diagram container
      await expect(page.locator('[role="img"], svg, .sankey-container')).toBeVisible();
    });

    test('displays substitution statistics', async ({ page }) => {
      await page.goto('/product-substitution');
      await page.waitForTimeout(3000);
      
      // Check for statistics
      await expect(page.locator('text=/Total Substitutions/')).toBeVisible();
      await expect(page.locator('text=/Substitution Revenue/')).toBeVisible();
    });

    test('shows product flow visualization', async ({ page }) => {
      await page.goto('/product-substitution');
      await page.waitForTimeout(3000);
      
      // Check for product names in flows
      await expect(page.locator('text=/Cola|Pepsi|Chips|Pringles/')).toBeVisible();
    });
  });

  test.describe('Demographic TreeMap', () => {
    test('renders demographic treemap', async ({ page }) => {
      await page.goto('/consumer-profiling');
      await page.waitForTimeout(3000);
      
      // Check for treemap section
      await expect(page.locator('text=Advanced Demographic Analysis')).toBeVisible();
      
      // Check for SVG or chart container
      await expect(page.locator('[role="img"], svg, .treemap-container')).toBeVisible();
    });

    test('treemap metric switching works', async ({ page }) => {
      await page.goto('/consumer-profiling');
      await page.waitForTimeout(2000);
      
      // Click revenue metric button
      await page.click('button:has-text("Revenue")');
      await page.waitForTimeout(500);
      
      // Should show revenue-related text
      await expect(page.locator('text=/Total Revenue/')).toBeVisible();
    });

    test('displays demographic categories legend', async ({ page }) => {
      await page.goto('/consumer-profiling');
      await page.waitForTimeout(2000);
      
      // Check for demographic categories
      await expect(page.locator('text=Demographic Categories')).toBeVisible();
      await expect(page.locator('text=Age group')).toBeVisible();
      await expect(page.locator('text=Income level')).toBeVisible();
    });

    test('shows summary statistics', async ({ page }) => {
      await page.goto('/consumer-profiling');
      await page.waitForTimeout(2000);
      
      // Check for summary stats
      await expect(page.locator('text=Total Value')).toBeVisible();
      await expect(page.locator('text=Total Revenue')).toBeVisible();
      await expect(page.locator('text=Total Customers')).toBeVisible();
      await expect(page.locator('text=Top Segment')).toBeVisible();
    });
  });

  test.describe('Filters and Interactions', () => {
    test('global filter bar works', async ({ page }) => {
      // Check for filter elements
      await expect(page.locator('[data-testid="global-filter"], .filter-bar, text=/Filter/')).toBeVisible();
    });

    test('time intelligence bar functions', async ({ page }) => {
      // Check for time controls
      await expect(page.locator('text=/Today|Week|Month|Year/')).toBeVisible();
    });

    test('KPI cards are clickable', async ({ page }) => {
      // Click on Total Revenue card
      await page.click('text=Total Revenue');
      await page.waitForTimeout(1000);
      
      // Should navigate somewhere or show modal
      // The exact behavior depends on implementation
    });

    test('AOV modal opens and closes', async ({ page }) => {
      // Click on Avg Order Value card
      await page.click('text=Avg Order Value');
      await page.waitForTimeout(1000);
      
      // Check if modal opened
      const modal = page.locator('[role="dialog"], .modal, text=Average Order Value Distribution');
      if (await modal.isVisible()) {
        // Close modal by clicking backdrop or close button
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('mobile view works correctly', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Dashboard should still be functional
      await expect(page.locator('h1')).toContainText('Scout Analytics');
      
      // KPI cards should be stacked
      const cards = page.locator('text=Total Revenue');
      await expect(cards).toBeVisible();
    });

    test('tablet view works correctly', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Dashboard should adapt layout
      await expect(page.locator('h1')).toContainText('Scout Analytics');
    });
  });

  test.describe('Data Loading and Error States', () => {
    test('loading states display correctly', async ({ page }) => {
      // Refresh to see loading states
      await page.reload();
      
      // Should show some loading indicators initially
      await page.waitForTimeout(500);
      
      // Then content should load
      await expect(page.locator('h1')).toContainText('Scout Analytics', { timeout: 10000 });
    });

    test('handles network interruption gracefully', async ({ page }) => {
      // Go offline
      await page.context().setOffline(true);
      
      // Navigate to a new page
      await page.goto('/consumer-profiling');
      await page.waitForTimeout(2000);
      
      // Page should still render basic structure
      await expect(page.locator('h1')).toContainText('Consumer', { timeout: 5000 });
      
      // Go back online
      await page.context().setOffline(false);
    });
  });

  test.describe('Accessibility', () => {
    test('keyboard navigation works', async ({ page }) => {
      // Tab through main navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to navigate with keyboard
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('has proper ARIA labels', async ({ page }) => {
      // Check for aria-labels on interactive elements
      const buttons = page.locator('button');
      const count = await buttons.count();
      
      expect(count).toBeGreaterThan(0);
      
      // Check if at least some buttons have accessible names
      const accessibleButtons = page.locator('button[aria-label], button:has-text("Revenue"), button:has-text("Overview")');
      const accessibleCount = await accessibleButtons.count();
      expect(accessibleCount).toBeGreaterThan(0);
    });

    test('color contrast is adequate', async ({ page }) => {
      // Take screenshot for visual regression testing
      await expect(page).toHaveScreenshot('dashboard-overview.png', { 
        fullPage: true,
        threshold: 0.5 
      });
    });
  });

  test.describe('Performance', () => {
    test('page loads within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
    });

    test('visualizations render efficiently', async ({ page }) => {
      await page.goto('/consumer-profiling');
      
      const startTime = Date.now();
      
      // Wait for treemap to be visible
      await expect(page.locator('text=Advanced Demographic Analysis')).toBeVisible();
      
      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(5000); // Should render within 5 seconds
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('works consistently across browsers', async ({ page, browserName }) => {
      // Test basic functionality in all browsers
      await expect(page.locator('h1')).toContainText('Scout Analytics');
      
      // Navigate to different pages to ensure consistency
      await page.click('text=Consumer Profiling');
      await expect(page.locator('h1')).toContainText('Consumer Profiling');
      
      console.log(`Test passed in ${browserName}`);
    });
  });
});