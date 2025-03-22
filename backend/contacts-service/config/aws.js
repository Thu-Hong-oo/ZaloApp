const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_KEY_ID
});

console.log('Region:', process.env.REGION);
console.log('Access Key ID:', process.env.ACCESS_KEY_ID);
console.log('Secret Key ID:', process.env.SECRET_KEY_ID ? 'Loaded' : 'Not Loaded');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

console.log('DynamoDB instance aws:', dynamoDB);

module.exports = { dynamoDB, s3 };
