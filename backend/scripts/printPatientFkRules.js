/**
 * Prints `ON DELETE` rules for foreign keys that reference `patients(id)`.
 *
 * Run (from repo root):
 *   node backend/scripts/printPatientFkRules.js
 */
require('dotenv').config();
const db = require('../config/db');

async function main() {
    const sql = `
        SELECT
            kcu.TABLE_NAME,
            kcu.COLUMN_NAME,
            kcu.CONSTRAINT_NAME,
            rc.DELETE_RULE
        FROM information_schema.KEY_COLUMN_USAGE kcu
        JOIN information_schema.REFERENTIAL_CONSTRAINTS rc
            ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
           AND kcu.CONSTRAINT_SCHEMA = rc.CONSTRAINT_SCHEMA
        WHERE kcu.TABLE_SCHEMA = DATABASE()
          AND kcu.REFERENCED_TABLE_NAME = 'patients'
          AND kcu.REFERENCED_COLUMN_NAME = 'id'
        ORDER BY kcu.TABLE_NAME, kcu.COLUMN_NAME;
    `;

    const [rows] = await db.execute(sql);
    console.table(rows);
    process.exit(0);
}

main().catch((e) => {
    console.error('[fatal] printPatientFkRules failed:', e);
    process.exit(1);
});

