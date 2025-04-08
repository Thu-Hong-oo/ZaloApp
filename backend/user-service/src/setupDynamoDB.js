require('dotenv').config();
const AWS = require('aws-sdk');

// Cấu hình AWS
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDB = new AWS.DynamoDB();
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

const createTable = async () => {
    try {
        // Kiểm tra xem bảng đã tồn tại chưa
        try {
            await dynamoDB.describeTable({ TableName: TABLE_NAME }).promise();
            console.log(`✅ Bảng ${TABLE_NAME} đã tồn tại`);
            return;
        } catch (error) {
            if (error.code !== 'ResourceNotFoundException') {
                throw error;
            }
        }

        // Tạo bảng với chế độ ON-DEMAND (KHÔNG TỐN PHÍ nếu không dùng)
        const params = {
            TableName: TABLE_NAME,
            KeySchema: [
                { AttributeName: 'phone', KeyType: 'HASH' }  // Primary key
            ],
            AttributeDefinitions: [
                { AttributeName: 'phone', AttributeType: 'S' }
            ],
            BillingMode: "PAY_PER_REQUEST"  // Sử dụng chế độ On-Demand để không tốn phí cố định
        };

        await dynamoDB.createTable(params).promise();
        console.log(`✅ Đã tạo bảng ${TABLE_NAME} thành công`);

        // Đợi bảng chuyển sang trạng thái ACTIVE
        console.log('⏳ Đang đợi bảng được active...');
        await waitForTableActive(TABLE_NAME);
        console.log('✅ Bảng đã sẵn sàng để sử dụng');
    } catch (error) {
        console.error('❌ Lỗi khi tạo bảng:', error);
        throw error;
    }
};

const waitForTableActive = async (tableName) => {
    const maxAttempts = 20;
    const delayMs = 5000; // 5 giây
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            const { Table } = await dynamoDB.describeTable({ TableName: tableName }).promise();
            if (Table.TableStatus === 'ACTIVE') {
                return;
            }
            console.log(`⏳ Trạng thái bảng: ${Table.TableStatus}, đang đợi...`);
        } catch (error) {
            console.error('❌ Lỗi khi kiểm tra trạng thái bảng:', error);
        }
        
        await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    throw new Error(`❌ Bảng không chuyển sang trạng thái ACTIVE sau ${maxAttempts} lần thử`);
};

// (Tuỳ chọn) Hàm xóa bảng để tiết kiệm chi phí nếu bạn không dùng nữa
const deleteTable = async () => {
    try {
        await dynamoDB.deleteTable({ TableName: TABLE_NAME }).promise();
        console.log(`🗑️ Đã xóa bảng ${TABLE_NAME} để tránh tốn phí`);
    } catch (error) {
        console.error('❌ Lỗi khi xóa bảng:', error);
    }
};

// Chạy script
createTable().catch(console.error);

// 👉 Nếu chỉ test và không muốn bị tính phí lâu dài, chạy deleteTable() sau khi xong
// setTimeout(deleteTable, 60000); // Xóa bảng sau 60 giây (tuỳ chọn)
