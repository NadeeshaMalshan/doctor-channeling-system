import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/CustomerSupport.css';

const API_URL = process.env.REACT_APP_API_URL;

const CustomerSupport = () => {
    const navigate = useNavigate();
    const [activeRole, setActiveRole] = useState('patient'); // 'patient' or 'hr'
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [ticketTitle, setTicketTitle] = useState('');
    const [ticketDescription, setTicketDescription] = useState('');
    const [creating, setCreating] = useState(false);
    const [notification, setNotification] = useState(null);

    // Simulated user data (since no auth system yet)
    const patientUser = { id: 1, name: 'Patient001', email: 'patient@example.com' };
    const hrUser = { name: 'HR_Staff001' };

    // Show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Fetch tickets based on role
    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            let url;
            if (activeRole === 'patient') {
                url = `${API_URL}/api/support/tickets/patient/${patientUser.id}`;
            } else {
                url = `${API_URL}/api/support/tickets`;
            }
            const response = await fetch(url);
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
    }, [activeRole]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

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
                    patientId: patientUser.id,
                    patientName: patientUser.name,
                    patientEmail: patientUser.email,
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

    // Patient: Delete ticket
    const handleDeleteTicket = async (ticketId) => {
        if (!window.confirm('Are you sure you want to delete this ticket?')) return;
        try {
            const response = await fetch(`${API_URL}/api/support/tickets/${ticketId}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (response.ok) {
                showNotification('Ticket deleted successfully!');
                fetchTickets();
            } else {
                showNotification(data.message || 'Failed to delete ticket', 'error');
            }
        } catch (error) {
            console.error('Error deleting ticket:', error);
            showNotification('Failed to connect to the server', 'error');
        }
    };

    // HR: Update ticket status
    const handleUpdateStatus = async (ticketId, newStatus) => {
        try {
            const response = await fetch(`${API_URL}/api/support/tickets/${ticketId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await response.json();
            if (response.ok) {
                showNotification(`Ticket status updated to ${newStatus}!`);
                fetchTickets();
            } else {
                showNotification(data.message || 'Failed to update status', 'error');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showNotification('Failed to connect to the server', 'error');
        }
    };

    // HR: Soft delete ticket
    const handleSoftDelete = async (ticketId) => {
        if (!window.confirm('Are you sure you want to remove this ticket?')) return;
        try {
            const response = await fetch(`${API_URL}/api/support/tickets/${ticketId}/soft-delete`, {
                method: 'PUT',
            });
            const data = await response.json();
            if (response.ok) {
                showNotification('Ticket removed successfully!');
                fetchTickets();
            } else {
                showNotification(data.message || 'Failed to remove ticket', 'error');
            }
        } catch (error) {
            console.error('Error soft deleting ticket:', error);
            showNotification('Failed to connect to the server', 'error');
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="cs-page">
            {/* Notification */}
            {notification && (
                <div className={`cs-notification ${notification.type}`}>
                    {notification.type === 'success' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                    )}
                    <span>{notification.message}</span>
                </div>
            )}

            {/* Navbar */}
            <nav className="cs-navbar">
                <div className="cs-navbar-brand">
                    <div className="cs-brand-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                        </svg>
                    </div>
                    <div className="cs-brand-text">
                        <h1>E-Channeling Support</h1>
                        <span>Ticket Management System</span>
                    </div>
                </div>
                <div className="cs-navbar-links">
                    <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>HOME</a>
                    <a href="/eCare" onClick={(e) => { e.preventDefault(); navigate('/eCare'); }}>DOCTORS</a>
                    <a href="/#services" onClick={(e) => { e.preventDefault(); }}>SERVICES</a>
                    <a href="/#contact" onClick={(e) => { e.preventDefault(); }}>CONTACTS</a>
                </div>
                <div className="cs-navbar-roles">
                    <button
                        className={`cs-role-btn cs-role-patient ${activeRole === 'patient' ? 'active' : ''}`}
                        onClick={() => setActiveRole('patient')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        Patient
                    </button>
                    <button
                        className={`cs-role-btn cs-role-hr ${activeRole === 'hr' ? 'active' : ''}`}
                        onClick={() => setActiveRole('hr')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                        </svg>
                        HR Staff
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="cs-main">
                {/* User Info Card */}
                <div className={`cs-user-card ${activeRole === 'hr' ? 'cs-user-card-hr' : ''}`}>
                    <div className="cs-user-info">
                        <div className={`cs-user-avatar ${activeRole === 'hr' ? 'cs-avatar-hr' : ''}`}>
                            {activeRole === 'patient' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                                </svg>
                            )}
                        </div>
                        <div className="cs-user-details">
                            <span className="cs-user-label">Logged in as</span>
                            <h3 className="cs-user-name">{activeRole === 'patient' ? patientUser.name : hrUser.name}</h3>
                            <span className={`cs-user-badge ${activeRole === 'hr' ? 'cs-badge-hr' : ''}`}>
                                {activeRole === 'patient' ? 'Patient' : 'HR Staff Member'}
                            </span>
                        </div>
                    </div>
                    {activeRole === 'patient' && (
                        <button className="cs-create-btn" onClick={() => setShowCreateModal(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                            Create Ticket
                        </button>
                    )}
                </div>

                {/* Tickets Section */}
                <div className="cs-tickets-section">
                    <div className="cs-tickets-header">
                        <div>
                            <h2>{activeRole === 'patient' ? 'My Support Tickets' : 'All Support Tickets'}</h2>
                            <span className="cs-tickets-count">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found</span>
                        </div>
                        <div className="cs-tickets-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                        </div>
                    </div>

                    {loading ? (
                        <div className="cs-loading">
                            <div className="cs-spinner"></div>
                            <p>Loading tickets...</p>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="cs-empty">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z" />
                            </svg>
                            <p>No tickets found</p>
                            {activeRole === 'patient' && (
                                <button className="cs-create-btn-sm" onClick={() => setShowCreateModal(true)}>
                                    Create your first ticket
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="cs-tickets-list">
                            {tickets.map((ticket) => (
                                <div className="cs-ticket-item" key={ticket.id}>
                                    <div className="cs-ticket-content">
                                        <h3 className="cs-ticket-title">{ticket.subject}</h3>
                                        <p className="cs-ticket-desc">{ticket.description}</p>
                                        <div className="cs-ticket-meta">
                                            <span className="cs-ticket-meta-item">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                </svg>
                                                {ticket.patient_name}
                                            </span>
                                            <span className="cs-ticket-meta-item">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                                                </svg>
                                                {formatDate(ticket.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="cs-ticket-actions">
                                        {activeRole === 'patient' ? (
                                            <>
                                                <span className={`cs-status-badge ${ticket.status === 'Resolved' ? 'cs-status-resolved' : 'cs-status-pending'}`}>
                                                    {ticket.status === 'Resolved' ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                                            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                                                        </svg>
                                                    )}
                                                    {ticket.status}
                                                </span>
                                                <button className="cs-delete-btn" onClick={() => handleDeleteTicket(ticket.id)} title="Delete ticket">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                                    </svg>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <span className={`cs-status-badge ${ticket.status === 'Resolved' ? 'cs-status-resolved' : 'cs-status-pending'}`}>
                                                    {ticket.status === 'Resolved' ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                                            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                                                        </svg>
                                                    )}
                                                    {ticket.status}
                                                </span>
                                                <button
                                                    className={`cs-action-btn cs-action-pending ${ticket.status === 'Pending' ? 'cs-action-active' : ''}`}
                                                    onClick={() => handleUpdateStatus(ticket.id, 'Pending')}
                                                    title="Set to Pending"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                                                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                                                    </svg>
                                                    Pending
                                                </button>
                                                <button
                                                    className={`cs-action-btn cs-action-resolved ${ticket.status === 'Resolved' ? 'cs-action-active' : ''}`}
                                                    onClick={() => handleUpdateStatus(ticket.id, 'Resolved')}
                                                    title="Set to Resolved"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                    </svg>
                                                    Resolved
                                                </button>
                                                <button className="cs-delete-btn" onClick={() => handleSoftDelete(ticket.id)} title="Remove ticket">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                                    </svg>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Create Ticket Modal */}
            {showCreateModal && (
                <div className="cs-modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="cs-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cs-modal-header">
                            <div className="cs-modal-header-left">
                                <div className="cs-modal-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2>Create Support Ticket</h2>
                                    <p>Describe your issue and we'll help you resolve it</p>
                                </div>
                            </div>
                            <button className="cs-modal-close" onClick={() => setShowCreateModal(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                            </button>
                        </div>
                        <form className="cs-modal-body" onSubmit={handleCreateTicket}>
                            <div className="cs-form-group">
                                <label htmlFor="ticketTitle">Ticket Title <span className="cs-required">*</span></label>
                                <input
                                    type="text"
                                    id="ticketTitle"
                                    placeholder="e.g., Unable to book appointment"
                                    value={ticketTitle}
                                    onChange={(e) => setTicketTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="cs-form-group">
                                <label htmlFor="ticketDesc">Description <span className="cs-required">*</span></label>
                                <textarea
                                    id="ticketDesc"
                                    placeholder="Please describe your issue in detail..."
                                    value={ticketDescription}
                                    onChange={(e) => setTicketDescription(e.target.value)}
                                    rows={6}
                                    required
                                ></textarea>
                            </div>
                            <div className="cs-modal-note">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                                </svg>
                                <span><strong>Note:</strong> Your ticket will be reviewed by our support team within 24 hours. You will receive updates on the status of your ticket.</span>
                            </div>
                            <div className="cs-modal-footer">
                                <button type="button" className="cs-btn-cancel" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="cs-btn-submit" disabled={creating}>
                                    {creating ? 'Creating...' : 'Create Ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerSupport;