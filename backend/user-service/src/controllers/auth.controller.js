const axios = require('axios');
const { dynamoDB } = require('../config/aws');

class AuthController {
    async login(req, res) {
        try {
            const { phone, password } = req.body;

            const user = await dynamoDB.get({
                TableName: 'Users',
                Key: { phone }
            }).promise();

            if (!user.Item) {
                return res.status(401).json({ error: 'Số điện thoại hoặc mật khẩu không đúng' });
            }

            // Gọi auth-service để xác thực
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                phone,
                password
            });

            const { accessToken, refreshToken } = response.data;

            // Cập nhật refresh token trong database
            await dynamoDB.update({
                TableName: 'Users',
                Key: { id: user.Item.id },
                UpdateExpression: 'SET refreshToken = :refreshToken, updatedAt = :updatedAt',
                ExpressionAttributeValues: {
                    ':refreshToken': refreshToken,
                    ':updatedAt': new Date().toISOString()
                }
            }).promise();

            const { password: _, refreshToken: __, ...userWithoutSensitiveData } = user.Item;

            res.json({
                accessToken,
                refreshToken,
                user: userWithoutSensitiveData
            });
        } catch (error) {
            console.error('Login error:', error);
            if (error.response) {
                return res.status(error.response.status).json(error.response.data);
            }
            res.status(500).json({ error: 'Lỗi hệ thống, vui lòng thử lại sau' });
        }
    }

    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(401).json({ error: 'Refresh token không hợp lệ' });
            }

            // Gọi auth-service để refresh token
            const response = await axios.post('http://localhost:8080/api/auth/refresh-token', {
                refreshToken
            });

            res.json(response.data);
        } catch (error) {
            console.error('Refresh token error:', error);
            if (error.response) {
                return res.status(error.response.status).json(error.response.data);
            }
            res.status(401).json({ error: 'Refresh token không hợp lệ' });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { phone } = req.body;

            const user = await dynamoDB.get({
                TableName: 'Users',
                Key: { phone }
            }).promise();

            if (!user.Item) {
                return res.status(404).json({ error: 'Số điện thoại không tồn tại' });
            }

            // Gọi auth-service để gửi OTP
            const response = await axios.post('http://localhost:8080/api/auth/forgot-password', {
                phone
            });

            res.json(response.data);
        } catch (error) {
            console.error('Forgot password error:', error);
            if (error.response) {
                return res.status(error.response.status).json(error.response.data);
            }
            res.status(500).json({ error: 'Lỗi hệ thống, vui lòng thử lại sau' });
        }
    }

    async resetPassword(req, res) {
        try {
            const { phone, otp, newPassword } = req.body;

            // Gọi auth-service để reset password
            const response = await axios.post('http://localhost:8080/api/auth/reset-password', {
                phone,
                otp,
                newPassword
            });

            res.json(response.data);
        } catch (error) {
            console.error('Reset password error:', error);
            if (error.response) {
                return res.status(error.response.status).json(error.response.data);
            }
            res.status(500).json({ error: 'Lỗi hệ thống, vui lòng thử lại sau' });
        }
    }

    async verifyOTP(req, res) {
        try {
            const { phone, otp } = req.body;

            // Gọi auth-service để verify OTP
            const response = await axios.post('http://localhost:8080/api/auth/verify-otp', {
                phone,
                otp
            });

            res.json(response.data);
        } catch (error) {
            console.error('Verify OTP error:', error);
            if (error.response) {
                return res.status(error.response.status).json(error.response.data);
            }
            res.status(500).json({ error: 'Lỗi hệ thống, vui lòng thử lại sau' });
        }
    }

    async resendOTP(req, res) {
        try {
            const { phone } = req.body;

            // Gọi auth-service để gửi lại OTP
            const response = await axios.post('http://localhost:8080/api/auth/resend-otp', {
                phone
            });

            res.json(response.data);
        } catch (error) {
            console.error('Resend OTP error:', error);
            if (error.response) {
                return res.status(error.response.status).json(error.response.data);
            }
            res.status(500).json({ error: 'Lỗi hệ thống, vui lòng thử lại sau' });
        }
    }
}

module.exports = new AuthController(); 