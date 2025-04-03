const app = require('./app');
const { dynamoDB } = require('./config/aws'); // Import trực tiếp DynamoDB từ aws.js
const logger = require('./utils/loggerUtil');

const PORT = process.env.PORT || 3001;
const USERS_TABLE = 'user';

// Hàm kiểm tra và tạo bảng nếu chưa có
const initDatabase = async () => {
  try {
    await dynamoDB.describeTable({ TableName: USERS_TABLE }).promise();
    console.log(`Bảng ${USERS_TABLE} đã tồn tại.`);
  } catch (error) {
    if (error.code === 'ResourceNotFoundException') {
      console.log(`Tạo bảng ${USERS_TABLE}...`);
      
      const params = {
        TableName: USERS_TABLE,
        KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'userId', AttributeType: 'S' }],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      };

      await dynamoDB.createTable(params).promise();
      console.log(`Bảng ${USERS_TABLE} đã được tạo thành công.`);
    } else {
      console.error('Lỗi kiểm tra bảng:', error);
      throw error;
    }
  }
};

// Khởi động server
const startServer = async () => {
  try {
    // Kiểm tra database
    await initDatabase();
    
    // Khởi động server
    app.listen(PORT, () => {
      logger.info(`Account Service đang chạy trên cổng ${PORT}`);
    });
  } catch (error) {
    logger.error(`Không thể khởi động server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
