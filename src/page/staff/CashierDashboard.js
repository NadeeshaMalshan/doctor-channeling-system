import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/CashierDashboard.css';
import LogoHospital from '../../images/LogoHospital.png';

const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
});

const isSandboxPayment = (p) => p.paymentEnvironment === 'SANDBOX';

const isOlderThan2Years = (dateStr) => {
    if (!dateStr) return false;
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    return new Date(dateStr) < twoYearsAgo;
};

const STATUS_COLORS = {
    SUCCESS: 'success',
    PENDING: 'pending',
    REFUNDED: 'refunded',
    FAILED: 'failed',
    CANCELED: 'canceled',
    CHARGEDBACK: 'chargedback'
};

const CashierDashboard = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [modal, setModal] = useState({ open: false, type: '', data: null });
    const [toast, setToast] = useState({ show: false, message: '' });

    useEffect(() => {
        document.title = 'Cashier Portal — NCC eCare';

        const fetchPayments = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5000/api/payment/all-transactions', authHeaders());
                const formattedData = response.data.map(item => ({
                    id: item.appointment_id,
                    orderId: item.transaction_id || 'N/A',
                    patientName: item.patient_name || 'Unknown Patient',
                    doctorName: item.doctor_name || 'Assigned Doctor',
                    amount: parseFloat(item.amount) || 0,
                    method: item.payment_method || 'Online',
                    status: item.status ? item.status.toUpperCase() : 'PENDING',
                    cardLast4: item.card_last_digits || '0000',
                    date: item.created_at,
                    paymentEnvironment: item.payment_environment || 'SANDBOX'
                }));
                setPayments(formattedData);
                setError(null);
            } catch (err) {
                console.error('Error fetching payments:', err);
                setError('Failed to load payment history. Please check your connection.');
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
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
        const matchSearch =
            (p.orderId || '').toLowerCase().includes(search) ||
            (p.patientName || '').toLowerCase().includes(search) ||
            (p.doctorName || '').toLowerCase().includes(search);
        const matchFilter = activeFilter === 'ALL' || p.status === activeFilter;
        return matchSearch && matchFilter;
    });

    const handleRefund = (payment) => setModal({ open: true, type: 'refund', data: payment });

    const confirmRefund = async () => {
        setPayments(prev => prev.map(p => p.id === modal.data.id ? { ...p, status: 'REFUNDED' } : p));
        showToast(`Payment ${modal.data.orderId} refunded`);
        setModal({ open: false, type: '', data: null });
    };

    const handleUpdatePaymentStatus = async (payment, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/payment/update-status/${payment.orderId}`, { status: newStatus }, authHeaders());
            setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: newStatus } : p));
            showToast(`Payment ${payment.orderId} marked as ${newStatus}`);
        } catch (error) {
            console.error('Error updating payment status:', error);
            showToast('Failed to update payment status');
        }
    };

    const handleDeleteOld = () => {
        const old = payments.filter(p => isOlderThan2Years(p.date));
        if (old.length === 0) { showToast('No payments older than 2 years found'); return; }
        setModal({ open: true, type: 'deleteOld', data: old });
    };

    const confirmDeleteOld = async () => {
        try {
            const response = await axios.delete('http://localhost:5000/api/payment/delete-old', authHeaders());
            setPayments(prev => prev.filter(p => !isOlderThan2Years(p.date)));
            showToast(`Deleted ${response.data.count} old payment(s)`);
        } catch (error) {
            console.error('Error deleting old payments:', error);
            showToast('Failed to delete old payments');
        }
        setModal({ open: false, type: '', data: null });
    };

    const handleDeleteSandbox = () => {
        const sb = payments.filter(isSandboxPayment);
        if (sb.length === 0) { showToast('No sandbox payments found'); return; }
        setModal({ open: true, type: 'deleteSandbox', data: sb });
    };

    const confirmDeleteSandbox = async () => {
        try {
            const response = await axios.delete('http://localhost:5000/api/payment/delete-sandbox', authHeaders());
            setPayments(prev => prev.filter(p => !isSandboxPayment(p)));
            showToast(`Deleted ${response.data.count} sandbox payment(s)`);
        } catch (error) {
            console.error('Error deleting sandbox payments:', error);
            showToast('Failed to delete sandbox payments');
        }
        setModal({ open: false, type: '', data: null });
    };

    const closeModal = () => setModal({ open: false, type: '', data: null });
    const filterTabs = ['ALL', 'SUCCESS', 'PENDING', 'REFUNDED', 'FAILED'];

    return (
        <div className="cashier-page-wrapper">

            {/* ── NavBar ── */}
            <nav className="cashier-navbar">
                <div className="cashier-navbar-brand">
                    <div className="cashier-logo-icon">
                        <img src={LogoHospital} alt="NCC Logo" />
                    </div>
                    <div className="cashier-brand-text">
                        <span className="brand-name">NCC eCare</span>
                        <span className="brand-tagline">Cashier Portal</span>
                    </div>
                </div>

                <div className="cashier-navbar-actions">
                    <div className="cashier-staff-badge">
                        <span className="material-symbols-outlined">badge</span>
                        <span>Staff: <strong>Cashier</strong></span>
                    </div>
                    <button className="cashier-nav-btn btn-logout" onClick={() => navigate('/ecare/staff-login')}>
                        <span className="material-symbols-outlined">logout</span>
                        Logout
                    </button>
                </div>
            </nav>

            {/* ── Main Content ── */}
            <div className="cashier-main-content">

                {/* Hero */}
                <div className="cashier-hero">
                    <div className="cashier-hero-content">
                        <h1>Payment Management</h1>
                        <p>View, refund and manage all patient payment transactions.</p>
                    </div>
                    <div className="bg-circles">
                        <div className="circle circle-1"></div>
                        <div className="circle circle-2"></div>
                    </div>
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '13px' }}>
                        Loading payment data...
                    </div>
                )}

                {error && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#B91C1C', fontSize: '13px' }}>
                        {error}
                    </div>
                )}

                {/* Stats */}
                {!loading && !error && (
                    <div className="cashier-stats-row">
                        <div className="cashier-stat-card">
                            <div className="stat-icon">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <div className="stat-info">
                                <p>Total Payments</p>
                                <h3>{stats.total}</h3>
                            </div>
                        </div>
                        <div className="cashier-stat-card">
                            <div className="stat-icon">
                                <span className="material-symbols-outlined">check_circle</span>
                            </div>
                            <div className="stat-info">
                                <p>Successful</p>
                                <h3>{stats.success}</h3>
                            </div>
                        </div>
                        <div className="cashier-stat-card">
                            <div className="stat-icon">
                                <span className="material-symbols-outlined">history</span>
                            </div>
                            <div className="stat-info">
                                <p>Refunded</p>
                                <h3>{stats.refunded}</h3>
                            </div>
                        </div>
                        <div className="cashier-stat-card">
                            <div className="stat-icon">
                                <span className="material-symbols-outlined">cancel</span>
                            </div>
                            <div className="stat-info">
                                <p>Failed / Canceled</p>
                                <h3>{stats.failed}</h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Table */}
                {!loading && !error && (
                    <div className="cashier-table-section">
                        <h2>Payment History</h2>

                        {/* Toolbar */}
                        <div className="cashier-toolbar">
                            <div className="cashier-search-container">
                                <span className="material-symbols-outlined">search</span>
                                <input
                                    type="text"
                                    className="cashier-search-box"
                                    placeholder="Search by Order ID, Patient or Doctor..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="cashier-toolbar-btn delete-old" onClick={handleDeleteOld}>
                                <span className="material-symbols-outlined">timer_off</span>
                                Delete Old (&gt;2 yrs)
                            </button>
                            <button className="cashier-toolbar-btn delete-sandbox" onClick={handleDeleteSandbox}>
                                <span className="material-symbols-outlined">science</span>
                                Delete Sandbox
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
                                    {tab === 'ALL'
                                        ? `All (${payments.length})`
                                        : `${tab.charAt(0) + tab.slice(1).toLowerCase()} (${payments.filter(p => p.status === tab).length})`}
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
                                            <tr key={payment.orderId}>
                                                <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#64748B' }}>
                                                    {payment.orderId.length > 20 ? payment.orderId.substring(0, 20) + '…' : payment.orderId}
                                                </td>
                                                <td style={{ fontWeight: 500 }}>{payment.patientName}</td>
                                                <td style={{ color: '#64748B' }}>{payment.doctorName}</td>
                                                <td style={{ fontWeight: 600, color: '#0f172aff' }}>
                                                    LKR {payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td>
                                                    {payment.method}
                                                    {payment.cardLast4 && payment.cardLast4 !== '0000' && (
                                                        <span style={{ color: '#94A3B8', fontSize: '11px', marginLeft: 4 }}>
                                                            ••{payment.cardLast4}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${STATUS_COLORS[payment.status] || ''}`}>
                                                        {payment.status}
                                                    </span>
                                                    {isSandboxPayment(payment) && (
                                                        <span className="sandbox-tag">SANDBOX</span>
                                                    )}
                                                </td>
                                                <td style={{ color: '#64748B' }}>
                                                    {payment.date
                                                        ? new Date(payment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                                        : 'N/A'}
                                                </td>
                                                <td>
                                                    {payment.status === 'SUCCESS' ? (
                                                        <button
                                                            className="table-refund-btn"
                                                            onClick={() => (new Date() - new Date(payment.date)) <= 24 * 60 * 60 * 1000 ? handleRefund(payment) : null}
                                                            disabled={(new Date() - new Date(payment.date)) > 24 * 60 * 60 * 1000}
                                                            title={(new Date() - new Date(payment.date)) > 24 * 60 * 60 * 1000 ? 'Refunds must be requested within 24 hours' : 'Refund this payment'}
                                                        >
                                                            Refund
                                                        </button>
                                                    ) : payment.status === 'PENDING' ? (
                                                        <div style={{ display: 'flex', gap: '5px' }}>
                                                            <button className="table-success-btn" onClick={() => handleUpdatePaymentStatus(payment, 'SUCCESS')}>
                                                                Success
                                                            </button>
                                                            <button className="table-failed-btn" onClick={() => handleUpdatePaymentStatus(payment, 'FAILED')}>
                                                                Failed
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: '#CBD5E1' }}>—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="cashier-empty-state">
                                    <span className="material-symbols-outlined">inbox</span>
                                    <h3>No payments found</h3>
                                    <p>Try adjusting your search or filter criteria.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modal ── */}
            {modal.open && (
                <div className="cashier-modal-overlay" onClick={closeModal}>
                    <div className="cashier-modal" onClick={e => e.stopPropagation()}>
                        {modal.type === 'refund' && (
                            <>
                                <h3>Confirm Refund</h3>
                                <p>
                                    Are you sure you want to refund payment <strong>{modal.data.orderId}</strong> for <strong>{modal.data.patientName}</strong>?<br />
                                    Amount: <strong>LKR {modal.data.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                                </p>
                                <div className="modal-actions">
                                    <button className="modal-btn cancel" onClick={closeModal}>Cancel</button>
                                    <button className="modal-btn confirm-primary" onClick={confirmRefund}>Confirm Refund</button>
                                </div>
                            </>
                        )}
                        {modal.type === 'deleteOld' && (
                            <>
                                <h3>Delete Old Payments</h3>
                                <p>
                                    This will permanently delete <strong>{modal.data.length}</strong> payment record(s) older than 2 years. This action cannot be undone.
                                </p>
                                <div className="modal-actions">
                                    <button className="modal-btn cancel" onClick={closeModal}>Cancel</button>
                                    <button className="modal-btn confirm-danger" onClick={confirmDeleteOld}>Delete</button>
                                </div>
                            </>
                        )}
                        {modal.type === 'deleteSandbox' && (
                            <>
                                <h3>Delete Sandbox Payments</h3>
                                <p>
                                    This will permanently delete <strong>{modal.data.length}</strong> sandbox payment record(s). This action cannot be undone.
                                </p>
                                <div className="modal-actions">
                                    <button className="modal-btn cancel" onClick={closeModal}>Cancel</button>
                                    <button className="modal-btn confirm-danger" onClick={confirmDeleteSandbox}>Delete</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {toast.show && <div className="cashier-toast">{toast.message}</div>}
        </div>
    );
};

export default CashierDashboard;
