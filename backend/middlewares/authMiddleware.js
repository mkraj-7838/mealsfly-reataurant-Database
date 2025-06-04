const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
require('dotenv').config();

const verifyToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const admin = await Admin.findById(decoded.id);
        
        if (!admin) {
            return res.status(401).json({ message: 'Invalid token.' });
        }
        
        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

module.exports = verifyToken;