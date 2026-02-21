const db = require('../config/db');

// Patient: Create a new support ticket
exports.createTicket = async (req, res) => {
    const { patientId, patientName, patientEmail, subject, description } = req.body;

    try {
        if (!patientId || !patientName || !patientEmail || !subject || !description) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const [result] = await db.execute(
            'INSERT INTO support_tickets (patient_id, patient_name, patient_email, subject, description) VALUES (?, ?, ?, ?, ?)',
            [patientId, patientName, patientEmail, subject, description]
        );

        res.status(201).json({ message: 'Ticket created successfully', ticketId: result.insertId });
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: 'Server error while creating ticket' });
    }
};

// Patient: Get tickets by patient ID
exports.getTicketsByPatient = async (req, res) => {
    const { patientId } = req.params;

    try {
        const [tickets] = await db.execute(
            'SELECT * FROM support_tickets WHERE patient_id = ? AND is_deleted = 0 ORDER BY created_at DESC',
            [patientId]
        );

        res.status(200).json({ tickets });
    } catch (error) {
        console.error('Error fetching patient tickets:', error);
        res.status(500).json({ message: 'Server error while fetching tickets' });
    }
};

// Patient: Delete a ticket (permanent delete)
exports.deleteTicket = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.execute(
            'DELETE FROM support_tickets WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.status(200).json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ message: 'Server error while deleting ticket' });
    }
};

// HR Staff: Get all tickets (non-deleted)
exports.getAllTickets = async (req, res) => {
    try {
        const [tickets] = await db.execute(
            'SELECT * FROM support_tickets WHERE is_deleted = 0 ORDER BY created_at DESC'
        );

        res.status(200).json({ tickets });
    } catch (error) {
        console.error('Error fetching all tickets:', error);
        res.status(500).json({ message: 'Server error while fetching tickets' });
    }
};

// HR Staff: Update ticket status (Pending / Resolved)
exports.updateTicketStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        if (!status || !['Pending', 'Resolved'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be Pending or Resolved' });
        }

        const [result] = await db.execute(
            'UPDATE support_tickets SET status = ? WHERE id = ? AND is_deleted = 0',
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.status(200).json({ message: 'Ticket status updated successfully' });
    } catch (error) {
        console.error('Error updating ticket status:', error);
        res.status(500).json({ message: 'Server error while updating ticket status' });
    }
};

// HR Staff: Soft delete a ticket
exports.softDeleteTicket = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.execute(
            'UPDATE support_tickets SET is_deleted = 1 WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.status(200).json({ message: 'Ticket soft deleted successfully' });
    } catch (error) {
        console.error('Error soft deleting ticket:', error);
        res.status(500).json({ message: 'Server error while soft deleting ticket' });
    }
};
