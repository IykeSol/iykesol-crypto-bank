import React, { useState, useEffect } from 'react';
import { loanService } from '../../services/loanService';
import '../../styles/components/loans.css';

const AdminLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await loanService.getAllLoans();
      setLoans(response.loans);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (loanId) => {
    if (!window.confirm('Approve this loan request?')) return;

    try {
      await loanService.approveLoan(loanId);
      alert('Loan approved successfully!');
      fetchLoans();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve loan');
    }
  };

  const handleReject = async (loanId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await loanService.rejectLoan(loanId, reason);
      alert('Loan rejected');
      fetchLoans();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject loan');
    }
  };

  const filteredLoans = loans.filter(loan => {
    if (filter === 'all') return true;
    return loan.status === filter;
  });

  if (loading) {
    return <div className="loading">Loading loans...</div>;
  }

  return (
    <div className="admin-loans">
      <div className="admin-header">
        <h2>Loan Management</h2>
        <div className="loan-filters">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({loans.length})
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending ({loans.filter(l => l.status === 'pending').length})
          </button>
          <button 
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            Active ({loans.filter(l => l.status === 'active').length})
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed ({loans.filter(l => l.status === 'completed').length})
          </button>
        </div>
      </div>

      <div className="admin-loans-list">
        {filteredLoans.length === 0 ? (
          <div className="no-loans">No loans found</div>
        ) : (
          filteredLoans.map(loan => (
            <div key={loan._id} className="admin-loan-card">
              <div className="loan-user-info">
                <strong>{loan.user?.email || 'Unknown'}</strong>
                <span className="wallet-small">
                  {loan.user?.walletAddress ? 
                    `${loan.user.walletAddress.slice(0, 6)}...${loan.user.walletAddress.slice(-4)}` 
                    : 'No wallet'}
                </span>
              </div>

              <div className="loan-details-admin">
                <div className="detail-col">
                  <span>Amount:</span>
                  <strong>{loan.amount.toFixed(2)} IYKESOL</strong>
                </div>
                <div className="detail-col">
                  <span>Total:</span>
                  <strong>{loan.totalAmount.toFixed(2)} IYKESOL</strong>
                </div>
                <div className="detail-col">
                  <span>Remaining:</span>
                  <strong>{loan.remainingAmount.toFixed(2)} IYKESOL</strong>
                </div>
                <div className="detail-col">
                  <span>Duration:</span>
                  <strong>{loan.duration} days</strong>
                </div>
                <div className="detail-col">
                  <span>Status:</span>
                  <span className={`status-badge ${loan.status}`}>
                    {loan.status}
                  </span>
                </div>
              </div>

              <div className="loan-reason-admin">
                <strong>Reason:</strong>
                <p>{loan.reason}</p>
              </div>

              {loan.status === 'pending' && (
                <div className="admin-actions">
                  <button 
                    className="btn-approve"
                    onClick={() => handleApprove(loan._id)}
                  >
                    Approve
                  </button>
                  <button 
                    className="btn-reject"
                    onClick={() => handleReject(loan._id)}
                  >
                    Reject
                  </button>
                </div>
              )}

              <div className="loan-meta">
                <span>Created: {new Date(loan.createdAt).toLocaleString()}</span>
                {loan.dueDate && (
                  <span>Due: {new Date(loan.dueDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminLoans;
