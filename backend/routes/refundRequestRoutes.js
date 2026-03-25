const express = require('express');
const router = express.Router();
const refundRequestController = require('../controllers/refundRequestController');
const { verifyStaffToken } = require('../middleware/authMiddleware');

router.post('/', refundRequestController.createRefundRequest);
router.get('/pending', verifyStaffToken, refundRequestController.listPendingRefundRequests);
router.get('/all', verifyStaffToken, refundRequestController.listAllRefundRequests);
router.delete('/delete-old', verifyStaffToken, refundRequestController.deleteOldRefundRequests);

module.exports = router;
