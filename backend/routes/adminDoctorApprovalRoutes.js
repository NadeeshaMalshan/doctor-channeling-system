const express = require('express');
const router = express.Router();
const adminDoctorApprovalController = require('../controllers/adminDoctorApprovalController');

// GET /api/admin/doctor-requests
router.get('/', adminDoctorApprovalController.getPendingDoctors);

// PUT /api/admin/doctor-requests/:id/approve
router.put('/:id/approve', adminDoctorApprovalController.approveDoctor);

// PUT /api/admin/doctor-requests/:id/reject
router.put('/:id/reject', adminDoctorApprovalController.rejectDoctor);

module.exports = router;
