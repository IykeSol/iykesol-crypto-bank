import React, { useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import web3Service from '../../services/web3Service';
import { transactionService } from '../../services/transactionService';
import { isValidAddress, isValidAmount } from '../../utils/validators';
import ErrorMessage from '../common/ErrorMessage';
import '../../styles/components/transactions.css';

const TransactionForm = ({ onSuccess }) => {
  const { account, isConnected } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTxHash('');

    // Validation
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!isValidAddress(recipient)) {
      setError('Invalid recipient address');
      return;
    }

    if (!isValidAmount(amount)) {
      setError('Invalid amount');
      return;
    }

    setLoading(true);

    try {
      // Send transaction
      const receipt = await web3Service.transfer(account, recipient, amount);
      
      // Log to backend
      await transactionService.logTransaction({
        txHash: receipt.transactionHash,
        from: account,
        to: recipient,
        amount: amount,
        blockNumber: Number(receipt.blockNumber), // Convert BigInt to Number
        type: 'transfer'
      });

      setTxHash(receipt.transactionHash);
      setRecipient('');
      setAmount('');
      
      // ✅ ADD THIS: Trigger balance refresh
      console.log('🚀 Transaction successful - triggering balance update');
      window.dispatchEvent(new Event('balanceUpdate'));
      
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transaction-form">
      <h3>Send IYKESOL</h3>
      
      <ErrorMessage message={error} onClose={() => setError('')} />
      
      {txHash && (
        <div className="success-message">
          <p>✓ Transaction successful!</p>
          <a 
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-link"
          >
            View on Etherscan
          </a>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            pattern="^0x[a-fA-F0-9]{40}$"
            required
          />
        </div>

        <div className="form-group">
          <label>Amount (IYKESOL)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.000001"
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn-submit"
          disabled={loading || !isConnected}
        >
          {loading ? 'Sending...' : 'Send Tokens'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
