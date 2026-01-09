const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const { body, validationResult } = require('express-validator');
const { checkTransactionStatus } = require('../utils/transactionChecker');

// Get user transactions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const count = await Transaction.countDocuments({ userId: req.userId });
    
    res.json({
      transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Log new transaction
router.post('/', 
  authenticateToken,
  [
    body('txHash').matches(/^0x([A-Fa-f0-9]{64})$/),
    body('from').matches(/^0x[a-fA-F0-9]{40}$/),
    body('to').matches(/^0x[a-fA-F0-9]{40}$/),
    body('amount').notEmpty(),
    body('type').isIn(['deposit', 'withdrawal', 'transfer'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { txHash, from, to, amount, burnAmount, blockNumber, type, metadata, status } = req.body;
      
      const transaction = new Transaction({
        userId: req.userId,
        fromAddress: from.toLowerCase(),
        toAddress: to.toLowerCase(),
        amount,
        burnAmount: burnAmount || '0',
        txHash,
        blockNumber,
        status: status || 'confirmed', // Use provided status or default to confirmed
        type,
        metadata
      });
      
      await transaction.save();
      
      res.status(201).json({
        message: 'Transaction logged successfully',
        transaction
      });
    } catch (error) {
      console.error('Log transaction error:', error);
      res.status(500).json({ error: 'Failed to log transaction' });
    }
  }
);

// Get transaction by hash
router.get('/:txHash', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      txHash: req.params.txHash,
      userId: req.userId
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Check and update transaction status (NEW ENDPOINT)
router.get('/check-status/:txHash', authenticateToken, async (req, res) => {
  try {
    const { txHash } = req.params;
    
    // Get transaction from database
    const transaction = await Transaction.findOne({ 
      txHash,
      userId: req.userId 
    });
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    // If already confirmed or failed, return current status
    if (transaction.status !== 'pending') {
      return res.json({ success: true, status: transaction.status });
    }
    
    // Check blockchain for actual status
    const blockchainStatus = await checkTransactionStatus(txHash);
    
    // Update database if status changed
    if (blockchainStatus !== 'pending') {
      transaction.status = blockchainStatus;
      await transaction.save();
    }
    
    res.json({ success: true, status: blockchainStatus });
    
  } catch (error) {
    console.error('Check status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
