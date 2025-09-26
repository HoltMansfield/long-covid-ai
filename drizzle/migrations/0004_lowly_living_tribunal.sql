ALTER TABLE "crash_reports" ADD COLUMN "timeline" jsonb;--> statement-breakpoint
ALTER TABLE "crash_reports" ADD COLUMN "recovery_strategies" jsonb;--> statement-breakpoint
ALTER TABLE "crash_reports" ADD COLUMN "environmental_factors" jsonb;--> statement-breakpoint
ALTER TABLE "crash_reports" ADD COLUMN "conversation_id" uuid;--> statement-breakpoint
ALTER TABLE "crash_reports" ADD COLUMN "ai_summary" text;--> statement-breakpoint
ALTER TABLE "crash_reports" ADD COLUMN "raw_conversation" jsonb;--> statement-breakpoint
ALTER TABLE "crash_reports" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "crash_reports" ADD CONSTRAINT "crash_reports_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;