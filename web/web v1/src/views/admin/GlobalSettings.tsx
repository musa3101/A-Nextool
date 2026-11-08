import React from 'react';
import { Settings, Shield, Globe, HardDrive } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const GlobalSettings: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="navy">Infraestructura</Badge>
          <span className="text-xs text-slate-500 font-medium">Cloudflare Workers & D1</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-navy-900 tracking-tight">
          Ajustes Globales de NEXT TOOLS
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Configuración general de la plataforma, credenciales maestras y estado de los servidores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card elevation="rest" className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-navy-900">Cloudflare Edge Network</h3>
          </div>
          <p className="text-xs text-slate-500">
            Enrutamiento global activo en más de 300 ciudades con caché automática de assets.
          </p>
          <div className="pt-2">
            <Badge variant="success">Zona: Madrid (MAD) - Óptima</Badge>
          </div>
        </Card>

        <Card elevation="rest" className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <HardDrive className="w-5 h-5 text-champagne-500" />
            <h3 className="font-bold text-sm text-navy-900">Base de Datos Central D1</h3>
          </div>
          <p className="text-xs text-slate-500">
            SQLite serverless replicado con latencia sub-5ms para consultas de inquilinos y auditoría.
          </p>
          <div className="pt-2">
            <Badge variant="champagne">Almacenamiento: 10 GB Free Tier</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};

