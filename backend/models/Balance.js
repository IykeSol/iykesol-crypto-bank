const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    index: true
  },
  balance: {
    type: String,
    default: '0'
  },
  lastSyncedBlock: Number,
  updatedAt: Date
});

module.exports = mongoose.model('Balance', balanceSchema);
