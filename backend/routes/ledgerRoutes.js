const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMemberLedger } = require('../controllers/ledgerController');

const router = express.Router();

router.get('/:memberId', protect, getMemberLedger);

module.exports = router;