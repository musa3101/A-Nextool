import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'champagne'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', icon, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer select-none';

    const variants: Record<string, string> = {
      default:
        'bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/15 shadow-sm focus:ring-[#C5A059]/40',
      primary:
        'bg-navy-900 text-white hover:bg-navy-800 shadow-atelier-sm focus:ring-navy-900',
      champagne:
        'bg-[#C5A059] text-slate-950 font-bold hover:bg-[#d8b368] shadow-atelier-sm focus:ring-[#C5A059]',
      secondary:
        'bg-white/[0.04] border border-white/10 text-slate-300 hover:bg-white/[0.08] hover:text-white',
      outline:
        'bg-transparent border border-white/15 text-slate-200 hover:bg-white/[0.06] hover:text-white',
      destructive:
        'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 focus:ring-rose-500',
      ghost:
        'text-slate-400 hover:text-white hover:bg-white/[0.06]',
      link:
        'text-[#C5A059] underline-offset-4 hover:underline p-0 h-auto',
    };

    const sizes: Record<string, string> = {
      default: 'text-sm px-4 py-2 gap-2 h-10',
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2 gap-2 h-10',
      lg: 'text-base px-6 py-2.5 gap-2.5 h-12',
      icon: 'h-9 w-9 p-0 flex items-center justify-center',
    };

    const selectedVariant = variants[variant] || variants.default;
    const selectedSize = sizes[size] || sizes.default;

    return (
      <button
        ref={ref}
        className={cn(baseStyles, selectedVariant, selectedSize, className)}
        {...props}
      >
        {icon && <span className="inline-flex shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
