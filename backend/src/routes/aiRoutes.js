const express = require('express');
const router = express.Router();
const { generateDescription, generateOrderInstructions } = require('../controllers/aiController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/generate-description', protect, admin, generateDescription);
router.post('/generate-instructions', protect, generateOrderInstructions);

module.exports = router;
