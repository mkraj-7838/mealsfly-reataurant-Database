const Restaurant = require('../models/Restaurant');
const cloudinary = require('../config/cloudinary');

exports.createRestaurant = async (req, res) => {
    try {
        const {
            restaurantName,
            ownerName,
            phoneNumber,
            businessEmail,
            restaurantAddress,
            operatingHours,
            cuisineType
        } = req.body;

        // Validate required fields
        if (!restaurantName || !ownerName || !phoneNumber || !businessEmail || 
            !restaurantAddress || !operatingHours || !cuisineType) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if files are uploaded
        if (!req.files?.foodLicense || !req.files?.menuSheet) {
            return res.status(400).json({ message: 'Food license and menu sheet are required' });
        }

        // Check if restaurant already exists
        const existingRestaurant = await Restaurant.findOne({ 
            businessEmail: businessEmail.toLowerCase() 
        });
        
        if (existingRestaurant) {
            return res.status(400).json({ message: 'Restaurant with this email already exists' });
        }

        const restaurant = new Restaurant({
            restaurantName,
            ownerName,
            phoneNumber,
            businessEmail: businessEmail.toLowerCase(),
            restaurantAddress,
            operatingHours,
            cuisineType,
            foodLicenseUrl: req.files.foodLicense[0].path,
            menuSheetUrl: req.files.menuSheet[0].path,
            foodLicensePublicId: req.files.foodLicense[0].filename,
            menuSheetPublicId: req.files.menuSheet[0].filename
        });

        await restaurant.save();

        res.status(201).json({
            message: 'Restaurant registered successfully',
            restaurant: {
                id: restaurant._id,
                restaurantName: restaurant.restaurantName,
                ownerName: restaurant.ownerName,
                status: restaurant.status
            }
        });
    } catch (error) {
        console.error('Restaurant creation error:', error);
        
        // Clean up uploaded files if restaurant creation fails
        if (req.files) {
            if (req.files.foodLicense) {
                cloudinary.uploader.destroy(req.files.foodLicense[0].filename);
            }
            if (req.files.menuSheet) {
                cloudinary.uploader.destroy(req.files.menuSheet[0].filename);
            }
        }
        
        res.status(500).json({ message: 'Error registering restaurant' });
    }
};

exports.getAllRestaurants = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const restaurants = await Restaurant.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Restaurant.countDocuments();

        res.json({
            restaurants,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalRestaurants: total
        });
    } catch (error) {
        console.error('Get restaurants error:', error);
        res.status(500).json({ message: 'Error fetching restaurants' });
    }
};

exports.getRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        res.json(restaurant);
    } catch (error) {
        console.error('Get restaurant error:', error);
        res.status(500).json({ message: 'Error fetching restaurant' });
    }
};

exports.updateRestaurant = async (req, res) => {
    try {
        const {
            restaurantName,
            ownerName,
            phoneNumber,
            businessEmail,
            restaurantAddress,
            operatingHours,
            cuisineType,
            status
        } = req.body;

        const restaurant = await Restaurant.findById(req.params.id);
        
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Update fields
        restaurant.restaurantName = restaurantName || restaurant.restaurantName;
        restaurant.ownerName = ownerName || restaurant.ownerName;
        restaurant.phoneNumber = phoneNumber || restaurant.phoneNumber;
        restaurant.businessEmail = businessEmail?.toLowerCase() || restaurant.businessEmail;
        restaurant.restaurantAddress = restaurantAddress || restaurant.restaurantAddress;
        restaurant.operatingHours = operatingHours || restaurant.operatingHours;
        restaurant.cuisineType = cuisineType || restaurant.cuisineType;
        restaurant.status = status || restaurant.status;

        await restaurant.save();

        res.json({
            message: 'Restaurant updated successfully',
            restaurant
        });
    } catch (error) {
        console.error('Update restaurant error:', error);
        res.status(500).json({ message: 'Error updating restaurant' });
    }
};

exports.deleteRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Delete files from Cloudinary
        try {
            await cloudinary.uploader.destroy(restaurant.foodLicensePublicId);
            await cloudinary.uploader.destroy(restaurant.menuSheetPublicId);
        } catch (cloudinaryError) {
            console.error('Error deleting files from Cloudinary:', cloudinaryError);
        }

        await Restaurant.findByIdAndDelete(req.params.id);

        res.json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
        console.error('Delete restaurant error:', error);
        res.status(500).json({ message: 'Error deleting restaurant' });
    }
};

exports.updateRestaurantStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const restaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        res.json({
            message: 'Restaurant status updated successfully',
            restaurant
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ message: 'Error updating restaurant status' });
    }
};

exports.searchRestaurants = async (req, res) => {
    try {
        const query = req.params.query;
        const searchRegex = new RegExp(query, 'i');

        const restaurants = await Restaurant.find({
            $or: [
                { restaurantName: searchRegex },
                { ownerName: searchRegex },
                { businessEmail: searchRegex },
                { cuisineType: searchRegex },
                { phoneNumber: searchRegex }
            ]
        }).sort({ createdAt: -1 });

        res.json(restaurants);
    } catch (error) {
        console.error('Search restaurants error:', error);
        res.status(500).json({ message: 'Error searching restaurants' });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const totalRestaurants = await Restaurant.countDocuments();
        const pendingRestaurants = await Restaurant.countDocuments({ status: 'pending' });
        const approvedRestaurants = await Restaurant.countDocuments({ status: 'approved' });
        const rejectedRestaurants = await Restaurant.countDocuments({ status: 'rejected' });

        // Get recent registrations (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentRegistrations = await Restaurant.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // Get cuisine type distribution
        const cuisineStats = await Restaurant.aggregate([
            {
                $group: {
                    _id: '$cuisineType',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        res.json({
            totalRestaurants,
            pendingRestaurants,
            approvedRestaurants,
            rejectedRestaurants,
            recentRegistrations,
            cuisineStats
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
};