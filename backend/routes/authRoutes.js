const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const doctorController = require('../controllers/doctorController');

router.post('/signup', authController.registerPatient);
router.post('/doctor/signup', authController.registerDoctor);
router.post('/login', authController.login);
router.post('/staff-login', authController.staffLogin);
router.get('/doctors/specializations', doctorController.getSpecializations);
router.get('/doctors', doctorController.getDoctors);
router.delete('/doctor/:id', doctorController.deleteDoctorAccount);
router.get('/doctor/:id', doctorController.getDoctorDetails);
router.put('/doctor/:id', doctorController.updateDoctorProfile);

module.exports = router;
