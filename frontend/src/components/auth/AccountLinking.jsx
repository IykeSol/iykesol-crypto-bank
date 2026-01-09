import React, { useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { authService } from '../../services/authService';
import ErrorMessage from '../common/ErrorMessage';
import '../../styles/components/auth.css';

const AccountLinking = () => {
  const { connectWallet, account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLinkWallet = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let walletAddress = account;
      
      if (!walletAddress) {
        walletAddress = await connectWallet();
        if (!walletAddress) {
          setError('Failed to connect wallet');
          setLoading(false);
          return;
        }
      }

      const message = `Link wallet to IYKESOL Bank account.\nNonce: ${Date.now()}`;
      
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress]
      });

      await authService.linkWallet(walletAddress, signature, message);
      
      setSuccess('Wallet linked successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to link wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-linking">
      <h3>Link Your Wallet</h3>
      <p>Connect your MetaMask wallet to this account for easy access.</p>

      <ErrorMessage message={error} onClose={() => setError('')} />
      
      {success && (
        <div className="success-message">
          <span className="success-icon">✓</span> {success}
        </div>
      )}

      <button 
        onClick={handleLinkWallet} 
        className="btn-link-wallet"
        disabled={loading}
      >
        {loading ? 'Linking...' : 'Link Wallet'}
      </button>
    </div>
  );
};

export default AccountLinking;
