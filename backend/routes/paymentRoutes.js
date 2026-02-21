const express =require('express');
const router =express.Router();
const paymentController = require('../controllers/paymentController');


router.get('/details', paymentController.getPaymentDetails);
router.post('/generate-hash', paymentController.generateHash);
module.exports = router;