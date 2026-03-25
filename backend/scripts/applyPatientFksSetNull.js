/**
 * Applies `ON DELETE SET NULL` to foreign keys referencing `patients(id)`.
 *
 * This is for Option 2: when a patient is hard-deleted, history rows remain in
 * related tables (payments/support_tickets/appointments/refund_requests),
 * but their `patient_id` / `patient_ID` columns become NULL.
 *
 * Usage (from repo root):
 *   node backend/scripts/applyPatientFksSetNull.js
 */

require('dotenv').config();
const db = require('../config/db');

async function tableExists(name) {
    const [rows] = await db.execute(
        `SELECT 1
         FROM INFORMATION_SCHEMA.TABLES
         WHERE TABLE_SCHEMA = DATABASE()
           AND LOWER(TABLE_NAME) = LOWER(?)
         LIMIT 1`,
        [name]
    );
    return rows.length > 0;
}

async function columnExists(table, column) {
    const [rows] = await db.execute(
        `SELECT 1
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND LOWER(TABLE_NAME) = LOWER(?)
           AND LOWER(COLUMN_NAME) = LOWER(?)
         LIMIT 1`,
        [table, column]
    );
    return rows.length > 0;
}

async function applySetNull({ table, column, newConstraintName }) {
    const [rows] = await db.execute(
        `SELECT CONSTRAINT_NAME
         FROM information_schema.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = DATABASE()
           AND LOWER(TABLE_NAME) = LOWER(?)
           AND LOWER(COLUMN_NAME) = LOWER(?)
           AND REFERENCED_TABLE_NAME = 'patients'
           AND REFERENCED_COLUMN_NAME = 'id'`,
        [table, column]
    );

    if (rows.length === 0) {
        console.log(`[skip] No FK found: ${table}.${column} -> patients(id)`);
        return;
    }

    console.log(`[info] Dropping FK(s) for ${table}.${column}:`, rows.map((r) => r.CONSTRAINT_NAME).join(', '));
    for (const r of rows) {
        await db.execute(`ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${r.CONSTRAINT_NAME}\``);
    }

    // Ensure the FK column can receive NULL after deletes.
    await db.execute(`ALTER TABLE \`${table}\` MODIFY \`${column}\` INT NULL`);

    console.log(`[info] Adding FK: ${table}.${column} -> patients(id) ON DELETE SET NULL (${newConstraintName})`);
    await db.execute(
        `ALTER TABLE \`${table}\`
         ADD CONSTRAINT \`${newConstraintName}\`
         FOREIGN KEY (\`${column}\`) REFERENCES patients(id)
         ON DELETE SET NULL`
    );
}

async function main() {
    const ops = [
        { table: 'payments', column: 'patient_id', newConstraintName: 'fk_payments_patient_id_set_null' },
        { table: 'support_tickets', column: 'patient_id', newConstraintName: 'fk_support_tickets_patient_id_set_null' },
        { table: 'appointments', column: 'patient_ID', newConstraintName: 'fk_appointments_patient_ID_set_null' },
        { table: 'refund_requests', column: 'patient_id', newConstraintName: 'fk_refund_requests_patient_id_set_null' },
    ];

    console.log('[start] applyPatientFksSetNull');

    for (const op of ops) {
        const okTable = await tableExists(op.table);
        if (!okTable) {
            console.log(`[skip] Table not found: ${op.table}`);
            continue;
        }
        const okCol = await columnExists(op.table, op.column);
        if (!okCol) {
            console.log(`[skip] Column not found: ${op.table}.${op.column}`);
            continue;
        }

        await applySetNull(op);
    }

    console.log('[done] applyPatientFksSetNull complete');
    process.exit(0);
}

main().catch((e) => {
    console.error('[fatal] applyPatientFksSetNull failed:', e);
    process.exit(1);
});

