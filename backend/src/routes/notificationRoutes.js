const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, simulateNotification, pushNotification, clearNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.delete('/', protect, clearNotifications);
router.post('/simulate', protect, simulateNotification);
router.post('/push', protect, pushNotification);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
