const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Initialize DynamoDB
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

// Initialize S3
const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

module.exports = {
  dynamoDB,
  TABLE_NAME,
  s3,
  BUCKET_NAME
}; 