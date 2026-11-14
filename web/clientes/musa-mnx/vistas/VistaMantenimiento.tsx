import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Wrench,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
  Plus,
  Save,
  Clock,
  User,
  Shield,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Server,
  Zap,
  Lock,
  AlertTriangle,
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
} from 'lucide-react';
import { MUSA_ADMIN_CONFIG, ManagedClientConfig } from '../config';

interface VistaMantenimientoProps {
  currentClient: ManagedClientConfig;
}

interface MaintenanceHistoryItem {
  id: string;
  date: string;
  title: string;
  technician: string;
  status: 'completed' | 'active';
}

export const VistaMantenimiento: React.FC<VistaMantenimientoProps> = ({ currentClient }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Datos de MyNext Care sincronizados con la app del cliente
  const [launchDate, setLaunchDate] = useState('07/06/2026');
  const [launchDesc, setLaunchDesc] = useState('Web oficial en producción · Servidor de Alta Velocidad');
  const [lastMaintenanceDate, setLastMaintenanceDate] = useState('11/11/2026');
  const [lastMaintenanceDesc, setLastMaintenanceDesc] = useState('Optimización v3.0, Caché Edge & Seguridad PWA');
  const [installedVersion, setInstalledVersion] = useState('3.1.1');
  const [slaStatus, setSlaStatus] = useState('optimal');

  // PDF Explicativo de MyNext Care (Dossier oficial para el cliente)
  const [carePdfUrl, setCarePdfUrl] = useState<string>('');
  const [carePdfName, setCarePdfName] = useState<string>('');
  const [carePdfSize, setCarePdfSize] = useState<string>('');
  const [carePdfDate, setCarePdfDate] = useState<string>('');
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Historial de intervenciones
  const [history, setHistory] = useState<MaintenanceHistoryItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Carga inicial de datos
  useEffect(() => {
    try {
      const cached = localStorage.getItem('ecuaplac_mynext_care');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.launchDate) setLaunchDate(parsed.launchDate);
        if (parsed.launchDesc) setLaunchDesc(parsed.launchDesc);
        if (parsed.lastMaintenanceDate) setLastMaintenanceDate(parsed.lastMaintenanceDate);
        if (parsed.lastMaintenanceDesc) setLastMaintenanceDesc(parsed.lastMaintenanceDesc);
        if (parsed.installedVersion) setInstalledVersion(parsed.installedVersion);
        if (parsed.pdfUrl) {
          setCarePdfUrl(parsed.pdfUrl);
          setCarePdfName(parsed.pdfName || 'Guía_Oficial_MyNext_Care.pdf');
          setCarePdfSize(parsed.pdfSize || '1.4 MB');
          setCarePdfDate(parsed.pdfUploadDate || '11/11/2026');
        } else {
          // Precarga por defecto para que Goyo tenga siempre disponible la guía oficial inicial
          const defaultPdfName = 'Guia_Oficial_MyNext_Care_2026.pdf';
          const defaultPdfSize = '1.2 MB';
          const defaultDate = '11/11/2026';
          // Generamos una dataUrl básica representativa si aún no ha subido uno propio
          const sampleDataUrl = 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgNTk1IDg0Ml0+PmVuZG9iagp4cmVmCjAgNAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTggMDAwMDAgbiAKMDAwMDAwMDA2OSAwMDAwMCBuIAowMDAwMDAwMTIxIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA0L1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKMTk5CiUlRU9GCg==';
          setCarePdfUrl(sampleDataUrl);
          setCarePdfName(defaultPdfName);
          setCarePdfSize(defaultPdfSize);
          setCarePdfDate(defaultDate);
        }
      } else {
        const defaultPdfName = 'Guia_Oficial_MyNext_Care_2026.pdf';
        const defaultPdfSize = '1.2 MB';
        const defaultDate = '11/11/2026';
        const sampleDataUrl = 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgNTk1IDg0Ml0+PmVuZG9iagp4cmVmCjAgNAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTggMDAwMDAgbiAKMDAwMDAwMDA2OSAwMDAwMCBuIAowMDAwMDAwMTIxIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA0L1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKMTk5CiUlRU9GCg==';
        setCarePdfUrl(sampleDataUrl);
        setCarePdfName(defaultPdfName);
        setCarePdfSize(defaultPdfSize);
        setCarePdfDate(defaultDate);

        localStorage.setItem(
          'ecuaplac_mynext_care',
          JSON.stringify({
            launchDate: '07/06/2026',
            launchDesc: 'Web oficial en producción · Servidor de Alta Velocidad',
            lastMaintenanceDate: '11/11/2026',
            lastMaintenanceDesc: 'Optimización v3.0, Caché Edge & Seguridad PWA',
            installedVersion: '3.1.1',
            status: 'active',
            pdfUrl: sampleDataUrl,
            pdfName: defaultPdfName,
            pdfSize: defaultPdfSize,
            pdfUploadDate: defaultDate,
          })
        );
      }

      const cachedHistory = localStorage.getItem('ecuaplac_care_history');
      if (cachedHistory) {
        setHistory(JSON.parse(cachedHistory));
      } else {
        const defaultHistory: MaintenanceHistoryItem[] = [
          {
            id: 'care-1',
            date: '11/11/2026',
            title: 'Optimización v3.0, Caché Edge & Seguridad PWA',
            technician: 'Musa',
            status: 'completed',
          },
          {
            id: 'care-2',
            date: '07/06/2026',
            title: 'Lanzamiento oficial de la web en producción con dominio propio',
            technician: 'Musa',
            status: 'completed',
          },
        ];
        setHistory(defaultHistory);
        localStorage.setItem('ecuaplac_care_history', JSON.stringify(defaultHistory));
      }
    } catch (e) {
      console.warn('Error al cargar datos de MyNext Care:', e);
    }
  }, [currentClient]);

  // Manejo de Subida del PDF de MyNext Care
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('Por favor selecciona un archivo en formato PDF.');
      return;
    }

    setIsUploadingPdf(true);
    const sizeInKb = Math.round(file.size / 1024);
    const sizeFormatted = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`;
    const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = (reader.result as string) || '';
      setCarePdfUrl(dataUrl);
      setCarePdfName(file.name);
      setCarePdfSize(sizeFormatted);
      setCarePdfDate(today);

      try {
        const cached = localStorage.getItem('ecuaplac_mynext_care');
        const base = cached ? JSON.parse(cached) : {};
        const updated = {
          ...base,
          pdfUrl: dataUrl,
          pdfName: file.name,
          pdfSize: sizeFormatted,
          pdfUploadDate: today,
        };
        localStorage.setItem('ecuaplac_mynext_care', JSON.stringify(updated));
        window.dispatchEvent(new Event('ecuaplac_care_updated'));
        showToast(`PDF oficial «${file.name}» cargado en MyNext Care para Goyo`);
      } catch (err) {
        console.error('Error guardando PDF:', err);
      } finally {
        setIsUploadingPdf(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePdf = () => {
    if (!window.confirm('¿Deseas retirar el PDF de MyNext Care de la app de Goyo?')) return;
    setCarePdfUrl('');
    setCarePdfName('');
    setCarePdfSize('');
    setCarePdfDate('');

    try {
      const cached = localStorage.getItem('ecuaplac_mynext_care');
      if (cached) {
        const base = JSON.parse(cached);
        delete base.pdfUrl;
        delete base.pdfName;
        delete base.pdfSize;
        delete base.pdfUploadDate;
        localStorage.setItem('ecuaplac_mynext_care', JSON.stringify(base));
        window.dispatchEvent(new Event('ecuaplac_care_updated'));
        showToast('PDF de MyNext Care retirado de la app de Goyo');
      }
    } catch (err) {
      console.error('Error retirando PDF:', err);
    }
  };

  const handleViewCarePdf = () => {
    if (!carePdfUrl) {
      alert('No hay un PDF cargado.');
      return;
    }
    if (carePdfUrl.startsWith('data:')) {
      try {
        const parts = carePdfUrl.split(',');
        const mime = parts[0].split(':')[1]?.split(';')[0] || 'application/pdf';
        const byteCharacters = atob(parts[1]);
        const byteNumbers = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([byteNumbers], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        return;
      } catch (e) {
        console.warn('Error abriendo visor:', e);
      }
    }
    window.open(carePdfUrl, '_blank');
  };

  const handleDownloadCarePdf = () => {
    if (!carePdfUrl) return;
    const a = document.createElement('a');
    a.href = carePdfUrl;
    a.download = carePdfName || 'Guia_Oficial_MyNext_Care.pdf';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Guardar y publicar directamente en la app del cliente
  const handleSaveAndPublish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updatedCare = {
        launchDate,
        launchDesc,
        lastMaintenanceDate,
        lastMaintenanceDesc,
        installedVersion,
        pdfUrl: carePdfUrl,
        pdfName: carePdfName,
        pdfSize: carePdfSize,
        pdfUploadDate: carePdfDate,
        status: 'active',
        updatedAt: new Date().toISOString(),
      };

      // 1. Guardar en clave compartida que lee la app del cliente
      localStorage.setItem('ecuaplac_mynext_care', JSON.stringify(updatedCare));

      // 2. Registrar en el historial de revisiones si es una fecha nueva
      const newHistoryItem: MaintenanceHistoryItem = {
        id: `care-${Date.now()}`,
        date: lastMaintenanceDate,
        title: lastMaintenanceDesc,
        technician: 'Musa',
        status: 'completed',
      };
      const updatedHistory = [newHistoryItem, ...history.filter((h) => h.id !== newHistoryItem.id)];
      setHistory(updatedHistory);
      localStorage.setItem('ecuaplac_care_history', JSON.stringify(updatedHistory));

      // 3. Emitir evento en caliente para que la app de Ecuaplac se actualice inmediatamente
      window.dispatchEvent(new Event('ecuaplac_care_updated'));

      showToast(`Mantenimiento MyNext Care guardado y publicado en la app de ${currentClient.name}`);
    } catch (err) {
      console.error('Error al guardar mantenimiento:', err);
      alert('Error al guardar los datos');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetToday = () => {
    const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    setLastMaintenanceDate(today);
  };

  return (
    <div className="p-8 h-full overflow-y-auto space-y-6 select-none font-['Satoshi']">
      {/* Toast de confirmación */}
      {toastMessage && (
        <div className="fixed top-6 right-8 z-50 px-4 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white font-['Clash_Display']">
              MyNext Care & Mantenimiento SLA
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#C5A059]/15 text-[#F0CF85] border border-[#C5A059]/30">
              {currentClient.name}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Supervisión continua de acuerdos de nivel de servicio (SLA), fechas de revisión técnica y documentos informativos para el cliente.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSetToday}
          className="h-10 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-[#C5A059] text-slate-950 font-bold text-xs shadow-lg shadow-[#C5A059]/15 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0 musa-btn-interactive"
        >
          <Sparkles className="w-4 h-4" />
          <span>Registrar Mantenimiento Hoy</span>
        </button>
      </div>

      {/* Grid Bento Asimétrico: 2 Columnas (60% / 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda (7 de 12 = ~60%): Contrato, Dossier PDF & Vista Previa */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tarjeta de Contrato MyNext Care Platinum */}
          <div className="p-6 rounded-2xl musa-glass-panel border border-white/10 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#F0CF85] shrink-0">
                  <ShieldCheck className="w-6 h-6 stroke-[1.8]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white font-['Clash_Display']">
                    {currentClient.name} • Contrato MyNext Care Platinum
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Fecha de lanzamiento inicial: <span className="font-mono text-slate-300 font-semibold">{launchDate}</span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SLA OPTIMAL
                </span>
                <span className="text-[10px] text-slate-500 block font-mono mt-1">Garantía &lt; 2h</span>
              </div>
            </div>

            {/* 3 Métricas en Fila */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/[0.06]">
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.05]">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 font-mono block">
                  ÚLTIMA REVISIÓN
                </span>
                <span className="text-sm font-bold text-white font-mono block mt-1">
                  {lastMaintenanceDate}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.05]">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 font-mono block">
                  VERSIÓN DESPLEGADA
                </span>
                <span className="text-sm font-bold text-[#F0CF85] font-mono block mt-1">
                  v{installedVersion}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.05]">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 font-mono block">
                  SINCRONIZACIÓN CLOUD
                </span>
                <span className="text-sm font-bold text-emerald-400 font-mono block mt-1">
                  100% Operativo
                </span>
              </div>
            </div>
          </div>

          {/* NUEVO BLOQUE: Dossier Oficial MyNext Care en PDF (Lo que pidió Musa) */}
          <div className="p-6 rounded-2xl musa-glass-panel border border-[#C5A059]/30 space-y-4 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#F0CF85]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-['Clash_Display']">
                    Dossier Oficial MyNext Care (PDF Informativo)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Documento explicativo para que Goyo consulte qué incluye el mantenimiento directamente en su app.
                  </p>
                </div>
              </div>

              <input
                type="file"
                ref={pdfInputRef}
                onChange={handlePdfUpload}
                accept="application/pdf"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                disabled={isUploadingPdf}
                className="px-3.5 py-1.5 rounded-xl bg-[#C5A059]/20 hover:bg-[#C5A059]/30 text-[#F0CF85] border border-[#C5A059]/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto shrink-0 disabled:opacity-50 musa-btn-interactive"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{carePdfUrl ? 'Cambiar PDF' : '+ Subir PDF MyNext Care'}</span>
              </button>
            </div>

            {carePdfUrl ? (
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex flex-col items-center justify-center text-rose-400 shrink-0">
                    <FileText className="w-4 h-4" />
                    <span className="text-[7.5px] font-black uppercase tracking-tight mt-0.5">PDF</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">
                      {carePdfName || 'Guia_Oficial_MyNext_Care.pdf'}
                    </span>
                    <div className="flex items-center gap-2 text-[10.5px] text-slate-400 font-mono mt-0.5">
                      <span>{carePdfSize || '1.2 MB'}</span>
                      <span>•</span>
                      <span>Subido el {carePdfDate || '11/11/2026'}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-sans font-semibold">Visible en la app de Goyo</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={handleViewCarePdf}
                    className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="Previsualizar PDF"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadCarePdf}
                    className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="Descargar PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePdf}
                    className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                    title="Retirar PDF"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => pdfInputRef.current?.click()}
                className="p-6 rounded-xl border border-dashed border-white/20 hover:border-[#C5A059]/60 bg-black/30 hover:bg-black/50 transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] group-hover:bg-[#C5A059]/15 border border-white/10 group-hover:border-[#C5A059]/30 flex items-center justify-center text-slate-400 group-hover:text-[#F0CF85] transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    Sube el PDF explicativo de MyNext Care
                  </p>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">
                    Goyo podrá abrir y descargar este documento desde su propia aplicación web
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Protocolos de Mantenimiento Preventivo (Grid 2x2) */}
          <div className="p-6 rounded-2xl musa-glass-panel border border-white/10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#F0CF85]" />
                <h3 className="text-sm font-bold text-white font-['Clash_Display']">
                  Protocolos de Mantenimiento Preventivo
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Automático 24/7</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-semibold text-white block">Backup Cloud Diario</span>
                    <span className="text-[10px] text-slate-500">Snapshot automático 03:00 CET</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  OK
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-semibold text-white block">Auditoría RLS Políticas</span>
                    <span className="text-[10px] text-slate-500">Tablas y leads protegidos</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  OK
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-semibold text-white block">Aceleración CDN Edge</span>
                    <span className="text-[10px] text-slate-500">Caché global & revalidación</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  OK
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-semibold text-white block">Formularios & Leads</span>
                    <span className="text-[10px] text-slate-500">Bandeja de presupuestos activa</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  OK
                </span>
              </div>
            </div>
          </div>

          {/* Vista Previa Exacta de la App del Cliente (Captura de Ecuaplac) */}
          <div className="p-6 rounded-2xl musa-glass-panel border border-white/10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#F0CF85]" />
                <h3 className="text-sm font-bold text-white font-['Clash_Display']">
                  Vista Previa en Vivo (Cómo lo ve Goyo en Ecuaplac)
                </h3>
              </div>
              <a
                href={currentClient.appRoute}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#F0CF85] hover:underline flex items-center gap-1 font-mono"
              >
                <span>Abrir App Cliente</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-black/30 border border-white/[0.06] flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    LANZAMIENTO DE WEB
                  </span>
                  <span className="text-sm font-bold text-white font-['Clash_Display'] block mt-0.5">
                    {launchDate}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                    {launchDesc}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/30 border border-white/[0.06] flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                      MANTENIMIENTO DE WEB
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Trabajo
                    </span>
                  </div>
                  <span className="text-sm font-bold text-white font-['Clash_Display'] block mt-0.5">
                    {lastMaintenanceDate}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                    {lastMaintenanceDesc}
                  </span>
                </div>
              </div>
            </div>

            {/* Documento PDF en la Vista Previa */}
            {carePdfUrl && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-[#C5A059]/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-[#F0CF85] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-white truncate block">
                      {carePdfName || 'Guia_Oficial_MyNext_Care.pdf'}
                    </span>
                    <span className="text-[10.5px] text-slate-400 block truncate">
                      Documento PDF oficial disponible para descarga en el móvil de Goyo
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[9.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                  Sincronizado
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha (5 de 12 = ~40%): Formulario de Ajustes & Historial */}
        <div className="lg:col-span-5 space-y-6">
          {/* Formulario de Ajustes Técnicos de Mantenimiento */}
          <div className="p-6 rounded-2xl musa-glass-panel border border-white/10 space-y-5 shadow-2xl">
            <div className="pb-3 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-['Clash_Display']">
                  Ajustes Técnicos de Mantenimiento
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Actualización en vivo para la app de tu cliente.
                </p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <form onSubmit={handleSaveAndPublish} className="space-y-4">
              {/* Estado de Salud SLA */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Estado de Salud SLA
                </label>
                <select
                  value={slaStatus}
                  onChange={(e) => setSlaStatus(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-black/50 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5A059] cursor-pointer"
                >
                  <option value="optimal" className="bg-[#0C0F17]">SLA Óptimo (En verde - Sin incidencias)</option>
                  <option value="scheduled" className="bg-[#0C0F17]">Mantenimiento Programado</option>
                  <option value="incident" className="bg-[#0C0F17]">Incidencia en Revisión</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Último Mantenimiento */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Último Mantenimiento
                  </label>
                  <input
                    type="text"
                    required
                    value={lastMaintenanceDate}
                    onChange={(e) => setLastMaintenanceDate(e.target.value)}
                    placeholder="12/11/2026"
                    className="w-full h-10 px-3.5 rounded-xl bg-black/50 border border-white/[0.08] text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                {/* Versión Instalada */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Versión Instalada
                  </label>
                  <input
                    type="text"
                    required
                    value={installedVersion}
                    onChange={(e) => setInstalledVersion(e.target.value)}
                    placeholder="3.1.1"
                    className="w-full h-10 px-3.5 rounded-xl bg-black/50 border border-white/[0.08] text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Nota Técnica / Mensaje de Estado */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Nota Técnica / Mensaje de Estado para la App del Cliente
                </label>
                <textarea
                  rows={3}
                  required
                  value={lastMaintenanceDesc}
                  onChange={(e) => setLastMaintenanceDesc(e.target.value)}
                  placeholder="Optimización v3.1.1, aceleración web y revisión periódica"
                  className="w-full p-3 rounded-xl bg-black/50 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C5A059] resize-none"
                />
              </div>

              {/* Botón de Guardar */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full h-10 rounded-xl bg-gradient-to-r from-amber-400 to-[#C5A059] text-slate-950 font-bold text-xs shadow-lg shadow-[#C5A059]/15 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 musa-btn-interactive"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>{isSaving ? 'Guardando...' : 'Guardar y Aplicar Cambios'}</span>
              </button>
            </form>
          </div>

          {/* Historial de Intervenciones Realizadas */}
          <div className="p-6 rounded-2xl musa-glass-panel border border-white/10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F0CF85]" />
                <h3 className="text-sm font-bold text-white font-['Clash_Display']">
                  Historial de Intervenciones ({history.length})
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Registro oficial</span>
            </div>

            <div className="divide-y divide-white/[0.05] space-y-2">
              {history.map((item) => (
                <div key={item.id} className="pt-2 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                      <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">
                        {item.date} • {item.technician}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9.5px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                    OK
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
