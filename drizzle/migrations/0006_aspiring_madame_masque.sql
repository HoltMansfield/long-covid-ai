CREATE TABLE "conversation_crash_reports" (
	"conversation_id" uuid NOT NULL,
	"crash_report_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_crash_report_id_crash_reports_id_fk";
--> statement-breakpoint
ALTER TABLE "conversation_crash_reports" ADD CONSTRAINT "conversation_crash_reports_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_crash_reports" ADD CONSTRAINT "conversation_crash_reports_crash_report_id_crash_reports_id_fk" FOREIGN KEY ("crash_report_id") REFERENCES "public"."crash_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" DROP COLUMN "crash_report_id";