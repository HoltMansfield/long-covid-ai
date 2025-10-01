import { test, expect } from '@playwright/test';

test.describe('Voiceflow Stream API', () => {
  test('should return SSE stream for valid request', async ({ request }) => {
    const response = await request.post('/api/voiceflow/stream', {
      data: {
        message: 'Hello, this is a test message',
        sessionId: 'test-session-123'
      }
    });

    // Should return 200 or 500 (depending on environment configuration)
    expect([200, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      // Verify SSE headers
      expect(response.headers()['content-type']).toBe('text/event-stream');
      expect(response.headers()['cache-control']).toBe('no-cache');
      expect(response.headers()['connection']).toBe('keep-alive');
    } else {
      // Should be configuration error
      const responseText = await response.text();
      expect(responseText).toContain('configuration');
    }
  });

  test('should reject request without message', async ({ request }) => {
    const response = await request.post('/api/voiceflow/stream', {
      data: {
        sessionId: 'test-session-123'
        // Missing message
      }
    });

    expect(response.status()).toBe(400);
    const responseText = await response.text();
    expect(responseText).toContain('Message is required');
  });

  test('should handle malformed JSON', async ({ request }) => {
    const response = await request.post('/api/voiceflow/stream', {
      data: 'invalid json'
    });

    expect(response.status()).toBe(500);
  });

  test('should handle empty request body', async ({ request }) => {
    const response = await request.post('/api/voiceflow/stream');

    expect(response.status()).toBe(500);
  });

  test('should accept request without sessionId', async ({ request }) => {
    const response = await request.post('/api/voiceflow/stream', {
      data: {
        message: 'Test message without session'
      }
    });

    // Should still process the request (200 or 500 for config issues)
    expect([200, 500]).toContain(response.status());
  });
});
