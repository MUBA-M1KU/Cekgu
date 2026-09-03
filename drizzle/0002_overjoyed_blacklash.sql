CREATE INDEX "items_status_idx" ON "items" USING btree ("status");--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_record_id_position_key" UNIQUE("record_id","position");