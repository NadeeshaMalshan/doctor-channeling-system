const db = require('./config/db');

async function alterDb() {
    try {
        console.log('Adding booking_queue_no column to appointments (legacy scripts used appointment_No)...');
        try {
            await db.query(
                `ALTER TABLE appointments ADD COLUMN booking_queue_no INT NOT NULL DEFAULT 1 AFTER patient_ID`
            );
            console.log('Successfully added booking_queue_no.');
        } catch (e) {
            console.log('Error adding booking_queue_no (may already exist):', e.message);
        }

        console.log('Dropping after_payment_update trigger...');
        try {
            await db.query(`DROP TRIGGER IF EXISTS after_payment_update`);
            console.log('Successfully dropped trigger after_payment_update.');
        } catch (e) {
            console.log('Error dropping trigger:', e.message);
        }

        process.exit(0);
    } catch (err) {
        console.error('Critical Error:', err);
        process.exit(1);
    }
}

alterDb();
