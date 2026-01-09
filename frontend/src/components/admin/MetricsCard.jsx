import React from 'react';
import { formatNumber } from '../../utils/formatters';
import '../../styles/components/dashboard.css';

const MetricsCard = ({ title, value, suffix = '', icon }) => {
  return (
    <div className="metrics-card">
      <div className="metrics-header">
        {icon && <span className="metrics-icon">{icon}</span>}
        <h4>{title}</h4>
      </div>
      <div className="metrics-value">
        {formatNumber(value)} {suffix}
      </div>
    </div>
  );
};

export default MetricsCard;
