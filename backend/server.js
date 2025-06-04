const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const Admin = require('./models/Admin');
const bcrypt = require('bcrypt');
require('dotenv').config();

const adminRoutes = require('./routes/adminRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost', // Adjust to your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create default admin user
const createDefaultAdmin = async () => {
    try {
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const admin = new Admin({
                username: 'admin',
                password: hashedPassword
            });
            await admin.save();
            console.log('Default admin created: username=admin, password=admin123');
        }
    } catch (error) {
        console.error('Error creating default admin:', error.message);
    }
};

// Initialize server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        // Create default admin after DB connection
        await createDefaultAdmin();
        // Routes
        app.use('/api/admin', adminRoutes);
        app.use('/api/restaurants', restaurantRoutes);
        // Health check endpoint
        app.get('/api/health', (req, res) => {
            res.json({ 
                status: 'OK', 
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });
        // 404 handler
        app.use('*', (req, res) => {
            res.status(404).json({ message: 'Route not found' });
        });
        // Error handling middleware
        app.use(errorHandler);
        // Start server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('Server startup error:', error.message);
        process.exit(1);
    }
};

startServer();
