const pool = require('./config/db');

async function listTables() {
    try {
        const [rows] = await pool.execute('SHOW TABLES');
        console.log('Tables in database:', JSON.stringify(rows.map(r => Object.values(r)[0])));
        process.exit(0);
    } catch (err) {
        console.error('Failed to list tables:', err);
        process.exit(1);
    }
}

listTables();
