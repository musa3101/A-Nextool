import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Grid,
  ShieldCheck,
  Settings,
  Images,
  UtensilsCrossed,
  MailQuestion,
  CalendarCheck,
  FileEdit,
  Scissors,
  Languages,
  LogOut,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { cn } from '../../lib/utils';
import { ModuleType } from '../../types';

const MODULE_ICON_MAP: Record<ModuleType, React.ReactNode> = {
  galerias: <Images className="w-4 h-4" />,
  menus: <UtensilsCrossed className="w-4 h-4" />,
  leads: <MailQuestion className="w-4 h-4" />,
  citas: <CalendarCheck className="w-4 h-4" />,
  editor: <FileEdit className="w-4 h-4" />,
  servicios: <Scissors className="w-4 h-4" />,
  traduccion: <Languages className="w-4 h-4" />,
};

const MODULE_NAME_MAP: Record<ModuleType, string> = {
  galerias: 'Galerías de Fotos',
  menus: 'Menús y Cartas',
  leads: 'Solicitudes Web',
  citas: 'Reservas y Citas',
  editor: 'Editor de Contenido',
  servicios: 'Servicios y Tarifas',
  traduccion: 'Traducción IA',
};

export const AppSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { session, loginAsSuperadmin, stopImpersonation } = useAuth();
  const { activeTenant, clients, setActiveTenantId } = useTenant();
  const navigate = useNavigate();

  const location = useLocation();
  const isClientView = Boolean(session.tenantId) || location.pathname.startsWith('/app/');

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-72 bg-navy-900 text-white flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 shadow-atelier-lg',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="p-6 border-b border-navy-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0C121E] p-1.5 border border-white/10 flex items-center justify-center shadow-md shrink-0">
                <img
                  src="/icons/nextool-sinfondo.png"
                  alt="NexTool"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-display font-bold text-base tracking-tight text-white block">
                  NEXT TOOLS
                </span>
                <span className="text-[10px] text-champagne-300 font-medium tracking-wider uppercase block">
                  Plataforma MYNEXT
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Mode: ADMIN vs CLIENT */}
          <div className="p-4 flex-1 space-y-6">
            {!isClientView ? (
              /* MYNEXT ADMIN NAVIGATION */
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-3 block mb-2">
                    Plataforma
                  </span>
                  <nav className="space-y-1">
                    <NavLink
                      to="/admin"
                      end
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 rounded-pill text-xs font-semibold transition-all',
                          isActive
                            ? 'bg-champagne-500 text-navy-900 shadow-sm'
                            : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                        )
                      }
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Vista General</span>
                    </NavLink>

                    <NavLink
                      to="/admin/clientes"
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 rounded-pill text-xs font-semibold transition-all',
                          isActive
                            ? 'bg-champagne-500 text-navy-900 shadow-sm'
                            : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                        )
                      }
                    >
                      <Users className="w-4 h-4" />
                      <span>Gestión de Clientes</span>
                      <span className="ml-auto text-[10px] bg-navy-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                        {clients.length}
                      </span>
                    </NavLink>

                    <NavLink
                      to="/admin/modulos"
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 rounded-pill text-xs font-semibold transition-all',
                          isActive
                            ? 'bg-champagne-500 text-navy-900 shadow-sm'
                            : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                        )
                      }
                    >
                      <Grid className="w-4 h-4" />
                      <span>Catálogo de Módulos</span>
                    </NavLink>
                  </nav>
                </div>

                <div>
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-3 block mb-2">
                    Sistema
                  </span>
                  <nav className="space-y-1">
                    <NavLink
                      to="/admin/auditoria"
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 rounded-pill text-xs font-semibold transition-all',
                          isActive
                            ? 'bg-champagne-500 text-navy-900 shadow-sm'
                            : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                        )
                      }
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Logs de Auditoría</span>
                    </NavLink>

                    <NavLink
                      to="/admin/ajustes"
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 rounded-pill text-xs font-semibold transition-all',
                          isActive
                            ? 'bg-champagne-500 text-navy-900 shadow-sm'
                            : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                        )
                      }
                    >
                      <Settings className="w-4 h-4" />
                      <span>Ajustes Globales</span>
                    </NavLink>
                  </nav>
                </div>

                {/* Quick Client Switcher for Musa */}
                <div className="pt-4 border-t border-navy-800/80">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-3 block mb-2">
                    Cambio Rápido a Cliente
                  </span>
                  <div className="space-y-1">
                    {clients.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setActiveTenantId(c.id);
                          navigate(`/app/${c.slug}`);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-navy-800 hover:text-white transition-all text-left"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded-full bg-navy-700 text-champagne-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {c.logoText}
                          </span>
                          <span className="truncate">{c.name}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* CLIENT PANEL DYNAMIC NAVIGATION */
              <div className="space-y-4">
                {/* Active Client Badge in Sidebar */}
                {activeTenant && (
                  <div className="p-3 bg-navy-800 rounded-card border border-navy-700">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-champagne-500 text-navy-900 font-bold text-xs flex items-center justify-center shadow-sm">
                        {activeTenant.logoText}
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">
                          {activeTenant.name}
                        </span>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                          Web Sincronizada
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-3 block mb-2">
                    Herramientas del Negocio
                  </span>
                  <nav className="space-y-1">
                    <NavLink
                      to={`/app/${activeTenant?.slug || 'ecuaplac'}`}
                      end
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 rounded-pill text-xs font-semibold transition-all',
                          isActive
                            ? 'bg-champagne-500 text-navy-900 shadow-sm'
                            : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                        )
                      }
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Panel General</span>
                    </NavLink>

                    {/* DYNAMIC MODULES FILTERED PER TENANT */}
                    {activeTenant?.modules.map((mod) => (
                      <NavLink
                        key={mod}
                        to={`/app/${activeTenant.slug}/${mod}`}
                        onClick={onClose}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 px-3 py-2 rounded-pill text-xs font-semibold transition-all',
                            isActive
                              ? 'bg-champagne-500 text-navy-900 shadow-sm'
                              : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                          )
                        }
                      >
                        {MODULE_ICON_MAP[mod] || <Grid className="w-4 h-4" />}
                        <span>{MODULE_NAME_MAP[mod]}</span>
                      </NavLink>
                    ))}

                    <NavLink
                      to={`/app/${activeTenant?.slug || 'ecuaplac'}/ajustes`}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 rounded-pill text-xs font-semibold transition-all',
                          isActive
                            ? 'bg-champagne-500 text-navy-900 shadow-sm'
                            : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                        )
                      }
                    >
                      <Settings className="w-4 h-4" />
                      <span>Ajustes de Cuenta</span>
                    </NavLink>
                  </nav>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-navy-800/80 space-y-2">
            {isClientView && session.role === 'SUPERADMIN' ? (
              <button
                onClick={() => {
                  stopImpersonation();
                  navigate('/admin');
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-champagne-500/10 border border-champagne-500/40 text-champagne-300 hover:bg-champagne-500/20 rounded-pill text-xs font-semibold transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Volver a MYNEXT ADMIN</span>
              </button>
            ) : !isClientView ? (
              <button
                onClick={() => {
                  const first = clients[0];
                  setActiveTenantId(first.id);
                  navigate(`/app/${first.slug}`);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-navy-800 text-slate-300 hover:text-white hover:bg-navy-700 rounded-pill text-xs font-medium transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-champagne-400" />
                <span>Probar Vista de Cliente</span>
              </button>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
};

