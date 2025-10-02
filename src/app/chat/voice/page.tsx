import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import VoiceChatPageClient from '@/components/VoiceChatPageClient';

export default async function VoiceChatPage() {
  // Check if user is logged in
  const cookieStore = await cookies();
  const sessionUser = cookieStore.get('session_user');

  if (!sessionUser) {
    redirect('/login');
  }

  // Get agent ID from environment variable
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!agentId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">
              ⚠️ ElevenLabs Agent Not Configured
            </h2>
            <p className="text-yellow-700 mb-4">
              Please set up your ElevenLabs agent and add the ELEVENLABS_AGENT_ID to your .env.local file.
            </p>
            <p className="text-sm text-yellow-600">
              See <code className="bg-yellow-100 px-2 py-1 rounded">ELEVENLABS_SETUP.md</code> for detailed instructions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <VoiceChatPageClient agentId={agentId} />;
}

