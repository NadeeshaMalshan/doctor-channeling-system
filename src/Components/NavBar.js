import React from 'react';
import { Link } from 'react-router-dom';
import './ComponentsCss/NavBar.css';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
    const navigate = useNavigate();
    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <div className="brand-logo">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 10h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V9c0-.55.45-1 1-1s1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1z" />
                    </svg>
                </div>
                <div className="brand-text-container">
                    <span className="brand-text">Narammala</span>
                    <span className="brand-subtitle">Channeling Center</span>
                </div>
            </Link>
            <ul className="navbar-links">
                <li>
                    <Link to="/" className="nav-link">Home</Link>
                </li>
                <li>
                    <Link to="/doctors" className="nav-link">Doctors</Link>
                </li>
                <li>
                    <Link to="/services" className="nav-link">Services</Link>
                </li>
                <li>
                    <Link to="/contact" className="nav-link">Contact</Link>
                </li>
                <li>
                    <button className="nav-book-btn" onClick={() => navigate("/eCare")}>NCC eCare</button>
                </li>
            </ul>
        </nav>
    );
};

export default NavBar;
