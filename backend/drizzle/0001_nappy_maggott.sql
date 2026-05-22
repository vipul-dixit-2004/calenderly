ALTER TABLE "event_types" ADD COLUMN "meet_type" varchar(50) DEFAULT 'google_meet' NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "meet_url" text;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "meet_address" text;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "meet_phone" varchar(50);