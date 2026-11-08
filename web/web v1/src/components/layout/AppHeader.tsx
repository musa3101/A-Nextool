import React from 'react';
import { Search, ShieldAlert, Sparkles, User, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { Button } from '../ui/Button';

export const AppHeader: React.FC<{ onMenuToggle?: () => void }> = ({ onMenuToggle }) => {
  const { session, stopImpersonation } = useAuth();
  const { activeTenant } = useTenant();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-surface-border px-3.5 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 w-full max-w-full min-w-0">
      {/* Left: Mobile trigger & Search */}
      <div className="flex items-center gap-2.5 flex-1 max-w-md min-w-0">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 -ml-1 rounded-lg text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shrink-0"
            aria-label="Abrir menú"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar proyectos, clientes o herramientas..."
            className="w-full bg-surface-canvas border border-surface-border text-xs rounded-pill pl-9 pr-4 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-champagne-500/40 focus:border-navy-900 transition-all"
          />
        </div>
      </div>

      {/* Center: Impersonation banner if active */}
      {session.isImpersonating && activeTenant && (
        <div className="hidden md:flex items-center gap-2 bg-champagne-100 border border-champagne-300 text-amber-900 px-3.5 py-1 rounded-pill text-xs font-semibold animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-800" />
          <span>Viendo como: {activeTenant.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={stopImpersonation}
            className="text-[11px] h-6 px-2 text-amber-950 hover:bg-champagne-200"
          >
            Volver a Admin
          </Button>
        </div>
      )}

      {/* Right: Edge status and User profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Cloudflare Edge status pill */}
        <div className="hidden lg:flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1 rounded-pill text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
          <span>Edge CDN: Activo</span>
        </div>

        {/* User badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {session.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-navy-900 leading-tight">{session.name}</span>
            <span className="text-[10px] text-slate-500 leading-tight">
              {session.role === 'SUPERADMIN' ? 'Superadministrador MYNEXT' : 'Cliente Autorizado'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

