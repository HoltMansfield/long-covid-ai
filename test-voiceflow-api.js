// Test Voiceflow API credentials directly
import { config } from 'dotenv';
config({ path: '.env.local' });

async function testVoiceflowAPI() {
  const apiKey = process.env.VOICEFLOW_API_KEY;
  const versionID = process.env.VOICEFLOW_VERSION_ID;
  const endpoint = process.env.VOICEFLOW_ENDPOINT || 'https://general-runtime.voiceflow.com';
  
  console.log('🧪 Testing Voiceflow API...');
  console.log('📋 API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : 'MISSING');
  console.log('📋 Version ID:', versionID || 'MISSING');
  console.log('📋 Endpoint:', endpoint);
  
  if (!apiKey || !versionID) {
    console.error('❌ Missing required environment variables');
    return;
  }
  
  try {
    // Test with a simple HTTP request first
    const response = await fetch(`${endpoint}/state/user/test123/interact`, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
        'versionID': versionID
      },
      body: JSON.stringify({
        action: {
          type: 'text',
          payload: 'Hello'
        }
      })
    });
    
    console.log('📡 Response Status:', response.status);
    console.log('📡 Response Headers:', Object.fromEntries(response.headers));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Key is valid!');
      console.log('📦 Response:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', response.status, errorText);
      
      if (response.status === 401) {
        console.log('💡 Suggestions:');
        console.log('   - Check if API key is correct in Voiceflow dashboard');
        console.log('   - Make sure you copied the Dialog Manager API key');
        console.log('   - Verify the project is published');
        console.log('   - Check if the version ID matches your project');
      }
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testVoiceflowAPI();
