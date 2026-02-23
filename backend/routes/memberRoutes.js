const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
} = require('../controllers/memberController');

const router = express.Router();

router.route('/')
  .get(protect, getMembers)
  .post(protect, createMember);

router.route('/:id')
  .get(protect, getMemberById)
  .put(protect, updateMember)
  .delete(protect, deleteMember);

module.exports = router;                