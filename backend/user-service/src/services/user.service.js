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
        console.log('Creating user with data:', JSON.stringify({...userData, password: '[HIDDEN]'}, null, 2));
        
        // Check if user exists first
        try {
            const existingUser = await this.getUserByPhone(userData.phone);
            console.log('Checking existing user:', existingUser);
            if (existingUser) {
                throw new Error('Phone number already exists');
            }
        } catch (error) {
            // Only rethrow if it's not a "not found" error
            if (error.message === 'Phone number already exists') {
                throw error;
            }
            // If user is not found, continue with creation
            console.log('User not found, proceeding with creation');
        }

        const item = {
            phone: userData.phone,
            name: userData.name || userData.phone,
            password: userData.password,
            status: userData.status || 'online',
            lastSeen: null,
            role: userData.role || 'user',
            createdAt: userData.createdAt || now,
            updatedAt: userData.updatedAt || now
        };

        // Log item to be saved (without password)
        const itemForLog = {...item, password: '[HIDDEN]'};
        console.log('Saving item to DynamoDB:', JSON.stringify(itemForLog, null, 2));

        const params = {
            TableName: TABLE_NAME,
            Item: item
        };

        try {
            await dynamoDB.put(params).promise();
            // Return user data without password
            const { password, ...userWithoutPassword } = item;
            return userWithoutPassword;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    async getUserByPhone(phone) {
        console.log('Getting user by phone:', phone);
        
        const params = {
            TableName: TABLE_NAME,
            Key: { phone }
        };

        try {
            const result = await dynamoDB.get(params).promise();
            console.log('DynamoDB result:', JSON.stringify({...result, Item: result.Item ? {...result.Item, password: '[HIDDEN]'} : null}));
            
            if (!result.Item) {
                console.log('User not found');
                return null;
            }

            return result.Item;
        } catch (error) {
            console.error('Error getting user by phone:', error);
            throw error;
        }
    },

    async updateUser(phone, userData) {
        // Loại bỏ phone khỏi userData vì nó là partition key
        const { phone: _, ...updateData } = userData;

        // Khởi tạo các biến cho DynamoDB expression
        const expressionParts = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};
        let attributeIndex = 0;

        // Xử lý các trường cập nhật
        Object.entries(updateData).forEach(([key, value]) => {
            const nameKey = `#attr${attributeIndex}`;
            const valueKey = `:val${attributeIndex}`;
            expressionParts.push(`${nameKey} = ${valueKey}`);
            expressionAttributeNames[nameKey] = key;
            expressionAttributeValues[valueKey] = value;
            attributeIndex++;
        });

        // Thêm updatedAt
        const updatedAtKey = `#attr${attributeIndex}`;
        const updatedAtValue = `:val${attributeIndex}`;
        expressionParts.push(`${updatedAtKey} = ${updatedAtValue}`);
        expressionAttributeNames[updatedAtKey] = 'updatedAt';
        expressionAttributeValues[updatedAtValue] = new Date().toISOString();

        const params = {
            TableName: TABLE_NAME,
            Key: { phone },
            UpdateExpression: 'SET ' + expressionParts.join(', '),
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        };

        console.log('Update params:', JSON.stringify(params, null, 2));

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