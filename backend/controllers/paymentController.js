const db = require('../config/db');
const crypto = require('crypto');

/**
 * ORD{appointmentId}_{timestamp}  → existing appointment checkout
 * ORD{scheduleId}_{patientId}_{timestamp} → new booking (finalize) checkout
 */
function parseInternalOrderId(orderKey) {
    const s = String(orderKey || '').trim();
    if (!/^ORD/i.test(s)) return null;
    const rest = s.replace(/^ORD/i, '');
    const parts = rest.split('_').filter(Boolean);
    if (parts.length === 2 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1])) {
        return { kind: 'appointment', appointmentId: Number(parts[0]) };
    }
    if (parts.length >= 3 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1])) {
        return {
            kind: 'pending_slot',
            scheduleId: Number(parts[0]),
            patientId: Number(parts[1])
        };
    }
    return null;
}

exports.getPaymentDetails = async (req, res) => {
    //create URL query (?patientID=1&appointment_schedule_id=1)
    const { patientID, appointment_schedule_id } = req.query;

    try {
        // appointment_id = DB PK (payments / PayHere). appointment_queue_no = position in this
        // schedule (1st, 2nd, …) — matches "No. booked_count+1" on the confirm-appointment page.
        const [rows] = await db.execute(
            `SELECT p.first_name, p.second_name,
                    d.name AS doctor_name, d.specialization,
                    aps.booked_count, aps.schedule_date, aps.start_time, aps.price AS channelingFee,
                    aps.id AS appointment_schedule_id,
                    appt.id AS appointment_id,
                    appt.booking_queue_no AS appointment_queue_no
             FROM patients p
             INNER JOIN appointment_schedules aps ON aps.id = ?
             INNER JOIN doctors d ON d.id = aps.doctor_id
             INNER JOIN appointments appt ON appt.id = (
                 SELECT a.id
                 FROM appointments a
                 WHERE a.patient_ID = p.id AND a.schedule_id = aps.id
                   AND COALESCE(a.appointment_status, 'added') <> 'failed'
                 ORDER BY a.id DESC
                 LIMIT 1
             )
             WHERE p.id = ?`,
            [appointment_schedule_id, patientID]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No payment details found (404)' });
        }
        res.status(200).json(rows[0]);

    } catch (error) {
        console.error('Error fetching payment details:', error);
        res.status(500).json({ message: 'Internal server error (500)' });

    }
};

//payhere hashing (for security purpose)

exports.generateHash = async (req, res) => {
    // get payhere credentials from .env file
    const { paymentID, amount, currency, patientID, appointmentScheduleId, sandbox } = req.body;
    const merchantID = process.env.PAYHERE_MERCHENT_ID.trim();
    const merchentSecret = process.env.PAYHERE_SECRET_CODE.trim();

    try {
        // create hash upperCase(MD5(MerchantID + paymentID + Amount + Currency + UpperCase(MD5(MerchantSecret))))
        const hashedSecret = crypto.createHash('md5').update(merchentSecret).digest('hex').toUpperCase();
        const amountFormatted = Number(amount).toLocaleString('en-US', {
            minimumFractionDigits: 2
        }).replaceAll(',', '');

        const hashRaw = merchantID + paymentID + amountFormatted + currency + hashedSecret;
        const hash = crypto.createHash('md5').update(hashRaw).digest('hex').toUpperCase();

        res.status(200).json({
            hash,
            merchantID: merchantID.trim()
        });
    } catch (error) {
        console.error('Error in generateHash:', error);
        res.status(500).json({ message: 'Could not initialize payment. Please try again later.' });
    }
};

/** Create a PENDING payment row before PayHere (existing appointment flow) so /notify can UPDATE it. */
exports.reserveCheckout = async (req, res) => {
    const { internal_order_id, appointment_id, amount } = req.body;
    if (!internal_order_id || appointment_id == null) {
        return res.status(400).json({ message: 'internal_order_id and appointment_id required' });
    }
    const orderKey = String(internal_order_id).trim();
    try {
        const [dup] = await db.execute('SELECT id FROM payments WHERE internal_order_id = ? LIMIT 1', [orderKey]);
        if (dup.length > 0) {
            return res.status(200).json({ ok: true, existed: true });
        }
        const [appts] = await db.execute(
            'SELECT id, schedule_id, doctor_id, patient_ID FROM appointments WHERE id = ?',
            [appointment_id]
        );
        if (appts.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        const a = appts[0];
        const env = process.env.PAYHERE_TEST_MODE === 'true' ? 'SANDBOX' : 'LIVE';
        const amt = amount != null ? Number(amount) : 0;
        await db.execute(
            `INSERT INTO payments
            (internal_order_id, patient_id, doctor_id, appointment_schedule_id, appointment_id, amount, payment_status, payment_environment)
            VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
            [orderKey, a.patient_ID, a.doctor_id, a.schedule_id, appointment_id, amt, env]
        );
        return res.status(201).json({ ok: true });
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') {
            return res.status(200).json({ ok: true, existed: true });
        }
        console.error('reserveCheckout error:', e);
        return res.status(500).json({ message: 'Could not reserve checkout' });
    }
};

exports.handleNotification = async (req, res) => {
    const {
        merchant_id,
        order_id, // PayHere sends order_id
        payhere_amount,
        payhere_currency,
        status_code,
        md5sig,
        payment_id, // PayHere internal payment ID
        method,
        card_last_digits
    } = req.body;

    // For our internal logic, we'll use paymentID to refer to our order_id
    const internalPaymentID = String(order_id == null ? '' : order_id).trim();

    // md5 signature verification
    const merchantSecret = process.env.PAYHERE_SECRET_CODE.trim();
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();

    const amountFormatted = Number(payhere_amount).toLocaleString('en-us', { minimumFractionDigits: 2 }).replaceAll(',', '');
    const hashString = merchant_id + internalPaymentID + amountFormatted + payhere_currency + status_code + hashedSecret;
    const localMd5sig = crypto.createHash('md5')
        .update(hashString)
        .digest('hex')
        .toUpperCase();

    const envSandbox = String(process.env.PAYHERE_TEST_MODE || '').trim().toLowerCase() === 'true';
    const signatureBypassForSandbox = envSandbox && md5sig === 'TEST_MODE';

    if (localMd5sig === md5sig || signatureBypassForSandbox) {
        try {
            // mapping status codes (PayHere may send string or number)
            // 2: Success, 0: Pending, -1: Canceled, -2: Failed, -3: Chargedback
            const sc = String(status_code ?? '').trim();
            let paymentStatus = 'PENDING';
            if (sc === '2' || status_code === 2) {
                paymentStatus = 'SUCCESS';
            } else if (sc === '0' || status_code === 0) {
                paymentStatus = 'PENDING';
            } else if (sc === '-1' || status_code === -1) {
                paymentStatus = 'CANCELED';
            } else if (sc === '-2' || status_code === -2) {
                paymentStatus = 'FAILED';
            } else if (sc === '-3' || status_code === -3) {
                paymentStatus = 'CHARGEDBACK';
            }

            // PayHere sends card_no, not card_last_digits in sandbox usually
            const payhere_card_no = req.body.card_no || '';
            const final_card_digits = payhere_card_no ? payhere_card_no.slice(-4) : (card_last_digits || '0000');

            const final_payment_id = payment_id || 'N/A';
            const final_method = method || 'N/A';

            const notifyEnvironment = envSandbox ? 'SANDBOX' : 'LIVE';
            const amountNum = payhere_amount != null ? Number(payhere_amount) : 0;

            const [updResult] = await db.execute(
                `UPDATE payments 
                 SET payment_status = ?, 
                     payhere_payment_id = ?, 
                     payment_method = ?, 
                     card_last_digits = ?,
                     payment_environment = ?
                 WHERE internal_order_id = ?`,
                [paymentStatus, final_payment_id, final_method, final_card_digits, notifyEnvironment, internalPaymentID]
            );

            if (updResult.affectedRows === 0) {
                const parsed = parseInternalOrderId(internalPaymentID);
                if (parsed?.kind === 'appointment') {
                    const [appts] = await db.execute(
                        'SELECT id, schedule_id, doctor_id, patient_ID FROM appointments WHERE id = ?',
                        [parsed.appointmentId]
                    );
                    if (appts.length > 0) {
                        const a = appts[0];
                        try {
                            await db.execute(
                                `INSERT INTO payments
                                (internal_order_id, patient_id, doctor_id, appointment_schedule_id, appointment_id, amount, payment_status, payhere_payment_id, payment_method, card_last_digits, payment_environment)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                [
                                    internalPaymentID,
                                    a.patient_ID,
                                    a.doctor_id,
                                    a.schedule_id,
                                    parsed.appointmentId,
                                    amountNum,
                                    paymentStatus,
                                    final_payment_id,
                                    final_method,
                                    final_card_digits,
                                    notifyEnvironment
                                ]
                            );
                        } catch (insErr) {
                            if (insErr.code !== 'ER_DUP_ENTRY') throw insErr;
                            await db.execute(
                                `UPDATE payments 
                                 SET payment_status = ?, payhere_payment_id = ?, payment_method = ?, card_last_digits = ?, payment_environment = ?
                                 WHERE internal_order_id = ?`,
                                [paymentStatus, final_payment_id, final_method, final_card_digits, notifyEnvironment, internalPaymentID]
                            );
                        }
                    }
                } else if (parsed?.kind === 'pending_slot') {
                    if (paymentStatus === 'SUCCESS') {
                        const appointmentController = require('./appointmentController');
                        await appointmentController.ensurePendingBookingAndPaymentFromNotify({
                            schedule_id: parsed.scheduleId,
                            patient_ID: parsed.patientId,
                            internal_order_id: internalPaymentID,
                            amount: amountNum,
                            paymentStatus,
                            final_payment_id,
                            final_method,
                            final_card_digits,
                            notifyEnvironment
                        });
                    } else {
                        let conn;
                        try {
                            conn = await db.getConnection();
                            await conn.beginTransaction();

                            const [schedRows] = await conn.execute(
                                'SELECT doctor_id, booked_count FROM appointment_schedules WHERE id = ? FOR UPDATE',
                                [parsed.scheduleId]
                            );
                            if (schedRows.length > 0) {
                                const docId = schedRows[0].doctor_id;
                                const bookingQueueNo = (Number(schedRows[0].booked_count) || 0) + 1;
                                const [apRes] = await conn.execute(
                                    `INSERT INTO appointments (schedule_id, doctor_id, patient_ID, booking_queue_no, appointment_status)
                                     VALUES (?, ?, ?, ?, 'failed')`,
                                    [parsed.scheduleId, docId, parsed.patientId, bookingQueueNo]
                                );
                                const apptId = apRes.insertId;
                                const [pRes] = await conn.execute(
                                    `INSERT INTO payments
                                    (internal_order_id, patient_id, doctor_id, appointment_schedule_id, appointment_id, amount, payment_status, payhere_payment_id, payment_method, card_last_digits, payment_environment)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                    [
                                        internalPaymentID,
                                        parsed.patientId,
                                        docId,
                                        parsed.scheduleId,
                                        apptId,
                                        amountNum,
                                        paymentStatus,
                                        final_payment_id,
                                        final_method,
                                        final_card_digits,
                                        notifyEnvironment
                                    ]
                                );
                                const payId = pRes.insertId;
                                await conn.execute(
                                    'UPDATE appointments SET payment_id = ? WHERE id = ?',
                                    [payId, apptId]
                                );
                            }
                            await conn.commit();
                        } catch (insErr) {
                            if (conn) await conn.rollback();
                            if (insErr.code !== 'ER_DUP_ENTRY') throw insErr;
                            await db.execute(
                                `UPDATE payments
                                 SET payment_status = ?, payhere_payment_id = ?, payment_method = ?, card_last_digits = ?, payment_environment = ?
                                 WHERE internal_order_id = ?`,
                                [
                                    paymentStatus,
                                    final_payment_id,
                                    final_method,
                                    final_card_digits,
                                    notifyEnvironment,
                                    internalPaymentID
                                ]
                            );
                        } finally {
                            if (conn) conn.release();
                        }
                    }
                }
            }

            res.status(200).send('OK');
        } catch (error) {
            console.error('Database update error:', error);
            res.status(500).send('DB Error');
        }
    } else {
        res.status(400).send('Invalid signature');
    }
}

exports.getPaymentStatus = async (req, res) => {
    const { orderID } = req.params;
    const key = orderID != null ? String(orderID).trim() : '';
    try {
        const [rows] = await db.execute(
            'SELECT payment_status, appointment_id FROM payments WHERE internal_order_id = ?',
            [key]
        );

        if (rows.length === 0) {
            return res.status(200).json({ status: 'NOT_FOUND', appointment_id: null });
        }

        res.status(200).json({
            status: rows[0].payment_status,
            appointment_id: rows[0].appointment_id != null ? Number(rows[0].appointment_id) : null
        });
    } catch (error) {
        console.error('Error fetching payment status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAllPaymentsForCashier = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                p.appointment_id,
                CONCAT(pt.first_name, ' ', pt.second_name) AS patient_name,
                d.name AS doctor_name,
                p.internal_order_id AS transaction_id,
                p.payment_method,
                p.amount,
                p.payment_status AS status,
                p.payment_environment,
                p.card_last_digits,
                p.created_at

                FROM
                    payments p
                JOIN 
                patients pt ON p.patient_id = pt.id
                LEFT JOIN
                doctors d ON p.doctor_id = d.id
                ORDER BY 
                p.created_at DESC -- Show newest transactions first
            `);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching all payments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteOldPayments = async (req, res) => {
    try {
        const [result] = await db.execute(
            `DELETE FROM payments WHERE created_at < DATE_SUB(NOW(), INTERVAL 2 YEAR)`
        );
        res.status(200).json({ message: `Deleted ${result.affectedRows} old payment(s)`, count: result.affectedRows });
    } catch (error) {
        console.error('Error deleting old payments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteSandboxPayments = async (req, res) => {
    try {
        const [result] = await db.execute(
            `DELETE FROM payments WHERE payment_environment = 'SANDBOX'`
        );
        res.status(200).json({ message: `Deleted ${result.affectedRows} sandbox payment(s)`, count: result.affectedRows });
    } catch (error) {
        console.error('Error deleting sandbox payments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    const { orderID } = req.params;
    const { status } = req.body;

    const ALLOWED_STATUSES = ['SUCCESS', 'PENDING', 'FAILED', 'CANCELED', 'REFUNDED', 'CHARGEDBACK'];
    if (!status || !ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}` });
    }

    try {
        const [result] = await db.execute(
            'UPDATE payments SET payment_status = ? WHERE internal_order_id = ?',
            [status, orderID]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.status(200).json({ message: 'Payment status updated successfully' });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
