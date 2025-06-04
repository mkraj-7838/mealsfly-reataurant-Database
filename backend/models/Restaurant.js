const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    restaurantName: {
        type: String,
        required: true,
        trim: true
    },
    ownerName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    businessEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    restaurantAddress: {
        type: String,
        required: true,
        trim: true
    },
    operatingHours: {
        type: String,
        required: true,
        trim: true
    },
    cuisineType: {
        type: String,
        required: true,
        enum: ['Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Continental', 'Fast Food', 'Multi-Cuisine']
    },
    foodLicenseUrl: {
        type: String,
        required: true
    },
    menuSheetUrl: {
        type: String,
        required: true
    },
    foodLicensePublicId: {
        type: String,
        required: true
    },
    menuSheetPublicId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Restaurant', restaurantSchema);