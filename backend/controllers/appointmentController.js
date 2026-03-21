const db = require('../config/db');

exports.finalizeAppointment = async (req, res) => {
    const { pending_appointment, payhere_order_id, amount } = req.body;

    if (!pending_appointment || !payhere_order_id) {
        return res.status(400).json({ success: false, message: 'Missing required data' });
    }

    const { schedule_id, doctor_id, patient_ID, appointment_No } = pending_appointment;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Insert Appointment
        const [appointmentResult] = await connection.execute(
            `INSERT INTO appointments 
            (schedule_id, doctor_id, patient_ID, appointment_No, appointment_payment_status) 
            VALUES (?, ?, ?, ?, 'paid')`,
            [schedule_id, doctor_id, patient_ID, appointment_No]
        );

        const newAppointmentId = appointmentResult.insertId;

        // 2. Insert Payment
        const paymentEnvironment = process.env.PAYHERE_TEST_MODE === 'true' ? 'SANDBOX' : 'LIVE';

        await connection.execute(
            `INSERT INTO payments 
             (appointment_id, internal_order_id, patient_id, doctor_id, appointment_schedule_id, amount, payment_status, payment_environment) 
             VALUES (?, ?, ?, ?, ?, ?, 'SUCCESS', ?)`,
            [newAppointmentId, payhere_order_id, patient_ID, doctor_id, schedule_id, amount || pending_appointment.channelingFee, paymentEnvironment]
        );

        // 3. Update Schedule booked_count
        const [schedules] = await connection.execute(
            'SELECT * FROM appointment_schedules WHERE id = ? FOR UPDATE',
            [schedule_id]
        );

        if (schedules.length > 0) {
            const schedule = schedules[0];
            const newBookedCount = schedule.booked_count + 1;
            let updateScheduleQuery = 'UPDATE appointment_schedules SET booked_count = ?';
            const updateParams = [newBookedCount];

            if (newBookedCount >= schedule.max_patients) {
                updateScheduleQuery += ', status = ?';
                updateParams.push('full');
            }

            updateScheduleQuery += ' WHERE id = ?';
            updateParams.push(schedule_id);

            await connection.execute(updateScheduleQuery, updateParams);
        }

        await connection.commit();
        res.status(200).json({
            success: true,
            message: 'Appointment finalized successfully',
            data: { id: newAppointmentId }
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Finalize appointment error:', error);
        res.status(500).json({ success: false, message: 'Server error while finalizing appointment' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

exports.createAppointment = async (req, res) => {
    const {
        schedule_id,
        doctor_id,
        patient_ID
    } = req.body;

    if (!patient_ID) {
        return res.status(401).json({ success: false, message: 'Authentication required. patient_ID missing.' });
    }

    if (!schedule_id || !doctor_id) {
        return res.status(400).json({ success: false, message: 'Required fields are missing' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Check schedule exists and is active, using FOR UPDATE lock
        const [schedules] = await connection.execute(
            'SELECT * FROM appointment_schedules WHERE id = ? FOR UPDATE',
            [schedule_id]
        );

        if (schedules.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }

        const schedule = schedules[0];

        if (schedule.status !== 'active') {
            await connection.rollback();
            return res.status(400).json({ success: false, message: `Schedule is currently ${schedule.status}` });
        }

        if (schedule.booked_count >= schedule.max_patients) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Schedule is full' });
        }

        const [result] = await connection.execute(
            `INSERT INTO appointments 
            (schedule_id, doctor_id, patient_ID) 
            VALUES (?, ?, ?)`,
            [schedule_id, doctor_id, patient_ID]
        );

        const newBookedCount = schedule.booked_count + 1;
        let updateScheduleQuery = 'UPDATE appointment_schedules SET booked_count = ?';
        const updateParams = [newBookedCount];

        if (newBookedCount >= schedule.max_patients) {
            updateScheduleQuery += ', status = ?';
            updateParams.push('full');
        }

        updateScheduleQuery += ' WHERE id = ?';
        updateParams.push(schedule_id);

        await connection.execute(updateScheduleQuery, updateParams);

        await connection.commit();
        const newAppointmentId = Number(result.insertId);
        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: { id: newAppointmentId }
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Create appointment error:', error);
        res.status(500).json({ success: false, message: 'Server error while booking appointment' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};



exports.getAppointmentsBySchedule = async (req, res) => {
    const { schedule_id } = req.params;
    try {
        const [appointments] = await db.execute(`
            SELECT a.*, p.first_name, p.second_name, p.phone AS customer_phone
            FROM appointments a
            JOIN patients p ON a.patient_ID = p.id
            WHERE a.schedule_id = ?
            ORDER BY a.created_at ASC
        `, [schedule_id]);

        res.status(200).json({ success: true, message: 'Appointments fetched successfully', data: appointments });
    } catch (error) {
        console.error('Get appointments by schedule error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching appointments' });
    }
};

exports.getPatientAppointments = async (req, res) => {
    const { patient_id } = req.params;
    try {
        const [appointments] = await db.execute(`
            SELECT 
                a.id as appointment_id,
                a.appointment_payment_status,
                a.created_at as booking_date,
                s.schedule_date,
                s.start_time,
                s.end_time,
                s.price,
                d.name as doctor_name,
                d.specialization as doctor_specialization,
                d.hospital as doctor_hospital
            FROM appointments a
            JOIN appointment_schedules s ON a.schedule_id = s.id
            JOIN doctors d ON a.doctor_id = d.id
            WHERE a.patient_ID = ?
            ORDER BY s.schedule_date DESC, s.start_time DESC
        `, [patient_id]);

        res.status(200).json({ success: true, message: 'Patient appointments fetched successfully', data: appointments });
    } catch (error) {
        console.error('Get patient appointments error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching appointments' });
    }
};

exports.updateAppointment = async (req, res) => {
    const { id } = req.params;
    const { appointment_status } = req.body;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [existing] = await connection.execute('SELECT * FROM appointments WHERE id = ? FOR UPDATE', [id]);
        if (existing.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        const appointment = existing[0];

        let updates = [];
        let params = [];

        if (appointment_status) { updates.push('appointment_status = ?'); params.push(appointment_status); }

        if (updates.length > 0) {
            params.push(id);
            await connection.execute(`UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`, params);

            // If appointment cancelled, decrease the booked_count in schedule
            if (appointment_status === 'cancelled' && appointment.appointment_status !== 'cancelled') {
                const [schedules] = await connection.execute('SELECT * FROM appointment_schedules WHERE id = ? FOR UPDATE', [appointment.schedule_id]);
                if (schedules.length > 0) {
                    const schedule = schedules[0];
                    const newBookedCount = Math.max(0, schedule.booked_count - 1);

                    let scheduleUpdate = 'UPDATE appointment_schedules SET booked_count = ?';
                    let scheduleParams = [newBookedCount];

                    // If it was full, it's now active again
                    if (schedule.status === 'full') {
                        scheduleUpdate += ', status = ?';
                        scheduleParams.push('active');
                    }

                    scheduleUpdate += ' WHERE id = ?';
                    scheduleParams.push(appointment.schedule_id);

                    await connection.execute(scheduleUpdate, scheduleParams);
                }
            }
        }

        await connection.commit();
        res.status(200).json({ success: true, message: 'Appointment updated successfully' });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Update appointment error:', error);
        res.status(500).json({ success: false, message: 'Server error while updating appointment' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

exports.deleteAppointment = async (req, res) => {
    const { id } = req.params;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [existing] = await connection.execute('SELECT * FROM appointments WHERE id = ? FOR UPDATE', [id]);
        if (existing.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        const appointment = existing[0];

        if (appointment.appointment_status !== 'cancelled') {
            const [schedules] = await connection.execute('SELECT * FROM appointment_schedules WHERE id = ? FOR UPDATE', [appointment.schedule_id]);
            if (schedules.length > 0) {
                const schedule = schedules[0];
                const newBookedCount = Math.max(0, schedule.booked_count - 1);

                let scheduleUpdate = 'UPDATE appointment_schedules SET booked_count = ?';
                let scheduleParams = [newBookedCount];

                if (schedule.status === 'full') {
                    scheduleUpdate += ', status = ?';
                    scheduleParams.push('active');
                }

                scheduleUpdate += ' WHERE id = ?';
                scheduleParams.push(appointment.schedule_id);

                await connection.execute(scheduleUpdate, scheduleParams);
            }
        }

        await connection.execute('DELETE FROM appointments WHERE id = ?', [id]);

        await connection.commit();
        res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Delete appointment error:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting appointment' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};
