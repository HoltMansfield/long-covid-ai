import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';
import { createCrashReportInterview } from '@/lib/openai';

export default async function ChatPage() {
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
            Long COVID AI Support Assistant
          </h1>
          <p className="text-gray-600">
            Get personalized support for managing your Long COVID symptoms and PEM crashes.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Important Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>This AI assistant helps identify patterns and triggers, not provide medical treatment</li>
                  <li>Always consult with healthcare professionals for medical advice</li>
                  <li>Your conversations help improve the system for everyone with Long COVID</li>
                  <li>All data is anonymized and used only for pattern recognition</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[600px]">
          <ChatInterface initialMessages={initialMessages} />
        </div>

        <div className="mt-6 bg-white rounded-lg border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            How This Helps
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Pattern Recognition</h4>
              <p className="text-sm text-gray-600 mt-1">
                Identify what triggers your crashes over time
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Gentle Support</h4>
              <p className="text-sm text-gray-600 mt-1">
                Low cognitive load conversations designed for brain fog
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Crash Prevention</h4>
              <p className="text-sm text-gray-600 mt-1">
                Learn to avoid triggers and pace activities better
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
