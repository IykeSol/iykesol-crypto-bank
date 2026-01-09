const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Balance = require('../models/Balance');
const { web3 } = require('../utils/web3Utils');

// Get wallet balance
router.get('/balance/:address', authenticateToken, async (req, res) => {
  try {
    const { address } = req.params;
    
    // Check cache first
    let balance = await Balance.findOne({ walletAddress: address.toLowerCase() });
    
    if (!balance || Date.now() - balance.updatedAt > 30000) {
      // Fetch from blockchain if cache is stale (>30 seconds)
      const contractABI = require('../contracts/IYKESOL.json').abi;
      const contract = new web3.eth.Contract(contractABI, process.env.CONTRACT_ADDRESS);
      
      const onChainBalance = await contract.methods.balanceOf(address).call();
      
      if (balance) {
        balance.balance = onChainBalance.toString();
        balance.updatedAt = new Date();
        await balance.save();
      } else {
        balance = await Balance.create({
          userId: req.userId,
          walletAddress: address.toLowerCase(),
          balance: onChainBalance.toString(),
          updatedAt: new Date()
        });
      }
    }
    
    res.json({ 
      balance: balance.balance,
      address: balance.walletAddress,
      lastUpdated: balance.updatedAt
    });
  } catch (error) {
    console.error('Balance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

module.exports = router;
