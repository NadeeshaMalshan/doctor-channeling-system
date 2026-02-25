const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.registerPatient);
router.post('/doctor/signup', authController.registerDoctor);
router.post('/login', authController.login);
router.post('/staff-login', authController.staffLogin);
router.get('/doctors/specializations', authController.getSpecializations);
router.get('/doctors', authController.getDoctors);

module.exports = router;
