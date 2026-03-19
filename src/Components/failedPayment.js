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
                            <span className="material-symbols-outlined">cancel</span>
                        </div>
                        <h1 className="status-title">Payment Failed</h1>
                        <p className="status-message">
                            We couldn't process your payment. Please check your card details or try a different payment method.
                        </p>
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
                            <span className="btn-icon">refresh</span>
                            Try Again
                        </button>
                        <button className="secondary-btn full-width" onClick={() => navigate('/eCare')}>
                            Go to Dashboard
                        </button>
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
