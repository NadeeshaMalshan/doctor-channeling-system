-- Remove payment environment tracking from payments schema
-- This drops the column if it exists (idempotent).

SET @has_col := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'payments'
      AND COLUMN_NAME = 'payment_environment'
);

SET @sql := IF(@has_col > 0, 'ALTER TABLE payments DROP COLUMN payment_environment', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

