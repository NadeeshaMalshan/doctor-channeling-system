-- =============================================================================
-- Fix payments.appointment_id foreign key
-- =============================================================================
-- Easiest: from `backend` folder run:
--   npm run fix-payments-fk
-- (uses .env and auto-detects the wrong constraint name)
-- =============================================================================
-- Symptom: PayHere generate-hash fails with:
--   ER_NO_REFERENCED_ROW_2 ... FOREIGN KEY ("appointment_id") REFERENCES "appointment_schedules" ("id")
--
-- Cause: appointment_id stores the row id from `appointments` (e.g. 52), NOT
--        `appointment_schedules.id` (e.g. 18). The FK must point to appointments(id).
--
-- 1) Confirm the wrong constraint name:
--    SHOW CREATE TABLE payments;
--
-- 2) Replace payments_ibfk_3 below if your constraint name is different.
--
-- 3) If ALTER fails because existing rows reference invalid ids, clean or fix those rows first.
-- =============================================================================

ALTER TABLE payments DROP FOREIGN KEY payments_ibfk_3;

ALTER TABLE payments
  ADD CONSTRAINT fk_payments_appointment_id
  FOREIGN KEY (appointment_id) REFERENCES appointments(id);
