const AWS = require('aws-sdk');
require('dotenv').config();

// Log để debug
console.log('AWS Config:', {
    region: process.env.AWS_REGION,
    hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
    hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_S3_BUCKET
});

// Configure AWS with explicit credentials
const awsConfig = {
    region: process.env.AWS_REGION || 'ap-southeast-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
};

AWS.config.update(awsConfig);

// Initialize DynamoDB with the same config
const dynamoDB = new AWS.DynamoDB.DocumentClient(awsConfig);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

// Initialize S3 with the same config
const s3 = new AWS.S3(awsConfig);
const BUCKET_NAME = process.env.AWS_S3_BUCKET;

module.exports = {
    dynamoDB,
    TABLE_NAME,
    s3,
    BUCKET_NAME
}; 