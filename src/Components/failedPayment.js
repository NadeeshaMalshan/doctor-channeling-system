import React from 'react';
import { useNavigate } from 'react-router-dom';
import ECareNavBar from './eCareNavBar';
import './ComponentsCss/paymentSummerry.css';

const FailedPayment = () => {
    const navigate = useNavigate();

    return (
        <div className="payment-page-wrapper">
            <ECareNavBar />
            <div className="status-container failed">
                <div className="status-card">
                    <div className="status-header">
                        <div className="status-icon-container">
                            <svg className="status-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" />
                                <path d="M8 8L16 16M16 8L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h1 className="status-title">Payment Failed</h1>
                        <p className="status-message">We couldn't process your payment. Please check your card details or try a different payment method.</p>
                    </div>

                    <div className="receipt-section error-info">
                        <h3>Possible Reasons</h3>
                        <ul>
                            <li>Insufficient funds in your account</li>
                            <li>Incorrect card details entered</li>
                            <li>Connection issue with the payment gateway</li>
                        </ul>
                    </div>

                    <div className="status-actions vertical">
                        <button className="primary-btn full-width" onClick={() => navigate('/ecare/payment')}>
                            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <polyline points="1 20 1 14 7 14"></polyline>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                            Try Again
                        </button>
                        <button className="secondary-btn full-width" onClick={() => navigate('/eCare')}>Go to Dashboard</button>
                    </div>

                    <div className="support-notice">
                        <p>Need help? Contact our <span onClick={() => navigate('/ecare/customer-support')}>Customer Support</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FailedPayment;
