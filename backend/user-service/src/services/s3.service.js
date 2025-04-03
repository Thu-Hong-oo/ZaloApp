const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

class S3Service {
    static async uploadFile(file, userId) {
        const fileExtension = file.originalname.split('.').pop();
        const key = `avatars/${userId}-${Date.now()}.${fileExtension}`;

        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        };

        try {
            const result = await s3.upload(params).promise();
            return result.Location;
        } catch (error) {
            throw new Error('Error uploading file to S3: ' + error.message);
        }
    }
}

module.exports = S3Service; 