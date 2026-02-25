import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/CashierDashboard.css';

// ── Mock Data ──
const generateMockPayments = () => [
    { id: 1, orderId: 'ORD1_1708600000000', patientName: 'Alice Johnson', doctorName: 'Dr. Kamal Perera', amount: 3400.00, method: 'VISA', status: 'SUCCESS', cardLast4: '4242', date: '2026-02-20', isSandbox: false },
    { id: 2, orderId: 'ORD2_1708500000000', patientName: 'Bob Williams', doctorName: 'Dr. Nimal Silva', amount: 2800.00, method: 'MASTER', status: 'SUCCESS', cardLast4: '8888', date: '2026-02-18', isSandbox: false },
    { id: 3, orderId: 'ORD3_1708400000000', patientName: 'Charlie Davis', doctorName: 'Dr. Saman Fernando', amount: 4200.00, method: 'N/A', status: 'PENDING', cardLast4: '0000', date: '2026-02-17', isSandbox: false },
    { id: 4, orderId: 'ORD4_1708300000000', patientName: 'Diana Cruz', doctorName: 'Dr. Kamal Perera', amount: 3400.00, method: 'VISA', status: 'FAILED', cardLast4: '1234', date: '2026-02-15', isSandbox: false },
    { id: 5, orderId: 'ORD_TEST_SANDBOX_001', patientName: 'Test User', doctorName: 'Dr. Test Doctor', amount: 100.00, method: 'TEST_MODE', status: 'SUCCESS', cardLast4: '0000', date: '2026-02-10', isSandbox: true },
    { id: 6, orderId: 'ORD_SANDBOX_002', patientName: 'Sandbox Patient', doctorName: 'Dr. Sandbox Doc', amount: 50.00, method: 'TEST_MODE', status: 'PENDING', cardLast4: '0000', date: '2026-02-08', isSandbox: true },
    { id: 7, orderId: 'ORD7_1580000000000', patientName: 'Eve Martinez', doctorName: 'Dr. Nimal Silva', amount: 2500.00, method: 'VISA', status: 'SUCCESS', cardLast4: '5678', date: '2023-08-15', isSandbox: false },
    { id: 8, orderId: 'ORD8_1560000000000', patientName: 'Frank Moore', doctorName: 'Dr. Saman Fernando', amount: 3000.00, method: 'MASTER', status: 'REFUNDED', cardLast4: '9012', date: '2023-02-10', isSandbox: false },
];

const isSandboxPayment = (p) =>
    p.isSandbox || p.orderId.toLowerCase().includes('sandbox') || p.orderId.toLowerCase().includes('test') || p.method === 'TEST_MODE';

const isOlderThan2Years = (dateStr) => {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    return new Date(dateStr) < twoYearsAgo;
};

const STATUS_COLORS = { SUCCESS: 'success', PENDING: 'pending', REFUNDED: 'refunded', FAILED: 'failed', CANCELED: 'canceled', CHARGEDBACK: 'chargedback' };

const CashierDashboard = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState(generateMockPayments);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [modal, setModal] = useState({ open: false, type: '', data: null });
    const [toast, setToast] = useState({ show: false, message: '' });

    useEffect(() => {
        document.title = 'Cashier Portal — NCC eCare';
        return () => { document.title = 'Doctor Channeling System'; };
    }, []);

    const showToast = (msg) => {
        setToast({ show: true, message: msg });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const stats = {
        total: payments.length,
        success: payments.filter(p => p.status === 'SUCCESS').length,
        refunded: payments.filter(p => p.status === 'REFUNDED').length,
        failed: payments.filter(p => p.status === 'FAILED' || p.status === 'CANCELED').length,
    };

    const filteredPayments = payments.filter(p => {
        const search = searchTerm.toLowerCase();
        const matchSearch = p.orderId.toLowerCase().includes(search) || p.patientName.toLowerCase().includes(search) || p.doctorName.toLowerCase().includes(search);
        const matchFilter = activeFilter === 'ALL' || p.status === activeFilter;
        return matchSearch && matchFilter;
    });

    const handleRefund = (payment) => setModal({ open: true, type: 'refund', data: payment });
    const confirmRefund = () => {
        setPayments(prev => prev.map(p => p.id === modal.data.id ? { ...p, status: 'REFUNDED' } : p));
        showToast(`✅ Payment ${modal.data.orderId} refunded successfully`);
        setModal({ open: false, type: '', data: null });
    };

    const handleDeleteOld = () => {
        const old = payments.filter(p => isOlderThan2Years(p.date));
        if (old.length === 0) { showToast('ℹ️ No payments older than 2 years found'); return; }
        setModal({ open: true, type: 'deleteOld', data: old });
    };
    const confirmDeleteOld = () => {
        setPayments(prev => prev.filter(p => !isOlderThan2Years(p.date)));
        showToast(`🗑️ Deleted ${modal.data.length} old payment(s)`);
        setModal({ open: false, type: '', data: null });
    };

    const handleDeleteSandbox = () => {
        const sb = payments.filter(isSandboxPayment);
        if (sb.length === 0) { showToast('ℹ️ No sandbox/test payments found'); return; }
        setModal({ open: true, type: 'deleteSandbox', data: sb });
    };
    const confirmDeleteSandbox = () => {
        setPayments(prev => prev.filter(p => !isSandboxPayment(p)));
        showToast(`🧹 Deleted ${modal.data.length} sandbox payment(s)`);
        setModal({ open: false, type: '', data: null });
    };

    const closeModal = () => setModal({ open: false, type: '', data: null });
    const filterTabs = ['ALL', 'SUCCESS', 'PENDING', 'REFUNDED', 'FAILED'];

    return (
        <div className="cashier-page-wrapper">
            {/* ── NavBar (eCare-inspired) ── */}
            <nav className="cashier-navbar">
                <div className="cashier-navbar-brand">
                    <div className="cashier-logo-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 10h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V9c0-.55.45-1 1-1s1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1z" />
                        </svg>
                    </div>
                    <div className="cashier-brand-text">
                        <span className="brand-name">NCC eCare</span>
                        <span className="brand-tagline">Cashier Portal</span>
                    </div>
                </div>

                <div className="cashier-navbar-actions">
                    <div className="cashier-staff-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                        <span>Staff: <strong>Cashier</strong></span>
                    </div>

                    <button className="cashier-nav-btn btn-back" onClick={() => navigate('/')}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                        </svg>
                        Channeling Center
                    </button>

                    <button className="cashier-nav-btn btn-logout" onClick={() => navigate('/ecare/staff-login')}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                        </svg>
                        Logout
                    </button>
                </div>
            </nav>

            {/* ── Main Content ── */}
            <div className="cashier-main-content">

                {/* Hero Banner (Payment Portal style) */}
                <div className="cashier-hero">
                    <div className="cashier-hero-content">
                        <h1>Payment Management</h1>
                        <p>View, refund and manage all patient payment transactions securely.</p>
                    </div>
                    <div className="bg-circles">
                        <div className="circle circle-1"></div>
                        <div className="circle circle-2"></div>
                    </div>
                </div>

                {/* Stats */}
                <div className="cashier-stats-row">
                    <div className="cashier-stat-card">
                        <span className="stat-emoji">💳</span>
                        <div className="stat-info">
                            <p>Total Payments</p>
                            <h3>{stats.total}</h3>
                        </div>
                    </div>
                    <div className="cashier-stat-card">
                        <span className="stat-emoji">✅</span>
                        <div className="stat-info">
                            <p>Successful</p>
                            <h3 style={{ color: '#155724' }}>{stats.success}</h3>
                        </div>
                    </div>
                    <div className="cashier-stat-card">
                        <span className="stat-emoji">🔄</span>
                        <div className="stat-info">
                            <p>Refunded</p>
                            <h3 style={{ color: '#004085' }}>{stats.refunded}</h3>
                        </div>
                    </div>
                    <div className="cashier-stat-card">
                        <span className="stat-emoji">❌</span>
                        <div className="stat-info">
                            <p>Failed / Canceled</p>
                            <h3 style={{ color: '#dc3545' }}>{stats.failed}</h3>
                        </div>
                    </div>
                </div>

                {/* Payment Table Section (summary-box style) */}
                <div className="cashier-table-section">
                    <h2>Payment History</h2>

                    {/* Toolbar */}
                    <div className="cashier-toolbar">
                        <input
                            type="text"
                            className="cashier-search-box"
                            placeholder="🔍  Search by Order ID, Patient or Doctor..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <button className="cashier-toolbar-btn delete-old" onClick={handleDeleteOld}>
                            🗓️ Delete Old Payments (&gt;2 yrs)
                        </button>
                        <button className="cashier-toolbar-btn delete-sandbox" onClick={handleDeleteSandbox}>
                            🧪 Delete Sandbox Payments
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="cashier-filter-tabs">
                        {filterTabs.map(tab => (
                            <button
                                key={tab}
                                className={`cashier-filter-tab ${activeFilter === tab ? 'active' : ''}`}
                                onClick={() => setActiveFilter(tab)}
                            >
                                {tab === 'ALL' ? `All (${payments.length})` : `${tab.charAt(0) + tab.slice(1).toLowerCase()} (${payments.filter(p => p.status === tab).length})`}
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="cashier-table-wrapper">
                        {filteredPayments.length > 0 ? (
                            <table className="cashier-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Patient</th>
                                        <th>Doctor</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayments.map(payment => (
                                        <tr key={payment.id}>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                                {payment.orderId.length > 20 ? payment.orderId.substring(0, 20) + '…' : payment.orderId}
                                            </td>
                                            <td>{payment.patientName}</td>
                                            <td>{payment.doctorName}</td>
                                            <td style={{ fontWeight: 600 }}>LKR {payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                            <td>
                                                {payment.method}
                                                {payment.cardLast4 && payment.cardLast4 !== '0000' && (
                                                    <span style={{ color: '#999', fontSize: '0.8rem', marginLeft: 4 }}>••{payment.cardLast4}</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${STATUS_COLORS[payment.status] || ''}`}>
                                                    {payment.status}
                                                </span>
                                                {isSandboxPayment(payment) && <span className="sandbox-tag">SANDBOX</span>}
                                            </td>
                                            <td>{new Date(payment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                            <td>
                                                {payment.status === 'SUCCESS' ? (
                                                    <button className="table-refund-btn" onClick={() => handleRefund(payment)}>
                                                        Refund
                                                    </button>
                                                ) : (
                                                    <span style={{ color: '#999', fontSize: '0.8rem' }}>—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="cashier-empty-state">
                                <p style={{ fontSize: '2rem', margin: 0 }}>📭</p>
                                <h3>No payments found</h3>
                                <p>Try adjusting your search or filter criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Modal ── */}
            {modal.open && (
                <div className="cashier-modal-overlay" onClick={closeModal}>
                    <div className="cashier-modal" onClick={e => e.stopPropagation()}>
                        {modal.type === 'refund' && (
                            <>
                                <h3>🔄 Confirm Refund</h3>
                                <p>
                                    Are you sure you want to refund payment <strong>{modal.data.orderId}</strong> for <strong>{modal.data.patientName}</strong>?<br />
                                    Amount: <strong>LKR {modal.data.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                                </p>
                                <div className="modal-actions">
                                    <button className="modal-btn cancel" onClick={closeModal}>Cancel</button>
                                    <button className="modal-btn confirm-primary" onClick={confirmRefund}>Yes, Refund</button>
                                </div>
                            </>
                        )}
                        {modal.type === 'deleteOld' && (
                            <>
                                <h3>🗓️ Delete Old Payments</h3>
                                <p>
                                    This will permanently delete <strong>{modal.data.length}</strong> payment record(s) older than 2 years. This action cannot be undone.
                                </p>
                                <div className="modal-actions">
                                    <button className="modal-btn cancel" onClick={closeModal}>Cancel</button>
                                    <button className="modal-btn confirm-danger" onClick={confirmDeleteOld}>Yes, Delete</button>
                                </div>
                            </>
                        )}
                        {modal.type === 'deleteSandbox' && (
                            <>
                                <h3>🧪 Delete Sandbox Payments</h3>
                                <p>
                                    This will permanently delete <strong>{modal.data.length}</strong> test/sandbox payment record(s). This action cannot be undone.
                                </p>
                                <div className="modal-actions">
                                    <button className="modal-btn cancel" onClick={closeModal}>Cancel</button>
                                    <button className="modal-btn confirm-danger" onClick={confirmDeleteSandbox}>Yes, Delete</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── Toast ── */}
            {toast.show && <div className="cashier-toast">{toast.message}</div>}
        </div>
    );
};

export default CashierDashboard;
