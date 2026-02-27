const { Subscription, ChitGroup, ChitMember, Member, AuditLog } = require('../models');

// @desc    Generate subscriptions for a chit group (usually after adding members)
// @route   POST /api/subscriptions/generate
// @access  Private (admin)
const generateSubscriptions = async (req, res) => {
  const { chitGroupId } = req.body;
  try {
    const chitGroup = await ChitGroup.findById(chitGroupId);
    if (!chitGroup) return res.status(404).json({ message: 'Chit group not found' });

    const chitMembers = await ChitMember.find({ chitGroup: chitGroupId }).populate('member');
    if (chitMembers.length === 0) return res.status(400).json({ message: 'No members in this group' });

    const subscriptions = [];
    for (let month = 1; month <= chitGroup.durationMonths; month++) {
      const dueDate = new Date(chitGroup.startDate);
      dueDate.setMonth(dueDate.getMonth() + month - 1); // due on start day of each month? adjust as needed
      for (const cm of chitMembers) {
        subscriptions.push({
          chitGroup: chitGroupId,
          chitMember: cm._id,
          member: cm.member._id,
          monthNumber: month,
          dueDate,
          amount: chitGroup.monthlyContribution,
          status: 'pending',
        });
      }
    }

    await Subscription.insertMany(subscriptions);

    // Audit log
    await AuditLog.create({
      user: req.user._id,
      action: 'GENERATE_SUBSCRIPTIONS',
      collection: 'subscriptions',
      newData: { chitGroupId, count: subscriptions.length },
      ipAddress: req.ip,
    });

    res.status(201).json({ message: `Generated ${subscriptions.length} subscriptions` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get subscriptions for a member or group
// @route   GET /api/subscriptions?memberId=&chitGroupId=
// @access  Private
const getSubscriptions = async (req, res) => {
  const { memberId, chitGroupId } = req.query;
  try {
    const filter = {};
    if (memberId) filter.member = memberId;
    if (chitGroupId) filter.chitGroup = chitGroupId;
    const subscriptions = await Subscription.find(filter)
      .populate('member', 'name phone')
      .populate('chitGroup', 'name')
      .sort('dueDate');
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record payment for a subscription (offline/cash)
// @route   POST /api/subscriptions/pay
// @access  Private (staff)
const paySubscription = async (req, res) => {
  const { subscriptionId, amountPaid, paymentMethod, transactionId, remarks } = req.body;
  try {
    const subscription = await Subscription.findById(subscriptionId).populate('chitGroup');
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

    if (subscription.status === 'paid') {
      return res.status(400).json({ message: 'Already paid' });
    }

    subscription.paidAmount = amountPaid;
    subscription.paymentMethod = paymentMethod;
    subscription.transactionId = transactionId;
    subscription.remarks = remarks;
    subscription.paidDate = new Date();
    subscription.status = amountPaid >= subscription.amount ? 'paid' : 'partially_paid';

    // Apply late fee if any (simplified)
    if (subscription.dueDate < new Date() && subscription.status !== 'paid') {
      // you could add late fee logic
    }

    await subscription.save();

    // Audit log
    await AuditLog.create({
      user: req.user._id,
      action: 'PAY_SUBSCRIPTION',
      collection: 'subscriptions',
      documentId: subscription._id,
      newData: subscription.toObject(),
      ipAddress: req.ip,
    });

    // Also create ledger entry
    const LedgerEntry = require('../models/LedgerEntry');
    await LedgerEntry.create({
      member: subscription.member,
      chitGroup: subscription.chitGroup._id,
      transactionDate: new Date(),
      description: `Payment for month ${subscription.monthNumber}`,
      debit: amountPaid,
      referenceId: subscription._id,
      referenceModel: 'Subscription',
    });

    res.json(subscription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  generateSubscriptions,
  getSubscriptions,
  paySubscription,
};