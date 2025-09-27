import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AlanVoiceChatInterface from '@/components/AlanVoiceChatInterface';
import { createCrashReportInterview } from '@/lib/openai';

export default async function VoiceChatPage() {
  // Check if user is logged in
  const cookieStore = await cookies();
  const sessionUser = cookieStore.get('session_user');

  if (!sessionUser) {
    redirect('/login');
  }

  // Initialize with crash report interview
  const initialMessages = createCrashReportInterview();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Support Assistant - Voice Chat
          </h1>
          <p className="text-gray-600">
            Voice-first conversation designed for when typing is difficult.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Voice-First Experience
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Designed for when typing feels overwhelming</li>
                  <li>Just speak naturally - the AI will understand</li>
                  <li>Works best in Chrome browser</li>
                  <li>Your voice is processed securely and not stored</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[600px]">
          <AlanVoiceChatInterface initialMessages={initialMessages} />
        </div>

        <div className="mt-6 bg-white rounded-lg border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Voice Chat Benefits
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Less Cognitive Load</h4>
              <p className="text-sm text-gray-600 mt-1">
                Speaking requires less mental energy than typing
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Faster Expression</h4>
              <p className="text-sm text-gray-600 mt-1">
                Express complex thoughts without struggling with words
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Natural Conversation</h4>
              <p className="text-sm text-gray-600 mt-1">
                More like talking to a supportive friend
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
