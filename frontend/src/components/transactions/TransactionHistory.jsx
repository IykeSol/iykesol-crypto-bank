import React, { useState, useEffect } from 'react';
import { transactionService } from '../../services/transactionService';
import api from '../../services/api';
import '../../styles/components/transactions.css';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
    
    const interval = setInterval(() => {
      checkPendingTransactions();
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await transactionService.getTransactions();
      setTransactions(response.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPendingTransactions = async () => {
    const pendingTxs = transactions.filter(tx => tx.status === 'pending');
    
    if (pendingTxs.length === 0) return;
    
    for (const tx of pendingTxs) {
      try {
        const response = await api.get(`/transactions/check-status/${tx.txHash}`);
        
        if (response.data.success && response.data.status !== 'pending') {
          fetchTransactions();
          break;
        }
      } catch (error) {
        console.error('Failed to check transaction status:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        className: 'status-pending',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        ),
        text: 'PENDING'
      },
      confirmed: {
        className: 'status-confirmed',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        ),
        text: 'CONFIRMED'
      },
      failed: {
        className: 'status-failed',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        ),
        text: 'FAILED'
      }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`status-badge ${config.className}`}>
        {config.icon}
        <span>{config.text}</span>
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Loading transactions...</div>;
  }

  return (
    <div className="transaction-history">
      <h3>Transaction History</h3>
      
      {transactions.length === 0 ? (
        <p className="no-transactions">No transactions yet</p>
      ) : (
        <div className="transactions-list">
          {transactions.map(tx => (
            <div key={tx._id} className="transaction-item">
              <div className="tx-header">
                <span className="tx-type">{tx.type || 'Transfer'}</span>
                {getStatusBadge(tx.status)}
              </div>
              
              <div className="tx-details">
                <div className="tx-row">
                  <span className="label">From:</span>
                  <span className="value">
                    {tx.fromAddress 
                      ? `${tx.fromAddress.substring(0, 6)}...${tx.fromAddress.substring(38)}`
                      : tx.from 
                      ? `${tx.from.substring(0, 6)}...${tx.from.substring(38)}`
                      : 'N/A'
                    }
                  </span>
                </div>
                
                <div className="tx-row">
                  <span className="label">To:</span>
                  <span className="value">
                    {tx.toAddress
                      ? `${tx.toAddress.substring(0, 6)}...${tx.toAddress.substring(38)}`
                      : tx.to
                      ? `${tx.to.substring(0, 6)}...${tx.to.substring(38)}`
                      : 'N/A'
                    }
                  </span>
                </div>
                
                <div className="tx-row">
                  <span className="label">Amount:</span>
                  <span className="value amount">{tx.amount} IYKESOL</span>
                </div>
                
                <div className="tx-row">
                  <span className="label">Date:</span>
                  <span className="value">
                    {new Date(tx.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <a
                href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="view-explorer"
              >
                View on Explorer
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
