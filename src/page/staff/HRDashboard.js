import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/StaffDashboard.css';

const HRDashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/ecare/staff-login');
    };

    return (
        <div className="staff-dashboard">
            <header className="dashboard-header">
                <h1>
                    <span>👥</span> HR Portal
                </h1>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </header>

            <main className="dashboard-content">
                <div className="dashboard-welcome-card" style={{ background: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)' }}>
                    <h2>Welcome, HR Manager</h2>
                    <p>Manage employee records, attendance, and recruitment.</p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3>Employee Directory</h3>
                        <p>View all staff members</p>
                    </div>
                    <div className="dashboard-card">
                        <h3>Attendance</h3>
                        <p>Track employee attendance</p>
                    </div>
                    <div className="dashboard-card">
                        <h3>Leave Requests</h3>
                        <p>Approve or reject leaves</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HRDashboard;
