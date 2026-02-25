import { useEffect, useState } from 'react';
import './css/paymentPortal.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ECareNavBar from '../Components/eCareNavBar';




const PaymentPortal = () => {
    const navigate = useNavigate();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get patientId from the 'user' object in localStorage
    const storedUser = localStorage.getItem('user');
    let user = null;
    let patientId = null;
    try {
        user = storedUser ? JSON.parse(storedUser) : null;
        patientId = user ? user.id : null;
    } catch (e) {
        console.error('Error parsing user from localStorage:', e);
    }
    const doctorId = 4;



    useEffect(() => {
        document.title = "Payment Portal";

        if (!patientId) {
            setLoading(false);
            setError('not_logged_in');
            return;
        }

        const fetchDetails = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payment/details?patientID=${patientId}&doctorID=${doctorId}`);
                setDetails(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching payment details', err);
                setError('fetch_failed');
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
            <div className="payment-page-wrapper">
                <ECareNavBar />
                <div className="payment-container">
                    {/* Skeleton left side */}
                    <div className="payment-left">
                        <div className="payment-left-content">
                            <div className="skeleton-bar skeleton-pulse" style={{ width: '180px', height: '40px', marginBottom: '40px', borderRadius: '8px' }}></div>
                            <div className="skeleton-bar skeleton-pulse" style={{ width: '90%', height: '45px', marginBottom: '15px', borderRadius: '8px' }}></div>
                            <div className="skeleton-bar skeleton-pulse" style={{ width: '70%', height: '45px', marginBottom: '25px', borderRadius: '8px' }}></div>
                            <div className="skeleton-bar skeleton-pulse" style={{ width: '100%', height: '20px', marginBottom: '10px', borderRadius: '6px' }}></div>
                            <div className="skeleton-bar skeleton-pulse" style={{ width: '85%', height: '20px', marginBottom: '40px', borderRadius: '6px' }}></div>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div className="skeleton-bar skeleton-pulse" style={{ width: '140px', height: '44px', borderRadius: '12px' }}></div>
                                <div className="skeleton-bar skeleton-pulse" style={{ width: '160px', height: '44px', borderRadius: '12px' }}></div>
                            </div>
                        </div>
                        <div className="bg-circles">
                            <div className="circle circle-1"></div>
                            <div className="circle circle-2"></div>
                        </div>
                    </div>

                    {/* Skeleton right side */}
                    <div className="payment-right">
                        <div className="summary-box">
                            <div className="skeleton-bar skeleton-pulse" style={{ width: '60%', height: '28px', margin: '0 auto 30px', borderRadius: '8px' }}></div>
                            <div className="skeleton-bar skeleton-pulse" style={{ width: '100%', height: '18px', marginBottom: '18px', borderRadius: '6px' }}></div>
                            <div className="skeleton-bar skeleton-pulse" style={{ width: '90%', height: '18px', marginBottom: '18px', borderRadius: '6px' }}></div>
                            <div className="skeleton-bar skeleton-pulse" style={{ width: '80%', height: '18px', marginBottom: '18px', borderRadius: '6px' }}></div>
                            <div className="skeleton-bar skeleton-pulse" style={{ width: '75%', height: '18px', marginBottom: '18px', borderRadius: '6px' }}></div>
                            <div className="skeleton-bar skeleton-pulse" style={{ width: '85%', height: '18px', marginBottom: '18px', borderRadius: '6px' }}></div>
                            <div className="skeleton-bar skeleton-pulse" style={{ width: '70%', height: '18px', marginBottom: '25px', borderRadius: '6px' }}></div>
                            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginBottom: '30px' }}>
                                <div className="skeleton-bar skeleton-pulse" style={{ width: '60%', height: '20px', marginBottom: '8px', borderRadius: '6px' }}></div>
                                <div className="skeleton-bar skeleton-pulse" style={{ width: '45%', height: '14px', borderRadius: '6px' }}></div>
                            </div>
                            <div className="skeleton-bar skeleton-pulse" style={{ width: '100%', height: '50px', borderRadius: '50px' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error === 'not_logged_in' || !user) {
        return (
            <>
                <ECareNavBar />
                <div className="payment-container">
                    <div className="payment-right">
                        <div className="summary-box">
                            <h2>Can't detect User!</h2>
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

    if (error === 'fetch_failed' || !details) {
        return (
            <>
                <ECareNavBar />
                <div className="payment-container">
                    <div className="payment-right">
                        <div className="summary-box">
                            <h2>Error Loading Payment Details</h2>
                            <p>We couldn't load your payment information. Please try again.</p>
                            <button className="login-btn" onClick={() => window.location.reload()}>
                                Retry
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

    const handlePayHereClick = async () => {
        const appointmentID = details.appointmentId || "1";
        const paymentID = 'ORD' + appointmentID + '_' + Date.now();
        const amount = paymentData.totalAmount;
        const currency = 'LKR';

        try {
            // get backend hash
            const hashResponse = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payment/generate-hash`,
                {
                    paymentID: paymentID,
                    amount: amount,
                    currency: currency,
                    patientID: patientId,
                    doctorID: doctorId
                }
            );
            const { hash, merchantID } = hashResponse.data;

            // payhere payment obj
            const payment = {
                "sandbox": true,
                "merchant_id": merchantID,
                "return_url": "http://localhost:3000/ecare/payment",
                "cancel_url": "http://localhost:3000/ecare/payment",
                "notify_url": "https://unboldly-nonpantheistic-dwight.ngrok-free.dev/api/payment/notify",
                "order_id": paymentID,
                "items": "Doctor Appointment",
                "amount": amount,
                "currency": currency,
                "hash": hash,
                "first_name": details.first_name,
                "last_name": details.second_name,
                "email": user.email,
                "phone": user.phone || "0771234567",
                "address": "Narammala",
                "city": "Narammala",
                "country": "Sri Lanka",
            };

            // PayHere Callbacks - Register BEFORE starting payment
            window.payhere.onCompleted = async function onCompleted(order_id) {
                console.log("--- PayHere onCompleted Triggered --- for OrderID:", order_id);

                let attempts = 0;
                const maxAttempts = 15; // Increased attempts

                const checkStatus = async () => {
                    attempts++;
                    console.log(`Polling status for ${order_id}... Attempt ${attempts}`);
                    try {
                        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payment/status/${order_id}`);
                        const status = response.data.status;
                        console.log(`Current Status from Backend: ${status}`);

                        if (status === 'SUCCESS') {
                            console.log("Payment SUCCESS detected. Navigating...");
                            navigate('/ecare/payment/success', {
                                state: { ...paymentData, paymentID: order_id }
                            });
                            return;
                        } else if (['FAILED', 'CANCELED', 'CHARGEDBACK'].includes(status)) {
                            console.log("Payment FAILURE detected. Navigating...");
                            navigate('/ecare/payment/failed');
                            return;
                        }
                    } catch (error) {
                        console.error("Status check error:", error);
                    }

                    if (attempts < maxAttempts) {
                        setTimeout(checkStatus, 2000);
                    } else {
                        console.log("Max attempts reached. No status update found.");
                        alert("Payment verification is taking longer than expected. Please check your appointments later.");
                    }
                };

                checkStatus();
            };

            window.payhere.onDismissed = function onDismissed() {
                console.log("--- PayHere onDismissed Triggered ---");
            };

            window.payhere.onError = function onError(error) {
                console.error("--- PayHere onError Triggered ---", error);
                alert("Payment Error: " + error);
            };

            //starting payment
            console.log("Starting PayHere payment...");
            window.payhere.startPayment(payment);
        }
        catch (error) {
            console.error("Error", error);
            alert("Error");
        }

    }



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