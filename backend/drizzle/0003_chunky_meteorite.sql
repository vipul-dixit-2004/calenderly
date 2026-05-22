DROP INDEX "uq_availability_rules_schedule_day";--> statement-breakpoint
CREATE INDEX "idx_availability_rules_schedule_day" ON "availability_rules" USING btree ("schedule_id","day_of_week");