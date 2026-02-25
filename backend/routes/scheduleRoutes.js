const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

router.post('/', scheduleController.createSchedule);
router.get('/', scheduleController.getAllSchedules);
router.get('/date/:date', scheduleController.getSchedulesByDate);
router.get('/:id', scheduleController.getScheduleById);
router.put('/:id', scheduleController.updateSchedule);
router.patch('/:id/status', scheduleController.updateScheduleStatus);
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;
