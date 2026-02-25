const pool = require('./backend/config/db');

async function test() {
    try {
        const [rows] = await pool.execute('SELECT * FROM patients LIMIT 1');
        if (rows.length > 0) {
            console.log('Patient found:', rows[0].id, rows[0].first_name);
            console.log('Columns:', Object.keys(rows[0]));
        } else {
            console.log('No patients found in database.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

test();
