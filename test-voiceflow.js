// Simple manual test for Voiceflow integration

async function testVoiceflowAPI() {
  console.log('🧪 Testing Voiceflow SSE API...');
  
  try {
    const response = await fetch('http://localhost:3000/api/voiceflow/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, this is a test message',
        sessionId: 'test-session-123'
      }),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers));

    if (response.status === 200) {
      console.log('✅ SSE endpoint is working!');
      console.log('📄 Content-Type:', response.headers.get('content-type'));
      
      // Try to read a bit of the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      setTimeout(async () => {
        try {
          const { value } = await reader.read();
          if (value) {
            console.log('📦 Sample SSE data:', decoder.decode(value));
          }
          reader.releaseLock();
        } catch (e) {
          console.log('⚠️ Stream reading completed or timed out');
        }
      }, 1000);
      
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testVoiceChatPage() {
  console.log('🧪 Testing Voice Chat page accessibility...');
  
  try {
    const response = await fetch('http://localhost:3000/chat/voice');
    console.log('📄 Voice chat page status:', response.status);
    
    if (response.status === 200) {
      console.log('✅ Voice chat page is accessible!');
    } else {
      console.log('❌ Voice chat page error:', response.status);
    }
  } catch (error) {
    console.error('❌ Page test failed:', error.message);
  }
}

// Run tests
console.log('🚀 Starting Voiceflow Integration Tests...\n');

testVoiceChatPage()
  .then(() => testVoiceflowAPI())
  .then(() => {
    console.log('\n🎉 Manual tests completed!');
    console.log('💡 To test the full voice interface:');
    console.log('   1. Open http://localhost:3000/chat/voice in Chrome');
    console.log('   2. Allow microphone permissions');
    console.log('   3. Click the voice button to start conversation');
    console.log('   4. Test both Voiceflow and OpenAI fallback');
  })
  .catch(console.error);
