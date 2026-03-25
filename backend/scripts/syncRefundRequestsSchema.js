/**
 * Creates refund_requests table if missing.
 * Run: node backend/scripts/syncRefundRequestsSchema.js  (from repo root)
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
    if (await tableExists('refund_requests')) {
        console.log('refund_requests table already exists — skip.');
        process.exit(0);
        return;
    }
    console.log('Creating refund_requests table...');
    await db.execute(`
        CREATE TABLE refund_requests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            appointment_id INT NOT NULL,
            patient_id INT NOT NULL,
            payment_id INT NULL,
            internal_order_id VARCHAR(50) NOT NULL,
            status ENUM('pending', 'completed', 'rejected') NOT NULL DEFAULT 'pending',
            requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP NULL DEFAULT NULL,
            INDEX idx_refund_requests_status (status),
            INDEX idx_refund_requests_appt (appointment_id),
            CONSTRAINT fk_refund_requests_appointment
                FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
            CONSTRAINT fk_refund_requests_patient
                FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
            CONSTRAINT fk_refund_requests_payment
                FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
        )
    `);
    console.log('Done.');
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
