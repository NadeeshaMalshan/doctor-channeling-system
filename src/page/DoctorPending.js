import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './css/DoctorPending.css';

const DoctorPending = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const doctorId = location.state?.doctorId;
    const [isCanceling, setIsCanceling] = useState(false);

    const handleCancelRequest = async () => {
        if (!doctorId) return;
        
        if (window.confirm('Are you sure you want to cancel your doctor registration request? You can register again later.')) {
            setIsCanceling(true);
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/doctor/${doctorId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    alert('Your registration request has been canceled and your account details have been removed.');
                    navigate('/');
                } else {
                    const data = await response.json();
                    alert(data.message || 'Failed to cancel the request.');
                }
            } catch (error) {
                console.error('Error canceling request:', error);
                alert('An error occurred. Please try again.');
            } finally {
                setIsCanceling(false);
            }
        }
    };

    return (
        <div className="doctor-pending-page">
            <div className="pending-container">
                <div className="pending-icon-container">
                    <svg className="pending-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>
                </div>
                <h2>Application Pending Approval</h2>
                <div className="pending-message">
                    <p>Thank you for registering with NC+ Hospital Narammala.</p>
                    <p>Your doctor account is currently under review by our administration team. You will be notified once your account is approved and ready to use.</p>
                </div>

                <div className="pending-steps">
                    <div className="step completed">
                        <div className="step-circle">1</div>
                        <div className="step-text">Registration Submitted</div>
                    </div>
                    <div className="step active">
                        <div className="step-circle">2</div>
                        <div className="step-text">Admin Review</div>
                    </div>
                    <div className="step">
                        <div className="step-circle">3</div>
                        <div className="step-text">Account Activation</div>
                    </div>
                </div>

                <div className="pending-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button className="back-home-btn" onClick={() => navigate('/')}>
                            Return to Homepage
                        </button>
                        <button className="contact-support-btn" onClick={() => navigate('/login')}>
                            Back to Login
                        </button>
                    </div>
                    {doctorId && (
                        <button 
                            className="cancel-request-btn" 
                            style={{ 
                                backgroundColor: '#dc3545', 
                                color: 'white', 
                                padding: '12px 24px', 
                                borderRadius: '8px', 
                                border: 'none', 
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                            onClick={handleCancelRequest}
                            disabled={isCanceling}
                        >
                            {isCanceling ? 'Canceling...' : 'Cancel Request'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorPending;