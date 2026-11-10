import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  theme?: 'light' | 'dark';
  panelClassName?: string;
  headerExtra?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'lg',
  theme = 'light',
  panelClassName = '',
  headerExtra,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Bloqueo total infalible de fondo y scroll para móvil (iOS Safari/Android) y escritorio
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      return () => {
        const top = document.body.style.top;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = originalWidth;
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;

        if (top) {
          const y = parseInt(top || '0', 10) * -1;
          window.scrollTo(0, y);
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-[96vw]',
  };

  const isDark = theme === 'dark';

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto overscroll-contain flex min-h-full items-start sm:items-center justify-center px-2 sm:px-4 pt-[max(48px,calc(env(safe-area-inset-top)+12px))] pb-[max(20px,env(safe-area-inset-bottom))] text-center select-none"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Backdrop Oscuro Sólido Nítido (Sin blur que interfiera con la barra de estado de iOS) */}
      <div
        className="fixed inset-0 bg-slate-950/85 transition-opacity pointer-events-auto"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${maxWidthClasses[maxWidth]} max-h-[86vh] sm:max-h-[90vh] flex flex-col transform overflow-hidden rounded-3xl ${
          isDark
            ? 'bg-[#0B111E] border border-white/10 ring-1 ring-white/5 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)] text-slate-100'
            : 'bg-white border border-stone-200 shadow-2xl text-slate-900'
        } p-4 sm:p-6 text-left transition-all z-10 relative overscroll-contain animate-in fade-in zoom-in-95 duration-150 select-text my-0 sm:my-auto ${panelClassName}`}
      >
        <div
          className={`shrink-0 flex items-start justify-between pb-3.5 border-b ${
            isDark ? 'border-white/10' : 'border-stone-100'
          }`}
        >
          <div className="min-w-0 pr-3">
            <h2
              className={`text-lg sm:text-xl font-semibold font-display tracking-normal truncate ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              {title}
            </h2>
            {subtitle && (
              <p className={`text-xs mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {headerExtra}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={`p-1.5 -mr-2 rounded-full cursor-pointer transition-colors ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-stone-400 hover:text-slate-900 hover:bg-stone-100'
              }`}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 py-3.5 space-y-3 overflow-y-auto pr-1 no-scrollbar overscroll-contain">
          {children}
        </div>

        {footer && (
          <div
            className={`shrink-0 pt-3 border-t flex items-center justify-end gap-2.5 ${
              isDark ? 'border-white/10' : 'border-stone-100'
            }`}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

