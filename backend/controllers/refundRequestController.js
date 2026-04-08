const db = require('../config/db');
const { sendMail } = require('../utils/emailSender');
const { appendDeletedRefundsToGoogleSheet } = require('../utils/googleSheetsPaymentArchive');
const {
    buildRefundRequestSubmittedHtml,
    buildRefundRequestSubmittedText
} = require('../utils/refundFlowPatientEmail');

const MS_24H = 24 * 60 * 60 * 1000;

async function sendRefundRequestReceivedEmail({
    patient_id,
    appointment_id,
    pay
}) {
    try {
        const [rows] = await db.execute(
            `SELECT pt.email, pt.first_name, pt.second_name, d.name AS doctor_name, s.schedule_date
             FROM patients pt
             JOIN appointments a ON a.id = ? AND a.patient_ID = pt.id
             JOIN doctors d ON d.id = a.doctor_id
             JOIN appointment_schedules s ON s.id = a.schedule_id
             WHERE pt.id = ?`,
            [appointment_id, patient_id]
        );
        if (!rows.length) return;
        const r = rows[0];
        const email = String(r.email || '').trim();
        if (!email) return;

        const patientName = `${r.first_name || ''} ${r.second_name || ''}`.trim() || 'Patient';
        const scheduleRaw = r.schedule_date;
        const scheduleDateLabel =
            scheduleRaw != null
                ? String(scheduleRaw).split('T')[0].replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1')
                : '—';

        const ctx = {
            patientName,
            doctorName: r.doctor_name || '—',
            amount: pay.amount,
            orderRef: pay.internal_order_id,
            scheduleDateLabel
        };

        await sendMail({
            to: email,
            subject: 'Refund request received — NCC eCare',
            text: buildRefundRequestSubmittedText(ctx),
            html: buildRefundRequestSubmittedHtml(ctx)
        });
    } catch (e) {
        console.error('sendRefundRequestReceivedEmail:', e.message);
    }
}

exports.createRefundRequest = async (req, res) => {
    const patient_id = Number(req.body?.patient_id);
    const appointment_id = Number(req.body?.appointment_id);

    if (!Number.isFinite(patient_id) || !Number.isFinite(appointment_id)) {
        return res.status(400).json({ success: false, message: 'patient_id and appointment_id are required' });
    }

    try {
        const [appts] = await db.execute(
            'SELECT id, patient_ID FROM appointments WHERE id = ?',
            [appointment_id]
        );
        if (appts.length === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        if (Number(appts[0].patient_ID) !== patient_id) {
            return res.status(403).json({ success: false, message: 'This appointment does not belong to this patient' });
        }

        const [pays] = await db.execute(
            `SELECT id, internal_order_id, payment_status, amount, updated_at
             FROM payments
             WHERE appointment_id = ?
               AND UPPER(TRIM(COALESCE(payment_status, ''))) = 'SUCCESS'
             ORDER BY id DESC
             LIMIT 1`,
            [appointment_id]
        );
        if (pays.length === 0) {
            return res.status(400).json({ success: false, message: 'Only successful payments can request a refund' });
        }

        const pay = pays[0];
        const paidAt = new Date(pay.updated_at);
        if (Number.isNaN(paidAt.getTime()) || Date.now() - paidAt.getTime() > MS_24H) {
            return res.status(400).json({
                success: false,
                message: 'Refund requests are only accepted within 24 hours of payment'
            });
        }

        const [existing] = await db.execute(
            `SELECT id FROM refund_requests WHERE appointment_id = ? AND status = 'pending'`,
            [appointment_id]
        );
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'A refund request for this appointment is already pending'
            });
        }

        await db.execute(
            `INSERT INTO refund_requests (appointment_id, patient_id, payment_id, internal_order_id, status)
             VALUES (?, ?, ?, ?, 'pending')`,
            [appointment_id, patient_id, pay.id, pay.internal_order_id]
        );

        sendRefundRequestReceivedEmail({ patient_id, appointment_id, pay }).catch(() => {});

        return res.status(201).json({ success: true, message: 'Refund request submitted. Cashier will process it soon.' });
    } catch (error) {
        if (error?.code === 'ER_NO_SUCH_TABLE') {
            console.error('refund_requests table missing — run backend/scripts/syncRefundRequestsSchema.js');
            return res.status(503).json({
                success: false,
                message: 'Refund requests are not available yet. Please contact support.'
            });
        }
        console.error('createRefundRequest error:', error);
        return res.status(500).json({ success: false, message: 'Server error while submitting refund request' });
    }
};

exports.listPendingRefundRequests = async (req, res) => {
    const role = req.staff?.role;
    if (role !== 'Cashier' && role !== 'Admin') {
        return res.status(403).json({ success: false, message: 'Only cashiers and admins can view refund requests' });
    }

    try {
        const [rows] = await db.execute(`
            SELECT
                rr.id,
                rr.appointment_id,
                rr.patient_id,
                rr.internal_order_id,
                rr.requested_at,
                rr.status,
                NULLIF(TRIM(CONCAT(COALESCE(pt.first_name, ''), ' ', COALESCE(pt.second_name, ''))), '') AS patient_name,
                pt.phone AS patient_phone,
                pt.email AS patient_email,
                d.name AS doctor_name,
                COALESCE(pay.amount, s.price) AS amount,
                s.schedule_date,
                s.start_time
            FROM refund_requests rr
            LEFT JOIN patients pt ON pt.id = rr.patient_id
            JOIN appointments a ON a.id = rr.appointment_id
            LEFT JOIN appointment_schedules s ON s.id = a.schedule_id
            LEFT JOIN doctors d ON d.id = a.doctor_id
            LEFT JOIN payments pay ON pay.internal_order_id = rr.internal_order_id
            WHERE rr.status = 'pending'
            ORDER BY rr.requested_at DESC
        `);

        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        if (error?.code === 'ER_NO_SUCH_TABLE') {
            return res.status(200).json({ success: true, data: [] });
        }
        console.error('listPendingRefundRequests error:', error);
        return res.status(500).json({ success: false, message: 'Server error while loading refund requests' });
    }
};

exports.listAllRefundRequests = async (req, res) => {
    const role = req.staff?.role;
    if (role !== 'Cashier' && role !== 'Admin') {
        return res.status(403).json({ success: false, message: 'Only cashiers and admins can view refund requests' });
    }

    try {
        const [rows] = await db.execute(`
            SELECT
                rr.id,
                rr.appointment_id,
                rr.patient_id,
                rr.internal_order_id,
                rr.requested_at,
                rr.resolved_at,
                rr.status,
                NULLIF(TRIM(CONCAT(COALESCE(pt.first_name, ''), ' ', COALESCE(pt.second_name, ''))), '') AS patient_name,
                pt.phone AS patient_phone,
                pt.email AS patient_email,
                d.name AS doctor_name,
                COALESCE(pay.amount, s.price) AS amount,
                s.schedule_date,
                s.start_time
            FROM refund_requests rr
            LEFT JOIN patients pt ON pt.id = rr.patient_id
            JOIN appointments a ON a.id = rr.appointment_id
            LEFT JOIN appointment_schedules s ON s.id = a.schedule_id
            LEFT JOIN doctors d ON d.id = a.doctor_id
            LEFT JOIN payments pay ON pay.id = rr.payment_id
            ORDER BY rr.requested_at DESC
        `);

        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        if (error?.code === 'ER_NO_SUCH_TABLE') {
            return res.status(200).json({ success: true, data: [] });
        }
        console.error('listAllRefundRequests error:', error);
        return res.status(500).json({ success: false, message: 'Server error while loading refund requests' });
    }
};

exports.deleteOldRefundRequests = async (req, res) => {
    const role = req.staff?.role;
    if (role !== 'Cashier' && role !== 'Admin') {
        return res.status(403).json({ success: false, message: 'Only cashiers and admins can delete refund requests' });
    }

    try {
        const [rows] = await db.execute(
            `SELECT
                rr.id,
                rr.appointment_id,
                rr.internal_order_id,
                rr.requested_at,
                rr.resolved_at,
                rr.status,
                NULLIF(TRIM(CONCAT(COALESCE(pt.first_name, ''), ' ', COALESCE(pt.second_name, ''))), '') AS patient_name,
                pt.phone AS patient_phone,
                pt.email AS patient_email,
                d.name AS doctor_name,
                COALESCE(pay.amount, s.price) AS amount,
                s.schedule_date,
                s.start_time
            FROM refund_requests rr
            LEFT JOIN appointments a ON a.id = rr.appointment_id
            LEFT JOIN patients pt ON pt.id = COALESCE(rr.patient_id, a.patient_ID)
            LEFT JOIN appointment_schedules s ON s.id = a.schedule_id
            LEFT JOIN doctors d ON d.id = a.doctor_id
            LEFT JOIN payments pay ON pay.id = rr.payment_id
            WHERE rr.requested_at < DATE_SUB(NOW(), INTERVAL 10 YEAR)`
        );

        if (rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'Deleted 0 old refund request(s)',
                count: 0,
                archivedToSheet: false
            });
        }

        const deletedBy = req.staff?.username != null ? String(req.staff.username) : String(req.staff?.id ?? '');
        const archive = await appendDeletedRefundsToGoogleSheet(rows, {
            deletedAt: new Date(),
            deletedBy
        });

        if (!archive.skipped && !archive.ok) {
            return res.status(502).json({
                success: false,
                message:
                    'Could not save deleted refund details to Google Sheet. No refund requests were removed. Fix Google Sheets credentials, add a Sheet2 tab if missing, and ensure the sheet is shared with the service account.',
                error: archive.error
            });
        }

        const ids = rows.map((r) => r.id);
        const placeholders = ids.map(() => '?').join(',');
        const [result] = await db.execute(`DELETE FROM refund_requests WHERE id IN (${placeholders})`, ids);

        return res.status(200).json({
            success: true,
            message: `Deleted ${result.affectedRows} old refund request(s)`,
            count: result.affectedRows,
            archivedToSheet: !archive.skipped
        });
    } catch (error) {
        console.error('deleteOldRefundRequests error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
