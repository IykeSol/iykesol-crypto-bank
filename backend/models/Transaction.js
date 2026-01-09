const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fromAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  toAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  amount: {
    type: String,
    required: true
  },
  burnAmount: {
    type: String,
    default: '0'
  },
  txHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  blockNumber: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: [
      'deposit', 
      'withdrawal', 
      'transfer',
      'Loan Disbursement',    // ✅ ADD THIS
      'Loan Repayment'        // ✅ ADD THIS
    ],
    required: true
  },
  gasUsed: String,
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
