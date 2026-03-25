require('dotenv').config({ path: './backend/.env' });
const db = require('./backend/config/db');

async function migrate() {
    try {
        console.log('Starting migration...');

        // 1. appointment_schedules
        console.log('Updating appointment_schedules...');
        await db.query('ALTER TABLE appointment_schedules DROP FOREIGN KEY appointment_schedules_ibfk_1');
        await db.query('ALTER TABLE appointment_schedules MODIFY doctor_id INT NULL');
        await db.query('ALTER TABLE appointment_schedules ADD CONSTRAINT fk_doctor_schedules FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL');

        // 2. appointments
        console.log('Updating appointments...');
        await db.query('ALTER TABLE appointments DROP FOREIGN KEY appointments_ibfk_2');
        await db.query('ALTER TABLE appointments MODIFY doctor_id INT NULL');
        await db.query('ALTER TABLE appointments ADD CONSTRAINT fk_doctor_appointments FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL');

        // 3. doc_availability_slots
        console.log('Updating doc_availability_slots...');
        await db.query('ALTER TABLE doc_availability_slots DROP FOREIGN KEY doc_availability_slots_ibfk_1');
        await db.query('ALTER TABLE doc_availability_slots MODIFY doctor_id INT NULL');
        await db.query('ALTER TABLE doc_availability_slots ADD CONSTRAINT fk_doctor_slots FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL');

        // 4. payments
        console.log('Updating payments...');
        await db.query('ALTER TABLE payments DROP FOREIGN KEY payments_ibfk_2');
        await db.query('ALTER TABLE payments MODIFY doctor_id INT NULL');
        await db.query('ALTER TABLE payments ADD CONSTRAINT fk_doctor_payments FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL');

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
