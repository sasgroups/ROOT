const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getChitGroups,
  createChitGroup,
  getChitGroupById,
  addMemberToChit,
  recordPayment,
  getPaymentsByChit,
} = require('../controllers/chitController');

const router = express.Router();

router.route('/')
  .get(protect, getChitGroups)
  .post(protect, createChitGroup);

router.route('/:id')
  .get(protect, getChitGroupById);

router.post('/:chitId/members', protect, addMemberToChit);
router.post('/payments', protect, recordPayment);
router.get('/:chitId/payments', protect, getPaymentsByChit);

module.exports = router;