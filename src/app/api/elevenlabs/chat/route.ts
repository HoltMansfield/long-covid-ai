import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse, ChatMessage, LONG_COVID_SYSTEM_PROMPT } from '@/lib/openai';

/**
 * API endpoint for ElevenLabs Server Tool
 * This allows the ElevenLabs agent to call our OpenAI backend via HTTP webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('\n\n🔧 === ELEVENLABS SERVER TOOL CALLED ===');
    console.log('Request body:', JSON.stringify(body, null, 2));

    // ElevenLabs sends the conversation in a specific format
    // We need to extract the user's message and conversation history
    const { conversation, tool_call_id } = body;

    if (!conversation || !Array.isArray(conversation)) {
      console.error('❌ Invalid conversation format');
      return NextResponse.json(
        { error: 'Invalid conversation format' },
        { status: 400 }
      );
    }

    // Extract messages from conversation
    const messages: ChatMessage[] = conversation
      .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant')
      .map((msg: any) => ({
        role: msg.role,
        content: msg.content || msg.message || ''
      }));

    console.log('📝 Extracted messages:', messages.length);
    console.log('💬 Last user message:', messages[messages.length - 1]?.content);

    // Get AI response from OpenAI with Long COVID prompt
    const aiResponse = await generateAIResponse(messages);
    
    console.log('✅ AI Response:', aiResponse);
    console.log('🔧 Tool call ID:', tool_call_id);

    // Return response in format ElevenLabs expects
    return NextResponse.json({
      result: aiResponse,
      tool_call_id
    });

  } catch (error) {
    console.error('❌ Error in ElevenLabs chat endpoint:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        result: "I'm having trouble right now. Please try again."
      },
      { status: 500 }
    );
  }
}
