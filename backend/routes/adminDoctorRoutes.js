const express = require('express');
const router = express.Router();
const adminDoctorController = require('../controllers/adminDoctorController');

router.get('/', adminDoctorController.getAllDoctors);
router.delete('/:id', adminDoctorController.deleteDoctor);

module.exports = router;
