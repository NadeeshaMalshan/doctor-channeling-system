const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? {
        ca: fs.readFileSync(path.join(__dirname, 'ca.pem'))
    } : null
};

async function migrate() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected.');

        console.log('Adding profile_photo column...');
        // Use a safe way to add column if it doesn't exist (MySQL 8.0.19+ supports IF NOT EXISTS for columns, but for older we might need a workaround or just catch the error)
        try {
            await connection.query('ALTER TABLE patients ADD COLUMN profile_photo VARCHAR(255) AFTER password_hash');
            console.log('Column added successfully.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Column already exists.');
            } else {
                throw err;
            }
        }

        console.log('Migration complete!');
    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
