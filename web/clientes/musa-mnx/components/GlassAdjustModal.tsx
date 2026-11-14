import React from 'react';
import { Settings2, X, Layers, RotateCcw } from 'lucide-react';

export interface GlassSettings {
  blur: number;
  opacity: number;
  saturation: number;
  tint: string;
  edge: number;
}

export const DEFAULT_GLASS_SETTINGS: GlassSettings = {
  blur: 24,
  opacity: 0.45,
  saturation: 1.25,
  tint: '#141822',
  edge: 0.6,
};

interface GlassAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GlassSettings;
  onChange: (patch: Partial<GlassSettings>) => void;
  onReset: () => void;
}

export const GlassAdjustModal: React.FC<GlassAdjustModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChange,
  onReset,
}) => {
  if (!isOpen) return null;

  const presets = [
    {
      name: 'Cristalino',
      value: { blur: 14, opacity: 0.25, saturation: 1.2, edge: 0.8, tint: '#0d1118' },
    },
    {
      name: 'Glaseado',
      value: DEFAULT_GLASS_SETTINGS,
    },
    {
      name: 'Sólido',
      value: { blur: 32, opacity: 0.85, saturation: 1.1, edge: 0.4, tint: '#0a0d14' },
    },
  ];

  return (
    <div className="absolute right-6 top-18 z-50 w-84 rounded-2xl bg-[#0F131C]/95 backdrop-blur-2xl border border-white/15 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.8)] text-slate-200 select-none font-['Satoshi'] animate-in fade-in zoom-in-95 duration-150">
      {/* Cabecera */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#F0CF85]">
            <Settings2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white font-['Clash_Display'] tracking-wide">
              Ajustar Cristal
            </h3>
            <span className="text-[10px] text-slate-400 font-sans block">
              Calibración del material de la consola
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Muestra de material en vivo */}
      <div
        className="my-3.5 h-14 rounded-xl border border-white/20 flex items-center justify-center gap-2 text-xs font-medium text-white shadow-inner relative overflow-hidden"
        style={{
          background: `color-mix(in srgb, ${settings.tint} calc(${settings.opacity} * 100%), rgba(10,12,16,0.8))`,
          backdropFilter: `blur(${settings.blur}px) saturate(${settings.saturation})`,
          WebkitBackdropFilter: `blur(${settings.blur}px) saturate(${settings.saturation})`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255, ${settings.edge})`,
        }}
      >
        <Layers className="w-4 h-4 text-[#F0CF85]" />
        <span className="font-mono text-[11px] text-slate-200">Previsualización del Material</span>
      </div>

      {/* Presets Rápidos */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {presets.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => onChange(preset.value)}
            className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-semibold text-slate-300 hover:text-white transition-all text-center cursor-pointer active:scale-95"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Sliders de Control */}
      <div className="space-y-3 text-xs">
        {/* Blur */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Desenfoque (Blur)</span>
            <span className="text-[#F0CF85] font-bold">{Math.round(settings.blur)} px</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            step="1"
            value={settings.blur}
            onChange={(e) => onChange({ blur: Number(e.target.value) })}
            className="w-full accent-[#C5A059] h-1.5 bg-white/10 rounded-lg cursor-pointer"
          />
        </div>

        {/* Opacidad */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Opacidad del Cristal</span>
            <span className="text-[#F0CF85] font-bold">{Math.round(settings.opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.08"
            max="0.95"
            step="0.02"
            value={settings.opacity}
            onChange={(e) => onChange({ opacity: Number(e.target.value) })}
            className="w-full accent-[#C5A059] h-1.5 bg-white/10 rounded-lg cursor-pointer"
          />
        </div>

        {/* Saturación */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Saturación de Color</span>
            <span className="text-[#F0CF85] font-bold">{Math.round(settings.saturation * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.05"
            value={settings.saturation}
            onChange={(e) => onChange({ saturation: Number(e.target.value) })}
            className="w-full accent-[#C5A059] h-1.5 bg-white/10 rounded-lg cursor-pointer"
          />
        </div>

        {/* Luz de Borde (Edge) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Reflejo de Borde Biselado</span>
            <span className="text-[#F0CF85] font-bold">{Math.round(settings.edge * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.edge}
            onChange={(e) => onChange({ edge: Number(e.target.value) })}
            className="w-full accent-[#C5A059] h-1.5 bg-white/10 rounded-lg cursor-pointer"
          />
        </div>

        {/* Tinte de Color */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Tinte del Cristal</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={settings.tint}
              onChange={(e) => onChange({ tint: e.target.value })}
              className="w-7 h-7 rounded-md border border-white/20 bg-transparent cursor-pointer"
            />
            <span className="font-mono text-[11px] text-slate-300 uppercase">
              {settings.tint}
            </span>
          </div>
        </div>
      </div>

      {/* Botón de Restaurar */}
      <button
        type="button"
        onClick={onReset}
        className="mt-4 w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Restablecer Valores Predeterminados</span>
      </button>
    </div>
  );
};
