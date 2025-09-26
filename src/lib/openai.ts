import OpenAI from 'openai';
import { env } from '@/env';

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

// System prompt for Long COVID AI Agent
export const LONG_COVID_SYSTEM_PROMPT = `You are a compassionate AI assistant specializing in helping people with Long COVID manage Post-Exertional Malaise (PEM) crashes. Your primary goal is to help users avoid PEM crashes to accelerate their recovery.

Key Guidelines:
1. Keep interactions simple and low cognitive load - users may have brain fog
2. Focus on identifying crash severity, triggers, and patterns
3. Ask one question at a time
4. Be empathetic and understanding
5. Avoid giving medical advice - focus on pattern recognition and trigger identification
6. Prioritize rest and pacing strategies
7. Help users understand their personal triggers rather than prescribing activities
8. Be inclusive of severely ill patients who may only provide brief responses
9. Recognize that minimal communication often indicates high severity

When interviewing about a crash:
- Ask about severity (1-10 scale), but also infer severity from context
- Identify potential triggers (physical activity, mental exertion, stress, etc.)
- Understand the timeline (when did it start, how long did it last)
- Note symptoms experienced
- Ask about recovery time
- Pay attention to implied severity: brief responses, inability to elaborate, expressions of cognitive difficulty

Severity Indicators to Watch For:
- Very short responses may indicate severe cognitive impairment
- Phrases like "can't think," "too tired," "bad crash" suggest high severity
- Inability to provide details often correlates with crash severity
- Communication struggles themselves are symptoms worth noting

Remember: Your role is to help identify patterns and triggers, not to provide medical treatment. Every piece of information matters, especially from those who are most severely affected.`;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function generateAIResponse(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Free tier compatible model
      messages: [
        { role: 'system', content: LONG_COVID_SYSTEM_PROMPT },
        ...messages
      ],
      max_tokens: 300, // Keep responses concise for low cognitive load
      temperature: 0.7,
    });

    // Log the full response to debug format issues
    console.log('OpenAI Full Response:', JSON.stringify(response, null, 2));
    console.log('Response choices:', response.choices);
    console.log('First choice:', response.choices[0]);
    console.log('Message content:', response.choices[0]?.message?.content);
    
    return response.choices[0]?.message?.content || 'I apologize, but I encountered an error. Please try again.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    
    // Check if it's an API key issue
    if (error && typeof error === 'object' && 'status' in error) {
      if (error.status === 401) {
        return 'API key error. Please check your OpenAI API key configuration.';
      }
      if (error.status === 429) {
        return 'Rate limit exceeded. Please try again in a moment.';
      }
      if (error.status === 402) {
        return 'Billing issue. Please check your OpenAI account billing.';
      }
    }
    
    return 'I apologize, but I encountered an error connecting to the AI service. Please try again later.';
  }
}

// Helper function to start a crash report interview
export function createCrashReportInterview(): ChatMessage[] {
  return [
    {
      role: 'assistant',
      content: 'I understand you\'ve experienced a crash. I\'m here to help you understand what might have triggered it. Let\'s start simple - on a scale of 1 to 10, how severe was this crash for you?'
    }
  ];
}

// Helper function to analyze triggers from conversation
export function extractTriggersFromConversation(messages: ChatMessage[]): string[] {
  // This would be enhanced with more sophisticated analysis
  const triggers: string[] = [];
  const commonTriggers = [
    'physical activity', 'exercise', 'walking', 'stairs',
    'mental exertion', 'work', 'reading', 'computer',
    'stress', 'emotional stress', 'anxiety', 'social anxiety',
    'social activity', 'socializing', 'party',
    'travel', 'driving', 'shopping',
    'heat', 'cold', 'weather',
    'sleep', 'poor sleep', 'insomnia'
  ];

  const conversationText = messages
    .filter(m => m.role === 'user')
    .map(m => m.content.toLowerCase())
    .join(' ');

  commonTriggers.forEach(trigger => {
    if (conversationText.includes(trigger)) {
      triggers.push(trigger);
    }
  });

  return [...new Set(triggers)]; // Remove duplicates
}
