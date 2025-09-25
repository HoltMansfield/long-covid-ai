"use server";

import { generateAIResponse, ChatMessage } from "@/lib/openai";
import { withHighlightError } from "@/highlight-error";
import { extractCrashReportFromConversation } from "@/lib/crash-analysis";
import { saveCrashReport, updateCrashReport, findRecentCrashReport } from "./crash-report-actions";
import { getCurrentUserId } from "@/actions/auth";
import { H } from '@highlight-run/next/client';

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

    // Try to detect and save/update crash report automatically
    try {
      const userId = await getCurrentUserId();
      if (userId && updatedMessages.length >= 1) { // Try detection even with minimal conversation
        const crashReport = await extractCrashReportFromConversation(updatedMessages);
        if (crashReport) {
          console.log("Crash report detected...");
          
          // Check if there's a recent crash report to update
          const recentCrashReportId = await findRecentCrashReport(userId);
          
          let result;
          if (recentCrashReportId) {
            console.log("Updating existing crash report:", recentCrashReportId);
            result = await updateCrashReport(recentCrashReportId, crashReport, updatedMessages);
          } else {
            console.log("Creating new crash report...");
            result = await saveCrashReport(userId, crashReport, updatedMessages);
          }
          
          if (result.success) {
            console.log("Crash report processed successfully:", result.crashReportId);
          } else {
            console.error("Failed to process crash report:", result.error);
          }
        }
      }
    } catch (error) {
      // Log crash report saving errors to Highlight for monitoring
      console.error("Error in crash report detection/saving:", error);
      H.consumeError(error as Error);
      // Add additional context for debugging
      H.track('crash_report_saving_error', {
        context: 'crash_report_saving',
        userId: await getCurrentUserId(),
        messageCount: updatedMessages.length,
        errorMessage: (error as Error).message
      });
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
