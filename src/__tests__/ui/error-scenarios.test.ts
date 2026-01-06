import { test, expect } from '@playwright/test';

/**
 * E2E Test: Error Scenarios
 * 
 * Tests error handling and edge cases in the UI.
 */

test.describe('Error Scenarios', () => {
  test('handles network error gracefully', async ({ page, context }) => {
    // Simulate network failure
    await context.route('**/api/**', route => route.abort());

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Try to load dashboard
    await page.reload();

    // Should show error message or handle gracefully
    const errorMessage = page.locator('text=/error/i, text=/failed/i, text=/try again/i');
    
    // Either error is shown or page loads with empty state
    const hasError = await errorMessage.isVisible({ timeout: 2000 }).catch(() => false);
    const hasEmptyState = await page.locator('text=/no tasks/i, text=/empty/i').isVisible({ timeout: 2000 }).catch(() => false);
    
    expect(hasError || hasEmptyState).toBe(true);
  });

  test('handles invalid API response', async ({ page, context }) => {
    // Mock invalid API response
    await context.route('**/api/tasks', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ invalid: 'data' }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should handle invalid response gracefully
    // Either shows error or empty state
    const hasError = await page.locator('text=/error/i').isVisible({ timeout: 2000 }).catch(() => false);
    const hasEmptyState = await page.locator('text=/no tasks/i').isVisible({ timeout: 2000 }).catch(() => false);
    
    expect(hasError || hasEmptyState).toBe(true);
  });

  test('handles empty task list', async ({ page, context }) => {
    // Mock empty response
    await context.route('**/api/tasks', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should show empty state
    const emptyState = page.locator('text=/no tasks/i, text=/empty/i, text=/create/i');
    await expect(emptyState.first()).toBeVisible({ timeout: 5000 });
  });

  test('handles chat API error', async ({ page, context }) => {
    // Mock chat API error
    await context.route('**/api/agent/interact', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open chat
    await page.click('button:has-text("Talk to Aura")');
    await expect(page.locator('text=/Hello! I am Aura/i')).toBeVisible({ timeout: 5000 });

    // Send message
    const input = page.locator('input[placeholder*="task"]');
    await input.fill('Test message');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/error/i, text=/went wrong/i, text=/try again/i')).toBeVisible({ timeout: 5000 });
  });

  test('handles slow API response', async ({ page, context }) => {
    // Mock slow response
    await context.route('**/api/tasks', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }, 3000);
    });

    await page.goto('/');
    
    // Should show loading state
    const loading = page.locator('text=/loading/i, [data-testid="loading"]');
    await expect(loading.first()).toBeVisible({ timeout: 2000 });
  });
});

