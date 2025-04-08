const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'users';

class User {
    static async create(user) {
        const params = {
            TableName: TABLE_NAME,
            Item: user,
            ConditionExpression: 'attribute_not_exists(phone)'
        };

        try {
            await global.dynamoDB.put(params).promise();
            return user;
        } catch (error) {
            console.error('Error creating user:', error);
            if (error.code === 'ConditionalCheckFailedException') {
                throw new Error('Số điện thoại đã được đăng ký');
            }
            throw error;
        }
    }

    static async getByPhone(phone) {
        const params = {
            TableName: TABLE_NAME,
            IndexName: 'PhoneIndex',
            KeyConditionExpression: 'phone = :phone',
            ExpressionAttributeValues: {
                ':phone': phone
            }
        };

        try {
            const result = await global.dynamoDB.query(params).promise();
            return result.Items[0];
        } catch (error) {
            console.error('Error getting user by phone:', error);
            throw error;
        }
    }

    static async getById(id) {
        const params = {
            TableName: TABLE_NAME,
            Key: { id }
        };

        try {
            const result = await global.dynamoDB.get(params).promise();
            return result.Item;
        } catch (error) {
            console.error('Error getting user by id:', error);
            throw error;
        }
    }

    static async update(id, updateData) {
        const { name, email, phone, avatar, status } = updateData;
        
        let updateExpression = 'set updatedAt = :updatedAt';
        const expressionAttributeValues = {
            ':updatedAt': new Date().toISOString()
        };
        const expressionAttributeNames = {};

        if (name) {
            updateExpression += ', #name = :name';
            expressionAttributeValues[':name'] = name;
            expressionAttributeNames['#name'] = 'name';
        }
        if (email) {
            updateExpression += ', email = :email';
            expressionAttributeValues[':email'] = email;
        }
        if (phone) {
            updateExpression += ', phone = :phone';
            expressionAttributeValues[':phone'] = phone;
        }
        if (avatar) {
            updateExpression += ', avatar = :avatar';
            expressionAttributeValues[':avatar'] = avatar;
        }
        if (status) {
            updateExpression += ', #status = :status';
            expressionAttributeValues[':status'] = status;
            expressionAttributeNames['#status'] = 'status';
        }

        const params = {
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ExpressionAttributeNames: expressionAttributeNames,
            ReturnValues: 'ALL_NEW'
        };

        try {
            const result = await global.dynamoDB.update(params).promise();
            return result.Attributes;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    static async updatePassword(id, hashedPassword) {
        const params = {
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: 'set password = :password, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
                ':password': hashedPassword,
                ':updatedAt': new Date().toISOString()
            },
            ReturnValues: 'ALL_NEW'
        };

        try {
            const result = await global.dynamoDB.update(params).promise();
            return result.Attributes;
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    }

    static async searchUsers(searchTerm) {
        const params = {
            TableName: TABLE_NAME,
            FilterExpression: 'contains(#name, :searchTerm) OR contains(phone, :searchTerm) OR contains(email, :searchTerm)',
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ExpressionAttributeValues: {
                ':searchTerm': searchTerm
            }
        };

        try {
            const result = await global.dynamoDB.scan(params).promise();
            return result.Items;
        } catch (error) {
            console.error('Error searching users:', error);
            throw error;
        }
    }
}

module.exports = User;