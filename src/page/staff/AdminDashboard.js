import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/StaffDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear session logic here
        navigate('/ecare/staff-login');
    };

    return (
        <div className="staff-dashboard">
            <header className="dashboard-header">
                <h1>
                    <span>🛡️</span> Admin Portal
                </h1>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </header>

            <main className="dashboard-content">
                <div className="dashboard-welcome-card">
                    <h2>Welcome, Administrator</h2>
                    <p>Manage system users, settings, and view system-wide reports.</p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3>User Management</h3>
                        <p>Add, edit, or remove staff accounts</p>
                    </div>
                    <div className="dashboard-card">
                        <h3>System Settings</h3>
                        <p>Configure system parameters</p>
                    </div>
                    <div className="dashboard-card">
                        <h3>Audit Logs</h3>
                        <p>View system access history</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
