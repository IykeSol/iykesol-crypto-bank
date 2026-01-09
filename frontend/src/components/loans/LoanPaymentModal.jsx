import React, { useState, useEffect } from 'react';
import { loanService } from '../../services/loanService';
import Web3Service from '../../services/web3Service';
import api from '../../services/api';
import ErrorMessage from '../common/ErrorMessage';
import '../../styles/components/loans.css';

const LoanPaymentModal = ({ loan, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [account, setAccount] = useState(null);

  useEffect(() => {
    initializeWallet();
  }, []);

  const initializeWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
      await Web3Service.initialize();
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!window.ethereum || !account) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const payAmount = parseFloat(amount);
    const remaining = loan.totalAmount - loan.amountPaid;

    if (payAmount > remaining) {
      setError(`Amount exceeds remaining balance of ${remaining.toFixed(2)} IYKESOL`);
      return;
    }

    setLoading(true);

    try {
      // Step 1: Get payment details from backend
      const response = await api.post(`/loans/pay/${loan._id}`, { amount: payAmount });
      
      if (response.data.requiresTransfer) {
        const { recipientAddress, amount: payAmt } = response.data.payment;
        
        setError('Please confirm the transaction in MetaMask...');
        
        // Step 2: Transfer tokens via Web3Service
        const receipt = await Web3Service.transfer(account, recipientAddress, payAmt);
        
        setError('Transaction confirmed. Recording payment...');
        
        // Step 3: Confirm payment with backend
        const confirmResponse = await api.post(`/loans/confirm-payment/${loan._id}`, { 
          amount: payAmt,
          txHash: receipt.transactionHash
        });
        
        if (confirmResponse.data.success) {
          setError('Payment successful! Updating balance...');
          
          // ✅ ADDED: Wait a moment for backend to process
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // ✅ ADDED: Trigger balance update event
          window.dispatchEvent(new Event('balanceUpdate'));
          
          // Success - close modal and refresh
          onSuccess();
          onClose();
        }
      }

    } catch (err) {
      console.error('Payment error:', err);
      
      if (err.code === 4001 || err.message?.includes('user rejected')) {
        setError('Transaction rejected by user');
      } else if (err.message?.includes('insufficient funds')) {
        setError('Insufficient balance to make payment');
      } else {
        setError(err.response?.data?.message || err.message || 'Payment failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const remaining = loan.totalAmount - loan.amountPaid;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Make Loan Payment</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="payment-info">
            <div className="info-row">
              <span>Total Loan:</span>
              <strong>{loan.totalAmount.toFixed(2)} IYKESOL</strong>
            </div>
            <div className="info-row">
              <span>Amount Paid:</span>
              <strong>{loan.amountPaid.toFixed(2)} IYKESOL</strong>
            </div>
            <div className="info-row">
              <span>Remaining:</span>
              <strong className="remaining">
                {remaining.toFixed(2)} IYKESOL
              </strong>
            </div>
          </div>

          <ErrorMessage message={error} onClose={() => setError('')} />

          <form onSubmit={handlePayment}>
            <div className="form-group">
              <label>Payment Amount (IYKESOL)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to pay"
                min="0.01"
                max={remaining}
                step="0.01"
                required
                disabled={loading}
              />
              <small className="form-hint">
                Maximum: {remaining.toFixed(2)} IYKESOL
              </small>
            </div>

            <div className="quick-amounts">
              <button
                type="button"
                className="btn-quick"
                onClick={() => setAmount((remaining * 0.25).toFixed(2))}
                disabled={loading}
              >
                25%
              </button>
              <button
                type="button"
                className="btn-quick"
                onClick={() => setAmount((remaining * 0.5).toFixed(2))}
                disabled={loading}
              >
                50%
              </button>
              <button
                type="button"
                className="btn-quick"
                onClick={() => setAmount((remaining * 0.75).toFixed(2))}
                disabled={loading}
              >
                75%
              </button>
              <button
                type="button"
                className="btn-quick"
                onClick={() => setAmount(remaining.toFixed(2))}
                disabled={loading}
              >
                Full
              </button>
            </div>

            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading || !account}
            >
              {loading ? 'Processing Payment...' : !account ? 'Connect Wallet' : 'Submit Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoanPaymentModal;
