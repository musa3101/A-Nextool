import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useTenant } from '../../context/TenantContext';

export const AuditLogs: React.FC = () => {
  const { auditLogs } = useTenant();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="success" dot>Registro Inmutable</Badge>
          <span className="text-xs text-slate-500 font-medium">Seguridad & Trazabilidad</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-navy-900 tracking-tight">
          Logs de Auditoría de la Plataforma
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Historial completo de acciones administrativas, cambios de módulos y accesos de clientes.
        </p>
      </div>

      <Card elevation="rest" className="p-0 overflow-hidden">
        <div className="divide-y divide-surface-border text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-900 text-sm">{log.action}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-champagne-500">{log.target}</span>
                  </div>
                  <span className="text-slate-500 text-[11px]">
                    Realizado por {log.user} ({log.ip})
                  </span>
                </div>
              </div>
              <span className="text-slate-400 font-mono text-xs">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

