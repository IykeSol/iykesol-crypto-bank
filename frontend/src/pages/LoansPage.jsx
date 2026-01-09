import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoanRequestForm from '../components/loans/LoanRequestForm';
import LoanList from '../components/loans/LoanList';
import '../styles/pages.css';

const LoansPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLoanSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="loans-page">
      <div className="loans-container">
        <div className="page-header">
          <h1>Loan Management</h1>
          <p className="page-subtitle">Request loans and manage your repayments</p>
        </div>

        <div className="loans-grid">
          <div className="loans-main">
            <LoanRequestForm onSuccess={handleLoanSuccess} />
            
            <div className="loan-info-cards">
              <div className="info-card-small">
                <div className="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <div>
                  <h4>Interest Rate</h4>
                  <p>All loans have a fixed 5% interest rate</p>
                </div>
              </div>

              <div className="info-card-small">
                <div className="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div>
                  <h4>Flexible Duration</h4>
                  <p>Choose from 30 to 365 days repayment period</p>
                </div>
              </div>

              <div className="info-card-small">
                <div className="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div>
                  <h4>Fast Approval</h4>
                  <p>Admin reviews and approves within 24 hours</p>
                </div>
              </div>
            </div>
          </div>

          <div className="loans-sidebar">
            <LoanList key={refreshKey} refreshKey={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoansPage;
