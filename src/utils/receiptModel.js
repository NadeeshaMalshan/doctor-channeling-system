/**
 * Single source for receipt line items + terms (keep in sync with backend/utils/receiptModel.js).
 */
export function getReceiptDetailRows(data) {
    const amt = Number(data.totalAmount || 0);
    const amtStr = `LKR ${amt.toFixed(2)}`;
    return [
        { label: 'Payment Reference', value: String(data.paymentID || 'N/A'), mono: true },
        null,
        { label: 'Appointment ID', value: `#${data.appointmentId != null ? data.appointmentId : 'N/A'}` },
        { label: 'Appointment No', value: String(data.appointmentNo != null ? data.appointmentNo : 'N/A'), accent: true },
        { label: 'Patient Name', value: String(data.patientName || 'N/A') },
        { label: 'Doctor', value: String(data.doctorName || 'N/A') },
        { label: 'Specialization', value: String(data.specialization || 'N/A') },
        { label: 'Date & Time', value: String(data.dateTime || 'N/A') },
        null,
        { label: 'Fee', value: amtStr },
        { label: 'Total Amount Paid', value: amtStr, bold: true, large: true }
    ];
}

export const RECEIPT_CONDITIONS = [
    'Refund Policy: Refunds are applicable within 24 hours of payment only. No refunds will be processed after the 24-hour window has passed.',
    'Appointment: Please arrive at least 10 minutes before your scheduled appointment time.',
    'Cancellation: Notify us at least 2 hours in advance to reschedule or cancel your appointment.',
    'This receipt is computer-generated and is valid without a physical signature.',
    'Support: Contact narammalachannelcenterandhospi@gmail.com or call 0372 249 959 for any assistance.'
];
