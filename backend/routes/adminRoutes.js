const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin Login
router.post('/login', adminController.login);

module.exports = router;