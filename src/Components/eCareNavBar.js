import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ComponentsCss/eCareNavBar.css';

const ECareNavBar = () => {
    const navigate = useNavigate();

    // Read logged-in user from localStorage
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const patientName = user ? (user.firstName || user.name || user.fullName || user.email) : null;

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleProfileClick = () => {
        setIsDropdownOpen(false);
        if (window.showPatientProfile) {
            window.showPatientProfile();
        }
    };

    const handleHistoryClick = () => {
        setIsDropdownOpen(false);
        // navigate('/ecare/appointments'); // Target page for history
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


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
                    <div className="ecare-user-menu" ref={dropdownRef}>
                        <div className={`ecare-welcome ${isDropdownOpen ? 'active' : ''}`} onClick={toggleDropdown}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                            </svg>
                            <span>Welcome, <strong>{patientName}</strong></span>
                            <svg className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 10l5 5 5-5z" />
                            </svg>
                        </div>

                        {isDropdownOpen && (
                            <div className="ecare-dropdown-menu">
                                <button className="dropdown-item" onClick={handleProfileClick}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                    </svg>
                                    View Profile
                                </button>
                                <button className="dropdown-item" onClick={handleHistoryClick}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.53.85-1.07-3.63-2.16V8h-1.5z" />
                                    </svg>
                                    Appointment History
                                </button>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item logout" onClick={handleLogout}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
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
