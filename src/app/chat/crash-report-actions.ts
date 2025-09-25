"use server";

import { db } from "@/db/connect";
import { crashReports, conversations } from "@/db/schema";
import { withHighlightError } from "@/highlight-error";
import { StructuredCrashReport } from "@/types/crash-report";
import { ChatMessage } from "@/lib/openai";
import { eq } from "drizzle-orm";

interface SaveCrashReportResult {
  success: boolean;
  crashReportId?: string;
  error?: string;
}

async function _saveCrashReport(
  userId: string,
  crashReportData: StructuredCrashReport,
  conversationMessages: ChatMessage[]
): Promise<SaveCrashReportResult> {
  try {
    // First, save the conversation
    const [conversation] = await db.insert(conversations).values({
      userId,
      messages: conversationMessages,
      status: 'completed'
    }).returning();

    // Then save the crash report with reference to conversation
    const [crashReport] = await db.insert(crashReports).values({
      userId,
      severity: crashReportData.severity,
      triggers: crashReportData.triggers,
      symptoms: crashReportData.symptoms,
      timeline: crashReportData.timeline,
      activities: crashReportData.activities,
      recoveryStrategies: crashReportData.recoveryStrategies || [],
      environmentalFactors: crashReportData.environmentalFactors || [],
      conversationId: conversation.id,
      aiSummary: crashReportData.aiSummary,
      rawConversation: conversationMessages
    }).returning();

    // Update conversation with crash report reference
    await db.update(conversations)
      .set({ crashReportId: crashReport.id })
      .where(eq(conversations.id, conversation.id));

    return {
      success: true,
      crashReportId: crashReport.id
    };
  } catch (error) {
    console.error("Error saving crash report:", error);
    return {
      success: false,
      error: "Failed to save crash report"
    };
  }
}


export const saveCrashReport = withHighlightError(_saveCrashReport);

// Function to get user's crash reports for analysis
async function _getUserCrashReports(userId: string) {
  try {
    const reports = await db.select()
      .from(crashReports)
      .where(eq(crashReports.userId, userId))
      .orderBy(crashReports.createdAt);
    
    return {
      success: true,
      reports
    };
  } catch (error) {
    console.error("Error fetching crash reports:", error);
    return {
      success: false,
      error: "Failed to fetch crash reports"
    };
  }
}

export const getUserCrashReports = withHighlightError(_getUserCrashReports);
