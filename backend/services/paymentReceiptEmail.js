'use strict';

const db = require('../config/db');
const { getTransporter, isReceiptEmailConfigured, envVal } = require('../utils/mailTransporter');
const { rowToReceiptData } = require('../utils/receiptData');
const { buildReceiptPdfBufferFromJsPDF } = require('../utils/generateReceiptPdfNode');
const { buildReceiptEmailHtml, buildReceiptEmailText } = require('../utils/receiptEmailHtml');

async function claimReceiptSend(internalOrderId) {
    try {
        const [r] = await db.execute(
            `UPDATE payments SET receipt_email_sent_at = NOW()
             WHERE internal_order_id = ?
               AND UPPER(TRIM(COALESCE(payment_status, ''))) = 'SUCCESS'
               AND receipt_email_sent_at IS NULL`,
            [internalOrderId]
        );
        return r.affectedRows === 1;
    } catch (e) {
        if (e.code === 'ER_BAD_FIELD_ERROR') {
            console.error(
                '[receipt email] Run: ALTER TABLE payments ADD COLUMN receipt_email_sent_at DATETIME NULL DEFAULT NULL;'
            );
            return false;
        }
        throw e;
    }
}

async function clearReceiptSendClaim(internalOrderId) {
    try {
        await db.execute(
            `UPDATE payments SET receipt_email_sent_at = NULL WHERE internal_order_id = ?`,
            [String(internalOrderId || '').trim()]
        );
    } catch (e) {
        if (e.code !== 'ER_BAD_FIELD_ERROR') throw e;
    }
}

async function loadReceiptContext(internalOrderId) {
    const key = String(internalOrderId || '').trim();
    const [rows] = await db.execute(
        `SELECT
            pay.amount,
            pay.appointment_id,
            pt.first_name,
            pt.second_name,
            pt.email AS patient_email,
            d.name AS doctor_name,
            d.specialization,
            aps.schedule_date,
            aps.start_time,
            a.booking_queue_no
         FROM payments pay
         INNER JOIN patients pt ON pt.id = pay.patient_id
         INNER JOIN doctors d ON d.id = pay.doctor_id
         INNER JOIN appointment_schedules aps ON aps.id = pay.appointment_schedule_id
         LEFT JOIN appointments a ON a.id = pay.appointment_id
         WHERE pay.internal_order_id = ?
           AND UPPER(TRIM(COALESCE(pay.payment_status, ''))) = 'SUCCESS'
         LIMIT 1`,
        [key]
    );
    return rows.length ? rows[0] : null;
}

function receiptLog(msg, extra) {
    if (extra !== undefined) {
        console.log('[receipt email]', msg, extra);
    } else {
        console.log('[receipt email]', msg);
    }
}

/**
 * After PayHere marks payment SUCCESS — send PDF receipt once per order.
 */
async function sendPaymentReceiptEmailIfNeeded(internalOrderId) {
    const orderKey = String(internalOrderId || '').trim();
    if (!orderKey) {
        receiptLog('skipped: empty order id');
        return;
    }

    if (!isReceiptEmailConfigured()) {
        receiptLog('skipped: SMTP_USER / SMTP_PASS not set in .env');
        return;
    }

    const claimed = await claimReceiptSend(orderKey);
    if (!claimed) {
        try {
            const [chk] = await db.execute(
                `SELECT payment_status, receipt_email_sent_at FROM payments WHERE internal_order_id = ? LIMIT 1`,
                [orderKey]
            );
            if (chk.length === 0) {
                receiptLog(`skipped: no payments row yet for order ${orderKey} (PayHere /notify may not have reached this server)`);
            } else if (chk[0].receipt_email_sent_at != null) {
                receiptLog(`skipped: receipt already emailed for order ${orderKey}`);
            } else if (String(chk[0].payment_status || '').toUpperCase().trim() !== 'SUCCESS') {
                receiptLog(
                    `skipped: payment_status is "${chk[0].payment_status}" for order ${orderKey}, not SUCCESS`
                );
            } else {
                receiptLog(
                    `skipped: cannot claim send for order ${orderKey} — add DB column receipt_email_sent_at (see migrations/add_payments_receipt_email_sent_at.sql)`
                );
            }
        } catch (e) {
            if (e.code === 'ER_BAD_FIELD_ERROR') {
                receiptLog(
                    'skipped: DB column receipt_email_sent_at missing — run migrations/add_payments_receipt_email_sent_at.sql'
                );
            } else {
                receiptLog('skipped: claim failed;', e.message || e);
            }
        }
        return;
    }

    const row = await loadReceiptContext(orderKey);
    if (!row || !row.patient_email) {
        await clearReceiptSendClaim(orderKey);
        receiptLog(`skipped: no payment row or patient email for order ${orderKey}`);
        return;
    }

    const transporter = getTransporter();
    if (!transporter) {
        await clearReceiptSendClaim(orderKey);
        receiptLog('skipped: transporter not created');
        return;
    }

    const fromAddr = envVal('SMTP_FROM_EMAIL') || envVal('SMTP_USER');
    if (!fromAddr) {
        await clearReceiptSendClaim(orderKey);
        receiptLog('skipped: SMTP_FROM_EMAIL / SMTP_USER empty after trim');
        return;
    }
    const data = rowToReceiptData(row, orderKey);
    const safeName = orderKey.replace(/[^\w.-]+/g, '_');

    try {
        const pdfBuffer = buildReceiptPdfBufferFromJsPDF(data);
        await transporter.sendMail({
            from: `"NCC eCare" <${fromAddr}>`,
            to: row.patient_email,
            subject: 'Your payment receipt — NCC eCare',
            text: buildReceiptEmailText(data),
            html: buildReceiptEmailHtml(data),
            attachments: [
                {
                    filename: `NCC-Receipt-${safeName}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        });
        receiptLog(`sent OK for order ${orderKey}`);
    } catch (e) {
        await clearReceiptSendClaim(orderKey);
        receiptLog(`send failed for order ${orderKey}:`, e.message || e);
        throw e;
    }
}

module.exports = { sendPaymentReceiptEmailIfNeeded };
