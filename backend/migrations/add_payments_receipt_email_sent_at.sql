-- One-time migration for existing databases (new installs get this from database_setup.sql)
ALTER TABLE payments
ADD COLUMN receipt_email_sent_at DATETIME NULL DEFAULT NULL;
