const WebSocket = require('ws');
const userService = require('../services/user.service');

class WebSocketServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map(); // Map để lưu trữ kết nối WebSocket của mỗi user

        this.wss.on('connection', this.handleConnection.bind(this));
    }

    handleConnection(ws) {
        console.log('New client connected');

        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);
                
                switch (data.type) {
                    case 'auth':
                        // Xác thực user và lưu kết nối
                        await this.handleAuth(ws, data.phone);
                        break;
                    
                    case 'status':
                        // Cập nhật trạng thái
                        await this.handleStatusUpdate(ws, data.phone, data.status);
                        break;
                }
            } catch (error) {
                console.error('WebSocket message error:', error);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: error.message
                }));
            }
        });

        ws.on('close', async () => {
            // Tìm và cập nhật trạng thái offline cho user khi đóng kết nối
            for (const [phone, client] of this.clients.entries()) {
                if (client === ws) {
                    await this.handleStatusUpdate(ws, phone, 'offline');
                    this.clients.delete(phone);
                    break;
                }
            }
        });

        ws.on('error', console.error);
    }

    async handleAuth(ws, phone) {
        try {
            const user = await userService.getUserByPhone(phone);
            if (!user) {
                throw new Error('User not found');
            }

            // Lưu kết nối WebSocket cho user này
            this.clients.set(phone, ws);

            // Cập nhật trạng thái online
            await this.handleStatusUpdate(ws, phone, 'online');

            ws.send(JSON.stringify({
                type: 'auth',
                success: true,
                message: 'Authentication successful'
            }));
        } catch (error) {
            ws.send(JSON.stringify({
                type: 'auth',
                success: false,
                message: error.message
            }));
        }
    }

    async handleStatusUpdate(ws, phone, status) {
        try {
            // Cập nhật trạng thái trong database
            const lastSeen = status === 'offline' ? new Date().toISOString() : null;
            await userService.updateUser(phone, { status, lastSeen });

            // Gửi thông báo cho tất cả client khác
            this.broadcastStatus(phone, status);

            ws.send(JSON.stringify({
                type: 'status',
                success: true,
                data: { status }
            }));
        } catch (error) {
            ws.send(JSON.stringify({
                type: 'status',
                success: false,
                message: error.message
            }));
        }
    }

    broadcastStatus(phone, status) {
        const message = JSON.stringify({
            type: 'userStatus',
            data: {
                phone,
                status
            }
        });

        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN && client !== this.clients.get(phone)) {
                client.send(message);
            }
        });
    }
}

module.exports = WebSocketServer; 