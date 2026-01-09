const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { verifySignature } = require('../utils/web3Utils');
const { authenticateToken } = require('../middleware/auth');

// Email/Password Registration
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 })
      .matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
      .withMessage('Password must contain uppercase, number, and special character'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = new User({
        email,
        passwordHash,
        authMethod: 'email',
        isActive: true
      });

      await user.save();

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          authMethod: user.authMethod
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// Email/Password Login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          walletAddress: user.walletAddress,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// MetaMask Wallet Authentication
router.post('/wallet-auth', async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;

    const isValid = await verifySignature(message, signature, walletAddress);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      user = new User({
        walletAddress: walletAddress.toLowerCase(),
        authMethod: 'wallet',
        isActive: true
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, walletAddress: user.walletAddress, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Wallet auth error:', error);
    res.status(500).json({ error: 'Wallet authentication failed' });
  }
});

// Link wallet to existing account
router.post('/link-wallet', authenticateToken, async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;
    
    const isValid = await verifySignature(message, signature, walletAddress);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.walletAddress = walletAddress.toLowerCase();
    user.linkedAccounts.wallet = walletAddress.toLowerCase();
    await user.save();

    res.json({ message: 'Wallet linked successfully', walletAddress: user.walletAddress });
  } catch (error) {
    console.error('Wallet linking error:', error);
    res.status(500).json({ error: 'Wallet linking failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get user dashboard with token balance
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let tokenBalance = 0;
    
    // If user has wallet, fetch token balance from contract
    if (user.walletAddress) {
      const { getTokenBalance } = require('../utils/contractUtils');
      tokenBalance = await getTokenBalance(user.walletAddress);
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role
      },
      balance: tokenBalance
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch dashboard data' 
    });
  }
});

module.exports = router;
