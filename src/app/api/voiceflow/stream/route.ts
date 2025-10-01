import { NextRequest } from 'next/server';
import { getVoiceflowConfig } from '@/actions/voiceflow';

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();
    
    if (!message) {
      return new Response('Message is required', { status: 400 });
    }

    // Get Voiceflow configuration
    const config = await getVoiceflowConfig();
    if (!config) {
      return new Response('Voiceflow configuration missing', { status: 500 });
    }

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          // Initialize Voiceflow client
          const { RuntimeClientFactory } = await import('@voiceflow/runtime-client-js');
          const factory = new RuntimeClientFactory({
            versionID: config.versionID,
            apiKey: config.apiKey,
            endpoint: config.endpoint,
          });
          
          const client = factory.createClient();
          
          // Set up event handlers for streaming
          client.onSpeak((trace) => {
            const data = JSON.stringify({
              type: 'speak',
              payload: trace.payload
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          });

          client.onEnd(() => {
            const data = JSON.stringify({
              type: 'end',
              payload: {}
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            controller.close();
          });

          // Start the conversation if sessionId is provided
          if (sessionId) {
            await client.start();
          }

          // Send the user message
          await client.sendText(message);
          
        } catch (error) {
          console.error('Voiceflow streaming error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            payload: { message: 'Failed to process message' }
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('SSE endpoint error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
