const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  generateSubscriptions,
  getSubscriptions,
  paySubscription,
} = require('../controllers/subscriptionController');

const router = express.Router();

router.route('/')
  .get(protect, getSubscriptions)
  .post(protect, generateSubscriptions);

router.post('/pay', protect, paySubscription);

module.exports = router;