import React, { useState, useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';
import web3Service from '../../services/web3Service';
import { formatNumber } from '../../utils/formatters';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/components/dashboard.css';

const BalanceCard = () => {
  const { account, isConnected } = useWallet();
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isConnected && account) {
      fetchBalance();
      const interval = setInterval(fetchBalance, 30000);
      
      // ✅ ADD THIS: Listen for balance update events
      const handleBalanceUpdate = () => {
        console.log('🔄 Balance update event received - fetching new balance...');
        fetchBalance();
      };
      
      window.addEventListener('balanceUpdate', handleBalanceUpdate);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('balanceUpdate', handleBalanceUpdate);
      };
    } else {
      setLoading(false);
    }
  }, [isConnected, account]);

  const fetchBalance = async () => {
    try {
      setError('');
      console.log('💰 Fetching balance for account:', account);
      const bal = await web3Service.getBalance(account);
      console.log('✅ New balance:', bal);
      setBalance(bal);
    } catch (error) {
      console.error('❌ Balance fetch error:', error);
      setError('Unable to fetch balance. Make sure contract is deployed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="balance-card">
        <h3>Your Balance</h3>
        <p>Please connect your wallet to view balance</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Loading balance..." />;
  }

  return (
    <div className="balance-card">
      <h3>Your Balance</h3>
      {error ? (
        <p style={{ color: '#f59e0b', fontSize: '0.875rem' }}>{error}</p>
      ) : (
        <>
          <div className="balance-amount">
            <span className="amount">{formatNumber(balance, 4)}</span>
            <span className="currency">IYKESOL</span>
          </div>
          {account && (
            <p className="wallet-address">
              Wallet: {account.substring(0, 6)}...{account.substring(38)}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default BalanceCard;
