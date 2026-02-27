const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { User, Member } = require('../models'); // Ensure Member is imported

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user (admin/staff)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'staff', // default to staff if not specified
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new member (creates both User and Member)
// @route   POST /api/auth/register/member
// @access  Public
const registerMember = async (req, res) => {
  const { name, email, password, phone, address, nomineeName, nomineeRelation } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email }).session(session);
    if (userExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'User already exists' });
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

    // Create Member linked to user
    const [member] = await Member.create([{
      user: user._id,
      name,
      phone,
      email,
      address,
      nomineeName,
      nomineeRelation,
    }], { session });

    // Update user with member reference
    user.member = member._id;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Generate token
    const token = generateToken(user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      member,
      token,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate('member');
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        member: user.member, // include member data if exists
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, registerMember, loginUser };