const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');


router.get('/details', paymentController.getPaymentDetails);
router.post('/generate-hash', paymentController.generateHash);
router.post('/notify', paymentController.handleNotification);
router.get('/status/:orderID', paymentController.getPaymentStatus);
module.exports = router;