const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

// Endpoint đăng ký mới
router.post('/register', async (req, res) => {
    try {
        const { phone, email, password, name, avatar, status } = req.body;

        // Kiểm tra xem số điện thoại đã tồn tại chưa
        const existingUser = await User.getByPhone(phone);
        if (existingUser) {
            return res.status(409).json({ message: 'Số điện thoại đã được đăng ký' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới
        const newUser = {
            id: Date.now().toString(),
            phone,
            email,
            password: hashedPassword,
            name,
            avatar: avatar || null,
            status: status || 'online',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Lưu user vào DynamoDB
        const params = {
            TableName: 'users',
            Item: newUser,
            ConditionExpression: 'attribute_not_exists(phone)'
        };

        await dynamoDB.put(params).promise();
        
        // Trả về thông tin user (không bao gồm password)
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Lỗi trong quá trình đăng ký' });
    }
});

// Endpoint kiểm tra số điện thoại tồn tại
router.get('/check-exists/:phone', async (req, res) => {
    try {
        const { phone } = req.params;
        const user = await User.getByPhone(phone);
        res.json({ exists: !!user });
    } catch (error) {
        console.error('Error checking phone:', error);
        res.status(500).json({ message: 'Lỗi khi kiểm tra số điện thoại' });
    }
});

module.exports = router; 