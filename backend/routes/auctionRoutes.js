const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createAuction,
  placeBid,
  finalizeAuction,
  getAuctions,
  getAuctionById,
} = require('../controllers/auctionController');

const router = express.Router();

router.route('/')
  .get(protect, getAuctions)
  .post(protect, createAuction);

router.post('/:auctionId/bids', protect, placeBid);
router.post('/:auctionId/finalize', protect, finalizeAuction);
router.get('/:id', protect, getAuctionById);

module.exports = router;
