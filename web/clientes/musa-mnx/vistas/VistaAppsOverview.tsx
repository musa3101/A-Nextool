import React from 'react';
import {
  Globe,
  ExternalLink,
  Shield,
  FileText,
  KeyRound,
  Wrench,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  Layers,
  Sparkles,
  Database,
  Activity,
  Calendar,
} from 'lucide-react';
import { MUSA_ADMIN_CONFIG, ManagedClientConfig, MusaAdminTab } from '../config';

interface VistaAppsOverviewProps {
  onNavigateTab: (tab: MusaAdminTab, client?: ManagedClientConfig) => void;
  onSelectClient: (client: ManagedClientConfig) => void;
}

export const VistaAppsOverview: React.FC<VistaAppsOverviewProps> = ({
  onNavigateTab,
  onSelectClient,
}) => {
  const clients = MUSA_ADMIN_CONFIG.clients;
  const primaryClient = clients[0];

  return (
    <div className="p-8 space-y-8 select-none font-['Satoshi'] max-w-7xl mx-auto">
      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white font-['Clash_Display']">
              Panel Principal de Aplicaciones
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {clients.length} {clients.length === 1 ? 'App Activa' : 'Apps Activas'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Control centralizado de todas las webs y aplicaciones entregadas a tus clientes. Acceso directo a portales, facturas, mantenimiento y backends.
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[11px] text-slate-400 block font-mono">NexTool Engine</span>
          <span className="text-xs font-semibold text-slate-200">Suite SuperAdmin</span>
        </div>
      </div>

      {/* Bento Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Tarjeta Hero del Cliente Activo (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {clients.map((client) => (
            <div
              key={client.id}
              className="rounded-2xl musa-glass-panel p-6 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden group"
            >
              {/* Encabezado del Cliente */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0A0E1A] border border-[#C5A059]/40 flex items-center justify-center shrink-0 shadow-lg shadow-[#C5A059]/5">
                    <span className="font-['Clash_Display'] font-black text-2xl text-[#F0CF85]">
                      {client.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl font-bold text-white font-['Clash_Display'] tracking-wide">
                        {client.name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        En Producción
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{client.tagline}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">
                    Versión
                  </span>
                  <span className="text-sm font-mono font-bold text-[#F0CF85]">v3.1.1</span>
                </div>
              </div>

              {/* Fila de Datos Clave en 3 Columnas Limpias */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-black/40 border border-white/[0.06] text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">
                    Titular
                  </span>
                  <span className="text-white font-semibold truncate block mt-0.5">
                    {client.ownerName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">
                    Dominio Oficial
                  </span>
                  <span className="text-white font-semibold truncate block mt-0.5 font-mono">
                    {client.websiteUrl.replace('https://', '')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">
                    Base de Datos
                  </span>
                  <span className="text-emerald-400 font-semibold truncate block mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    Cloud Activo
                  </span>
                </div>
              </div>

              {/* Botones de Acción Directa: Web y Portal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <a
                  href={client.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="h-11 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer musa-btn-interactive"
                >
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span>Visitar Web Oficial</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </a>

                <a
                  href={client.appRoute}
                  target="_blank"
                  rel="noreferrer"
                  className="h-11 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-[#C5A059] text-slate-950 font-bold text-xs shadow-lg shadow-[#C5A059]/15 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer musa-btn-interactive"
                >
                  <Layers className="w-4 h-4 text-slate-950" />
                  <span>Abrir App Cliente</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
                </a>
              </div>

              {/* Atajos Rápidos a los Otros Módulos */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-slate-400">Atajos de Gestión:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectClient(client);
                      onNavigateTab('facturas', client);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer musa-btn-interactive"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Facturas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectClient(client);
                      onNavigateTab('mantenimiento', client);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer musa-btn-interactive"
                  >
                    <Wrench className="w-3.5 h-3.5 text-slate-400" />
                    <span>MyNext Care</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectClient(client);
                      onNavigateTab('backends', client);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer musa-btn-interactive"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Backend & Auditoría</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Tarjeta para Próximos Proyectos */}
          <div className="rounded-2xl border border-dashed border-white/[0.1] p-6 flex items-center justify-between gap-4 bg-white/[0.01]">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 shrink-0">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-200">Preparado para Nuevos Clientes</h3>
                <p className="text-[11px] text-slate-400">
                  Cuando des de alta otra aplicación en NexTool, aparecerá automáticamente aquí.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest shrink-0">
              Multi-Tenant
            </span>
          </div>
        </div>

        {/* Columna Derecha: Tarjetas Bento Complementarias (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card Bento 1: Estado MyNext Care */}
          <div className="p-5 rounded-2xl musa-glass-panel space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
                  <img src="/icons/mynext-care-icon.png" alt="Care" className="w-full h-full object-contain" />
                </div>
                <span className="text-xs font-bold text-white font-['Clash_Display']">MyNext Care</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Al Día
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Mantenimiento web activo para <strong className="text-slate-200">{primaryClient.name}</strong>. Revisión preventiva y actualización v3.1.1 en producción.
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab('mantenimiento', primaryClient)}
              className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-all text-center cursor-pointer musa-btn-interactive"
            >
              Ver Ficha de Mantenimiento
            </button>
          </div>

          {/* Card Bento 2: Facturas Oficiales */}
          <div className="p-5 rounded-2xl musa-glass-panel space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-white font-['Clash_Display']">Facturación</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">PDF Oficial</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Sube facturas oficiales directamente a la aplicación del cliente para que las descargue en su móvil.
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab('facturas', primaryClient)}
              className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-all text-center cursor-pointer musa-btn-interactive"
            >
              Subir o Gestionar Facturas
            </button>
          </div>

          {/* Card Bento 3: Registro Forense de Auditoría */}
          <div className="p-5 rounded-2xl musa-glass-panel space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#F0CF85] shrink-0">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-white font-['Clash_Display']">Auditoría & Logs</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Inmutable</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Supervisión en tiempo real de cambios de fotos, edición de obras y acciones del cliente en la aplicación.
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab('backends', primaryClient)}
              className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-all text-center cursor-pointer musa-btn-interactive"
            >
              Consultar Logs de Movimientos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
