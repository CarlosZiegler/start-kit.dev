CREATE TABLE "admin_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_user_id" text NOT NULL,
	"actor_session_id" text NOT NULL,
	"action" text NOT NULL,
	"target_user_id" text,
	"target_organization_id" text,
	"reason" text,
	"metadata" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_audit_log_actor_user_id_idx" ON "admin_audit_log" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "admin_audit_log_target_org_id_idx" ON "admin_audit_log" USING btree ("target_organization_id");