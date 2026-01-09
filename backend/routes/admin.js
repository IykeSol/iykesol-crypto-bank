const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { web3 } = require('../utils/web3Utils');

// Get admin metrics
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    // Get user count
    const totalUsers = await User.countDocuments();
    
    // Get 24h transaction count
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last24hTransactions = await Transaction.countDocuments({
      createdAt: { $gte: yesterday }
    });
    
    // Get on-chain metrics
    const contractABI = require('../contracts/IYKESOL.json').abi;
    const contract = new web3.eth.Contract(contractABI, process.env.CONTRACT_ADDRESS);
    
    const totalSupply = await contract.methods.totalSupply().call();
    const totalBurned = await contract.methods.totalBurned().call();
    const circulatingSupply = await contract.methods.circulatingSupply().call();
    
    res.json({
      totalUsers,
      last24hTransactions,
      totalSupply: web3.utils.fromWei(totalSupply, 'ether'),
      totalBurned: web3.utils.fromWei(totalBurned, 'ether'),
      circulatingSupply: web3.utils.fromWei(circulatingSupply, 'ether')
    });
  } catch (error) {
    console.error('Metrics fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get all users (admin only)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').limit(100);
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
