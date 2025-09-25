"use server";

import { generateAIResponse, ChatMessage } from "@/lib/openai";
import { withHighlightError } from "@/highlight-error";
import { extractCrashReportFromConversation } from "@/lib/crash-analysis";
import { saveCrashReport } from "./crash-report-actions";
import { getCurrentUserId } from "@/actions/auth";

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

    // Create updated messages array with AI response
    const updatedMessages: ChatMessage[] = [
      ...validMessages,
      { role: "assistant", content: aiResponse }
    ];

    // Try to detect and save crash report automatically
    try {
      const userId = await getCurrentUserId();
      if (userId && updatedMessages.length >= 4) { // Only try if we have enough conversation
        const crashReport = await extractCrashReportFromConversation(updatedMessages);
        if (crashReport) {
          console.log("Crash report detected, saving...");
          const saveResult = await saveCrashReport(userId, crashReport, updatedMessages);
          if (saveResult.success) {
            console.log("Crash report saved successfully:", saveResult.crashReportId);
          } else {
            console.error("Failed to save crash report:", saveResult.error);
          }
        }
      }
    } catch (error) {
      // Don't fail the chat if crash report saving fails
      console.error("Error in crash report detection/saving:", error);
    }

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
