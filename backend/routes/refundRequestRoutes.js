const express = require('express');
const router = express.Router();
const refundRequestController = require('../controllers/refundRequestController');
const { verifyStaffToken } = require('../middleware/authMiddleware');

router.post('/', refundRequestController.createRefundRequest);
router.get('/pending', verifyStaffToken, refundRequestController.listPendingRefundRequests);

module.exports = router;
