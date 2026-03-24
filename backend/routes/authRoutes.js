const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.registerPatient);
router.post('/doctor/signup', authController.registerDoctor);
router.post('/login', authController.login);
router.post('/staff-login', authController.staffLogin);
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/forgot-password/verify-otp', authController.verifyPasswordResetOtp);
router.post('/forgot-password/reset', authController.completePasswordReset);

module.exports = router;
