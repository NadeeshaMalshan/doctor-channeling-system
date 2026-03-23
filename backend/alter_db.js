const db = require('./config/db');

async function alterDb() {
    try {
        console.log('Adding appointment_No column to appointments...');
        try {
            await db.query(`ALTER TABLE appointments ADD COLUMN appointment_No INT NOT NULL AFTER patient_ID`);
            console.log('Successfully added appointment_No.');
        } catch (e) {
            console.log('Error adding appointment_No (may already exist):', e.message);
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
