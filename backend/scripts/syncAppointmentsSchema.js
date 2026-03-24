/**
 * Aligns `appointments` table with current backend (booking_queue_no, no appointment_payment_status).
 * Run: node backend/scripts/syncAppointmentsSchema.js  (from repo root)
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/db');

async function columnExists(table, column) {
    const [rows] = await db.execute(
        `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, column]
    );
    return rows.length > 0;
}

async function indexExists(table, indexName) {
    const [rows] = await db.execute(
        `SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
        [table, indexName]
    );
    return rows.length > 0;
}

async function paymentsAppointmentIdNullable() {
    const [rows] = await db.execute(
        `SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'appointment_id'`
    );
    if (!rows.length) {
        console.log('payments.appointment_id missing — skip nullable migration.');
        return;
    }
    if (rows[0].IS_NULLABLE === 'YES') {
        console.log('payments.appointment_id already nullable — skip.');
        return;
    }
    const [fks] = await db.execute(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments'
         AND COLUMN_NAME = 'appointment_id' AND REFERENCED_TABLE_NAME IS NOT NULL`
    );
    for (const { CONSTRAINT_NAME } of fks) {
        console.log(`Dropping FK ${CONSTRAINT_NAME} on payments.appointment_id...`);
        await db.execute(`ALTER TABLE payments DROP FOREIGN KEY \`${CONSTRAINT_NAME}\``);
    }
    await db.execute('ALTER TABLE payments MODIFY COLUMN appointment_id INT NULL');
    await db.execute(
        `ALTER TABLE payments ADD CONSTRAINT fk_payments_appointment_id
         FOREIGN KEY (appointment_id) REFERENCES appointments(id)`
    );
    console.log('payments.appointment_id is now NULLable (declined PayHere / no booking row).');
}

async function fkExists(table, name) {
    const [rows] = await db.execute(
        `SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?
           AND CONSTRAINT_TYPE = 'FOREIGN KEY'`,
        [table, name]
    );
    return rows.length > 0;
}

async function ensureAppointmentBookingColumns() {
    if (!(await columnExists('appointments', 'appointment_status'))) {
        console.log('Adding appointments.appointment_status (added | failed | cancelled)...');
        await db.execute(`
            ALTER TABLE appointments
            ADD COLUMN appointment_status ENUM('added', 'failed', 'cancelled') NOT NULL DEFAULT 'added'
        `);
        console.log('OK.');
    } else {
        console.log('appointments.appointment_status exists — skip.');
    }
    if (!(await columnExists('appointments', 'payment_id'))) {
        console.log('Adding appointments.payment_id...');
        await db.execute('ALTER TABLE appointments ADD COLUMN payment_id INT NULL');
        console.log('OK.');
    } else {
        console.log('appointments.payment_id exists — skip.');
    }
    if (!(await fkExists('appointments', 'fk_appointments_payment_id'))) {
        console.log('Adding FK fk_appointments_payment_id...');
        await db.execute(`
            ALTER TABLE appointments ADD CONSTRAINT fk_appointments_payment_id
            FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
        `);
        console.log('OK.');
    } else {
        console.log('FK fk_appointments_payment_id exists — skip.');
    }
}

async function main() {
    await paymentsAppointmentIdNullable();
    await ensureAppointmentBookingColumns();

    if (await indexExists('appointments', 'uniq_schedule_patient')) {
        if (!(await indexExists('appointments', 'idx_appointments_schedule_id'))) {
            console.log('Adding idx_appointments_schedule_id (required before dropping composite unique for FKs)...');
            await db.execute('CREATE INDEX idx_appointments_schedule_id ON appointments (schedule_id)');
            console.log('OK.');
        }
        console.log('Dropping uniq_schedule_patient (allow multiple bookings per patient per schedule)...');
        await db.execute('ALTER TABLE appointments DROP INDEX uniq_schedule_patient');
        console.log('OK.');
    } else {
        console.log('No uniq_schedule_patient index — skip drop.');
    }

    const hasOldNo = await columnExists('appointments', 'appointment_No');
    const hasNewNo = await columnExists('appointments', 'booking_queue_no');

    if (hasOldNo && !hasNewNo) {
        console.log('Renaming appointment_No -> booking_queue_no...');
        await db.execute(
            'ALTER TABLE appointments CHANGE COLUMN appointment_No booking_queue_no INT NOT NULL'
        );
        console.log('OK.');
    } else if (hasNewNo) {
        console.log('Column booking_queue_no already exists — skip rename.');
    } else {
        console.log('Neither appointment_No nor booking_queue_no found — check table name / DB.');
    }

    const hasPayStatus = await columnExists('appointments', 'appointment_payment_status');
    if (hasPayStatus) {
        console.log('Dropping appointment_payment_status (use payments table for status)...');
        await db.execute('ALTER TABLE appointments DROP COLUMN appointment_payment_status');
        console.log('OK.');
    } else {
        console.log('No appointment_payment_status column — skip drop.');
    }

    console.log('Done. Restart the API server.');
    process.exit(0);
}

main().catch((e) => {
    console.error(e.message);
    process.exit(1);
});
