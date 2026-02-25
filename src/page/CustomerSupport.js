import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ECareNavBar from '../Components/eCareNavBar';
import './css/CustomerSupport.css';

const API_URL = process.env.REACT_APP_API_URL;

const CustomerSupport = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [ticketTitle, setTicketTitle] = useState('');
    const [ticketDescription, setTicketDescription] = useState('');
    const [creating, setCreating] = useState(false);
    const [notification, setNotification] = useState(null);

    // Show notification
    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    // Authentication
    useEffect(() => {
        const storedPatient = localStorage.getItem('user');
        if (storedPatient) {
            const patientData = JSON.parse(storedPatient);
            setUser(patientData);
        } else {
            showNotification('Please register or login to use customer support', 'error');
            setTimeout(() => navigate('/signup'), 2000);
        }
    }, [navigate, showNotification]);

    // Fetch patient's tickets
    const fetchTickets = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/support/tickets/patient/${user.id}`);
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
    }, [user, showNotification]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    // Name logic fix
    const getFullName = (userData) => {
        if (!userData) return "User";
        if (userData.name) return userData.name;
        const first = userData.firstName || "";
        const last = userData.lastName || "";
        const full = `${first} ${last}`.trim();
        return full || userData.username || "User";
    };

    const displayName = useMemo(() => getFullName(user), [user]);

    // Ticket Summary
    const summary = useMemo(() => {
        const solved = tickets.filter(t => t.status === 'Resolved' || t.status === 'Approved').length;
        const pending = tickets.filter(t => t.status === 'Pending').length;
        const raised = tickets.length;
        return { solved, pending, raised };
    }, [tickets]);

    // Create ticket
    const handleCreateTicket = async (e) => {
        e.preventDefault();
        if (!ticketTitle.trim() || !ticketDescription.trim()) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        setCreating(true);
        try {
            const response = await fetch(`${API_URL}/api/support/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: user.id,
                    patientName: displayName,
                    patientEmail: user.email,
                    subject: ticketTitle,
                    description: ticketDescription,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                showNotification('Ticket created successfully!');
                setShowCreateModal(false);
                setTicketTitle('');
                setTicketDescription('');
                fetchTickets();
            } else {
                showNotification(data.message || 'Failed to create ticket', 'error');
            }
        } catch (error) {
            console.error('Error creating ticket:', error);
            showNotification('Failed to connect to the server', 'error');
        } finally {
            setCreating(false);
        }
    };

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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (!user) return <div className="cs-page"><div className="cs-loading">Authenticating...</div></div>;

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
                    <h2>NCC eCare Customer Support</h2>
                </div>

                <div className="cs-user-card">
                    <div className="cs-user-info">
                        <div className="cs-user-avatar">
                            <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '32px' }}>account_circle</span>
                        </div>
                        <div className="cs-user-details">
                            <span className="cs-user-label">Logged in as</span>
                            <h3 className="cs-user-name">{displayName}</h3>
                            <span className="cs-user-badge">Registered Patient</span>
                        </div>
                    </div>
                    <button className="cs-create-btn" onClick={() => setShowCreateModal(true)}>
                        <span className="material-symbols-outlined">add</span>
                        Create Ticket
                    </button>
                </div>

                <div className="cs-summary-container">
                    <div className="cs-summary-card cs-summary-raised">
                        <h4>Raised Tickets</h4>
                        <span className="cs-summary-value">{summary.raised}</span>
                    </div>
                    <div className="cs-summary-card cs-summary-pending">
                        <h4>Pending Tickets</h4>
                        <span className="cs-summary-value">{summary.pending}</span>
                    </div>
                    <div className="cs-summary-card cs-summary-solved">
                        <h4>Solved Tickets</h4>
                        <span className="cs-summary-value">{summary.solved}</span>
                    </div>
                </div>

                <div className="cs-topic-header" style={{ borderBottom: 'none' }}>
                    <h2>MySupport Tickets</h2>
                </div>

                <div className="cs-tickets-list">
                    {loading ? (
                        <div className="cs-loading"><div className="cs-spinner"></div></div>
                    ) : tickets.length === 0 ? (
                        <div className="cs-empty"><p>No tickets found</p></div>
                    ) : (
                        tickets.map((ticket) => (
                            <div className="cs-ticket-item cs-ticket-part" key={ticket.id} style={{ background: 'white', marginBottom: '15px', borderRadius: '12px', border: '1px solid #eee' }}>
                                <div className="cs-ticket-content">
                                    <h3 className="cs-ticket-title">{ticket.subject}</h3>
                                    <p className="cs-ticket-desc">{ticket.description}</p>
                                    <div className="cs-ticket-meta">
                                        <span className="cs-ticket-meta-item">{ticket.patient_name}</span>
                                        <span className="cs-ticket-meta-item">{formatDate(ticket.created_at)}</span>
                                    </div>
                                </div>
                                <div className="cs-ticket-actions">
                                    <span className={`cs-status-badge ${ticket.status === 'Approved' || ticket.status === 'Resolved' ? 'cs-status-resolved' : ticket.status === 'Rejected' ? 'cs-status-deleted' : 'cs-status-pending'}`}>
                                        {ticket.status}
                                    </span>
                                    {ticket.status === 'Pending' && (
                                        <button className="cs-delete-btn" onClick={() => handleDeleteTicket(ticket.id)}>
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {showCreateModal && (
                <div className="cs-modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="cs-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cs-modal-header">
                            <h2>Create Support Ticket</h2>
                            <button className="cs-modal-close" onClick={() => setShowCreateModal(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form className="cs-modal-body" onSubmit={handleCreateTicket}>
                            <div className="cs-form-group">
                                <label>Title</label>
                                <input type="text" value={ticketTitle} onChange={(e) => setTicketTitle(e.target.value)} required />
                            </div>
                            <div className="cs-form-group">
                                <label>Description</label>
                                <textarea value={ticketDescription} onChange={(e) => setTicketDescription(e.target.value)} rows={6} required />
                            </div>
                            <p className="cs-modal-promise">Your problem will be solved within two working days</p>
                            <div className="cs-modal-footer">
                                <button type="button" className="cs-btn-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="cs-btn-submit" disabled={creating}>{creating ? 'Creating...' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerSupport;
