const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const adminRoutes = require('./routes/adminRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const Admin = require('./models/Admin');
require('dotenv').config();
const mongoose = require('mongoose');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
// connectDB();

// Create default admin
// Admin.createDefaultAdmin();

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/restaurants', restaurantRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File size too large. Maximum size is 10MB.' });
        }
    }
    
    res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//     console.log(`Health check: http://localhost:${PORT}/api/health`);
// });

// Connect to MongoDB and initialize
const startServer = async () => {
    try {
        await connectDB();
        
        // Wait for connection to be ready before creating admin
        await mongoose.connection.db.admin().ping();
        
        // Initialize default admin
        await Admin.initializeDefaultAdmin();
        
        // Start server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();