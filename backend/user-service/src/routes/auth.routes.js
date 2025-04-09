const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const dynamoDB = require('../config/dynamodb');

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

// Endpoint gửi OTP quên mật khẩu
router.post('/forgot-password/send-otp', async (req, res) => {
    try {
        const { phone } = req.body;

        // Kiểm tra xem số điện thoại có tồn tại không
        const user = await User.getByPhone(phone);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'Số điện thoại không tồn tại trong hệ thống' 
            });
        }

        // Tạo mã OTP ngẫu nhiên 6 chữ số
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Lưu OTP vào DynamoDB với thời gian hết hạn 5 phút
        const otpParams = {
            TableName: 'otps',
            Item: {
                phone,
                otp,
                type: 'forgot-password', // Phân biệt OTP quên mật khẩu với OTP đăng ký
                expiresAt: Math.floor(Date.now() / 1000) + 300, // 5 phút
                createdAt: new Date().toISOString()
            }
        };

        await dynamoDB.put(otpParams).promise();

        // TODO: Gửi OTP qua SMS hoặc email
        console.log(`OTP for ${phone}: ${otp}`);

        res.json({ 
            success: true,
            message: 'Mã OTP đã được gửi đến số điện thoại của bạn'
        });
    } catch (error) {
        console.error('Error in send OTP:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi trong quá trình gửi OTP' 
        });
    }
});

// Endpoint xác thực OTP và đặt lại mật khẩu
router.post('/forgot-password/verify-otp', async (req, res) => {
    try {
        const { phone, otp, newPassword } = req.body;

        // Kiểm tra OTP
        const otpParams = {
            TableName: 'otps',
            Key: { 
                phone,
                type: 'forgot-password' // Phân biệt OTP quên mật khẩu với OTP đăng ký
            }
        };

        const otpData = await dynamoDB.get(otpParams).promise();
        
        if (!otpData.Item || otpData.Item.otp !== otp) {
            return res.status(400).json({ 
                success: false,
                message: 'Mã OTP không hợp lệ' 
            });
        }

        // Kiểm tra thời gian hết hạn
        if (otpData.Item.expiresAt < Math.floor(Date.now() / 1000)) {
            return res.status(400).json({ 
                success: false,
                message: 'Mã OTP đã hết hạn' 
            });
        }

        // Hash mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu mới
        const updateParams = {
            TableName: 'users',
            Key: { phone },
            UpdateExpression: 'set password = :password, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
                ':password': hashedPassword,
                ':updatedAt': new Date().toISOString()
            }
        };

        await dynamoDB.update(updateParams).promise();

        // Xóa OTP đã sử dụng
        await dynamoDB.delete(otpParams).promise();

        res.json({ 
            success: true,
            message: 'Mật khẩu đã được cập nhật thành công'
        });
    } catch (error) {
        console.error('Error in verify OTP:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi trong quá trình đặt lại mật khẩu' 
        });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

module.exports = router; 