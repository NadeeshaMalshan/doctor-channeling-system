import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import './css/Login.css';
import './css/ResetPassword.css';

const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    useEffect(() => {
        if (!email) {
            navigate('/login', { replace: true });
        }
    }, [email, navigate]);

    if (!email) {
        return null;
    }

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setInfo('');
        const code = otp.trim();
        if (!/^\d{6}$/.test(code)) {
            setError('Enter the 6-digit code from your email');
            return;
        }
        setOtpLoading(true);
        try {
            const res = await fetch(`${apiBase}/api/auth/forgot-password/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: code })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Verification failed');
                return;
            }
            setResetToken(data.resetToken);
            setInfo('Code accepted. Choose a new password below.');
        } catch {
            setError('Connection error. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setInfo('');
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setResetLoading(true);
        try {
            const res = await fetch(`${apiBase}/api/auth/forgot-password/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken, newPassword, confirmPassword })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Could not update password');
                return;
            }
            navigate('/login', { replace: true, state: { resetSuccess: data.message } });
        } catch {
            setError('Connection error. Please try again.');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-left-overlay" />
                <div className="login-left-content">
                    <div className="brand-logo">
                        <img src="/favicon.png" alt="NC+ logo" />
                        <span>NCC eCare</span>
                    </div>
                    <h1>Reset password</h1>
                    <p>Enter the verification code we sent to your email, then set a new password.</p>
                </div>
            </div>

            <div className="login-right">
                <div className="login-form-container reset-password-panel">
                    <div className="login-form-header">
                        <h2>{resetToken ? 'New password' : 'Verify email'}</h2>
                        <p>
                            Account: <strong className="reset-email">{email}</strong>
                        </p>
                    </div>

                    {!resetToken ? (
                        <form onSubmit={handleVerifyOtp} className="login-form">
                            <div className="form-group">
                                <label htmlFor="otp">Verification code</label>
                                <div className="input-wrapper">
                                    <input
                                        id="otp"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        placeholder="6-digit code"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        maxLength={6}
                                        required
                                    />
                                </div>
                            </div>
                            {error && <div className="error-message reset-error">{error}</div>}
                            <button type="submit" className="login-btn" disabled={otpLoading}>
                                {otpLoading ? <span className="loader" /> : 'Verify code'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="login-form">
                            {info && <div className="reset-info">{info}</div>}
                            <div className="form-group">
                                <label htmlFor="newPassword">New password</label>
                                <div className="input-wrapper">
                                    <input
                                        id="newPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="At least 6 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm password</label>
                                <div className="input-wrapper">
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="Repeat password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                            {error && <div className="error-message reset-error">{error}</div>}
                            <button type="submit" className="login-btn" disabled={resetLoading}>
                                {resetLoading ? <span className="loader" /> : 'Update password'}
                            </button>
                        </form>
                    )}

                    <p className="signup-link">
                        <Link to="/login">Back to sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
