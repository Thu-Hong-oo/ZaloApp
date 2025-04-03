const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const { s3, BUCKET_NAME } = require('../config/aws');
const userService = require('../services/user.service');

// Load environment variables
dotenv.config();

// Cấu hình AWS
const awsConfig = {
    region: process.env.AWS_REGION || 'ap-southeast-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

console.log('AWS Config:', { 
    region: awsConfig.region,
    hasAccessKey: !!awsConfig.accessKeyId,
    hasSecretKey: !!awsConfig.secretAccessKey 
});

AWS.config.update(awsConfig);

// Khởi tạo DynamoDB DocumentClient
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

// Get user by phone number
const getUserByPhone = async (phone) => {
    const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: {
            phone: phone
        }
    };

    try {
        const result = await dynamoDB.get(params).promise();
        return result.Item;
    } catch (error) {
        console.error('Error getting user by phone:', error);
        throw error;
    }
};

// Register new user
const registerUser = async (userData) => {
    console.log('Processing registration for user:', {...userData, password: '[HIDDEN]'});

    if (!userData.phone || !userData.name || !userData.password) {
        throw new Error('Missing required fields');
    }

    try {
        // Hash password before creating user
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: {
                phone: userData.phone,
                password: hashedPassword,
                name: userData.name,
                status: 'offline',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };

        await dynamoDB.put(params).promise();
        
        // Return response in the format auth service expects
        return {
            success: true,
            message: 'Đăng ký thành công',
            data: {
                phone: userData.phone,
                name: userData.name,
                status: 'offline'
            }
        };
    } catch (error) {
        console.error('Error registering user:', error);
        if (error.code === 'ConditionalCheckFailedException') {
            throw new Error('User already exists');
        }
        throw error;
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        console.log('Getting profile for user:', req.user.phone);
        
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: {
                phone: req.user.phone
            }
        };
        
        console.log('DynamoDB params:', JSON.stringify(params));
        
        const result = await dynamoDB.get(params).promise();
        
        if (!result.Item) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Loại bỏ password trước khi trả về
        const { password, ...userWithoutPassword } = result.Item;
        
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ message: 'Error getting user profile', error: error.message });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: {
                phone: req.user.phone
            },
            UpdateExpression: 'SET #name = :name, updatedAt = :updatedAt',
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ExpressionAttributeValues: {
                ':name': req.body.name,
                ':updatedAt': new Date().toISOString()
            }
        };

        await dynamoDB.update(params).promise();
        res.json({ message: 'User profile updated successfully' });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update avatar
const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const fileExtension = req.file.originalname.split('.').pop();
        const key = `avatars/${req.user.phone}-${Date.now()}.${fileExtension}`;

        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        };

        await s3.upload(uploadParams).promise();

        const avatarUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: {
                phone: req.user.phone
            },
            UpdateExpression: 'SET avatarUrl = :avatarUrl',
            ExpressionAttributeValues: {
                ':avatarUrl': avatarUrl
            }
        };

        await dynamoDB.update(params).promise();

        res.json({
            success: true,
            data: { avatarUrl }
        });
    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating avatar'
        });
    }
};

// Update status
const updateStatus = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        console.log('Updating status for user:', req.user.phone, 'New status:', req.body.status);

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: {
                phone: req.user.phone
            },
            UpdateExpression: 'SET #userStatus = :status, updatedAt = :updatedAt',
            ExpressionAttributeNames: {
                '#userStatus': 'status'
            },
            ExpressionAttributeValues: {
                ':status': req.body.status,
                ':updatedAt': new Date().toISOString()
            },
            ReturnValues: 'ALL_NEW'
        };

        console.log('DynamoDB update params:', JSON.stringify(params, null, 2));

        const result = await dynamoDB.update(params).promise();
        console.log('Update result:', JSON.stringify(result, null, 2));

        res.json({
            success: true,
            message: 'Status updated successfully',
            data: {
                phone: req.user.phone,
                status: req.body.status
            }
        });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật trạng thái',
            error: error.message
        });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: {
                phone: req.user.phone
            }
        };

        const result = await dynamoDB.get(params).promise();
        const user = result.Item;

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isValidPassword = await bcrypt.compare(
            req.body.currentPassword,
            user.password
        );

        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

        const updateParams = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: {
                phone: req.user.phone
            },
            UpdateExpression: 'SET password = :password',
            ExpressionAttributeValues: {
                ':password': hashedPassword
            }
        };

        await dynamoDB.update(updateParams).promise();

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password'
        });
    }
};

// Search users
const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            FilterExpression: 'contains(#name, :searchTerm) OR contains(phone, :searchTerm)',
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ExpressionAttributeValues: {
                ':searchTerm': query
            }
        };

        const result = await dynamoDB.scan(params).promise();
        res.json(result.Items);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getUserByPhone,
    registerUser,
    getUserProfile,
    updateUserProfile,
    updateAvatar,
    updateStatus,
    changePassword,
    searchUsers
}; 