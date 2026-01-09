const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  interestRate: {
    type: Number,
    required: true,
    default: 5 // 5% interest
  },
  duration: {
    type: Number,
    required: true // in days
  },
  totalAmount: {
    type: Number,
    required: true // amount + interest
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  remainingAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'defaulted'],
    default: 'pending'
  },
  reason: {
    type: String,
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  dueDate: Date,
  rejectionReason: String,
  disbursementTxHash: {
    type: String,
    default: null
  },
  payments: [{
    amount: Number,
    txHash: String,
    paidAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// NO PRE-SAVE HOOK - we'll calculate in the route instead

module.exports = mongoose.model('Loan', loanSchema);
