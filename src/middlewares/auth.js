const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            req.user = null;
            return next();
        }

        const token = authHeader.split(' ')[1]; // Bearer <token>
        if (!token) {
            req.user = null;
            return next();
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await prisma.users.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    isGuest: true,
                    tenantId: true
                }
            });

            if (!user) {
                req.user = null;
                return next();
            }

            req.user = user;
            next();
        } catch (err) {
            req.user = null;
            next();
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        req.user = null;
        next();
    }
};

const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            error: 'Authentication required' 
        });
    }
    next();
};

module.exports = { 
    authenticateUser,
    requireAuth 
}; 