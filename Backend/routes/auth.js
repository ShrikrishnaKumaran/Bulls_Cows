const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);

// Protected routes
router.get('/profile', protect, authController.getProfile);
router.post('/logout', protect, authController.logout);
router.post('/logout-all', protect, authController.logoutAll);

module.exports = router;
