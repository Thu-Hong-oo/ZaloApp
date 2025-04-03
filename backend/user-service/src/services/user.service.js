const { dynamoDB } = require('../config/aws');
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'users-zalolite';

// Service functions
const userService = {
    async createUser(userData) {
        if (!userData.phone) {
            throw new Error('Phone number is required');
        }

        const now = new Date().toISOString();
        
        // Log input data
        console.log('Creating user with data:', JSON.stringify(userData, null, 2));
        
        const item = {
            phone: userData.phone,
            name: userData.name || userData.phone,
            status: userData.status, // Không ghi đè status
            lastSeen: null,
            role: userData.role || 'user',
            createdAt: userData.createdAt || now,
            updatedAt: userData.updatedAt || now
        };

        // Log item to be saved
        console.log('Saving item to DynamoDB:', JSON.stringify(item, null, 2));

        const params = {
            TableName: TABLE_NAME,
            Item: item,
            ConditionExpression: 'attribute_not_exists(phone)'
        };

        try {
            await dynamoDB.put(params).promise();
            return item;
        } catch (error) {
            if (error.code === 'ConditionalCheckFailedException') {
                throw new Error('Phone number already exists');
            }
            throw error;
        }
    },

    async getUserByPhone(phone) {
        const params = {
            TableName: TABLE_NAME,
            Key: { phone }
        };

        try {
            const result = await dynamoDB.get(params).promise();
            return result.Item;
        } catch (error) {
            console.error('Error getting user by phone:', error);
            throw error;
        }
    },

    async updateUser(phone, userData) {
        const updateExpressions = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        // Loại bỏ phone khỏi userData vì nó là partition key
        const { phone: _, ...updateData } = userData;

        Object.keys(updateData).forEach((key) => {
            updateExpressions.push(`#${key} = :${key}`);
            expressionAttributeNames[`#${key}`] = key;
            expressionAttributeValues[`:${key}`] = updateData[key];
        });

        // Thêm updatedAt
        updateExpressions.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeValues[':updatedAt'] = new Date().toISOString();

        const params = {
            TableName: TABLE_NAME,
            Key: { phone },
            UpdateExpression: `set ${updateExpressions.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        };

        try {
            const result = await dynamoDB.update(params).promise();
            return result.Attributes;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    async deleteUser(phone) {
        const params = {
            TableName: TABLE_NAME,
            Key: { phone }
        };

        try {
            await dynamoDB.delete(params).promise();
            return { phone };
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

    async listUsers() {
        const params = {
            TableName: TABLE_NAME
        };

        try {
            const result = await dynamoDB.scan(params).promise();
            return result.Items;
        } catch (error) {
            console.error('Error listing users:', error);
            throw error;
        }
    }
};

module.exports = userService; 