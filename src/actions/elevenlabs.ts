'use server';

import { generateAIResponse, ChatMessage, createCrashReportInterview } from '@/lib/openai';

// Highlight.run for these actions to avoid Next.js 15 compatibility issues
// @ts-ignore
if (typeof globalThis !== 'undefined') {
  // @ts-ignore
  globalThis.__HIGHLIGHT_DISABLED__ = false;
}
/**
 * Server action to securely fetch ElevenLabs API key
 * Keeps API credentials server-side for security
 */
export async function getElevenLabsApiKey(): Promise<string | null> {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      console.error('Missing ELEVENLABS_API_KEY environment variable');
      return null;
    }
    
    return apiKey;
  } catch (error) {
    console.error('Error fetching ElevenLabs API key:', error);
    return null;
  }
}

/**
 * Server action to create a signed conversation URL for ElevenLabs agent
 * This provides secure, time-limited access to the agent
 */
export async function getElevenLabsSignedUrl(agentId: string): Promise<string | null> {  
  try {
    const apiKey = await getElevenLabsApiKey();
    
    if (!apiKey) {
      console.error('❌ No API key available');
      console.error('Environment check:', {
        hasKey: !!process.env.ELEVENLABS_API_KEY,
        keyPrefix: process.env.ELEVENLABS_API_KEY?.substring(0, 10)
      });
      return null;
    }

    // Call ElevenLabs API to get signed URL
    const url = `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`;
    
    // Use native fetch to avoid Next.js cloning issues
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
      cache: 'no-store', // Disable caching to avoid cloning
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to get signed URL:', response.status, response.statusText);
      console.error('❌ Error body:', errorText);
      return null;
    }

    const data = await response.json();
    return data.signed_url;
  } catch (error) {
    console.error('❌ Exception getting ElevenLabs signed URL:', error);
    return null;
  }
}

/**
 * Server action to handle chat messages from ElevenLabs client tools
 * This allows ElevenLabs to call our OpenAI backend for conversation logic
 */
export async function handleVoiceChatMessage(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    console.log('\n\n=== VOICE CHAT MESSAGE ===');
    console.log('User message:', userMessage);
    console.log('History length:', conversationHistory.length);

    // If this is the first message, include the opening
    let messages: ChatMessage[];
    if (conversationHistory.length === 0) {
      // Start with the crash interview opening
      const opening = createCrashReportInterview();
      messages = [
        ...opening,
        { role: 'user', content: userMessage }
      ];
    } else {
      messages = [
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];
    }

    // Get AI response from OpenAI
    const aiResponse = await generateAIResponse(messages);
    console.log('✅ AI Response:', aiResponse);

    return aiResponse;
  } catch (error) {
    console.error('❌ Error handling voice chat message:', error);
    return "I apologize, but I'm having trouble processing that right now. Could you please try again?";
  }
}
