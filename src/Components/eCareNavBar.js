import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ComponentsCss/eCareNavBar.css';
import LogoHospital from '../images/LogoHospital.png';

const ECareNavBar = () => {
    const navigate = useNavigate();

    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const patientName = user
        ? (user.first_name
            ? `${user.first_name} ${user.second_name || ''}`.trim()
            : user.name || user.fullName || user.email)
        : null;

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
    };

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="ecare-navbar">
            <div className="ecare-navbar-brand">
                <div className="ecare-logo-icon">
                    <img src={LogoHospital} alt="NCC Logo" />
                </div>
                <div className="ecare-brand-text">
                    <span className="brand-name">NCC eCare</span>
                    <span className="brand-tagline">Online Doctor Booking</span>
                </div>
            </div>

            <div className="ecare-navbar-actions">
                <button className="ecare-btn btn-channeling-center" onClick={() => navigate('/')}>
                    <span className="material-symbols-outlined">home</span>
                    Channeling Center
                </button>

                {user ? (
                    <div className="ecare-user-menu" ref={dropdownRef}>
                        <div className={`ecare-welcome ${isDropdownOpen ? 'active' : ''}`} onClick={toggleDropdown}>
                            <span className="material-symbols-outlined">person</span>
                            <span>Welcome, <strong>{patientName}</strong></span>
                            <span className={`material-symbols-outlined dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
                                expand_more
                            </span>
                        </div>

                        {isDropdownOpen && (
                            <div className="ecare-dropdown-menu">
                                <button className="dropdown-item" onClick={handleProfileClick}>
                                    <span className="material-symbols-outlined">manage_accounts</span>
                                    View Profile
                                </button>
                                <button className="dropdown-item" onClick={handleHistoryClick}>
                                    <span className="material-symbols-outlined">history</span>
                                    Appointment History
                                </button>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item logout" onClick={handleLogout}>
                                    <span className="material-symbols-outlined">logout</span>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <button className="ecare-btn btn-login" onClick={() => navigate('/login')}>
                            <span className="material-symbols-outlined">login</span>
                            Login
                        </button>
                        <button className="ecare-btn btn-signup" onClick={() => navigate('/signup')}>
                            <span className="material-symbols-outlined">person_add</span>
                            Sign Up
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default ECareNavBar;
