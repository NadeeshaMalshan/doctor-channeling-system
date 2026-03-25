import React, { useState, useEffect, useCallback } from 'react';
import './ComponentsCss/AppointmentHistory.css';
import { formatDateTimeLK, formatScheduleDateLK, formatWallTime12 } from '../utils/sriLankaTime';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const MS_24H = 24 * 60 * 60 * 1000;

const isRefundRequestPending = (v) => v === true || v === 1 || v === '1';

const isPaidWithinRefundWindow = (paymentPaidAt) => {
    if (paymentPaidAt == null || paymentPaidAt === '') return false;
    const t = new Date(paymentPaidAt).getTime();
    if (Number.isNaN(t)) return false;
    return Date.now() - t <= MS_24H;
};

const AppointmentHistory = ({ patientId, onClose }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refundSubmitId, setRefundSubmitId] = useState(null);
    const [refundMessage, setRefundMessage] = useState({ type: '', text: '' });

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/api/appointments/patient/${patientId}`);
            const data = await response.json();

            if (response.ok) {
                setAppointments(data.data || []);
            } else {
                setError(data.message || 'Failed to fetch appointments');
            }
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError('Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const submitRefundRequest = async (appointmentId) => {
        setRefundMessage({ type: '', text: '' });
        setRefundSubmitId(appointmentId);
        try {
            const response = await fetch(`${API_BASE}/api/refund-requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patient_id: patientId, appointment_id: appointmentId })
            });
            const data = await response.json().catch(() => ({}));
            if (response.ok) {
                setRefundMessage({ type: 'ok', text: data.message || 'Refund request sent.' });
                await fetchAppointments();
            } else {
                setRefundMessage({ type: 'err', text: data.message || 'Could not submit refund request.' });
            }
        } catch {
            setRefundMessage({ type: 'err', text: 'Could not connect to the server.' });
        } finally {
            setRefundSubmitId(null);
        }
    };

    const formatTimeRange = (start, end) => {
        const a = formatWallTime12(start);
        const b = formatWallTime12(end);
        if (a === '—' && b === '—') return '—';
        if (b === '—' || a === b) return a;
        return `${a} – ${b}`;
    };

    /** `appointments.appointment_status`: added | failed | cancelled */
    const getAppointmentStatusClass = (status) => {
        switch (String(status || 'added').toLowerCase()) {
            case 'added': return 'status-appt-added';
            case 'failed': return 'status-failed';
            case 'cancelled': return 'status-cancelled';
            default: return 'status-default';
        }
    };

    const getPaymentStatusClass = (status) => {
        switch (String(status || '').toLowerCase()) {
            case 'paid': return 'status-paid';
            case 'pending': return 'status-pending';
            case 'refunded': return 'status-refunded';
            default: return 'status-default';
        }
    };


    return (
        <div className="appointment-history-overlay">
            <div className="appointment-history-modal">
                <div className="appointment-history-header">
                    <h2>Appointment History</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="appointment-history-content">
                    {refundMessage.text && (
                        <div className={`refund-toast ${refundMessage.type === 'ok' ? 'refund-toast-ok' : 'refund-toast-err'}`}>
                            {refundMessage.text}
                        </div>
                    )}
                    {loading ? (
                        <div className="history-loading">Loading appointments...</div>
                    ) : error ? (
                        <div className="history-error">{error}</div>
                    ) : appointments.length === 0 ? (
                        <div className="no-appointments">
                            <span className="material-symbols-outlined">event_busy</span>
                            <p>You have no appointment history.</p>
                        </div>
                    ) : (
                        <div className="appointments-list">
                            {appointments.map((apt) => (
                                <div className="appointment-card" key={apt.appointment_id}>
                                    <div className="appointment-card-header">
                                        <div className="doctor-info">
                                            <h3>{apt.doctor_name}</h3>
                                            <p className="specialization">{apt.doctor_specialization}</p>
                                        </div>
                                        <div className={`status-badge ${getAppointmentStatusClass(apt.appointment_status)}`}>
                                            {(apt.appointment_status || 'added').toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="appointment-datetime-banner" aria-label="Appointment date and time">
                                        <div className="datetime-block">
                                            <span className="material-symbols-outlined">calendar_today</span>
                                            <div>
                                                <span className="datetime-label">Appointment date</span>
                                                <span className="datetime-value">{formatScheduleDateLK(apt.schedule_date)}</span>
                                            </div>
                                        </div>
                                        <div className="datetime-block">
                                            <span className="material-symbols-outlined">schedule</span>
                                            <div>
                                                <span className="datetime-label">Time</span>
                                                <span className="datetime-value">{formatTimeRange(apt.start_time, apt.end_time)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="appointment-details">
                                        <div className="detail-item">
                                            <span className="material-symbols-outlined">local_hospital</span>
                                            <span>{apt.doctor_hospital || 'Narammala Channeling Center'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="material-symbols-outlined">payments</span>
                                            <span>LKR {parseFloat(apt.price).toFixed(2)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="material-symbols-outlined">paid</span>
                                            <span className="payment-status-wrap">
                                                Payment
                                                <span className={`payment-status-pill ${getPaymentStatusClass(apt.appointment_payment_status)}`}>
                                                    {apt.appointment_payment_status?.toUpperCase() || '—'}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="detail-item booking-date">
                                            <span className="material-symbols-outlined">history</span>
                                            <span>Booked on {formatDateTimeLK(apt.booking_date)}</span>
                                        </div>
                                        {apt.appointment_payment_status === 'paid' &&
                                            isPaidWithinRefundWindow(apt.payment_paid_at) &&
                                            !isRefundRequestPending(apt.refund_request_pending) && (
                                                <div className="refund-request-row">
                                                    <button
                                                        type="button"
                                                        className="btn-request-refund"
                                                        disabled={refundSubmitId === apt.appointment_id}
                                                        onClick={() => submitRefundRequest(apt.appointment_id)}
                                                    >
                                                        {refundSubmitId === apt.appointment_id ? 'Sending…' : 'Request refund'}
                                                    </button>
                                                    <span className="refund-request-hint">
                                                        Within 24 hours of payment; cashier will process your request.
                                                    </span>
                                                </div>
                                            )}
                                        {apt.appointment_payment_status === 'paid' &&
                                            isRefundRequestPending(apt.refund_request_pending) && (
                                                <div className="refund-pending-note">
                                                    <span className="material-symbols-outlined">hourglass_top</span>
                                                    Refund request pending — cashier will contact you if needed.
                                                </div>
                                            )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentHistory;
