import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Layers,
  ArrowUpRight,
  Upload,
  Edit3,
  Trash2,
  Activity,
  User,
} from 'lucide-react';
import { musaConnector, GlobalAuditLogItem } from '../conector';

interface VistaLogsAuditoriaProps {
  selectedClientSlug: string;
}

export const VistaLogsAuditoria: React.FC<VistaLogsAuditoriaProps> = ({ selectedClientSlug }) => {
  const [logs, setLogs] = useState<GlobalAuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<'all' | 'upload' | 'edit' | 'delete' | 'status' | 'sync'>('all');

  const fetchLogs = async () => {
    setLoading(true);
    const data = await musaConnector.getGlobalAuditLogs(selectedClientSlug);
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedClientSlug]);

  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'all' && log.actionType !== actionFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.description.toLowerCase().includes(q) ||
      log.actorName.toLowerCase().includes(q) ||
      log.targetEntity.toLowerCase().includes(q) ||
      log.clientName.toLowerCase().includes(q)
    );
  });

  const getActionBadge = (type: GlobalAuditLogItem['actionType']) => {
    switch (type) {
      case 'upload':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Upload className="w-3 h-3" /> Subida
          </span>
        );
      case 'edit':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Edit3 className="w-3 h-3" /> Edición
          </span>
        );
      case 'delete':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <Trash2 className="w-3 h-3" /> Borrado
          </span>
        );
      case 'status':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Activity className="w-3 h-3" /> Estado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <RefreshCw className="w-3 h-3" /> Sync
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            <span>Consola de Auditoría & Logs</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              AUDIT TRAIL
            </span>
          </h2>
          <p className="text-xs text-stone-400 font-sans mt-1">
            Registro cronológico inmutable de todas las acciones ejecutadas por los clientes en sus aplicaciones.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200 border border-white/10 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refrescar Logs</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0F172A]/90 border border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por descripción, autor o módulo..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-[#C5A059]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'upload', 'edit', 'status', 'delete', 'sync'] as const).map((filter) => {
            const isActive = actionFilter === filter;
            const labels: Record<string, string> = {
              all: 'Todos',
              upload: 'Subidas',
              edit: 'Ediciones',
              status: 'Estados',
              delete: 'Borrados',
              sync: 'Sincronizaciones',
            };

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActionFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#C5A059] text-slate-950 shadow-md font-extrabold'
                    : 'bg-white/5 text-stone-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {labels[filter]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Logs Table (Mac & iPad full width) */}
      <div className="rounded-3xl bg-[#0F172A]/90 border border-white/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/40 text-[10px] font-extrabold uppercase tracking-widest text-stone-400 font-sans">
                <th className="py-3.5 px-5">Fecha / Hora</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Acción</th>
                <th className="py-3.5 px-4">Autor</th>
                <th className="py-3.5 px-5">Descripción de la Operación</th>
                <th className="py-3.5 px-4 text-right">Módulo Afectado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400 font-medium">
                    No se encontraron registros de auditoría para este filtro.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5 font-mono text-stone-400 whitespace-nowrap text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="py-4 px-4 font-semibold text-stone-200 whitespace-nowrap">
                      {log.clientName}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getActionBadge(log.actionType)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-stone-300 font-medium">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        {log.actorName}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-stone-200 font-medium">
                      {log.description}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-[11px] text-[#F0CF85] whitespace-nowrap">
                      {log.targetEntity}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

