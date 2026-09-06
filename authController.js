const User = require('../models/User.model');
const generateToken = require('../utils/generateToken');

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken(user._id);

  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

const getMe = async (req, res) => {

  const user = await User.findById(req.user._id);
  res.json(user);
};

// POST /auth/logout
const logout = async (req, res) => {

  res.json({ message: 'Logged out successfully' });
};

module.exports = { login, getMe, logout };