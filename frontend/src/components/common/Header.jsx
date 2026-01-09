import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';
import { formatAddress } from '../../utils/formatters';
import '../../styles/components/header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { account, isConnected, disconnectWallet } = useWallet();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    disconnectWallet();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>IYKESOL Bank</h1>
        </Link>

        <nav className="nav">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/loans" className="nav-link">Loans</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="nav-link">Admin</Link>
              )}
              <div className="user-info">
                {isConnected && (
                  <span className="wallet-badge">{formatAddress(account)}</span>
                )}
                <span className="user-email">{user?.email || 'Wallet User'}</span>
                <button onClick={handleLogout} className="btn-logout">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="btn-login">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
