const { LedgerEntry, Member } = require('../models');

// @desc    Get ledger for a member
// @route   GET /api/ledger/:memberId
// @access  Private (member or admin)
const getMemberLedger = async (req, res) => {
  try {
    const member = await Member.findById(req.params.memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const entries = await LedgerEntry.find({ member: req.params.memberId })
      .populate('chitGroup', 'name')
      .sort('-transactionDate');

    // Compute running balance
    let balance = 0;
    const ledgerWithBalance = entries.map(entry => {
      balance += (entry.credit - entry.debit);
      return { ...entry.toObject(), balance };
    }).reverse(); // chronological

    res.json(ledgerWithBalance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMemberLedger,
};