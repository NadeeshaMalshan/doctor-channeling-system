const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

// Patient routes
router.post('/tickets', supportController.createTicket);
router.get('/tickets/patient/:patientId', supportController.getTicketsByPatient);
router.delete('/tickets/:id', supportController.deleteTicket);

// HR Staff routes
router.get('/tickets', supportController.getAllTickets);
router.put('/tickets/:id/status', supportController.updateTicketStatus);
router.put('/tickets/:id/soft-delete', supportController.softDeleteTicket);

module.exports = router;
