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
                    <img src="/favicon.png" alt="NCC Logo" />
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
