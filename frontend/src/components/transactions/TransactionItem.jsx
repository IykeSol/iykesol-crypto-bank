import React from 'react';
import { formatAddress, formatDate, formatNumber } from '../../utils/formatters';
import '../../styles/components/transactions.css';

const TransactionItem = ({ transaction }) => {
  const { fromAddress, toAddress, amount, txHash, createdAt, status, type } = transaction;

  const getStatusClass = () => {
    switch(status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return '';
    }
  };

  return (
    <div className="transaction-item">
      <div className="tx-type">
        <span className={`type-badge ${type}`}>
          {type === 'transfer' ? '→' : type === 'deposit' ? '↓' : '↑'}
        </span>
        <span className="type-text">{type}</span>
      </div>

      <div className="tx-addresses">
        <div>
          <small>From:</small>
          <span>{formatAddress(fromAddress)}</span>
        </div>
        <div>
          <small>To:</small>
          <span>{formatAddress(toAddress)}</span>
        </div>
      </div>

      <div className="tx-amount">
        {formatNumber(amount, 4)} IYKESOL
      </div>

      <div className="tx-status">
        <span className={`status-badge ${getStatusClass()}`}>
          {status}
        </span>
      </div>

      <div className="tx-date">
        {formatDate(createdAt)}
      </div>

      <div className="tx-hash">
        <a
          href={`https://sepolia.etherscan.io/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="tx-link"
        >
          View on Explorer
        </a>
      </div>
    </div>
  );
};

export default TransactionItem;
