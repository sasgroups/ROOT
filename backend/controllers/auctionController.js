const { Auction, Bid, ChitGroup, ChitMember, Member, Dividend, Subscription, AuditLog,LedgerEntry  } = require('../models');
const mongoose = require('mongoose');

// @desc    Create a new auction for a chit group and month
// @route   POST /api/auctions
// @access  Private (admin/staff)
const createAuction = async (req, res) => {
  const { chitGroupId, monthNumber, auctionDate } = req.body;
  try {
    const chitGroup = await ChitGroup.findById(chitGroupId);
    if (!chitGroup) return res.status(404).json({ message: 'Chit group not found' });

    // Check if auction already exists for this month
    const existing = await Auction.findOne({ chitGroup: chitGroupId, monthNumber });
    if (existing) return res.status(400).json({ message: 'Auction already exists for this month' });

    const auction = await Auction.create({
      chitGroup: chitGroupId,
      monthNumber,
      auctionDate,
      status: 'scheduled',
    });

    // Audit log
    await AuditLog.create({
      user: req.user._id,
      action: 'CREATE_AUCTION',
      collection: 'auctions',
      documentId: auction._id,
      newData: auction.toObject(),
      ipAddress: req.ip,
    });

    res.status(201).json(auction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Place a bid
// @route   POST /api/auctions/:auctionId/bids
// @access  Private (member or staff)
const placeBid = async (req, res) => {
  const { auctionId } = req.params;
  const { memberId, bidAmount } = req.body;
  try {
    const auction = await Auction.findById(auctionId).populate('chitGroup');
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.status !== 'scheduled' && auction.status !== 'in_progress') {
      return res.status(400).json({ message: 'Auction not open for bidding' });
    }

    // Check if member is part of the chit group
    const chitMember = await ChitMember.findOne({ chitGroup: auction.chitGroup._id, member: memberId });
    if (!chitMember) return res.status(403).json({ message: 'Member not in this chit group' });

    // Check if member has paid current month's subscription (optional)
    // You can add logic here

    const bid = await Bid.create({
      auction: auctionId,
      member: memberId,
      bidAmount,
      ipAddress: req.ip,
    });

    // Optionally update auction status to in_progress if not already
    if (auction.status === 'scheduled') {
      auction.status = 'in_progress';
      await auction.save();
    }

    // Audit log
    await AuditLog.create({
      user: req.user._id,
      action: 'PLACE_BID',
      collection: 'bids',
      documentId: bid._id,
      newData: bid.toObject(),
      ipAddress: req.ip,
    });

    res.status(201).json(bid);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Finalize auction: determine winner, calculate dividends, etc.
// @route   POST /api/auctions/:auctionId/finalize
// @access  Private (admin/staff)
const finalizeAuction = async (req, res) => {
  const { auctionId } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const auction = await Auction.findById(auctionId).populate('chitGroup').session(session);
    if (!auction) throw new Error('Auction not found');
    if (auction.status !== 'in_progress') throw new Error('Auction not in progress');

    // Get all bids for this auction
    const bids = await Bid.find({ auction: auctionId }).sort({ bidAmount: 1, placedAt: 1 }).session(session);
    if (bids.length === 0) throw new Error('No bids placed');

    // Determine winner (lowest bid, earliest if tie)
    const winningBid = bids[0];
    const winnerMemberId = winningBid.member;

    // Calculate discount, commission, net discount
    const totalAmount = auction.chitGroup.totalAmount;
    const discount = totalAmount - winningBid.bidAmount;
    const commissionPercent = auction.chitGroup.commissionPercent || 5;
    const commissionAmount = (discount * commissionPercent) / 100;
    const netDiscount = discount - commissionAmount;

    // Number of members excluding winner? Usually all members get dividend, but winner gets net discount? We'll follow typical: dividend per member = netDiscount / (totalMembers - 1) if winner excluded. But let's keep simple: all members including winner? Actually winner takes the prize money, others get dividend. We'll assume dividend for all non-winning members.
    const chitMembers = await ChitMember.find({ chitGroup: auction.chitGroup._id }).session(session);
    const totalMembers = chitMembers.length;
    if (totalMembers < 2) throw new Error('Not enough members');

    // Dividend per member (excluding winner)
    const dividendAmount = netDiscount / (totalMembers - 1);

    // Update auction
    auction.winnerMember = winnerMemberId;
    auction.winningBidAmount = winningBid.bidAmount;
    auction.discount = discount;
    auction.commissionAmount = commissionAmount;
    auction.netDiscount = netDiscount;
    auction.dividendPerMember = dividendAmount;
    auction.status = 'completed';
    auction.finalizedBy = req.user._id;
    auction.finalizedAt = new Date();
    await auction.save({ session });

    // Mark winning bid
    winningBid.isWinning = true;
    await winningBid.save({ session });

    // Create dividend entries for all non-winning members
    const dividendPromises = chitMembers
      .filter(cm => cm.member.toString() !== winnerMemberId.toString())
      .map(cm => Dividend.create([{
        auction: auctionId,
        member: cm.member,
        amount: dividendAmount,
        distributedDate: new Date(),
        adjustmentType: 'adjust_next_subscription', // or cash
        remarks: `Dividend for month ${auction.monthNumber}`,
      }], { session }));

    await Promise.all(dividendPromises);

    // Update subscriptions for the month: mark winner's subscription as "taken" or adjust? Usually winner's subscription for that month is considered paid by the prize. We'll mark winner's subscription as paid automatically.
    const winnerSubscription = await Subscription.findOne({
      chitGroup: auction.chitGroup._id,
      member: winnerMemberId,
      monthNumber: auction.monthNumber,
    }).session(session);
    if (winnerSubscription) {
      winnerSubscription.status = 'paid';
      winnerSubscription.paidAmount = auction.chitGroup.monthlyContribution;
      winnerSubscription.paidDate = new Date();
      winnerSubscription.remarks = 'Auto-paid via auction win';
      await winnerSubscription.save({ session });
    }

    // For other members, apply dividend to next subscription or create ledger entry (simplified: create ledger credit)
    const otherMembers = chitMembers.filter(cm => cm.member.toString() !== winnerMemberId.toString());
    for (const cm of otherMembers) {
      // Option 1: Adjust next subscription due amount (if dividend is applied as credit)
      // For simplicity, create a ledger entry
      await LedgerEntry.create([{
        member: cm.member,
        chitGroup: auction.chitGroup._id,
        transactionDate: new Date(),
        description: `Dividend from auction month ${auction.monthNumber}`,
        credit: dividendAmount,
        referenceId: auctionId,
        referenceModel: 'Auction',
      }], { session });
    }

    // Audit log
    await AuditLog.create([{
      user: req.user._id,
      action: 'FINALIZE_AUCTION',
      collection: 'auctions',
      documentId: auction._id,
      newData: auction.toObject(),
      ipAddress: req.ip,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Auction finalized', auction });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get auctions for a chit group
// @route   GET /api/auctions?chitGroupId=...
// @access  Private
const getAuctions = async (req, res) => {
  const { chitGroupId } = req.query;
  try {
    const filter = chitGroupId ? { chitGroup: chitGroupId } : {};
    const auctions = await Auction.find(filter)
      .populate('chitGroup', 'name')
      .populate('winnerMember', 'name phone')
      .sort('-auctionDate');
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get auction details with bids
// @route   GET /api/auctions/:id
// @access  Private
const getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('chitGroup')
      .populate('winnerMember', 'name phone');
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    const bids = await Bid.find({ auction: auction._id })
      .populate('member', 'name phone')
      .sort('bidAmount');

    res.json({ auction, bids });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAuction,
  placeBid,
  finalizeAuction,
  getAuctions,
  getAuctionById,
};