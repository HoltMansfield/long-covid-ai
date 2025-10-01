// Test Voiceflow SDK directly
import { config } from 'dotenv';
config({ path: '.env.local' });

async function testVoiceflowSDK() {
  const apiKey = process.env.VOICEFLOW_API_KEY;
  const versionID = process.env.VOICEFLOW_VERSION_ID;
  const endpoint = process.env.VOICEFLOW_ENDPOINT || 'https://general-runtime.voiceflow.com';
  
  console.log('🧪 Testing Voiceflow SDK...');
  console.log('📋 API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : 'MISSING');
  console.log('📋 Version ID:', versionID || 'MISSING');
  console.log('📋 Endpoint:', endpoint);
  
  try {
    // Import the Voiceflow SDK
    const { RuntimeClientFactory } = await import('@voiceflow/runtime-client-js');
    
    console.log('✅ SDK imported successfully');
    
    // Create the factory
    const factory = new RuntimeClientFactory({
      versionID: versionID,
      apiKey: apiKey,
      endpoint: endpoint,
    });
    
    console.log('✅ Factory created successfully');
    
    // Create the client
    const client = factory.createClient();
    
    console.log('✅ Client created successfully');
    
    // Try to start a session
    console.log('🚀 Starting session...');
    await client.start();
    
    console.log('✅ Session started successfully');
    
    // Try to send a message
    console.log('💬 Sending test message...');
    const response = await client.sendText('Hello');
    
    console.log('✅ Message sent successfully!');
    console.log('📦 Response:', JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error('❌ SDK Error:', error.message);
    console.error('📋 Error Details:', error);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('💡 API Key Issues:');
      console.log('   - Make sure you copied the Dialog Manager API key');
      console.log('   - Check if the project is published in Voiceflow');
      console.log('   - Verify you have the correct permissions');
    } else if (error.message.includes('404') || error.message.includes('Not Found')) {
      console.log('💡 Version ID Issues:');
      console.log('   - Check if the Version ID is correct');
      console.log('   - Make sure the project exists and is accessible');
    }
  }
}

testVoiceflowSDK();
