CREATE TYPE "public"."disposition_kind" AS ENUM('key_corrected', 'wording_revised', 'key_confirmed', 'flag_dismissed', 'retry_requested');--> statement-breakpoint
CREATE TYPE "public"."item_status" AS ENUM('queued', 'running', 'done');--> statement-breakpoint
CREATE TYPE "public"."receipt_status" AS ENUM('pending', 'verified', 'mismatch', 'missing');--> statement-breakpoint
CREATE TYPE "public"."record_status" AS ENUM('queued', 'checking', 'ready', 'in_review', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."verdict" AS ENUM('clear', 'possible_key_error', 'possible_ambiguity', 'split_opinion', 'unverified', 'pending');--> statement-breakpoint
CREATE TABLE "attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"requested_model" text NOT NULL,
	"served_model" text,
	"request_id" text,
	"devshard_id" text,
	"fallback_header" text,
	"http_status" integer,
	"receipt_status" "receipt_status" DEFAULT 'pending' NOT NULL,
	"receipt_json" jsonb,
	"reading_json" jsonb,
	"latency_ms" integer,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"admitted" boolean DEFAULT false NOT NULL,
	"rejection_reason" text
);
--> statement-breakpoint
CREATE TABLE "dispositions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"kind" "disposition_kind" NOT NULL,
	"revised_key" text,
	"revised_text" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"record_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"stem" text NOT NULL,
	"options" jsonb NOT NULL,
	"key" text NOT NULL,
	"verdict" "verdict" DEFAULT 'pending' NOT NULL,
	"verdict_reason" text,
	"status" "item_status" DEFAULT 'queued' NOT NULL,
	"attempts_used" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model_health" (
	"model" text PRIMARY KEY NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"successes" integer DEFAULT 0 NOT NULL,
	"failures" integer DEFAULT 0 NOT NULL,
	"median_latency_ms" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"subject" text NOT NULL,
	"language" text NOT NULL,
	"context" text,
	"status" "record_status" DEFAULT 'queued' NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispositions" ADD CONSTRAINT "dispositions_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_record_id_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "records" ADD CONSTRAINT "records_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attempts_item_id_started_at_idx" ON "attempts" USING btree ("item_id","started_at");--> statement-breakpoint
CREATE INDEX "dispositions_item_id_created_at_idx" ON "dispositions" USING btree ("item_id","created_at");--> statement-breakpoint
CREATE INDEX "items_record_id_status_idx" ON "items" USING btree ("record_id","status");--> statement-breakpoint
CREATE INDEX "records_user_id_deleted_at_idx" ON "records" USING btree ("user_id","deleted_at");