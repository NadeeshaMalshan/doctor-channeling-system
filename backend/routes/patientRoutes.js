const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// Patient profile routes
router.get('/:id', patientController.getProfile);
router.put('/:id', patientController.updateProfile);
router.delete('/:id', patientController.deleteProfile);
router.post('/:id/photo', patientController.uploadPhoto);

module.exports = router;
