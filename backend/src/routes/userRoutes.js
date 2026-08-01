const express = require('express');
const router = express.Router();
const { updateUserProfile, getUsers, getAllUsers, updateUserRole, deleteUser, deleteAccount, updateNotifications } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/profile').put(protect, updateUserProfile);
router.route('/notifications').put(protect, updateNotifications);
router.route('/me').delete(protect, deleteAccount);
router.route('/').get(protect, admin, getUsers);
router.route('/all').get(protect, admin, getAllUsers);
router.route('/:id').delete(protect, admin, deleteUser);
router.route('/:id/role').put(protect, admin, updateUserRole);

module.exports = router;
