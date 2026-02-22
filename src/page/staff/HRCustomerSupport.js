import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/HRCustomerSupport.css';

const HRCustomerSupport = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [replyData, setReplyData] = useState({});
    const [replyingTo, setReplyingTo] = useState(null);

    // Fetch all tickets
    useEffect(() => {
        fetchAllTickets();
    }, []);

    const fetchAllTickets = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/support/tickets/all`
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

    // Update ticket status
    const handleStatusChange = async (ticketId, newStatus) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/support/tickets/${ticketId}/status`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                }
            );

            if (response.ok) {
                // Update the ticket in state
                setTickets(prev =>
                    prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t)
                );
            }
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    // Reply to a ticket
    const handleReply = async (ticketId) => {
        const reply = replyData[ticketId];
        if (!reply || reply.trim() === '') return;

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/support/tickets/${ticketId}/reply`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ hrReply: reply })
                }
            );

            if (response.ok) {
                setTickets(prev =>
                    prev.map(t =>
                        t.id === ticketId
                            ? { ...t, hr_reply: reply, status: 'In Progress' }
                            : t
                    )
                );
                setReplyData(prev => ({ ...prev, [ticketId]: '' }));
                setReplyingTo(null);
            }
        } catch (err) {
            console.error('Error replying to ticket:', err);
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

    return (
        <div className="hr-support-page">
            {/* HR Support Header */}
            <header className="hr-support-header">
                <h1>👥 HR - Customer Support Management</h1>
                <button className="btn-back-hr" onClick={() => navigate('/ecare/staff/hr')}>
                    ← Back to HR Dashboard
                </button>
            </header>

            <main className="hr-support-main">
                {error && <div className="support-error">{error}</div>}

                {/* Stats */}
                <div className="support-stats">
                    <div className="stat-card">
                        <h3>{tickets.length}</h3>
                        <p>Total Tickets</p>
                    </div>
                    <div className="stat-card stat-open">
                        <h3>{tickets.filter(t => t.status === 'Open').length}</h3>
                        <p>Open</p>
                    </div>
                    <div className="stat-card stat-progress">
                        <h3>{tickets.filter(t => t.status === 'In Progress').length}</h3>
                        <p>In Progress</p>
                    </div>
                    <div className="stat-card stat-resolved">
                        <h3>{tickets.filter(t => t.status === 'Resolved').length}</h3>
                        <p>Resolved</p>
                    </div>
                </div>

                {/* Tickets Table */}
                <div className="tickets-table-container">
                    <h2>All Support Tickets</h2>
                    {loading ? (
                        <p>Loading tickets...</p>
                    ) : tickets.length === 0 ? (
                        <p>No support tickets found.</p>
                    ) : (
                        <table className="tickets-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Patient</th>
                                    <th>Email</th>
                                    <th>Subject</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map(ticket => (
                                    <React.Fragment key={ticket.id}>
                                        <tr>
                                            <td>#{ticket.id}</td>
                                            <td>{ticket.first_name} {ticket.second_name}</td>
                                            <td>{ticket.patient_email}</td>
                                            <td>{ticket.subject}</td>
                                            <td>
                                                <span className={`priority-badge priority-${ticket.priority.toLowerCase()}`}>
                                                    {ticket.priority}
                                                </span>
                                            </td>
                                            <td>
                                                <select
                                                    value={ticket.status}
                                                    onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                                                    className={`status-select ${getStatusClass(ticket.status)}`}
                                                >
                                                    <option value="Open">Open</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Resolved">Resolved</option>
                                                    <option value="Closed">Closed</option>
                                                </select>
                                            </td>
                                            <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <button
                                                    className="btn-reply"
                                                    onClick={() => setReplyingTo(replyingTo === ticket.id ? null : ticket.id)}
                                                >
                                                    {replyingTo === ticket.id ? 'Cancel' : 'Reply'}
                                                </button>
                                            </td>
                                        </tr>
                                        {/* Expandable message row */}
                                        <tr className="ticket-detail-row">
                                            <td colSpan="8">
                                                <div className="ticket-detail">
                                                    <strong>Message:</strong> {ticket.message}
                                                    {ticket.hr_reply && (
                                                        <div className="existing-reply">
                                                            <strong>Your Reply:</strong> {ticket.hr_reply}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Reply form row */}
                                        {replyingTo === ticket.id && (
                                            <tr className="reply-row">
                                                <td colSpan="8">
                                                    <div className="reply-form">
                                                        <textarea
                                                            placeholder="Type your reply..."
                                                            value={replyData[ticket.id] || ''}
                                                            onChange={(e) =>
                                                                setReplyData(prev => ({
                                                                    ...prev,
                                                                    [ticket.id]: e.target.value
                                                                }))
                                                            }
                                                            rows="3"
                                                        />
                                                        <button
                                                            className="btn-send-reply"
                                                            onClick={() => handleReply(ticket.id)}
                                                        >
                                                            Send Reply
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};

export default HRCustomerSupport;
