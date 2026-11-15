ALTER TABLE "issues" ADD COLUMN "labels" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "due_date" date;