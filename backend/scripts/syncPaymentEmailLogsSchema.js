/**
 * Creates payment_email_logs table if missing.
 * Run: node backend/scripts/syncPaymentEmailLogsSchema.js  (from repo root)
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/db');

async function tableExists(name) {
    const [rows] = await db.execute(
        `SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
        [name]
    );
    return rows.length > 0;
}

async function main() {
    if (await tableExists('payment_email_logs')) {
        console.log('payment_email_logs table already exists — skip.');
        process.exit(0);
        return;
    }

    console.log('Creating payment_email_logs table...');
    await db.execute(`
        CREATE TABLE payment_email_logs (
            internal_order_id VARCHAR(50) NOT NULL PRIMARY KEY,
            payment_status VARCHAR(20) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_payment_email_logs_status (payment_status)
        )
    `);
    console.log('Done.');
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

