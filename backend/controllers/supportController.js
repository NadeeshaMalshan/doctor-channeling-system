const db = require('../config/db');

// ========== PATIENT FUNCTIONS ==========

// Create a new support ticket (Patient)
exports.createTicket = async (req, res) => {
    const { patientId, subject, message, priority } = req.body;

    try {
        if (!patientId || !subject || !message) {
            return res.status(400).json({ message: 'Patient ID, subject, and message are required' });
        }

        // Verify patient exists in database
        const [patients] = await db.execute(
            'SELECT id, first_name, second_name, email FROM patients WHERE id = ?',
            [patientId]
        );

        if (patients.length === 0) {
            return res.status(404).json({ message: 'Patient not found. Please register first.' });
        }

        const [result] = await db.execute(
            'INSERT INTO support_tickets (patient_id, subject, message, priority) VALUES (?, ?, ?, ?)',
            [patientId, subject, message, priority || 'Medium']
        );

        res.status(201).json({
            message: 'Support ticket created successfully',
            ticketId: result.insertId
        });
    } catch (error) {
        console.error('Error creating support ticket:', error);
        res.status(500).json({ message: 'Server error while creating ticket' });
    }
};

// Get all tickets for a specific patient (Patient view)
exports.getPatientTickets = async (req, res) => {
    const { patientId } = req.params;

    try {
        const [tickets] = await db.execute(
            `SELECT id, subject, message, status, priority, hr_reply, created_at, updated_at 
             FROM support_tickets 
             WHERE patient_id = ? AND is_deleted = 0 
             ORDER BY created_at DESC`,
            [patientId]
        );

        res.status(200).json({ tickets });
    } catch (error) {
        console.error('Error fetching patient tickets:', error);
        res.status(500).json({ message: 'Server error while fetching tickets' });
    }
};

// Delete a ticket (Patient - soft delete)
exports.deleteTicket = async (req, res) => {
    const { ticketId } = req.params;
    const { patientId } = req.body;

    try {
        // Verify the ticket belongs to this patient
        const [tickets] = await db.execute(
            'SELECT * FROM support_tickets WHERE id = ? AND patient_id = ?',
            [ticketId, patientId]
        );

        if (tickets.length === 0) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Soft delete
        await db.execute(
            'UPDATE support_tickets SET is_deleted = 1 WHERE id = ?',
            [ticketId]
        );

        res.status(200).json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ message: 'Server error while deleting ticket' });
    }
};

// ========== HR FUNCTIONS ==========

// Get ALL tickets (HR view)
exports.getAllTickets = async (req, res) => {
    try {
        const [tickets] = await db.execute(
            `SELECT st.id, st.subject, st.message, st.status, st.priority, 
                    st.hr_reply, st.created_at, st.updated_at,
                    p.first_name, p.second_name, p.email AS patient_email, p.phone AS patient_phone
             FROM support_tickets st
             JOIN patients p ON st.patient_id = p.id
             WHERE st.is_deleted = 0
             ORDER BY st.created_at DESC`
        );

        res.status(200).json({ tickets });
    } catch (error) {
        console.error('Error fetching all tickets:', error);
        res.status(500).json({ message: 'Server error while fetching tickets' });
    }
};

// Update ticket status (HR)
exports.updateTicketStatus = async (req, res) => {
    const { ticketId } = req.params;
    const { status, hrStaffId } = req.body;

    try {
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        await db.execute(
            'UPDATE support_tickets SET status = ?, hr_staff_id = ? WHERE id = ?',
            [status, hrStaffId || null, ticketId]
        );

        res.status(200).json({ message: 'Ticket status updated successfully' });
    } catch (error) {
        console.error('Error updating ticket status:', error);
        res.status(500).json({ message: 'Server error while updating ticket' });
    }
};

// Reply to a ticket (HR)
exports.replyToTicket = async (req, res) => {
    const { ticketId } = req.params;
    const { hrReply, hrStaffId } = req.body;

    try {
        if (!hrReply) {
            return res.status(400).json({ message: 'Reply message is required' });
        }

        await db.execute(
            'UPDATE support_tickets SET hr_reply = ?, hr_staff_id = ?, status = ? WHERE id = ?',
            [hrReply, hrStaffId || null, 'In Progress', ticketId]
        );

        res.status(200).json({ message: 'Reply sent successfully' });
    } catch (error) {
        console.error('Error replying to ticket:', error);
        res.status(500).json({ message: 'Server error while replying to ticket' });
    }
};
