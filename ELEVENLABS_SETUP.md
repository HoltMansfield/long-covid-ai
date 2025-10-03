# ElevenLabs Setup Guide

## 🚀 Quick Start

### 1. Create Your ElevenLabs Agent

1. Go to [ElevenLabs Agents Platform](https://elevenlabs.io/app/conversational-ai)
2. Click "Create Agent"
3. Configure your agent:

#### **System Prompt** (Minimal - we use OpenAI backend):
```
You are a voice interface for a Long COVID support assistant. 

When the user speaks, call the getAIResponse tool with their message.
The tool will return the appropriate response from our AI backend.

IMPORTANT: Always call the getAIResponse tool for every user message.
Do not generate your own responses - always use the tool.
```

#### **Voice Selection**:
- Choose a warm, empathetic voice
- Recommended: "Rachel" or "Bella" for female, "Adam" or "Antoni" for male
- Test different voices to find the most comforting one

#### **Settings**:
- **Language**: English
- **Turn-taking**: Enabled (allows natural interruptions)
- **Response time**: Balanced (not too fast, not too slow)

### 2. Get Your Agent ID

After creating your agent:
1. Click on your agent
2. Look for the **Agent ID** in the settings
3. Copy it (format: `agent_xxxxxxxxxx`)

### 3. Update Environment Variables

Add to your `.env.local`:
```bash
# ElevenLabs Conversational AI
ELEVENLABS_API_KEY=sk_535c44f6bf1d2832398205c1dbeb02b7f6c17310494afe44
ELEVENLABS_AGENT_ID=your_agent_id_here
```

### 4. Configure Client Tools

In the ElevenLabs agent settings:

1. Go to **Tools** section
2. Add a **Client Tool**:
   - **Name**: `getAIResponse`
   - **Description**: "Gets the AI response from the backend"
   - **Parameters**:
     ```json
     {
       "userMessage": {
         "type": "string",
         "description": "The user's message"
       }
     }
     ```

3. In the **System Prompt**, add:
   ```
   For every user message, call getAIResponse with the userMessage parameter.
   Return exactly what the tool returns, nothing more.
   ```

### 5. Test Your Integration

1. Restart your dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/chat/voice-elevenlabs`
3. Click "Start Conversation"
4. Allow microphone access
5. Start speaking!

## 🎯 Advanced Configuration

### Adding Tools (Optional)

You can add server tools to your agent to:
- Save crash reports to database
- Retrieve user history
- Send follow-up emails

Example tool configuration in ElevenLabs dashboard:
```json
{
  "name": "save_crash_report",
  "description": "Saves the crash report to the database",
  "parameters": {
    "severity": "number (1-10)",
    "triggers": "string",
    "symptoms": "string",
    "timeline": "string"
  }
}
```

### Knowledge Base (Optional)

Upload documents about Long COVID to help your agent:
- Medical information about PEM (Post-Exertional Malaise)
- Common triggers and symptoms
- Recovery strategies
- Pacing guidelines

## 🔧 Troubleshooting

### "Failed to get signed URL"
- Check that `ELEVENLABS_API_KEY` is set correctly
- Verify your API key is valid in ElevenLabs dashboard

### "Failed to start conversation"
- Ensure you're using Chrome or Edge browser
- Check microphone permissions
- Verify agent ID is correct

### No audio output
- Check browser audio permissions
- Ensure speakers/headphones are working
- Try refreshing the page

## 📊 Monitoring

View conversation analytics in ElevenLabs dashboard:
- Total conversations
- Average duration
- User satisfaction
- Common topics

## 💰 Pricing

- **Free tier**: 15 minutes
- **Creator**: 250 minutes for $22/month
- **Pro**: 1,100 minutes for $99/month
- **Business**: 13,750 minutes for $1,320/month

For Long COVID interviews (avg 10-15 minutes each):
- Free tier: ~1 interview
- Creator: ~17-25 interviews
- Pro: ~73-110 interviews
- Business: ~916-1,375 interviews
