import React from 'react';
import { Grid, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { AVAILABLE_MODULES } from '../../data/mockData';
import { useTenant } from '../../context/TenantContext';

export const ModulesCatalog: React.FC = () => {
  const { clients } = useTenant();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="navy">Arquitectura Modular</Badge>
          <span className="text-xs text-slate-500 font-medium">Librería de Componentes</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-navy-900 tracking-tight">
          Catálogo Oficial de Módulos Reutilizables
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Herramientas estándar que pueden activarse selectivamente en los paneles de los clientes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {AVAILABLE_MODULES.map((mod) => {
          const usageCount = clients.filter((c) => c.modules.includes(mod.id)).length;
          return (
            <Card key={mod.id} elevation="hover" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-card bg-surface-canvas border border-slate-200 flex items-center justify-center text-navy-900 font-bold">
                  <Grid className="w-5 h-5 text-champagne-500" />
                </span>
                <Badge variant={mod.isCore ? 'champagne' : 'neutral'}>
                  {mod.isCore ? 'Módulo Core' : 'Opcional'}
                </Badge>
              </div>

              <div>
                <h3 className="font-bold text-base text-navy-900">{mod.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{mod.description}</p>
              </div>

              <div className="pt-3 border-t border-surface-border flex items-center justify-between text-xs text-slate-500">
                <span>Habilitado en:</span>
                <span className="font-bold text-navy-900">{usageCount} negocios</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

