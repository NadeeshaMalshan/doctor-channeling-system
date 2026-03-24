const db = require('./config/db');

async function check() {
    try {
        const [rows] = await db.query(`
            SELECT a.id, a.doctor_id, d.name AS doctor_name 
            FROM doc_availability_slots a
            JOIN doctors d ON a.doctor_id = d.id
            WHERE a.is_available = 1
        `);
        console.log(`Found ${rows.length} joined rows.`);
    } catch (error) {
        console.error('Error fetching:', error);
    } finally {
        process.exit();
    }
}
check();
