import React, { useState } from 'react';
import { loanService } from '../../services/loanService';
import ErrorMessage from '../common/ErrorMessage';
import '../../styles/components/loans.css';

const LoanRequestForm = ({ onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('30');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const calculateInterest = () => {
    if (!amount) return 0;
    return (parseFloat(amount) * 5) / 100; // 5% interest
  };

  const calculateTotal = () => {
    if (!amount) return 0;
    return parseFloat(amount) + calculateInterest();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!amount || !duration || !reason) {
      setError('All fields are required');
      return;
    }

    if (parseFloat(amount) < 100 || parseFloat(amount) > 100000) {
      setError('Loan amount must be between 100 and 100,000 IYKESOL');
      return;
    }

    setLoading(true);

    try {
      await loanService.requestLoan(  // Changed: removed 'const response ='
        parseFloat(amount),
        parseInt(duration),
        reason
      );

      setSuccess('Loan request submitted successfully! Awaiting approval.');
      setAmount('');
      setDuration('30');
      setReason('');

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Loan request error:', err);
      setError(err.response?.data?.message || 'Failed to submit loan request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loan-request-form">
      <h3>Request a Loan</h3>

      <ErrorMessage message={error} onClose={() => setError('')} />

      {success && (
        <div className="success-message">
          <p>✓ {success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Loan Amount (IYKESOL)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Min: 100, Max: 100,000"
            min="100"
            max="100000"
            step="0.01"
            required
          />
          <small className="form-hint">Between 100 and 100,000 IYKESOL</small>
        </div>

        <div className="form-group">
          <label>Duration (Days)</label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          >
            <option value="30">30 Days</option>
            <option value="60">60 Days</option>
            <option value="90">90 Days</option>
            <option value="180">180 Days</option>
            <option value="365">365 Days</option>
          </select>
        </div>

        <div className="form-group">
          <label>Reason for Loan</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Briefly explain why you need this loan..."
            rows="4"
            required
          />
        </div>

        {amount && (
          <div className="loan-summary">
            <h4>Loan Summary</h4>
            <div className="summary-row">
              <span>Loan Amount:</span>
              <strong>{parseFloat(amount).toFixed(2)} IYKESOL</strong>
            </div>
            <div className="summary-row">
              <span>Interest (5%):</span>
              <strong>{calculateInterest().toFixed(2)} IYKESOL</strong>
            </div>
            <div className="summary-row">
              <span>Duration:</span>
              <strong>{duration} Days</strong>
            </div>
            <div className="summary-row total">
              <span>Total Repayment:</span>
              <strong>{calculateTotal().toFixed(2)} IYKESOL</strong>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="btn-submit"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Loan Request'}
        </button>
      </form>
    </div>
  );
};

export default LoanRequestForm;
