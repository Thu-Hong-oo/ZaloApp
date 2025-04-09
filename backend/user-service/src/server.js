const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const WebSocketServer = require('./websocket/server');
const http = require('http');
const eureka = require('./eureka');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:8000', 'http://localhost:8001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

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
server.listen(PORT, async () => {
    console.log(`User service is running on port ${PORT}`);
    
    // Register with Eureka
    try {
        await eureka.start();
        console.log('Successfully registered with Eureka');
    } catch (error) {
        console.error('Failed to register with Eureka:', error);
    }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received');
    try {
        await eureka.stop();
        console.log('Successfully de-registered from Eureka');
    } catch (error) {
        console.error('Error de-registering from Eureka:', error);
    }
    
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});