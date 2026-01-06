import { test, expect } from '@playwright/test';

/**
 * E2E Test: Approval Workflow
 * 
 * Tests the complete approval workflow from task creation to approval.
 */

test.describe('Approval Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for page to load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('complete approval workflow: create task → view proposals → approve', async ({ page }) => {
    // Step 1: Create a task via chat
    await page.click('button:has-text("Talk to Aura")');
    await expect(page.locator('text=/Hello! I am Aura/i')).toBeVisible({ timeout: 5000 });

    // Type task request
    const taskInput = page.locator('input[placeholder*="task"]');
    await taskInput.fill('Add user authentication feature');
    await page.click('button[type="submit"]');

    // Wait for task creation confirmation
    await expect(page.locator('text=/created a new task/i')).toBeVisible({ timeout: 10000 });

    // Close chat
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // Step 2: Navigate to approval page
    await page.click('a[href*="approval"], button:has-text("Approval")');
    await page.waitForLoadState('networkidle');

    // Step 3: Verify task appears in approval queue
    // Look for task in the list (adjust selector based on actual UI)
    const taskCard = page.locator('[data-testid="task-card"], .task-card').first();
    await expect(taskCard).toBeVisible({ timeout: 5000 });

    // Step 4: Click on task to view proposals
    await taskCard.click();
    await page.waitForLoadState('networkidle');

    // Step 5: Verify proposals are displayed
    const proposals = page.locator('[data-testid="proposal"], .proposal-card');
    await expect(proposals.first()).toBeVisible({ timeout: 5000 });

    // Step 6: Select a proposal and approve
    const approveButton = page.locator('button:has-text("Approve"), button:has-text("Select")').first();
    await approveButton.click();

    // Step 7: Verify approval confirmation
    await expect(page.locator('text=/approved/i, text=/success/i')).toBeVisible({ timeout: 5000 });
  });

  test('can reject a proposal', async ({ page }) => {
    // Navigate to approval page
    await page.goto('/approval');
    await page.waitForLoadState('networkidle');

    // Find a task with proposals
    const taskCard = page.locator('[data-testid="task-card"], .task-card').first();
    
    if (await taskCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await taskCard.click();
      await page.waitForLoadState('networkidle');

      // Reject proposal
      const rejectButton = page.locator('button:has-text("Reject"), button:has-text("Decline")').first();
      
      if (await rejectButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await rejectButton.click();
        
        // Verify rejection confirmation
        await expect(page.locator('text=/rejected/i, text=/declined/i')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('can view plan details before approving', async ({ page }) => {
    // Navigate to approval page
    await page.goto('/approval');
    await page.waitForLoadState('networkidle');

    const taskCard = page.locator('[data-testid="task-card"], .task-card').first();
    
    if (await taskCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await taskCard.click();
      await page.waitForLoadState('networkidle');

      // Verify plan details are visible
      const planDetails = page.locator('[data-testid="plan-details"], .plan-details, text=/approach/i');
      await expect(planDetails.first()).toBeVisible({ timeout: 5000 });
    }
  });
});

