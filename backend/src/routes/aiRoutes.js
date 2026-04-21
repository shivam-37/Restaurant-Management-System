const express = require('express');
const router = express.Router();
const { generateDescription, generateOrderInstructions, getRecommendations, predictInventory, chatWithNvidia, generateFullMenuItem } = require('../controllers/aiController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/generate-description', protect, admin, generateDescription);
router.post('/generate-instructions', protect, generateOrderInstructions);
router.post('/recommendations', protect, getRecommendations);
router.post('/predict-inventory', protect, admin, predictInventory);
router.post('/chat', protect, chatWithNvidia);
router.post('/generate-full-item', protect, admin, generateFullMenuItem);

module.exports = router;
