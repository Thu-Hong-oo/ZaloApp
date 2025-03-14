const {dynamoDB}= require('../config/aws');
console.log('DynamoDB instance in userModel:', dynamoDB);

const TABLE_NAME = 'user';


const UserModel = {
  createUser: (user) => {
    const params = {
      TableName: TABLE_NAME,
      Item: user
    };
    return dynamoDB.put(params).promise();
  },

  getUserById: (userid) => {
    const params = {
      TableName: TABLE_NAME,
      Key: { userid }
    };
    return dynamoDB.get(params).promise();
  },

  updateUser: (userid, updates) => {
    const params = {
      TableName: TABLE_NAME,
      Key: { userid },
      ...updates,
      ReturnValues: 'ALL_NEW'
    };
    return dynamoDB.update(params).promise();
  },

  deleteUser: (userid) => {
    const params = {
      TableName: TABLE_NAME,
      Key: { userid }
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
  }
};

module.exports = UserModel;
