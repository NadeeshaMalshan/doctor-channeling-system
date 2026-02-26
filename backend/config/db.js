const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

// SSL configuration for Aiven cloud database
let sslConfig = false;
if (process.env.DB_SSL === 'true') {
    const caPath = path.join(__dirname, '..', 'ca.pem');
    if (fs.existsSync(caPath)) {
        // Use the CA certificate file if available (local development)
        sslConfig = {
            ca: fs.readFileSync(caPath),
            rejectUnauthorized: true
        };
    } else {
        // On Vercel/cloud where ca.pem is not available
        sslConfig = {
            rejectUnauthorized: false
        };
    }
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: sslConfig,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();