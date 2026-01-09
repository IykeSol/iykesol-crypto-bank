import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import WalletConnect from '../components/auth/WalletConnect';
import EmailLogin from '../components/auth/EmailLogin';
import '../styles/pages.css';

const LoginPage = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Login to IYKESOL Bank</h1>
        <p className="login-subtitle">Choose your preferred authentication method</p>

        <div className="login-methods">
          <div className="login-card">
            <h3>Wallet Login</h3>
            <p>Connect with MetaMask for instant access</p>
            <WalletConnect />
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="login-card">
            <h3>Email Login</h3>
            <p>Use traditional email and password</p>
            <EmailLogin />
          </div>
        </div>

        <div className="login-footer">
          <p>
            By logging in, you agree to use this testnet simulation responsibly.
            This is not real banking.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
