const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Invalid token format' });
        }

        console.log('Using JWT secret:', global.jwtSecret); // Debug log
        console.log('Token to verify:', token); // Debug log

        const decoded = jwt.verify(token, global.jwtSecret);
        console.log('Decoded token:', decoded); // Debug log

        // Kiểm tra xem token có chứa phone không
        if (!decoded.sub) {
            return res.status(401).json({ message: 'Token does not contain phone number' });
        }

        // Gán phone vào request để các middleware và controller sau có thể sử dụng
        req.user = {
            phone: decoded.sub
        };

        next();
    } catch (error) {
        console.error('Token verification error:', error); // Debug log
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token signature' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        } else {
            return res.status(401).json({ message: 'Invalid token' });
        }
    }
};

module.exports = authMiddleware; 