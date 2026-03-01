ALTER TABLE "subscription" ADD COLUMN "billing_interval" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "stripe_schedule_id" text;