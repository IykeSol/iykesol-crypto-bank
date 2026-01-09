const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const User = require('../models/User');
const Transaction = require('../models/Transaction'); // ADD THIS
const { authenticateToken } = require('../middleware/auth');

// Request a loan
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const { amount, duration, reason } = req.body;

    if (!amount || !duration || !reason) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    if (amount < 100 || amount > 100000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Loan amount must be between 100 and 100,000 IYKESOL' 
      });
    }

    // Check if user has active loans
    const activeLoan = await Loan.findOne({
      user: req.userId,
      status: { $in: ['pending', 'approved', 'active'] }
    });

    if (activeLoan) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have an active loan' 
      });
    }

    const interestRate = 5; // 5%
    const totalAmount = amount + (amount * interestRate / 100);

    const loan = new Loan({
      user: req.userId,
      amount,
      interestRate,
      duration,
      totalAmount,
      remainingAmount: totalAmount,
      reason,
      status: 'pending'
    });

    await loan.save();

    res.json({
      success: true,
      message: 'Loan request submitted successfully',
      loan
    });
  } catch (error) {
    console.error('Loan request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's loans
router.get('/my-loans', authenticateToken, async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate('approvedBy', 'email');

    res.json({ success: true, loans });
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all loans (admin only)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const loans = await Loan.find()
      .sort({ createdAt: -1 })
      .populate('user', 'email walletAddress')
      .populate('approvedBy', 'email');

    res.json({ success: true, loans });
  } catch (error) {
    console.error('Get all loans error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve loan (admin only) - Step 1: Return loan details for blockchain transfer
router.post('/approve/:loanId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const loan = await Loan.findById(req.params.loanId).populate('user', 'walletAddress');
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Loan already processed' 
      });
    }

    // Return loan info for blockchain transfer
    res.json({ 
      success: true, 
      requiresTransfer: true,
      loan: {
        id: loan._id,
        amount: loan.amount,
        recipientAddress: loan.user.walletAddress
      }
    });

  } catch (error) {
    console.error('Approve loan error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Confirm loan approval after blockchain transfer
router.post('/confirm-approval/:loanId', authenticateToken, async (req, res) => {
  try {
    const { txHash } = req.body;
    const user = await User.findById(req.userId);
    
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!txHash) {
      return res.status(400).json({ success: false, message: 'Transaction hash required' });
    }

    const loan = await Loan.findById(req.params.loanId).populate('user', 'walletAddress');
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    loan.status = 'active';
    loan.approvedBy = req.userId;
    loan.approvedAt = new Date();
    loan.dueDate = new Date(Date.now() + loan.duration * 24 * 60 * 60 * 1000);
    loan.disbursementTxHash = txHash;

    await loan.save();

    // **CREATE TRANSACTION RECORD FOR DISBURSEMENT** ✅
    await Transaction.create({
      userId: loan.user._id,
      type: 'Loan Disbursement',
      amount: loan.amount,
      fromAddress: user.walletAddress,
      toAddress: loan.user.walletAddress,
      txHash: txHash,
      status: 'confirmed',
      metadata: {
        loanId: loan._id,
        dueDate: loan.dueDate,
        interestRate: loan.interestRate
      }
    });

    res.json({ success: true, message: 'Loan approved and activated', loan });
  } catch (error) {
    console.error('Confirm approval error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reject loan (admin only)
router.post('/reject/:loanId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { reason } = req.body;
    const loan = await Loan.findById(req.params.loanId);

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Loan already processed' 
      });
    }

    loan.status = 'rejected';
    loan.rejectionReason = reason || 'Not specified';
    await loan.save();

    res.json({ success: true, message: 'Loan rejected', loan });
  } catch (error) {
    console.error('Reject loan error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Make loan payment - Step 1: Return payment details for blockchain transfer
router.post('/pay/:loanId', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const loan = await Loan.findById(req.params.loanId).populate('approvedBy', 'walletAddress');

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    if (loan.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (loan.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        message: 'Loan is not active' 
      });
    }

    const remaining = loan.totalAmount - loan.amountPaid;
    
    if (amount > remaining) {
      return res.status(400).json({ 
        success: false, 
        message: `Payment amount (${amount}) exceeds remaining balance (${remaining.toFixed(2)})` 
      });
    }

    // Get admin wallet address (the one who approved the loan)
    let recipientAddress = process.env.ADMIN_WALLET_ADDRESS;
    
    // If loan was approved by specific admin, use their wallet
    if (loan.approvedBy && loan.approvedBy.walletAddress) {
      recipientAddress = loan.approvedBy.walletAddress;
    }

    // Return payment details for blockchain transfer
    res.json({ 
      success: true, 
      requiresTransfer: true,
      payment: {
        loanId: loan._id,
        amount,
        recipientAddress
      }
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Confirm loan payment after blockchain transfer
router.post('/confirm-payment/:loanId', authenticateToken, async (req, res) => {
  try {
    const { amount, txHash } = req.body;
    
    if (!txHash || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Transaction hash and amount required' 
      });
    }

    const loan = await Loan.findById(req.params.loanId);

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    if (loan.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    loan.amountPaid += parseFloat(amount);
    loan.payments.push({
      amount: parseFloat(amount),
      txHash,
      paidAt: new Date()
    });

    if (loan.amountPaid >= loan.totalAmount) {
      loan.status = 'completed';
    }

    await loan.save();

    // **CREATE TRANSACTION RECORD FOR REPAYMENT** ✅
    const user = await User.findById(req.userId);
    const adminUser = await User.findById(loan.approvedBy);
    const recipientAddress = adminUser?.walletAddress || process.env.ADMIN_WALLET_ADDRESS;

    await Transaction.create({
      userId: req.userId,
      type: 'Loan Repayment',
      amount: parseFloat(amount),
      fromAddress: user.walletAddress,
      toAddress: recipientAddress,
      txHash: txHash,
      status: 'confirmed',
      metadata: {
        loanId: loan._id,
        remainingBalance: loan.totalAmount - loan.amountPaid,
        isFullyPaid: loan.status === 'completed'
      }
    });

    res.json({ 
      success: true, 
      message: 'Payment recorded successfully', 
      loan 
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
