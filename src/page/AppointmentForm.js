import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ECareNavBar from '../Components/eCareNavBar';
import './css/AppointmentForm.css';

const AppointmentForm = () => {
    const { schedule_id, doctor_id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Fallback if accessed directly
    const [scheduleDetails, setScheduleDetails] = useState(location.state?.schedule || null);
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

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

        if (!scheduleDetails) {
            fetchScheduleDetails();
        }
    }, []);

    const fetchScheduleDetails = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/schedules/${schedule_id}`);
            const data = await res.json();
            if (data.success) {
                setScheduleDetails(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch schedule details');
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:5000/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    schedule_id,
                    doctor_id,
                    patient_ID: patient.id
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/schedules'); // Go back to schedules or patient dashboard
                }, 3000);
            } else {
                setError(data.message || 'Failed to book appointment');
            }
        } catch (err) {
            setError('Network error occurred while booking');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="appointment-form-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'white', padding: '50px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '60px', color: '#10b981', marginBottom: '20px' }}>✓</div>
                    <h2 style={{ color: '#1E3A5F', marginBottom: '10px' }}>Appointment Confirmed!</h2>
                    <p style={{ color: '#6b7280' }}>Your booking was successful. Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="appointment-form-page">
            <ECareNavBar />

            <div className="appointment-container">
                <div className="appointment-header">
                    <h2>Confirm Appointment</h2>
                    <p>Review your booking details before confirmation</p>
                </div>

                <div className="appointment-content">
                    {error && (
                        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <div className="summary-section">
                        <h3>Schedule Information</h3>
                        {scheduleDetails ? (
                            <div className="summary-grid">
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
                            </div>
                        ) : (
                            <p>Loading schedule details...</p>
                        )}
                    </div>

                    <div className="summary-section">
                        <h3>Patient Information</h3>
                        {patient ? (
                            <div className="summary-grid">
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
                            <p>Loading patient details...</p>
                        )}
                    </div>

                    <div className="form-actions">
                        <button className="btn-cancel" onClick={() => navigate('/schedules')}>
                            Cancel
                        </button>
                        <button
                            className="btn-confirm"
                            onClick={handleConfirm}
                            disabled={loading || !scheduleDetails || !patient}
                        >
                            {loading ? 'Processing...' : 'Confirm & proceed to payment'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentForm;
