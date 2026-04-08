import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/CashierDashboard.css';
import LogoHospital from '../../images/LogoHospital.png';
import { formatMediumDateTimeLK, formatMediumDateLK, formatScheduleDateLK } from '../../utils/sriLankaTime';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
});

const isOlderThan10Years = (dateStr) => {
    if (!dateStr) return false;
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    return new Date(dateStr) < tenYearsAgo;
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
    const [refundSubmitting, setRefundSubmitting] = useState(false);

    useEffect(() => {
        document.title = 'Cashier Portal — NCC eCare';

        const fetchPayments = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE}/api/payment/all-transactions`, authHeaders());
                const formattedData = response.data.map((item) => {
                    const pending = item.pending_refund_request;
                    const hasPendingRefundRequest =
                        pending === true || pending === 1 || pending === '1';
                    return {
                        id: item.appointment_id,
                        orderId: item.transaction_id || 'N/A',
                        patientName: item.patient_name || 'Unknown Patient',
                        doctorName: item.doctor_name || 'Assigned Doctor',
                        amount: parseFloat(item.amount) || 0,
                        method: item.payment_method || 'Online',
                        status: item.status ? item.status.toUpperCase() : 'PENDING',
                        cardLast4: item.card_last_digits || '0000',
                        date: item.created_at,
                        hasPendingRefundRequest
                    };
                });
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
        if (!modal?.data?.orderId || refundSubmitting) return;
        try {
            setRefundSubmitting(true);
            await axios.post(
                `${API_BASE}/api/payment/refund/${modal.data.orderId}`,
                {
                    amount: modal.data.amount,
                    reason: `Cashier refund for ${modal.data.orderId}`
                },
                authHeaders()
            );
            setPayments(prev =>
                prev.map((p) =>
                    p.orderId === modal.data.orderId
                        ? { ...p, status: 'REFUNDED', hasPendingRefundRequest: false }
                        : p
                )
            );
            showToast(`Payment ${modal.data.orderId} refunded`);
            setModal({ open: false, type: '', data: null });
        } catch (error) {
            console.error('Error processing refund:', error);
            const message =
                error?.response?.data?.message ||
                'Failed to process refund';
            showToast(message);
        } finally {
            setRefundSubmitting(false);
        }
    };

    const handleUpdatePaymentStatus = async (payment, newStatus) => {
        try {
            await axios.put(`${API_BASE}/api/payment/update-status/${payment.orderId}`, { status: newStatus }, authHeaders());
            setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: newStatus } : p));
            showToast(`Payment ${payment.orderId} marked as ${newStatus}`);
        } catch (error) {
            console.error('Error updating payment status:', error);
            showToast('Failed to update payment status');
        }
    };

    const handleDeleteOld = () => {
        const old = payments.filter(p => isOlderThan10Years(p.date));
        if (old.length === 0) { showToast('No payments older than 10 years found'); return; }
        setModal({ open: true, type: 'deleteOld', data: old });
    };

    const confirmDeleteOld = async () => {
        try {
            const response = await axios.delete(`${API_BASE}/api/payment/delete-old`, authHeaders());
            setPayments(prev => prev.filter(p => !isOlderThan10Years(p.date)));
            const archived = response.data?.archivedToSheet ? ' Details saved to Google Sheet.' : '';
            showToast(`Deleted ${response.data.count} old payment(s).${archived}`);
        } catch (error) {
            console.error('Error deleting old payments:', error);
            const msg = error?.response?.data?.message;
            showToast(msg || 'Failed to delete old payments');
        }
        setModal({ open: false, type: '', data: null });
    };

    
    const closeModal = () => setModal({ open: false, type: '', data: null });
    const filterTabs = ['ALL', 'SUCCESS', 'PENDING', 'REFUNDED', 'FAILED'];
    const handleLogout = () => {
        localStorage.clear();
        navigate('/ecare/staff-login');
    };

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
                    <button className="cashier-nav-btn btn-logout" onClick={handleLogout}>
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
                                Delete Old (&gt;10 yrs)
                            </button>
                            <button
                                className="cashier-toolbar-btn refund-requests"
                                onClick={() => navigate('/ecare/staff/refunds')}
                                title="View refund requests"
                            >
                                <span className="material-symbols-outlined">receipt_long</span>
                                Refunds
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
                                                </td>
                                                <td style={{ color: '#64748B' }}>
                                                    {payment.date ? formatMediumDateTimeLK(payment.date) : 'N/A'}
                                                </td>
                                                <td>
                                                    {payment.status === 'SUCCESS' ? (
                                                        payment.hasPendingRefundRequest ? (
                                                            <button
                                                                type="button"
                                                                className="table-refund-btn"
                                                                onClick={() => handleRefund(payment)}
                                                                title="Process refund via PayHere (patient requested)"
                                                            >
                                                                Refund
                                                            </button>
                                                        ) : (
                                                            <span style={{ color: '#CBD5E1' }}>—</span>
                                                        )
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
                                    <button className="modal-btn cancel" onClick={closeModal} disabled={refundSubmitting}>Cancel</button>
                                    <button className="modal-btn confirm-primary" onClick={confirmRefund} disabled={refundSubmitting}>
                                        {refundSubmitting ? 'Processing...' : 'Confirm Refund'}
                                    </button>
                                </div>
                            </>
                        )}
                        {modal.type === 'deleteOld' && (
                            <>
                                <h3>Delete Old Payments</h3>
                                <p>
                                    This will permanently delete <strong>{modal.data.length}</strong> payment record(s) older than 10 years. This action cannot be undone.
                                </p>
                                <div className="modal-actions">
                                    <button className="modal-btn cancel" onClick={closeModal}>Cancel</button>
                                    <button className="modal-btn confirm-danger" onClick={confirmDeleteOld}>Delete</button>
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
