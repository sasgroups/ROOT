const { ChitGroup, ChitMember, Member, Payment, Subscription, LedgerEntry } = require('../models');

const getChitGroups = async (req, res) => {
  try {
    const chitGroups = await ChitGroup.find().populate('createdBy', 'name');
    res.json(chitGroups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createChitGroup = async (req, res) => {
  const { name, totalAmount, monthlyContribution, durationMonths, startDate } = req.body;
  try {
    const chitGroup = await ChitGroup.create({
      name,
      totalAmount,
      monthlyContribution,
      durationMonths,
      startDate,
      createdBy: req.user._id,
    });
    res.status(201).json(chitGroup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getChitGroupById = async (req, res) => {
  try {
    const chitGroup = await ChitGroup.findById(req.params.id).populate('createdBy', 'name');
    if (!chitGroup) {
      return res.status(404).json({ message: 'Chit group not found' });
    }

    const chitMembers = await ChitMember.find({ chitGroup: chitGroup._id })
      .populate('member', 'name phone email');

    res.json({ chitGroup, members: chitMembers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMemberToChit = async (req, res) => {
  const { memberId } = req.body;
  const chitGroupId = req.params.chitId;

  try {
    const chitGroup = await ChitGroup.findById(chitGroupId);
    if (!chitGroup) {
      return res.status(404).json({ message: 'Chit group not found' });
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const existing = await ChitMember.findOne({ chitGroup: chitGroupId, member: memberId });
    if (existing) {
      return res.status(400).json({ message: 'Member already in this chit group' });
    }

    const payments = [];
    for (let month = 1; month <= chitGroup.durationMonths; month++) {
      payments.push({
        month,
        amount: chitGroup.monthlyContribution,
        status: 'pending',
      });
    }

    const chitMember = await ChitMember.create({
      chitGroup: chitGroupId,
      member: memberId,
      payments,
    });

    res.status(201).json(chitMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Record a payment (legacy Collections page)
// @route   POST /api/chits/payments
const recordPayment = async (req, res) => {
  const { chitMemberId, month, amount, remarks } = req.body;
  const monthNum = parseInt(month, 10);

  try {
    const chitMember = await ChitMember.findById(chitMemberId).populate('chitGroup');
    if (!chitMember) {
      return res.status(404).json({ message: 'Chit member not found' });
    }

    // Update the embedded payments array in ChitMember
    const paymentRecord = chitMember.payments.find(p => p.month === monthNum);
    if (!paymentRecord) {
      return res.status(400).json({ message: 'Invalid month' });
    }
    if (paymentRecord.status === 'paid') {
      return res.status(400).json({ message: 'Payment already recorded for this month' });
    }

    paymentRecord.status = 'paid';
    paymentRecord.paidDate = new Date();
    paymentRecord.amount = amount; // you might want to keep original amount? We'll trust the input.

    await chitMember.save();

    // Create legacy Payment document (optional, for backward compatibility)
    const payment = await Payment.create({
      chitGroup: chitMember.chitGroup._id,
      chitMember: chitMember._id,
      member: chitMember.member,
      month: monthNum,
      amount,
      remarks,
    });

    // --- NEW: Sync with Subscription model ---
    // Find the subscription for this member, chit group, and month
    let subscription = await Subscription.findOne({
      chitGroup: chitMember.chitGroup._id,
      member: chitMember.member,
      monthNumber: monthNum,
    });

    if (subscription) {
      // Update existing subscription
      subscription.status = amount >= subscription.amount ? 'paid' : 'partially_paid';
      subscription.paidAmount = amount;
      subscription.paidDate = new Date();
      subscription.remarks = remarks || subscription.remarks;
      await subscription.save();
    } else {
      // If subscription doesn't exist (should not happen if generated), create one
      subscription = await Subscription.create({
        chitGroup: chitMember.chitGroup._id,
        chitMember: chitMember._id,
        member: chitMember.member,
        monthNumber: monthNum,
        dueDate: new Date(chitMember.chitGroup.startDate),// approximate – you may want a proper due date
        amount: chitMember.chitGroup.monthlyContribution,
        status: amount >= chitMember.chitGroup.monthlyContribution ? 'paid' : 'partially_paid',
        paidAmount: amount,
        paidDate: new Date(),
        remarks,
      });
    }

    // --- NEW: Create Ledger Entry ---
    await LedgerEntry.create({
      member: chitMember.member,
      chitGroup: chitMember.chitGroup._id,
      transactionDate: new Date(),
      description: `Payment for month ${monthNum} (${chitMember.chitGroup.name})`,
      debit: amount,
      credit: 0,
      referenceId: subscription ? subscription._id : payment._id,
      referenceModel: subscription ? 'Subscription' : 'Payment',
    });

    // Audit log (optional)
    // await AuditLog.create({ ... });

    res.json({ message: 'Payment recorded', payment, subscription });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPaymentsByChit = async (req, res) => {
  try {
    const payments = await Payment.find({ chitGroup: req.params.chitId })
      .populate('member', 'name phone')
      .sort('-paymentDate');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getChitGroups,
  createChitGroup,
  getChitGroupById,
  addMemberToChit,
  recordPayment,
  getPaymentsByChit,
};