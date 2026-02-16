import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/StaffDashboard.css';

const CashierDashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/ecare/staff-login');
    };

    return (
        <div className="staff-dashboard">
            <header className="dashboard-header">
                <h1>
                    <span>💰</span> Cashier Portal
                </h1>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </header>

            <main className="dashboard-content">
                <div className="dashboard-welcome-card" style={{ background: 'linear-gradient(135deg, #FF9800 0%, #F44336 100%)' }}>
                    <h2>Welcome, Cashier</h2>
                    <p>Process payments, issue receipts, and manage daily transactions.</p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3>New Payment</h3>
                        <p>Process a new transaction</p>
                    </div>
                    <div className="dashboard-card">
                        <h3>Transaction History</h3>
                        <p>View past payments</p>
                    </div>
                    <div className="dashboard-card">
                        <h3>Daily Report</h3>
                        <p>Generate end-of-day report</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CashierDashboard;
