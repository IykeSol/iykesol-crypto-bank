const { Web3 } = require('web3');
const Transaction = require('../models/Transaction');

const web3 = new Web3(
  process.env.WEB3_PROVIDER_URL || process.env.SEPOLIA_RPC_URL
);

const checkTransactionStatus = async (txHash) => {
  try {
    const receipt = await web3.eth.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return 'pending'; // Transaction not yet mined
    }
    
    return receipt.status ? 'confirmed' : 'failed';
  } catch (error) {
    // If transaction not found after some time, mark as failed
    console.error(`Transaction ${txHash.substring(0, 10)}... not found on blockchain`);
    return 'failed'; // Changed from 'pending' to 'failed'
  }
};

const updatePendingTransactions = async () => {
  try {
    // Only check recent pending transactions (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const pendingTxs = await Transaction.find({ 
      status: 'pending',
      createdAt: { $gte: oneDayAgo } // Only check transactions from last 24 hours
    });
    
    if (pendingTxs.length === 0) {
      return;
    }
    
    console.log(`🔍 Checking ${pendingTxs.length} recent pending transaction(s)...`);
    
    let updatedCount = 0;
    
    for (const tx of pendingTxs) {
      const status = await checkTransactionStatus(tx.txHash);
      
      if (status !== 'pending') {
        tx.status = status;
        await tx.save();
        updatedCount++;
        console.log(`✅ Transaction ${tx.txHash.substring(0, 10)}... updated to ${status}`);
      }
    }
    
    if (updatedCount > 0) {
      console.log(`📊 Updated ${updatedCount} transaction(s)`);
    }
  } catch (error) {
    console.error('❌ Error updating transactions:', error);
  }
};

module.exports = { checkTransactionStatus, updatePendingTransactions };
