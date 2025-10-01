import { defineConfig } from '@playwright/test';
import baseConfig from '../playwright.config';

/**
 * Voiceflow-specific test configuration
 * Extends the base config with Voiceflow-specific settings
 */
export default defineConfig({
  // Don't inherit globalSetup from baseConfig
  globalSetup: undefined,
  testDir: './e2e-tests',
  testMatch: [
    'e2e-tests/**/voiceflow*.spec.ts'
  ],
  timeout: 30000, // Longer timeout for SSE streaming tests
  expect: {
    timeout: 10000 // Longer expect timeout for async operations
  },
  use: {
    baseURL: 'http://localhost:3000',
    // Additional context options for Voiceflow tests
    permissions: ['microphone'], // Grant microphone permission for voice tests
  },
  projects: [
    {
      name: 'voiceflow-chrome',
      use: { 
        ...baseConfig.use,
        browserName: 'chromium',
        // Chrome-specific settings for speech recognition
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            '--allow-running-insecure-content'
          ]
        }
      },
    },
  ],
});
