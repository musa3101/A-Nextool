import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Images,
  UtensilsCrossed,
  MailQuestion,
  CalendarCheck,
  FileEdit,
  Scissors,
  Languages,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Mail,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ModuleType } from '../../types';

import { EcuaplacPortal } from './EcuaplacPortal';

export const ClientDashboard: React.FC = () => {
  const { activeTenant } = useTenant();
  const { session, stopImpersonation } = useAuth();
  const navigate = useNavigate();

  if (!activeTenant) {
    return (
      <div className="p-8 text-center text-slate-500">
        No hay cliente seleccionado.
      </div>
    );
  }

  // Si el cliente es Ecuaplac, mostramos su portal especializado
  if (activeTenant.slug === 'ecuaplac') {
    return <EcuaplacPortal />;
  }

  const moduleCards: Record<
    ModuleType,
    { title: string; desc: string; icon: React.ReactNode; link: string; badge: string }
  > = {
    galerias: {
      title: 'Galería de Fotos y Proyectos',
      desc: 'Gestiona fotografías de reformas, portadas y visibilidad en tu web.',
      icon: <Images className="w-6 h-6 text-champagne-500" />,
      link: `/app/${activeTenant.slug}/galerias`,
      badge: '4 Proyectos Activos',
    },
    menus: {
      title: 'Menús y Cartas Digitales',
      desc: 'Actualiza platos, precios, alérgenos y códigos QR en tiempo real.',
      icon: <UtensilsCrossed className="w-6 h-6 text-champagne-500" />,
      link: `/app/${activeTenant.slug}/menus`,
      badge: 'Carta Actualizada',
    },
    leads: {
      title: 'Solicitudes y Presupuestos',
      desc: 'Consulta los mensajes recibidos desde el formulario de tu web.',
      icon: <MailQuestion className="w-6 h-6 text-emerald-600" />,
      link: `/app/${activeTenant.slug}/leads`,
      badge: '3 Nuevas',
    },
    citas: {
      title: 'Reservas y Citas',
      desc: 'Controla citas previas y disponibilidad para tus clientes.',
      icon: <CalendarCheck className="w-6 h-6 text-navy-900" />,
      link: `/app/${activeTenant.slug}/citas`,
      badge: 'Agenda Abierta',
    },
    editor: {
      title: 'Editor de Contenido Web',
      desc: 'Modifica textos clave y avisos sin romper la estructura técnica.',
      icon: <FileEdit className="w-6 h-6 text-amber-700" />,
      link: `/app/${activeTenant.slug}/editor`,
      badge: 'Sincronizado',
    },
    servicios: {
      title: 'Servicios y Precios',
      desc: 'Actualiza tarifas de cortes, tratamientos y catálogo de servicios.',
      icon: <Scissors className="w-6 h-6 text-navy-900" />,
      link: `/app/${activeTenant.slug}/servicios`,
      badge: 'Tarifas 2026',
    },
    traduccion: {
      title: 'Traducción con IA',
      desc: 'Traduce tus textos automáticamente a inglés, alemán o francés.',
      icon: <Languages className="w-6 h-6 text-indigo-600" />,
      link: `/app/${activeTenant.slug}/traduccion`,
      badge: 'Multiidioma',
    },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Hero / Bienvenida */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-card-lg p-6 lg:p-8 text-white shadow-atelier flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-champagne-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-300 tracking-wide">
              Sitio Web Conectado y Operativo
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Bienvenido, {activeTenant.name}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Administra los contenidos de tu web desde este panel privado. Tus cambios se reflejan de forma inmediata en tu dominio oficial.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 z-10 shrink-0">
          <a
            href={activeTenant.websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-pill bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 transition-all"
          >
            <span>Ver mi Web Pública</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {session.isImpersonating && (
            <Button
              variant="champagne"
              size="md"
              icon={<ShieldAlert className="w-4 h-4 text-navy-900" />}
              onClick={stopImpersonation}
            >
              Salir a MYNEXT ADMIN
            </Button>
          )}
        </div>
      </div>

      {/* 2. Bento Grid: Módulos Habilitados */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-navy-900">¿Qué deseas gestionar hoy?</h2>
            <p className="text-xs text-slate-500">
              Herramientas activas configuradas específicamente para tu negocio.
            </p>
          </div>
          <span className="text-xs font-semibold text-champagne-500 bg-champagne-100 px-3 py-1 rounded-pill border border-champagne-300/60">
            {activeTenant.modules.length} Módulos Activos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeTenant.modules.map((modId) => {
            const mod = moduleCards[modId];
            if (!mod) return null;

            return (
              <Card
                key={modId}
                elevation="hover"
                className="cursor-pointer group flex flex-col justify-between"
                onClick={() => navigate(mod.link)}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-card bg-surface-canvas border border-slate-200 flex items-center justify-center group-hover:scale-105 group-hover:border-champagne-400 transition-all shadow-atelier-sm">
                      {mod.icon}
                    </div>
                    <Badge variant="champagne">{mod.badge}</Badge>
                  </div>

                  <h3 className="font-bold text-base text-navy-900 group-hover:text-champagne-500 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{mod.desc}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-surface-border flex items-center justify-between text-xs font-bold text-navy-900 group-hover:text-champagne-500">
                  <span>Abrir herramienta</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 3. Sección Inferior: Estado en Vivo & Soporte MYNEXT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda (2 cols): Callout de Sincronización & Historial */}
        <div className="lg:col-span-2 space-y-4">
          <Card elevation="rest" className="bg-emerald-50/60 border-emerald-200/80 p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-emerald-950">
                  Sincronización Web Inmediata Activa
                </h3>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  Cualquier fotografía que añadas, cambies de orden o marques como oculta en el módulo de galerías se actualiza al instante en{' '}
                  <span className="font-semibold underline">{activeTenant.websiteUrl}</span> gracias al motor Edge de MYNEXT.
                </p>
              </div>
            </div>
          </Card>

          <Card elevation="rest" className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-navy-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Actividad Reciente en tu Negocio</span>
              </h3>
              <span className="text-[11px] text-slate-400">Últimos eventos</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-surface-canvas rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">
                    Fotografía marcada como portada en Cocinas
                  </span>
                  <span className="text-[11px] text-slate-500">
                    «Cocina Abierta en Isla con Acabado Mármol Calacatta»
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Ayer, 18:30</span>
              </div>

              <div className="p-3 bg-surface-canvas rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">
                    Nueva solicitud de presupuesto recibida
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Cliente solicitó reforma de baño en Pozuelo
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Hace 2 días</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Columna Derecha (1 col): Tarjeta de Asistencia Personalizada MYNEXT */}
        <div>
          <Card elevation="rest" className="p-6 bg-gradient-to-b from-white to-surface-canvas border-surface-border">
            <div className="text-center pb-4 border-b border-surface-border">
              <div className="w-16 h-16 rounded-full bg-navy-900 text-champagne-400 mx-auto font-extrabold text-xl flex items-center justify-center shadow-atelier-sm mb-3">
                M
              </div>
              <h3 className="font-bold text-base text-navy-900">Musa — Soporte MYNEXT</h3>
              <span className="text-xs text-slate-500">Técnico & Diseñador Asignado</span>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed text-center">
                ¿Necesitas añadir nuevas secciones o tienes dudas con tus galerías? Tienes soporte directo prioritario.
              </p>

              <div className="space-y-2 pt-2">
                <a
                  href="https://wa.me"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-pill bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contactar por WhatsApp</span>
                </a>

                <a
                  href="mailto:soporte@mynext.es"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-pill bg-white border border-surface-border hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Enviar Correo</span>
                </a>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-border text-center">
              <span className="text-[10px] text-slate-400">
                MYNEXT SL • Próximo mantenimiento programado: Domingo 02:00
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

