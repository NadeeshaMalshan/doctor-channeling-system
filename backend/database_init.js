const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? {
        ca: fs.readFileSync(path.join(__dirname, 'ca.pem'))
    } : null,
    multipleStatements: true
};

async function initDatabase() {
    let connection;
    try {
        console.log('Connecting to MySQL...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected.');


        const sqlFilePath = path.join(__dirname, 'database_setup.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('Executing database setup from ' + sqlFilePath + '...');
        await connection.query(sql);
        console.log('Database and table created successfully!');

    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        if (connection) await connection.end();
    }
}

initDatabase();
