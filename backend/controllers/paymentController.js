const db = require('../config/db');
const crypto = require('crypto');

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
                    (
                        SELECT COUNT(*)
                        FROM appointments x
                        WHERE x.schedule_id = appt.schedule_id
                          AND (
                            x.created_at < appt.created_at
                            OR (x.created_at = appt.created_at AND x.id <= appt.id)
                          )
                    ) AS appointment_queue_no
             FROM patients p
             INNER JOIN appointment_schedules aps ON aps.id = ?
             INNER JOIN doctors d ON d.id = aps.doctor_id
             INNER JOIN appointments appt ON appt.id = (
                 SELECT a.id
                 FROM appointments a
                 WHERE a.patient_ID = p.id AND a.schedule_id = aps.id
                 ORDER BY a.created_at DESC, a.id DESC
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

        // Fetch doctorID from schedule
        const [scheduleRows] = await db.execute(
            'SELECT doctor_id FROM appointment_schedules WHERE id = ?',
            [appointmentScheduleId]
        );
        const doctorID = scheduleRows.length > 0 ? scheduleRows[0].doctor_id : 0;

        // save a PENDING record in the database
        // paymentID format: ORD{appointmentID}_{timestamp}
        const appointmentID = paymentID.split('_')[0].replace('ORD', '');
        const paymentEnvironment = sandbox === false ? 'LIVE' : 'SANDBOX';

        await db.execute(
            `INSERT INTO payments (appointment_id, internal_order_id, patient_id, doctor_id, appointment_schedule_id, amount, payment_status, payment_environment) 
             VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
            [appointmentID, paymentID, patientID, doctorID, appointmentScheduleId, amount, paymentEnvironment]
        );

        res.status(200).json({
            hash,
            merchantID: merchantID.trim()
        });
    } catch (error) {
        console.error('Error in generateHash:', error);
        res.status(500).json({ message: 'Could not initialize payment. Please try again later.' });
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
    const internalPaymentID = order_id;

    // md5 signature verification
    const merchantSecret = process.env.PAYHERE_SECRET_CODE.trim();
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();

    const amountFormatted = Number(payhere_amount).toLocaleString('en-us', { minimumFractionDigits: 2 }).replaceAll(',', '');
    const hashString = merchant_id + internalPaymentID + amountFormatted + payhere_currency + status_code + hashedSecret;
    const localMd5sig = crypto.createHash('md5')
        .update(hashString)
        .digest('hex')
        .toUpperCase();

    const isTestMode = process.env.PAYHERE_TEST_MODE === 'true' && md5sig === 'TEST_MODE';

    if (localMd5sig === md5sig || isTestMode) {
        try {
            // mapping status codes
            // 2: Success, 0: Pending, -1: Canceled, -2: Failed, -3: Chargedback
            let paymentStatus = 'PENDING';
            if (status_code === '2') {
                paymentStatus = 'SUCCESS';
            } else if (status_code === '0') {
                paymentStatus = 'PENDING';
            } else if (status_code === '-1') {
                paymentStatus = 'CANCELED';
            } else if (status_code === '-2') {
                paymentStatus = 'FAILED';
            } else if (status_code === '-3') {
                paymentStatus = 'CHARGEDBACK';
            }

            // PayHere sends card_no, not card_last_digits in sandbox usually
            const payhere_card_no = req.body.card_no || '';
            const final_card_digits = payhere_card_no ? payhere_card_no.slice(-4) : (card_last_digits || '0000');

            const final_payment_id = payment_id || 'N/A';
            const final_method = method || 'N/A';

            const notifyEnvironment = isTestMode ? 'SANDBOX' : 'LIVE';

            await db.execute(
                `UPDATE payments 
                 SET payment_status = ?, 
                     payhere_payment_id = ?, 
                     payment_method = ?, 
                     card_last_digits = ?,
                     payment_environment = ?
                 WHERE internal_order_id = ?`,
                [paymentStatus, final_payment_id, final_method, final_card_digits, notifyEnvironment, internalPaymentID]
            );

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
    try {
        const [rows] = await db.execute(
            'SELECT payment_status FROM payments WHERE internal_order_id = ?',
            [orderID]
        );

        if (rows.length === 0) {
            return res.status(200).json({ status: 'NOT_FOUND' });
        }

        res.status(200).json({ status: rows[0].payment_status });
    } catch (error) {
        console.error('Error fetching payment status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAllPaymentsForCashier = async (req, res)=>{
    try{
        const [rows]= await db.execute(`
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
