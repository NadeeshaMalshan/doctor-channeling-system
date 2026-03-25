require('dotenv').config({ path: './backend/.env' });
const db = require('./backend/config/db');


async function inspectFKs() {
    try {
        const tables = ['appointment_schedules', 'appointments', 'doc_availability_slots', 'payments'];
        for (const table of tables) {
            console.log(`\nInspecting table: ${table}`);
            const [rows] = await db.query(`
                SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
                FROM information_schema.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = 'doctor_channeling_db'
                  AND TABLE_NAME = ?
                  AND REFERENCED_TABLE_NAME = 'doctors'
            `, [table]);
            console.log(rows);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspectFKs();
