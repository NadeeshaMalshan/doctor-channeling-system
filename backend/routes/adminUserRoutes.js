const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');

router.get('/', adminUserController.getAllUsers);
router.delete('/:id', adminUserController.deleteUser);

module.exports = router;
