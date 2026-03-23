/**
 * One-off migration: sync payments ↔ appointments, merge duplicate (schedule_id, patient_ID)
 * rows, recalc booked_count, add UNIQUE(schedule_id, patient_ID).
 * Run from repo: node backend/scripts/fixRedundantAppointments.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/db');

async function main() {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [syncResult] = await conn.execute(`
            UPDATE payments p
            INNER JOIN appointments a ON a.id = p.appointment_id
            SET p.patient_id = a.patient_ID,
                p.doctor_id = a.doctor_id,
                p.appointment_schedule_id = a.schedule_id
            WHERE p.patient_id <> a.patient_ID
               OR p.doctor_id <> a.doctor_id
               OR p.appointment_schedule_id <> a.schedule_id
        `);
        console.log('Payments synced with appointments, affected rows:', syncResult.affectedRows);

        const [dups] = await conn.execute(`
            SELECT schedule_id, patient_ID, GROUP_CONCAT(id ORDER BY id) AS ids, COUNT(*) AS c
            FROM appointments
            GROUP BY schedule_id, patient_ID
            HAVING c > 1
        `);

        for (const row of dups) {
            const ids = String(row.ids)
                .split(',')
                .map((x) => Number(x))
                .filter(Number.isFinite);
            if (ids.length < 2) continue;
            const canonical = ids[0];
            const remove = ids.slice(1);
            const placeholders = remove.map(() => '?').join(',');
            const [up] = await conn.execute(
                `UPDATE payments SET appointment_id = ? WHERE appointment_id IN (${placeholders})`,
                [canonical, ...remove]
            );
            console.log(`Merge schedule ${row.schedule_id} patient ${row.patient_ID}: canonical=${canonical}, repointed payments=${up.affectedRows}`);
            await conn.execute(`DELETE FROM appointments WHERE id IN (${placeholders})`, remove);
        }

        await conn.execute(`
            UPDATE appointment_schedules s
            SET booked_count = (
                SELECT COUNT(*) FROM appointments a WHERE a.schedule_id = s.id
            )
        `);
        console.log('Recalculated booked_count for all schedules.');

        await conn.execute(`
            ALTER TABLE appointments
            ADD UNIQUE KEY uniq_schedule_patient (schedule_id, patient_ID)
        `);
        console.log('Added UNIQUE KEY uniq_schedule_patient (schedule_id, patient_ID).');

        await conn.commit();
        console.log('Done.');
        conn.release();
        process.exit(0);
    } catch (e) {
        await conn.rollback();
        console.error('Migration failed:', e.message);
        if (e.code === 'ER_DUP_KEYNAME') {
            console.error('Unique key may already exist — safe to ignore or drop first.');
        }
        conn.release();
        process.exit(1);
    }
}

main();
