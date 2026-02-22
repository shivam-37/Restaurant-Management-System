const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, simulateNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.post('/simulate', protect, simulateNotification);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
