import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/dashboard.css';

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="quick-actions">
      <h3>Quick Actions</h3>
      <div className="actions-grid">
        <button className="action-btn" onClick={() => navigate('/dashboard')}>
          <span className="action-icon">💸</span>
          <span>Send Tokens</span>
        </button>
        <button className="action-btn">
          <span className="action-icon">📊</span>
          <span>View Transactions</span>
        </button>
        <button className="action-btn">
          <span className="action-icon">⚙️</span>
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
