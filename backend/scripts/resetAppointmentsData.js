/**
 * Wipes all rows in appointments (and dependent payments). Resets schedule booked_count to 0
 * and sets status from 'full' back to 'active'. Does not delete schedules, doctors, or patients.
 *
 * SAFETY: Set in backend/.env for one run:
 *   RESET_APPOINTMENTS_CONFIRM=YES
 *
 * Run: node backend/scripts/resetAppointmentsData.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/db');

async function tableExists(name) {
    const [rows] = await db.execute(
        `SELECT 1 FROM INFORMATION_SCHEMA.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
        [name]
    );
    return rows.length > 0;
}

async function main() {
    if (process.env.RESET_APPOINTMENTS_CONFIRM !== 'YES') {
        console.error(
            'Refusing to run: set RESET_APPOINTMENTS_CONFIRM=YES in backend/.env then run again.'
        );
        process.exit(1);
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        if (await tableExists('bookings')) {
            const [r] = await conn.execute('DELETE FROM bookings');
            console.log('Deleted from bookings:', r.affectedRows);
        }

        const [payDel] = await conn.execute('DELETE FROM payments');
        console.log('Deleted from payments:', payDel.affectedRows);

        const [apptDel] = await conn.execute('DELETE FROM appointments');
        console.log('Deleted from appointments:', apptDel.affectedRows);

        const [schedUp] = await conn.execute(
            `UPDATE appointment_schedules
             SET booked_count = 0,
                 status = CASE WHEN status = 'full' THEN 'active' ELSE status END`
        );
        console.log('Updated appointment_schedules rows:', schedUp.affectedRows);

        await conn.commit();
        console.log('Done. Remove RESET_APPOINTMENTS_CONFIRM from .env after this run.');
    } catch (e) {
        await conn.rollback();
        console.error(e.message);
        process.exit(1);
    } finally {
        conn.release();
        process.exit(0);
    }
}

main();
