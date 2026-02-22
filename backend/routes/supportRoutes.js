const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

// Patient routes
router.post('/tickets', supportController.createTicket);
router.get('/tickets/patient/:patientId', supportController.getPatientTickets);
router.put('/tickets/:ticketId/delete', supportController.deleteTicket);

// HR routes
router.get('/tickets/all', supportController.getAllTickets);
router.put('/tickets/:ticketId/status', supportController.updateTicketStatus);
router.put('/tickets/:ticketId/reply', supportController.replyToTicket);
router.get('/tickets/patient/:patientId', supportController.getTicketsByPatient);
router.delete('/tickets/:id', supportController.deleteTicket);

// HR Staff routes
router.get('/tickets', supportController.getAllTickets);
router.put('/tickets/:id/status', supportController.updateTicketStatus);
router.put('/tickets/:id/soft-delete', supportController.softDeleteTicket);

module.exports = router;
