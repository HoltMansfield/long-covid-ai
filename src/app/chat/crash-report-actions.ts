"use server";

import { db } from "@/db/connect";
import { crashReports, conversations, conversationCrashReports } from "@/db/schema";
import { StructuredCrashReport } from "@/types/crash-report";
import { ChatMessage } from "@/lib/openai";
import { eq } from "drizzle-orm";

interface SaveCrashReportResult {
  success: boolean;
  crashReportId?: string;
  error?: string;
}

export async function saveCrashReport(
  userId: string,
  crashReportData: StructuredCrashReport,
  conversationMessages: ChatMessage[]
): Promise<SaveCrashReportResult> {
  try {
    // First, save the conversation
    const conversationResult = await db.insert(conversations).values({
      userId,
      messages: conversationMessages,
      status: 'completed'
    }).returning();
    
    if (!Array.isArray(conversationResult) || conversationResult.length === 0) {
      throw new Error('Failed to create conversation');
    }
    const conversation = conversationResult[0];

    // Then save the crash report with reference to conversation
    const crashReportResult = await db.insert(crashReports).values({
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
    
    if (!Array.isArray(crashReportResult) || crashReportResult.length === 0) {
      throw new Error('Failed to create crash report');
    }
    const crashReport = crashReportResult[0];

    // Create the relationship between conversation and crash report
    await db.insert(conversationCrashReports).values({
      conversationId: conversation.id,
      crashReportId: crashReport.id
    });

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



// Function to update an existing crash report
export async function updateCrashReport(
  crashReportId: string,
  crashReportData: StructuredCrashReport,
  conversationMessages: ChatMessage[]
): Promise<SaveCrashReportResult> {
  try {
    // Update the crash report
    const updatedCrashReportResult = await db.update(crashReports)
      .set({
        severity: crashReportData.severity,
        triggers: crashReportData.triggers,
        symptoms: crashReportData.symptoms,
        timeline: crashReportData.timeline,
        activities: crashReportData.activities,
        recoveryStrategies: crashReportData.recoveryStrategies || [],
        environmentalFactors: crashReportData.environmentalFactors || [],
        aiSummary: crashReportData.aiSummary,
        rawConversation: conversationMessages,
        updatedAt: new Date()
      })
      .where(eq(crashReports.id, crashReportId))
      .returning();
    
    if (!Array.isArray(updatedCrashReportResult) || updatedCrashReportResult.length === 0) {
      throw new Error('Failed to update crash report');
    }
    const updatedCrashReport = updatedCrashReportResult[0];

    // Update the associated conversation
    if (updatedCrashReport.conversationId) {
      await db.update(conversations)
        .set({ 
          messages: conversationMessages,
          updatedAt: new Date()
        })
        .where(eq(conversations.id, updatedCrashReport.conversationId));
    }

    return {
      success: true,
      crashReportId: updatedCrashReport.id
    };
  } catch (error) {
    console.error("Error updating crash report:", error);
    return {
      success: false,
      error: "Failed to update crash report"
    };
  }
}


// Function to find existing crash report from recent conversation
export async function findRecentCrashReport(userId: string): Promise<string | null> {
  try {
    // Look for crash reports created in the last 2 hours
    // const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    const recentReports = await db.select({ id: crashReports.id })
      .from(crashReports)
      .where(eq(crashReports.userId, userId))
      .orderBy(crashReports.createdAt)
      .limit(1);
    
    return recentReports[0]?.id || null;
  } catch (error) {
    console.error("Error finding recent crash report:", error);
    return null;
  }
}


// Function to get user's crash reports for analysis
export async function getUserCrashReports(userId: string) {
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

