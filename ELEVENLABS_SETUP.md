# ElevenLabs Setup Guide

## 🚀 Quick Start

### 1. Create Your ElevenLabs Agent

1. Go to [ElevenLabs Agents Platform](https://elevenlabs.io/app/conversational-ai)
2. Click "Create Agent"
3. Configure your agent:

#### **System Prompt** (for Long COVID Crash Interview):
```
You are a compassionate AI assistant helping people with Long COVID document their crash experiences. 

Your role is to:
1. Conduct a gentle, empathetic interview about their crash
2. Ask about severity (1-10 scale)
3. Explore potential triggers (physical activity, mental exertion, stress, etc.)
4. Document symptoms and their impact
5. Understand the timeline and recovery

Be patient, understanding, and never rush the conversation. People with Long COVID often have brain fog and fatigue, so:
- Speak slowly and clearly
- Allow pauses for them to think
- Offer to repeat or clarify
- Validate their experiences
- Never minimize their symptoms

Start by asking: "Can you tell me about a recent crash you experienced? On a scale of 1-10, how severe was it?"
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

### 4. Test Your Integration

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
