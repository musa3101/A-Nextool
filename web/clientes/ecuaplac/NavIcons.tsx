import React from 'react';

interface NavIconProps {
  active: boolean;
  className?: string;
  size?: number;
}

/**
 * 1. NavHomeIcon (21st.dev / Heroicons style)
 * Micro-animación: rebote suave y halo dorado en el techo al activarse.
 */
export const NavHomeIcon: React.FC<NavIconProps> = ({ active, className = '', size = 22 }) => {
  return (
    <div className={`relative transition-transform duration-300 ${active ? 'scale-110 -translate-y-0.5' : 'group-hover:scale-105'} ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-colors duration-200 ${active ? 'text-[#F0CF85]' : 'text-slate-400 group-hover:text-slate-200'}`}
      >
        <path
          d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={active ? 0.15 : 0}
        />
        {/* Ventana/Puerta con micro-detalle */}
        <path
          d="M9 21V14H15V21"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {active && (
        <span className="absolute -inset-1 rounded-full bg-[#F0CF85]/10 blur-sm pointer-events-none -z-10 animate-pulse" />
      )}
    </div>
  );
};

/**
 * 2. NavGallery1Icon (Carrusel de Portada)
 * Micro-animación: tarjeta de foto superior que se desplaza hacia adelante (efecto carrusel/slideshow).
 */
export const NavGallery1Icon: React.FC<NavIconProps> = ({ active, className = '', size = 22 }) => {
  return (
    <div className={`relative transition-transform duration-300 ${active ? 'scale-110 -translate-y-0.5' : 'group-hover:scale-105'} ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-colors duration-200 ${active ? 'text-[#F0CF85]' : 'text-slate-400 group-hover:text-slate-200'}`}
      >
        {/* Marco base de foto */}
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.8"
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={active ? 0.15 : 0}
        />
        {/* Sol/Destello superior */}
        <circle
          cx="8.5"
          cy="8.5"
          r="1.75"
          fill="currentColor"
          className={`transition-transform duration-300 ${active ? 'scale-125' : ''}`}
        />
        {/* Montañas / Paisaje de obra con relieve */}
        <path
          d="M21 16L15.5 10.5L6 20M21 16L17.5 12.5L14 16"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {active && (
        <span className="absolute -inset-1 rounded-full bg-[#F0CF85]/10 blur-sm pointer-events-none -z-10 animate-pulse" />
      )}
    </div>
  );
};

/**
 * 3. NavGallery2Icon (Catálogo de Reformas / Más Obras)
 * Distinto a Galería 1: usa capas superpuestas (Layers / Stack) representando el catálogo completo.
 * Micro-animación: capas que se abren en abanico al estar activo.
 */
export const NavGallery2Icon: React.FC<NavIconProps> = ({ active, className = '', size = 22 }) => {
  return (
    <div className={`relative transition-transform duration-300 ${active ? 'scale-110 -translate-y-0.5' : 'group-hover:scale-105'} ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-colors duration-200 ${active ? 'text-[#F0CF85]' : 'text-slate-400 group-hover:text-slate-200'}`}
      >
        {/* Capa inferior (profundidad) */}
        <path
          d="M2 17L12 22L22 17"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-300 ${active ? 'translate-y-0.5' : ''}`}
        />
        {/* Capa intermedia */}
        <path
          d="M2 12L12 17L22 12"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Capa superior principal */}
        <path
          d="M12 2L2 7L12 12L22 7L12 2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={active ? 0.2 : 0}
          className={`transition-transform duration-300 ${active ? '-translate-y-0.5' : ''}`}
        />
      </svg>
      {active && (
        <span className="absolute -inset-1 rounded-full bg-[#F0CF85]/10 blur-sm pointer-events-none -z-10 animate-pulse" />
      )}
    </div>
  );
};

/**
 * 4. NavSettingsIcon (Ajustes del Sistema)
 * Micro-animación: rotación elegante suave de 45 grados y centro iluminado.
 */
export const NavSettingsIcon: React.FC<NavIconProps> = ({ active, className = '', size = 22 }) => {
  return (
    <div className={`relative transition-transform duration-300 ${active ? 'scale-110 -translate-y-0.5' : 'group-hover:scale-105'} ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-all duration-500 ${active ? 'text-[#F0CF85] rotate-45' : 'text-slate-400 group-hover:text-slate-200 group-hover:rotate-12'}`}
      >
        <path
          d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
          stroke="currentColor"
          strokeWidth="1.8"
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={active ? 0.25 : 0}
        />
        <path
          d="M19.4 15C19.2667 15.6667 19.3333 16.3333 19.8 16.8L20 17C20.5333 17.5333 20.5333 18.4 20 19L19 20C18.4 20.5333 17.5333 20.5333 17 20L16.8 19.8C16.3333 19.3333 15.6667 19.2667 15 19.4C14.3333 19.5333 13.8 20.0667 13.7 20.8L13.6 21.1C13.4 21.9 12.7 22.4 11.9 22.4H10.5C9.7 22.4 9 21.8 8.9 21.1L8.8 20.7C8.7 20.0333 8.16667 19.5 7.5 19.3667C6.83333 19.2333 6.16667 19.3 5.7 19.7667L5.5 19.9667C4.96667 20.5 4.1 20.5 3.56667 19.9667L2.56667 18.9667C2.03333 18.3667 2.03333 17.5 2.56667 16.9667L2.76667 16.7667C3.23333 16.3 3.3 15.6333 3.16667 14.9667C3.03333 14.3 2.5 13.7667 1.83333 13.6667L1.4 13.5667C0.6 13.3667 0 12.6667 0 11.8667V10.4667C0 9.66667 0.6 8.96667 1.4 8.76667L1.8 8.66667C2.46667 8.53333 3 8 3.13333 7.33333C3.26667 6.66667 3.2 6 2.73333 5.53333L2.53333 5.33333C2 4.8 2 3.93333 2.53333 3.4L3.53333 2.4C4.13333 1.86667 5 1.86667 5.53333 2.4L5.73333 2.6C6.2 3.06667 6.86667 3.13333 7.53333 3C8.2 2.86667 8.73333 2.33333 8.83333 1.66667L8.93333 1.3C9.13333 0.5 9.83333 0 10.6333 0H12.0333C12.8333 0 13.5333 0.6 13.7333 1.4L13.8333 1.8C13.9667 2.46667 14.5 3 15.1667 3.13333C15.8333 3.26667 16.5 3.2 16.9667 2.73333L17.1667 2.53333C17.7 2 18.5667 2 19.1 2.53333L20.1 3.53333C20.6333 4.13333 20.6333 5 20.1 5.53333L19.9 5.73333C19.4333 6.2 19.3667 6.86667 19.5 7.53333C19.6333 8.2 20.1667 8.73333 20.8333 8.83333L21.2 8.93333C22 9.13333 22.6 9.83333 22.6 10.6333V12.0333C22.6 12.8333 22 13.5333 21.2 13.7333L20.8 13.8333C20.1667 13.9667 19.6 14.5 19.4 15Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {active && (
        <span className="absolute -inset-1 rounded-full bg-[#F0CF85]/10 blur-sm pointer-events-none -z-10 animate-pulse" />
      )}
    </div>
  );
};
