import { test, expect } from '@playwright/test';

test.describe('OpenAI Chat Integration', () => {
  test('chat interface loads and shows initial AI message', async ({ page }) => {
    // Navigate to chat page (user is already authenticated)
    await page.goto(`${process.env.E2E_URL}/chat`);
    await page.waitForTimeout(2000);
    
    // Verify chat interface elements are present
    await expect(page.locator('h2')).toContainText('Long COVID Support Assistant');
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('button:has-text("Send")')).toBeVisible();
    
    // Verify initial AI message is shown (since chat starts with crash report interview)
    await expect(page.locator('text=I understand you\'ve experienced a crash')).toBeVisible();
    await expect(page.locator('text=on a scale of 1 to 10')).toBeVisible();
  });

  test('can send a message and receive AI response', async ({ page }) => {
    // Navigate to chat page (user is already authenticated)
    await page.goto(`${process.env.E2E_URL}/chat`);
    await page.waitForTimeout(2000);
    
    // Send a simple test message
    const testMessage = 'Hello, this is a test message';
    const textarea = page.locator('textarea');
    const sendButton = page.locator('button:has-text("Send")');
    
    await textarea.fill(testMessage);
    await sendButton.click();
    
    // Verify user message appears (look for message in chat bubble, not button)
    await expect(page.locator('.bg-blue-500.text-white').filter({ hasText: testMessage })).toBeVisible();
    
    // Wait for AI response (with generous timeout for API call)
    // Look for AI response that's not the loading indicator
    await expect(page.locator('.bg-gray-100').filter({ hasNotText: 'Thinking...' })).toBeVisible({ timeout: 30000 });
    
    // Verify AI response is not empty and doesn't contain error message
    const aiResponse = page.locator('.bg-gray-100').filter({ hasNotText: 'Thinking...' }).last();
    await expect(aiResponse).toBeVisible();
    
    // Check that we don't get the generic error message
    await expect(aiResponse).not.toContainText('I apologize, but I encountered an error');
    
    // Verify the response contains some text (AI should respond with something)
    const responseText = await aiResponse.textContent();
    expect(responseText?.length).toBeGreaterThan(5);
  });
});
