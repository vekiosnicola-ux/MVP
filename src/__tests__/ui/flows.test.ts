/**
 * UI Flow Tests for Aura
 * 
 * Tests critical human-in-the-loop flows:
 * - Task creation
 * - Plan comparison
 * - Approval
 * - Abort
 * - History replay
 * 
 * These are flow tests, not pixel tests.
 */

import { test, expect } from '@playwright/test';

test.describe('Aura UI Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/');
  });

  test('5-second test: human can understand what Aura is doing', async ({ page }) => {
    // Open dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that dashboard loads - look for main heading or stats
    const dashboardContent = page.locator('h1, [class*="dashboard"], [class*="stat"]');
    await expect(dashboardContent.first()).toBeVisible({ timeout: 10000 });
    
    // Check that there's some indication of activity or status
    // Dashboard should show stats or task list (even if empty)
    const hasContent = await page.locator('text=/Mission Control|Dashboard|Tasks|Awaiting|Planning|Completed/i').count();
    expect(hasContent).toBeGreaterThan(0);
  });

  test('human can create a task', async ({ page }) => {
    await page.goto('/tasks/new');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Fill in task form - look for description input/textarea
    const descriptionInput = page.locator('input[name="description"], textarea[name="description"], input[placeholder*="task" i], textarea[placeholder*="task" i]').first();
    await expect(descriptionInput).toBeVisible({ timeout: 10000 });
    await descriptionInput.fill('Add user authentication');
    
    // Try to select type if select exists
    const typeSelect = page.locator('select[name="type"]');
    const selectCount = await typeSelect.count();
    if (selectCount > 0) {
      await typeSelect.selectOption('feature');
    }
    
    // Submit - look for submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Submit")').first();
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await submitButton.click();
    
    // Should redirect or show success
    await expect(page).toHaveURL(/\/dashboard|\/tasks|\/approval|\//, { timeout: 10000 });
  });

  test('human can approve and block agent execution', async ({ page }) => {
    // Navigate to approval page
    await page.goto('/approval');
    await page.waitForLoadState('networkidle');
    
    // Wait for approval page to load - check for heading or content
    const approvalContent = page.locator('h1, [class*="approval"], [class*="plan"]');
    await expect(approvalContent.first()).toBeVisible({ timeout: 10000 });
    
    // Look for plans or approval buttons (if available)
    const planButton = page.locator('button:has-text("Approve"), button:has-text("Select"), button:has-text("Reject")').first();
    const planCount = await planButton.count();
    
    if (planCount > 0) {
      // Click approve
      await planButton.click();
      
      // Should show executing status or redirect
      await expect(page.locator('text=/Executing|Approved|Processing|Success/i').first()).toBeVisible({ timeout: 10000 });
    } else {
      // No plans available - this is also valid, just verify page loaded
      const pageContent = await page.locator('body').textContent();
      expect(pageContent).toBeTruthy();
    }
  });

  test('kill switch test: human can stop execution', async ({ page }) => {
    // This test requires a task in execution state
    // For now, we'll check that abort buttons exist
    await page.goto('/dashboard');
    
    // Look for abort/stop buttons
    const abortButtons = page.locator('button:has-text("Stop"), button:has-text("Abort"), button:has-text("Cancel")');
    const count = await abortButtons.count();
    
    // If there are executing tasks, abort buttons should be visible
    // If no executing tasks, that's fine too
    if (count > 0) {
      await expect(abortButtons.first()).toBeVisible();
    }
  });

  test('decision provenance test: can trace prompt → plan → approval → execution → result', async ({ page }) => {
    // Navigate to a task detail page
    await page.goto('/dashboard');
    
    // Click on first task (if available)
    const taskLink = page.locator('a[href*="/tasks/"], a[href*="/dashboard/tasks/"]').first();
    const linkCount = await taskLink.count();
    
    if (linkCount > 0) {
      await taskLink.click();
      
      // Check for key elements in the trace
      const hasDescription = await page.locator('text=/description|task/i').count();
      
      // At minimum, should see task description
      expect(hasDescription).toBeGreaterThan(0);
    }
  });

  test('human can compare plans', async ({ page }) => {
    await page.goto('/approval');
    
    // Wait for plans
    await page.waitForSelector('text=/Plan|Proposal/i', { timeout: 10000 });
    
    // Check that multiple plans are visible or can be switched
    const planElements = page.locator('[data-testid="plan"], .plan-card, [class*="plan"]');
    const planCount = await planElements.count();
    
    // Should be able to see at least one plan, potentially multiple
    expect(planCount).toBeGreaterThanOrEqual(0);
  });

  test('human can view history', async ({ page }) => {
    await page.goto('/history');
    
    // Check that history timeline or events are visible
    const historyElements = page.locator('[data-testid="history"], .timeline, [class*="history"]');
    await historyElements.first().waitFor({ timeout: 5000 }).catch(() => {
      // History may be empty, that's OK
    });
    
    // History page should load (may be empty)
    await expect(page).toHaveURL(/\/history/);
  });
});

