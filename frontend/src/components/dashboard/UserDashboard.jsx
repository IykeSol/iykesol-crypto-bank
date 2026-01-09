import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const UserDashboard = ({ balance, balanceLoading }) => {
  const { user } = useAuth();

  const formatAddress = (address) => {
    if (!address) return 'Not connected';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="user-dashboard">
      <div className="balance-card">
        <h2>YOUR BALANCE</h2>
        <div className="balance-amount">
          {balanceLoading ? (
            <span>Loading...</span>
          ) : (
            <>
              <span className="amount">{balance.toFixed(4)}</span>
              <span className="currency">IYKESOL</span>
            </>
          )}
        </div>
        <div className="wallet-info">
          <strong>Wallet:</strong> {formatAddress(user?.walletAddress)}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
