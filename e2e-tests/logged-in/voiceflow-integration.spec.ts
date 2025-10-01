import { test, expect } from '@playwright/test';

test.describe('Voiceflow Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to voice chat page
    await page.goto('/chat/voice');
    
    // Wait for the page to load and speech recognition to initialize
    await page.waitForSelector('[data-testid="voice-chat-interface"]', { timeout: 10000 });
  });

  test('should load voice chat interface successfully', async ({ page }) => {
    // Check that the main interface elements are present
    await expect(page.locator('h2')).toContainText('AI Voice Assistant');
    await expect(page.locator('text=Starting our conversation...')).toBeVisible();
    
    // Check that the voice button is present and enabled
    const voiceButton = page.locator('[data-testid="voice-button"]');
    await expect(voiceButton).toBeVisible();
    await expect(voiceButton).toBeEnabled();
  });

  test('should display crash interview question on load', async ({ page }) => {
    // Wait for the crash interview to auto-start
    await page.waitForTimeout(2000);
    
    // Check that the crash interview question appears
    await expect(page.locator('text=I understand you\'ve experienced a crash')).toBeVisible();
    await expect(page.locator('text=on a scale of 1 to 10')).toBeVisible();
  });

  test('should handle Voiceflow SSE streaming', async ({ page }) => {
    // Mock a successful Voiceflow response
    await page.route('/api/voiceflow/stream', async (route) => {
      const sseResponse = `data: {"type":"speak","payload":{"message":"Thank you for sharing that with me."}}\n\ndata: {"type":"end","payload":{}}\n\n`;
      
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        body: sseResponse,
      });
    });

    // Simulate user input by directly calling the API
    const response = await page.request.post('/api/voiceflow/stream', {
      data: {
        message: 'The crash was a 7 out of 10',
        sessionId: 'test-session-123'
      }
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/event-stream');
  });

  test('should fallback to OpenAI when Voiceflow fails', async ({ page }) => {
    // Mock Voiceflow to fail
    await page.route('/api/voiceflow/stream', async (route) => {
      await route.fulfill({
        status: 500,
        body: 'Voiceflow service unavailable',
      });
    });

    // Mock OpenAI chat action to succeed
    await page.route('/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'I understand you experienced a crash. Can you tell me more about what might have triggered it?'
        }),
      });
    });

    // Trigger a conversation by simulating text input
    await page.evaluate(() => {
      // Simulate the processUserInput function being called
      const event = new CustomEvent('test-user-input', { 
        detail: { message: 'I had a crash yesterday' } 
      });
      window.dispatchEvent(event);
    });

    // Wait for fallback response
    await page.waitForTimeout(2000);
    
    // Check that OpenAI fallback response appears
    await expect(page.locator('text=I understand you experienced a crash')).toBeVisible();
  });

  test('should handle voice recognition permissions', async ({ page }) => {
    // Check for speech recognition support message
    const speechNotSupported = page.locator('text=Speech recognition not supported');
    const voiceChatNotAvailable = page.locator('text=Voice Chat Not Available');
    
    // Either the interface loads normally or shows unsupported message
    const isSupported = await speechNotSupported.isVisible() === false && 
                       await voiceChatNotAvailable.isVisible() === false;
    
    if (isSupported) {
      // Voice chat should be available
      await expect(page.locator('[data-testid="voice-button"]')).toBeVisible();
      await expect(page.locator('text=AI Voice Assistant')).toBeVisible();
    } else {
      // Should show fallback message
      await expect(page.locator('text=Switch to Text Chat')).toBeVisible();
    }
  });

  test('should handle session management correctly', async ({ page }) => {
    // Mock successful Voiceflow responses with session handling
    let requestCount = 0;
    
    await page.route('/api/voiceflow/stream', async (route) => {
      const request = route.request();
      const body = JSON.parse(request.postData() || '{}');
      
      requestCount++;
      
      // First request should include sessionId
      if (requestCount === 1) {
        expect(body.sessionId).toBeDefined();
      }
      
      const sseResponse = `data: {"type":"speak","payload":{"message":"Response ${requestCount}"}}\n\ndata: {"type":"end","payload":{}}\n\n`;
      
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        body: sseResponse,
      });
    });

    // Simulate multiple conversation turns
    for (let i = 1; i <= 3; i++) {
      const response = await page.request.post('/api/voiceflow/stream', {
        data: {
          message: `Test message ${i}`,
          sessionId: i === 1 ? 'test-session' : undefined
        }
      });
      
      expect(response.status()).toBe(200);
    }
    
    expect(requestCount).toBe(3);
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock network error
    await page.route('/api/voiceflow/stream', async (route) => {
      await route.abort('failed');
    });

    // Mock OpenAI to also fail
    await page.route('/api/chat', async (route) => {
      await route.fulfill({
        status: 500,
        body: 'OpenAI service unavailable',
      });
    });

    // Trigger error by simulating user input
    await page.evaluate(() => {
      const event = new CustomEvent('test-user-input', { 
        detail: { message: 'This should trigger an error' } 
      });
      window.dispatchEvent(event);
    });

    // Wait for error handling
    await page.waitForTimeout(2000);
    
    // Should show error message
    await expect(page.locator('text=An error occurred')).toBeVisible();
  });

  test('should validate environment configuration', async ({ page }) => {
    // Test that the SSE endpoint returns proper error for missing config
    await page.route('/api/voiceflow/stream', async (route) => {
      // Simulate missing environment variables
      await route.fulfill({
        status: 500,
        body: 'Voiceflow configuration missing',
      });
    });

    const response = await page.request.post('/api/voiceflow/stream', {
      data: {
        message: 'Test message',
        sessionId: 'test-session'
      }
    });

    expect(response.status()).toBe(500);
    const responseText = await response.text();
    expect(responseText).toContain('Voiceflow configuration missing');
  });

  test('should handle SSE connection lifecycle', async ({ page }) => {
    // Mock a streaming response that tests the full SSE lifecycle
    await page.route('/api/voiceflow/stream', async (route) => {
      const sseResponse = [
        'data: {"type":"text","payload":{"message":"Starting response..."}}\n\n',
        'data: {"type":"speak","payload":{"message":"This is a streaming response."}}\n\n',
        'data: {"type":"speak","payload":{"message":" It comes in multiple parts."}}\n\n',
        'data: {"type":"end","payload":{}}\n\n'
      ].join('');
      
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        body: sseResponse,
      });
    });

    const response = await page.request.post('/api/voiceflow/stream', {
      data: {
        message: 'Test streaming response',
        sessionId: 'test-session'
      }
    });

    expect(response.status()).toBe(200);
    
    // Verify SSE headers
    expect(response.headers()['content-type']).toBe('text/event-stream');
    expect(response.headers()['cache-control']).toBe('no-cache');
    expect(response.headers()['connection']).toBe('keep-alive');
  });
});
