/**
 * Fixes payments.appointment_id when it wrongly references appointment_schedules(id).
 * It must reference appointments(id) — same as backend/database_setup.sql
 *
 * Run from backend folder:
 *   node scripts/fixPaymentsAppointmentFk.js
 * or:
 *   npm run fix-payments-fk
 */
require('dotenv').config();
const db = require('../config/db');

async function main() {
    console.log('Database:', process.env.DB_NAME || '(from .env)');

    const [wrongRows] = await db.execute(
        `SELECT CONSTRAINT_NAME
         FROM information_schema.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'payments'
           AND COLUMN_NAME = 'appointment_id'
           AND REFERENCED_TABLE_NAME = 'appointment_schedules'`
    );

    if (wrongRows.length > 0) {
        const name = wrongRows[0].CONSTRAINT_NAME;
        console.log('Dropping incorrect FK:', name, '(appointment_id -> appointment_schedules)');
        await db.execute(`ALTER TABLE payments DROP FOREIGN KEY \`${name}\``);
    } else {
        console.log('No FK appointment_id -> appointment_schedules found (may already be dropped).');
    }

    const [okRows] = await db.execute(
        `SELECT CONSTRAINT_NAME
         FROM information_schema.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'payments'
           AND COLUMN_NAME = 'appointment_id'
           AND REFERENCED_TABLE_NAME = 'appointments'`
    );

    if (okRows.length > 0) {
        console.log('Correct FK already present:', okRows.map((r) => r.CONSTRAINT_NAME).join(', '));
        console.log('Nothing to do.');
        process.exit(0);
        return;
    }

    console.log('Adding FK: payments.appointment_id -> appointments(id) ...');
    await db.execute(
        `ALTER TABLE payments
         ADD CONSTRAINT fk_payments_appointment_id
         FOREIGN KEY (appointment_id) REFERENCES appointments(id)`
    );
    console.log('Done. Restart the backend and try PayHere again.');
    process.exit(0);
}

main().catch((err) => {
    console.error('Fix failed:', err.message);
    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452) {
        console.error(
            '\nTip: Some rows in `payments` may have appointment_id values that are not in `appointments`.\n' +
                'Check: SELECT * FROM payments p LEFT JOIN appointments a ON a.id = p.appointment_id WHERE a.id IS NULL;'
        );
    }
    process.exit(1);
});
