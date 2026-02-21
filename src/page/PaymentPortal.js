import React, { useEffect, useState } from 'react';
import './css/paymentPortal.css';
import axios from 'axios';
import ECareNavBar from '../Components/eCareNavBar';

const PaymentPortal = () => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    // Get patientId from the 'user' object in localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const patientId = user ? user.id : null;
    const doctorId = 1;

    useEffect(() => {
        document.title = "Payment Portal";

        const fetchDetails = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/payment/details?patientID=${patientId}&doctorID=${doctorId}`);
                setDetails(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching payment details', error);
                setLoading(false);
            }
        };

        fetchDetails();

        return () => {
            document.title = "Doctor Channeling System";
        };
    }, [patientId, doctorId]);

    if (loading) {
        return (
            <>
                <ECareNavBar />
                <div className="payment-container">
                    <div className="payment-right">
                        <div className="summary-box">
                            <h2>Loading...</h2>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!details) {
        return (
            <>
                <ECareNavBar />
                <div className="payment-container">
                    <div className="payment-right">
                        <div className="summary-box">
                            <h2>Can't detected User!</h2>
                            <p>Please ensure you are logged in.</p>
                            <button className="login-btn" onClick={() => window.location.href = "/login"}>
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const paymentData = {
        patientName: `${details.first_name} ${details.second_name}`,
        doctorName: details.doctor_name,
        specialization: details.specialization,
        appointmentNo: 12,
        dateTime: "2026-10-02 07:00 PM",
        appointmentId: "001",
        channelingFee: 3000.00,
        serviceCharge: 400.00,
        totalAmount: 3400.00
    };

    const handlePayHereClick = () => {
        // This will be implemented next
        console.log("Redirecting to PayHere with data:", paymentData);
    };

    return (
        <div className="payment-page-wrapper">
            <ECareNavBar />
            <div className="payment-container">
                {/* left side - Payment Portal Info */}
                <div className="payment-left">
                    <div className="payment-left-content">
                        <div className="brand-logo-large">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 10h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V9c0-.55.45-1 1-1s1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1z" />
                            </svg>
                            <span>NCC eCare</span>
                        </div>
                        <h1>Safe & Secure Payment</h1>
                        <p>Complete your booking by paying securely with PayHere. Your health and data security are our top priorities.</p>

                        <div className="trust-badges">
                            <div className="badge">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                                </svg>
                                <span>SSL Secured</span>
                            </div>
                            <div className="badge">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M11.8 2.1c-.5-.1-1 0-1.4.3L3.7 7.1c-.4.3-.7.7-.7 1.2v7.4c0 .5.3.9.7 1.2l6.7 4.7c.4.3.9.4 1.4.3.5-.1 1 0 1.4-.3l6.7-4.7c.4-.3.7-.7.7-1.2V8.3c0-.5-.3-.9-.7-1.2l-6.7-4.7c-.4-.3-.9-.4-1.4-.3zM12 4.1l6 4.2-2.3 1.6-6-4.2 2.3-1.6zm-7 5.3l6 4.2v7.1l-6-4.2V9.4zM13 20.7V13.6l6-4.2v7.1l-6 4.2z" />
                                </svg>
                                <span>Verified Provider</span>
                            </div>
                        </div>

                        
                    </div>
                    <div className="bg-circles">
                        <div className="circle circle-1"></div>
                        <div className="circle circle-2"></div>
                    </div>
                </div>

                {/* right - Summary Details */}
                <div className="payment-right">
                    <div className="summary-box">
                        <h2>Payment Summary</h2>
                        <div className="details">
                            <p><span>Patient name:</span> {paymentData.patientName}</p>
                            <p><span>Doctor name:</span> {paymentData.doctorName}</p>
                            <p><span>Specialization:</span> {paymentData.specialization}</p>
                            <p><span>Appointment no:</span> {paymentData.appointmentNo}</p>
                            <p><span>Date/Time:</span> {paymentData.dateTime}</p>
                            <p><span>Appointment ID:</span> {paymentData.appointmentId}</p>
                            <div className="fee-row">
                                <p><span>Fee:</span> {paymentData.totalAmount} LKR</p>
                                <small>({paymentData.serviceCharge} LKR for channeling center charges)</small>
                            </div>
                        </div>

                        <button className="payhere-btn" onClick={handlePayHereClick}>
                            Pay with <span>PayHere</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPortal;