import React from 'react';
import '../../styles/components/footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; 2026 IYKESOL Crypto Bank. All rights reserved.</p>
        <p className="footer-disclaimer">
          This is a testnet simulation. Not real financial services.
        </p>
        <p className="footer-developer">
          Developed by <a href="https://iykesol-portfolio.netlify.app" target="_blank" rel="noopener noreferrer">IykeSol</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
