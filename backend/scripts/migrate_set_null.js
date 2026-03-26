const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? {
        ca: fs.readFileSync(path.join(__dirname, '..', 'ca.pem'))
    } : null,
    multipleStatements: true
};

async function migrate() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // 1. Drop the old constraint if it exists. 
        // We might not know the exact name, so we'll try common names or use a safe approach.
        // If it was created without a name, MySQL often gives it a name like payments_ibfk_3.

        console.log('Attempting to drop existing foreign key...');
        try {
            await connection.query('ALTER TABLE payments DROP FOREIGN KEY fk_payments_appointment_id');
            console.log('Dropped fk_payments_appointment_id');
        } catch (e) {
            try {
                await connection.query('ALTER TABLE payments DROP FOREIGN KEY payments_ibfk_3');
                console.log('Dropped payments_ibfk_3');
            } catch (e2) {
                console.log('No known constraint found to drop, or it was already dropped.');
            }
        }

        // 2. Add the new constraint with ON DELETE SET NULL
        console.log('Adding new constraint with ON DELETE SET NULL...');
        await connection.query(`
            ALTER TABLE payments 
            MODIFY COLUMN appointment_id INT NULL,
            ADD CONSTRAINT fk_appointments_payments 
            FOREIGN KEY (appointment_id) REFERENCES appointments(id) 
            ON DELETE SET NULL
        `);
        console.log('Migration successful!');

    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
