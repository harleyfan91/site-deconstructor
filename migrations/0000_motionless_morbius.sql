CREATE TABLE "analysis_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url_hash" text NOT NULL,
	"original_url" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"audit_json" jsonb NOT NULL,
	CONSTRAINT "analysis_cache_url_hash_unique" UNIQUE("url_hash")
);
--> statement-breakpoint
CREATE TABLE "scan_status" (
	"scan_id" uuid PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"progress" smallint DEFAULT 0,
	"started_at" timestamp,
	"finished_at" timestamp,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "scan_tasks" (
	"task_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scan_id" uuid,
	"type" text NOT NULL,
	"status" text DEFAULT 'queued',
	"payload" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"last_run_at" timestamp,
	"active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "scan_status" ADD CONSTRAINT "scan_status_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scan_tasks" ADD CONSTRAINT "scan_tasks_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE cascade ON UPDATE no action;