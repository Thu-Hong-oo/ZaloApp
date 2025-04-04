const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { dynamoDB, s3 } = require('../config/aws');
const userService = require('../services/user.service');
require('dotenv').config();
class UserController {
    async register(req, res) {
        try {
            console.log('Processing registration for user:', req.body);
            const { phone, name, password, status = 'online', role = 'user' } = req.body;
            
            if (!phone) {
                return res.status(400).json({
                    success: false,
                    message: 'Số điện thoại là bắt buộc',
                    data: null
                });
            }

            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu là bắt buộc',
                    data: null
                });
            }

            // Check if user already exists
            try {
                const existingUser = await userService.getUserByPhone(phone);
                if (existingUser) {
                    console.log('User already exists:', phone);
                    return res.status(409).json({
                        success: false,
                        message: 'Số điện thoại đã được đăng ký',
                        data: null
                    });
                }
            } catch (error) {
                if (error.code !== 'ResourceNotFoundException') {
                    throw error;
                }
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user data
            const userData = {
                phone,
                name: name || phone,
                password: hashedPassword,
                status: 'online',
                role,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Create new user
            const user = await userService.createUser(userData);

            console.log('User created successfully:', JSON.stringify({...user, password: '[HIDDEN]'}));
            return res.status(201).json({
                success: true,
                message: 'Đăng ký thành công',
                data: user
            });
        } catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống, vui lòng thử lại sau',
                data: null,
                error: error.message
            });
        }
    }

    async getProfile(req, res) {
        try {
            const { phone } = req.user;
            
            const user = await userService.getUserByPhone(phone);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Người dùng không tồn tại',
                    data: null
                });
            }

            return res.json({
                success: true,
                message: 'Lấy thông tin người dùng thành công',
                data: user
            });
        } catch (error) {
            console.error('Get profile error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống, vui lòng thử lại sau',
                data: null,
                error: error.message
            });
        }
    }

    async updateProfile(req, res) {
        try {
            const { phone } = req.user;
            const updateData = req.body;

            const user = await userService.getUserByPhone(phone);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Người dùng không tồn tại',
                    data: null
                });
            }

            const updatedUser = await userService.updateUser(phone, updateData);
            return res.json({
                success: true,
                message: 'Cập nhật thông tin thành công',
                data: updatedUser
            });
        } catch (error) {
            console.error('Update profile error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống, vui lòng thử lại sau',
                data: null,
                error: error.message
            });
        }
    }

    async changePassword(req, res) {
        try {
            const { phone } = req.user;
            const { currentPassword, newPassword } = req.body;

            const user = await userService.getUserByPhone(phone);

            if (!user) {
                return res.status(404).json({ error: 'Người dùng không tồn tại' });
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Mật khẩu hiện tại không đúng' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const updatedUser = await userService.updateUser(phone, { password: hashedPassword });
            res.json({ message: 'Đổi mật khẩu thành công' });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ error: 'Lỗi hệ thống, vui lòng thử lại sau' });
        }
    }

    async uploadAvatar(req, res) {
        try {
            const { phone } = req.user;
            if (!req.file) {
                return res.status(400).json({ error: 'Không có file được tải lên' });
            }

            const file = req.file;
            const fileExtension = file.originalname.split('.').pop();
            const fileName = `${phone}-${Date.now()}.${fileExtension}`;
// Log để debug
console.log('Environment variables:', {
    bucket: process.env.AWS_S3_BUCKET,
    region: process.env.AWS_REGION
});
            const params = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: `avatars/${fileName}`,
                Body: file.buffer,
                ContentType: file.mimetype
            };

            await s3.upload(params).promise();

            const avatarUrl = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/avatars/${fileName}`;

            const updatedUser = await userService.updateUser(phone, { avatar: avatarUrl });
            res.json({ avatarUrl });
        } catch (error) {
            console.error('Upload avatar error:', error);
            res.status(500).json({ error: 'Lỗi hệ thống, vui lòng thử lại sau' });
        }
    }

    async deleteAvatar(req, res) {
        try {
            const { phone } = req.user;

            const user = await userService.getUserByPhone(phone);

            if (!user || !user.avatar) {
                return res.status(404).json({ error: 'Không tìm thấy ảnh đại diện' });
            }

            const avatarUrl = user.avatar;
            const fileName = avatarUrl.split('/').pop();

            await s3.deleteObject({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: `avatars/${fileName}`
            }).promise();

            await userService.updateUser(phone, { avatar: null });

            res.json({ message: 'Xóa ảnh đại diện thành công' });
        } catch (error) {
            console.error('Delete avatar error:', error);
            res.status(500).json({ error: 'Lỗi hệ thống, vui lòng thử lại sau' });
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await userService.listUsers();
            return res.json({
                success: true,
                message: 'Lấy danh sách người dùng thành công',
                data: users
            });
        } catch (error) {
            console.error('Get all users error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống, vui lòng thử lại sau',
                data: null,
                error: error.message
            });
        }
    }

    async getUserByPhone(req, res) {
        try {
            const { phone } = req.params;
            const user = await userService.getUserByPhone(phone);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Người dùng không tồn tại',
                    data: null
                });
            }

            // Kiểm tra xem request có phải từ auth-service không
            const isAuthService = req.headers['x-service'] === 'auth-service';

            // Nếu là auth-service, trả về cả password, ngược lại loại bỏ password
            const responseData = isAuthService ? user : {
                ...user,
                password: undefined
            };

            // Log response data for debugging (hide password)
            console.log('Response data:', JSON.stringify({...responseData, password: responseData.password ? '[HIDDEN]' : undefined}));

            return res.json({
                success: true,
                message: 'Lấy thông tin người dùng thành công',
                data: responseData
            });
        } catch (error) {
            console.error('Get user error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống, vui lòng thử lại sau',
                data: null,
                error: error.message
            });
        }
    }

    async deleteUser(req, res) {
        try {
            const { phone } = req.params;
            await userService.deleteUser(phone);
            return res.json({
                success: true,
                message: 'Xóa người dùng thành công',
                data: { phone }
            });
        } catch (error) {
            console.error('Delete user error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống, vui lòng thử lại sau',
                data: null,
                error: error.message
            });
        }
    }

    async updateStatus(req, res) {
        try {
            const { phone } = req.user;
            const { status } = req.body;

            if (!['online', 'offline', 'away'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: online, offline, away',
                    data: null
                });
            }

            const user = await userService.getUserByPhone(phone);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Người dùng không tồn tại',
                    data: null
                });
            }

            const updateData = {
                status,
                lastSeen: status === 'offline' ? new Date().toISOString() : null,
                updatedAt: new Date().toISOString()
            };

            const updatedUser = await userService.updateUser(phone, updateData);
            
            if (global.wss) {
                global.wss.broadcastStatus(phone, status);
            }
            
            return res.json({
                success: true,
                message: 'Cập nhật trạng thái thành công',
                data: updatedUser
            });
        } catch (error) {
            console.error('Update status error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống, vui lòng thử lại sau',
                data: null,
                error: error.message
            });
        }
    }
}

module.exports = UserController; 