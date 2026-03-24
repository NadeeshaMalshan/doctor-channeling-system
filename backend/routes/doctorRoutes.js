const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

// All of these paths are mounted under '/api/auth' in server.js to maintain frontend compatibility.
router.get('/doctors/specializations', doctorController.getSpecializations);
router.get('/doctors', doctorController.getDoctors);
router.delete('/doctor/:id', doctorController.deleteDoctorAccount);
router.get('/doctor/:id', doctorController.getDoctorDetails);
router.put('/doctor/:id', doctorController.updateDoctorProfile);

module.exports = router;
