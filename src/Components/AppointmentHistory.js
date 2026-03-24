import React, { useState, useEffect, useCallback } from 'react';
import './ComponentsCss/AppointmentHistory.css';

const AppointmentHistory = ({ patientId, onClose }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/appointments/patient/${patientId}`);
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

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        // MySQL returns times as "HH:MM:SS"
        const [hour, minute] = timeString.split(':');
        const d = new Date();
        d.setHours(parseInt(hour, 10));
        d.setMinutes(parseInt(minute, 10));
        return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'status-paid';
            case 'pending': return 'status-pending';
            case 'failed': return 'status-failed';
            case 'refunded': return 'status-refunded';
            case 'cancelled': return 'status-cancelled';
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
                                        <div className={`status-badge ${getStatusClass(apt.appointment_payment_status)}`}>
                                            {apt.appointment_payment_status?.toUpperCase() || 'UNKNOWN'}
                                        </div>
                                    </div>
                                    <div className="appointment-details">
                                        <div className="detail-item">
                                            <span className="material-symbols-outlined">calendar_today</span>
                                            <span>{formatDate(apt.schedule_date)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="material-symbols-outlined">schedule</span>
                                            <span>{formatTime(apt.start_time)} - {formatTime(apt.end_time)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="material-symbols-outlined">local_hospital</span>
                                            <span>{apt.doctor_hospital || 'Narammala Channeling Center'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="material-symbols-outlined">payments</span>
                                            <span>LKR {parseFloat(apt.price).toFixed(2)}</span>
                                        </div>
                                        <div className="detail-item booking-date">
                                            <span className="material-symbols-outlined">history</span>
                                            <span>Booked on {formatDate(apt.booking_date)}</span>
                                        </div>
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
