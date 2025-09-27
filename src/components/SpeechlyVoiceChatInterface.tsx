"use client";

import { useEffect, useState } from "react";
import { SpeechProvider, useSpeechContext } from "@speechly/react-client";
import { ChatMessage } from "@/lib/openai";
import { sendChatMessage } from "@/app/chat/actions";

interface SpeechlyVoiceChatInterfaceProps {
  initialMessages?: ChatMessage[];
  disabled?: boolean;
}

// Inner component that uses Speechly hooks
function SpeechlyVoiceChat({ 
  initialMessages = [], 
  disabled = false 
}: SpeechlyVoiceChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Speechly hooks
  const {
    listening,
    segment,
    start,
    stop,
  } = useSpeechContext();

  // Speech synthesis for AI responses
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        // Auto-start listening after AI finishes speaking
        setTimeout(() => {
          if (!listening && !isLoading && !disabled) {
            console.log('🎤 Auto-starting listening after AI response');
            start();
          }
        }, 500);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  // Handle when user finishes speaking (segment is finalized)
  useEffect(() => {
    if (segment?.isFinal && segment.words.length > 0) {
      const transcript = segment.words.map((word: any) => word.value).join(' ');
      console.log('Final transcript:', transcript);
      
      if (transcript.trim()) {
        processUserResponse(transcript.trim());
      }
    }
  }, [segment]);

  // Start crash interview when component mounts
  useEffect(() => {
    if (!hasStarted && !disabled) {
      setHasStarted(true);
      setTimeout(() => {
        startCrashInterview();
      }, 1000);
    }
  }, [hasStarted, disabled]);

  const startCrashInterview = () => {
    setConversationCount(1);
    
    const interviewText = "I understand you've experienced a crash. I'm here to help you understand what might have triggered it. Let's start simple - on a scale of 1 to 10, how severe was this crash for you?";
    
    // Add AI message to conversation
    const aiMessage: ChatMessage = { role: "assistant", content: interviewText };
    setMessages(prev => [...prev, aiMessage]);
    
    // Speak the question
    speakText(interviewText);
  };

  const processUserResponse = async (userText: string) => {
    if (!userText.trim() || isLoading || disabled) return;

    const userMessage: ChatMessage = { role: "user", content: userText.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setConversationCount(prev => prev + 1);

    try {
      const result = await sendChatMessage(updatedMessages);
      
      if (result.success && result.message) {
        const aiMessage: ChatMessage = { role: "assistant", content: result.message };
        setMessages(prev => [...prev, aiMessage]);
        
        // Speak the AI response
        speakText(result.message);
      } else {
        console.error('Failed to send message:', result.error);
        setError('Failed to get response. Please try again.');
        speakText("Sorry, I didn't catch that. Could you try again?");
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('An error occurred. Please try again.');
      speakText("Sorry, something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrophoneToggle = async () => {
    if (listening) {
      stop();
    } else {
      start();
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-6 border-b bg-white/50 backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Voice Assistant</h2>
          <p className="text-gray-600">
            {conversationCount === 0 
              ? "Starting our conversation..."
              : `Conversation in progress - Turn ${conversationCount}`
            }
          </p>
        </div>
      </div>

      {/* Main Voice Interface */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          {/* Status Indicator */}
          <div className="mb-8">
            {listening && (
              <div className="flex items-center justify-center space-x-3 text-green-600">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                <span className="text-xl font-medium">Listening...</span>
              </div>
            )}
            {isLoading && (
              <div className="flex items-center justify-center space-x-3 text-blue-600">
                <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xl font-medium">Processing...</span>
              </div>
            )}
            {!listening && !isLoading && (
              <div className="text-gray-500">
                <span className="text-xl">
                  {conversationCount === 0 
                    ? "Preparing to start..." 
                    : "Ready for your response"
                  }
                </span>
              </div>
            )}
          </div>

          {/* Current transcript display */}
          {segment && segment.words.length > 0 && (
            <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-800">
                {segment.words.map((word: any) => word.value).join(' ')}
                {!segment.isFinal && <span className="animate-pulse">|</span>}
              </p>
            </div>
          )}

          {/* Main Voice Button */}
          <button
            onClick={handleMicrophoneToggle}
            disabled={disabled || isLoading}
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-8 focus:ring-offset-4 disabled:cursor-not-allowed shadow-2xl ${
              listening
                ? "bg-red-500 hover:bg-red-600 focus:ring-red-300 animate-pulse scale-110"
                : "bg-green-500 hover:bg-green-600 focus:ring-green-300 disabled:bg-gray-300 hover:scale-105"
            }`}
            title={listening ? "Stop listening" : "Start speaking"}
          >
            {listening ? (
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          {/* Instructions */}
          <div className="mt-8 max-w-md mx-auto">
            <p className="text-lg text-gray-600 mb-4">
              {listening 
                ? "I'm listening... speak naturally"
                : isLoading
                ? "Processing your response..."
                : conversationCount === 0
                ? "I'll start our conversation in just a moment"
                : "I'll automatically start listening after I finish speaking"
              }
            </p>
            <p className="text-sm text-gray-500">
              💡 Powered by Speechly for natural conversation flow and real-time speech recognition.
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 mx-8 mb-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
          <button 
            onClick={clearError}
            className="text-xs text-red-600 hover:text-red-800 underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="p-6 border-t bg-white/50 backdrop-blur-sm text-center">
        <a 
          href="/chat/text" 
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Switch to text chat instead
        </a>
      </div>
    </div>
  );
}

// Main component with Speechly provider
export default function SpeechlyVoiceChatInterface(props: SpeechlyVoiceChatInterfaceProps) {
  const speechlyAppId = process.env.NEXT_PUBLIC_SPEECHLY_APP_ID;

  if (!speechlyAppId) {
    return (
      <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm border">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Voice Chat Setup Required</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Please add your Speechly App ID to the environment variables.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg text-left">
              <code className="text-sm">NEXT_PUBLIC_SPEECHLY_APP_ID=your-app-id</code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SpeechProvider appId={speechlyAppId}>
      <SpeechlyVoiceChat {...props} />
    </SpeechProvider>
  );
}
