const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? {
        ca: fs.readFileSync(path.join(__dirname, '..', 'ca.pem'))
    } : null,
    multipleStatements: true
};

async function verify() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database for verification.');

        // 1. Create a dummy appointment and payment
        // We'll use existing doctor and patient IDs if possible, or just insert dummy data.

        console.log('Creating test data...');
        const [docRows] = await connection.query('SELECT id FROM doctors LIMIT 1');
        const [patRows] = await connection.query('SELECT id FROM patients LIMIT 1');
        const [schRows] = await connection.query('SELECT id, booked_count FROM appointment_schedules LIMIT 1');

        if (docRows.length === 0 || patRows.length === 0 || schRows.length === 0) {
            console.error('Incomplete data in DB to run verification. Need at least one doctor, patient, and schedule.');
            return;
        }

        const doctorId = docRows[0].id;
        const patientId = patRows[0].id;
        const scheduleId = schRows[0].id;
        const initialCount = schRows[0].booked_count;

        // Insert appointment
        const [apptRes] = await connection.query(
            'INSERT INTO appointments (schedule_id, doctor_id, patient_ID, booking_queue_no, appointment_status) VALUES (?, ?, ?, ?, ?)',
            [scheduleId, doctorId, patientId, 999, 'added']
        );
        const apptId = apptRes.insertId;
        console.log(`Created test appointment ID: ${apptId}`);

        // Insert payment
        const [payRes] = await connection.query(
            'INSERT INTO payments (appointment_id, internal_order_id, patient_id, doctor_id, appointment_schedule_id, amount, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [apptId, `TEST_ORD_${Date.now()}`, patientId, doctorId, scheduleId, 1000.00, 'SUCCESS']
        );
        const payId = payRes.insertId;
        console.log(`Created test payment ID: ${payId} linked to appointment: ${apptId}`);

        // Update schedule count for test (manually as we're bypass controller)
        await connection.query('UPDATE appointment_schedules SET booked_count = booked_count + 1 WHERE id = ?', [scheduleId]);

        // 2. Delete the appointment
        console.log(`Deleting appointment ${apptId}...`);
        // We'll use the API if possible, but for DB verification we can simulate the controller logic or just call it if we can.
        // Since we want to verify the database constraint specifically:
        await connection.query('DELETE FROM appointments WHERE id = ?', [apptId]);
        console.log('Appointment deleted.');

        // 3. Verify payment still exists and appointment_id is NULL
        const [finalPayRows] = await connection.query('SELECT appointment_id FROM payments WHERE id = ?', [payId]);
        if (finalPayRows.length > 0) {
            const finalApptId = finalPayRows[0].appointment_id;
            if (finalApptId === null) {
                console.log('SUCCESS: Payment record persists and appointment_id is NULL.');
            } else {
                console.error(`FAILURE: appointment_id is ${finalApptId}, expected NULL.`);
            }
        } else {
            console.error('FAILURE: Payment record was deleted!');
        }

        // 4. Cleanup
        console.log('Cleaning up...');
        await connection.query('DELETE FROM payments WHERE id = ?', [payId]);
        // Decrement schedule count back (simulate controller logic)
        await connection.query('UPDATE appointment_schedules SET booked_count = ? WHERE id = ?', [initialCount, scheduleId]);

    } catch (err) {
        console.error('Verification error:', err);
    } finally {
        if (connection) await connection.end();
    }
}

verify();
