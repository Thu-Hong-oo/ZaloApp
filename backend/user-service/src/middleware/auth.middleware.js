const axios = require('axios');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ 
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false, 
                message: 'Invalid token format'
            });
        }

        try {
            // Forward request to auth-service with the same token
            const response = await axios.get('http://localhost:8080/api/auth/validate-token', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data && response.data.success) {
                // Token is valid, extract user info
                req.user = {
                    phone: response.data.data.phone,
                    role: response.data.data.role || 'user'
                };
                next();
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            }
        } catch (error) {
            console.error('Token validation error:', error.response?.data || error.message);
            return res.status(401).json({
                success: false,
                message: 'Token validation failed',
                error: error.response?.data?.message || error.message
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: User role not found'
            });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Admin role required'
            });
        }

        next();
    } catch (error) {
        console.error('Admin check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error checking admin privileges',
            error: error.message
        });
    }
};

module.exports = {
    authMiddleware,
    isAdmin
}; 