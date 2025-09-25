import { test, expect } from '@playwright/test';

test.describe('OpenAI Chat Integration', () => {
  test('chat interface loads and can send/receive messages', async ({ page }) => {
    // Navigate to chat page
    await page.goto(`${process.env.E2E_URL}/chat`);
    
    // Check if we're redirected to login page
    if (page.url().includes('/login')) {
      console.log('Redirected to login page, need to authenticate');
      
      // Generate a unique test user
      const uniqueEmail = `chat-test-${Date.now()}@example.com`;
      const password = 'Password123';
      
      // Register a new user
      await page.goto(`${process.env.E2E_URL}/register`);
      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      
      // Login with the new user
      await page.goto(`${process.env.E2E_URL}/login`);
      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    // Navigate to chat page
    await page.goto(`${process.env.E2E_URL}/chat`);
    await page.waitForTimeout(2000);
    
    // Verify chat interface elements are present
    await expect(page.locator('h2')).toContainText('Long COVID Support Assistant');
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('button:has-text("Send")')).toBeVisible();
    
    // Verify welcome message is shown when no messages
    await expect(page.locator('text=Welcome!')).toBeVisible();
    await expect(page.locator('text=Start by telling me about')).toBeVisible();
  });

  test('can send a message and receive AI response', async ({ page }) => {
    // Navigate to chat page
    await page.goto(`${process.env.E2E_URL}/chat`);
    
    // Handle authentication if needed
    if (page.url().includes('/login')) {
      const uniqueEmail = `chat-ai-test-${Date.now()}@example.com`;
      const password = 'Password123';
      
      await page.goto(`${process.env.E2E_URL}/register`);
      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      
      await page.goto(`${process.env.E2E_URL}/login`);
      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      
      await page.goto(`${process.env.E2E_URL}/chat`);
      await page.waitForTimeout(2000);
    }
    
    // Send a simple test message
    const testMessage = 'Hello, this is a test message';
    const textarea = page.locator('textarea');
    const sendButton = page.locator('button:has-text("Send")');
    
    await textarea.fill(testMessage);
    await sendButton.click();
    
    // Verify user message appears (look for message in chat bubble, not button)
    await expect(page.locator('.bg-blue-500.text-white').filter({ hasText: testMessage })).toBeVisible();
    
    // Wait for AI response (with generous timeout for API call)
    await expect(page.locator('.bg-gray-100')).toBeVisible({ timeout: 30000 });
    
    // Verify AI response is not empty and doesn't contain error message
    const aiResponse = page.locator('.bg-gray-100').last();
    await expect(aiResponse).toBeVisible();
    
    // Check that we don't get the generic error message
    await expect(aiResponse).not.toContainText('I apologize, but I encountered an error');
    
    // Verify the response contains some text (AI should respond with something)
    const responseText = await aiResponse.textContent();
    expect(responseText?.length).toBeGreaterThan(5);
  });

  test('test-openai page shows API configuration status', async ({ page }) => {
    // Navigate to test-openai page
    await page.goto(`${process.env.E2E_URL}/test-openai`);
    await page.waitForTimeout(3000); // Give time for API call
    
    // Verify page elements
    await expect(page.locator('h1')).toContainText('OpenAI Integration Test');
    await expect(page.locator('h2')).toContainText('Test Results');
    
    // Check for either success or error state
    const pageContent = await page.content();
    const hasSuccess = pageContent.includes('Success!') || pageContent.includes('✅');
    const hasError = pageContent.includes('Error') || pageContent.includes('❌');
    
    // Should show either success or error, not be blank
    expect(hasSuccess || hasError).toBeTruthy();
    
    // If successful, verify expected elements
    if (hasSuccess) {
      await expect(page.locator('text=AI Response:')).toBeVisible();
      await expect(page.locator('text=Model Used')).toBeVisible();
      await expect(page.locator('text=gpt-4o-mini')).toBeVisible();
    }
    
    // Verify configuration status is shown
    await expect(page.locator('text=Configuration Status')).toBeVisible();
    await expect(page.locator('text=API Key Configured:')).toBeVisible();
    
    // Verify link to chat page (be more specific)
    await expect(page.locator('a[href="/chat"]:has-text("Try the Long COVID AI Assistant")')).toBeVisible();
  });
});
