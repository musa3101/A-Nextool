import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 'flat' | 'rest' | 'hover';
}

export const Card: React.FC<CardProps> = ({
  className,
  elevation = 'rest',
  children,
  ...props
}) => {
  const elevations = {
    flat: 'bg-white border border-surface-border',
    rest: 'bg-white border border-surface-border shadow-atelier-sm',
    hover:
      'bg-white border border-surface-border shadow-atelier-sm hover:shadow-atelier hover:border-slate-300 transition-all duration-200',
  };

  return (
    <div
      className={cn('rounded-card p-5 overflow-hidden', elevations[elevation], className)}
      {...props}
    >
      {children}
    </div>
  );
};

