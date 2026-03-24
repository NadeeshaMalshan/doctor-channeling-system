'use strict';

function formatScheduleDateTime(scheduleDate, startTime) {
    if (scheduleDate == null || scheduleDate === '') return 'N/A';
    const d = scheduleDate instanceof Date ? scheduleDate : new Date(scheduleDate);
    if (Number.isNaN(d.getTime())) return String(scheduleDate);
    const datePart = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (startTime == null || startTime === '') return datePart;
    const t = String(startTime);
    return `${datePart}  ${t.length >= 5 ? t.slice(0, 5) : t}`;
}

function formatBookingQueueNo(val) {
    if (val == null || val === '') return null;
    const n = Number(typeof val === 'bigint' ? val.toString() : val);
    if (Number.isFinite(n) && n >= 1) return String(Math.floor(n)).padStart(2, '0');
    return String(val);
}

function rowToReceiptData(row, internalOrderId) {
    const patientName = [row.first_name, row.second_name].filter(Boolean).join(' ').trim() || 'N/A';
    const q = formatBookingQueueNo(row.booking_queue_no);
    return {
        paymentID: internalOrderId,
        appointmentId: row.appointment_id,
        appointmentNo: q != null ? q : row.booking_queue_no,
        patientName,
        doctorName: row.doctor_name || 'N/A',
        specialization: row.specialization || 'N/A',
        dateTime: formatScheduleDateTime(row.schedule_date, row.start_time),
        totalAmount: row.amount
    };
}

module.exports = { formatScheduleDateTime, formatBookingQueueNo, rowToReceiptData };
