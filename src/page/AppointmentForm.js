import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ECareNavBar from '../Components/eCareNavBar';
import './css/AppointmentForm.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function formatQueueNo(n) {
    if (n == null || !Number.isFinite(Number(n)) || Number(n) < 1) return '—';
    return String(Number(n)).padStart(2, '0');
}

const AppointmentForm = () => {
    const { schedule_id, doctor_id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Fallback if accessed directly
    const [scheduleDetails, setScheduleDetails] = useState(location.state?.schedule || null);
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }

        try {
            const userData = JSON.parse(userStr);
            setPatient(userData);
        } catch (err) {
            console.error('Error parsing user data:', err);
            navigate('/login');
        }

        if (!location.state?.schedule) {
            const fetchScheduleDetails = async () => {
                try {
                    const res = await fetch(`${API_BASE}/api/schedules/${schedule_id}`);
                    const data = await res.json();
                    if (data.success) {
                        setScheduleDetails(data.data);
                    }
                } catch (error) {
                    console.error('Failed to fetch schedule details');
                }
            };
            fetchScheduleDetails();
        }
    }, [navigate, schedule_id, location.state?.schedule]);

    const handleConfirm = async () => {
        setLoading(true);
        setError('');

        try {
            // Fetch current schedule details to get up-to-date booked_count
            const res = await fetch(`${API_BASE}/api/schedules/${schedule_id}`);
            const data = await res.json();

            if (res.ok && data.success) {
                const currentSchedule = data.data;
                const booked = Number(currentSchedule.booked_count) || 0;
                const max = Number(currentSchedule.max_patients) || 0;

                if (currentSchedule.status === 'full' || (max > 0 && booked >= max)) {
                    setError('This schedule is full. Please choose another slot.');
                    return;
                }

                const booking_queue_no = booked + 1;

                const pending_appointment = {
                    schedule_id,
                    doctor_id,
                    patient_ID: patient.id,
                    booking_queue_no,
                    appointment_No: booking_queue_no,
                    patientName: `${patient.first_name} ${patient.second_name}`,
                    doctorName: currentSchedule.doctor_name,
                    specialization: currentSchedule.specialization,
                    schedule_date: currentSchedule.schedule_date,
                    start_time: currentSchedule.start_time,
                    channelingFee: Number(currentSchedule.price),
                    max_patients: max,
                    booked_count_at_checkout: booked
                };

                sessionStorage.setItem('pending_appointment', JSON.stringify(pending_appointment));
                try {
                    sessionStorage.setItem(
                        'paymentContext',
                        JSON.stringify({
                            appointmentScheduleId: String(schedule_id),
                            appointmentId: null
                        })
                    );
                } catch {
                    /* ignore */
                }

                const qs = new URLSearchParams();
                qs.set('appointment_schedule_id', String(schedule_id));

                navigate(`/ecare/payment?${qs.toString()}`, {
                    replace: true,
                    state: {
                        appointmentScheduleId: String(schedule_id)
                    }
                });
            } else {
                setError(data?.message || 'Failed to fetch schedule details');
            }
        } catch (err) {
            setError('Network error occurred before payment');
        } finally {
            setLoading(false);
        }
    };

    const scheduleIsFull =
        scheduleDetails &&
        (scheduleDetails.status === 'full' ||
            ((Number(scheduleDetails.max_patients) || 0) > 0 &&
                (Number(scheduleDetails.booked_count) || 0) >= Number(scheduleDetails.max_patients)));

    return (
        <div className="appointment-form-page">
            <ECareNavBar />

            <div className="appointment-container">
                <div className="appointment-left">
                    <div className="appointment-left-content">
                        <h2>Appointment Details</h2>
                        <p>Review your booking details before confirmation</p>

                        <div className="appointment-left-section">
                            <h3>Patient Information</h3>
                            {patient ? (
                                <div className="summary-grid left-summary-grid">
                                    <div className="summary-item">
                                        <span className="label">Full Name</span>
                                        <span className="value">{patient.first_name + " " + patient.second_name}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">NIC Number</span>
                                        <span className="value">{patient.nic}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Email Address</span>
                                        <span className="value">{patient.email}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Phone Number</span>
                                        <span className="value">{patient.phone}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="left-loading">Loading patient details...</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="appointment-right">
                    <div className="appointment-right-content">
                        {scheduleIsFull && (
                            <div
                                style={{
                                    background: '#fef3c7',
                                    color: '#92400e',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    marginBottom: '20px',
                                    textAlign: 'center',
                                    fontWeight: 600
                                }}
                            >
                                This schedule is full (all slots booked). Please pick another time.
                            </div>
                        )}

                        {error && (
                            <div style={{
                                background: '#fee2e2',
                                color: '#b91c1c',
                                padding: '15px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                textAlign: 'center',
                                fontWeight: 600
                            }}>
                                {error}
                            </div>
                        )}

                        <div className="summary-section">
                            <h3>Schedule Information</h3>
                            {scheduleDetails ? (
                                <div className="summary-grid">
                                    <div className="summary-item">
                                        <span className="label">Appointment schedule No</span>
                                        <span className="value">{String(schedule_id)}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Booking queue no</span>
                                        <span className="value">
                                            {formatQueueNo(
                                                (Number(scheduleDetails.booked_count) || 0) + 1
                                            )}
                                        </span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Slots</span>
                                        <span className="value">
                                            {Number(scheduleDetails.booked_count) || 0} /{' '}
                                            {Number(scheduleDetails.max_patients) || '—'} booked
                                        </span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Doctor</span>
                                        <span className="value">Dr. {scheduleDetails.doctor_name}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Specialization</span>
                                        <span className="value">{scheduleDetails.specialization}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Date</span>
                                        <span className="value">{new Date(scheduleDetails.schedule_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Time</span>
                                        <span className="value">{scheduleDetails.start_time} - {scheduleDetails.end_time}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Price</span>
                                        <span className="value">Rs. {Number(scheduleDetails.price).toFixed(2)}</span>
                                    </div>
                                </div>
                            ) : (
                                <p>Loading schedule details...</p>
                            )}
                        </div>

                        <div className="form-actions">
                            <button className="btn-cancel" onClick={() => navigate('/schedules')}>
                                Cancel
                            </button>
                            <button
                                className="btn-confirm"
                                onClick={handleConfirm}
                                disabled={loading || !scheduleDetails || !patient || scheduleIsFull}
                            >
                                {loading ? 'Processing...' : 'Proceed to Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentForm;
