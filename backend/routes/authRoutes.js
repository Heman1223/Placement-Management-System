const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { auth, requireFields, validateEmail, sanitizeInput } = require('../middleware');

// @route   POST /api/auth/register
router.post('/register',
    sanitizeInput,
    requireFields(['email', 'password', 'role']),
    validateEmail,
    authController.register
);

// @route   POST /api/auth/login
router.post('/login',
    sanitizeInput,
    requireFields(['email', 'password']),
    authController.login
);

// @route   GET /api/auth/profile
router.get('/profile', auth, authController.getProfile);

// @route   PUT /api/auth/password
router.put('/password',
    auth,
    requireFields(['currentPassword', 'newPassword']),
    authController.updatePassword
);

// @route   POST /api/auth/logout
router.post('/logout', auth, authController.logout);

module.exports = router;
