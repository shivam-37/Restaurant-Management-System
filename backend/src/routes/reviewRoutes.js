const express = require('express');
const { getReviews, addReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(getReviews)
    .post(protect, addReview);

module.exports = router;
