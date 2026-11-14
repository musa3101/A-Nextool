import React, { useState, useEffect } from 'react';
import { musaConnector } from './conector';
import { MUSA_ADMIN_CONFIG, ManagedClientConfig, MusaAdminTab } from './config';
import { AdminLogin } from './components/AdminLogin';
import { VistaAppsOverview } from './vistas/VistaAppsOverview';
import { VistaFacturacion } from './vistas/VistaFacturacion';
import { VistaMantenimiento } from './vistas/VistaMantenimiento';
import { VistaBackends } from './vistas/VistaBackends';
import {
  GlassAdjustModal,
  GlassSettings,
  DEFAULT_GLASS_SETTINGS,
} from './components/GlassAdjustModal';
import './styles/glass-theme.css';
import {
  LayoutGrid,
  FileText,
  Wrench,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Clock,
  Settings2,
  LogOut,
  Layers,
  Laptop,
  Tablet,
  CheckCircle2,
} from 'lucide-react';

export const MusaAdminPortal: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => musaConnector.isAuthenticated());
  const [activeTab, setActiveTab] = useState<MusaAdminTab>('apps');
  const [currentClient, setCurrentClient] = useState<ManagedClientConfig>(MUSA_ADMIN_CONFIG.clients[0]);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Configuración de Cristal Ajustable (Persistida con Purga de Tinte Sucio)
  const [glassSettings, setGlassSettings] = useState<GlassSettings>(() => {
    try {
      const cached = localStorage.getItem('musa_glass_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        // Si tiene el tinte marrón antiguo #eadbc7 del componente demo de 21st, purgarlo
        if (parsed.tint && (parsed.tint.toLowerCase() === '#eadbc7' || parsed.tint.toLowerCase() === '#ffffff')) {
          parsed.tint = DEFAULT_GLASS_SETTINGS.tint;
        }
        return { ...DEFAULT_GLASS_SETTINGS, ...parsed };
      }
    } catch {}
    return DEFAULT_GLASS_SETTINGS;
  });
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const handleUpdateGlass = (patch: Partial<GlassSettings>) => {
    const updated = { ...glassSettings, ...patch };
    setGlassSettings(updated);
    try {
      localStorage.setItem('musa_glass_settings', JSON.stringify(updated));
    } catch {}
  };

  const handleResetGlass = () => {
    setGlassSettings(DEFAULT_GLASS_SETTINGS);
    try {
      localStorage.setItem('musa_glass_settings', JSON.stringify(DEFAULT_GLASS_SETTINGS));
    } catch {}
  };

  // Reloj en tiempo real (Madrid CET)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Europe/Madrid',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    musaConnector.logout();
    setIsAuthenticated(false);
  };

  const handleSelectClient = (client: ManagedClientConfig) => {
    setCurrentClient(client);
  };

  // Si no está autenticado, mostramos la pantalla de Login
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const navigationItems = [
    {
      id: 'apps' as MusaAdminTab,
      label: 'Panel Principal',
      sublabel: 'Todas las Aplicaciones',
      icon: LayoutGrid,
    },
    {
      id: 'facturas' as MusaAdminTab,
      label: 'Facturación',
      sublabel: 'Facturas Oficiales PDF',
      icon: FileText,
    },
    {
      id: 'mantenimiento' as MusaAdminTab,
      label: 'MyNext Care',
      sublabel: 'Mantenimiento Web',
      icon: Wrench,
    },
    {
      id: 'backends' as MusaAdminTab,
      label: 'Backends & Auditoría',
      sublabel: 'Credenciales & Logs',
      icon: KeyRound,
    },
  ];

  const tabLabels: Record<MusaAdminTab, string> = {
    apps: 'Panel Principal de Aplicaciones',
    facturas: 'Facturación & Documentos PDF',
    mantenimiento: 'MyNext Care',
    backends: 'Bóveda de Backends, APIs & Auditoría',
    torre: 'Panel Principal de Aplicaciones',
    facturacion: 'Facturación & Documentos PDF',
    soporte: 'Soporte',
    logs: 'Logs',
  };

  return (
    <>
      {/* 1. Guardia de pantalla pequeña (< 1024px) - Bloqueo de Móvil */}
      <div className="min-[1024px]:hidden fixed inset-0 z-50 bg-[#080A0E] text-slate-200 p-8 flex flex-col items-center justify-center text-center space-y-5 select-none font-['Satoshi']">
        <div className="w-14 h-14 rounded-2xl bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center text-[#F0CF85] font-bold shadow-lg">
          <span className="font-['Clash_Display'] text-xl">MNX</span>
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="font-['Clash_Display'] text-xl font-semibold text-white">
            Consola Exclusiva para Mac & iPad
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            La consola de gestión de Musa está diseñada para pantallas de alta resolución (MacBook, iMac, iPad Pro/Air) para garantizar una visión espaciosa, nítida y descansada.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 font-mono pt-2">
          <span className="flex items-center gap-1.5">
            <Laptop className="w-4 h-4 text-[#C5A059]" /> Mac Retina
          </span>
          <span className="flex items-center gap-1.5">
            <Tablet className="w-4 h-4 text-[#C5A059]" /> iPad Pro / Air
          </span>
        </div>
      </div>

      {/* 2. Workspace Maestro Musa MNX con Diseño Suizo y Cristal Obsidiana (>= 1024px) */}
      <div
        className="hidden min-[1024px]:flex musa-glass-root select-none font-['Satoshi'] h-screen w-screen flex-col overflow-hidden"
        style={
          {
            '--gw-blur': `${glassSettings.blur}px`,
            '--gw-opacity': glassSettings.opacity,
            '--gw-saturation': glassSettings.saturation,
            '--gw-tint': glassSettings.tint,
            '--gw-edge': glassSettings.edge,
          } as React.CSSProperties
        }
      >
        {/* Modal de Control de Ajuste de Cristal */}
        <GlassAdjustModal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          settings={glassSettings}
          onChange={handleUpdateGlass}
          onReset={handleResetGlass}
        />

        {/* Header Superior Limpio e Integrado (h-15) */}
        <header className="h-15 shrink-0 px-7 border-b border-white/[0.08] bg-[#0A0D14]/80 backdrop-blur-xl flex items-center justify-between z-30">
          {/* Marca MUSA MNX */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0A0E1A] border border-[#C5A059]/40 flex items-center justify-center shadow-md">
              <span className="font-['Clash_Display'] font-black text-sm text-[#F0CF85]">M</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-['Clash_Display'] text-sm font-bold text-white tracking-wide">
                MUSA MNX
              </span>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#C5A059]/20 text-[#F0CF85] border border-[#C5A059]/30 tracking-wider">
                ADMIN
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-white/[0.08] text-xs">
              <span className="text-slate-500 font-medium">Cliente:</span>
              <span className="text-[#F0CF85] font-semibold">{currentClient.name}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-300 font-medium">{tabLabels[activeTab]}</span>
            </div>
          </div>

          {/* Acciones de Cabecera */}
          <div className="flex items-center gap-3">
            {/* Reloj Madrid */}
            <div className="h-8 px-3 rounded-xl bg-black/40 border border-white/[0.08] flex items-center gap-2 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-[#F0CF85]" />
              <span>{currentTime || '14:00:00'}</span>
              <span className="text-[10px] text-slate-500">CET</span>
            </div>

            {/* Enlace Directo Web Cliente */}
            <a
              href={currentClient.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="h-8 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer musa-btn-interactive"
            >
              <span>{currentClient.websiteUrl.replace('https://', '')}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {/* Botón Ajustar Cristal */}
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(!isAdjustModalOpen)}
              className={`h-8 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer musa-btn-interactive ${
                isAdjustModalOpen
                  ? 'bg-[#C5A059] text-slate-950 border-[#C5A059] shadow-md shadow-[#C5A059]/20'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300 hover:text-white'
              }`}
              title="Ajustar material de cristal, desenfoque y opacidad"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Ajustar Cristal</span>
            </button>

            {/* Avatar Musa */}
            <div className="flex items-center gap-2 pl-3 border-l border-white/[0.08]">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#C5A059]/30 to-[#C5A059]/10 border border-[#C5A059]/40 flex items-center justify-center font-bold text-[11px] text-[#F0CF85]">
                M
              </div>
              <span className="text-xs font-semibold text-white">Musa</span>
            </div>
          </div>
        </header>

        {/* Zona de Trabajo: Sidebar Lateral Fino + Contenedor de Vistas */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Sidebar de Navegación Suizo (w-60) */}
          <aside className="w-60 shrink-0 border-r border-white/[0.08] bg-[#0A0D14]/60 backdrop-blur-xl flex flex-col justify-between p-4 z-20">
            <div className="space-y-4">
              {/* Cliente en Gestión Activo */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    En Gestión
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Activo
                  </span>
                </div>
                <p className="text-xs font-bold text-white truncate">{currentClient.name}</p>
                <p className="text-[10px] text-slate-400 truncate font-mono">
                  {currentClient.websiteUrl.replace('https://', '')}
                </p>
              </div>

              {/* Botones de Navegación */}
              <nav className="space-y-1">
                {navigationItems.map((item) => {
                  const isActive =
                    activeTab === item.id ||
                    (item.id === 'apps' && activeTab === 'torre') ||
                    (item.id === 'facturas' && activeTab === 'facturacion');
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all cursor-pointer group active:scale-[0.98] ${
                        isActive
                          ? 'bg-[#C5A059] text-slate-950 font-bold shadow-md shadow-[#C5A059]/15'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-white'}`} />
                      <div className="min-w-0">
                        <span className="text-xs block truncate leading-tight font-semibold">
                          {item.label}
                        </span>
                        <span className={`text-[10px] block truncate leading-tight mt-0.5 ${isActive ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                          {item.sublabel}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Pie del Sidebar: Versión de Admin y Cerrar Sesión */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <div className="text-[10.5px] text-slate-400 font-mono">
                Musa MNX v0.0.1
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </aside>

          {/* Área Principal de Contenido (flex-1) */}
          <main className="flex-1 min-h-0 overflow-y-auto relative bg-gradient-to-br from-white/[0.01] to-transparent">
            {(activeTab === 'apps' || activeTab === 'torre') && (
              <VistaAppsOverview
                onNavigateTab={(tab, client) => {
                  setActiveTab(tab);
                  if (client) setCurrentClient(client);
                }}
                onSelectClient={handleSelectClient}
              />
            )}

            {(activeTab === 'facturas' || activeTab === 'facturacion') && (
              <VistaFacturacion currentClient={currentClient} />
            )}

            {activeTab === 'mantenimiento' && (
              <VistaMantenimiento currentClient={currentClient} />
            )}

            {activeTab === 'backends' && (
              <VistaBackends
                currentClient={currentClient}
                onSelectClient={handleSelectClient}
              />
            )}
          </main>
        </div>
      </div>
    </>
  );
};
