const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');

// Define routes
router.get('/all', availabilityController.getAllAvailability);
router.get('/:doctorId', availabilityController.getAvailability);
router.post('/', availabilityController.createSlot);
router.put('/:id', availabilityController.updateSlot);
router.delete('/:id', availabilityController.deleteSlot);
router.patch('/:id/toggle', availabilityController.toggleStatus);
router.patch('/:id/mark', availabilityController.toggleMarked);

module.exports = router;
