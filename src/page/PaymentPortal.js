import React, { useEffect, useState } from 'react';
import './css/paymentPortal.css';
import axios from 'axios';

const PaymentPortal = () => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    // Get patientId from localStorage or use a default for testing
    const patientId = localStorage.getItem('patientId') || 1;
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
            <div className="payment-container">
                <div className="payment-left">
                    <h1>Payment Portal</h1>
                </div>
                <div className="payment-right">
                    <div className="summary-box">
                        <h2>Loading...</h2>
                    </div>
                </div>
            </div>
        );
    }

    if (!details) {
        return (
            <div className="payment-container">
                <div className="payment-left">
                    <h1>Payment Portal</h1>
                </div>
                <div className="payment-right">
                    <div className="summary-box">
                        <h2>No payment details found</h2>
                        <p>Please ensure you are logged in and have selected a doctor.</p>
                    </div>
                </div>
            </div>
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
        <div className="payment-container">
            {/* left side - Payment Portal Info */}
            <div className="payment-left">
                <div className="overlay">
                    <h1>Payment Portal</h1>
                    <p>You can make a payment securely and easily with PayHere.</p>
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
    );
};

export default PaymentPortal;