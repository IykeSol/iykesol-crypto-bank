import React from 'react';
import '../../styles/components/error.css';

const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="error-message">
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="error-close">&times;</button>
      )}
    </div>
  );
};

export default ErrorMessage;
