import { openai } from '@/lib/openai';
import { env } from '@/env';

export default async function TestOpenAIPage() {
  let result: {
    success?: boolean;
    message?: string;
    model?: string;
    usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    configured?: boolean;
    error?: string;
  } = {};
  let error: string | null = null;

  try {
    // Check if API key is configured
    if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured');
    }

    // Test OpenAI API call
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: 'Say "Hello, Long COVID AI is working perfectly!"' }
      ],
      max_tokens: 50,
    });

    result = {
      success: true,
      message: response.choices[0]?.message?.content || undefined,
      model: 'gpt-4o-mini',
      usage: response.usage || undefined,
      configured: true
    };

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    error = errorMessage;
    result = {
      success: false,
      error: errorMessage,
      configured: !!env.OPENAI_API_KEY
    };
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          OpenAI Integration Test
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          {result.success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-medium text-green-800 mb-2">
                  ✅ Success!
                </h3>
                <p className="text-green-700">
                  <strong>AI Response:</strong> {result.message}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800">Model Used</h4>
                  <p className="text-blue-700">{result.model}</p>
                </div>
                
                {result.usage && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-800">Token Usage</h4>
                    <p className="text-purple-700">
                      Input: {result.usage.prompt_tokens}, 
                      Output: {result.usage.completion_tokens}, 
                      Total: {result.usage.total_tokens}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">What This Means</h4>
                <ul className="text-gray-700 space-y-1">
                  <li>✅ OpenAI API key is valid and active</li>
                  <li>✅ Billing is set up correctly</li>
                  <li>✅ GPT-4o mini model is accessible</li>
                  <li>✅ Your Long COVID AI Assistant should work!</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-lg font-medium text-red-800 mb-2">
                ❌ Error
              </h3>
              <p className="text-red-700 mb-4">
                <strong>Error:</strong> {error}
              </p>
              
              <div className="text-sm text-red-600">
                <h4 className="font-medium mb-2">Troubleshooting:</h4>
                <ul className="space-y-1">
                  <li>• Check if your OpenAI API key is correct</li>
                  <li>• Verify billing is set up in your OpenAI account</li>
                  <li>• Ensure you have credits available</li>
                  <li>• Try regenerating your API key</li>
                </ul>
              </div>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-800 mb-2">Configuration Status</h4>
            <div className="text-sm text-gray-600">
              <p>API Key Configured: {result.configured ? '✅ Yes' : '❌ No'}</p>
              <p>Environment: {env.APP_ENV}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <a 
            href="/chat" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            🚀 Try the Long COVID AI Assistant
          </a>
        </div>
      </div>
    </div>
  );
}
