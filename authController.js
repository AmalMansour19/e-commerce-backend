const jwt = require('jsonwebtoken');
const User = require('./models/User.model'); 
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  res.json({ token, user });
};

const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
};

const logout = async (req, res) => {
  res.json({ message: "Logged out successfully" });
};

module.exports = { login, getMe, logout };
