const pool = require('./config/db');

async function checkTables() {
    try {
        console.log('Checking tables in database...\n');

        const [tables] = await pool.query('SHOW TABLES');
        console.log('Tables found:', tables);

        if (tables.length === 0) {
            console.log('\n❌ No tables found! Running database initialization...');
            const { initDatabase } = require('./database_init');
            // We'll need to modify database_init.js to export the function
        } else {
            console.log('\n✅ Tables exist in database');

            // Check each table
            for (let table of tables) {
                const tableName = Object.values(table)[0];
                const [rows] = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
                console.log(`   ${tableName}: ${rows[0].count} rows`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkTables();
