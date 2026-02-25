const db = require('./config/db');

async function migrate() {
    try {
        console.log('Starting migration...');

        // Check if columns already exist
        const [columns] = await db.query('SHOW COLUMNS FROM staff');
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('phone_number')) {
            console.log('Adding phone_number column...');
            await db.execute('ALTER TABLE staff ADD COLUMN phone_number VARCHAR(20)');
        } else {
            console.log('phone_number column already exists.');
        }

        if (!columnNames.includes('email')) {
            console.log('Adding email column...');
            await db.execute('ALTER TABLE staff ADD COLUMN email VARCHAR(100)');
        } else {
            console.log('email column already exists.');
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
