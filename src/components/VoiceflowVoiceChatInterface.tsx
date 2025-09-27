"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/lib/openai";
import { sendChatMessage } from "@/app/chat/actions";

interface VoiceflowVoiceChatInterfaceProps {
  initialMessages?: ChatMessage[];
  disabled?: boolean;
}

export default function VoiceflowVoiceChatInterface({ 
  initialMessages = [], 
  disabled = false 
}: VoiceflowVoiceChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const voiceflowClient = useRef<any>(null);

  // Initialize Voiceflow and Speech Recognition
  useEffect(() => {
    const initVoiceflow = async () => {
      try {
        // Initialize Voiceflow Runtime Client
        const { RuntimeClientFactory } = await import('@voiceflow/runtime-client-js');
        
        const versionID = process.env.NEXT_PUBLIC_VOICEFLOW_VERSION_ID;
        const apiKey = process.env.NEXT_PUBLIC_VOICEFLOW_API_KEY;
        
        if (!versionID || !apiKey) {
          setError('Voiceflow configuration missing. Please add NEXT_PUBLIC_VOICEFLOW_VERSION_ID and NEXT_PUBLIC_VOICEFLOW_API_KEY to your environment.');
          return;
        }

        voiceflowClient.current = RuntimeClientFactory({
          versionID,
          apiKey,
          endpoint: 'https://general-runtime.voiceflow.com'
        });

        console.log('✅ Voiceflow initialized');
      } catch (error) {
        console.error('❌ Error initializing Voiceflow:', error);
        setError('Failed to initialize Voiceflow. Using fallback mode.');
      }
    };

    const initSpeechRecognition = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSupported(true);
        
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setCurrentTranscript('');
            processUserInput(finalTranscript);
            setIsListening(false);
          } else {
            setCurrentTranscript(interimTranscript);
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setError('Speech recognition not supported in this browser. Please use Chrome.');
      }
    };

    initVoiceflow();
    initSpeechRecognition();
  }, []);

  // Auto-start crash interview
  useEffect(() => {
    if (isSupported && conversationCount === 0) {
      setTimeout(() => {
        startCrashInterview();
      }, 1000);
    }
  }, [isSupported]);

  const startCrashInterview = () => {
    setConversationCount(1);
    
    const interviewText = "I understand you've experienced a crash. I'm here to help you understand what might have triggered it. Let's start simple - on a scale of 1 to 10, how severe was this crash for you?";
    
    // Add AI message to conversation
    const aiMessage: ChatMessage = { role: "assistant", content: interviewText };
    setMessages(prev => [...prev, aiMessage]);
    
    // Speak the question and auto-start listening
    speakText(interviewText);
  };

  const processUserInput = async (userText: string) => {
    if (!userText.trim() || isLoading || disabled) return;

    const userMessage: ChatMessage = { role: "user", content: userText.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setConversationCount(prev => prev + 1);

    try {
      let aiResponse = '';

      // Try Voiceflow first, fallback to OpenAI
      if (voiceflowClient.current) {
        try {
          const response = await voiceflowClient.current.sendText(userText.trim());
          if (response && response.length > 0) {
            // Extract text from Voiceflow response
            const textResponse = response.find((item: any) => item.type === 'text');
            if (textResponse && textResponse.payload?.message) {
              aiResponse = textResponse.payload.message;
            }
          }
        } catch (vfError) {
          console.error('Voiceflow error, falling back to OpenAI:', vfError);
        }
      }

      // Fallback to OpenAI if Voiceflow fails or no response
      if (!aiResponse) {
        const result = await sendChatMessage(updatedMessages);
        if (result.success && result.message) {
          aiResponse = result.message;
        } else {
          aiResponse = "Sorry, I didn't catch that. Could you try again?";
        }
      }

      if (aiResponse) {
        const aiMessage: ChatMessage = { role: "assistant", content: aiResponse };
        setMessages(prev => [...prev, aiMessage]);
        
        // Speak the AI response
        speakText(aiResponse);
      }
    } catch (error) {
      console.error('Error processing user input:', error);
      setError('An error occurred. Please try again.');
      speakText("Sorry, something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        
        // Auto-start listening after AI finishes speaking
        setTimeout(() => {
          if (!isListening && !isLoading && !disabled && recognitionRef.current) {
            console.log('🎤 Auto-starting listening after AI response');
            startListening();
          }
        }, 500);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current || !isSupported || isSpeaking) return;
    
    // Stop any ongoing speech first
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    
    setError(null);
    setCurrentTranscript("");
    setIsListening(true);
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      setError('Failed to start listening. Please try again.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const stopSpeaking = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm border">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Voice Chat Not Available</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Voice chat requires Chrome browser with speech recognition support.
            </p>
            <a 
              href="/chat/text" 
              className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg"
            >
              Switch to Text Chat →
            </a>
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
            {isSpeaking && (
              <div className="flex items-center justify-center space-x-3 text-purple-600">
                <div className="flex space-x-1">
                  <div className="w-2 h-6 bg-purple-500 rounded animate-pulse"></div>
                  <div className="w-2 h-8 bg-purple-400 rounded animate-pulse" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-4 bg-purple-300 rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-7 bg-purple-500 rounded animate-pulse" style={{animationDelay: '0.3s'}}></div>
                  <div className="w-2 h-5 bg-purple-400 rounded animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
                <span className="text-xl font-medium">Speaking...</span>
              </div>
            )}
            {!isListening && !isLoading && !isSpeaking && (
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
          {currentTranscript && (
            <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-800">
                {currentTranscript}
                <span className="animate-pulse">|</span>
              </p>
            </div>
          )}

          {/* Main Voice Button */}
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={disabled || isLoading || isSpeaking}
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-8 focus:ring-offset-4 disabled:cursor-not-allowed shadow-2xl ${
              isListening
                ? "bg-red-500 hover:bg-red-600 focus:ring-red-300 animate-pulse scale-110"
                : isSpeaking
                ? "bg-purple-500 focus:ring-purple-300 cursor-not-allowed"
                : conversationCount === 0
                ? "bg-green-500 hover:bg-green-600 focus:ring-green-300 disabled:bg-gray-300 hover:scale-105"
                : "bg-gray-400 hover:bg-gray-500 focus:ring-gray-300 disabled:bg-gray-300"
            }`}
            title={
              isListening 
                ? "Click to stop listening" 
                : isSpeaking 
                ? "AI is speaking..." 
                : conversationCount === 0
                ? "Click to start our conversation"
                : "Click if you need to speak again"
            }
          >
            {isListening ? (
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
            ) : isSpeaking ? (
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a3 3 0 106 0v-5a3 3 0 00-6 0v5z" />
              </svg>
            ) : (
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          {/* Stop Speaking Button */}
          {isSpeaking && (
            <div className="mt-6">
              <button
                onClick={stopSpeaking}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Stop Speaking
              </button>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 max-w-md mx-auto">
            <p className="text-lg text-gray-600 mb-4">
              {isListening 
                ? "I'm listening... speak naturally"
                : isLoading
                ? "Processing your response..."
                : isSpeaking
                ? "I'm responding to you..."
                : conversationCount === 0
                ? "I'll start our conversation in just a moment"
                : "I'll automatically start listening after I finish speaking"
              }
            </p>
            <p className="text-sm text-gray-500">
              💡 Powered by Voiceflow for intelligent conversation management with OpenAI fallback.
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
