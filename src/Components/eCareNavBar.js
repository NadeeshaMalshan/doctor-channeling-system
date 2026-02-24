import { useNavigate } from 'react-router-dom';
import './ComponentsCss/eCareNavBar.css';

const ECareNavBar = () => {
    const navigate = useNavigate();

    // Read logged-in user from localStorage
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const patientName = user ? (user.firstName || user.name || user.fullName || user.email) : null;

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleProfileClick = () => {
        if (window.showPatientProfile) {
            window.showPatientProfile();
        }
    };


    return (
        <nav className="ecare-navbar">
            <div className="ecare-navbar-brand">
                <div className="ecare-logo-icon">
                    <img src="/favicon.png" alt="NCC Logo" />
                </div>
                <div className="ecare-brand-text">
                    <span className="brand-name">NCC eCare</span>
                    <span className="brand-tagline">Online Doctor Booking</span>
                </div>
            </div>

            <div className="ecare-navbar-actions">
                <button className="ecare-btn btn-channeling-center" onClick={() => navigate('/')}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                    Channeling Center
                </button>

                {user ? (
                    <>
                        <div className="ecare-welcome">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                            </svg>
                            <span>Welcome, <strong>{patientName}</strong></span>
                        </div>
                        <button className="ecare-btn btn-profile" onClick={handleProfileClick}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                            </svg>
                            Profile
                        </button>
                        <button className="ecare-btn btn-logout" onClick={handleLogout}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                            </svg>
                            Logout
                        </button>

                    </>
                ) : (
                    <>
                        <button className="ecare-btn btn-login" onClick={() => navigate('/login')}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z" />
                            </svg>
                            Login
                        </button>
                        <button className="ecare-btn btn-signup" onClick={() => navigate('/signup')}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                            Sign Up
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default ECareNavBar;
