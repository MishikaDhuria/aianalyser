import React from 'react';

const GlassCard = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card p-6 rounded-2xl ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
