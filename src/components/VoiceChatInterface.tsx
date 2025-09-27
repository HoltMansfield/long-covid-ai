"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/lib/openai";
import { sendChatMessage } from "@/app/chat/actions";

interface VoiceChatInterfaceProps {
  initialMessages?: ChatMessage[];
  disabled?: boolean;
}

export default function VoiceChatInterface({ 
  initialMessages = [], 
  disabled = false 
}: VoiceChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check for Speech Recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
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
          setCurrentTranscript(finalTranscript);
          sendVoiceMessage(finalTranscript);
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
  }, []);

  const sendVoiceMessage = async (transcript: string) => {
    if (!transcript.trim() || isLoading || disabled) return;

    const userMessage: ChatMessage = { role: "user", content: transcript.trim() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setCurrentTranscript("");

    try {
      const result = await sendChatMessage([...messages, userMessage]);
      
      if (result.success && result.message) {
        const aiMessage: ChatMessage = { role: "assistant", content: result.message };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        console.error('Failed to send message:', result.error);
        setError('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current || !isSupported) return;
    
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

  const clearError = () => {
    setError(null);
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm border">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Chat Not Available</h3>
            <p className="text-gray-600 mb-4">
              Voice chat requires Chrome browser with speech recognition support.
            </p>
            <a 
              href="/chat/text" 
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Switch to Text Chat →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Voice Chat</h2>
            <p className="text-sm text-gray-600">Speak naturally - I'm listening</p>
          </div>
          <div className="flex items-center space-x-2">
            {isListening && (
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Listening...</span>
              </div>
            )}
            {isLoading && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Thinking...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === "user"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {/* Current transcript display */}
        {currentTranscript && (
          <div className="flex justify-end">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-green-200 text-green-800 border-2 border-green-300">
              <p className="text-sm whitespace-pre-wrap italic">
                {currentTranscript}
                <span className="animate-pulse">|</span>
              </p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Controls */}
      <div className="p-6 border-t bg-gray-50 rounded-b-lg">
        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
            <button 
              onClick={clearError}
              className="text-xs text-red-600 hover:text-red-800 underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex flex-col items-center space-y-4">
          {/* Main voice button */}
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={disabled || isLoading}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:cursor-not-allowed ${
              isListening
                ? "bg-red-500 hover:bg-red-600 focus:ring-red-500 animate-pulse"
                : "bg-green-500 hover:bg-green-600 focus:ring-green-500 disabled:bg-gray-300"
            }`}
            title={isListening ? "Stop listening" : "Start speaking"}
          >
            {isListening ? (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          {/* Instructions */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              {isListening 
                ? "Speak now... Click the button when you're done"
                : isLoading
                ? "Processing your message..."
                : "Click the microphone and start speaking"
              }
            </p>
            <p className="text-xs text-gray-500">
              💡 Tip: Speak clearly and pause when finished. The AI understands natural conversation.
            </p>
          </div>

          {/* Alternative text input link */}
          <div className="pt-2 border-t border-gray-200 w-full text-center">
            <a 
              href="/chat/text" 
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Switch to text chat instead
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
