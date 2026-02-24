import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ECareNavBar from '../../Components/eCareNavBar';
import '../css/CustomerSupport.css';

const API_URL = process.env.REACT_APP_API_URL;

const HRCustomerSupport = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('Pending');
    const [notification, setNotification] = useState(null);

    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

   

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/support/tickets`);
            const data = await response.json();
            if (response.ok) {
                setTickets(data.tickets || []);
            } else {
                showNotification(data.message || 'Failed to fetch tickets', 'error');
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
            showNotification('Failed to connect to the server', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        if (user) fetchTickets();
    }, [user, fetchTickets]);

    const getFullName = (userData) => {
        if (!userData) return "Staff Member";
        if (userData.name) return userData.name;
        const first = userData.firstName || "";
        const last = userData.lastName || "";
        const full = `${first} ${last}`.trim();
        return full || userData.username || "Staff Member";
    };

    const displayName = useMemo(() => getFullName(user), [user]);

    const summary = useMemo(() => {
        const solved = tickets.filter(t => t.status === 'Resolved' || t.status === 'Approved').length;
        const pending = tickets.filter(t => t.status === 'Pending').length;
        const raised = tickets.length;
        const deleted = tickets.filter(t => t.is_deleted).length;
        return { solved, pending, raised, deleted };
    }, [tickets]);

    const filteredTickets = useMemo(() => {
        return tickets.filter(t => t.status === statusFilter);
    }, [tickets, statusFilter]);

    const handleDeleteTicket = async (ticketId) => {
        if (!window.confirm('Are you sure you want to delete this ticket?')) return;
        try {
            const response = await fetch(`${API_URL}/api/support/tickets/${ticketId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                showNotification('Ticket deleted successfully!');
                fetchTickets();
            } else {
                const data = await response.json();
                showNotification(data.message || 'Failed to delete ticket', 'error');
            }
        } catch (error) {
            showNotification('Failed to connect to the server', 'error');
        }
    };

    const handleUpdateStatus = async (ticketId, newStatus) => {
        try {
            const response = await fetch(`${API_URL}/api/support/tickets/${ticketId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (response.ok) {
                showNotification(`Ticket updated to ${newStatus}!`);
                fetchTickets();
            } else {
                const data = await response.json();
                showNotification(data.message || 'Failed to update status', 'error');
            }
        } catch (error) {
            showNotification('Failed to connect to the server', 'error');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };



    return (
        <div className="cs-page">
            <ECareNavBar />
            {notification && (
                <div className={`cs-notification ${notification.type}`}>
                    <span>{notification.message}</span>
                </div>
            )}
            <main className="cs-main">
                <div className="cs-topic-header">
                    <h2>NCC eCare Customer Support (HR)</h2>
                </div>

                <div className="cs-user-card cs-user-card-hr">
                    <div className="cs-user-info">
                        <div className="cs-user-avatar cs-avatar-hr">
                            <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '32px' }}>account_circle</span>
                        </div>
                        <div className="cs-user-details">
                            <span className="cs-user-label">Logged in as</span>
                            <h3 className="cs-user-name">{displayName}</h3>
                            <span className="cs-user-badge cs-badge-hr">HR Staff Member</span>
                        </div>
                    </div>
                </div>

                <div className="cs-summary-container">
                    <div className="cs-summary-card cs-summary-raised">
                        <h4>Total Raised</h4>
                        <span className="cs-summary-value">{summary.raised}</span>
                    </div>
                    <div className="cs-summary-card cs-summary-pending">
                        <h4>Awaiting Attention</h4>
                        <span className="cs-summary-value">{summary.pending}</span>
                    </div>
                    <div className="cs-summary-card cs-summary-solved">
                        <h4>Approved/Solved</h4>
                        <span className="cs-summary-value">{summary.solved}</span>
                    </div>
                    <div className="cs-summary-card cs-summary-deleted">
                        <h4>Deleted</h4>
                        <span className="cs-summary-value">{summary.deleted}</span>
                    </div>
                </div>

                <div className="cs-hr-filters">
                    <button className={`cs-filter-btn ${statusFilter === 'Pending' ? 'active' : ''}`} onClick={() => setStatusFilter('Pending')}>Pending</button>
                    <button className={`cs-filter-btn ${statusFilter === 'Rejected' ? 'active' : ''}`} onClick={() => setStatusFilter('Rejected')}>Rejected</button>
                    <button className={`cs-filter-btn ${statusFilter === 'Approved' ? 'active' : ''}`} onClick={() => setStatusFilter('Approved')}>Approved</button>
                </div>

                <div className="cs-topic-header" style={{ borderBottom: 'none' }}>
                    <h2>{statusFilter} Tickets</h2>
                </div>

                <div className="cs-tickets-list">
                    {loading ? (
                        <div className="cs-loading"><div className="cs-spinner"></div></div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="cs-empty"><p>No {statusFilter.toLowerCase()} tickets found</p></div>
                    ) : (
                        filteredTickets.map((ticket) => (
                            <div className="cs-ticket-item cs-ticket-part" key={ticket.id} style={{ background: 'white', marginBottom: '15px', borderRadius: '12px', border: '1px solid #eee' }}>
                                <div className="cs-ticket-content">
                                    <h3 className="cs-ticket-title">{ticket.subject}</h3>
                                    <p className="cs-ticket-desc">{ticket.description}</p>
                                    <div className="cs-ticket-meta">
                                        <span className="cs-ticket-meta-item">Patient: {ticket.patient_name}</span>
                                        <span className="cs-ticket-meta-item">{formatDate(ticket.created_at)}</span>
                                    </div>
                                </div>
                                <div className="cs-ticket-actions">
                                    <span className={`cs-status-badge ${ticket.status === 'Approved' || ticket.status === 'Resolved' ? 'cs-status-resolved' : ticket.status === 'Rejected' ? 'cs-status-deleted' : 'cs-status-pending'}`}>
                                        {ticket.status}
                                    </span>
                                    <button className="cs-delete-btn" onClick={() => handleUpdateStatus(ticket.id, 'Approved')} title="Approve" style={{ color: '#2e7d32' }}>
                                        <span className="material-symbols-outlined">check_circle</span>
                                    </button>
                                    <button className="cs-delete-btn" onClick={() => handleUpdateStatus(ticket.id, 'Rejected')} title="Reject" style={{ color: '#c2185b' }}>
                                        <span className="material-symbols-outlined">cancel</span>
                                    </button>
                                    <button className="cs-delete-btn" onClick={() => handleDeleteTicket(ticket.id)} title="Delete">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default HRCustomerSupport;
