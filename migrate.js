const db = require('./backend/config/db');

async function migrate() {
    try {
        console.log('Adding profile_photo column to patients table...');
        await db.execute('ALTER TABLE patients ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(255) AFTER password_hash');
        console.log('Migration successful!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
