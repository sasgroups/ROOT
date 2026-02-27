const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorize'); // if you have this file
const {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getMyGroups,      // new
  getMyAuctions,    // new
  getMyLedger,      // new
} = require('../controllers/memberController');

const router = express.Router();

// Admin routes
router.route('/')
  .get(protect, authorize('admin'), getMembers)
  .post(protect, authorize('admin'), createMember);

router.route('/:id')
  .get(protect, authorize('admin'), getMemberById)
  .put(protect, authorize('admin'), updateMember)
  .delete(protect, authorize('admin'), deleteMember);

// Member-specific routes (accessible by the logged-in member)
router.get('/my/groups', protect, authorize('member'), getMyGroups);
router.get('/my/auctions', protect, authorize('member'), getMyAuctions);
router.get('/my/ledger', protect, authorize('member'), getMyLedger);

module.exports = router;