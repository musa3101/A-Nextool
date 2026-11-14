import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText,
  Plus,
  Download,
  Trash2,
  Eye,
  Upload,
  X,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Coins,
  TrendingUp,
  Receipt,
  Percent,
} from 'lucide-react';
import { ManagedClientConfig } from '../config';
import { ecuaplacConnector } from '../../ecuaplac/conector';

interface VistaFacturacionProps {
  currentClient: ManagedClientConfig;
}

export interface InvoiceItem {
  id: string;
  number?: string;
  name: string;
  fileUrl: string;
  fileSize: string;
  uploadDate: string;
  issueDate?: string;
  dueDate?: string;
  category: string;
  status: 'cobrada' | 'pendiente' | 'oficial';
  clientName?: string;
  totalAmount?: number;
  concept?: string;
  notes?: string;
}

export const VistaFacturacion: React.FC<VistaFacturacionProps> = ({ currentClient }) => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Formulario de subida de factura (según diseño exacto de Musa)
  const [formNumber, setFormNumber] = useState('');
  const [formAmount, setFormAmount] = useState('120.00');
  const [formConcept, setFormConcept] = useState('Mantenimiento MyNext Care (Ecuaplac Reformas)');
  const [formDate, setFormDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  });
  const [formStatus, setFormStatus] = useState<'cobrada' | 'pendiente'>('cobrada');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Cargar facturas sincronizadas con la app de Ecuaplac
  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      // 1. Intentar desde caché
      const cached = localStorage.getItem('ecuaplac_tenant_docs');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setInvoices(parsed);
        }
      }

      // 2. Traer online
      const liveDocs = await ecuaplacConnector.fetchDocumentsOnline();
      if (liveDocs && liveDocs.length > 0) {
        setInvoices(liveDocs);
        localStorage.setItem('ecuaplac_tenant_docs', JSON.stringify(liveDocs));
      } else if (!cached) {
        // Semilla por defecto con las 2 facturas históricas reales mostradas en la captura de Musa
        const defaultInvoices: InvoiceItem[] = [
          {
            id: 'doc-fac-001',
            number: 'FAC-2026-001',
            name: 'Factura_Oficial_Ecuaplac_001.pdf',
            concept: 'Diseño Web Oficial, Despliegue Cloudflare & Conexión Supabase',
            fileUrl: '',
            fileSize: '240 KB',
            uploadDate: '06/07/2026',
            issueDate: '2026-07-06',
            dueDate: '—',
            category: 'factura',
            status: 'cobrada',
            clientName: 'Ecuaplac Reformas',
            totalAmount: 1450.00,
          },
          {
            id: 'doc-fac-002',
            number: 'FAC-2026-002',
            name: 'Factura_Mantenimiento_Q3.pdf',
            concept: 'Mantenimiento MyNext Care Q3 & Integración CRM Tally Presupuestos',
            fileUrl: '',
            fileSize: '198 KB',
            uploadDate: '15/10/2026',
            issueDate: '2026-10-15',
            dueDate: '—',
            category: 'factura',
            status: 'cobrada',
            clientName: 'Ecuaplac Reformas',
            totalAmount: 320.00,
          },
        ];
        setInvoices(defaultInvoices);
        localStorage.setItem('ecuaplac_tenant_docs', JSON.stringify(defaultInvoices));
      }
    } catch (e) {
      console.warn('Error cargando facturas:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();

    const handleSync = () => {
      loadInvoices();
    };

    window.addEventListener('ecuaplac_docs_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('ecuaplac_docs_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [currentClient]);

  // Cálculos de Stats
  const stats = useMemo(() => {
    let emitido = 0;
    let cobrado = 0;
    let pendiente = 0;

    invoices.forEach((inv) => {
      const amt = inv.totalAmount || 0;
      emitido += amt;
      if (inv.status === 'cobrada' || inv.status === 'oficial') {
        cobrado += amt;
      } else {
        pendiente += amt;
      }
    });

    const iva = emitido * 0.21;

    return {
      totalEmitido: emitido,
      totalCobrado: cobrado,
      pendienteCobro: pendiente,
      ivaDevengado: iva,
      count: invoices.length,
    };
  }, [invoices]);

  const handleOpenModal = () => {
    const nextNum = `FAC-2026-${String(invoices.length + 1).padStart(3, '0')}`;
    setFormNumber(nextNum);
    setFormAmount('120.00');
    setFormConcept(`Mantenimiento MyNext Care (${currentClient.name})`);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('Solo se permiten archivos en formato PDF.');
      return;
    }

    setSelectedFile(file);
    if (!formConcept || formConcept.startsWith('Mantenimiento')) {
      setFormConcept(file.name.replace('.pdf', '').replace(/[-_]/g, ' '));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Por favor selecciona o arrastra un archivo PDF');
      return;
    }

    setIsUploading(true);

    try {
      const sizeInKb = Math.round(selectedFile.size / 1024);
      const sizeFormatted = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`;

      const reader = new FileReader();
      reader.onload = async () => {
        const fileDataUrl = (reader.result as string) || '';
        const docNumber = formNumber.trim() || `FAC-2026-${String(invoices.length + 1).padStart(3, '0')}`;
        const numAmount = parseFloat(formAmount.replace(',', '.')) || 0;

        // 1. Guardar en Base de Datos de Ecuaplac
        const savedId = await ecuaplacConnector.saveDocumentOnline({
          doc_number: docNumber,
          name: selectedFile.name,
          file_url: fileDataUrl,
          file_size: sizeFormatted,
          category: 'factura',
          status: formStatus === 'cobrada' ? 'oficial' : 'pendiente',
          total_amount: numAmount,
          notes: formConcept || `Factura oficial para ${currentClient.name}`,
        });

        // 2. Objeto sincronizado
        const newInvoice: InvoiceItem = {
          id: savedId || `doc-${Date.now()}`,
          number: docNumber,
          name: selectedFile.name,
          concept: formConcept,
          fileUrl: fileDataUrl,
          fileSize: sizeFormatted,
          uploadDate: formDate,
          issueDate: formDate,
          dueDate: '—',
          category: 'factura',
          status: formStatus,
          clientName: currentClient.name,
          totalAmount: numAmount,
          notes: formConcept,
        };

        const updatedList = [newInvoice, ...invoices];
        setInvoices(updatedList);
        localStorage.setItem('ecuaplac_tenant_docs', JSON.stringify(updatedList));

        // 3. Notificar a la app de Ecuaplac
        window.dispatchEvent(new Event('ecuaplac_docs_updated'));

        setIsModalOpen(false);
        setSelectedFile(null);
        setIsUploading(false);

        showToast(`Factura «${docNumber}» publicada con éxito en la app de ${currentClient.name}`);
      };

      reader.readAsDataURL(selectedFile);
    } catch (err) {
      console.error('Error subiendo factura:', err);
      setIsUploading(false);
      alert('Error al procesar la factura');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar la factura «${name}»? Desaparecerá de la app de ${currentClient.name}.`)) {
      return;
    }

    try {
      await ecuaplacConnector.deleteDocumentOnline(id);
      const filtered = invoices.filter((i) => i.id !== id);
      setInvoices(filtered);
      localStorage.setItem('ecuaplac_tenant_docs', JSON.stringify(filtered));

      window.dispatchEvent(new Event('ecuaplac_docs_updated'));
      showToast(`Factura eliminada de la app de ${currentClient.name}`);
    } catch (err) {
      console.error('Error al eliminar factura:', err);
    }
  };

  const handleDownload = (inv: InvoiceItem) => {
    if (!inv.fileUrl) {
      alert('Esta es una factura registrada sin archivo físico directo en caché.');
      return;
    }

    if (inv.fileUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = inv.fileUrl;
      a.download = inv.name;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    window.open(inv.fileUrl, '_blank');
  };

  const handleView = (inv: InvoiceItem) => {
    if (!inv.fileUrl) {
      alert(`Visualizando metadatos de ${inv.number || inv.name}: ${inv.concept}`);
      return;
    }

    if (inv.fileUrl.startsWith('data:')) {
      try {
        const parts = inv.fileUrl.split(',');
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
    window.open(inv.fileUrl, '_blank');
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
              Facturación & Documentos PDF
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#C5A059]/15 text-[#F0CF85] border border-[#C5A059]/30">
              {currentClient.name}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Gestión de facturas oficiales y proformas para que el cliente las descargue directamente en su app de NexTool.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="h-10 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-[#C5A059] text-slate-950 font-bold text-xs shadow-lg shadow-[#C5A059]/15 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0 musa-btn-interactive"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Subir Factura PDF</span>
        </button>
      </div>

      {/* 1. Tarjetas de Estadísticas (Stats Bento) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL EMITIDO */}
        <div className="p-5 rounded-2xl musa-glass-panel border border-white/10 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
            TOTAL EMITIDO
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-white font-['Clash_Display']">
              €{stats.totalEmitido.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block">
            {stats.count} facturas registradas
          </span>
        </div>

        {/* TOTAL COBRADO */}
        <div className="p-5 rounded-2xl musa-glass-panel border border-white/10 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
            TOTAL COBRADO
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-emerald-400 font-['Clash_Display']">
              €{stats.totalCobrado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block">
            Ingresos liquidados
          </span>
        </div>

        {/* PENDIENTE DE COBRO */}
        <div className="p-5 rounded-2xl musa-glass-panel border border-white/10 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
            PENDIENTE DE COBRO
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#F0CF85] font-['Clash_Display']">
              €{stats.pendienteCobro.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block">
            Saldo por percibir
          </span>
        </div>

        {/* IVA DEVENGADO (21%) */}
        <div className="p-5 rounded-2xl musa-glass-panel border border-white/10 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
            IVA DEVENGADO (21%)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-300 font-['Clash_Display']">
              €{stats.ivaDevengado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block">
            Cálculo fiscal estimado
          </span>
        </div>
      </div>

      {/* 2. Tabla Maestra de Facturas Disponibles */}
      <div className="rounded-2xl musa-glass-panel border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-[#F0CF85]" />
            <h2 className="text-sm font-bold text-white font-['Clash_Display']">
              Facturas Disponibles para el Cliente
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Sincronizado con app {currentClient.name}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[10px] uppercase font-mono tracking-wider text-slate-400">
                <th className="py-3 px-5 font-semibold">Nº FACTURA</th>
                <th className="py-3 px-5 font-semibold">CONCEPTO</th>
                <th className="py-3 px-5 font-semibold">FECHA EMISIÓN</th>
                <th className="py-3 px-5 font-semibold">VENCIMIENTO</th>
                <th className="py-3 px-5 font-semibold text-right">IMPORTE</th>
                <th className="py-3 px-5 font-semibold text-center">ESTADO</th>
                <th className="py-3 px-5 font-semibold text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-xs">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-300">
                      No hay facturas registradas para {currentClient.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Haz clic en «+ Subir Factura PDF» para emitir una nueva factura oficial.
                    </p>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Nº Factura */}
                    <td className="py-4 px-5 font-mono text-slate-200 font-bold whitespace-nowrap">
                      {inv.number || 'FAC-2026-000'}
                    </td>

                    {/* Concepto & Archivo */}
                    <td className="py-4 px-5 max-w-md">
                      <div className="text-white font-medium truncate">
                        {inv.concept || inv.notes || inv.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                        {inv.name} • {inv.fileSize}
                      </div>
                    </td>

                    {/* Fecha Emisión */}
                    <td className="py-4 px-5 font-mono text-slate-400 whitespace-nowrap">
                      {inv.issueDate || inv.uploadDate}
                    </td>

                    {/* Vencimiento */}
                    <td className="py-4 px-5 font-mono text-slate-500 whitespace-nowrap">
                      {inv.dueDate || '—'}
                    </td>

                    {/* Importe */}
                    <td className="py-4 px-5 font-mono font-bold text-white text-right whitespace-nowrap">
                      €{(inv.totalAmount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-5 text-center whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        inv.status === 'cobrada' || inv.status === 'oficial'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}>
                        {inv.status === 'cobrada' || inv.status === 'oficial' ? 'COBRADA' : 'PENDIENTE'}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleView(inv)}
                          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Ver factura"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(inv)}
                          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Descargar PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(inv.id, inv.name)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Eliminar factura"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Subir Factura PDF Oficial (Diseño exacto de la captura 2) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0C0F17]/95 backdrop-blur-2xl border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#F0CF85]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-['Clash_Display']">
                    Subir Factura PDF Oficial
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Destinatario: <span className="text-[#F0CF85] font-semibold">{currentClient.name}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Número de Factura */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Número de Factura *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                    placeholder="F-2026-003"
                    className="w-full h-10 px-3.5 rounded-xl bg-black/50 border border-white/[0.08] text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                {/* Importe Total */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Importe Total (€) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="120.00"
                    className="w-full h-10 px-3.5 rounded-xl bg-black/50 border border-white/[0.08] text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Concepto o Descripción */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Concepto o Descripción *
                </label>
                <input
                  type="text"
                  required
                  value={formConcept}
                  onChange={(e) => setFormConcept(e.target.value)}
                  placeholder="Mantenimiento MyNext Care (Ecuaplac Reformas)"
                  className="w-full h-10 px-3.5 rounded-xl bg-black/50 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Fecha Emisión */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Fecha Emisión
                  </label>
                  <input
                    type="text"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="14/11/2026"
                    className="w-full h-10 px-3.5 rounded-xl bg-black/50 border border-white/[0.08] text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                {/* Estado de Pago */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Estado de Pago
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'cobrada' | 'pendiente')}
                    className="w-full h-10 px-3.5 rounded-xl bg-black/50 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5A059] cursor-pointer"
                  >
                    <option value="cobrada" className="bg-[#0C0F17]">Cobrada (Pagada)</option>
                    <option value="pendiente" className="bg-[#0C0F17]">Pendiente de Cobro</option>
                  </select>
                </div>
              </div>

              {/* Zona de Drop PDF */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Archivo PDF (Subida Directa) *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-6 rounded-xl border border-dashed border-white/20 hover:border-[#C5A059]/60 bg-black/40 hover:bg-black/60 transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="application/pdf"
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] group-hover:bg-[#C5A059]/15 border border-white/10 group-hover:border-[#C5A059]/30 flex items-center justify-center text-slate-300 group-hover:text-[#F0CF85] transition-colors">
                    <Upload className="w-5 h-5" />
                  </div>
                  {selectedFile ? (
                    <div>
                      <p className="text-xs font-semibold text-emerald-400">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Listo para publicar
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-medium text-slate-200">
                        Arrastra o haz clic para seleccionar PDF
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Máximo 15 MB • Solo formato PDF
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 rounded-xl hover:bg-white/[0.05] text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="h-10 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-[#C5A059] text-slate-950 font-bold text-xs shadow-lg shadow-[#C5A059]/15 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 musa-btn-interactive"
                >
                  {isUploading ? (
                    <span>Publicando...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      <span>Confirmar y Publicar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
