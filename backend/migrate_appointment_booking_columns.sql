-- Run once on existing databases (backup first).
-- Fresh installs: use database_setup.sql only.
--
-- Easiest: from repo root run
--   node backend/scripts/syncAppointmentsSchema.js
-- (uses .env DB credentials and skips steps that already applied)

-- Rename queue column (fails if already booking_queue_no — then skip)
-- ALTER TABLE appointments
--   CHANGE COLUMN appointment_No booking_queue_no INT NOT NULL;

-- Drop duplicated payment state (source of truth: payments table)
-- ALTER TABLE appointments
--   DROP COLUMN appointment_payment_status;
