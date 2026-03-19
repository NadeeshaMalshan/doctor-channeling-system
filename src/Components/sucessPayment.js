import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ECareNavBar from './eCareNavBar';
import './ComponentsCss/paymentSummerry.css';
import { generateReceiptPDF } from '../utils/generateReceiptPDF';

const SuccessPayment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const data = location.state || {};
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await generateReceiptPDF(data);
        } catch (err) {
            console.error('PDF generation failed:', err);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="payment-page-wrapper">
            <ECareNavBar />
            <div className="status-container success">
                <div className="status-card">

                    <div className="status-header">
                        <div className="status-icon-container">
                            <span className="material-symbols-outlined">check_circle</span>
                        </div>
                        <h1 className="status-title">Payment Successful</h1>
                        <p className="status-message">Your appointment has been successfully confirmed.</p>
                    </div>

                    <div className="receipt-section">
                        <h3>Appointment Details</h3>
                        <div className="receipt-row">
                            <span className="label">Appointment ID</span>
                            <span className="value">#{data.appointmentId || 'N/A'}</span>
                        </div>
                        <div className="receipt-row">
                            <span className="label">Appointment No</span>
                            <span className="value highlight">{data.appointmentNo || 'N/A'}</span>
                        </div>
                        <div className="receipt-row">
                            <span className="label">Doctor</span>
                            <span className="value">{data.doctorName || 'N/A'}</span>
                        </div>
                        <div className="receipt-row">
                            <span className="label">Patient</span>
                            <span className="value">{data.patientName || 'N/A'}</span>
                        </div>
                        <div className="receipt-row">
                            <span className="label">Date & Time</span>
                            <span className="value">{data.dateTime || 'N/A'}</span>
                        </div>
                        <div className="receipt-divider"></div>
                        <div className="receipt-row">
                            <span className="label">Payment ID</span>
                            <span className="value small">{data.paymentID || 'N/A'}</span>
                        </div>
                        <div className="receipt-row">
                            <span className="label">Amount Paid</span>
                            <span className="value price">{data.totalAmount ? `LKR ${data.totalAmount}` : 'N/A'}</span>
                        </div>
                    </div>

                    <div className="status-actions vertical">
                        <button
                            className="primary-btn pdf-btn full-width"
                            onClick={handleDownload}
                            disabled={downloading}
                        >
                            <span className="btn-icon">download</span>
                            {downloading ? 'Generating PDF...' : 'Download Receipt'}
                        </button>
                        <button className="secondary-btn full-width" onClick={() => navigate('/eCare')}>
                            Go to Dashboard
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SuccessPayment;
