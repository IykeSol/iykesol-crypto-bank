import React, { useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import '../../styles/components/auth.css';

const WalletConnect = () => {
  const { connectWallet, account, isConnected } = useWallet();
  const { walletLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setLoading(true);
    setError('');

    try {
      const connectedAccount = await connectWallet();
      
      if (!connectedAccount) {
        setError('Failed to connect wallet');
        setLoading(false);
        return;
      }

      // Generate authentication message
      const message = `Sign this message to authenticate with IYKESOL Bank.\nNonce: ${Date.now()}`;

      // Request signature from MetaMask
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, connectedAccount]
      });

      // Authenticate with backend
      await walletLogin(connectedAccount, signature, message);

      setLoading(false);
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Connecting wallet..." />;
  }

  return (
    <div className="wallet-connect">
      <ErrorMessage message={error} onClose={() => setError('')} />
      
      {!isConnected ? (
        <button onClick={handleConnect} className="btn-wallet-connect">
          <span className="wallet-icon">🦊</span>
          Connect MetaMask
        </button>
      ) : (
        <div className="wallet-connected">
          <span className="success-icon">✓</span>
          <p>Wallet Connected: {account?.substring(0, 6)}...{account?.substring(38)}</p>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
