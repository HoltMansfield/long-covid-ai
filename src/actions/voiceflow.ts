'use server';

interface VoiceflowConfig {
  versionID: string;
  apiKey: string;
  endpoint: string;
}

/**
 * Server action to securely fetch Voiceflow configuration
 * Keeps API credentials server-side while allowing client-side real-time communication
 */
export async function getVoiceflowConfig(): Promise<VoiceflowConfig | null> {
  try {
    const versionID = process.env.VOICEFLOW_VERSION_ID;
    const apiKey = process.env.VOICEFLOW_API_KEY;
    const endpoint = process.env.VOICEFLOW_ENDPOINT || 'https://general-runtime.voiceflow.com';
    
    if (!versionID || !apiKey) {
      console.error('Missing Voiceflow environment variables');
      return null;
    }
    
    return {
      versionID,
      apiKey,
      endpoint
    };
  } catch (error) {
    console.error('Error fetching Voiceflow config:', error);
    return null;
  }
}
