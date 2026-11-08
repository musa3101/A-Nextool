import React from 'react';
import { MailQuestion, CheckCircle2, Clock, Phone, Mail } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const LeadsManager: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="success">Captación Activa</Badge>
          <span className="text-xs text-slate-500 font-medium">Buzón de Solicitudes</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-navy-900 tracking-tight">
          Solicitudes y Presupuestos
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Mensajes y solicitudes de clientes recibidos directamente desde tu página web.
        </p>
      </div>

      <div className="space-y-3">
        <Card elevation="hover" className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
              RG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-navy-900">Rodrigo Gómez</span>
                <Badge variant="warning">Pendiente</Badge>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                «Buenos días, me gustaría solicitar presupuesto para reforma integral de cocina de 16m² en Pozuelo.»
              </p>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> +34 612 345 678
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" /> rodrigo.gomez@gmail.com
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-mono shrink-0">Hoy, 12:45</span>
        </Card>

        <Card elevation="hover" className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
              ML
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-navy-900">María López</span>
                <Badge variant="success">Gestionada</Badge>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                «Consulta sobre cambio de bañera por plato de ducha con mampara negra.»
              </p>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> +34 689 987 654
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-mono shrink-0">Ayer, 16:20</span>
        </Card>
      </div>
    </div>
  );
};

