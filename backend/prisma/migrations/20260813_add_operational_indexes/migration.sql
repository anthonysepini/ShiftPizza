BEGIN;

-- Index the date-leading monthly read and the two foreign keys that were not
-- covered by an existing unique index.
CREATE INDEX "schedule_days_date_employeeId_idx"
ON "schedule_days"("date", "employeeId");

CREATE INDEX "schedule_days_changedByUserId_idx"
ON "schedule_days"("changedByUserId");

CREATE INDEX "audit_logs_actorUserId_idx"
ON "audit_logs"("actorUserId");

-- Match the audit feed's newest-first access path.
CREATE INDEX "audit_logs_createdAt_idx"
ON "audit_logs"("createdAt" DESC);

-- Preserve audit history when a user is deleted. Existing actor ids remain
-- untouched; only future user deletion nulls the reference.
ALTER TABLE "audit_logs"
DROP CONSTRAINT "audit_logs_actorUserId_fkey";

ALTER TABLE "audit_logs"
ALTER COLUMN "actorUserId" DROP NOT NULL;

ALTER TABLE "audit_logs"
ADD CONSTRAINT "audit_logs_actorUserId_fkey"
FOREIGN KEY ("actorUserId") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- NOT VALID keeps constraint installation separate from the existing-row
-- scan. Validation fails closed if legacy data is outside the civil-weekday
-- domain; it never coerces or deletes data.
ALTER TABLE "weekly_schedule_rules"
ADD CONSTRAINT "weekly_schedule_rules_weekday_check"
CHECK ("weekday" BETWEEN 0 AND 6) NOT VALID;

ALTER TABLE "weekly_schedule_rules"
VALIDATE CONSTRAINT "weekly_schedule_rules_weekday_check";

COMMIT;
