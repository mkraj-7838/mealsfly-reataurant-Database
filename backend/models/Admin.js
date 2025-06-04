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

// Create default admin user
adminSchema.statics.createDefaultAdmin = async function() {
    try {
        const existingAdmin = await this.findOne({ username: 'admin' });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const admin = new this({
                username: 'admin',
                password: hashedPassword
            });
            await admin.save();
            console.log('Default admin created: username=admin, password=admin123');
        }
    } catch (error) {
        console.error('Error creating default admin:', error);
    }
};

module.exports = mongoose.model('Admin', adminSchema);