"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/lib/openai";
import { sendChatMessage } from "@/app/chat/actions";
import { transcribeAudio } from "@/app/chat/speech-actions";
import { useAudioRecording } from "@/hooks/useAudioRecording";

interface ChatInterfaceProps {
  initialMessages?: ChatMessage[];
  onMessageSent?: (messages: ChatMessage[]) => void;
  disabled?: boolean;
}

export default function ChatInterface({
  initialMessages = [],
  onMessageSent,
  disabled = false,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Audio recording functionality
  const {
    isRecording,
    isSupported: isAudioSupported,
    error: audioError,
    startRecording,
    stopRecording,
    clearError: clearAudioError
  } = useAudioRecording();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || disabled) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      const result = await sendChatMessage(newMessages);

      if (!result.success) {
        throw new Error(result.error || "Failed to get AI response");
      }

      const aiMessage: ChatMessage = {
        role: "assistant",
        content: result.message || "No response received",
      };

      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);
      onMessageSent?.(finalMessages);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      // Stop recording and transcribe
      try {
        setIsTranscribing(true);
        const audioBlob = await stopRecording();
        
        if (audioBlob) {
          // Create form data for transcription
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          
          // Transcribe audio
          const result = await transcribeAudio(formData);
          
          if (result.success && result.text) {
            setInputMessage(result.text.trim());
          } else {
            console.error('Transcription failed:', result.error);
            // Could show error to user here
          }
        }
      } catch (error) {
        console.error('Error processing voice input:', error);
      } finally {
        setIsTranscribing(false);
      }
    } else {
      // Start recording
      clearAudioError();
      await startRecording();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-4 border-b bg-blue-50 rounded-t-lg">
        <h2 className="text-lg font-semibold text-gray-800">
          Long COVID Support Assistant
        </h2>
        <p className="text-sm text-gray-600">
          I&apos;m here to help you understand your PEM crashes and identify
          triggers.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg mb-2">👋 Welcome!</p>
            <p>
              I&apos;m here to help you track and understand your Long COVID
              symptoms.
            </p>
            <p className="text-sm mt-2">
              Start by telling me about a recent crash or how you&apos;re
              feeling today.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        {/* Audio error display */}
        {audioError && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{audioError}</p>
            <button 
              onClick={clearAudioError}
              className="text-xs text-red-600 hover:text-red-800 underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}
        
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                disabled
                  ? "Chat disabled"
                  : isRecording
                  ? "Recording... Click the microphone to stop"
                  : isTranscribing
                  ? "Transcribing audio..."
                  : "Type your message or use voice input... (Press Enter to send)"
              }
              disabled={disabled || isLoading || isRecording || isTranscribing}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={2}
            />
          </div>
          
          {/* Voice input button */}
          {isAudioSupported && (
            <button
              onClick={handleVoiceInput}
              disabled={disabled || isLoading || isTranscribing}
              className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${
                isRecording
                  ? "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
                  : "bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500 disabled:bg-gray-300"
              }`}
              title={isRecording ? "Stop recording" : "Start voice input"}
            >
              {isTranscribing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ...
                </span>
              ) : isRecording ? (
                "🔴 Stop"
              ) : (
                "🎤 Voice"
              )}
            </button>
          )}
          
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading || disabled || isRecording || isTranscribing}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">
            💡 Tip: Keep responses simple. I understand that brain fog can make
            complex conversations difficult.
          </p>
          {isAudioSupported && (
            <p className="text-xs text-gray-400">
              🎤 Voice input available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
