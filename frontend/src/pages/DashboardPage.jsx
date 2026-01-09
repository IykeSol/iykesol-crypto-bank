import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import UserDashboard from '../components/dashboard/UserDashboard';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionHistory from '../components/transactions/TransactionHistory';
import AccountLinking from '../components/auth/AccountLinking';
import config from '../config';
import '../styles/pages.css';


const DashboardPage = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setBalanceLoading(true);
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setBalanceLoading(false);
          return;
        }


        const response = await fetch(`${config.apiUrl}/auth/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });


        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }


        const data = await response.json();
        
        if (data.success) {
          setBalance(data.balance || 0);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setBalance(0);
      } finally {
        setBalanceLoading(false);
      }
    };


    if (isAuthenticated && !loading) {
      fetchDashboardData();
    }
  }, [isAuthenticated, loading, refreshKey]);


  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }


  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }


  const handleTransactionSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };


  return (
    <div className="dashboard-page">
      <UserDashboard 
        key={refreshKey} 
        balance={balance} 
        balanceLoading={balanceLoading}
      />


      <div className="dashboard-content">
        <div className="content-grid">
          <div className="main-content">
            <TransactionForm onSuccess={handleTransactionSuccess} />
            <TransactionHistory key={refreshKey} />
          </div>


          <div className="sidebar">
            {user && !user.walletAddress && (
              <AccountLinking />
            )}
            
            <div className="info-card">
              <h3>Token Information</h3>
              <ul>
                <li><strong>Symbol:</strong> IYKESOL</li>
                <li><strong>Network:</strong> Sepolia Testnet</li>
                <li><strong>Burn Rate:</strong> 2% per transfer</li>
                <li><strong>Type:</strong> ERC-20</li>
              </ul>
            </div>


            <div className="info-card">
              <h3>How to Use</h3>
              <ol>
                <li>Connect your MetaMask wallet</li>
                <li>Ensure you're on Sepolia testnet</li>
                <li>Get testnet ETH from faucet</li>
                <li>Start sending IYKESOL tokens</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default DashboardPage;
