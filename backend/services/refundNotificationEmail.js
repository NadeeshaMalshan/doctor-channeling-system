'use strict';

const db = require('../config/db');
const { getTransporter, isReceiptEmailConfigured, envVal } = require('../utils/mailTransporter');
const {
    buildRefundEmailHtml,
    buildRefundEmailText,
    humanizeRefundReason
} = require('../utils/refundEmailHtml');
const { formatScheduleDateTime } = require('../utils/receiptData');

async function loadRefundEmailContext(internalOrderId) {
    const key = String(internalOrderId || '').trim();
    const [rows] = await db.execute(
        `SELECT
            p.internal_order_id,
            p.amount AS original_amount,
            pt.email AS patient_email,
            pt.first_name,
            pt.second_name,
            d.name AS doctor_name,
            a.booking_queue_no,
            aps.schedule_date,
            aps.start_time
         FROM payments p
         INNER JOIN patients pt ON pt.id = p.patient_id
         LEFT JOIN doctors d ON d.id = p.doctor_id
         LEFT JOIN appointment_schedules aps ON aps.id = p.appointment_schedule_id
         LEFT JOIN appointments a ON a.id = p.appointment_id
         WHERE p.internal_order_id = ?
         LIMIT 1`,
        [key]
    );
    return rows.length ? rows[0] : null;
}

/**
 * Fire-and-forget after PayHere refund succeeds.
 */
async function sendRefundNotificationEmail(internalOrderId, refundAmountNum, reasonCode) {
    if (!isReceiptEmailConfigured()) return;

    const row = await loadRefundEmailContext(internalOrderId);
    if (!row || !row.patient_email) return;

    const transporter = getTransporter();
    if (!transporter) return;

    const fromAddr = envVal('SMTP_FROM_EMAIL') || envVal('SMTP_USER');
    if (!fromAddr) return;

    const patientName =
        [row.first_name, row.second_name].filter(Boolean).join(' ').trim() || 'Patient';
    const refundStr = Number(refundAmountNum).toFixed(2);
    const origStr = Number(row.original_amount || 0).toFixed(2);
    const dateTime =
        row.schedule_date != null
            ? formatScheduleDateTime(row.schedule_date, row.start_time)
            : '';

    const processedDateLabel = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const ctx = {
        patientName,
        paymentRef: row.internal_order_id,
        refundAmountFormatted: refundStr,
        originalAmountFormatted: origStr,
        doctorName: row.doctor_name || '',
        dateTime,
        reasonLabel: humanizeRefundReason(reasonCode),
        processedDateLabel
    };

    await transporter.sendMail({
        from: `"NCC eCare" <${fromAddr}>`,
        to: row.patient_email,
        subject: 'Payment refunded — NCC eCare',
        text: buildRefundEmailText(ctx),
        html: buildRefundEmailHtml(ctx)
    });
}

module.exports = { sendRefundNotificationEmail };
