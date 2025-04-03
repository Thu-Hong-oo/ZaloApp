const express = require('express');
const cors = require('cors');
const { Eureka } = require('eureka-js-client');
const userRoutes = require('./routes/user.routes');
const WebSocketServer = require('./websocket/server');
const http = require('http');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Eureka client configuration
const eurekaClient = new Eureka({
    instance: {
        app: 'user-service',
        hostName: 'localhost',
        ipAddr: '127.0.0.1',
        port: {
            '$': process.env.PORT || 3001,
            '@enabled': true,
        },
        vipAddress: 'user-service',
        dataCenterInfo: {
            '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
            name: 'MyOwn',
        },
    },
    eureka: {
        host: 'localhost',
        port: 8761,
        servicePath: '/eureka/apps/',
    },
});

// Connect to Eureka server
eurekaClient.start(error => {
    console.log(error || 'Connected to Eureka Server');
});

// Routes
app.use('/api/users', userRoutes);

// Health check endpoint for Eureka
app.get('/health', (req, res) => {
    res.json({ status: 'UP' });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer(server);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`User service is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received');
    eurekaClient.stop();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});