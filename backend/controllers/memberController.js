const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Member = require('../models/Member');
const ChitMember = require('../models/ChitMember');
const Auction = require('../models/Auction');
const LedgerEntry = require('../models/LedgerEntry');
const getMembers = async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (member) {
      res.json(member);
    } else {
      res.status(404).json({ message: 'Member not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createMember = async (req, res) => {
  const { name, phone, email, address, password } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Check if email is already used
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User with role 'member'
    const [user] = await User.create([{
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'member',
    }], { session });

    // Create Member linked to the User
    const [member] = await Member.create([{
      user: user._id,
      name,
      phone,
      email,
      address,
    }], { session });

    // Update User with member reference
    user.member = member._id;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(member);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

const updateMember = async (req, res) => {
  const { name, phone, email, address, password } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const member = await Member.findById(req.params.id).session(session);
    if (!member) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Member not found' });
    }

    // Update member fields
    member.name = name || member.name;
    member.phone = phone || member.phone;
    member.email = email || member.email;
    member.address = address || member.address;
    await member.save({ session });

    // Update associated User if exists
    if (member.user) {
      const user = await User.findById(member.user).session(session);
      if (user) {
        user.name = member.name;
        user.email = member.email;
        user.phone = member.phone;
        if (password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
        }
        await user.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();
    res.json(member);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (member) {
      await member.remove();
      res.json({ message: 'Member removed' });
    } else {
      res.status(404).json({ message: 'Member not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chit groups for logged-in member
// @route   GET /api/members/my/groups
// @access  Private (member)
const getMyGroups = async (req, res) => {
  try {
    const memberId = req.user.member; // from the User document
    if (!memberId) {
      return res.status(404).json({ message: 'Member profile not found' });
    }

    const chitMembers = await ChitMember.find({ member: memberId })
      .populate('chitGroup');

    const groups = chitMembers.map(cm => ({
      ...cm.chitGroup.toObject(),
      joinedDate: cm.joinedDate,
      winningMonth: cm.winningMonth,
    }));

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get auctions for logged-in member (groups they belong to)
// @route   GET /api/members/my/auctions
// @access  Private (member)
const getMyAuctions = async (req, res) => {
  try {
    const memberId = req.user.member;
    if (!memberId) return res.status(404).json({ message: 'Member profile not found' });

    const chitMembers = await ChitMember.find({ member: memberId }).select('chitGroup');
    const groupIds = chitMembers.map(cm => cm.chitGroup);

    const auctions = await Auction.find({
      chitGroup: { $in: groupIds },
      status: { $in: ['scheduled', 'in_progress'] }
    }).populate('chitGroup', 'name');

    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ledger entries for logged-in member
// @route   GET /api/members/my/ledger
// @access  Private (member)
const getMyLedger = async (req, res) => {
  try {
    const memberId = req.user.member;
    if (!memberId) return res.status(404).json({ message: 'Member profile not found' });

    const entries = await LedgerEntry.find({ member: memberId })
      .populate('chitGroup', 'name')
      .sort('-transactionDate');

    // Add running balance
    let balance = 0;
    const entriesWithBalance = entries.map(entry => {
      balance += (entry.credit - entry.debit);
      return { ...entry.toObject(), balance };
    }).reverse();

    res.json(entriesWithBalance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getMyGroups,      // new
  getMyAuctions,    // new
  getMyLedger,      // new
};