import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './css/DoctorReject.css';

const DoctorReject = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const doctorId = location.state?.doctorId;
    const [isProcessing, setIsProcessing] = useState(false);

    const handleReRegister = async () => {
        if (!doctorId) {
            alert('Doctor ID not found. Please register a new account.');
            navigate('/ecare/doc-signup');
            return;
        }

        setIsProcessing(true);
        try {
            // Delete the rejected details from the database so they can reuse their NIC/SLMC
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/doctor/${doctorId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok || response.status === 404) {
                // If successful or already deleted, redirect to signup page!
                navigate('/ecare/doc-signup');
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to clear previous records. Please try again.');
            }
        } catch (error) {
            console.error('Error clearing old request:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="doctor-reject-page">
            <div className="reject-container">
                <div className="reject-icon-container">
                    <svg className="reject-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2>Registration Unsuccessful</h2>
                <div className="reject-message">
                    <p>We're sorry, but your registration request was rejected by the administration team.</p>
                    <p style={{ marginTop: '10px', color: '#dc3545', fontWeight: '500' }}>
                        Please be kind to re-register with your correct details.
                    </p>
                </div>

                <div className="reject-actions">
                    <button className="back-home-btn" onClick={() => navigate('/')}>
                        Return to Homepage
                    </button>
                    <button 
                        className="re-register-btn" 
                        onClick={handleReRegister}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Processing...' : 'Re-register'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorReject;
