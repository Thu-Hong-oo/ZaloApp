const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const { Eureka } = require('eureka-js-client');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const eureka = require('./eureka');
const axios = require('axios');

// Load environment variables
dotenv.config();

// Configure AWS
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Tạo DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// Export để các module khác có thể sử dụng
global.dynamoDB = dynamoDB;
global.s3 = s3;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Function to get JWT secret from auth-service
async function getJwtSecret() {
    const maxRetries = 5;
    const retryDelay = 2000; // 2 seconds
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log(`Attempt ${i + 1} to fetch JWT secret...`);
            const response = await axios.get('http://localhost:8080/api/auth/jwt-secret');
            
            if (response.data && response.data.secret) {
                console.log('Successfully received JWT secret');
                global.jwtSecret = response.data.secret;
                return response.data.secret;
            } else {
                throw new Error('No JWT secret in response');
            }
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error.message);
            lastError = error;
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }

    console.error('All attempts to fetch JWT secret failed');
    global.jwtSecret = process.env.JWT_SECRET;
    throw lastError;
}

// Initialize JWT secret as a global variable
global.jwtSecret = process.env.JWT_SECRET;

// Make JWT secret available to routes
app.use((req, res, next) => {
    req.jwtSecret = global.jwtSecret;
    next();
});

// Start fetching JWT secret
(async () => {
    try {
        await getJwtSecret();
        console.log('JWT secret initialized successfully');
    } catch (error) {
        console.error('Failed to initialize JWT secret:', error.message);
        console.log('Using default JWT secret from environment');
    }
})();

// Periodically refresh JWT secret
setInterval(async () => {
    try {
        await getJwtSecret();
        console.log('JWT secret refreshed successfully');
    } catch (error) {
        console.error('Failed to refresh JWT secret:', error.message);
    }
}, 60000); // Refresh every minute

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint cho Eureka
app.get('/health', (req, res) => {
    res.json({ status: 'UP' });
});

// Initialize server
async function startServer() {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        eureka.start();
    });
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    eureka.stop();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    eureka.stop();
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    eureka.stop();
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    eureka.stop();
    process.exit(1);
});