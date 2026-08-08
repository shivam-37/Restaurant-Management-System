const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Get all approved reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res) => {
    try {
        const query = { status: 'approved' };
        if (req.query.restaurantId) {
            query.restaurant = req.query.restaurantId;
        } else {
            query.restaurant = null;
        }

        const reviews = await Review.find(query)
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(10);
            
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res) => {
    try {
        const { rating, comment, restaurantId } = req.body;
        const userId = req.user.id;
        const role = req.user.role;

        if (!rating || !comment) {
            return res.status(400).json({ success: false, error: 'Please provide rating and comment' });
        }

        const review = await Review.create({
            user: userId,
            restaurant: restaurantId || null,
            rating,
            comment,
            role
        });

        // Update restaurant average rating if applicable
        if (restaurantId) {
            const Restaurant = require('../models/Restaurant');
            const resReviews = await Review.find({ restaurant: restaurantId, status: 'approved' });
            const avgRating = resReviews.reduce((acc, r) => acc + r.rating, 0) / resReviews.length;
            await Restaurant.findByIdAndUpdate(restaurantId, { rating: avgRating });
        }

        const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

        res.status(201).json({ success: true, data: populatedReview });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
