const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// SSL configuration for Aiven cloud database
let sslConfig = false;
if (process.env.DB_SSL === 'true' || process.env.DB_PORT) {
    sslConfig = {
        rejectUnauthorized: true
    };
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: sslConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();
