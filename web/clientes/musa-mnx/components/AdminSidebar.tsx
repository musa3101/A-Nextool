import React from 'react';
import {
  LayoutGrid,
  FileText,
  Wrench,
  KeyRound,
  ExternalLink,
  LogOut,
  ChevronRight,
  Database,
  Layers,
} from 'lucide-react';
import { MUSA_ADMIN_CONFIG, ManagedClientConfig, MusaAdminTab } from '../config';

interface AdminSidebarProps {
  activeTab: MusaAdminTab;
  onSelectTab: (tab: MusaAdminTab) => void;
  currentClient: ManagedClientConfig;
  onSelectClient: (client: ManagedClientConfig) => void;
  unreadTicketsCount?: number;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  currentClient,
  onSelectClient,
  onLogout,
}) => {
  const clients = MUSA_ADMIN_CONFIG.clients;

  const navigationItems: {
    id: MusaAdminTab;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'apps',
      label: 'Panel Principal',
      sublabel: 'Todas las Aplicaciones',
      icon: LayoutGrid,
    },
    {
      id: 'facturas',
      label: 'Facturación',
      sublabel: 'Facturas Oficiales PDF',
      icon: FileText,
    },
    {
      id: 'mantenimiento',
      label: 'MyNext Care',
      sublabel: 'Mantenimiento Web',
      icon: Wrench,
    },
    {
      id: 'backends',
      label: 'Backends & API Keys',
      sublabel: 'Credenciales por Cliente',
      icon: KeyRound,
    },
  ];

  return (
    <aside className="w-68 shrink-0 h-screen sticky top-0 bg-[#090C12] border-r border-white/[0.08] flex flex-col justify-between p-5 select-none z-30 font-['Satoshi']">
      {/* Zona Superior */}
      <div className="space-y-6">
        {/* Cabecera Musa MNX */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0A0E1A] border border-[#C5A059]/40 flex items-center justify-center shadow-md">
              <span className="font-['Clash_Display'] font-black text-base text-[#F0CF85]">M</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-['Clash_Display'] text-sm font-bold text-white tracking-wide">
                  MUSA MNX
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-[#C5A059]/20 text-[#F0CF85] border border-[#C5A059]/30 tracking-wider">
                  ADMIN
                </span>
              </div>
              <span className="text-[10.5px] text-slate-400 block leading-tight mt-0.5">
                NexTool Control Center
              </span>
            </div>
          </div>
        </div>

        {/* Cliente Actual Activo */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Cliente en Gestión
            </span>
            <span className="text-[10px] text-emerald-400 font-medium font-mono">
              {currentClient.status === 'active' ? '● Activo' : 'Pausado'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0D111A] border border-white/[0.08] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-white block truncate">
                  {currentClient.name}
                </span>
                <span className="text-[10px] text-slate-400 block truncate font-mono">
                  {currentClient.websiteUrl.replace('https://', '')}
                </span>
              </div>
            </div>

            <a
              href={currentClient.appRoute}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Abrir app del cliente"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Navegación Principal (Los 4 Pilares) */}
        <nav className="space-y-1.5 pt-1">
          {navigationItems.map((item) => {
            const isTabActive =
              activeTab === item.id ||
              (item.id === 'apps' && activeTab === 'torre') ||
              (item.id === 'facturas' && activeTab === 'facturacion');
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all duration-150 cursor-pointer group active:scale-[0.98] ${
                  isTabActive
                    ? 'bg-white/[0.08] text-white border border-[#C5A059]/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isTabActive
                        ? 'bg-[#C5A059] text-slate-950 font-bold'
                        : 'bg-white/[0.05] text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold block truncate leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate mt-0.5 leading-tight">
                      {item.sublabel}
                    </span>
                  </div>
                </div>

                {isTabActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Pie del Sidebar: Usuario y Cerrar Sesión */}
      <div className="pt-4 border-t border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C5A059]/20 to-[#C5A059]/5 border border-[#C5A059]/30 flex items-center justify-center font-bold text-xs text-[#F0CF85] shrink-0">
              M
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-white block truncate leading-tight">
                Musa
              </span>
              <span className="text-[10px] text-slate-400 block truncate font-mono mt-0.5 leading-tight">
                mynextbymusa@gmail.com
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
            title="Cerrar Sesión SuperAdmin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center">
          <span className="text-[10px] text-slate-400 font-mono">
            NexTool Architecture v3.1.1
          </span>
        </div>
      </div>
    </aside>
  );
};
