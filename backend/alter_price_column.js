const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

let sslConfig = false;
if (process.env.DB_SSL === 'true') {
    const caPath = path.join(__dirname, 'ca.pem');
    if (fs.existsSync(caPath)) {
        sslConfig = {
            ca: fs.readFileSync(caPath),
            rejectUnauthorized: true
        };
    } else {
        sslConfig = { rejectUnauthorized: false };
    }
}

async function alterTable() {
    console.log('Connecting to database...');
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: sslConfig
        });

        console.log('Adding price column to appointment_schedules...');
        await connection.execute(`
            ALTER TABLE appointment_schedules 
            ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER max_patients;
        `);
        console.log('Successfully added price column!');
    } catch (err) {
        // If it already exists, log and ignore
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column price already exists, skipping.');
        } else {
            console.error('Error altering table:', err);
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('Connection closed.');
        }
    }
}

alterTable();
