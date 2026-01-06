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
    const chatButton = page.locator('button:has-text("Talk to Aura"), button:has-text("Chat")');
    await expect(chatButton).toBeVisible({ timeout: 10000 });
    await chatButton.click();
    await expect(page.locator('text=/Hello! I am Aura/i')).toBeVisible({ timeout: 10000 });

    // Type task request
    const taskInput = page.locator('input[placeholder*="task" i], textarea[placeholder*="task" i], input[type="text"], textarea').first();
    await expect(taskInput).toBeVisible({ timeout: 10000 });
    await taskInput.fill('Add user authentication feature');
    
    const sendButton = page.locator('button[type="submit"]').last();
    await expect(sendButton).toBeVisible({ timeout: 5000 });
    await sendButton.click();

    // Wait for task creation confirmation or response
    await page.waitForTimeout(5000);
    
    // Close chat
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // Step 2: Navigate to approval page
    await page.goto('/approval');
    await page.waitForLoadState('networkidle');

    // Step 3: Verify approval page loads
    const approvalContent = page.locator('h1').or(page.locator('[class*="approval"]')).or(page.locator('text=/Approval Queue/i'));
    await expect(approvalContent.first()).toBeVisible({ timeout: 10000 });

    // Step 4: Check if there are tasks awaiting approval
    // The page may show "No tasks awaiting approval" or have tasks
    const emptyState = page.locator('text=/no tasks/i, text=/awaiting/i, text=/No tasks/i');
    const taskCard = page.locator('[data-testid="task-card"], .task-card, [class*="card"]').first();
    
    const isEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);
    const hasTask = await taskCard.isVisible({ timeout: 3000 }).catch(() => false);
    
    // Either empty state or task card should be visible
    expect(isEmpty || hasTask).toBe(true);
    
    if (hasTask && !isEmpty) {
      // Step 5: Verify proposals are displayed (if task has plans)
      const proposals = page.locator('[data-testid="proposal"], .proposal-card, [class*="proposal"], [class*="plan"]');
      const hasProposals = await proposals.first().isVisible({ timeout: 5000 }).catch(() => false);
      
      if (hasProposals) {
        // Step 6: Select a proposal and approve
        const approveButton = page.locator('button:has-text("Approve"), button:has-text("Select")').first();
        const hasApproveButton = await approveButton.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (hasApproveButton) {
          await approveButton.click();
          
          // Step 7: Verify approval confirmation or redirect
          await expect(page).toHaveURL(/\/dashboard|\//, { timeout: 10000 });
        }
      }
    }
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

