/**
 * Manual Chat Test - Run with --headed to see the browser
 * 
 * This test is designed to be run manually to visually verify chat functionality.
 * Run with: npx playwright test src/__tests__/ui/chat-manual.test.ts --headed
 */

import { test, expect } from '@playwright/test';

test.describe('Chat Functionality - Visual Test', () => {
  test.setTimeout(60000); // Increase timeout to 60 seconds
  
  test('visual test: chat dialog and interactions', async ({ page }) => {
    // Navigate to the app (assuming dev server is running on localhost:3000)
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    
    // Wait for page to be interactive
    await page.waitForSelector('body', { state: 'visible' });
    await page.waitForTimeout(3000); // Give time for React to hydrate
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'test-results/chat-initial.png', fullPage: true });
    
    // Find and click the "Talk to Aura" button
    const chatButton = page.locator('button:has-text("Talk to Aura")');
    console.log('Looking for chat button...');
    await expect(chatButton).toBeVisible({ timeout: 10000 });
    console.log('Chat button found, clicking...');
    await chatButton.click();
    
    // Wait for dialog to appear
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/chat-dialog-open.png', fullPage: true });
    
    // Check if dialog is visible
    const dialogVisible = await page.locator('h2:has-text("Talk to Aura")').isVisible();
    console.log('Dialog visible:', dialogVisible);
    
    // Check for greeting message
    const greetingVisible = await page.locator('text=/Hello! I am Aura/i').isVisible();
    console.log('Greeting visible:', greetingVisible);
    
    if (greetingVisible) {
      console.log('✅ Chat dialog opened successfully!');
    } else {
      console.log('❌ Chat dialog greeting not found');
    }
    
    // Try to find input field
    const input = page.locator('input[placeholder*="task" i], input[placeholder*="Describe" i]').first();
    const inputVisible = await input.isVisible();
    console.log('Input field visible:', inputVisible);
    
    if (inputVisible) {
      // Type a test message
      await input.fill('Test message from Playwright');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/chat-typed.png', fullPage: true });
      console.log('✅ Typed message successfully');
      
      // Find and click send button
      const sendButton = page.locator('form button[type="submit"]').last();
      const sendButtonVisible = await sendButton.isVisible();
      console.log('Send button visible:', sendButtonVisible);
      
      if (sendButtonVisible) {
        await sendButton.click();
        console.log('✅ Clicked send button');
        
        // Wait for response
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'test-results/chat-response.png', fullPage: true });
        
        // Check if user message appears
        const userMessageVisible = await page.locator('text=/Test message from Playwright/i').isVisible();
        console.log('User message visible:', userMessageVisible);
        
        // Check for any response (could be conversation, task creation, or error)
        const hasResponse = await page.locator('text=/created|error|sorry|thinking/i').count() > 0;
        console.log('Has response:', hasResponse);
      }
    }
    
    // Try closing the dialog
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/chat-closed.png', fullPage: true });
    console.log('✅ Pressed Escape to close dialog');
    
    // Summary
    console.log('\n=== Test Summary ===');
    console.log('Dialog opens:', dialogVisible);
    console.log('Greeting visible:', greetingVisible);
    console.log('Input field works:', inputVisible);
    console.log('\nCheck screenshots in test-results/ folder for visual verification');
  });
});

