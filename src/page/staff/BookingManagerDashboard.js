import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/StaffDashboard.css';

const BookingManagerDashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/ecare/staff-login');
    };

    return (
        <div className="staff-dashboard">
            <header className="dashboard-header">
                <h1>
                    <span>📅</span> Booking Manager Portal
                </h1>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </header>

            <main className="dashboard-content">
                <div className="dashboard-welcome-card" style={{ background: 'linear-gradient(135deg, #009688 0%, #4CAF50 100%)' }}>
                    <h2>Welcome, Booking Manager</h2>
                    <p>Oversee doctor schedules, patient appointments, and clinic availability.</p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3>Manage Appointments</h3>
                        <p>View and edit bookings</p>
                    </div>
                    <div className="dashboard-card">
                        <h3>Doctor Schedules</h3>
                        <p>Update doctor availability</p>
                    </div>
                    <div className="dashboard-card">
                        <h3>Patient Records</h3>
                        <p>Access patient booking history</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BookingManagerDashboard;
