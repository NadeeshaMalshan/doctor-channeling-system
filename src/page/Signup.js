import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './css/Signup.css';
import ReCAPTCHA from "react-google-recaptcha";

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        secondName: '',
        email: '',
        phone: '',
        nic: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Mobile Number Validation (Sri Lanka: Begins with 0, 10 digits)
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid Sri Lankan phone number (e.g., 0712345678)';
        }

        // NIC Validation (Old: 9 digits + V/X, New: 12 digits)
        const nicRegex = /^([0-9]{9}[x|X|v|V]|[0-9]{12})$/;
        if (!nicRegex.test(formData.nic)) {
            newErrors.nic = 'Please enter a valid NIC (e.g., 901234567V or 200012345678)';
        }

        // Password Match
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Password Strength (Optional, but good practice)
        if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleGoogleLogin = () => {
        setIsLoading(true);
        // Simulate Google OAuth - replace with actual Google authentication
        setTimeout(() => {
            setIsLoading(false);
            navigate('/eCare');
        }, 1500);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!recaptchaToken) {
            setErrors(prev => ({ ...prev, submit: 'Please complete the reCAPTCHA' }));
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    secondName: formData.secondName,
                    email: formData.email,
                    phone: formData.phone,
                    nic: formData.nic,

                    password: formData.password,
                    recaptchaToken
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Success
                alert('Account created successfully!');
                navigate('/login');
            } else {
                // Backend returned an error
                setErrors(prev => ({
                    ...prev,
                    submit: data.message || 'Registration failed'
                }));
            }
        } catch (error) {
            console.error('Error during signup:', error);
            setErrors(prev => ({
                ...prev,
                submit: 'Connection error. Please try again later.'
            }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signup-page">
            {/* Left Side - Background */}
            <div className="signup-left">
                <div className="signup-left-overlay"></div>
                <div className="signup-left-content">
                    <div className="brand-logo">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '48px', height: '48px', color: '#5DADE2' }}>
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 10h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V9c0-.55.45-1 1-1s1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1z" />
                        </svg>
                        <span>NC+ Hospital</span>
                    </div>
                    <h1>Join us today</h1>
                    <p>Create an account to manage your appointments, view medical records, and experience seamless healthcare services.</p>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="signup-right">
                <div className="signup-form-container">
                    <div className="signup-form-header">
                        <h2>Create Account</h2>
                        <p>Fill in your details to register</p>
                    </div>

                    <form onSubmit={handleSubmit} className="signup-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        placeholder="First Name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="secondName">Second Name</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        id="secondName"
                                        name="secondName"
                                        placeholder="Second Name"
                                        value={formData.secondName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                </svg>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <div className="input-wrapper">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                                    </svg>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        placeholder="071XXXXXXX"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                {errors.phone && <span className="error-message">{errors.phone}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="nic">NIC Number</label>
                                <div className="input-wrapper">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M2 12h2v4.75c3 .31 5.42 2.74 5.75 5.75L21.5 8H22c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1H2c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1zm2.5-5h15v2h-15V7zM2 19.5c0 .28.22.5.5.5H5c-.28 0-.5-.22-.5-.5V15h-2v4.5z" /> {/* Icon placeholder for ID card */}
                                    </svg>
                                    <input
                                        type="text"
                                        id="nic"
                                        name="nic"
                                        placeholder="National ID Card"
                                        value={formData.nic}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                {errors.nic && <span className="error-message">{errors.nic}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                </svg>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="input-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                </svg>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                        </div>

                        <div className="form-group" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                            <ReCAPTCHA
                                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                                onChange={(token) => setRecaptchaToken(token)}
                            />
                        </div>

                        <button type="submit" className="signup-btn" disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                        {errors.submit && <div className="error-message" style={{ justifyContent: 'center', marginTop: '10px' }}>{errors.submit}</div>}
                    </form>

                    <div className="divider">
                        <span>or continue with</span>
                    </div>

                    <button className="google-login-btn" onClick={handleGoogleLogin} disabled={isLoading}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="login-link">
                        <p>Already have an account? <Link to="/login">Sign In</Link></p>
                    </div>

                    <div className="doctor-signup-link" style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.9rem' }}>
                        <p>Are you want to join with Narammala Hospital as a doctor? <Link to="/ecare/doc-signup" style={{ color: '#5DADE2', fontWeight: 'bold' }}>Join now</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
