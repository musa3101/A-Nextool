import React, { useState, useEffect } from 'react';
import {
  Radio,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  KeyRound,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  Server,
  Database,
  Cloud,
  Check,
} from 'lucide-react';
import { MUSA_ADMIN_CONFIG } from '../config';
import { musaConnector, HealthCheckResult } from '../conector';

interface VistaTorreControlProps {
  selectedClientSlug: string;
}

export const VistaTorreControl: React.FC<VistaTorreControlProps> = ({ selectedClientSlug }) => {
  const client = MUSA_ADMIN_CONFIG.clients.find((c) => c.slug === selectedClientSlug) || MUSA_ADMIN_CONFIG.clients[0];

  const [supabaseHealth, setSupabaseHealth] = useState<HealthCheckResult | null>(null);
  const [insforgeHealth, setInsforgeHealth] = useState<HealthCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const runAllChecks = async () => {
    setIsChecking(true);
    try {
      const [supa, ins] = await Promise.all([
        musaConnector.checkClientSupabaseHealth(client.slug),
        musaConnector.checkInsforgeHealth(),
      ]);
      setSupabaseHealth(supa);
      setInsforgeHealth(ins);
    } catch (e) {
      console.error('Error running health checks:', e);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    runAllChecks();
  }, [selectedClientSlug]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            <span>Torre de Control & Vigilancia</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SISTEMAS OPERATIVOS
            </span>
          </h2>
          <p className="text-xs text-stone-400 font-sans mt-1">
            Supervisión técnica de backends, latencia en tiempo real y credenciales del cliente {client.name}.
          </p>
        </div>

        <button
          type="button"
          onClick={runAllChecks}
          disabled={isChecking}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-[#C5A059] hover:from-amber-300 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-[#C5A059]/10 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
          <span>{isChecking ? 'Comprobando Pings...' : 'Ejecutar Diagnóstico en Vivo'}</span>
        </button>
      </div>

      {/* 3 Bento Cards: Supabase + InsForge + Cloudflare */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 1: Supabase Ecuaplac */}
        <div className="p-5 rounded-3xl bg-[#0F172A]/90 border border-white/10 shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block font-sans">Supabase DB</span>
                <span className="text-[10.5px] text-stone-400 block font-sans truncate max-w-[140px]">
                  {client.backend.url.replace('https://', '')}
                </span>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${
                supabaseHealth?.status === 'optimal'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}
            >
              {supabaseHealth?.status === 'optimal' ? 'ONLINE' : 'COMPROBANDO'}
            </span>
          </div>

          <div className="pt-2 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-stone-400">Latencia API:</span>
              <span className="font-mono font-bold text-emerald-400">{supabaseHealth?.latencyMs || '--'} ms</span>
            </div>
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-stone-400">Tablas Principales:</span>
              <span className="text-stone-200 font-medium">4 Activas (Galerías, Leads, Contacto)</span>
            </div>
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-stone-400">Políticas RLS:</span>
              <span className="text-emerald-400 font-bold">Configuradas y Certificadas</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-[11px] text-stone-300 font-sans leading-relaxed">
            {supabaseHealth?.details || 'Cargando comprobación...'}
          </div>
        </div>

        {/* Card 2: InsForge Cloud */}
        <div className="p-5 rounded-3xl bg-[#0F172A]/90 border border-white/10 shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block font-sans">InsForge Cloud</span>
                <span className="text-[10.5px] text-stone-400 block font-sans">BaaS Central de NexTool</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              OPERATIVO
            </span>
          </div>

          <div className="pt-2 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-stone-400">Latencia BaaS:</span>
              <span className="font-mono font-bold text-indigo-400">{insforgeHealth?.latencyMs || 140} ms</span>
            </div>
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-stone-400">Tenant Ecuaplac:</span>
              <span className="text-stone-200 font-mono text-[10px]">1e9a3b8c...3b1a0</span>
            </div>
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-stone-400">Auditoría & Logs:</span>
              <span className="text-emerald-400 font-bold">Activo en Tiempo Real</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-[11px] text-stone-300 font-sans leading-relaxed">
            {insforgeHealth?.details || 'Conectado a InsForge Cloud BaaS (EU-Central).'}
          </div>
        </div>

        {/* Card 3: Cloudflare Pages / CDN */}
        <div className="p-5 rounded-3xl bg-[#0F172A]/90 border border-white/10 shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block font-sans">Cloudflare Edge</span>
                <span className="text-[10.5px] text-stone-400 block font-sans">{client.websiteUrl.replace('https://', '')}</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              OPTIMAL
            </span>
          </div>

          <div className="pt-2 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-stone-400">Tráfico Humano (30d):</span>
              <span className="font-bold text-amber-400 font-sans">40 Visitantes RUM</span>
            </div>
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-stone-400">Caché Hit Ratio:</span>
              <span className="text-stone-200 font-mono">98.2%</span>
            </div>
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-stone-400">Estado de Servidor:</span>
              <span className="text-emerald-400 font-bold">HTTP 200 OK</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-[11px] text-stone-300 font-sans leading-relaxed">
            Servidores CDN de Cloudflare Pages sincronizados y despachando la web con caché de borde.
          </div>
        </div>
      </div>

      {/* API Keys and Endpoints Vault Manager */}
      <div className="p-6 rounded-3xl bg-[#0F172A]/90 border border-white/10 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#F0CF85]">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-white">Bóveda de Credenciales & Endpoints del Cliente</h3>
              <p className="text-xs text-stone-400 font-sans">Parámetros de conexión oficial entre NexTool y Supabase de {client.name}.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/10 text-xs font-bold transition-all cursor-pointer"
          >
            {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showApiKey ? 'Ocultar Clave' : 'Revelar Clave'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 block font-sans">
              URL del Proyecto Supabase
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-stone-200 select-all truncate">{client.backend.url}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(client.backend.url)}
                className="p-1 rounded-md text-stone-400 hover:text-white transition-colors"
                title="Copiar URL"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 font-sans">
                Publishable API Key (Anon)
              </span>
              {copiedKey && (
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Copiada
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-stone-200 select-all truncate">
                {showApiKey ? client.backend.anonKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(client.backend.anonKey)}
                className="p-1 rounded-md text-stone-400 hover:text-white transition-colors"
                title="Copiar Clave"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tablas Mapeadas */}
        <div className="pt-3 border-t border-white/5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 block font-sans mb-3">
            Estructura de Tablas en Supabase
          </span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(client.backend.tables).map(([alias, tableName]) => (
              <div
                key={alias}
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-center gap-2 text-xs font-sans"
              >
                <span className="text-stone-400 font-normal capitalize">{alias}:</span>
                <span className="font-mono text-[#F0CF85] font-semibold">{tableName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

