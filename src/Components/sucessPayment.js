import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ECareNavBar from './eCareNavBar';
import './ComponentsCss/paymentSummerry.css';

const SuccessPayment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const data = location.state || {};

    return (
        <div className="payment-page-wrapper">
            <ECareNavBar />
            <div className="status-container success">
                <div className="status-card">
                    <div className="status-header">
                        <div className="status-icon-container">
                            <svg className="status-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" />
                                <path d="M7 12L10 15L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h1 className="status-title">Payment Successful!</h1>
                        <p className="status-message">Your appointment has been successfully confirmed.</p>
                    </div>

                    <div className="receipt-section">
                        <h3>Appointment Details</h3>
                        <div className="receipt-row">
                            <span className="label">Appointment ID:</span>
                            <span className="value">#{data.appointmentId || 'N/A'}</span>
                        </div>
                        <div className="receipt-row">
                            <span className="label">Appointment No:</span>
                            <span className="value highlight">{data.appointmentNo || 'N/A'}</span>
                        </div>
                        <div className="receipt-row">
                            <span className="label">Doctor:</span>
                            <span className="value">{data.doctorName || 'N/A'}</span>
                        </div>
                        <div className="receipt-row">
                            <span className="label">Patient:</span>
                            <span className="value">{data.patientName || 'N/A'}</span>
                        </div>
                        <div className="receipt-row">
                            <span className="label">Date & Time:</span>
                            <span className="value">{data.dateTime || 'N/A'}</span>
                        </div>
                        <div className="receipt-divider"></div>
                        <div className="receipt-row">
                            <span className="label">Payment ID:</span>
                            <span className="value small">{data.paymentID || 'N/A'}</span>
                        </div>
                        <div className="receipt-row">
                            <span className="label">Amount Paid:</span>
                            <span className="value price">{data.totalAmount ? `${data.totalAmount} LKR` : 'N/A'}</span>
                        </div>
                    </div>

                    <div className="status-actions vertical">
                        <button className="primary-btn pdf-btn" onClick={() => window.print()}>
                            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Download Receipt (PDF)
                        </button>
                        <button className="secondary-btn full-width" onClick={() => navigate('/eCare')}>Go to Dashboard</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessPayment;
