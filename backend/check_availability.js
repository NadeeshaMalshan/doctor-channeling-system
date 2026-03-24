const db = require('./config/db');

async function check() {
    try {
        const [rows] = await db.query('SELECT * FROM doc_availability_slots');
        console.log(`Found ${rows.length} total rows.`);
        console.log(rows);
    } catch (error) {
        console.error('Error fetching:', error);
    } finally {
        process.exit();
    }
}
check();
