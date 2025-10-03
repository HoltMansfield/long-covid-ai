"use client";

import { useState } from 'react';
import ElevenLabsVoiceChatInterface from '@/components/ElevenLabsVoiceChatInterface';
import { extractCrashReportFromConversation } from '@/lib/crash-analysis';
import { StructuredCrashReport } from '@/types/crash-report';

interface VoiceChatPageClientProps {
  agentId: string;
}

export default function VoiceChatPageClient({ agentId }: VoiceChatPageClientProps) {
  const [crashReport, setCrashReport] = useState<StructuredCrashReport | null>(null);
  const [extracting, setExtracting] = useState(false);

  const handleConversationEnd = async (transcript: string, messages: Array<{ role: string; content: string }>) => {
    console.log("Conversation ended. Extracting crash report...");
    
    setExtracting(true);
    try {
      const report = await extractCrashReportFromConversation(messages);
      if (report) {
        console.log("✅ Crash report extracted:", report);
        setCrashReport(report);
      } else {
        console.log("❌ No crash report could be extracted");
      }
    } catch (error) {
      console.error("Error extracting crash report:", error);
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Support Assistant - Voice Chat
          </h1>
          <p className="text-gray-600">
            Voice-first conversation powered by ElevenLabs Conversational AI
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Enhanced Voice Experience with ElevenLabs
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Ultra-realistic voice quality for natural conversations</li>
                  <li>Real-time responses with minimal latency</li>
                  <li>Designed for when typing feels overwhelming</li>
                  <li>Works best in Chrome or Edge browser</li>
                  <li>Your conversation is secure and private</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <ElevenLabsVoiceChatInterface 
            agentId={agentId}
            onConversationEnd={handleConversationEnd}
          />
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
              <h4 className="font-medium text-gray-900">Natural Conversation</h4>
              <p className="text-sm text-gray-600 mt-1">
                Ultra-realistic voice makes it feel like talking to a real person
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Empathetic Support</h4>
              <p className="text-sm text-gray-600 mt-1">
                Designed specifically for Long COVID patient needs
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            🎯 What to Expect
          </h3>
          <p className="text-sm text-gray-700">
            The AI will guide you through documenting your crash experience. It will ask about severity, 
            triggers, symptoms, and timeline. Take your time - there's no rush. You can pause or end 
            the conversation at any time.
          </p>
        </div>

        {/* Crash Report Extraction Status */}
        {extracting && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="animate-spin h-5 w-5 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-blue-800 font-medium">Analyzing conversation and extracting crash report...</p>
            </div>
          </div>
        )}

        {/* Extracted Crash Report */}
        {crashReport && (
          <div className="mt-6 bg-white border border-green-200 rounded-lg shadow-lg">
            <div className="bg-green-50 border-b border-green-200 px-6 py-4">
              <h3 className="text-xl font-bold text-green-900 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Crash Report Extracted
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {/* Severity */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Severity</h4>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-4 mr-3">
                    <div 
                      className={`h-4 rounded-full ${
                        crashReport.severity >= 8 ? 'bg-red-600' :
                        crashReport.severity >= 5 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${crashReport.severity * 10}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-lg">{crashReport.severity}/10</span>
                </div>
              </div>

              {/* AI Summary */}
              {crashReport.aiSummary && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{crashReport.aiSummary}</p>
                </div>
              )}

              {/* Triggers */}
              {crashReport.triggers && crashReport.triggers.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Triggers</h4>
                  <div className="space-y-2">
                    {crashReport.triggers.map((trigger, i) => (
                      <div key={i} className="bg-red-50 border border-red-200 rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-red-900">{trigger.type}</span>
                            <p className="text-sm text-red-700 mt-1">{trigger.description}</p>
                          </div>
                          <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">Intensity: {trigger.intensity}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Symptoms */}
              {crashReport.symptoms && crashReport.symptoms.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Symptoms</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {crashReport.symptoms.map((symptom, i) => (
                      <div key={i} className="bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="font-medium text-blue-900 text-sm">{symptom.name}</p>
                        <p className="text-xs text-blue-700">Severity: {symptom.severity}/10</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {crashReport.timeline && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Timeline</h4>
                  <div className="bg-purple-50 border border-purple-200 rounded p-3 text-sm">
                    <p><strong>Onset:</strong> {crashReport.timeline.onset}</p>
                    <p><strong>Duration:</strong> {crashReport.timeline.duration}</p>
                    {crashReport.timeline.recoveryTime && (
                      <p><strong>Recovery Time:</strong> {crashReport.timeline.recoveryTime}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
