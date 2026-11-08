import React from 'react';
import { UtensilsCrossed, Plus, Sparkles, QrCode } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const MenusManager: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="champagne">Carta Digital & QR</Badge>
            <span className="text-xs text-slate-500 font-medium">Hostelería y Restauración</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-navy-900 tracking-tight">
            Menús y Cartas Digitales
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Gestiona platos, precios, alérgenos y la sincronización con el código QR de mesa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" icon={<QrCode className="w-4 h-4" />}>
            Descargar QR
          </Button>
          <Button variant="primary" size="md" icon={<Plus className="w-4 h-4 text-champagne-400" />}>
            Añadir Plato
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card elevation="rest">
          <span className="text-xs font-bold text-slate-500 uppercase">Platos en Carta</span>
          <span className="text-2xl font-extrabold text-navy-900 block mt-1">42</span>
        </Card>
        <Card elevation="rest">
          <span className="text-xs font-bold text-slate-500 uppercase">Categorías</span>
          <span className="text-2xl font-extrabold text-navy-900 block mt-1">6 (Entrantes, Pastas, Carnes...)</span>
        </Card>
        <Card elevation="rest">
          <span className="text-xs font-bold text-slate-500 uppercase">Estado QR</span>
          <span className="text-2xl font-extrabold text-emerald-600 block mt-1">En Línea</span>
        </Card>
      </div>

      <Card elevation="rest" className="py-12 text-center">
        <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-bold text-base text-navy-900">Carta Sincronizada con el Servidor</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Los precios y alérgenos están actualizados y disponibles para los comensales en el restaurante.
        </p>
      </Card>
    </div>
  );
};

