import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/pages.css';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Welcome to IYKESOL Bank</h1>
        <p className="hero-subtitle">
          Your Professional Crypto Banking Simulation on Ethereum Sepolia
        </p>
        <div className="hero-features">
          <div className="feature">
            <span className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <h3>Secure</h3>
            <p>Bank-grade security with Web3 authentication</p>
          </div>
          <div className="feature">
            <span className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </span>
            <h3>Fast</h3>
            <p>Instant transfers with deflationary burn mechanism</p>
          </div>
          <div className="feature">
            <span className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </span>
            <h3>Decentralized</h3>
            <p>Built on Ethereum blockchain technology</p>
          </div>
        </div>
        <div className="hero-cta">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-primary">
                Get Started
              </Link>
              <a href="#about" className="btn-secondary">
                Learn More
              </a>
            </>
          )}
        </div>
      </section>

      <section id="about" className="about-section">
        <h2>About IYKESOL Token</h2>
        <div className="about-grid">
          <div className="about-card">
            <h3>Deflationary Mechanism</h3>
            <p>2% of every transfer is permanently burned, creating scarcity over time.</p>
          </div>
          <div className="about-card">
            <h3>Fixed Supply</h3>
            <p>1 billion tokens minted at deployment. No additional minting possible.</p>
          </div>
          <div className="about-card">
            <h3>Emergency Controls</h3>
            <p>Pausable transfers for security incidents with owner-controlled functions.</p>
          </div>
          <div className="about-card">
            <h3>DEX Ready</h3>
            <p>Standard ERC-20 compliance ensures seamless DEX integration.</p>
          </div>
        </div>
      </section>

      <section className="testnet-notice">
        <div className="notice-content">
          <span className="notice-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </span>
          <div>
            <h3>Testnet Deployment</h3>
            <p>
              Currently deployed on Ethereum Sepolia testnet. This is a simulation
              environment for testing and development. Not real financial services.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
