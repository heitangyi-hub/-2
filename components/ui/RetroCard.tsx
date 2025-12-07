
import React from 'react';

interface RetroCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'danger' | 'success';
}

export const RetroCard: React.FC<RetroCardProps> = ({ title, children, className = '', variant = 'default' }) => {
  const borderColors = {
    default: 'border-neutral-700',
    danger: 'border-red-900',
    success: 'border-green-900'
  };

  const bgColors = {
    default: 'bg-[#1e1e1e]',
    danger: 'bg-red-950/20',
    success: 'bg-green-950/20'
  };

  return (
    <div className={`relative border-2 ${borderColors[variant]} ${bgColors[variant]} p-4 shadow-lg ${className}`}>
      {title && (
        <div className="absolute -top-3 left-4 bg-[#1e1e1e] px-2 text-[10px] text-[#FFD700] font-bold tracking-wider border border-neutral-700 rounded-sm">
          {title}
        </div>
      )}
      {children}
    </div>
  );
};
