import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import MetricsCard from './MetricsCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmModal from '../common/ConfirmModal';
import PromptModal from '../common/PromptModal';
import Toast from '../common/Toast';
import Web3Service from '../../services/web3Service';

import '../../styles/components/dashboard.css';

const AdminDashboard = () => {
  const [account, setAccount] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loansLoading, setLoansLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, loanId: null });
  const [promptModal, setPromptModal] = useState({ isOpen: false, loanId: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    initializeWeb3();
    fetchMetrics();
    fetchLoans();
    const interval = setInterval(() => {
      fetchMetrics();
      fetchLoans();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const initializeWeb3 = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
      await Web3Service.initialize();
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await api.get('/admin/metrics');
      setMetrics(response.data);
    } catch (error) {
      console.error('Fetch metrics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoans = async () => {
    try {
      const response = await api.get('/loans/all');
      setLoans(response.data.loans || []);
    } catch (error) {
      console.error('Fetch loans error:', error);
    } finally {
      setLoansLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleApproveLoan = async () => {
    if (!window.ethereum || !account) {
      showToast('Please connect your wallet first', 'error');
      setConfirmModal({ isOpen: false, type: null, loanId: null });
      return;
    }

    try {
      // Step 1: Get loan details from backend
      const response = await api.post(`/loans/approve/${confirmModal.loanId}`);
      
      if (response.data.requiresTransfer) {
        const { amount, recipientAddress, id } = response.data.loan;
        
        setConfirmModal({ isOpen: false, type: null, loanId: null });
        showToast('Initiating blockchain transfer...', 'warning');

        // Step 2: Transfer tokens via Web3Service
        showToast('Please confirm the transaction in MetaMask...', 'warning');
        
        const receipt = await Web3Service.transfer(account, recipientAddress, amount);
        
        showToast('Transaction confirmed. Updating loan status...', 'success');
        
        // Step 3: Confirm approval with backend using txHash
        await api.post(`/loans/confirm-approval/${id}`, { 
          txHash: receipt.transactionHash
        });
        
        showToast('Loan approved! Tokens transferred successfully!', 'success');
        fetchLoans();
      }

    } catch (error) {
      console.error('Approve loan error:', error);
      
      if (error.code === 4001 || error.message?.includes('user rejected')) {
        showToast('Transaction rejected by user', 'error');
      } else if (error.message?.includes('insufficient funds')) {
        showToast('Insufficient balance to approve loan', 'error');
      } else {
        showToast(error.response?.data?.message || error.message || 'Failed to approve loan', 'error');
      }
      
      setConfirmModal({ isOpen: false, type: null, loanId: null });
    }
  };

  const handleRejectLoan = async (reason) => {
    try {
      await api.post(`/loans/reject/${promptModal.loanId}`, { reason });
      showToast('Loan rejected successfully!', 'success');
      fetchLoans();
      setPromptModal({ isOpen: false, loanId: null });
    } catch (error) {
      console.error('Reject loan error:', error);
      showToast(error.response?.data?.message || 'Failed to reject loan', 'error');
    }
  };

  const openApproveModal = (loanId) => {
    setConfirmModal({ isOpen: true, type: 'approve', loanId });
  };

  const openRejectModal = (loanId) => {
    setPromptModal({ isOpen: true, loanId });
  };

  const pendingLoans = loans.filter(loan => loan.status === 'pending');
  const activeLoans = loans.filter(loan => loan.status === 'active');

  if (loading) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      <div className="metrics-grid">
        <MetricsCard
          title="Total Supply"
          value={metrics?.totalSupply || 0}
          suffix="IYKESOL"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v12M9 9h6"/>
            </svg>
          }
        />
        <MetricsCard
          title="Circulating Supply"
          value={metrics?.circulatingSupply || 0}
          suffix="IYKESOL"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
            </svg>
          }
        />
        <MetricsCard
          title="Total Burned"
          value={metrics?.totalBurned || 0}
          suffix="IYKESOL"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
            </svg>
          }
        />
        <MetricsCard
          title="Total Users"
          value={metrics?.totalUsers || 0}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }
        />
        <MetricsCard
          title="24h Transactions"
          value={metrics?.last24hTransactions || 0}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="20" x2="12" y2="10"/>
              <line x1="18" y1="20" x2="18" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="16"/>
            </svg>
          }
        />
      </div>

      {/* Pending Loan Requests Section */}
      <div className="loan-management-section" style={{ marginTop: '40px' }}>
        <h3>Pending Loan Requests ({pendingLoans.length})</h3>
        
        {loansLoading ? (
          <p>Loading loans...</p>
        ) : pendingLoans.length === 0 ? (
          <p>No pending loan requests.</p>
        ) : (
          <div className="loans-table">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Duration</th>
                  <th>Total Repayment</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingLoans.map(loan => (
                  <tr key={loan._id}>
                    <td>{loan.user?.email || 'N/A'}</td>
                    <td>{loan.amount.toFixed(2)} IYKESOL</td>
                    <td>{loan.duration} days</td>
                    <td>{loan.totalAmount.toFixed(2)} IYKESOL</td>
                    <td>{loan.reason}</td>
                    <td>{new Date(loan.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        onClick={() => openApproveModal(loan._id)}
                        className="btn-approve"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => openRejectModal(loan._id)}
                        className="btn-reject"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Loans Section */}
      <div className="active-loans-section" style={{ marginTop: '40px' }}>
        <h3>Active Loans ({activeLoans.length})</h3>
        
        {activeLoans.length === 0 ? (
          <p>No active loans.</p>
        ) : (
          <div className="loans-table">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Remaining</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {activeLoans.map(loan => (
                  <tr key={loan._id}>
                    <td>{loan.user?.email || 'N/A'}</td>
                    <td>{loan.amount.toFixed(2)} IYKESOL</td>
                    <td>{loan.totalAmount.toFixed(2)} IYKESOL</td>
                    <td>{loan.amountPaid.toFixed(2)} IYKESOL</td>
                    <td>{(loan.totalAmount - loan.amountPaid).toFixed(2)} IYKESOL</td>
                    <td>{loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Approve Loan"
        message="Are you sure you want to approve this loan? You will need to transfer tokens from your wallet to the borrower."
        onConfirm={handleApproveLoan}
        onCancel={() => setConfirmModal({ isOpen: false, type: null, loanId: null })}
        confirmText="Approve & Transfer"
      />

      {/* Prompt Modal for Rejection */}
      <PromptModal
        isOpen={promptModal.isOpen}
        title="Reject Loan"
        message="Please provide a reason for rejecting this loan request:"
        placeholder="Enter rejection reason..."
        onConfirm={handleRejectLoan}
        onCancel={() => setPromptModal({ isOpen: false, loanId: null })}
      />

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
