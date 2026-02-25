const pool = require('./backend/config/db');

async function checkPatient() {
    try {
        const [rows] = await pool.execute('SELECT * FROM patients');
        console.log('Total patients:', rows.length);
        if (rows.length > 0) {
            console.log('Sample Patient:', rows[0]);
        }
        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err);
        process.exit(1);
    }
}

checkPatient();
