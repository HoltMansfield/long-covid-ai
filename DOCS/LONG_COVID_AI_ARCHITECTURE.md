# Long COVID AI Agent - Architecture & Development Plan

## 🎯 **Project Vision**

Building an AI agent to help people with Long COVID manage PEM (Post-Exertional Malaise) crashes and accelerate recovery.

**Core Hypothesis:** People with long COVID can accelerate recovery by avoiding PEM crashes.

## 📋 **Key Requirements**

### **User Experience**

- **Speech-based chat interface** (migraines/light sensitivity considerations)
- **Low cognitive load interactions** - Simple, not overwhelming
- **Focus on crash severity, triggers, and pattern recognition**
- **Real-time and asynchronous conversations**
- **Historical tracking of crash patterns**

### **Data & Privacy**

- **Anonymized health data** (age as year, no PII)
- **Collective learning** across all users
- **Crash report data**: symptoms, activities, duration, triggers, recovery time
- **Recommendations focused on ranking triggers** rather than prescribing activities

### **Scale & Scope**

- **Scale for tens of thousands of users**
- **English first, multi-lingual potential**
- **Wearable integration desired**
- **Timeline: months for MVP**

### **Data Sources**

- **Peer-reviewed clinical studies** from reputable journals
- **Need process to find and ingest medical research**

## 🤖 **AI Model Decision: OpenAI/Anthropic (Recommended)**

### **Pros:**

- ✅ **Faster development** - Ready to use, excellent at conversations
- ✅ **Lower initial cost** - No training infrastructure needed
- ✅ **Better medical reasoning** - Already trained on medical literature
- ✅ **Speech integration** - OpenAI has excellent speech-to-text/text-to-speech
- ✅ **Rapid iteration** - Easy to refine prompts and behavior

### **Cons:**

- ❌ **Ongoing API costs** - $0.01-0.06 per 1K tokens
- ❌ **Data privacy** - Conversations go through their servers
- ❌ **Less customization** - Limited to prompt engineering

### **Custom Models Alternative:**

**Pros:** Full control, data privacy, long-term cost savings
**Cons:** $100K+ upfront, 6-12 month timeline, requires ML expertise

## 🏗️ **Recommended Architecture**

### **Core Stack (Building on Existing Next.js Foundation):**

```
Frontend: Next.js 15 + React + Tailwind (✅ Already have)
├── Speech Interface: Web Speech API + OpenAI Whisper
├── Real-time Chat: WebSockets (Socket.io) or Server-Sent Events
└── Accessibility: High contrast, large text, voice-first design

Backend: Next.js API Routes + Server Actions (✅ Already have)
├── AI Integration: OpenAI GPT-4 + Whisper + TTS
├── Vector Database: Pinecone or Supabase Vector
├── Document Processing: LangChain for research paper ingestion
└── Analytics: Custom pattern recognition algorithms

Database: PostgreSQL (Neon) (✅ Already have)
├── Users (anonymized): age_year, registration_date, user_id
├── Crash Reports: symptoms, triggers, activities, duration, severity
├── Conversations: chat history, recommendations given
├── Research Papers: vectorized content for RAG
└── Analytics: patterns, trigger rankings, recovery insights

Infrastructure:
├── Hosting: Netlify (✅ Already have)
├── Database: Neon PostgreSQL (✅ Already have)
├── File Storage: Cloudflare R2 or AWS S3 (for audio files)
├── Monitoring: Highlight.io (✅ Already have)
└── APIs: OpenAI, research paper APIs (PubMed, etc.)
```

## 🎯 **MVP Development Phases**

### **Phase 1 (Month 1-2): Core Foundation**

- ✅ **User system** (already have)
- 🔨 **Basic chat interface** with text
- 🔨 **Crash report form** (structured data collection)
- 🔨 **OpenAI integration** for basic conversations

### **Phase 2 (Month 2-3): Speech & Intelligence**

- 🔨 **Speech-to-text** integration (OpenAI Whisper)
- 🔨 **Text-to-speech** for responses
- 🔨 **Intelligent interviewing** (follow-up questions)
- 🔨 **Basic pattern recognition**

### **Phase 3 (Month 3-4): Knowledge & Analytics**

- 🔨 **Research paper ingestion** system
- 🔨 **Vector database** for medical knowledge
- 🔨 **Historical tracking** and visualization
- 🔨 **Trigger ranking** algorithms

### **Phase 4 (Month 4+): Advanced Features**

- 🔨 **Wearable integration** (Fitbit, Apple Health)
- 🔨 **Advanced analytics** and insights
- 🔨 **Multi-language support**
- 🔨 **Mobile app** (React Native)

## 💰 **Estimated Costs (Monthly at 10K Active Users)**

- **OpenAI API**: ~$2,000-5,000 (depends on conversation length)
- **Vector Database**: ~$200-500 (Pinecone/Supabase)
- **Infrastructure**: ~$100-300 (already mostly covered)
- **Total**: ~$2,300-5,800/month

## 📊 **Database Schema Design**

### **Users Table (Enhanced)**

```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  age_year INTEGER, -- e.g., 44 (anonymized)
  registration_date TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### **Crash Reports Table**

```sql
crash_reports (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  severity INTEGER, -- 1-10 scale
  symptoms TEXT[], -- array of symptoms
  triggers TEXT[], -- potential triggers
  activities TEXT[], -- activities before crash
  duration_hours INTEGER,
  recovery_time_hours INTEGER,
  notes TEXT,
  created_at TIMESTAMP
)
```

### **Conversations Table**

```sql
conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  crash_report_id UUID REFERENCES crash_reports(id),
  messages JSONB, -- conversation history
  recommendations TEXT[],
  status VARCHAR(50), -- active, completed, etc.
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### **Research Papers Table**

```sql
research_papers (
  id UUID PRIMARY KEY,
  title TEXT,
  authors TEXT[],
  journal VARCHAR(255),
  publication_date DATE,
  doi VARCHAR(255),
  abstract TEXT,
  content_vector VECTOR(1536), -- for similarity search
  tags TEXT[],
  created_at TIMESTAMP
)
```

### **User Analytics Table**

```sql
user_analytics (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  total_crashes INTEGER,
  avg_severity DECIMAL,
  common_triggers TEXT[],
  recovery_trends JSONB,
  last_calculated TIMESTAMP
)
```

## 🔧 **Technical Implementation Details**

### **AI Integration**

- **OpenAI GPT-4** for conversational AI
- **OpenAI Whisper** for speech-to-text
- **OpenAI TTS** for text-to-speech
- **Custom prompts** for medical interview scenarios
- **RAG (Retrieval Augmented Generation)** with research papers

### **Speech Interface**

- **Web Speech API** for browser-based speech recognition
- **Audio recording** and streaming to OpenAI Whisper
- **Real-time transcription** display
- **Voice activity detection** for natural conversation flow

### **Pattern Recognition**

- **Trigger frequency analysis** across user base
- **Severity correlation** with activities/triggers
- **Recovery time patterns** based on crash characteristics
- **Seasonal/temporal** pattern detection

### **Research Paper Ingestion**

- **PubMed API** integration for paper discovery
- **PDF processing** for full-text extraction
- **Vector embeddings** for semantic search
- **Automated tagging** and categorization

## 🚀 **Next Steps**

1. **Start with Phase 1** - Build basic chat interface
2. **Set up OpenAI integration** for conversational AI
3. **Design crash report data schema**
4. **Create speech interface** prototype

## 🔐 **Security & Privacy Considerations**

- **No PII storage** - Only anonymized data
- **Encrypted data** at rest and in transit
- **GDPR compliance** for data deletion requests
- **Audit logging** for all AI interactions
- **Rate limiting** to prevent abuse
- **Data retention policies** for conversations

## 📱 **Accessibility Features**

- **High contrast mode** for light sensitivity
- **Large text options** for cognitive issues
- **Voice-first interface** to reduce screen time
- **Keyboard navigation** support
- **Screen reader compatibility**
- **Reduced motion** options for vestibular issues

## 🌍 **Future Internationalization**

- **Multi-language support** for speech recognition
- **Localized medical terminology**
- **Cultural adaptation** of recommendations
- **Regional research paper** integration
- **Time zone awareness** for global users

---

_This document serves as the technical blueprint for the Long COVID AI Agent project, building upon the existing Next.js foundation to create a compassionate, intelligent tool for PEM management and recovery acceleration._
