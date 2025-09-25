"use server";

import { generateAIResponse, ChatMessage } from "@/lib/openai";
import { withHighlightError } from "@/highlight-error";

interface ChatActionResult {
  success: boolean;
  message?: string;
  timestamp?: string;
  error?: string;
}

async function _sendChatMessage(messages: ChatMessage[]): Promise<ChatActionResult> {
  try {
    // Validate messages array
    if (!messages || !Array.isArray(messages)) {
      return {
        success: false,
        error: "Invalid messages format"
      };
    }

    // Validate message format
    const validMessages = messages.filter(
      (msg: unknown): msg is ChatMessage => {
        if (!msg || typeof msg !== "object" || msg === null) return false;
        if (!("role" in msg) || !("content" in msg)) return false;
        const typedMsg = msg as { role: string; content: string };
        return (
          ["user", "assistant", "system"].includes(typedMsg.role) &&
          typeof typedMsg.content === "string"
        );
      }
    );

    if (validMessages.length === 0) {
      return {
        success: false,
        error: "No valid messages provided"
      };
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(validMessages);

    return {
      success: true,
      message: aiResponse,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Chat action error:", error);
    return {
      success: false,
      error: "Internal server error"
    };
  }
}

export const sendChatMessage = withHighlightError(_sendChatMessage);
