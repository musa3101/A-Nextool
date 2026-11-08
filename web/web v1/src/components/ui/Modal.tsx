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
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'lg',
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
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center px-3 sm:px-4 pt-[max(20px,env(safe-area-inset-top))] pb-[max(20px,env(safe-area-inset-bottom))] text-center select-none"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Backdrop Oscuro con Desenfoque de Lujo (Bloqueo absoluto de clics y toques al fondo) */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity pointer-events-auto"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${maxWidthClasses[maxWidth]} max-h-[86vh] sm:max-h-[90vh] flex flex-col transform overflow-hidden rounded-3xl bg-white p-4 sm:p-6 text-left shadow-2xl transition-all border border-stone-200/90 z-10 relative overscroll-contain animate-in fade-in zoom-in-95 duration-150 select-text my-auto`}
      >
        <div className="shrink-0 flex items-start justify-between pb-3.5 border-b border-stone-100">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1.5 -mr-2 text-stone-400 hover:text-slate-900 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 py-3.5 space-y-3 overflow-y-auto pr-1 no-scrollbar overscroll-contain">{children}</div>

        {footer && (
          <div className="shrink-0 pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

