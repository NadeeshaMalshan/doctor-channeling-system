import { useEffect, useState } from 'react';
import './css/paymentPortal.css';
import axios from 'axios';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import ECareNavBar from '../Components/eCareNavBar';
import LogoHospital from '../images/LogoHospital.png';




const PAYMENT_CONTEXT_KEY = 'paymentContext';

const readStoredPaymentContext = () => {
    try {
        const raw = sessionStorage.getItem(PAYMENT_CONTEXT_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const PaymentPortal = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
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
    } catch {
        /* invalid stored user */
    }

    const scheduleFromUrl = searchParams.get('appointment_schedule_id');
    const appointmentFromUrl = searchParams.get('appointment_id');
    const storedCtx = readStoredPaymentContext();

    const appointmentScheduleId =
        scheduleFromUrl ||
        (location.state?.appointmentScheduleId != null ? String(location.state.appointmentScheduleId) : null) ||
        (storedCtx?.appointmentScheduleId != null ? String(storedCtx.appointmentScheduleId) : null);

    const idFromUrl = appointmentFromUrl && String(appointmentFromUrl).trim() !== ''
        ? String(appointmentFromUrl).trim()
        : null;
    const idFromState = location.state?.appointmentId != null && location.state.appointmentId !== ''
        ? String(location.state.appointmentId)
        : null;
    const idFromStorage = storedCtx?.appointmentId != null && storedCtx.appointmentId !== ''
        ? String(storedCtx.appointmentId)
        : null;
    const appointmentIdFromBooking = idFromUrl || idFromState || idFromStorage;



    useEffect(() => {
        document.title = "Payment Portal";

        if (!patientId) {
            setLoading(false);
            setError('not_logged_in');
            return;
        }

        if (!appointmentScheduleId) {
            setLoading(false);
            setError('no_appointment');
            return;
        }

        const fetchDetails = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payment/details?patientID=${patientId}&appointment_schedule_id=${appointmentScheduleId}`);
                setDetails(response.data);
                setLoading(false);
            } catch {
                setError('fetch_failed');
                setLoading(false);
            }
        };

        fetchDetails();

        return () => {
            document.title = "Doctor Channeling System";
        };
    }, [patientId, appointmentScheduleId, searchParams]);

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

    if (error === 'no_appointment') {
        return (
            <>
                <ECareNavBar />
                <div className="payment-container">
                    <div className="payment-right">
                        <div className="summary-box">
                            <h2>No Appointment Found</h2>
                            <p>Please book an appointment first before proceeding to payment.</p>
                            <button className="login-btn" onClick={() => navigate('/ecare/doctors')}>
                                Find a Doctor
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

    const formatScheduleDateTime = (scheduleDate, startTime) => {
        try {
            const raw = scheduleDate ? String(scheduleDate).split('T')[0] : '';
            const datePart = raw ? new Date(raw + 'T12:00:00') : null;
            const dateStr = datePart && !Number.isNaN(datePart.getTime())
                ? datePart.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                : String(scheduleDate || '');
            return startTime ? `${dateStr} · ${startTime}` : dateStr;
        } catch {
            return `${scheduleDate} ${startTime || ''}`;
        }
    };

    const apiApptId = details.appointment_id;
    const resolvedAppointmentId =
        (apiApptId != null && apiApptId !== '' ? apiApptId : null) ?? appointmentIdFromBooking;
    const queueNo = details.appointment_queue_no;
    const displayAppointmentNo =
        queueNo != null && queueNo !== '' ? queueNo : null;

    const channelingFeeNum = parseFloat(details.channelingFee);
    const channelingFee = Number.isFinite(channelingFeeNum) ? channelingFeeNum : 0;

    const paymentData = {
        patientName: `${details.first_name} ${details.second_name}`,
        doctorName: details.doctor_name,
        specialization: details.specialization,
        appointmentScheduleNo: appointmentScheduleId,
        appointmentNo: displayAppointmentNo,
        appointmentId: resolvedAppointmentId,
        dateTime: formatScheduleDateTime(details.schedule_date, details.start_time),
        channelingFee,
        serviceCharge: 400,
        totalAmount: channelingFee + 400,
    };

    const handlePayHereClick = async () => {
        const appointmentID = paymentData.appointmentId;
        if (appointmentID == null || appointmentID === '') {
            alert('Appointment number is missing. Please complete your booking again from the appointment page.');
            return;
        }
        const paymentID = 'ORD' + appointmentID + '_' + Date.now();
        const amount = paymentData.totalAmount;
        const currency = 'LKR';

        const isSandbox = true; // change to false for live/production

        if (typeof window.payhere === 'undefined' || !window.payhere.startPayment) {
            alert('PayHere script failed to load. Refresh the page or check your internet connection.');
            return;
        }

        try {
            const payQs = new URLSearchParams();
            if (appointmentScheduleId) payQs.set('appointment_schedule_id', String(appointmentScheduleId));
            if (paymentData.appointmentId != null && paymentData.appointmentId !== '') {
                payQs.set('appointment_id', String(paymentData.appointmentId));
            }
            const payReturnBase = `${window.location.origin}/ecare/payment`;
            const payReturnUrl = payQs.toString() ? `${payReturnBase}?${payQs.toString()}` : payReturnBase;

            // get backend hash
            const hashResponse = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payment/generate-hash`,
                {
                    paymentID: paymentID,
                    amount: amount,
                    currency: currency,
                    patientID: patientId,
                    appointmentScheduleId: appointmentScheduleId,
                    sandbox: isSandbox
                }
            );
            const { hash, merchantID } = hashResponse.data;

            // payhere payment obj
            const payment = {
                "sandbox": isSandbox,
                "merchant_id": merchantID,
                "return_url": payReturnUrl,
                "cancel_url": payReturnUrl,
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
                let attempts = 0;
                const maxAttempts = 15;

                const checkStatus = async () => {
                    attempts++;
                    try {
                        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payment/status/${order_id}`);
                        const status = response.data.status;

                        if (status === 'SUCCESS') {
                            navigate('/ecare/payment/success', {
                                state: { ...paymentData, paymentID: order_id }
                            });
                            return;
                        }
                        if (['FAILED', 'CANCELED', 'CHARGEDBACK'].includes(status)) {
                            navigate('/ecare/payment/failed');
                            return;
                        }
                    } catch {
                        /* retry poll */
                    }

                    if (attempts < maxAttempts) {
                        setTimeout(checkStatus, 2000);
                    } else {
                        alert('Payment verification is taking longer than expected. Please check your appointments later.');
                    }
                };

                checkStatus();
            };

            window.payhere.onDismissed = function onDismissed() {
                /* user closed PayHere */
            };

            window.payhere.onError = function onError() {
                alert('Payment could not complete. Please try again.');
            };

            window.payhere.startPayment(payment);
        }
        catch (error) {
            const apiMsg = error?.response?.data?.message;
            const msg =
                (typeof apiMsg === 'string' && apiMsg.trim()) ||
                'Unable to start payment. Please try again.';
            alert(msg);
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
                            <img src={LogoHospital} alt="NCC Logo" />
                            <span>NCC eCare</span>
                        </div>
                        <h1>Safe & Secure Payment</h1>
                        <p>Complete your booking by paying securely with PayHere. Your health and data security are our top priorities.</p>

                        <div className="trust-badges">
                            <div className="badge">
                                <span className="material-symbols-outlined">lock</span>
                                <span>SSL Secured</span>
                            </div>
                            <div className="badge">
                                <span className="material-symbols-outlined">verified</span>
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
                            <p><span>Appointment schedule no:</span> {paymentData.appointmentScheduleNo ?? '—'}</p>
                            <p><span>Date/Time:</span> {paymentData.dateTime}</p>
                            <p><span>Appointment no:</span> {paymentData.appointmentNo != null && paymentData.appointmentNo !== '' ? paymentData.appointmentNo : '—'}</p>
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