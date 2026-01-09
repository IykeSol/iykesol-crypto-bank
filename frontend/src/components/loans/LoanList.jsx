import React, { useState, useEffect } from 'react';
import { loanService } from '../../services/loanService';
import LoanPaymentModal from './LoanPaymentModal';
import '../../styles/components/loans.css';

const LoanList = ({ refreshKey }) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, [refreshKey]);

  const fetchLoans = async () => {
    try {
      const response = await loanService.getMyLoans();
      setLoans(response.loans);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      approved: 'badge-info',
      active: 'badge-success',
      completed: 'badge-success',
      rejected: 'badge-danger',
      defaulted: 'badge-danger'
    };
    return badges[status] || 'badge-default';
  };

  const handlePayment = (loan) => {
    setSelectedLoan(loan);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
  setShowPaymentModal(false);
  fetchLoans();
  
  // Trigger balance refresh event
  console.log('💰 Payment successful - triggering balance update');
  window.dispatchEvent(new Event('balanceUpdate'));
};

  if (loading) {
    return <div className="loading">Loading loans...</div>;
  }

  if (loans.length === 0) {
    return (
      <div className="loan-list">
        <h3>My Loans</h3>
        <div className="no-loans">
          <p>You have no loan requests yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loan-list">
      <h3>My Loans</h3>

      <div className="loans-container">
        {loans.map((loan) => (
          <div key={loan._id} className="loan-card">
            <div className="loan-header">
              <span className={`status-badge ${getStatusBadge(loan.status)}`}>
                {loan.status.toUpperCase()}
              </span>
              <span className="loan-date">
                {new Date(loan.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="loan-details">
              <div className="detail-row">
                <span>Amount:</span>
                <strong>{loan.amount.toFixed(2)} IYKESOL</strong>
              </div>
              <div className="detail-row">
                <span>Interest Rate:</span>
                <strong>{loan.interestRate}%</strong>
              </div>
              <div className="detail-row">
                <span>Total Amount:</span>
                <strong>{loan.totalAmount.toFixed(2)} IYKESOL</strong>
              </div>
              <div className="detail-row">
                <span>Amount Paid:</span>
                <strong>{loan.amountPaid.toFixed(2)} IYKESOL</strong>
              </div>
              <div className="detail-row">
                <span>Remaining:</span>
                <strong className="remaining">
                  {loan.remainingAmount.toFixed(2)} IYKESOL
                </strong>
              </div>
              <div className="detail-row">
                <span>Duration:</span>
                <strong>{loan.duration} Days</strong>
              </div>

              {loan.dueDate && (
                <div className="detail-row">
                  <span>Due Date:</span>
                  <strong>{new Date(loan.dueDate).toLocaleDateString()}</strong>
                </div>
              )}

              {loan.rejectionReason && (
                <div className="rejection-reason">
                  <strong>Rejection Reason:</strong>
                  <p>{loan.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="loan-reason">
              <strong>Reason:</strong>
              <p>{loan.reason}</p>
            </div>

            {loan.status === 'active' && loan.remainingAmount > 0 && (
              <button 
                className="btn-pay"
                onClick={() => handlePayment(loan)}
              >
                Make Payment
              </button>
            )}

            {loan.payments && loan.payments.length > 0 && (
              <div className="payment-history">
                <h4>Payment History</h4>
                {loan.payments.map((payment, index) => (
                  <div key={index} className="payment-item">
                    <span>{payment.amount.toFixed(2)} IYKESOL</span>
                    <span className="payment-date">
                      {new Date(payment.paidAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showPaymentModal && (
        <LoanPaymentModal
          loan={selectedLoan}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default LoanList;
