import React from 'react';
import { Link } from 'react-router-dom';
import './ComponentsCss/NavBar.css';

const NavBar = () => {
    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                Doctor Channeling
            </Link>
            <ul className="navbar-links">
                <li>
                    <Link to="/" className="nav-link">Home</Link>
                </li>
                <li>
                    <Link to="/doctors" className="nav-link">Doctors</Link>
                </li>
                <li>
                    <Link to="/global appointments" className="nav-link">Appointments</Link>
                </li>
                <li>
                    <Link to="/login" className="nav-link">Login</Link>
                </li>
            </ul>
        </nav>
    );
};

export default NavBar;
