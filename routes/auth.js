const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();


// Register route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const accessToken = jwt.sign({ userId: user._id, username }, process.env.JWT_SECRET, { expiresIn: '5s' });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    // Save refresh token to user document
    user.refreshToken = refreshToken;
    await user.save();
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Logout route
router.post('/logout',verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const refreshToken = req.body.refreshToken;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if(!refreshToken){
      return res.status(404).json({message:"No refreshToken found"});
    }
    // Clear refresh token from user document
    user.refreshToken = null;
    await user.save();
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

// Refresh token route
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(403).json({ message: 'Refresh token not provided' });
  }
  jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decodedToken) => {
    if (err) {
      console.error('Refresh token verification failed:', err);
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
    try {
      const user = await User.findById(decodedToken.userId);
      if (!user || user.refreshToken !== refreshToken) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }
      const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '5s' });
      res.json({ accessToken });
    } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
});

module.exports = router;
