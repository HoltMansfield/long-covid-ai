"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/lib/openai";
import { sendChatMessage } from "@/app/chat/actions";

interface AlanVoiceChatInterfaceProps {
  initialMessages?: ChatMessage[];
  disabled?: boolean;
}

export default function AlanVoiceChatInterface({ 
  initialMessages = [], 
  disabled = false 
}: AlanVoiceChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isAlanReady, setIsAlanReady] = useState(false);
  const alanBtnInstance = useRef<any>(null);

  useEffect(() => {
    // Dynamically import Alan AI to avoid SSR issues
    const initAlan = async () => {
      try {
        const alanBtn = (await import('@alan-ai/alan-sdk-web')).default;
        
        // Initialize Alan AI
        alanBtnInstance.current = alanBtn({
          key: process.env.NEXT_PUBLIC_ALAN_AI_KEY || 'demo-key', // We'll need to set this
          onCommand: (commandData: any) => {
            console.log('Alan command received:', commandData);
            handleAlanCommand(commandData);
          },
          onConnectionStatus: (status: string) => {
            console.log('Alan connection status:', status);
            if (status === 'authorized' && conversationCount === 0) {
              // Auto-start the crash interview when Alan is ready
              setTimeout(() => {
                startCrashInterview();
              }, 1000);
            }
          },
          rootEl: document.getElementById('alan-btn-container') || undefined,
        });

        setIsAlanReady(true);
        console.log('✅ Alan AI initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing Alan AI:', error);
        setError('Failed to initialize voice assistant. Please refresh the page.');
      }
    };

    initAlan();

    // Cleanup
    return () => {
      if (alanBtnInstance.current) {
        alanBtnInstance.current.remove();
      }
    };
  }, []);

  const startCrashInterview = () => {
    if (!alanBtnInstance.current) return;
    
    setConversationCount(1);
    
    // Start the crash report interview
    const interviewText = "I understand you've experienced a crash. I'm here to help you understand what might have triggered it. Let's start simple - on a scale of 1 to 10, how severe was this crash for you?";
    
    alanBtnInstance.current.playText(interviewText);
    
    // Add the AI message to our conversation history
    const aiMessage: ChatMessage = { role: "assistant", content: interviewText };
    setMessages(prev => [...prev, aiMessage]);
  };

  const handleAlanCommand = async (commandData: any) => {
    console.log('Processing Alan command:', commandData);
    
    if (commandData.command === 'user_response') {
      // User spoke something - process it as a chat message
      const userText = commandData.text || commandData.transcript;
      
      if (userText) {
        await processUserResponse(userText);
      }
    }
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
        
        // Have Alan speak the AI response
        if (alanBtnInstance.current) {
          alanBtnInstance.current.playText(result.message);
        }
      } else {
        console.error('Failed to send message:', result.error);
        setError('Failed to get response. Please try again.');
        if (alanBtnInstance.current) {
          alanBtnInstance.current.playText("Sorry, I didn't catch that. Could you try again?");
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('An error occurred. Please try again.');
      if (alanBtnInstance.current) {
        alanBtnInstance.current.playText("Sorry, something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  if (!isAlanReady) {
    return (
      <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm border">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Initializing Voice Assistant...</h3>
            <p className="text-gray-600">
              Setting up your AI voice assistant for Long COVID support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-6 border-b bg-white/50 backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Voice Assistant</h2>
          <p className="text-gray-600">
            {conversationCount === 0 
              ? "Click the voice button to start our conversation"
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
            {isListening && (
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
            {!isListening && !isLoading && (
              <div className="text-gray-500">
                <span className="text-xl">
                  {conversationCount === 0 
                    ? "Ready to start" 
                    : "Ready for your response"
                  }
                </span>
              </div>
            )}
          </div>

          {/* Alan AI Button Container */}
          <div id="alan-btn-container" className="mb-8">
            {/* Alan AI button will be rendered here */}
          </div>

          {/* Instructions */}
          <div className="mt-8 max-w-md mx-auto">
            <p className="text-lg text-gray-600 mb-4">
              {isListening 
                ? "I'm listening... speak naturally"
                : isLoading
                ? "Processing your response..."
                : conversationCount === 0
                ? "Click the voice button to start our crash interview"
                : "The conversation will continue automatically"
              }
            </p>
            <p className="text-sm text-gray-500">
              💡 This is powered by Alan AI for the most natural voice conversation experience.
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
