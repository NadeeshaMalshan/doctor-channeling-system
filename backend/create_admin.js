const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function createAdmin() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        const username = 'Janindu';
        const password = '12345';
        const role = 'Booking Manager';
        const status = 'Active';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if user exists
        const [rows] = await connection.execute('SELECT * FROM staff WHERE username = ?', [username]);
        if (rows.length > 0) {
            console.log('User "admin" already exists.');
            // Update password just in case
            await connection.execute('UPDATE staff SET password_hash = ? WHERE username = ?', [hashedPassword, username]);
            console.log('Password updated to "password123".');
        } else {
            // Insert user
            await connection.execute(
                'INSERT INTO staff (username, password_hash, role, account_status) VALUES (?, ?, ?, ?)',
                [username, hashedPassword, role, status]
            );
            console.log('Admin user created successfully.');
        }

        console.log('Credentials:');
        console.log('Username: admin');
        console.log('Password: password123');

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        if (connection) await connection.end();
    }
}

createAdmin();
