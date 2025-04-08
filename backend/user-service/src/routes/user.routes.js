const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body } = require('express-validator');
const { authMiddleware, isAdmin } = require('../middleware/auth.middleware');
const UserController = require('../controllers/user.controller');

const userController = new UserController();

// Bind all methods to maintain 'this' context
Object.getOwnPropertyNames(UserController.prototype).forEach(method => {
    if (method !== 'constructor') {
        userController[method] = userController[method].bind(userController);
    }
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Register new user
router.post('/register', [
    body('phone').trim().notEmpty(),
    body('password').isLength({ min: 6 }),
    body('name').trim()
], userController.register);

// Get user profile
router.get('/profile', authMiddleware, userController.getProfile);

// Update user profile
router.put('/profile', authMiddleware, userController.updateProfile);

// Update avatar
router.put('/avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);

// Update status
router.put('/status',
    authMiddleware,
    [body('status').trim().notEmpty()],
    userController.updateStatus
);

// Change password
router.put('/change-password',
    authMiddleware,
    [
        body('currentPassword').notEmpty(),
        body('newPassword').isLength({ min: 6 })
    ],
    userController.changePassword
);

// Search users
router.get('/search', authMiddleware, userController.getAllUsers);

// Get user by phone (for auth service)
router.get('/:phone', userController.getUserByPhone);

module.exports = router; 