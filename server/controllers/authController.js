const User         = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendTokenResponse } = require('../utils/generateToken');

// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Name, email and password required.' });
  if (await User.findOne({ email }))
    return res.status(400).json({ success: false, message: 'Email already registered.' });
  const user = await User.create({ name, email, password, phone });
  sendTokenResponse(user, 201, res);
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required.' });
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  sendTokenResponse(user, 200, res);
});

// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// @route PUT /api/auth/me
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;
  const updates = {};
  if (name)    updates.name    = name.trim();
  if (phone)   updates.phone   = phone.trim();
  if (address) updates.address = address.trim();
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, user });
});

module.exports = { register, login, getMe, updateMe };
