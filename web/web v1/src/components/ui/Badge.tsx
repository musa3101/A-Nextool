import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'destructive'
    | 'success'
    | 'warning'
    | 'danger'
    | 'champagne'
    | 'navy'
    | 'neutral';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  dot = false,
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-colors';

  const variants: Record<string, string> = {
    default: 'bg-white/10 text-slate-100 border border-white/15',
    secondary: 'bg-white/[0.05] text-slate-400 border border-white/[0.08]',
    outline: 'border border-white/15 text-slate-200',
    destructive: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/25',
    danger: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',
    champagne: 'bg-[#C5A059]/15 text-[#F0CF85] border border-[#C5A059]/30',
    navy: 'bg-navy-900 text-white',
    neutral: 'bg-slate-800/60 text-slate-300 border border-white/10',
  };

  const dotColors: Record<string, string> = {
    default: 'bg-white',
    secondary: 'bg-slate-400',
    outline: 'bg-slate-400',
    destructive: 'bg-rose-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-400',
    danger: 'bg-rose-500',
    champagne: 'bg-[#C5A059]',
    navy: 'bg-white',
    neutral: 'bg-slate-400',
  };

  const selectedVariant = variants[variant] || variants.default;
  const selectedDotColor = dotColors[variant] || dotColors.default;

  return (
    <span className={cn(baseStyles, selectedVariant, className)} {...props}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', selectedDotColor)} />}
      {children}
    </span>
  );
};
