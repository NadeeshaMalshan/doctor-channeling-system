import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import './css/StaffLogin.css';

const StaffLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.password || !formData.role) {
            const message = 'Please fill in all fields';
            setError(message);
            alert(message);
            return;
        }

        if (!recaptchaToken) {
            setError('Please complete the reCAPTCHA');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/staff-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...formData, recaptchaToken }),
            });

            const data = await response.json();

            if (response.ok) {
                // CASE SENSITIVE USERNAME CHECK
                if (data.user.username !== formData.username) {
                    setError('Invalid username or password');
                    return;
                }

                // Success
                alert(`Login successful! Welcome ${data.user.username} (${data.user.role})`);
                // You might want to store the token/user data here
                localStorage.setItem('staffToken', data.token);
                localStorage.setItem('staffUser', JSON.stringify(data.user));

                // Redirect based on role
                switch (data.user.role) {
                    case 'Admin':
                        navigate('/ecare/staff/admin');
                        break;
                    case 'Cashier':
                        navigate('/ecare/staff/cashier');
                        break;
                    case 'HR':
                        navigate('/ecare/staff/hr');
                        break;
                    case 'Booking Manager':
                        navigate('/ecare/staff/booking');
                        break;
                    default:
                        navigate('/eCare'); // Fallback
                }
            } else {
                // Backend returned an error
                setError('Invalid username or password');
            }
        } catch (error) {
            console.error('Error during staff login:', error);
            setError('Connection error. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="staff-login-page">
            {/* Left Side - Background */}
            <div className="staff-login-left">
                <div className="staff-login-left-overlay"></div>
                <div className="staff-login-left-content">
                    <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <img src="/favicon.png" alt="NC+ logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>NCC eCare</span>
                    </div>
                    <h1>Staff Portal</h1>
                    <p>Secure access for hospital administration, booking management, cashier services, and HR operations.</p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="staff-login-right">
                <div className="staff-login-form-container">
                    <div className="staff-login-header">
                        <h2>Staff Login</h2>
                        <p>Please enter your credentials</p>
                    </div>

                    <form onSubmit={handleSubmit} className="staff-login-form">

                        {/* Role Selection */}
                        <div className="form-group" style={{ marginBottom: '5px' }}>
                            <label htmlFor="role" style={{ display: 'block', marginBottom: '8px', color: '#1E3A5F', fontWeight: '500' }}>Role</label>
                            <div className="input-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                </svg>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        border: '2px solid #E5E7EB',
                                        borderRadius: '8px',
                                        padding: '12px 16px 12px 50px',
                                        color: '#1E3A5F',
                                        fontSize: '15px',
                                        transition: 'all 0.3s ease',
                                        outline: 'none',
                                        width: '100%',
                                        appearance: 'none',
                                        backgroundColor: 'white',
                                        cursor: 'pointer'
                                    }}
                                    onFocus={(e) => e.target.style.border = '2px solid #4CA1AF'}
                                    onBlur={(e) => e.target.style.border = '2px solid #E5E7EB'}
                                >
                                    <option value="" disabled style={{ padding: '10px' }}>Select your role</option>
                                    <option value="Admin" style={{ padding: '10px' }}>Admin</option>
                                    <option value="Cashier" style={{ padding: '10px' }}>Cashier</option>
                                    <option value="HR" style={{ padding: '10px' }}>HR</option>
                                    <option value="Booking Manager" style={{ padding: '10px' }}>Booking Manager</option>
                                </select>
                                <svg className="select-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 10l5 5 5-5z" />
                                </svg>
                            </div>
                        </div>

                        {/* Username */}
                        <div className="form-group" style={{ marginBottom: '5px' }}>
                            <label htmlFor="username" style={{ display: 'block', marginBottom: '8px', color: '#1E3A5F', fontWeight: '500' }}>Username</label>
                            <div className="input-container" style={{ position: 'relative' }}>
                                <span className="icon" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', display: 'flex' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder="Enter your username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    style={{ width: '100%', padding: '12px 16px 12px 50px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', color: '#1E3A5F', transition: 'all 0.3s ease' }}
                                    onFocus={(e) => e.target.style.border = '2px solid #4CA1AF'}
                                    onBlur={(e) => e.target.style.border = '2px solid #E5E7EB'}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="form-group" style={{ marginBottom: '5px' }}>
                            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', color: '#1E3A5F', fontWeight: '500' }}>Password</label>
                            <div className="input-container" style={{ position: 'relative' }}>
                                <span className="icon" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', display: 'flex' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                    </svg>
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    style={{ width: '100%', padding: '12px 16px 12px 50px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', color: '#1E3A5F', transition: 'all 0.3s ease' }}
                                    onFocus={(e) => e.target.style.border = '2px solid #4CA1AF'}
                                    onBlur={(e) => e.target.style.border = '2px solid #E5E7EB'}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                                <input
                                    type="checkbox"
                                    id="show-password"
                                    checked={showPassword}
                                    onChange={toggleShowPassword}
                                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                />
                                <label htmlFor="show-password" style={{ fontSize: '14px', color: '#6B7280', cursor: 'pointer' }}>
                                    {showPassword ? "Hide Password" : "Show Password"}
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                            <ReCAPTCHA
                                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                                onChange={(token) => setRecaptchaToken(token)}
                                onExpired={() => setRecaptchaToken(null)}
                            />
                        </div>

                        {error && <span className="error-message">{error}</span>}

                        <button type="submit" className="login-btn" disabled={isLoading} style={{ marginTop: '15px' }}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StaffLogin;
