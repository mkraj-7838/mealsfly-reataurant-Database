const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // Removed deprecated options: useNewUrlParser, useUnifiedTopology
            serverSelectionTimeoutMS: 30000, // Increase timeout to 30s
            connectTimeoutMS: 30000, // Increase connection timeout
        });
        console.log(`Connected to MongoDB: ${conn.connection.host}`);
        return conn; // Return connection for further use if needed
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1); // Exit process on failure
    }
};

module.exports = connectDB;
