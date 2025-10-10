"use client";

import { useConversation } from "@11labs/react";
import { useCallback, useState, useEffect, useRef } from "react";
import { getElevenLabsSignedUrl, handleVoiceChatMessage } from "@/actions/elevenlabs";
import { ChatMessage } from "@/lib/openai";

interface ElevenLabsVoiceChatInterfaceProps {
  agentId: string;
  onConversationEnd?: (transcript: string, messages: ChatMessage[]) => void;
}

export default function ElevenLabsVoiceChatInterface({
  agentId,
  onConversationEnd,
}: ElevenLabsVoiceChatInterfaceProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const conversationHistory = useRef<ChatMessage[]>([]);

  // Initialize conversation with signed URL and client tools
  const conversation = useConversation({
    clientTools: {
      getAIResponse: async (params: { userMessage: string }) => {
        console.log('🔧 CLIENT TOOL CALLED:', params);
        try {
          const response = await handleVoiceChatMessage(
            params.userMessage,
            conversationHistory.current
          );
          console.log('✅ Returning to ElevenLabs:', response);
          return response;
        } catch (error) {
          console.error('❌ Error in client tool:', error);
          return "I'm having trouble right now. Please try again.";
        }
      }
    },
    onConnect: () => {
      console.log("✅ Connected to ElevenLabs");
    },
    onDisconnect: () => {
      console.log("❌ Disconnected from ElevenLabs");
      if (onConversationEnd && conversationHistory.current.length > 0) {
        onConversationEnd(transcript, conversationHistory.current);
      }
    },
    onMessage: (message) => {
      console.log("📨 Message:", message);
      // Append to transcript
      if (message.message) {
        setTranscript((prev) => prev + "\n" + message.message);
        
        // Track conversation history
        if (message.source === 'user') {
          conversationHistory.current.push({
            role: 'user',
            content: message.message
          });
        } else if (message.source === 'ai') {
          conversationHistory.current.push({
            role: 'assistant',
            content: message.message
          });
        }
      }
    },
    onError: (error) => {
      console.error("❌ ElevenLabs error:", error);
      setError(String(error) || "An error occurred");
    },
  });

  // Fetch signed URL on mount
  useEffect(() => {
    async function fetchSignedUrl() {
      try {
        console.log("🔑 Fetching signed URL for agent:", agentId);
        const url = await getElevenLabsSignedUrl(agentId);
        console.log("📝 Received signed URL:", url ? "✅ Success" : "❌ Failed");
        if (url) {
          setSignedUrl(url);
        } else {
          setError("Failed to get signed URL - check server logs");
        }
      } catch (err) {
        console.error("Error fetching signed URL:", err);
        setError("Failed to initialize conversation: " + (err instanceof Error ? err.message : String(err)));
      }
    }

    fetchSignedUrl();
  }, [agentId]);

  const startConversation = useCallback(async () => {
    if (!signedUrl) {
      setError("No signed URL available");
      return;
    }

    try {
      setError(null);
      console.log('🚀 Starting conversation with first message override');
      
      await conversation.startSession({ 
        signedUrl,
        overrides: {
          agent: {
            firstMessage: "I understand you've experienced a crash. I'm here to help you understand what might have triggered it. Let's start simple - on a scale of 1 to 10, how severe was this crash for you?"
          }
        }
      });
      
      console.log('✅ Session started successfully');
    } catch (err) {
      console.error("Error starting conversation:", err);
      setError("Failed to start conversation");
    }
  }, [signedUrl, conversation]);

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (err) {
      console.error("Error stopping conversation:", err);
    }
  }, [conversation]);

  const { status } = conversation;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          AI Voice Assistant
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Powered by ElevenLabs Conversational AI
        </p>

        {/* Status Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div
            className={`w-4 h-4 rounded-full mr-3 ${
              status === "connected"
                ? "bg-green-500 animate-pulse"
                : status === "connecting"
                ? "bg-yellow-500 animate-pulse"
                : "bg-gray-300"
            }`}
          />
          <span className="text-sm font-medium text-gray-700">
            {status === "connected"
              ? "Connected"
              : status === "connecting"
              ? "Connecting..."
              : "Disconnected"}
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={startConversation}
            disabled={status === "connected" || !signedUrl}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {status === "connecting" ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Connecting...
              </span>
            ) : (
              "🎤 Start Conversation"
            )}
          </button>

          <button
            onClick={stopConversation}
            disabled={status !== "connected"}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            ⏹️ End Conversation
          </button>
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Conversation Transcript
            </h3>
            <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {transcript}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Make sure your microphone is enabled and
            you're using Chrome or Edge for the best experience.
          </p>
        </div>
      </div>
    </div>
  );
}
