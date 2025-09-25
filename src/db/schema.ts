import {
  pgTable,
  text,
  timestamp,
  uuid,
  primaryKey,
  integer,
  decimal,
  jsonb,
  varchar,
  date,
} from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email"),
  passwordHash: text("passwordHash"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  failedLoginAttempts: integer("failedLoginAttempts").default(0),
  lockoutUntil: timestamp("lockoutUntil", { mode: "date" }),
  // Long COVID AI specific fields
  ageYear: integer("age_year"), // e.g., 44 (anonymized age)
  registrationDate: timestamp("registration_date", { mode: "date" }).defaultNow(),
});

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verificationTokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// Define the composite primary key separately
export const verificationTokensPrimaryKey = primaryKey({
  columns: [verificationTokens.identifier, verificationTokens.token],
});

// Long COVID AI specific tables
export const crashReports = pgTable("crash_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  severity: integer("severity").notNull(), // 1-10 scale
  
  // Structured crash data for AI analysis
  triggers: jsonb("triggers"), // array of trigger objects: {type, description, intensity}
  symptoms: jsonb("symptoms"), // array of symptom objects: {name, severity, duration}
  timeline: jsonb("timeline"), // {onset, duration, recovery_time, phases}
  activities: jsonb("activities"), // activities before crash with timing
  
  // Recovery and patterns
  recoveryStrategies: jsonb("recovery_strategies"), // what helped recovery
  environmentalFactors: jsonb("environmental_factors"), // weather, location, etc.
  
  // Raw AI conversation data
  conversationId: uuid("conversation_id").references(() => conversations.id),
  aiSummary: text("ai_summary"), // The structured summary from AI
  rawConversation: jsonb("raw_conversation"), // Full conversation for re-analysis
  
  // Legacy fields (keeping for backward compatibility)
  durationHours: integer("duration_hours"),
  recoveryTimeHours: integer("recovery_time_hours"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  crashReportId: uuid("crash_report_id").references(() => crashReports.id, { onDelete: "cascade" }),
  messages: jsonb("messages"), // conversation history
  recommendations: jsonb("recommendations"), // array of recommendations
  status: varchar("status", { length: 50 }).default("active"), // active, completed, etc.
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const researchPapers = pgTable("research_papers", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  authors: jsonb("authors"), // array of authors
  journal: varchar("journal", { length: 255 }),
  publicationDate: date("publication_date"),
  doi: varchar("doi", { length: 255 }),
  abstract: text("abstract"),
  tags: jsonb("tags"), // array of tags
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const userAnalytics = pgTable("user_analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  totalCrashes: integer("total_crashes").default(0),
  avgSeverity: decimal("avg_severity", { precision: 3, scale: 2 }),
  commonTriggers: jsonb("common_triggers"), // array of common triggers
  recoveryTrends: jsonb("recovery_trends"), // trend data
  lastCalculated: timestamp("last_calculated", { mode: "date" }).defaultNow(),
});

// Types for new records (for insertion)
export type NewUser = InferInsertModel<typeof users>;
export type NewSession = InferInsertModel<typeof sessions>;
export type NewVerificationToken = InferInsertModel<typeof verificationTokens>;
export type NewCrashReport = InferInsertModel<typeof crashReports>;
export type NewConversation = InferInsertModel<typeof conversations>;
export type NewResearchPaper = InferInsertModel<typeof researchPapers>;
export type NewUserAnalytics = InferInsertModel<typeof userAnalytics>;

// Types for existing records (from database)
export type User = InferSelectModel<typeof users>;
export type Session = InferSelectModel<typeof sessions>;
export type VerificationToken = InferSelectModel<typeof verificationTokens>;
export type CrashReport = InferSelectModel<typeof crashReports>;
export type Conversation = InferSelectModel<typeof conversations>;
export type ResearchPaper = InferSelectModel<typeof researchPapers>;
export type UserAnalytics = InferSelectModel<typeof userAnalytics>;
