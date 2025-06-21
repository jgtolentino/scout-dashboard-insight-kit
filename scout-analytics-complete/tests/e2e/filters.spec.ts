import { test, expect } from '@playwright/test';

test('Global filters persist in URL', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Category');
  await page.click('text=Dairy');
  await expect(page).toHaveURL(/categories=Dairy/);
});
