const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

// Create default admin user only after DB connection is established
adminSchema.statics.initializeDefaultAdmin = async function() {
    try {
        // Wait for mongoose connection to be ready
        await mongoose.connection.db.admin().ping();
        
        const existingAdmin = await this.findOne({ username: 'admin' });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const admin = new this({
                username: 'admin',
                password: hashedPassword
            });
            await admin.save();
            console.log('Default admin created: username=admin, password=admin123');
            return true;
        }
        console.log('Default admin already exists');
        return false;
    } catch (error) {
        console.error('Error initializing default admin:', error);
        return false;
    }
};

module.exports = mongoose.model('Admin', adminSchema);