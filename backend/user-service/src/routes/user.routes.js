const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth.middleware');
const { 
    registerUser, 
    getProfile,
    updateUserProfile,
    updateAvatar,
    updateStatus,
    changePassword,
    searchUsers,
    getUserProfile
} = require('../controllers/userController');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Register new user
router.post('/register', [
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required')
], async (req, res) => {
    try {
        const result = await registerUser(req.body);
        res.status(200).json(result);
    } catch (error) {
        console.error('Registration error:', error);
        if (error.message === 'User already exists') {
            res.status(409).json({ 
                error: 'Số điện thoại đã được đăng ký'
            });
        } else {
            res.status(500).json({ 
                error: 'Lỗi hệ thống, vui lòng thử lại sau'
            });
        }
    }
});

// Get user profile
router.get('/profile', authMiddleware, getUserProfile);

// Update user profile
router.put('/profile', authMiddleware, updateUserProfile);

// Update avatar
router.put('/avatar', authMiddleware, upload.single('avatar'), updateAvatar);

// Update status
router.put('/status',
    authMiddleware,
    [body('status').trim().notEmpty()],
    updateStatus
);

// Change password
router.put('/password',
    authMiddleware,
    [
        body('currentPassword').notEmpty(),
        body('newPassword').isLength({ min: 6 })
    ],
    changePassword
);

// Search users
router.get('/search', authMiddleware, searchUsers);

module.exports = router; 