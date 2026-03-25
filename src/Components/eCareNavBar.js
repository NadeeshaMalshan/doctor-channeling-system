import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ComponentsCss/eCareNavBar.css';
import LogoHospital from '../images/LogoHospital.png';

const ECareNavBar = () => {
    const navigate = useNavigate();

    const isStaffRoute = window.location.pathname.toLowerCase().includes('staff') || window.location.pathname.toLowerCase().includes('hr');
    const authStaffUser = localStorage.getItem('staffUser');
    const authPatientUser = localStorage.getItem('user');
    
    // Priority depends on the route
    const storedUser = isStaffRoute 
        ? (authStaffUser || authPatientUser) 
        : (authPatientUser || authStaffUser);

    const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);

    const getPatientName = (u) => {
        return u
            ? (u.first_name
                ? `${u.first_name} ${u.second_name || ''}`.trim()
                : u.name || u.fullName || u.username || u.email)
            : null;
    };

    const [patientName, setPatientName] = useState(getPatientName(user));

    useEffect(() => {
        const handleProfileUpdate = () => {
            const newAuthPatientUser = localStorage.getItem('user');
            const newStoredUser = isStaffRoute 
                ? (authStaffUser || newAuthPatientUser) 
                : (newAuthPatientUser || authStaffUser);
            
            const newUser = newStoredUser ? JSON.parse(newStoredUser) : null;
            setUser(newUser);
            setPatientName(getPatientName(newUser));
        };

        window.addEventListener('profileUpdated', handleProfileUpdate);
        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, [isStaffRoute, authStaffUser]);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleProfileClick = () => {
        setIsDropdownOpen(false);
        window.dispatchEvent(new CustomEvent('openPatientProfile'));
    };

    const handleHistoryClick = () => {
        setIsDropdownOpen(false);
        window.dispatchEvent(new CustomEvent('openAppointmentHistory'));
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
