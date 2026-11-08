import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Grid,
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  ExternalLink,
  ShieldAlert,
  Save,
  CheckCircle2,
  Clock,
  Images,
  UtensilsCrossed,
  MailQuestion,
  CalendarCheck,
  FileEdit,
  Scissors,
  Languages,
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Switch } from '../../components/ui/Switch';
import { SlideOver } from '../../components/ui/SlideOver';
import { AVAILABLE_MODULES } from '../../data/mockData';
import { ClientTenant, ModuleType } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { clients, auditLogs, toggleTenantModule, setActiveTenantId } = useTenant();
  const { startImpersonation } = useAuth();
  const navigate = useNavigate();

  // View state: 'table' vs 'cards'
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedClientForModules, setSelectedClientForModules] = useState<ClientTenant | null>(null);
  const [sectorFilter, setSectorFilter] = useState<string>('todos');

  // Filter clients
  const filteredClients = clients.filter((c) =>
    sectorFilter === 'todos' ? true : c.sector === sectorFilter
  );

  const totalModulesDeployed = clients.reduce((acc, c) => acc + c.modules.length, 0);

  const handleImpersonate = (client: ClientTenant) => {
    setActiveTenantId(client.id);
    startImpersonation(client.id, client.name);
    navigate(`/app/${client.slug}`);
  };

  const getModuleIcon = (id: ModuleType) => {
    switch (id) {
      case 'galerias': return <Images className="w-3.5 h-3.5" />;
      case 'menus': return <UtensilsCrossed className="w-3.5 h-3.5" />;
      case 'leads': return <MailQuestion className="w-3.5 h-3.5" />;
      case 'citas': return <CalendarCheck className="w-3.5 h-3.5" />;
      case 'editor': return <FileEdit className="w-3.5 h-3.5" />;
      case 'servicios': return <Scissors className="w-3.5 h-3.5" />;
      case 'traduccion': return <Languages className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Ejecutivo & Controles */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="navy">MYNEXT ADMIN v2.0</Badge>
            <span className="text-xs text-slate-500 font-medium">Consola Centralizada</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-navy-900 tracking-tight">
            Gestión Global de Clientes y Módulos
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Supervisión multitenant, activación dinámica de herramientas y control de infraestructura.
          </p>
        </div>

        {/* View mode toggle (Table vs Cards) */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-surface-muted p-1 rounded-pill border border-surface-border">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold transition-all ${
              viewMode === 'table'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Modo Tabla</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold transition-all ${
              viewMode === 'cards'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Modo Tarjetas</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Strip (Tarjetas de Métricas Clave) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card elevation="rest" className="border-l-4 border-l-navy-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Clientes Activos
            </span>
            <div className="w-8 h-8 rounded-full bg-navy-900/10 text-navy-900 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-navy-900">{clients.length}</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              100% operativos
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Ecuaplac y Buon Appetito
          </span>
        </Card>

        <Card elevation="rest" className="border-l-4 border-l-champagne-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Módulos Desplegados
            </span>
            <div className="w-8 h-8 rounded-full bg-champagne-500/20 text-champagne-500 flex items-center justify-center">
              <Grid className="w-4 h-4 text-amber-900" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-navy-900">{totalModulesDeployed}</span>
            <span className="text-xs text-amber-800 font-semibold">reutilizables</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Promedio: {(totalModulesDeployed / clients.length).toFixed(1)} módulos/cliente
          </span>
        </Card>

        <Card elevation="rest" className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cloudflare Edge CDN
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-navy-900">99.98%</span>
            <span className="text-xs text-emerald-600 font-semibold">SLA Óptimo</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Workers & D1 sin latencia</span>
        </Card>

        <Card elevation="rest" className="border-l-4 border-l-slate-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Leads & Consultas
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-navy-900">142</span>
            <span className="text-xs text-slate-600 font-semibold">este mes</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Formularios y presupuestos</span>
        </Card>
      </div>

      {/* 3. Filtros por Sector */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-surface-border">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {['todos', 'Reformas', 'Hostelería'].map((sec) => (
            <button
              key={sec}
              onClick={() => setSectorFilter(sec)}
              className={`px-3 py-1.5 rounded-pill text-xs font-semibold whitespace-nowrap transition-all ${
                sectorFilter === sec
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-white border border-surface-border text-slate-600 hover:bg-slate-50'
              }`}
            >
              {sec === 'todos' ? 'Todos los sectores' : sec}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Mostrando {filteredClients.length} de {clients.length} negocios
        </span>
      </div>

      {/* 4. Vista de Clientes (Tabla o Tarjetas) */}
      {viewMode === 'table' ? (
        /* TABLE VIEW */
        <Card elevation="rest" className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted/70 text-slate-600 uppercase font-bold text-[11px] tracking-wider border-b border-surface-border">
                <tr>
                  <th className="py-3.5 px-6">Negocio / Cliente</th>
                  <th className="py-3.5 px-4">Sector</th>
                  <th className="py-3.5 px-4">Web Pública</th>
                  <th className="py-3.5 px-4">Módulos Habilitados</th>
                  <th className="py-3.5 px-4 text-center">Plan</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-navy-900 text-champagne-400 font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm">
                          {client.logoText}
                        </div>
                        <div>
                          <span className="font-bold text-navy-900 text-sm block">
                            {client.name}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Contacto: {client.contactName}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-pill text-[11px] font-medium text-slate-700">
                        {client.sector}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-mono text-[11px]">
                      <a
                        href={client.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-navy-900 hover:text-champagne-500 flex items-center gap-1 underline underline-offset-2"
                      >
                        <span>{client.websiteUrl.replace('https://', '')}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                        {client.modules.map((m) => (
                          <span
                            key={m}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200/60"
                          >
                            {getModuleIcon(m)}
                            <span className="capitalize">{m}</span>
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <Badge variant={client.plan === 'Pro' || client.plan === 'Enterprise' ? 'champagne' : 'neutral'}>
                        {client.plan}
                      </Badge>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
                          onClick={() => setSelectedClientForModules(client)}
                        >
                          Módulos
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<ShieldAlert className="w-3.5 h-3.5 text-champagne-400" />}
                          onClick={() => handleImpersonate(client)}
                        >
                          Entrar como Cliente
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* CARDS / GRID VIEW (From Stitch Panel Maestro) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => (
            <Card key={client.id} elevation="hover" className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy-900 text-champagne-400 font-extrabold flex items-center justify-center text-sm shadow-sm">
                      {client.logoText}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-navy-900">{client.name}</h3>
                      <span className="text-xs text-slate-500">{client.sector}</span>
                    </div>
                  </div>
                  <Badge variant={client.plan === 'Pro' || client.plan === 'Enterprise' ? 'champagne' : 'neutral'}>
                    {client.plan}
                  </Badge>
                </div>

                <div className="py-3 border-y border-surface-border/60 my-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Web enlazada:</span>
                    <a
                      href={client.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-navy-900 font-medium hover:underline flex items-center gap-1"
                    >
                      <span>{client.websiteUrl.replace('https://', '')}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Última actividad:</span>
                    <span className="text-slate-700 font-medium">{client.lastActivity}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Módulos Activos ({client.modules.length})
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {client.modules.map((m) => (
                      <span
                        key={m}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200"
                      >
                        {getModuleIcon(m)}
                        <span className="capitalize">{m}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-surface-border flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
                  onClick={() => setSelectedClientForModules(client)}
                >
                  Configurar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  icon={<ShieldAlert className="w-3.5 h-3.5 text-champagne-400" />}
                  onClick={() => handleImpersonate(client)}
                >
                  Entrar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 5. Panel de Auditoría en Tiempo Real */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-champagne-500" />
              <span>Registro de Auditoría de Superadministrador</span>
            </h2>
            <p className="text-xs text-slate-500">
              Trazabilidad obligatoria de acciones administrativas y cambios de módulos.
            </p>
          </div>
          <Badge variant="success" dot>Auditoría en vivo</Badge>
        </div>

        <Card elevation="rest" className="p-0 overflow-hidden">
          <div className="divide-y divide-surface-border text-xs">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy-900">{log.action}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-semibold text-champagne-500">{log.target}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Por {log.user} ({log.ip})
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 6. SlideOver Drawer de Asignación de Módulos (Exacto de Stitch) */}
      <SlideOver
        isOpen={Boolean(selectedClientForModules)}
        onClose={() => setSelectedClientForModules(null)}
        title={selectedClientForModules ? `Módulos: ${selectedClientForModules.name}` : ''}
        subtitle="Activa o desactiva herramientas en tiempo real para este cliente."
        footer={
          <Button
            variant="primary"
            size="md"
            icon={<Save className="w-4 h-4" />}
            onClick={() => setSelectedClientForModules(null)}
          >
            Guardar Cambios
          </Button>
        }
      >
        {selectedClientForModules && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200/80">
              Los cambios en los interruptores se aplican instantáneamente al menú del cliente.
            </div>

            <div className="space-y-3">
              {AVAILABLE_MODULES.map((mod) => {
                const isEnabled = selectedClientForModules.modules.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    className={`p-3.5 rounded-card border transition-all ${
                      isEnabled
                        ? 'bg-white border-slate-200 shadow-atelier-sm'
                        : 'bg-slate-50/60 border-slate-200/50 opacity-75'
                    }`}
                  >
                    <Switch
                      checked={isEnabled}
                      onChange={(checked) => {
                        toggleTenantModule(selectedClientForModules.id, mod.id, checked);
                        // update local preview
                        setSelectedClientForModules((prev) =>
                          prev
                            ? {
                                ...prev,
                                modules: checked
                                  ? [...prev.modules, mod.id]
                                  : prev.modules.filter((m) => m !== mod.id),
                              }
                            : null
                        );
                      }}
                      label={mod.name}
                      description={mod.description}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
};

