const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const verifyToken = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

// Public routes
router.post('/', upload.fields([
    { name: 'foodLicense', maxCount: 1 },
    { name: 'menuSheet', maxCount: 1 }
]), restaurantController.createRestaurant);

// Admin protected routes
router.get('/', verifyToken, restaurantController.getAllRestaurants);
router.get('/:id', verifyToken, restaurantController.getRestaurant);
router.put('/:id', verifyToken, restaurantController.updateRestaurant);
router.delete('/:id', verifyToken, restaurantController.deleteRestaurant);
router.patch('/:id/status', verifyToken, restaurantController.updateRestaurantStatus);
router.get('/search/:query', verifyToken, restaurantController.searchRestaurants);
router.get('/admin/dashboard-stats', verifyToken, restaurantController.getDashboardStats);

module.exports = router;