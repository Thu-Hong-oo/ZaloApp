const { v4: uuidv4 } = require('uuid');
const UserModel = require('../models/userModel');

const UserController = {
  createUser: async (req, res) => {
    const { phone, displayName, email, avatar, status } = req.body;
    const userId = uuidv4();
    const timestamp = new Date().toISOString();

    const user = {
      userId,
      phone,
      displayName,
      email,
      avatar: avatar || null,
      status: status || 'Hey, I am using this app',
      createdAt: timestamp,
      updatedAt: timestamp,
      isOnline: false,
      lastSeen: timestamp
    };

    try {
      await UserModel.createUser(user);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ success: false, message: 'Không thể tạo người dùng', error: error.message });
    }
  },

  getUserById: async (req, res) => {
    const { userId } = req.params;
    try {
      const result = await UserModel.getUserById(userId);
      if (!result.Item) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

      res.status(200).json({ success: true, data: result.Item });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin người dùng', error: error.message });
    }
  },
  updateUser: (userId, updates) => {
    const params = {
      TableName: TABLE_NAME,
      Key: { userId },
      ...updates,
      ReturnValues: 'ALL_NEW'
    };
    return dynamoDB.update(params).promise();
  },

  deleteUser: (userId) => {
    const params = {
      TableName: TABLE_NAME,
      Key: { userId }
    };
    return dynamoDB.delete(params).promise();
  },

  searchUsers: (query) => {
    const params = {
      TableName: TABLE_NAME,
      FilterExpression: 'contains(displayName, :query) OR contains(phone, :query)',
      ExpressionAttributeValues: { ':query': query }
    };
    return dynamoDB.scan(params).promise();
  },
  
  
  searchUserByPhone: async (req, res) => {
    const { phone } = req.query;
  
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp số điện thoại' });
    }
  
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'PhoneIndex', // Cần tạo Global Secondary Index (GSI) cho trường phone
      KeyConditionExpression: 'phone = :phone',
      ExpressionAttributeValues: {
        ':phone': phone
      }
    };
  
    try {
      const result = await dynamoDB.query(params).promise();
  
      if (result.Items.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      }
  
      res.status(200).json({ success: true, data: result.Items });
    } catch (error) {
      console.error('Error searching user by phone:', error);
      res.status(500).json({ success: false, message: 'Lỗi khi tìm kiếm người dùng', error: error.message });
    }
  }
  
  

 
};

module.exports = UserController;
