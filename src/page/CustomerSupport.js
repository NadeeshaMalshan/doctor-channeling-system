import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ECareNavBar from '../Components/eCareNavBar';
import './css/CustomerSupport.css';

const CustomerSupport = () => {
    const navigate = useNavigate();

    // ===== LOGIN VALIDATION =====
    // Read logged-in patient from localStorage (set during login)
    const [patientUser, setPatientUser] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        priority: 'Medium'
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Check if patient is logged in
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const userType = localStorage.getItem('userType');

        if (!storedUser || userType !== 'patient') {
            // NOT logged in → redirect to login page
            alert('Please login or register to access Customer Support.');
            navigate('/login');
            return;
        }

        setPatientUser(JSON.parse(storedUser));
    }, [navigate]);

    // Fetch patient's tickets from backend
    useEffect(() => {
        if (!patientUser) return;

        const fetchTickets = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/support/tickets/patient/${patientUser.id}`
                );
                const data = await response.json();

                if (response.ok) {
                    setTickets(data.tickets);
                } else {
                    setError(data.message || 'Failed to fetch tickets');
                }
            } catch (err) {
                console.error('Error fetching tickets:', err);
                setError('Failed to connect to server');
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [patientUser]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Submit new ticket
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/support/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: patientUser.id,
                    subject: formData.subject,
                    message: formData.message,
                    priority: formData.priority
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMsg('Ticket created successfully!');
                setFormData({ subject: '', message: '', priority: 'Medium' });
                setShowForm(false);
                // Refresh tickets list
                const res = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/support/tickets/patient/${patientUser.id}`
                );
                const ticketData = await res.json();
                if (res.ok) setTickets(ticketData.tickets);
            } else {
                setError(data.message || 'Failed to create ticket');
            }
        } catch (err) {
            console.error('Error creating ticket:', err);
            setError('Failed to connect to server');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Delete a ticket (soft delete)
    const handleDelete = async (ticketId) => {
        if (!window.confirm('Are you sure you want to delete this ticket?')) return;

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/support/tickets/${ticketId}/delete`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ patientId: patientUser.id })
                }
            );

            if (response.ok) {
                setTickets(prev => prev.filter(t => t.id !== ticketId));
                setSuccessMsg('Ticket deleted successfully');
            }
        } catch (err) {
            console.error('Error deleting ticket:', err);
        }
    };

    // Helper: Get status badge color
    const getStatusClass = (status) => {
        switch (status) {
            case 'Open': return 'status-open';
            case 'In Progress': return 'status-progress';
            case 'Resolved': return 'status-resolved';
            case 'Closed': return 'status-closed';
            default: return '';
        }
    };

    // Don't render until we know the user is logged in
    if (!patientUser) return null;

    return (
        <div className="customer-support-page">
            {/* Same eCare NavBar as Patient Management */}
            <ECareNavBar />

            <main className="support-main">
                {/* Page Header */}
                <div className="support-header">
                    <h1>NCC eCare Customer Support</h1>
                    <p>Welcome, <strong>{patientUser.firstName} {patientUser.secondName}</strong> ({patientUser.email})</p>
                </div>

                {/* Success / Error Messages */}
                {successMsg && <div className="support-success">{successMsg}</div>}
                {error && <div className="support-error">{error}</div>}

                {/* Create Ticket Button */}
                <div className="support-actions">
                    <button className="btn-create-ticket" onClick={() => setShowForm(!showForm)}>
                        {showForm ? '✕ Cancel' : '+ Create New Ticket'}
                    </button>
                    <button className="btn-back" onClick={() => navigate('/eCare')}>
                        ← Back to eCare
                    </button>
                </div>

                {/* Create Ticket Form */}
                {showForm && (
                    <form className="ticket-form" onSubmit={handleSubmit}>
                        <h3>Create Support Ticket</h3>
                        <div className="form-group">
                            <label htmlFor="subject">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                placeholder="Brief description of your issue"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                placeholder="Describe your issue in detail..."
                                value={formData.message}
                                onChange={handleChange}
                                rows="5"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="priority">Priority</label>
                            <select
                                id="priority"
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-submit-ticket" disabled={submitLoading}>
                            {submitLoading ? 'Submitting...' : 'Submit Ticket'}
                        </button>
                    </form>
                )}

                {/* Tickets List */}
                <div className="tickets-section">
                    <h2>My Tickets</h2>
                    {loading ? (
                        <p>Loading tickets...</p>
                    ) : tickets.length === 0 ? (
                        <p className="no-tickets">You have no support tickets yet.</p>
                    ) : (
                        <div className="tickets-list">
                            {tickets.map(ticket => (
                                <div className="ticket-card" key={ticket.id}>
                                    <div className="ticket-header">
                                        <h3>{ticket.subject}</h3>
                                        <span className={`ticket-status ${getStatusClass(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <p className="ticket-message">{ticket.message}</p>
                                    <div className="ticket-meta">
                                        <span className="ticket-priority">Priority: {ticket.priority}</span>
                                        <span className="ticket-date">
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {ticket.hr_reply && (
                                        <div className="ticket-reply">
                                            <strong>HR Reply:</strong>
                                            <p>{ticket.hr_reply}</p>
                                        </div>
                                    )}
                                    <button
                                        className="btn-delete-ticket"
                                        onClick={() => handleDelete(ticket.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CustomerSupport;
