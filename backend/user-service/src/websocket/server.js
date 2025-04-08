const WebSocket = require('ws');
const userService = require('../services/user.service');

class WebSocketServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map(); // Map để lưu trữ kết nối WebSocket của mỗi user
        this.heartbeatInterval = 30000; // 30 seconds

        this.wss.on('connection', this.handleConnection.bind(this));
        
        // Kiểm tra heartbeat định kỳ
        setInterval(() => {
            this.checkConnections();
        }, this.heartbeatInterval);
    }

    handleConnection(ws) {
        console.log('New client connected');
        ws.isAlive = true;

        // Setup ping-pong
        ws.on('pong', () => {
            ws.isAlive = true;
            console.log('Client responded to ping');
        });

        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);
                console.log('Received message:', data);
                
                switch (data.type) {
                    case 'auth':
                        console.log('Processing auth request for phone:', data.phone);
                        await this.handleAuth(ws, data.phone);
                        break;
                    
                    case 'status':
                        console.log('Processing status update:', data.status, 'for phone:', data.phone);
                        await this.handleStatusUpdate(ws, data.phone, data.status);
                        break;

                    case 'pong':
                        ws.isAlive = true;
                        console.log('Received pong from client');
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
            console.log('Client disconnected');
            // Tìm và cập nhật trạng thái offline cho user khi đóng kết nối
            for (const [phone, client] of this.clients.entries()) {
                if (client === ws) {
                    console.log('Setting status to offline for phone:', phone);
                    await this.handleStatusUpdate(ws, phone, 'offline');
                    this.clients.delete(phone);
                    break;
                }
            }
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    }

    async checkConnections() {
        for (const [phone, ws] of this.clients.entries()) {
            if (!ws.isAlive) {
                // Nếu client không phản hồi ping, đánh dấu là offline
                await this.handleStatusUpdate(ws, phone, 'offline');
                this.clients.delete(phone);
                ws.terminate();
                continue;
            }

            ws.isAlive = false;
            ws.ping();
        }
    }

    async handleAuth(ws, phone) {
        try {
            const user = await userService.getUserByPhone(phone);
            if (!user) {
                throw new Error('User not found');
            }

            // Xóa kết nối cũ nếu có
            const existingWs = this.clients.get(phone);
            if (existingWs) {
                existingWs.terminate();
                this.clients.delete(phone);
            }

            // Lưu kết nối WebSocket mới cho user này
            this.clients.set(phone, ws);
            ws.isAlive = true;

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
            // Validate status
            if (!['online', 'offline', 'away'].includes(status)) {
                throw new Error('Invalid status');
            }

            // Cập nhật trạng thái trong database
            const lastSeen = status === 'offline' ? new Date().toISOString() : null;
            const updateData = { 
                status,
                lastSeen,
                updatedAt: new Date().toISOString()
            };

            await userService.updateUser(phone, updateData);

            // Gửi thông báo cho tất cả client khác
            this.broadcastStatus(phone, status);

            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'status',
                    success: true,
                    data: { status }
                }));
            }
        } catch (error) {
            console.error('Error updating status:', error);
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'status',
                    success: false,
                    message: error.message
                }));
            }
        }
    }

    broadcastStatus(phone, status) {
        const message = JSON.stringify({
            type: 'userStatus',
            data: {
                phone,
                status,
                timestamp: new Date().toISOString()
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