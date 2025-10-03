# ElevenLabs with OpenAI Backend Integration

## 🎯 Architecture

This implementation uses **ElevenLabs for voice** (STT + TTS) while keeping **your OpenAI backend** for conversation logic.

```
User Speech 
  ↓
ElevenLabs STT (Speech-to-Text)
  ↓
ElevenLabs Agent (minimal - just routes)
  ↓
Client Tool: getAIResponse
  ↓
Server Action: handleVoiceChatMessage
  ↓
OpenAI GPT-4 (your prompts & logic)
  ↓
Server Action returns response
  ↓
ElevenLabs TTS (Text-to-Speech)
  ↓
User hears response
```

## ✅ Benefits

1. **✅ Best Voice Quality** - ElevenLabs ultra-realistic TTS
2. **✅ Your Conversation Logic** - Full control with OpenAI
3. **✅ Your Prompts** - Use existing Long COVID prompts
4. **✅ Conversation History** - Maintained client-side
5. **✅ Easy Updates** - Change prompts without touching ElevenLabs
6. **✅ Cost Effective** - Only pay ElevenLabs for voice, not LLM

## 📋 Implementation

### 1. Server Action (`src/actions/elevenlabs.ts`)

```typescript
export async function handleVoiceChatMessage(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string>
```

- Takes user message and conversation history
- Calls your OpenAI backend with existing prompts
- Returns AI response as string
- ElevenLabs speaks the response

### 2. Client Component (`src/components/ElevenLabsVoiceChatInterface.tsx`)

```typescript
clientTools: {
  getAIResponse: async (params: { userMessage: string }) => {
    const response = await handleVoiceChatMessage(
      params.userMessage,
      conversationHistory.current
    );
    return response;
  }
}
```

- Registers `getAIResponse` as a client tool
- ElevenLabs agent calls this tool for every user message
- Maintains conversation history in React ref
- Returns response to ElevenLabs for speaking

### 3. ElevenLabs Agent Configuration

**System Prompt** (minimal):
```
You are a voice interface for a Long COVID support assistant.

When the user speaks, call the getAIResponse tool with their message.
The tool will return the appropriate response from our AI backend.

IMPORTANT: Always call the getAIResponse tool for every user message.
Do not generate your own responses - always use the tool.
```

**Client Tool Configuration**:
- Name: `getAIResponse`
- Description: "Gets the AI response from the backend"
- Parameters:
  ```json
  {
    "userMessage": {
      "type": "string",
      "description": "The user's message"
    }
  }
  ```

## 🔄 Conversation Flow

1. **User speaks**: "I had a crash yesterday"
2. **ElevenLabs STT**: Converts to text
3. **Agent calls tool**: `getAIResponse({ userMessage: "I had a crash yesterday" })`
4. **Client tool executes**: Calls `handleVoiceChatMessage()`
5. **Server action**: 
   - Adds message to history
   - Calls OpenAI with your prompts
   - Returns: "I understand you've experienced a crash. On a scale of 1-10..."
6. **Tool returns response**: Back to ElevenLabs agent
7. **ElevenLabs TTS**: Speaks the response
8. **User hears**: Natural, empathetic voice

## 🎨 Customization

### Update Prompts
Edit `/src/lib/openai.ts`:
```typescript
export const LONG_COVID_SYSTEM_PROMPT = `...your prompt...`;
```

No need to touch ElevenLabs configuration!

### Change Opening Message
Edit `/src/lib/openai.ts`:
```typescript
export function createCrashReportInterview(): ChatMessage[] {
  return [{
    role: 'assistant',
    content: 'Your opening message here...'
  }];
}
```

### Add Conversation Features
- Crash report extraction
- Trigger analysis
- Pattern recognition
- Database saving

All handled in your backend - ElevenLabs just does voice!

## 🐛 Debugging

### Check if tool is being called:
Look for in console:
```
🔧 Client tool called with: { userMessage: "..." }
=== VOICE CHAT MESSAGE ===
User message: ...
✅ AI Response: ...
```

### If tool isn't being called:
1. Check ElevenLabs agent system prompt
2. Verify tool is registered in agent settings
3. Check tool name matches exactly: `getAIResponse`

### If responses are wrong:
1. Check `/src/lib/openai.ts` prompts
2. Check conversation history is being maintained
3. Check OpenAI API key and model

## 💰 Cost Comparison

### This Approach (ElevenLabs + OpenAI):
- **ElevenLabs**: $0.08/minute (voice only)
- **OpenAI**: ~$0.01 per conversation (GPT-4o-mini)
- **Total**: ~$0.08-0.09 per minute

### ElevenLabs Full Agent:
- **ElevenLabs**: $0.08/minute (voice + LLM passthrough)
- **LLM costs**: Passed through separately
- **Total**: Similar, but less control

### Benefit:
- ✅ Full control over conversation logic
- ✅ Use existing prompts and code
- ✅ Easy to update and test
- ✅ Better debugging

## 🚀 Next Steps

1. **Test the integration** - Start a conversation
2. **Refine prompts** - Update OpenAI prompts as needed
3. **Add features** - Crash report saving, analysis, etc.
4. **Monitor usage** - Check ElevenLabs and OpenAI dashboards

## 📝 Notes

- Conversation history is maintained client-side (in memory)
- History is lost on page refresh (add persistence if needed)
- ElevenLabs agent is just a "voice router" - minimal logic
- All AI intelligence comes from your OpenAI backend
- This gives you maximum flexibility and control!
