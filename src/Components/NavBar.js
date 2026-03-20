import React from 'react';
import { Link } from 'react-router-dom';
import './ComponentsCss/NavBar.css';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
    const navigate = useNavigate();
    return (
        <nav className="ecare-navbar">
            <Link to="/" className="ecare-navbar-brand">
                <div className="ecare-logo-icon">
                    <img src="/favicon.png" alt="NCC Logo" />
                </div>
                <div className="ecare-brand-text">
                    <span className="brand-name">Narammala</span>
                    <span className="brand-tagline">Channeling Center</span>
                </div>
            </Link>

            <div className="ecare-navbar-actions">
                <Link to="/#about" className="ecare-btn btn-login">
                    About
                </Link>
                <Link to="/#services" className="ecare-btn btn-login">
                    Services
                </Link>
                <Link to="/#contact" className="ecare-btn btn-login">
                    Contact
                </Link>
                <Link to="/ecare/doctors" className="ecare-btn btn-login">
                    Doctors
                </Link>
                <button
                    className="ecare-btn btn-channeling-center"
                    onClick={() => navigate("/eCare")}
                >
                    NCC eCare
                </button>
            </div>
        </nav>
    );
};

export default NavBar;
