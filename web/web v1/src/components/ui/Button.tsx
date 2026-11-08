import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'champagne' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  icon,
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-pill transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const variants = {
    primary:
      'bg-navy-900 text-white hover:bg-navy-800 shadow-atelier-sm focus:ring-navy-900',
    champagne:
      'bg-champagne-500 text-navy-900 font-semibold hover:bg-champagne-400 shadow-atelier-sm focus:ring-champagne-500',
    secondary:
      'bg-white border border-surface-border text-slate-700 hover:bg-surface-muted hover:border-slate-300 shadow-atelier-sm focus:ring-slate-400',
    destructive:
      'bg-status-dangerBg text-status-dangerText border border-red-200 hover:bg-red-100 focus:ring-red-500',
    ghost:
      'text-slate-600 hover:bg-surface-muted hover:text-navy-900 focus:ring-slate-300',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

