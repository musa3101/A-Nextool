import React from 'react';
import { Settings, Save, ShieldCheck } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const AccountSettings: React.FC = () => {
  const { activeTenant } = useTenant();

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-navy-900 tracking-tight">
          Ajustes de Cuenta del Negocio
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Configuración general, datos de contacto y preferencias de tu panel.
        </p>
      </div>

      <Card elevation="rest" className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Nombre Comercial</label>
          <input
            type="text"
            defaultValue={activeTenant?.name}
            className="w-full border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-800"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Correo Electrónico de Notificaciones</label>
          <input
            type="email"
            defaultValue={activeTenant?.contactEmail}
            className="w-full border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-800"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Dirección Web Oficial</label>
          <input
            type="url"
            defaultValue={activeTenant?.websiteUrl}
            className="w-full border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-800"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <Button variant="primary" size="md" icon={<Save className="w-4 h-4" />}>
            Guardar Ajustes
          </Button>
        </div>
      </Card>
    </div>
  );
};

