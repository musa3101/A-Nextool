import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Briefcase,
  Star,
  Eye,
  EyeOff,
  Trash2,
  MapPin,
  ExternalLink,
  Sparkles,
  Search,
  CheckCircle2,
  Upload,
  Globe,
  Layers,
  Sliders,
  Phone,
  Mail,
  Lock,
  Save,
  Pencil,
  Camera,
  Image as ImageIcon,
  Images,
  Link as LinkIcon,
  Settings,
  User,
  Smartphone,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  RefreshCw,
  LogOut,
  ClipboardList,
  AlertCircle,
  ShieldCheck,
  Check,
  MessageSquare,
  MessageSquarePlus,
  Copy,
  RotateCcw,
  Inbox,
  Send,
  Home,
  LayoutDashboard,
  Grid2x2,
  BarChart3,
  TrendingUp,
  Zap,
  Users,
  ArrowUpRight,
  Activity,
  Bell,
  X,
  Shield,
  SlidersHorizontal,
  Loader2,
  Languages,
  Download,
  FileText,
  Receipt,
  Folder,
  FolderArchive,
  HardDrive,
  Wrench,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { EcuaplacWorkItem } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { SpaceLogin } from '@/components/ui/space-login';
import { ECUAPLAC_CONFIG } from './config';
import { ecuaplacConnector, EcuaplacLeadItem, EcuaplacAuditLog, CloudflareMetrics, formatLogTime, EcuaplacContactItem } from './conector';
import { DEFAULT_WORKS, DEFAULT_MORE_PROJECTS } from './datos_iniciales';
import { autoTranslateWork } from './traductor';
import { insforge } from '@/lib/insforge';
import { NavHomeIcon, NavGallery1Icon, NavGallery2Icon, NavSettingsIcon } from './NavIcons';
import { CameraIcon } from './CameraIcon';

// Catálogo inicial auténtico de Ecuaplac (9 Obras Reales de Portada y 11 Proyectos de Galería)
const INITIAL_WORKS = DEFAULT_WORKS;
const INITIAL_MORE_PROJECTS = DEFAULT_MORE_PROJECTS;

// Icono Window moderno de 21st / Heroicons para acceso a la web
function WindowIcon({ size = 20, className = '', ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 8.25V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V8.25m-18 0V6a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6v2.25m-18 0h18M5.25 6h.008v.008H5.25zM7.5 6h.008v.008H7.5zm2.25 0h.008v.008H9.75z"
      />
    </svg>
  );
}

// Motor universal de compresión y conversión a WebP (< 250 KB)
const compressImageUniversal = (
  file: File,
  maxWidth = 1400,
  quality = 0.82
): Promise<{ dataUrl: string; sizeKb: number; mime: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const raw = e.target?.result as string;
          return resolve({
            dataUrl: raw,
            sizeKb: Math.round(file.size / 1024),
            mime: file.type,
          });
        }
        ctx.drawImage(img, 0, 0, width, height);

        let targetMime = 'image/webp';
        let testData = canvas.toDataURL(targetMime, quality);
        if (!testData.startsWith('data:image/webp')) {
          targetMime = 'image/jpeg';
          testData = canvas.toDataURL(targetMime, quality);
        }

        const head = `data:${targetMime};base64,`;
        const sizeBytes = Math.round(((testData.length - head.length) * 3) / 4);

        resolve({
          dataUrl: testData,
          sizeKb: Math.max(1, Math.round(sizeBytes / 1024)),
          mime: targetMime,
        });
      };
      img.onerror = () => reject(new Error('No se pudo decodificar el archivo de imagen'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
  });
};

// Componente interactivo para contador numérico animado suave (Estilo Stripe/Apple)
const AnimatedCounter: React.FC<{ value: number; duration?: number; suffix?: string }> = ({
  value,
  duration = 850,
  suffix = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (value - startValue) * easeProgress);
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString('es-ES')}{suffix}</span>;
};

export const EcuaplacPortal: React.FC = () => {
  const { session, isAuthenticated, signInWithEmail, signOut, stopImpersonation } = useAuth();
  const { addAuditLog: addTenantContextAuditLog } = useTenant();

  // Idioma del Panel ('es' | 'en') persistido en localStorage
  const [panelLang, setPanelLang] = useState<'es' | 'en'>(() => {
    try {
      return (localStorage.getItem('ecuaplac_panel_lang') as 'es' | 'en') || 'es';
    } catch {
      return 'es';
    }
  });

  // Auditoría & Logs en vivo desde InsForge Cloud
  const [logs, setLogs] = useState<EcuaplacAuditLog[]>([]);
  const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);

  const addAuditLog = (
    action: string,
    target = 'Ecuaplac App',
    status: 'success' | 'warning' | 'info' = 'info',
    entity = 'general',
    details: Record<string, any> = {}
  ) => {
    const tempLog: EcuaplacAuditLog = {
      id: `local-${Date.now()}`,
      action,
      entity: entity !== 'general' ? entity : (status === 'warning' ? 'delete' : status === 'success' ? 'edit' : 'general'),
      time: panelLang === 'es' ? 'Ahora mismo' : 'Just now',
      created_at: new Date().toISOString(),
      details: { target, ...details },
    };
    setLogs((prev) => [tempLog, ...prev]);

    ecuaplacConnector.addAuditLog(tempLog.entity, action, details).then((saved) => {
      if (saved && saved.id) {
        setLogs((prev) => prev.map((l) => (l.id === tempLog.id ? saved : l)));
      }
    });

    addTenantContextAuditLog(action, target, status);
  };

  // Estados para Login con Gmail + Contraseña
  const [loginEmail, setLoginEmail] = useState('ecuaplacbyjyg@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginRemember, setLoginRemember] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail || !loginPassword) {
      setLoginError(panelLang === 'es' ? 'Introduce tu correo y contraseña' : 'Enter your email and password');
      return;
    }
    setLoginLoading(true);
    const res = await signInWithEmail(loginEmail, loginPassword, loginRemember);
    setLoginLoading(false);
    if (!res.success) {
      setLoginError(res.error || (panelLang === 'es' ? 'Error al iniciar sesión' : 'Sign in failed'));
    } else {
      addAuditLog('Sesión iniciada con éxito en el panel', 'Autenticación', 'success', 'auth');
    }
  };

  // Tab: 'inicio' | 'obras' (Galería 1) | 'more_projects' (Galería 2) | 'ajustes'
  const [activeTab, setActiveTab] = useState<'inicio' | 'obras' | 'more_projects' | 'ajustes'>('inicio');

  // Garantizar que al iniciar sesión o acceder al portal la pestaña activa sea siempre 'inicio'
  useEffect(() => {
    if (isAuthenticated) {
      setActiveTab('inicio');
    }
  }, [isAuthenticated]);

  // Garantizar nitidez absoluta del header en iOS / Safari sincronizando el status bar con #08090C
  useEffect(() => {
    try {
      let metaThemeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.name = 'theme-color';
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.content = '#08090C';
    } catch {
      // Ignorar en entornos donde document no esté disponible
    }
  }, []);

  const handleToggleLang = (lang: 'es' | 'en') => {
    setPanelLang(lang);
    try {
      localStorage.setItem('ecuaplac_panel_lang', lang);
    } catch {}
    addAuditLog(
      lang === 'es' ? 'Idioma del panel cambiado a Español' : 'Panel language switched to English',
      'Configuración',
      'info'
    );
  };

  // Saludo contextual según la hora oficial de España / Baleares (Europe/Madrid)
  const getGreetingText = (name = 'José') => {
    try {
      const hourStr = new Intl.DateTimeFormat('es-ES', {
        timeZone: 'Europe/Madrid',
        hour: 'numeric',
        hour12: false,
      }).format(new Date());
      const hour = parseInt(hourStr, 10);

      // 06:00 a 13:59 -> Buenos días (mañana)
      // 14:00 a 20:59 -> Buenas tardes (tarde)
      // 21:00 a 05:59 -> Buenas noches (noche y madrugada completa)
      if (hour >= 6 && hour < 14) {
        return panelLang === 'es' ? `Buenos días, ${name}` : `Good morning, ${name}`;
      }
      if (hour >= 14 && hour < 21) {
        return panelLang === 'es' ? `Buenas tardes, ${name}` : `Good afternoon, ${name}`;
      }
      return panelLang === 'es' ? `Buenas noches, ${name}` : `Good evening, ${name}`;
    } catch {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 14) {
        return panelLang === 'es' ? `Buenos días, ${name}` : `Good morning, ${name}`;
      }
      if (hour >= 14 && hour < 21) {
        return panelLang === 'es' ? `Buenas tardes, ${name}` : `Good afternoon, ${name}`;
      }
      return panelLang === 'es' ? `Buenas noches, ${name}` : `Good evening, ${name}`;
    }
  };

  // Cloudflare Analytics Timeframe: '30d' | '3m'
  const [cfPeriod, setCfPeriod] = useState<'30d' | '3m'>('30d');
  const [liveCfMetrics, setLiveCfMetrics] = useState<Record<'30d' | '3m', CloudflareMetrics>>(() => ({
    '30d': ecuaplacConnector.getCloudflareMetrics('30d'),
    '3m': ecuaplacConnector.getCloudflareMetrics('3m'),
  }));
  const cfMetrics = liveCfMetrics[cfPeriod] || ecuaplacConnector.getCloudflareMetrics(cfPeriod);

  // Filter state
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'active' | 'hidden'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Collections state
  const [works, setWorks] = useState<EcuaplacWorkItem[]>(() =>
    ecuaplacConnector.getWorks(INITIAL_WORKS)
  );
  const [moreProjects, setMoreProjects] = useState<EcuaplacWorkItem[]>(() =>
    ecuaplacConnector.getMoreProjects(INITIAL_MORE_PROJECTS)
  );

  // Carga inicial en vivo desde Supabase e InsForge (sincroniza fotos y actividad real)
  useEffect(() => {
    ecuaplacConnector.fetchWorksOnline().then((liveWorks) => {
      if (liveWorks && liveWorks.length > 0) {
        setWorks(liveWorks);
      }
    });

    ecuaplacConnector.fetchProjectsOnline().then((liveProjects) => {
      if (liveProjects && liveProjects.length > 0) {
        setMoreProjects(liveProjects);
      }
    });

    ecuaplacConnector.fetchAuditLogsOnline().then((liveLogs) => {
      if (liveLogs && liveLogs.length > 0) {
        setLogs(liveLogs);
      }
    });

    ecuaplacConnector.fetchCloudflareMetricsOnline().then((onlineMetrics) => {
      if (onlineMetrics) {
        setLiveCfMetrics(onlineMetrics);
      }
    });
  }, []);

  // Auto-persist works & moreProjects via connector
  useEffect(() => {
    ecuaplacConnector.saveWorks(works);
  }, [works]);

  useEffect(() => {
    ecuaplacConnector.saveMoreProjects(moreProjects);
  }, [moreProjects]);

  // Leads State & Filter (Sincronizado con Supabase y LocalStorage)
  const defaultLeads: EcuaplacLeadItem[] = [
    {
      id: 'lead-1',
      name: 'Alfonso Durán',
      phone: '+34 655 443 221',
      email: 'alfonso.duran@gmail.com',
      work_type: 'Reforma de techos de pladur en vivienda unifamiliar en Andratx (aprox 120m²)',
      budget_estimate: '3.500 € - 5.000 €',
      status: 'new',
      date: 'Hoy, 10:15',
      notes: 'Interesado en empezar en 2 semanas.',
    },
    {
      id: 'lead-2',
      name: 'Beatriz Riera',
      phone: '+34 677 889 900',
      email: 'beatriz.riera@hotmail.com',
      work_type: 'Aislamiento acústico y térmico con tabiquería seca en dormitorio principal',
      budget_estimate: '1.800 € - 2.400 €',
      status: 'contacted',
      date: 'Ayer, 17:40',
      notes: 'Llamada realizada. Pendiente de medir el jueves.',
    },
    {
      id: 'lead-3',
      name: 'Carlos Mendoza',
      phone: '+34 612 345 678',
      email: 'carlos.mendoza@gmail.com',
      work_type: 'Reforma de tabiques y falso techo con foseado LED en salón',
      budget_estimate: '4.200 €',
      status: 'approved',
      date: 'Hace 3 días',
      notes: 'Presupuesto firmado y aceptado.',
    },
  ];

  const [leadFilter, setLeadFilter] = useState<'all' | 'new' | 'contacted' | 'approved'>('all');
  const [leads, setLeads] = useState<EcuaplacLeadItem[]>(() =>
    ecuaplacConnector.getLeads(defaultLeads)
  );

  // Carga reactiva de Leads desde Supabase
  useEffect(() => {
    ecuaplacConnector.fetchLeadsOnline().then((liveLeads) => {
      if (liveLeads && liveLeads.length > 0) {
        setLeads(liveLeads);
      }
    });
  }, []);

  // Persistencia local automática de Leads
  useEffect(() => {
    ecuaplacConnector.saveLeads(leads);
  }, [leads]);

  // Estado para Forzar Actualización / Sincronización en vivo
  const [isForceSyncing, setIsForceSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(false);

  // Toast flotante de sincronización en tiempo real con ecuaplac.com
  const [syncToast, setSyncToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'syncing';
  } | null>(null);

  const showSyncToast = (
    message: string,
    type: 'success' | 'error' | 'syncing' = 'success'
  ) => {
    setSyncToast({ message, type });
    if (type !== 'syncing') {
      setTimeout(() => {
        setSyncToast(null);
      }, 3500);
    }
  };

  const handleForceSync = async () => {
    if (isForceSyncing) return;
    setIsForceSyncing(true);
    setSyncFeedback(false);
    try {
      const [liveWorks, liveProjects, liveLeads] = await Promise.all([
        ecuaplacConnector.fetchWorksOnline(),
        ecuaplacConnector.fetchProjectsOnline(),
        ecuaplacConnector.fetchLeadsOnline(),
      ]);
      if (liveWorks && liveWorks.length > 0) setWorks(liveWorks);
      if (liveProjects && liveProjects.length > 0) setMoreProjects(liveProjects);
      if (liveLeads && liveLeads.length > 0) setLeads(liveLeads);
      setSyncFeedback(true);
      setTimeout(() => setSyncFeedback(false), 2500);
      addAuditLog('Actualización forzada: Web y backend sincronizados', 'Ecuaplac Web', 'success');
    } catch (err) {
      console.error('Error al forzar actualización:', err);
    } finally {
      setIsForceSyncing(false);
    }
  };

  // Estados avanzados de Bandeja Ejecutiva de Leads (Estilo Gmail)
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isSyncingLeads, setIsSyncingLeads] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const cleanPhoneForWhatsApp = (phone?: string) => {
    if (!phone) return '';
    let digits = phone.replace(/[^0-9]/g, '');
    if (digits.startsWith('00')) {
      digits = digits.replace(/^00/, '');
    }
    if (digits.length === 9 && (digits.startsWith('6') || digits.startsWith('7') || digits.startsWith('8') || digits.startsWith('9'))) {
      return `34${digits}`;
    }
    return digits;
  };

  const handleCopyLeadInfo = (text: string, label: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {
      // Ignorar fallo de permisos en webview o headless
    }
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRefreshLeads = async () => {
    setIsSyncingLeads(true);
    showSyncToast(
      panelLang === 'es' ? 'Sincronizando con Supabase (ecuaplac.com)...' : 'Checking leads on Supabase...',
      'syncing'
    );
    try {
      const startTime = Date.now();
      const liveLeads = await ecuaplacConnector.fetchLeadsOnline();
      // Aseguramos al menos 600ms de rotación táctil para confirmación visual instantánea
      const elapsed = Date.now() - startTime;
      if (elapsed < 600) {
        await new Promise((resolve) => setTimeout(resolve, 600 - elapsed));
      }
      if (liveLeads) {
        setLeads(liveLeads);
        showSyncToast(
          panelLang === 'es'
            ? `Sincronización completada (${liveLeads.length} solicitudes activas)`
            : `${liveLeads.length} leads synced from Supabase`,
          'success'
        );
      }
    } catch {
      showSyncToast(
        panelLang === 'es' ? 'Error al contactar con el servidor web' : 'Error contacting website server',
        'error'
      );
    } finally {
      setIsSyncingLeads(false);
    }
  };

  const handleDeleteLead = async (leadId: string, leadName: string) => {
    const confirmMsg =
      panelLang === 'es'
        ? `¿Deseas quitar la solicitud de "${leadName}" de esta bandeja?\n\n(Nota: Se mantendrá guardada intacta en la base de datos de Supabase).`
        : `Remove inquiry from "${leadName}" from this inbox?\n\n(Note: It will remain safely preserved in Supabase).`;
    if (!window.confirm(confirmMsg)) return;

    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    if (selectedLeadId === leadId) setSelectedLeadId(null);
    await ecuaplacConnector.deleteLead(leadId);
    addAuditLog(`Solicitud de presupuesto quitada de la bandeja: «${leadName}»`, 'Ecuaplac Leads', 'warning', 'delete');
    showSyncToast(
      panelLang === 'es' ? `Presupuesto de ${leadName} quitado de la bandeja (guardado en Supabase)` : `Lead ${leadName} removed from inbox`,
      'success'
    );
  };

  const handleRestoreDefaultLeads = () => {
    setLeads(defaultLeads);
    ecuaplacConnector.saveLeads(defaultLeads);
    addAuditLog('Presupuestos de demostración restaurados', 'Ecuaplac Leads', 'info', 'status');
    showSyncToast(
      panelLang === 'es' ? 'Presupuestos de demostración restaurados' : 'Demo leads restored',
      'success'
    );
  };

  const handleUpdateLeadStatus = (leadId: string, newStatus: EcuaplacLeadItem['status']) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    ecuaplacConnector.updateLeadStatus(leadId, newStatus);
    const targetLead = leads.find((l) => l.id === leadId);
    if (targetLead) {
      const statusLabels: Record<string, string> = {
        new: 'No Contestado',
        contacted: 'En Contacto',
        approved: 'Obra Aceptada',
      };
      addAuditLog(
        `Lead «${targetLead.name}» marcado como: ${statusLabels[newStatus] || newStatus}`,
        'Ecuaplac Leads',
        'info',
        'status'
      );
    }
  };

  // --- Estados y Lógica para Contacto de la Web (ecuaplac_contact en Supabase) ---
  const [contacts, setContacts] = useState<EcuaplacContactItem[]>(() =>
    ecuaplacConnector.getContacts()
  );
  const [isEditingContacts, setIsEditingContacts] = useState(false);
  const [isSavingContacts, setIsSavingContacts] = useState(false);
  const [contactForm, setContactForm] = useState({
    joseName: 'José Rivadeneira',
    josePhone: '+34 678 15 98 78',
    joffreName: 'Joffre Méndez',
    joffrePhone: '+34 603 40 44 50',
    email: 'ecuaplac.jyg.sl@gmail.com',
  });

  // Consulta en segundo plano a Supabase al abrir el panel
  useEffect(() => {
    ecuaplacConnector.fetchContactsOnline().then((liveContacts) => {
      if (liveContacts && liveContacts.length > 0) {
        setContacts(liveContacts);
      }
    });
  }, []);

  // Sincronizar formulario con los contactos cargados
  useEffect(() => {
    const jose = contacts.find((c) => c.key === 'goyo' || c.name_es.toLowerCase().includes('josé') || c.name_es.toLowerCase().includes('jose'));
    const joffre = contacts.find((c) => c.key === 'Jofrre' || c.key.toLowerCase().includes('joffre') || c.name_es.toLowerCase().includes('joffre'));
    const emailItem = contacts.find((c) => c.key === 'email' || c.icon === 'mail');

    setContactForm({
      joseName: jose?.name_es || 'José Rivadeneira',
      josePhone: jose?.value_es || '+34 678 15 98 78',
      joffreName: joffre?.name_es || 'Joffre Méndez',
      joffrePhone: joffre?.value_es || '+34 603 40 44 50',
      email: emailItem?.value_es || 'ecuaplac.jyg.sl@gmail.com',
    });
  }, [contacts]);

  const handleSaveContacts = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingContacts(true);
    showSyncToast(
      panelLang === 'es' ? 'Guardando contactos en la web (ecuaplac.com)...' : 'Saving website contacts...',
      'syncing'
    );

    try {
      const startTime = Date.now();
      const jose = contacts.find((c) => c.key === 'goyo' || c.name_es.toLowerCase().includes('josé') || c.name_es.toLowerCase().includes('jose'));
      const joffre = contacts.find((c) => c.key === 'Jofrre' || c.key.toLowerCase().includes('joffre') || c.name_es.toLowerCase().includes('joffre'));
      const emailItem = contacts.find((c) => c.key === 'email' || c.icon === 'mail');

      const promises: Promise<boolean>[] = [];

      if (jose) {
        promises.push(
          ecuaplacConnector.updateContactItem(jose.id, {
            name_es: contactForm.joseName.trim(),
            name_en: contactForm.joseName.trim(),
            value_es: contactForm.josePhone.trim(),
            value_en: contactForm.josePhone.trim(),
          })
        );
      }
      if (joffre) {
        promises.push(
          ecuaplacConnector.updateContactItem(joffre.id, {
            name_es: contactForm.joffreName.trim(),
            name_en: contactForm.joffreName.trim(),
            value_es: contactForm.joffrePhone.trim(),
            value_en: contactForm.joffrePhone.trim(),
          })
        );
      }
      if (emailItem) {
        promises.push(
          ecuaplacConnector.updateContactItem(emailItem.id, {
            value_es: contactForm.email.trim(),
            value_en: contactForm.email.trim(),
          })
        );
      }

      await Promise.all(promises);

      // Esperar al menos 600ms para confirmación táctil visual
      const elapsed = Date.now() - startTime;
      if (elapsed < 600) {
        await new Promise((r) => setTimeout(r, 600 - elapsed));
      }

      // Refrescar lista local y estado
      const updatedContacts = ecuaplacConnector.getContacts();
      setContacts([...updatedContacts]);

      addAuditLog('Contacto de la web actualizado', 'Ecuaplac Web', 'success', 'update');
      showSyncToast(
        panelLang === 'es' ? 'Contacto de la web actualizado con éxito' : 'Website contact updated successfully',
        'success'
      );
      setIsEditingContacts(false);
    } catch {
      showSyncToast(
        panelLang === 'es' ? 'Error al guardar contactos en la web' : 'Error updating website contacts',
        'error'
      );
    } finally {
      setIsSavingContacts(false);
    }
  };

  const filteredLeads = leads.filter((l) => {
    const matchesFilter = leadFilter === 'all' || l.status === leadFilter;
    if (!matchesFilter) return false;
    if (!leadSearchQuery.trim()) return true;
    const q = leadSearchQuery.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.phone.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.work_type.toLowerCase().includes(q) ||
      l.budget_estimate.toLowerCase().includes(q) ||
      (l.notes && l.notes.toLowerCase().includes(q))
    );
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EcuaplacWorkItem | null>(null);

  // Form State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formTargetGallery, setFormTargetGallery] = useState<'carousel' | 'projects'>('carousel');
  const [formTitleEs, setFormTitleEs] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formTitleDe, setFormTitleDe] = useState('');
  const [formLocation, setFormLocation] = useState('Mallorca');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formFitMode, setFormFitMode] = useState<'cover' | 'contain'>('cover');
  const [showEnglishFields, setShowEnglishFields] = useState(true);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSavingWork, setIsSavingWork] = useState(false);
  const isSubmittingWorkRef = useRef(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<EcuaplacWorkItem | null>(null);
  const [isDeletingWork, setIsDeletingWork] = useState(false);
  const [uploadStats, setUploadStats] = useState<{ sizeKb: number; mime: string } | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedSuccess, setTranslatedSuccess] = useState(false);

  const handleAutoTranslate = async () => {
    if (!formTitleEs.trim()) {
      alert('Escribe primero el título en español para poder traducirlo con IA.');
      return;
    }
    setIsTranslating(true);
    setTranslatedSuccess(false);
    try {
      const res = await autoTranslateWork(formTitleEs, formLocation);
      setFormTitleEn(res.titleEn);
      setFormTitleDe(res.titleDe);
      setShowEnglishFields(true);
      setTranslatedSuccess(true);
      setTimeout(() => setTranslatedSuccess(false), 2500);
    } catch (err) {
      console.error('Error al autotraducir:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Estados para Ajustes, Perfil y CRM Leads (Diseño Estilo Pinterest)
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [adminName, setAdminName] = useState('José Rivadeneira');
  const [nameInput, setNameInput] = useState('José Rivadeneira');
  const [adminAvatar, setAdminAvatar] = useState('/ecuaplac/fav-sin-fondo.svg');
  const [nameSuccess, setNameSuccess] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState(false);

  // Modales Dedicados
  const [isLeadsModalOpen, setIsLeadsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationFeedback, setNotificationFeedback] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'es' | 'en'>('es');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Seguridad
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Feedback & Soporte para el cliente (Envío directo a Musa)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState<'bug' | 'idea' | 'question'>('bug');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [feedbackSentSuccess, setFeedbackSentSuccess] = useState(false);

  // Versión del Sistema Next Tools
  const CURRENT_SYSTEM_VERSION = '3.0.1';
  const [isUpdatesExpanded, setIsUpdatesExpanded] = useState(false);
  const [autoCheckUpdates, setAutoCheckUpdates] = useState(true);
  const [updateCheckState, setUpdateCheckState] = useState<'idle' | 'checking' | 'up-to-date' | 'available' | 'installing' | 'installed'>('idle');
  const [installedVersion, setInstalledVersion] = useState(() => {
    const cached = localStorage.getItem('nextool_app_version');
    // La versión oficial instalada en este código siempre es CURRENT_SYSTEM_VERSION (3.0.1)
    if (!cached || cached !== CURRENT_SYSTEM_VERSION) {
      localStorage.setItem('nextool_app_version', CURRENT_SYSTEM_VERSION);
      return CURRENT_SYSTEM_VERSION;
    }
    return cached;
  });
  const [simulatedUpdateAvailable, setSimulatedUpdateAvailable] = useState(false);
  const [newVersionNotice, setNewVersionNotice] = useState<string | null>(null);
  const [isUpdateBannerDismissed, setIsUpdateBannerDismissed] = useState(false);

  const handleSendFeedback = async (channel: 'whatsapp' | 'email' | 'system') => {
    if (!feedbackMessage.trim()) {
      alert(panelLang === 'es' ? 'Por favor escribe tu mensaje o duda antes de enviar.' : 'Please write your message before sending.');
      return;
    }

    setIsSendingFeedback(true);
    const categoryLabels = {
      bug: panelLang === 'es' ? 'Incidencia / Problema' : 'Issue / Bug',
      idea: panelLang === 'es' ? 'Sugerencia / Idea' : 'Feature / Idea',
      question: panelLang === 'es' ? 'Consulta Técnica' : 'Technical Question',
    };

    const subjectText = feedbackSubject.trim() || (panelLang === 'es' ? 'Sin asunto' : 'No subject');
    const deviceDetails = `${navigator.userAgent.includes('Mobile') ? 'Móvil' : 'Escritorio'} · v${installedVersion} · Ecuaplac`;

    // 1. Guardar en backend (tabla audit_logs con entity 'feedback')
    try {
      await ecuaplacConnector.addAuditLog(
        'feedback',
        `Feedback enviado: [${categoryLabels[feedbackCategory]}] «${subjectText}»`,
        {
          category: feedbackCategory,
          subject: subjectText,
          message: feedbackMessage.trim(),
          sender: adminName,
          tenant: 'ecuaplac',
          version: installedVersion,
        }
      );
      addAuditLog(
        `Feedback registrado: «${subjectText}»`,
        'Soporte NexTool',
        'info',
        'profile'
      );
    } catch (e) {
      console.warn('Error al guardar feedback:', e);
    }

    // 2. Notificación y canal directo
    if (channel === 'whatsapp') {
      const waText = `*NexTool Feedback — Ecuaplac*\n\n` +
        `*Tipo:* ${categoryLabels[feedbackCategory]}\n` +
        `*De:* ${adminName}\n` +
        `*Asunto:* ${subjectText}\n\n` +
        `*Mensaje:*\n${feedbackMessage.trim()}\n\n` +
        `_Dispositivo: ${deviceDetails}_`;

      window.open(`https://wa.me/34673109486?text=${encodeURIComponent(waText)}`, '_blank');
    } else if (channel === 'email') {
      const mailtoUrl = `mailto:mynextbymusa@gmail.com?subject=${encodeURIComponent(
        `[NexTool Feedback] ${categoryLabels[feedbackCategory]} - ${subjectText} (Ecuaplac)`
      )}&body=${encodeURIComponent(
        `Hola Musa,\n\nTe envío este mensaje desde el panel de control de Ecuaplac:\n\n` +
        `Tipo: ${categoryLabels[feedbackCategory]}\n` +
        `De: ${adminName}\n` +
        `Asunto: ${subjectText}\n\n` +
        `Mensaje:\n${feedbackMessage.trim()}\n\n` +
        `--------------------\n` +
        `Versión de la app: v${installedVersion}\n` +
        `Cliente: Ecuaplac Reformas Integrales\n` +
        `Fecha: ${new Date().toLocaleString('es-ES')}`
      )}`;
      window.open(mailtoUrl, '_blank');
    }

    setIsSendingFeedback(false);
    setFeedbackSentSuccess(true);
    showSyncToast(
      panelLang === 'es' ? 'Mensaje registrado y enviado a Musa' : 'Feedback logged and sent to Musa',
      'success'
    );

    setTimeout(() => {
      setFeedbackSentSuccess(false);
      setFeedbackSubject('');
      setFeedbackMessage('');
      setIsFeedbackModalOpen(false);
    }, 1800);
  };

  // Sincronización proactiva de versión y auto-actualizaciones con PWA Bypass y InsForge Cloud
  useEffect(() => {
    let isMounted = true;
    const checkVersion = async () => {
      try {
        // 1. Chequeo directo a /version.json con URL absoluta, timestamp anti-caché y cabeceras estrictas
        const endpoint = `${window.location.origin}/version.json?_t=${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const res = await fetch(endpoint, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (!isMounted) return;
          if (data?.version) {
            if (data.version !== CURRENT_SYSTEM_VERSION) {
              setNewVersionNotice(data.version);
              setSimulatedUpdateAvailable(true);
              setUpdateCheckState('available');
              return;
            } else {
              // El servidor oficial certifica que estamos al día en 3.0.0
              setNewVersionNotice(null);
              setSimulatedUpdateAvailable(false);
              setUpdateCheckState('up-to-date');
              return;
            }
          }
        }

        // 2. Comprobación de respaldo contra InsForge Cloud (solo si /version.json no respondió)
        const cloudVer = await ecuaplacConnector.fetchTenantVersion();
        if (!isMounted) return;
        if (cloudVer && cloudVer !== '000' && cloudVer !== CURRENT_SYSTEM_VERSION) {
          setNewVersionNotice(cloudVer);
          setSimulatedUpdateAvailable(true);
          setUpdateCheckState('available');
        } else {
          setNewVersionNotice(null);
          setSimulatedUpdateAvailable(false);
          setUpdateCheckState('up-to-date');
        }
      } catch {}
    };

    checkVersion();

    // Detección automática al volver a la app tras bloquear/desbloquear el móvil
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkVersion);

    // Intervalo de comprobación en segundo plano cada 20 segundos
    const interval = setInterval(() => {
      if (autoCheckUpdates) {
        checkVersion();
      }
    }, 20000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkVersion);
    };
  }, [installedVersion, autoCheckUpdates]);

  const handleCheckUpdates = async () => {
    setUpdateCheckState('checking');
    try {
      // 1. Comprobar /version.json en servidor con bypass de caché absoluto
      const endpoint = `${window.location.origin}/version.json?_t=${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const res = await fetch(endpoint, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.version) {
          if (data.version !== CURRENT_SYSTEM_VERSION) {
            setNewVersionNotice(data.version);
            setSimulatedUpdateAvailable(true);
            setUpdateCheckState('available');
            return;
          } else {
            setNewVersionNotice(null);
            setSimulatedUpdateAvailable(false);
            setUpdateCheckState('up-to-date');
            return;
          }
        }
      }

      // 2. Comprobar InsForge Cloud
      const cloudVer = await ecuaplacConnector.fetchTenantVersion();
      if (cloudVer && cloudVer !== '000' && cloudVer !== CURRENT_SYSTEM_VERSION) {
        setNewVersionNotice(cloudVer);
        setSimulatedUpdateAvailable(true);
        setUpdateCheckState('available');
      } else if (simulatedUpdateAvailable) {
        setUpdateCheckState('available');
      } else {
        setNewVersionNotice(null);
        setSimulatedUpdateAvailable(false);
        setUpdateCheckState('up-to-date');
      }
    } catch {
      setUpdateCheckState('up-to-date');
    }
  };

  const handleInstallUpdate = async () => {
    setUpdateCheckState('installing');
    const targetVer = newVersionNotice || CURRENT_SYSTEM_VERSION;
    try {
      await ecuaplacConnector.updateTenantVersion(targetVer);
    } catch {}

    // Limpieza profunda de Service Worker y CacheStorage en móvil
    try {
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((k) => caches.delete(k)));
      }
    } catch {}

    setTimeout(() => {
      setUpdateCheckState('installed');
      setInstalledVersion(targetVer);
      localStorage.setItem('nextool_app_version', targetVer);
      setSimulatedUpdateAvailable(false);
      setNewVersionNotice(null);
      addAuditLog(`Actualización aplicada: Versión ${targetVer} en producción`, 'Next Tools Core', 'success');
      setTimeout(() => {
        // Recargar saltando caché
        window.location.href = window.location.pathname + '?v=' + targetVer + '&t=' + Date.now();
      }, 500);
    }, 1000);
  };

  // Facturas y Documentos del Proyecto (Plegadas / Escondiditas por defecto)
  const [isFacturasOpen, setIsFacturasOpen] = useState(false);
  const facturasSectionRef = useRef<HTMLDivElement>(null);
  const [activeDocTab, setActiveDocTab] = useState<'factura' | 'gmail'>('factura');
  const docFileInputRef = useRef<HTMLInputElement>(null);
  const invoiceFileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleFacturas = () => {
    const willOpen = !isFacturasOpen;
    setIsFacturasOpen(willOpen);
    if (willOpen) {
      setTimeout(() => {
        if (facturasSectionRef.current) {
          const yOffset = -24;
          const y = facturasSectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 120);
    }
  };

  // MyNext Care (Mantenimiento Web Plegable / Escondidito por defecto)
  const [isCareOpen, setIsCareOpen] = useState(false);
  const careSectionRef = useRef<HTMLDivElement>(null);

  const handleToggleCare = () => {
    const willOpen = !isCareOpen;
    setIsCareOpen(willOpen);
    if (willOpen) {
      setTimeout(() => {
        if (careSectionRef.current) {
          const yOffset = -24;
          const y = careSectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 120);
    }
  };

  interface ProjectDocItem {
    id: string;
    number?: string;
    name: string;
    fileUrl: string;
    fileSize: string;
    uploadDate: string;
    issueDate?: string;
    dueDate?: string;
    category: 'factura' | 'gmail';
    status: 'pagada' | 'oficial' | 'pendiente';
    clientName?: string;
    clientCif?: string;
    clientAddress?: string;
    items?: Array<{ description: string; qty: number; unitPrice: number; total: number }>;
    subtotal?: number;
    vatAmount?: number;
    totalAmount?: number;
    notes?: string;
    isCustomUpload?: boolean;
  }

  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<ProjectDocItem | null>(null);
  const [isInvoiceViewerOpen, setIsInvoiceViewerOpen] = useState(false);

  const [projectDocs, setProjectDocs] = useState<ProjectDocItem[]>([
    {
      id: 'doc-001',
      number: 'FAC-2026-001',
      name: 'Factura_001_Desarrollo_Web_Ecuaplac.pdf',
      fileUrl: '',
      fileSize: '320 KB',
      uploadDate: '3 Nov 2026',
      issueDate: '03/11/2026',
      dueDate: 'Al contado',
      category: 'factura',
      status: 'pagada',
      clientName: 'Ecuaplac J&G S.L.',
      clientCif: 'B-07982341',
      clientAddress: 'C/ Gremi Teixidors 24, Palma de Mallorca',
      items: [
        {
          description: 'Desarrollo del panel de control web móvil Nextool Web para Ecuaplac',
          qty: 1,
          unitPrice: 850.0,
          total: 850.0,
        },
        {
          description: 'Aceleración y Seguridad Web SSL, optimización WebP ultra-rápida',
          qty: 1,
          unitPrice: 250.0,
          total: 250.0,
        },
      ],
      subtotal: 1100.0,
      vatAmount: 231.0,
      totalAmount: 1331.0,
      notes: 'Transferencia bancaria recibida. Proyecto entregado y operativo al 100%.',
    },
    {
      id: 'doc-002',
      number: 'FAC-2026-002',
      name: 'Presupuesto_Hosting_Web_2026.pdf',
      fileUrl: '',
      fileSize: '185 KB',
      uploadDate: '1 Nov 2026',
      issueDate: '01/11/2026',
      dueDate: '15/11/2026',
      category: 'factura',
      status: 'oficial',
      clientName: 'Ecuaplac J&G S.L.',
      clientCif: 'B-07982341',
      clientAddress: 'C/ Gremi Teixidors 24, Palma de Mallorca',
      items: [
        {
          description: 'Servidor de Alto Rendimiento y Web Oficial Anual (Mallorca)',
          qty: 1,
          unitPrice: 180.0,
          total: 180.0,
        },
        {
          description: 'Mantenimiento de copias de seguridad y blindaje de seguridad',
          qty: 1,
          unitPrice: 60.0,
          total: 60.0,
        },
      ],
      subtotal: 240.0,
      vatAmount: 50.4,
      totalAmount: 290.4,
      notes: 'Presupuesto oficial y factura proforma de hosting web anual.',
    },
    {
      id: 'doc-003',
      name: 'Resumen_Correos_Gmail_Clientes_Noviembre.pdf',
      fileUrl: '',
      fileSize: '412 KB',
      uploadDate: '4 Nov 2026',
      category: 'gmail',
      status: 'oficial',
      notes: 'Backup sincronizado de hilos de consulta de presupuestos recibidos en Gmail.',
    },
    {
      id: 'doc-004',
      name: 'Planos_Arquitectonicos_Drive_Palma.pdf',
      fileUrl: '',
      fileSize: '1.2 MB',
      uploadDate: '28 Oct 2026',
      category: 'gmail',
      status: 'oficial',
      notes: 'Planos acotados y mediciones de techos suspendidos vinculados a Google Drive.',
    },
  ]);

  // Carga inicial y sincronización en tiempo real de facturas/documentos desde InsForge Cloud
  useEffect(() => {
    let isMounted = true;
    ecuaplacConnector.fetchDocumentsOnline().then((liveDocs) => {
      if (!isMounted) return;
      if (liveDocs && liveDocs.length > 0) {
        setProjectDocs(liveDocs);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const handleUploadDoc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInKb = Math.round(file.size / 1024);
    const sizeFormatted = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`;

    const reader = new FileReader();
    reader.onload = async () => {
      const fileDataUrl = (reader.result as string) || '';
      const docNumber = `FAC-2026-${String(projectDocs.length + 1).padStart(3, '0')}`;

      showSyncToast(panelLang === 'es' ? 'Sincronizando con la nube...' : 'Syncing with cloud...', 'syncing');

      // 1. Guardar en Base de Datos para que esté disponible en Safari móvil y ordenador
      const savedId = await ecuaplacConnector.saveDocumentOnline({
        doc_number: docNumber,
        name: file.name,
        file_url: fileDataUrl,
        file_size: sizeFormatted,
        category: activeDocTab,
        status: 'oficial',
        total_amount: 0,
        notes: `Factura subida desde el portal de Ecuaplac`,
      });

      const newDoc: ProjectDocItem = {
        id: savedId || `doc-${Date.now()}`,
        number: docNumber,
        name: file.name,
        fileUrl: fileDataUrl,
        fileSize: sizeFormatted,
        uploadDate: 'Hoy, ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        issueDate: new Date().toLocaleDateString('es-ES'),
        dueDate: '30 días',
        category: activeDocTab,
        status: 'oficial',
        clientName: 'Ecuaplac J&G S.L.',
        clientCif: 'B-07982341',
        clientAddress: 'Palma de Mallorca, Illes Balears',
        notes: `Documento PDF (${activeDocTab === 'factura' ? 'Facturación' : 'Gmail & Drive'}) sincronizado en la nube.`,
        isCustomUpload: true,
      };

      setProjectDocs((prev) => [newDoc, ...prev]);
      setIsFacturasOpen(true);
      showSyncToast(panelLang === 'es' ? 'Documento sincronizado en la nube' : 'Document synced to cloud', 'success');
      addAuditLog(`Documento PDF subido: «${file.name}» (${sizeFormatted})`, 'Documentación', 'success');
    };
    reader.readAsDataURL(file);

    if (docFileInputRef.current) docFileInputRef.current.value = '';
    if (invoiceFileInputRef.current) invoiceFileInputRef.current.value = '';
  };

  const handleDeleteDoc = async (id: string) => {
    const doc = projectDocs.find((i) => i.id === id);
    setProjectDocs((prev) => prev.filter((i) => i.id !== id));
    if (doc) {
      addAuditLog(`Documento eliminado: «${doc.name}»`, 'Documentación', 'info');
    }
    await ecuaplacConnector.deleteDocumentOnline(id);
    showSyncToast(panelLang === 'es' ? 'Eliminado de la nube' : 'Deleted from cloud', 'success');
  };

  const handleViewDoc = (doc: ProjectDocItem) => {
    setSelectedInvoiceForView(doc);
    setIsInvoiceViewerOpen(true);
  };

  const handleViewInvoicePdf = (fileUrl?: string, fileName?: string) => {
    if (!fileUrl) {
      window.print();
      return;
    }

    if (fileUrl.startsWith('data:')) {
      try {
        const parts = fileUrl.split(',');
        const mime = parts[0].split(':')[1]?.split(';')[0] || 'application/pdf';
        const byteCharacters = atob(parts[1]);
        const byteNumbers = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([byteNumbers], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, '_blank');
        if (!win) {
          window.location.href = blobUrl;
        }
        return;
      } catch (e) {
        console.warn('Error al abrir PDF:', e);
      }
    }
    window.open(fileUrl, '_blank');
  };

  const handleOpenFullscreenInvoice = (fileUrl?: string, fileName?: string) => {
    const targetName = fileName || selectedInvoiceForView?.name || 'Factura_Ecuaplac.pdf';

    if (!fileUrl) {
      window.print();
      return;
    }

    if (fileUrl.startsWith('data:')) {
      try {
        const parts = fileUrl.split(',');
        const mime = parts[0].split(':')[1]?.split(';')[0] || 'application/pdf';
        const byteCharacters = atob(parts[1]);
        const byteNumbers = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([byteNumbers], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = targetName;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      } catch (e) {
        console.warn('Error al decodificar data URL para descarga:', e);
      }
    }
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = targetName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleUploadInvoice = handleUploadDoc;
  const handleDeleteInvoice = handleDeleteDoc;
  const handleViewInvoice = handleViewDoc;
  const invoices = projectDocs;
  const setInvoices = setProjectDocs;

  // Acordeón activo: 'leads' | 'profile' | 'security' | 'device' | 'logs' | null
  const [openAccordion, setOpenAccordion] = useState<'leads' | 'profile' | 'security' | 'device' | 'logs' | null>('leads');

  const toggleAccordion = (section: 'leads' | 'profile' | 'security' | 'device' | 'logs') => {
    setOpenAccordion((prev) => (prev === section ? null : section));
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { dataUrl } = await compressImageUniversal(file, 400, 0.85);
      setAdminAvatar(dataUrl);
      setAvatarSuccess(true);
      setTimeout(() => setAvatarSuccess(false), 3000);
      addAuditLog('Avatar de administrador actualizado', 'Ecuaplac App', 'success', 'profile');
    } catch (err) {
      console.warn('Error al procesar avatar:', err);
    }
  };

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setAdminName(trimmed);
    setNameSuccess(true);
    setTimeout(() => setNameSuccess(false), 3000);
    addAuditLog(`Nombre de administrador cambiado a: "${trimmed}"`, 'Ecuaplac App', 'success', 'profile');
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currPass) {
      setPasswordFeedback({
        type: 'error',
        msg: panelLang === 'es' ? 'Introduce la contraseña actual (inicial: admin)' : 'Enter current password (default: admin)',
      });
      return;
    }
    if (newPass.length < 4) {
      setPasswordFeedback({
        type: 'error',
        msg: panelLang === 'es' ? 'La nueva contraseña debe tener al menos 4 caracteres' : 'New password must be at least 4 characters',
      });
      return;
    }
    if (newPass !== confirmPass) {
      setPasswordFeedback({
        type: 'error',
        msg: panelLang === 'es' ? 'Las nuevas contraseñas no coinciden' : 'New passwords do not match',
      });
      return;
    }

    try {
      const emailToUpdate = session.email || 'ecuaplacbyjyg@gmail.com';
      const { data, error } = await insforge.database.rpc('change_user_password', {
        p_email: emailToUpdate,
        p_current_password: currPass,
        p_new_password: newPass,
      });

      if (error || !data?.success) {
        setPasswordFeedback({
          type: 'error',
          msg: data?.error || error?.message || (panelLang === 'es' ? 'Error al actualizar contraseña' : 'Failed to update password'),
        });
        return;
      }

      setPasswordFeedback({
        type: 'success',
        msg: panelLang === 'es' ? '¡Contraseña actualizada en el servidor!' : 'Password updated on server!',
      });
      setCurrPass('');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => {
        setIsSecurityModalOpen(false);
        setPasswordFeedback(null);
      }, 2000);
      showSyncToast(
        panelLang === 'es' ? 'Contraseña sincronizada con el servidor' : 'Password synced with server',
        'success'
      );
      addAuditLog('Contraseña de administrador actualizada en el servidor', 'Ecuaplac App', 'success');
    } catch (err: any) {
      setPasswordFeedback({
        type: 'error',
        msg: err.message || (panelLang === 'es' ? 'Error de conexión con el servidor' : 'Server connection error'),
      });
    }
  };

  const handleToggleNotifications = async (checked: boolean) => {
    if (!checked) {
      setNotificationsEnabled(false);
      setNotificationFeedback(null);
      addAuditLog('Notificaciones desactivadas en este dispositivo', 'Ecuaplac App', 'info');
      return;
    }

    // Solicitar permiso nativo al dispositivo móvil / navegador (iOS Safari, Android Chrome, etc.)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          setNotificationFeedback('Permiso concedido en este dispositivo');
          setTimeout(() => setNotificationFeedback(null), 3500);
          addAuditLog('Permiso concedido: Notificaciones activas para nuevos presupuestos', 'Ecuaplac App', 'success');

          try {
            new Notification('Ecuaplac · Notificaciones Activas', {
              body: 'Recibirás un aviso en tu móvil cada vez que un cliente solicite un presupuesto.',
              icon: '/ecuaplac/fav-sin-fondo.svg',
            });
          } catch {
            // Manejo silencioso en navegadores móviles que requieran ServiceWorker
          }
        } else if (permission === 'denied') {
          setNotificationsEnabled(false);
          setNotificationFeedback('Permiso bloqueado en ajustes del navegador');
          setTimeout(() => setNotificationFeedback(null), 4000);
          addAuditLog('Permiso de notificaciones denegado en el dispositivo', 'Ecuaplac App', 'warning');
        } else {
          setNotificationsEnabled(false);
        }
      } catch (err) {
        console.warn('Error al solicitar permiso de notificación:', err);
        setNotificationsEnabled(true);
        setNotificationFeedback('Notificaciones activadas');
        setTimeout(() => setNotificationFeedback(null), 3500);
      }
    } else {
      setNotificationsEnabled(true);
      setNotificationFeedback('Notificaciones activadas (simulado)');
      setTimeout(() => setNotificationFeedback(null), 3500);
      addAuditLog('Notificaciones activadas (simulación en navegador sin Web Push)', 'Ecuaplac App', 'info');
    }
  };

  const handleRefreshLogs = async () => {
    setIsRefreshingLogs(true);
    try {
      const liveLogs = await ecuaplacConnector.fetchAuditLogsOnline(50);
      setLogs(liveLogs);
      showSyncToast(
        panelLang === 'es' ? 'Historial sincronizado con el servidor' : 'History synced with server',
        'success'
      );
    } catch {
      showSyncToast(
        panelLang === 'es' ? 'Error al consultar historial del servidor' : 'Error querying server history',
        'error'
      );
    } finally {
      setIsRefreshingLogs(false);
    }
  };

  // Current collection being viewed
  const currentCollection = activeTab === 'obras' ? works : moreProjects;
  const setCurrentCollection = activeTab === 'obras' ? setWorks : setMoreProjects;

  // Filtered items
  const filteredItems = currentCollection.filter((item) => {
    const matchesSearch =
      item.title_es.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location_es && item.location_es.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesVisibility =
      visibilityFilter === 'all'
        ? true
        : visibilityFilter === 'active'
        ? item.active
        : !item.active;

    return matchesSearch && matchesVisibility;
  });

  const activeCount = currentCollection.filter((i) => i.active).length;
  const hiddenCount = currentCollection.filter((i) => !i.active).length;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTitleEs('');
    setFormTitleEn('');
    setFormTitleDe('');
    setFormLocation('Mallorca');
    setFormImageUrl('');
    setUploadStats(null);
    setShowUrlInput(false);
    setFormActive(true);
    setFormFitMode('cover');
    setShowEnglishFields(true);
    setFormTargetGallery(activeTab === 'more_projects' ? 'projects' : 'carousel');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: EcuaplacWorkItem) => {
    setEditingItem(item);
    setFormTitleEs(item.title_es || '');
    setFormTitleEn(item.title_en || '');
    setFormTitleDe((item as any).title_de || '');
    setFormLocation(item.location_es || 'Mallorca');
    setFormImageUrl(item.image_url || '');
    setUploadStats(null);
    setShowUrlInput(false);
    setFormActive(item.active);
    setFormFitMode(item.fit_mode || 'cover');
    setShowEnglishFields(true);
    setFormTargetGallery(item.type === 'more_projects' ? 'projects' : 'carousel');
    setIsModalOpen(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const { dataUrl, sizeKb, mime } = await compressImageUniversal(file, 1400, 0.82);
      setFormImageUrl(dataUrl);
      setUploadStats({ sizeKb, mime });
      addAuditLog(`Fotografía optimizada en WebP (${sizeKb} KB): «${file.name}»`, 'Ecuaplac Web', 'success', 'upload');
    } catch (err) {
      console.warn('Fallo compresión en canvas, usando DataURL directa:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setFormImageUrl(reader.result as string);
        const kbs = Math.round(file.size / 1024);
        setUploadStats({ sizeKb: kbs, mime: file.type });
        addAuditLog(`Fotografía cargada (${kbs} KB): «${file.name}»`, 'Ecuaplac Web', 'info', 'upload');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleToggleActive = async (item: EcuaplacWorkItem) => {
    const newActive = !item.active;
    const isCarousel = activeTab === 'obras';

    // 1. Actualización reactiva inmediata en la interfaz
    if (isCarousel) {
      setWorks((prev) => prev.map((i) => (i.id === item.id ? { ...i, active: newActive } : i)));
    } else {
      setMoreProjects((prev) => prev.map((i) => (i.id === item.id ? { ...i, active: newActive } : i)));
    }

    showSyncToast(
      panelLang === 'es' ? 'Sincronizando con ecuaplac.com...' : 'Syncing with ecuaplac.com...',
      'syncing'
    );

    try {
      if (isCarousel) {
        await ecuaplacConnector.saveWork({ id: item.id, active: newActive });
      } else {
        await ecuaplacConnector.saveProject({ id: item.id, active: newActive });
      }

      showSyncToast(
        newActive
          ? (panelLang === 'es' ? '¡Foto publicada en ecuaplac.com!' : 'Photo published on ecuaplac.com!')
          : (panelLang === 'es' ? 'Foto ocultada de ecuaplac.com' : 'Photo hidden from ecuaplac.com'),
        'success'
      );
      addAuditLog(
        `Foto «${item.title_es}» ${newActive ? 'publicada' : 'ocultada'} en la web`,
        'Ecuaplac Web',
        'info'
      );
    } catch (err) {
      console.error('Error al sincronizar visibilidad con Supabase:', err);
      // Revertir estado local en caso de fallo
      if (isCarousel) {
        setWorks((prev) => prev.map((i) => (i.id === item.id ? { ...i, active: item.active } : i)));
      } else {
        setMoreProjects((prev) => prev.map((i) => (i.id === item.id ? { ...i, active: item.active } : i)));
      }
      showSyncToast(
        panelLang === 'es' ? 'Error al actualizar en la web' : 'Error updating on website',
        'error'
      );
    }
  };

  const handleMoveUp = async (item: EcuaplacWorkItem) => {
    const isCarousel = activeTab === 'obras';
    const list = isCarousel ? [...works] : [...moreProjects];
    const index = list.findIndex((i) => i.id === item.id);
    if (index <= 0) return;

    const prevItem = list[index - 1];
    list[index - 1] = item;
    list[index] = prevItem;

    const reordered = list.map((it, idx) => ({
      ...it,
      sort_order: (idx + 1) * 10,
    }));

    if (isCarousel) {
      setWorks(reordered);
      ecuaplacConnector.saveWorks(reordered);
      ecuaplacConnector.saveWork({ id: item.id, sort_order: reordered[index - 1].sort_order });
      ecuaplacConnector.saveWork({ id: prevItem.id, sort_order: reordered[index].sort_order });
    } else {
      setMoreProjects(reordered);
      ecuaplacConnector.saveMoreProjects(reordered);
      ecuaplacConnector.saveProject({ id: item.id, sort_order: reordered[index - 1].sort_order });
      ecuaplacConnector.saveProject({ id: prevItem.id, sort_order: reordered[index].sort_order });
    }

    addAuditLog(
      `Orden actualizado: «${item.title_es}» movido hacia arriba`,
      'Ecuaplac Web',
      'info'
    );
  };

  const handleMoveDown = async (item: EcuaplacWorkItem) => {
    const isCarousel = activeTab === 'obras';
    const list = isCarousel ? [...works] : [...moreProjects];
    const index = list.findIndex((i) => i.id === item.id);
    if (index === -1 || index >= list.length - 1) return;

    const nextItem = list[index + 1];
    list[index + 1] = item;
    list[index] = nextItem;

    const reordered = list.map((it, idx) => ({
      ...it,
      sort_order: (idx + 1) * 10,
    }));

    if (isCarousel) {
      setWorks(reordered);
      ecuaplacConnector.saveWorks(reordered);
      ecuaplacConnector.saveWork({ id: item.id, sort_order: reordered[index + 1].sort_order });
      ecuaplacConnector.saveWork({ id: nextItem.id, sort_order: reordered[index].sort_order });
    } else {
      setMoreProjects(reordered);
      ecuaplacConnector.saveMoreProjects(reordered);
      ecuaplacConnector.saveProject({ id: item.id, sort_order: reordered[index + 1].sort_order });
      ecuaplacConnector.saveProject({ id: nextItem.id, sort_order: reordered[index].sort_order });
    }

    addAuditLog(
      `Orden actualizado: «${item.title_es}» movido hacia abajo`,
      'Ecuaplac Web',
      'info'
    );
  };

  const handleDelete = (item: EcuaplacWorkItem) => {
    setDeleteConfirmItem(item);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    const item = deleteConfirmItem;
    const isCarousel = activeTab === 'obras';
    setIsDeletingWork(true);

    if (isCarousel) {
      setWorks((prev) => prev.filter((i) => i.id !== item.id));
    } else {
      setMoreProjects((prev) => prev.filter((i) => i.id !== item.id));
    }

    showSyncToast(
      panelLang === 'es' ? 'Eliminando de ecuaplac.com...' : 'Deleting from ecuaplac.com...',
      'syncing'
    );

    try {
      await ecuaplacConnector.deleteItem(isCarousel ? 'works' : 'projects', item.id);
      showSyncToast(
        panelLang === 'es' ? '¡Obra eliminada de ecuaplac.com!' : 'Project deleted from ecuaplac.com!',
        'success'
      );
      addAuditLog(
        `Obra «${item.title_es}» eliminada de la web`,
        'Ecuaplac Web',
        'warning'
      );
    } catch (err) {
      console.warn('Error al eliminar en Supabase:', err);
      // Rollback reactivo si la red falla
      if (isCarousel) {
        setWorks((prev) => [item, ...prev]);
      } else {
        setMoreProjects((prev) => [item, ...prev]);
      }
      showSyncToast(
        panelLang === 'es' ? 'Error al eliminar en la web' : 'Error deleting from website',
        'error'
      );
    } finally {
      setIsDeletingWork(false);
      setDeleteConfirmItem(null);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingWorkRef.current) return;
    if (!formTitleEs.trim()) {
      alert('Indica un título en español para la obra');
      return;
    }

    isSubmittingWorkRef.current = true;
    setIsSavingWork(true);

    try {
      let finalImage =
        formImageUrl.trim() ||
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

      const isCarousel = formTargetGallery === 'carousel';

      // Si la imagen proviene de la cámara/galería (base64 DataURL), subirla a Supabase Storage
      if (finalImage.startsWith('data:')) {
        showSyncToast(
          panelLang === 'es' ? 'Subiendo fotografía a la web...' : 'Uploading photo to website...',
          'syncing'
        );
        try {
          const resBlob = await fetch(finalImage);
          const blob = await resBlob.blob();
          const uploadedUrl = await ecuaplacConnector.uploadPhoto(
            blob,
            isCarousel ? 'carousel' : 'gallery'
          );
          if (uploadedUrl) {
            finalImage = uploadedUrl;
          }
        } catch (err) {
          console.warn('Fallo al subir a Storage, continuando con la imagen:', err);
        }
      }

      // Generación automática inteligente si se deja en blanco
      let finalTitleEn = formTitleEn.trim();
      let finalTitleDe = formTitleDe.trim();
      if (!finalTitleEn) {
        const autoTr = await autoTranslateWork(formTitleEs, formLocation);
        finalTitleEn = autoTr.titleEn;
        if (!finalTitleDe) finalTitleDe = autoTr.titleDe;
      }

      showSyncToast(
        panelLang === 'es' ? 'Publicando en ecuaplac.com...' : 'Publishing to ecuaplac.com...',
        'syncing'
      );

      if (editingItem) {
        const originalType = editingItem.type || (works.some((w) => w.id === editingItem.id) ? 'carousel' : 'more_projects');
        const targetType = isCarousel ? 'carousel' : 'more_projects';
        const switchedGallery = originalType !== targetType;

        const updatedItem: EcuaplacWorkItem = {
          ...editingItem,
          type: targetType,
          title_es: formTitleEs,
          title_en: finalTitleEn,
          location_es: formLocation,
          image_url: finalImage,
          active: formActive,
          fit_mode: formFitMode,
        };

        if (switchedGallery) {
          // Cambiar de galería: eliminar de origen y añadir al destino
          if (originalType === 'carousel') {
            setWorks((prev) => prev.filter((i) => i.id !== editingItem.id));
            setMoreProjects((prev) => [updatedItem, ...prev]);
            await ecuaplacConnector.deleteItem('works', editingItem.id);
            await ecuaplacConnector.saveProject(updatedItem);
          } else {
            setMoreProjects((prev) => prev.filter((i) => i.id !== editingItem.id));
            setWorks((prev) => [updatedItem, ...prev]);
            await ecuaplacConnector.deleteItem('projects', editingItem.id);
            await ecuaplacConnector.saveWork(updatedItem);
          }
        } else if (isCarousel) {
          setWorks((prev) => prev.map((i) => (i.id === editingItem.id ? updatedItem : i)));
          try {
            await ecuaplacConnector.saveWork(updatedItem);
            showSyncToast(
              panelLang === 'es' ? '¡Obra actualizada en ecuaplac.com!' : 'Project updated on ecuaplac.com!',
              'success'
            );
          } catch (e) {
            console.warn('Error al guardar en Supabase:', e);
          }
        } else {
          setMoreProjects((prev) => prev.map((i) => (i.id === editingItem.id ? updatedItem : i)));
          try {
            await ecuaplacConnector.saveProject(updatedItem);
            showSyncToast(
              panelLang === 'es' ? '¡Proyecto actualizado en ecuaplac.com!' : 'Project updated on ecuaplac.com!',
              'success'
            );
          } catch (e) {
            console.warn('Error al guardar en Supabase:', e);
          }
        }

        addAuditLog(`Obra editada: «${formTitleEs}»`, 'Ecuaplac Web', 'success');
      } else {
        const generatedId =
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0');

        const newItem: EcuaplacWorkItem = {
          id: generatedId,
          type: isCarousel ? 'carousel' : 'more_projects',
          title_es: formTitleEs,
          title_en: finalTitleEn,
          location_es: formLocation,
          image_url: finalImage,
          sort_order: 1, // al principio
          active: formActive,
          fit_mode: formFitMode,
        };

        if (isCarousel) {
          setWorks((prev) => [newItem, ...prev]);
          try {
            const saved = await ecuaplacConnector.saveWork(newItem);
            if (saved && saved.id) {
              setWorks((prev) => prev.map((i) => (i.id === newItem.id ? { ...newItem, ...saved } : i)));
            }
            showSyncToast(
              panelLang === 'es' ? '¡Foto publicada en ecuaplac.com!' : 'Photo published on ecuaplac.com!',
              'success'
            );
          } catch (e) {
            console.warn('Error al guardar en Supabase:', e);
            showSyncToast(
              panelLang === 'es' ? 'Error al sincronizar con la web' : 'Error syncing with website',
              'error'
            );
          }
          setActiveTab('obras');
        } else {
          setMoreProjects((prev) => [newItem, ...prev]);
          try {
            const saved = await ecuaplacConnector.saveProject(newItem);
            if (saved && saved.id) {
              setMoreProjects((prev) => prev.map((i) => (i.id === newItem.id ? { ...newItem, ...saved } : i)));
            }
            showSyncToast(
              panelLang === 'es' ? '¡Proyecto publicado en ecuaplac.com!' : 'Project published on ecuaplac.com!',
              'success'
            );
          } catch (e) {
            console.warn('Error al guardar en Supabase:', e);
            showSyncToast(
              panelLang === 'es' ? 'Error al sincronizar con la web' : 'Error syncing with website',
              'error'
            );
          }
          setActiveTab('more_projects');
        }

        addAuditLog(
          `Nueva obra añadida a ${isCarousel ? 'Portada (Carrusel)' : 'Más Reformas'}: «${formTitleEs}»`,
          'Ecuaplac Web',
          'success'
        );
      }

      setIsModalOpen(false);
    } finally {
      isSubmittingWorkRef.current = false;
      setIsSavingWork(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SpaceLogin
        title="Sign In"
        brandBadge="ECUAPLAC REFORMAS"
        buttonLabel="Acceder a Ecuaplac"
        defaultEmail="ecuaplacbyjyg@gmail.com"
        errorMessage={loginError}
        onSubmit={async (data) => {
          setLoginError(null);
          const res = await signInWithEmail(data.email, data.password, data.rememberMe);
          if (!res.success) {
            setLoginError(res.error || (panelLang === 'es' ? 'Error al iniciar sesión' : 'Sign in failed'));
            throw new Error(res.error || 'Login failed');
          } else {
            setActiveTab('inicio');
          }
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-full min-w-0 bg-[#F4F1EA] min-h-screen text-slate-900 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:pb-28">
      {/* Toast Flotante de Sincronización en Tiempo Real (Visible tanto en página como sobre modales con z-[10001]) */}
      {syncToast && (
        <div className="fixed top-[calc(max(16px,env(safe-area-inset-top))+16px)] left-1/2 -translate-x-1/2 z-[10001] max-w-[90vw] px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold font-sans border bg-[#08090C] text-white border-[#C5A059]/60 select-none pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
          {syncToast.type === 'syncing' ? (
            <RefreshCw className="w-3.5 h-3.5 text-[#F0CF85] animate-spin shrink-0" />
          ) : syncToast.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          )}
          <span className="tracking-wide truncate">{syncToast.message}</span>
        </div>
      )}

      {/* 1. Header Oficial de Ecuaplac (Obsidian Black Sólido Puro 100% Nítido - Cero Difuminados) */}
      <header
        className="sticky top-0 z-30 bg-[#08090C] border-b border-white/[0.08] shadow-sm px-4 sm:px-6 lg:px-8 pt-[max(18px,calc(env(safe-area-inset-top)+6px))] pb-3 select-none"
        style={{ WebkitBackdropFilter: 'none', backdropFilter: 'none', isolation: 'isolate' }}
      >
        <div className="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-white p-1 flex items-center justify-center shrink-0 shadow-md border border-white/20 ring-1 ring-white/10 transform-gpu will-change-transform">
              <img
                src="/ecuaplac/fav-sin-fondo.svg"
                alt="Logo Ecuaplac"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/ecuaplac/logo.webp';
                }}
              />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight leading-none block font-display antialiased transform-gpu select-none">
                ecuaplac.com
              </span>
            </div>
          </div>

          {/* Botón Ver Web Directo con icono Window de 21st y micro-animación elegante */}
          <a
            href="https://ecuaplac.com"
            target="_blank"
            rel="noreferrer"
            className="group relative inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 min-h-[38px] sm:min-h-0 rounded-full bg-[#181A20] hover:bg-[#222630] active:scale-95 border border-white/15 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.3)] text-white hover:text-[#F0CF85] transition-all duration-200 text-xs font-bold cursor-pointer select-none"
            title={panelLang === 'es' ? 'Abrir ecuaplac.com en directo' : 'Open ecuaplac.com live'}
          >
            <WindowIcon
              size={18}
              className="text-[#C5A059] group-hover:text-[#F0CF85] group-hover:scale-110 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0"
            />
            <span className="hidden sm:inline font-sans tracking-tight">
              {panelLang === 'es' ? 'Ver Web' : 'View Web'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:bg-emerald-300 animate-pulse shrink-0" />
          </a>
        </div>
      </header>

      {/* Banner Notificación Auto-Actualización (Negro Obsidiana Integrado con Borde Dorado) */}
      {newVersionNotice && !isUpdateBannerDismissed && (
        <div className="max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#08090C] border border-[#C5A059]/50 shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3 min-w-0">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C5A059]"></span>
              </span>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-bold text-white block font-display truncate">
                  ¡Nueva versión v{newVersionNotice} lista!
                </span>
                <span className="text-[11px] text-stone-300 font-sans block mt-0.5 truncate">
                  {panelLang === 'es' ? 'Hay mejoras publicadas en el sistema. Toca para aplicar.' : 'System improvements available. Tap to apply.'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleInstallUpdate}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-[#C5A059] hover:from-amber-300 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                {panelLang === 'es' ? 'Actualizar' : 'Update'}
              </button>
              <button
                type="button"
                onClick={() => setIsUpdateBannerDismissed(true)}
                className="p-1 rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
                title="Cerrar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Workspace Principal */}
      <main className="max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-6">
        {/* 3. Vistas según Pestaña (Transición Cinemática Suave) */}
      {activeTab === 'inicio' ? (
        /* Pestaña 1: Inicio (Dashboard Ejecutivo Premium con Micro-Gradientes, Halos y Números Animados) */
        <div className="space-y-4 sm:space-y-5 animate-tab-enter">
          {/* Header de Bienvenida con Halos & Selector Táctil */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#FAF7F0] to-[#F3ECE0] rounded-3xl p-5 sm:p-6 lg:p-7 border border-[#08090C]/30 shadow-[0_10px_32px_-6px_rgba(20,25,35,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Halo de luz ámbar de fondo */}
            <div className="pointer-events-none absolute -right-10 -top-10 w-48 h-48 bg-[#C5A059]/15 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#08090C]/[0.05] border border-[#08090C]/10 shadow-[0_1px_2px_rgba(0,0,0,0.03)] mb-2.5 backdrop-blur-xs max-w-full">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-800 tracking-tight truncate font-sans">
                  {panelLang === 'es' ? 'Bienvenido a tu panel de Ecuaplac' : 'Welcome to your Ecuaplac portal'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-950 tracking-normal leading-tight font-display flex items-center gap-2 flex-wrap">
                <span>{getGreetingText('José')}</span>
                <span className="animate-wave inline-block select-none transform-gpu" role="img" aria-label="Saludo">👋</span>
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed font-normal font-sans">
                Panel de rendimiento, tráfico web y presupuestos de reformas en Mallorca.
              </p>
            </div>

            {/* Selector de Período 30 Días / 3 Meses (Segmented Control Luxury) */}
            <div className="relative z-10 w-full sm:w-auto p-1 bg-stone-200/80 rounded-2xl sm:rounded-full border border-stone-300/80 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(255,255,255,0.8)] backdrop-blur-md grid grid-cols-2 sm:flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setCfPeriod('30d')}
                className={`relative px-4 py-2 sm:py-1.5 rounded-xl sm:rounded-full text-xs font-bold font-sans tracking-tight transition-all duration-200 cursor-pointer select-none flex items-center justify-center gap-1.5 active:scale-[0.97] ${
                  cfPeriod === '30d'
                    ? 'bg-[#1E293B] hover:bg-slate-700 text-[#F0CF85] shadow-[0_3px_10px_-2px_rgba(30,41,59,0.35)] ring-1 ring-white/15 border border-slate-700/50 font-bold'
                    : 'text-stone-600 hover:text-slate-900 hover:bg-black/[0.03] font-medium'
                }`}
              >
                <Clock className={`w-3.5 h-3.5 transition-colors ${cfPeriod === '30d' ? 'text-[#C5A059]' : 'text-stone-400'}`} />
                <span>30 Días</span>
              </button>

              <button
                type="button"
                onClick={() => setCfPeriod('3m')}
                className={`relative px-4 py-2 sm:py-1.5 rounded-xl sm:rounded-full text-xs font-bold font-sans tracking-tight transition-all duration-200 cursor-pointer select-none flex items-center justify-center gap-1.5 active:scale-[0.97] ${
                  cfPeriod === '3m'
                    ? 'bg-[#1E293B] hover:bg-slate-700 text-[#F0CF85] shadow-[0_3px_10px_-2px_rgba(30,41,59,0.35)] ring-1 ring-white/15 border border-slate-700/50 font-bold'
                    : 'text-stone-600 hover:text-slate-900 hover:bg-black/[0.03] font-medium'
                }`}
              >
                <Clock className={`w-3.5 h-3.5 transition-colors ${cfPeriod === '3m' ? 'text-[#C5A059]' : 'text-stone-400'}`} />
                <span>3 Meses</span>
              </button>
            </div>
          </div>

          {/* Bloque 1: Métricas Maestras (Visitantes y Presupuestos Reales de Ecuaplac) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* KPI 1: Audiencia & Visitantes Reales */}
            <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#F8FBFF] to-[#EFF6FF] rounded-3xl p-5 sm:p-6 border border-[#08090C]/30 shadow-[0_10px_30px_-8px_rgba(14,165,233,0.12)] hover:shadow-[0_16px_36px_-6px_rgba(14,165,233,0.18)] transition-all group flex flex-col justify-between gap-4">
              {/* Resplandor suave */}
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-[0_6px_18px_rgba(14,165,233,0.35)] group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-800 text-[11px] font-semibold shadow-xs">
                    <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
                    <span>{cfMetrics.trendPercentage}</span>
                  </span>
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block font-sans">
                    Visitantes Únicos ({cfMetrics.periodLabel})
                  </span>
                  <span className="text-[10px] font-semibold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-full shrink-0 font-sans">
                    {panelLang === 'es' ? 'Métricas Oficiales' : 'Official Metrics'}
                  </span>
                </div>
                <span className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight block mt-1 font-mono">
                  <AnimatedCounter value={cfMetrics.uniqueVisitors} />
                </span>
                <span className="text-xs text-stone-500 mt-1.5 flex items-center gap-1.5 font-medium">
                  <Activity className="w-3.5 h-3.5 text-sky-500" />
                  <span>
                    <AnimatedCounter value={cfMetrics.pageViews} /> páginas de reformas vistas
                  </span>
                </span>
              </div>

              {/* Visualización de Actividad con Espaciado Generoso */}
              <div className="pt-2.5 border-t border-sky-100/80 space-y-1.5 relative z-10">
                <div className="flex items-end justify-between gap-1.5 h-6 lg:h-7">
                  {[35, 60, 50, 75, 65, 90, 100].map((height, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t-sm transition-all duration-300 ${
                        i === 6 ? 'bg-sky-500 shadow-xs' : 'bg-sky-200/60 hover:bg-sky-300'
                      }`}
                      style={{ height: `${height}%` }}
                      title={`Pico de tráfico día ${i + 1}`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-end text-[10px] text-stone-400 font-mono pt-1">
                  <span>{cfMetrics.updatedAt ? formatLogTime(cfMetrics.updatedAt) : 'Verificado hoy'}</span>
                </div>
              </div>
            </div>

            {/* KPI 2: Solicitudes de Presupuesto (Leads de reformas de Ecuaplac) */}
            <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#F6FCF8] to-[#ECFDF5] rounded-3xl p-5 sm:p-6 border border-[#08090C]/30 shadow-[0_10px_30px_-8px_rgba(16,185,129,0.12)] hover:shadow-[0_16px_36px_-6px_rgba(16,185,129,0.18)] transition-all group flex flex-col justify-between gap-4">
              {/* Resplandor suave */}
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-[0_6px_18px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold shadow-xs">
                  {leads.filter((l) => l.status === 'new').length} pendientes
                </span>
              </div>

              <div className="relative z-10">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block font-sans">
                  Presupuestos Entrantes
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight font-mono">
                    <AnimatedCounter
                      value={leads.length}
                    />
                  </span>
                  <span className="text-xs font-semibold text-stone-500 font-sans">solicitudes</span>
                </div>
                <span className="text-xs text-stone-500 mt-1.5 block font-medium truncate">
                  Último: <span className="font-semibold text-slate-800">{leads[0]?.name || 'Cliente'}</span> ({leads[0]?.date || 'Hoy'})
                </span>
              </div>

              {/* Botón compacto de acceso a Leads */}
              <div className="pt-2.5 border-t border-emerald-100/70 relative z-10 flex items-center justify-between">
                <span className="text-[11px] text-stone-500 font-normal font-sans">
                  Gestión rápida
                </span>
                <button
                  type="button"
                  onClick={() => setIsLeadsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[40px] rounded-full bg-[#1E293B] hover:bg-slate-700 text-white text-xs font-bold shadow-xs border border-slate-700/50 active:scale-95 transition-all group/btn font-sans cursor-pointer"
                  title="Abrir bandeja de presupuestos"
                >
                  <span>Ver Bandeja</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#C5A059] group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Bloque: Facturas (Plegable / Escondidito por defecto con Scroll Suave Inteligente) */}
          <div ref={facturasSectionRef} className="bg-white/95 rounded-3xl border border-[#08090C]/30 shadow-[0_4px_24px_-4px_rgba(20,25,35,0.05)] overflow-hidden transition-all duration-300">
            {/* Cabecera / Trigger de Facturas */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-[#C5A059] flex items-center justify-center border border-[#C5A059]/25 shadow-xs shrink-0">
                  <FileText className="w-5 h-5 text-[#C5A059]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-950 font-display tracking-tight">
                      Facturas
                    </h3>
                    <span className="shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-semibold font-sans">
                      {invoices.length} {invoices.length === 1 ? 'factura' : 'facturas'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 font-normal font-sans mt-0.5 truncate">
                    {isFacturasOpen
                      ? 'Historial y gestión de facturas en PDF'
                      : 'Facturas oficiales y presupuestos archivados'}
                  </p>
                </div>
              </div>

              {/* Botón Abrir / Ocultar Facturas */}
              <button
                type="button"
                onClick={handleToggleFacturas}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[40px] rounded-full bg-[#1E293B] hover:bg-slate-700 text-white text-xs font-bold active:scale-95 transition-all shadow-xs border border-slate-700/50 font-sans group cursor-pointer shrink-0"
                title={isFacturasOpen ? 'Ocultar panel de facturas' : 'Abrir facturas'}
              >
                <span>{isFacturasOpen ? 'Ocultar Facturas' : 'Abrir Facturas'}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#C5A059] transition-transform duration-200 ${
                    isFacturasOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Panel Desplegable hacia abajo (cuando se pulsa "Abrir Facturas") */}
            {isFacturasOpen && (
              <div className="border-t border-stone-100 p-4 sm:p-5 pt-3 space-y-3.5 bg-stone-50/50 animate-in fade-in slide-in-from-top-2 duration-250">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-700 font-sans">
                    Documentos en PDF ({invoices.length})
                  </span>
                  <div>
                    <input
                      type="file"
                      ref={invoiceFileInputRef}
                      accept=".pdf,application/pdf"
                      onChange={handleUploadInvoice}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => invoiceFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-stone-100 text-slate-900 text-xs font-bold active:scale-95 transition-all border border-stone-200 shadow-2xs font-sans cursor-pointer group"
                      title="Subir factura en PDF"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#C5A059] group-hover:-translate-y-0.5 transition-transform" />
                      <span>Subir Factura (PDF)</span>
                    </button>
                  </div>
                </div>

                {/* Listado de Facturas */}
                <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200/80 bg-white shadow-xs overflow-hidden">
                  {invoices.length === 0 ? (
                    <div className="p-6 text-center text-xs text-stone-500 font-sans">
                      No hay facturas archivadas. Pulsa «Subir Factura (PDF)» para añadir una.
                    </div>
                  ) : (
                    invoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-stone-50/80 transition-colors"
                      >
                        {/* Icono PDF y Metadatos */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200/70 flex flex-col items-center justify-center text-rose-600 shrink-0 shadow-2xs">
                            <FileText className="w-4 h-4" />
                            <span className="text-[7.5px] font-black uppercase tracking-tight leading-none mt-0.5">PDF</span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate block font-sans">
                              {inv.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500 font-normal font-sans flex-wrap">
                              <span>{inv.uploadDate}</span>
                              <span className="text-stone-300">•</span>
                              <span className="font-mono text-stone-600 font-semibold">{inv.fileSize}</span>
                              <span className="text-stone-300">•</span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-sans">
                                {inv.status === 'pagada' ? 'Pagada' : 'Oficial'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Acciones: Ver (el ojo) / Descargar / Eliminar */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleViewInvoice(inv)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200/80 text-slate-800 text-xs font-bold transition-all active:scale-95 border border-stone-200/60 font-sans cursor-pointer"
                            title="Ver factura completa"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-700" />
                            <span className="hidden sm:inline">Ver</span>
                          </button>
                          {inv.fileUrl ? (
                            <a
                              href={inv.fileUrl}
                              download={inv.name}
                              className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200/80 text-stone-600 hover:text-slate-900 transition-all active:scale-95 border border-stone-200/60 cursor-pointer"
                              title="Descargar PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleViewInvoice(inv)}
                              className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200/80 text-stone-600 hover:text-slate-900 transition-all active:scale-95 border border-stone-200/60 cursor-pointer"
                              title="Descargar PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteInvoice(inv.id)}
                            className="p-1.5 rounded-full hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-all active:scale-95 cursor-pointer"
                            title="Eliminar factura"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bloque: MyNext Care (Mantenimiento Web Plegable / Limpio y Responsive) */}
          <div ref={careSectionRef} className="bg-white/95 rounded-3xl border border-[#08090C]/30 shadow-[0_4px_24px_-4px_rgba(20,25,35,0.05)] overflow-hidden transition-all duration-300">
            {/* Cabecera / Trigger de MyNext Care */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#08090C]/15 shadow-xs flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                  <img
                    src="/icons/mynext-care-icon.png"
                    alt="MyNext Care"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-950 font-display tracking-tight">
                      MyNext Care
                    </h3>
                    <span className="shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[10px] font-bold font-sans flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{panelLang === 'es' ? 'Activo' : 'Active'}</span>
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 font-normal font-sans mt-0.5 truncate">
                    {panelLang === 'es' ? 'Mantenimiento de web y estado del sistema' : 'Website maintenance and system health'}
                  </p>
                </div>
              </div>

              {/* Botón Abrir / Ocultar MyNext Care */}
              <button
                type="button"
                onClick={handleToggleCare}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[40px] rounded-full bg-[#1E293B] hover:bg-slate-700 text-white text-xs font-bold active:scale-95 transition-all shadow-xs border border-slate-700/50 font-sans group cursor-pointer shrink-0"
                title={isCareOpen ? 'Ocultar detalles de MyNext Care' : 'Ver información de MyNext Care'}
              >
                <span>{isCareOpen ? (panelLang === 'es' ? 'Ocultar' : 'Hide') : (panelLang === 'es' ? 'Ver Detalles' : 'Ver Detalles')}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#C5A059] transition-transform duration-200 ${
                    isCareOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Panel Desplegable de Mantenimiento */}
            {isCareOpen && (
              <div className="border-t border-stone-100 p-4 sm:p-5 pt-3.5 space-y-3 bg-stone-50/50 animate-in fade-in slide-in-from-top-2 duration-250">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Tarjeta A: Lanzamiento de Web */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200/70 flex items-center justify-center text-sky-600 shrink-0 mt-0.5">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block font-sans">
                        {panelLang === 'es' ? 'Lanzamiento de web' : 'Website Launch'}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-slate-900 block mt-0.5 font-display">
                        07/06/2026
                      </span>
                      <span className="text-xs text-stone-500 font-normal font-sans mt-0.5 block">
                        Web oficial en producción · Cloudflare CDN
                      </span>
                    </div>
                  </div>

                  {/* Tarjeta B: Mantenimiento de Web */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#B38E46] shrink-0 mt-0.5">
                      <Wrench className="w-4 h-4 text-[#C5A059]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block font-sans">
                          {panelLang === 'es' ? 'Mantenimiento de web' : 'Web Maintenance'}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          Trabajo
                        </span>
                      </div>
                      <span className="text-sm sm:text-base font-bold text-slate-900 block mt-0.5 font-display">
                        11/11/2026
                      </span>
                      <span className="text-xs text-stone-500 font-normal font-sans mt-0.5 block">
                        Optimización v3.0, Caché Edge & Seguridad PWA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pie de Garantía MyNext */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-stone-500 font-medium px-1 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{panelLang === 'es' ? 'Garantía técnica y soporte continuo por Musa' : 'Technical warranty and continuous support by Musa'}</span>
                  </div>
                  <span className="font-mono text-[10.5px] text-stone-400">
                    MyNext Care Plan
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'obras' || activeTab === 'more_projects' ? (
        <div className="space-y-4 animate-tab-enter">
          {/* Cabecera Compacta y Elegante */}
          <div className="bg-white/95 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#08090C]/30 shadow-[0_4px_20px_-4px_rgba(20,25,35,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-normal text-slate-950 font-display">
                  {activeTab === 'obras' ? (
                    <>
                      <span className="text-[#C5A059]">Galería 1</span>
                      <span className="text-stone-300 mx-2 font-normal">·</span>
                      <span className="text-slate-900">Carrusel de Portada</span>
                    </>
                  ) : (
                    <>
                      <span className="text-indigo-600">Galería 2</span>
                      <span className="text-stone-300 mx-2 font-normal">·</span>
                      <span className="text-slate-900">Más Proyectos</span>
                    </>
                  )}
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 shrink-0 font-sans">
                  {currentCollection.length} {currentCollection.length === 1 ? 'obra' : 'obras'}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {activeTab === 'obras'
                  ? 'Fotografías del carrusel principal en ecuaplac.com'
                  : 'Catálogo de reformas completas en ecuaplac.com'}
              </p>
            </div>

            {/* Mini Botón Forzar Actualización en color llamativo y variado */}
            <button
              type="button"
              onClick={handleForceSync}
              disabled={isForceSyncing}
              className={`self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-full active:scale-95 border text-xs font-black transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed ${
                syncFeedback
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-200'
                  : 'bg-gradient-to-r from-[#C5A059] via-[#D8B467] to-[#E5C882] hover:brightness-105 border-[#B89248] text-slate-950 shadow-xs'
              }`}
              title="Sincronizar y forzar actualización con el backend"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-950 ${isForceSyncing ? 'animate-spin' : ''}`} />
              <span>{isForceSyncing ? 'Sincronizando...' : syncFeedback ? '¡Actualizado en la web!' : 'Forzar Actualización'}</span>
            </button>
          </div>

          {/* Selector de Filtros iOS Style (Limpio y directo, sin buscador innecesario) */}
          <div className="flex items-center justify-between gap-2">
            <div className="bg-stone-200/70 p-1 rounded-full flex items-center gap-1 border border-[#08090C]/35 shadow-inner">
              <button
                type="button"
                onClick={() => setVisibilityFilter('all')}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  visibilityFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-slate-900'
                }`}
              >
                Todas ({currentCollection.length})
              </button>
              <button
                type="button"
                onClick={() => setVisibilityFilter('active')}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  visibilityFilter === 'active'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-slate-900'
                }`}
              >
                Visibles ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setVisibilityFilter('hidden')}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  visibilityFilter === 'hidden'
                    ? 'bg-stone-700 text-white shadow-sm'
                    : 'text-stone-600 hover:text-slate-900'
                }`}
              >
                Ocultas ({hiddenCount})
              </button>
            </div>

            <span className="text-[11px] text-stone-400 font-medium hidden sm:inline">
              Usa las flechas para ordenar la posición en la web
            </span>
          </div>

          {/* Rejilla de Cards (Proporción 4:3) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredItems.map((item, index) => {
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-[0_4px_20px_-4px_rgba(20,25,35,0.05)] hover:shadow-[0_8px_30px_-6px_rgba(20,25,35,0.1)] transition-all flex flex-col justify-between group"
                >
                  {/* Zona Fotográfica con Proporción 4:3 Fija */}
                  <div className="bg-white">
                    <div
                      onClick={() => handleOpenEdit(item)}
                      className="relative aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer group/card border-b border-stone-100"
                      title="Toca para editar esta obra"
                    >
                      <img
                        src={item.image_url}
                        alt={item.title_es}
                        className={`w-full h-full ${
                          item.fit_mode === 'contain' ? 'object-contain bg-black/90' : 'object-cover'
                        } group-hover/card:scale-105 transition-transform duration-300`}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/ecuaplac/portfolio/IMG_2131.webp';
                        }}
                      />

                      {/* Badges superiores: Número de orden (#10, #20...) y Visible/Oculto (Fiel a la app oficial de iPhone) */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-sm text-[#C5A059] font-bold font-mono text-xs border border-white/10 shadow-sm">
                            #{item.sort_order || (index + 1) * 10}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white shadow-xs ${
                              item.active ? 'bg-emerald-600' : 'bg-stone-600'
                            }`}
                          >
                            {item.active ? 'Visible' : 'Oculto'}
                          </span>
                        </div>
                      </div>

                      {/* Badge de Ubicación en la esquina inferior izquierda (Flotante blanco con pin) */}
                      <div className="absolute bottom-3 left-3 pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-slate-900 text-xs font-semibold shadow-xs border border-stone-100/80 font-sans">
                          <span className="text-rose-500 text-xs leading-none">📍</span>
                          <span>{item.location_es || 'Mallorca'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Título limpio de la obra en blanco puro */}
                    <div
                      onClick={() => handleOpenEdit(item)}
                      className="p-4 cursor-pointer"
                    >
                      <h3 className="font-semibold text-sm sm:text-base text-slate-900 line-clamp-2 leading-snug tracking-tight group-hover/card:text-[#C5A059] transition-colors font-display">
                        {item.title_es}
                      </h3>
                    </div>
                  </div>

                  {/* Mini Footer en COLOR NEGRO con Controles Flotantes Ergonómicos */}
                  {(() => {
                    const globalIndex = currentCollection.findIndex((i) => i.id === item.id);
                    const isFirst = globalIndex <= 0;
                    const isLast = globalIndex === -1 || globalIndex >= currentCollection.length - 1;
                    return (
                      <div className="p-3 bg-[#0B111E] border-t border-white/10 flex items-center justify-between text-xs gap-2 select-none">
                        {/* Flechas de ordenación (Subir / Bajar posición en la web) */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(item)}
                            disabled={isFirst}
                            className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:hover:bg-white/10 flex items-center justify-center text-white transition-all active:scale-90 border border-white/10 shadow-2xs cursor-pointer disabled:cursor-not-allowed"
                            title="Subir posición en la web"
                          >
                            <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(item)}
                            disabled={isLast}
                            className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:hover:bg-white/10 flex items-center justify-center text-white transition-all active:scale-90 border border-white/10 shadow-2xs cursor-pointer disabled:cursor-not-allowed"
                            title="Bajar posición en la web"
                          >
                            <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>

                        {/* Acciones principales: Ojo, Editar, Eliminar */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(item)}
                            className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                              item.active
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-white/10 text-stone-400 border border-white/10 hover:text-white hover:bg-white/20'
                            }`}
                            title={item.active ? 'Ocultar de la web' : 'Publicar en la web'}
                          >
                            {item.active ? (
                              <Eye className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-stone-400" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-3 sm:py-1.5 min-h-[36px] rounded-full bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs transition-all shadow-2xs active:scale-95 border border-white/20 cursor-pointer"
                            title="Editar obra y fotografía"
                          >
                            <Pencil className="w-3.5 h-3.5 text-[#F0CF85]" />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all active:scale-95 cursor-pointer"
                            title="Eliminar obra"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Pestaña 4: Ajustes del Gestor (Diseño Pinterest After - Minimalista, iOS-Style y Elegante) */
        <div className="max-w-2xl mx-auto flex flex-col gap-4 pb-32 animate-tab-enter">
          {/* Card 1: Perfil Hero del Administrador */}
          <div className="bg-white/95 rounded-3xl p-5 sm:p-6 border border-[#08090C]/30 shadow-[0_4px_24px_-4px_rgba(20,25,35,0.06)] flex items-center gap-4 sm:gap-5">
            {/* Avatar circular con badge de cámara */}
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="relative group cursor-pointer shrink-0"
              title="Toca para cambiar fotografía"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-[#0B1523] border-2 border-stone-200 group-hover:border-[#C5A059] transition-colors flex items-center justify-center shadow-md relative shrink-0">
                {adminAvatar ? (
                  <img
                    src={adminAvatar}
                    alt="Avatar Administrador"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <span className="text-2xl font-black text-white">JR</span>
                )}
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#C5A059] text-white flex items-center justify-center shadow-sm border-2 border-white"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>

            {/* Datos del Administrador (Limpio y Minimalista) */}
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 truncate font-display tracking-normal">
                {adminName}
              </h3>
              <p className="text-xs text-stone-500 font-mono mt-0.5 truncate">
                ecuaplacbyjyg@gmail.com
              </p>
            </div>
          </div>

          {/* Grupo 1: Cuenta (iOS Style Grouped List con Jerarquía Equilibrada) */}
          <div className="space-y-2">
            <div className="px-3.5 pt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
              <h4 className="text-[11px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider font-sans">
                {panelLang === 'es' ? 'Cuenta' : 'Account'}
              </h4>
            </div>
            <div className="bg-white/95 rounded-3xl border border-[#08090C]/30 shadow-[0_4px_20px_-4px_rgba(20,25,35,0.04)] overflow-hidden divide-y divide-stone-100">
              {/* Item 1: Gestionar Perfil */}
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-stone-50/80 transition-colors active:bg-stone-100/70 select-none cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900 block font-sans tracking-tight">
                      {panelLang === 'es' ? 'Gestionar Perfil' : 'Manage Profile'}
                    </span>
                    <span className="text-[11.5px] text-stone-500 font-normal block mt-0.5 leading-snug font-sans">
                      {panelLang === 'es' ? 'Nombre visible y foto de avatar' : 'Visible name and avatar photo'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* Item 2: Seguridad y Clave */}
              <button
                type="button"
                onClick={() => setIsSecurityModalOpen(true)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-stone-50/80 transition-colors active:bg-stone-100/70 select-none cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-[#B38E46] shadow-xs shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900 block font-sans tracking-tight">
                      {panelLang === 'es' ? 'Seguridad y Clave' : 'Security & Password'}
                    </span>
                    <span className="text-[11.5px] text-stone-500 font-normal block mt-0.5 leading-snug font-sans">
                      {panelLang === 'es' ? 'Actualizar contraseña de acceso' : 'Update access password'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* Item 3: Notificaciones (Con solicitud nativa de permisos en móvil y PC) */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900 block font-sans tracking-tight">
                      {panelLang === 'es' ? 'Notificaciones' : 'Notifications'}
                    </span>
                    <span className="text-[11.5px] text-stone-500 font-normal block mt-0.5 leading-snug font-sans">
                      {notificationFeedback || (panelLang === 'es' ? 'Avisos de nuevos presupuestos' : 'New quote request alerts')}
                    </span>
                  </div>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onChange={handleToggleNotifications}
                />
              </div>

              {/* Item 4: Idioma del Panel (Selector Bilingüe ES / EN Interactivo) */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shadow-xs shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900 block font-sans tracking-tight">
                      {panelLang === 'es' ? 'Idioma del Panel' : 'Panel Language'}
                    </span>
                    <span className="text-[11.5px] text-stone-500 font-normal block mt-0.5 leading-snug font-sans">
                      {panelLang === 'es' ? 'Español (Mallorca)' : 'English (International)'}
                    </span>
                  </div>
                </div>
                <div className="inline-flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200/80 shadow-inner">
                  <button
                    type="button"
                    onClick={() => handleToggleLang('es')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      panelLang === 'es'
                        ? 'bg-white text-slate-900 shadow-xs border border-stone-200/60 font-black scale-102'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    ES
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleLang('en')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      panelLang === 'en'
                        ? 'bg-white text-slate-900 shadow-xs border border-stone-200/60 font-black scale-102'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Grupo 2: Contacto de la Web (Conexión directa en vivo con ecuaplac.com / Supabase) */}
          <div className="space-y-2 mt-4">
            <div className="px-3.5 pt-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                <h4 className="text-[11px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider font-sans">
                  {panelLang === 'es' ? 'Contacto de la Web' : 'Website Contact'}
                </h4>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>ecuaplac.com</span>
              </span>
            </div>

            {/* Tarjeta con Borde Negro Fuerte (#08090C) estilo NexTool Luxury */}
            <div className="bg-white rounded-3xl border-2 border-[#08090C] shadow-[0_4px_24px_-4px_rgba(20,25,35,0.08)] overflow-hidden">
              {/* Cabecera de la tarjeta */}
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-stone-100 bg-[#FAF7F0]/60">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#08090C] text-[#F0CF85] flex items-center justify-center border border-[#C5A059]/40 shadow-xs shrink-0">
                    <Globe className="w-5 h-5 text-[#F0CF85]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-950 font-display tracking-tight truncate">
                      {panelLang === 'es' ? 'Contacto: Contacto de la Web' : 'Website Contact Info'}
                    </h3>
                    <p className="text-[11.5px] text-stone-500 font-normal font-sans mt-0.5 truncate">
                      {panelLang === 'es'
                        ? 'Números de teléfono y correo visibles en la web oficial'
                        : 'Phone numbers and email visible on the public website'}
                    </p>
                  </div>
                </div>

                {/* Botón Editar / Cancelar */}
                <button
                  type="button"
                  onClick={() => setIsEditingContacts(!isEditingContacts)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs shrink-0 ${
                    isEditingContacts
                      ? 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                      : 'bg-[#08090C] hover:bg-stone-800 text-white border border-[#C5A059]/50'
                  }`}
                  title={isEditingContacts ? 'Cancelar edición' : 'Editar contactos de la web'}
                >
                  {isEditingContacts ? (
                    <>
                      <X className="w-3.5 h-3.5 text-stone-600" />
                      <span>{panelLang === 'es' ? 'Cancelar' : 'Cancel'}</span>
                    </>
                  ) : (
                    <>
                      <Pencil className="w-3.5 h-3.5 text-[#F0CF85]" />
                      <span>{panelLang === 'es' ? 'Editar' : 'Edit'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Vista o Formulario de Edición */}
              {isEditingContacts ? (
                /* MODO EDICIÓN */
                <form onSubmit={handleSaveContacts} className="p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* José Rivadeneira */}
                    <div className="space-y-1.5 bg-stone-50/60 p-3.5 rounded-2xl border border-stone-200/80">
                      <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block font-sans">
                        José Rivadeneira (Teléfono)
                      </label>
                      <input
                        type="tel"
                        value={contactForm.josePhone}
                        onChange={(e) => setContactForm({ ...contactForm, josePhone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#08090C]/30 focus:border-[#08090C] text-xs font-mono font-bold text-slate-900 focus:outline-none transition-all"
                        placeholder="+34 678 15 98 78"
                      />
                    </div>

                    {/* Joffre Méndez */}
                    <div className="space-y-1.5 bg-stone-50/60 p-3.5 rounded-2xl border border-stone-200/80">
                      <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block font-sans">
                        Joffre Méndez (Teléfono)
                      </label>
                      <input
                        type="tel"
                        value={contactForm.joffrePhone}
                        onChange={(e) => setContactForm({ ...contactForm, joffrePhone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#08090C]/30 focus:border-[#08090C] text-xs font-mono font-bold text-slate-900 focus:outline-none transition-all"
                        placeholder="+34 603 40 44 50"
                      />
                    </div>
                  </div>

                  {/* Fila Email */}
                  <div className="space-y-1.5 bg-stone-50/60 p-3.5 rounded-2xl border border-stone-200/80">
                    <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block font-sans">
                      Email
                    </label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#08090C]/30 focus:border-[#08090C] text-xs font-mono font-semibold text-slate-900 focus:outline-none transition-all"
                      placeholder="ecuaplac.jyg.sl@gmail.com"
                    />
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setIsEditingContacts(false)}
                      disabled={isSavingContacts}
                      className="px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {panelLang === 'es' ? 'Descartar' : 'Discard'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingContacts}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#08090C] hover:bg-stone-800 text-white border border-[#C5A059]/50 text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-60 shadow-sm"
                    >
                      {isSavingContacts ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 text-[#F0CF85] animate-spin" />
                          <span>{panelLang === 'es' ? 'Guardando en la Web...' : 'Saving...'}</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 text-[#F0CF85]" />
                          <span>{panelLang === 'es' ? 'Guardar en la Web' : 'Save to Website'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* MODO VISTA (LIMPIO, MINIMALISTA Y EXACTO AL RECUADRO DE ECUAPLAC.COM) */
                <div className="divide-y divide-stone-100">
                  {/* Fila José Rivadeneira */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-stone-50/50 transition-colors">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-[#FAF6EE] border border-stone-200/70 flex items-center justify-center text-[#B38E46] shrink-0">
                        <Phone className="w-4 h-4 text-[#B38E46]" />
                      </div>
                      <span className="text-sm sm:text-base font-bold text-slate-900 font-sans tracking-tight truncate">
                        {contactForm.joseName}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 shrink-0">
                      {contactForm.josePhone}
                    </span>
                  </div>

                  {/* Fila Joffre Méndez */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-stone-50/50 transition-colors">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-[#FAF6EE] border border-stone-200/70 flex items-center justify-center text-[#B38E46] shrink-0">
                        <Phone className="w-4 h-4 text-[#B38E46]" />
                      </div>
                      <span className="text-sm sm:text-base font-bold text-slate-900 font-sans tracking-tight truncate">
                        {contactForm.joffreName}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 shrink-0">
                      {contactForm.joffrePhone}
                    </span>
                  </div>

                  {/* Fila Email */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-stone-50/50 transition-colors">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-[#FAF6EE] border border-stone-200/70 flex items-center justify-center text-[#B38E46] shrink-0">
                        <Mail className="w-4 h-4 text-[#B38E46]" />
                      </div>
                      <span className="text-sm sm:text-base font-bold text-slate-900 font-sans tracking-tight">
                        Email
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium font-sans text-slate-800 truncate text-right">
                      {contactForm.email}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grupo 3: Sistema y Dispositivo (Jerarquía y Título con Autoridad) */}
          <div className="space-y-2 mt-3">
            <div className="px-3.5 pt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
              <h4 className="text-[11px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider font-sans">
                {panelLang === 'es' ? 'Sistema & Dispositivo' : 'System & Device'}
              </h4>
            </div>
            <div className="bg-white/95 rounded-3xl border border-[#08090C]/30 shadow-[0_4px_20px_-4px_rgba(20,25,35,0.04)] overflow-hidden divide-y divide-stone-100">
              {/* Item 1: Enviar Feedback o Reportar Problema a Musa */}
              <button
                type="button"
                onClick={() => setIsFeedbackModalOpen(true)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-stone-50/80 transition-colors active:bg-stone-100/70 select-none cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/80 border border-amber-200/90 flex items-center justify-center text-amber-800 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <MessageSquarePlus className="w-5 h-5 text-[#C5A059]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-slate-900 block font-sans tracking-tight group-hover:text-[#C5A059] transition-colors">
                      {panelLang === 'es' ? 'Enviar Feedback o Problema' : 'Send Feedback or Issue'}
                    </span>
                    <span className="text-[11.5px] text-stone-500 font-normal truncate block font-sans mt-0.5">
                      {panelLang === 'es'
                        ? 'Avisa a Musa si algo no funciona o propon mejoras'
                        : 'Notify Musa if something fails or suggest new features'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-[#B38E46] bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
                    <span>{panelLang === 'es' ? 'Soporte Musa' : 'Musa Support'}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>

              {/* Item 2: Actualizaciones (Desplegable y Gestión de Versión) */}
              <div className="transition-colors">
                <button
                  type="button"
                  onClick={() => setIsUpdatesExpanded(!isUpdatesExpanded)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-stone-50/80 transition-colors active:bg-stone-100/70 select-none cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shadow-xs shrink-0">
                      <Sparkles className="w-5 h-5 text-[#C5A059]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 block font-sans tracking-tight">
                          {panelLang === 'es' ? 'Actualizaciones' : 'Updates'}
                        </span>
                        {updateCheckState === 'available' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 font-sans">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                            <span>{panelLang === 'es' ? `Nueva v${newVersionNotice || CURRENT_SYSTEM_VERSION}` : `New v${newVersionNotice || CURRENT_SYSTEM_VERSION}`}</span>
                          </span>
                        ) : updateCheckState === 'up-to-date' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-sans">
                            <span>{panelLang === 'es' ? 'Al día' : 'Up to date'}</span>
                          </span>
                        ) : null}
                      </div>
                      <span className="text-[11.5px] text-stone-500 font-normal block mt-0.5 leading-snug font-sans">
                        {panelLang === 'es'
                          ? `Versión ${installedVersion} · Sistema Next Tools`
                          : `Version ${installedVersion} · Next Tools System`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-stone-400">
                      v{installedVersion}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${
                        isUpdatesExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Contenido Desplegable de Actualizaciones */}
                {isUpdatesExpanded && (
                  <div className="px-4 pb-4 pt-1 bg-stone-50/70 border-t border-stone-100 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    {/* Switch: Buscar automáticamente */}
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          {panelLang === 'es' ? 'Buscar actualizaciones automáticamente' : 'Check for updates automatically'}
                        </span>
                        <span className="text-[11px] text-stone-500 font-medium">
                          {panelLang === 'es' ? 'Comprueba mejoras lanzadas en tiempo real' : 'Checks for live improvements in real time'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAutoCheckUpdates(!autoCheckUpdates)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer shrink-0 ${
                          autoCheckUpdates ? 'bg-[#0B111E]' : 'bg-stone-300'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                            autoCheckUpdates ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Estado: Idle */}
                    {updateCheckState === 'idle' && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={handleCheckUpdates}
                          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs hover:bg-slate-800 active:scale-98 transition-all cursor-pointer font-sans"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>{panelLang === 'es' ? 'Buscar actualizaciones' : 'Check for updates'}</span>
                        </button>
                      </div>
                    )}

                    {/* Estado: Comprobando */}
                    {updateCheckState === 'checking' && (
                      <div className="p-3.5 rounded-xl bg-white border border-stone-200 flex items-center gap-3">
                        <Loader2 className="w-4 h-4 text-[#C5A059] animate-spin shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-800 block">
                            {panelLang === 'es' ? 'Comprobando compilación...' : 'Checking build...'}
                          </span>
                          <span className="text-[11px] text-stone-500 font-medium">
                            {panelLang === 'es' ? 'Conectando con Next Tools Core' : 'Connecting to Next Tools Core'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Estado: Al día */}
                    {updateCheckState === 'up-to-date' && (
                      <div className="space-y-2.5 pt-1">
                        <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="text-left">
                            <span className="text-xs font-bold text-emerald-950 block">
                              Ya está instalada la última versión (v{installedVersion})
                            </span>
                            <span className="text-[11px] text-emerald-800/90 font-medium mt-0.5 block leading-relaxed">
                              Tu gestor de Ecuaplac cuenta con las últimas correcciones y optimizaciones activas.
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={handleCheckUpdates}
                            className="text-xs font-bold text-stone-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-white transition-all active:scale-95"
                          >
                            Comprobar de nuevo
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSimulatedUpdateAvailable(true);
                              setUpdateCheckState('available');
                            }}
                            className="text-[11px] font-semibold text-[#C5A059] hover:underline"
                            title="Simula que hay una nueva actualización lista para instalar"
                          >
                            {panelLang === 'es' ? 'Simular nueva v002' : 'Simulate new v002'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Estado: Nueva versión disponible */}
                    {updateCheckState === 'available' && (
                      <div className="space-y-3 pt-1">
                        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0B111E] to-[#162E4D] border border-[#C5A059]/40 text-white shadow-sm space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#C5A059]/20 text-[#F6E27A] text-[10px] font-bold border border-[#C5A059]/40">
                              <Sparkles className="w-3 h-3" />
                              {panelLang === 'es'
                                ? `Nueva Versión Lista · v${newVersionNotice || CURRENT_SYSTEM_VERSION}`
                                : `New Version Ready · v${newVersionNotice || CURRENT_SYSTEM_VERSION}`}
                            </span>
                            <span className="text-[10px] text-stone-300 font-mono">1.8 MB</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              Actualización del Gestor Ecuaplac
                            </span>
                            <ul className="text-[11px] text-stone-300 font-medium space-y-1 mt-1.5 list-disc list-inside">
                              <li>Carrusel de obras optimizado para pantallas retina</li>
                              <li>Compresión automática WebP en subida de fotos</li>
                              <li>Notificaciones instantáneas para nuevos presupuestos</li>
                            </ul>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleInstallUpdate}
                          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#DFBA6F] text-slate-950 font-black text-xs shadow-md hover:brightness-105 active:scale-98 transition-all cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-slate-950" />
                          <span>Instalar ahora y reiniciar</span>
                        </button>
                      </div>
                    )}

                    {/* Estado: Instalando */}
                    {updateCheckState === 'installing' && (
                      <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 text-[#C5A059] animate-spin" />
                            {panelLang === 'es'
                              ? `Instalando actualización v${newVersionNotice || CURRENT_SYSTEM_VERSION}...`
                              : `Installing update v${newVersionNotice || CURRENT_SYSTEM_VERSION}...`}
                          </span>
                          <span className="font-mono text-[#C5A059]">100%</span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#C5A059] to-[#0B111E] rounded-full animate-pulse w-full" />
                        </div>
                        <span className="text-[11px] text-stone-500 font-medium block">
                          {panelLang === 'es' ? 'Aplicando paquetes y preparando recarga limpia...' : 'Applying bundles and preparing clean reload...'}
                        </span>
                      </div>
                    )}

                    {/* Estado: Instalada */}
                    {updateCheckState === 'installed' && (
                      <div className="p-3.5 rounded-2xl bg-emerald-600 text-white flex items-center gap-3 shadow-md animate-in zoom-in-95 duration-200">
                        <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                        <div>
                          <span className="text-xs font-black block">
                            {panelLang === 'es'
                              ? `¡Versión v${installedVersion} instalada con éxito!`
                              : `Version v${installedVersion} installed successfully!`}
                          </span>
                          <span className="text-[11px] text-emerald-100 font-medium block">
                            {panelLang === 'es' ? 'Reiniciando la aplicación en unos segundos...' : 'Restarting app in a few seconds...'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Item 3: Últimos Movimientos */}
              <button
                type="button"
                onClick={() => {
                  setIsLogsModalOpen(true);
                  handleRefreshLogs();
                }}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-stone-50/80 transition-colors active:bg-stone-100/70 select-none cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 shadow-xs shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900 block font-sans tracking-tight">
                      {panelLang === 'es' ? 'Últimos Movimientos' : 'Recent Activity'}
                    </span>
                    <span className="text-[11.5px] text-stone-500 font-normal block mt-0.5 leading-snug font-sans">
                      {panelLang === 'es'
                        ? 'Historial de fotografías y cambios en la web'
                        : 'History of photos and website changes'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-mono text-[11px] font-semibold">
                    {logs.length}
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              </button>

              {/* Item 4: Cerrar Sesión */}
              <button
                type="button"
                onClick={async () => {
                  setActiveTab('inicio');
                  await signOut();
                  showSyncToast(
                    panelLang === 'es' ? 'Sesión cerrada correctamente' : 'Signed out successfully',
                    'success'
                  );
                  addAuditLog('Cierre de sesión manual', 'Ecuaplac App', 'info');
                }}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-rose-50/50 transition-colors active:bg-rose-50 select-none group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-xs shrink-0">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-rose-600 block group-hover:text-rose-700 font-sans tracking-tight">
                      {panelLang === 'es' ? 'Cerrar Sesión' : 'Sign Out'}
                    </span>
                    <span className="text-[11.5px] text-rose-400 font-normal block mt-0.5 leading-snug font-sans">
                      {panelLang === 'es' ? 'Salir del panel de control' : 'Exit the control panel'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-300 group-hover:text-rose-400" />
              </button>
            </div>
          </div>

          {/* Pie de Marca NexTool & Versión Oficial */}
          <div className="pt-6 pb-2 flex flex-col items-center justify-center text-center select-none">
            {/* Logotipo Oficial NexTool 100% Sin Fondo */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer">
              <img
                src="/icons/nextool-sinfondo.png"
                alt="NexTool"
                className="w-full h-full object-contain filter drop-shadow-[0_6px_16px_rgba(235,94,85,0.20)]"
                loading="lazy"
              />
            </div>

            <span className="text-xs sm:text-[13px] font-bold tracking-[0.22em] text-[#0F172A] uppercase font-display">
              NEXT TOOLS
            </span>

            <span className="text-[11px] font-mono font-medium text-stone-400 mt-0.5 tracking-wider">
              Versión {installedVersion}
            </span>
          </div>
        </div>
      )}
      </main>

      {/* 4. Modal de Añadir / Editar Obra (Blindado contra scroll de fondo y teclado móvil) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="2xl"
        title={
          editingItem
            ? `Editar ${editingItem.type === 'carousel' ? 'Obra de Portada' : 'Proyecto de Galería'}`
            : formTargetGallery === 'carousel'
            ? 'Nueva Obra para Portada Web'
            : 'Nuevo Proyecto para Más Reformas'
        }
        subtitle={
          editingItem
            ? 'Los cambios se guardarán y actualizarán de inmediato en ecuaplac.com'
            : formTargetGallery === 'carousel'
            ? 'Aparecerá en el carrusel principal de la página oficial'
            : 'Aparecerá en el catálogo de «Ver más reformas» en la web'
        }
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              type="button"
              disabled={isSavingWork}
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              form="ecuaplac-work-form"
              disabled={isSavingWork || isCompressing}
              icon={
                isSavingWork ? (
                  <Loader2 className="w-4 h-4 text-slate-950 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-slate-950" />
                )
              }
            >
              {isSavingWork
                ? (panelLang === 'es' ? 'Guardando y publicando...' : 'Publishing...')
                : editingItem
                ? (panelLang === 'es' ? 'Actualizar Web' : 'Update Website')
                : (panelLang === 'es' ? 'Guardar y Publicar en Web' : 'Save & Publish to Web')}
            </Button>
          </>
        }
      >
        <form
          id="ecuaplac-work-form"
          onSubmit={handleSaveForm}
          className={`space-y-4 text-xs transition-opacity ${
            isSavingWork ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          {/* Selector de Destino de la Fotografía (Portada vs Más Reformas) */}
          <div className="space-y-1.5 pb-0.5">
            <label className="font-semibold text-xs text-slate-700 block font-sans tracking-tight">
              ¿Dónde quieres colocar esta foto? *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormTargetGallery('carousel')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 active:scale-[0.98] ${
                  formTargetGallery === 'carousel'
                    ? 'bg-amber-500/10 border-[#C5A059] ring-2 ring-[#C5A059]/40 shadow-xs'
                    : 'bg-white border-stone-200/90 hover:bg-stone-50 text-stone-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Star className={`w-4 h-4 ${formTargetGallery === 'carousel' ? 'text-[#B38E46]' : 'text-stone-400'}`} />
                  <span className={`text-xs font-semibold ${formTargetGallery === 'carousel' ? 'text-slate-900 font-bold' : 'text-stone-700'}`}>
                    Portada (Galería 1)
                  </span>
                </div>
                <span className="text-[10px] text-stone-500 leading-tight">
                  Carrusel de portada de ecuaplac.com
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFormTargetGallery('projects')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 active:scale-[0.98] ${
                  formTargetGallery === 'projects'
                    ? 'bg-amber-500/10 border-[#C5A059] ring-2 ring-[#C5A059]/40 shadow-xs'
                    : 'bg-white border-stone-200/90 hover:bg-stone-50 text-stone-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className={`w-4 h-4 ${formTargetGallery === 'projects' ? 'text-[#B38E46]' : 'text-stone-400'}`} />
                  <span className={`text-xs font-semibold ${formTargetGallery === 'projects' ? 'text-slate-900 font-bold' : 'text-stone-700'}`}>
                    Más Reformas (Galería 2)
                  </span>
                </div>
                <span className="text-[10px] text-stone-500 leading-tight">
                  Catálogo secundario de reformas
                </span>
              </button>
            </div>
          </div>

          {/* Zona de Encuadre 4:3 con Previsualización (De la App Original) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-xs text-slate-700 font-sans tracking-tight">Previsualización de Encuadre (4:3)</label>
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-full border border-stone-200">
                <button
                  type="button"
                  onClick={() => setFormFitMode('cover')}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                    formFitMode === 'cover' ? 'bg-[#C5A059] text-slate-950 font-bold shadow-xs' : 'text-stone-600'
                  }`}
                >
                  Llenar
                </button>
                <button
                  type="button"
                  onClick={() => setFormFitMode('contain')}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                    formFitMode === 'contain' ? 'bg-[#C5A059] text-slate-950 font-bold shadow-xs' : 'text-stone-600'
                  }`}
                >
                  Completa
                </button>
              </div>
            </div>

            {/* Input oculto para abrir selector nativo de fotos o cámara */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Zona Táctil de Subida / Encuadre 4:3 */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border-2 border-dashed border-[#C5A059]/50 hover:border-[#C5A059] cursor-pointer flex items-center justify-center group/dropzone transition-all shadow-inner"
            >
              {isCompressing ? (
                <div className="text-center p-6 flex flex-col items-center">
                  <div className="w-10 h-10 border-3 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-3" />
                  <span className="text-sm font-bold text-white">Optimizando a WebP...</span>
                  <span className="text-[11px] text-stone-400 mt-0.5">Comprimiendo sin pérdida para carga rápida</span>
                </div>
              ) : formImageUrl ? (
                <div className="w-full h-full relative">
                  <img
                    src={formImageUrl}
                    alt="Vista previa"
                    className={`w-full h-full ${
                      formFitMode === 'cover' ? 'object-cover' : 'object-contain'
                    }`}
                  />
                  {/* Overlay táctil al pasar el ratón o en móvil */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/dropzone:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="px-3.5 py-1.5 rounded-full bg-white text-slate-950 font-extrabold text-xs shadow-lg flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#B38E46]" />
                      <span>Toca para Cambiar Fotografía</span>
                    </span>
                  </div>

                  {/* Badge de optimización WebP */}
                  <div className="absolute bottom-2.5 right-2.5 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-sm text-[#C5A059] text-[10px] font-bold border border-amber-400/30">
                      {uploadStats ? `WebP · ${uploadStats.sizeKb} KB` : '4:3 Ajustado'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] mb-3 group-hover/dropzone:scale-110 transition-transform shadow-md">
                    <Camera className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-semibold text-white block font-sans">
                    Toca aquí para seleccionar o tomar foto
                  </span>
                  <span className="text-[11px] text-stone-300 mt-1 block font-sans">
                    Abre la cámara o galería de tu teléfono móvil
                  </span>
                  <div className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-[#C5A059] text-slate-950 font-bold text-xs shadow-md">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir desde Móvil / PC</span>
                  </div>
                </div>
              )}
            </div>

            {/* Controles rápidos bajo el encuadre */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1.5 py-1 font-sans"
              >
                <Camera className="w-3.5 h-3.5 text-[#B38E46]" />
                <span>{formImageUrl ? 'Cambiar fotografía' : 'Abrir selector de fotos'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] text-stone-500 hover:text-stone-700 flex items-center gap-1 underline font-sans"
              >
                <LinkIcon className="w-3 h-3" />
                <span>{showUrlInput ? 'Ocultar URL' : 'O pegar URL externa'}</span>
              </button>
            </div>

            {/* Input de URL opcional */}
            {showUrlInput && (
              <div className="pt-1 animate-in fade-in duration-150">
                <label className="font-semibold text-stone-700 block mb-1 font-sans text-xs">
                  Enlace / URL directa de la imagen
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formImageUrl}
                  onChange={(e) => {
                    setFormImageUrl(e.target.value);
                    setUploadStats(null);
                  }}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-[16px] sm:text-xs focus:ring-2 focus:ring-[#C5A059]/40 font-sans"
                />
              </div>
            )}
          </div>

          <div>
            <label className="font-semibold text-xs text-slate-700 block mb-1 font-sans tracking-tight">
              Título de la Obra / Proyecto *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Reforma Integral de Baño con Bañera Exenta"
              value={formTitleEs}
              onChange={(e) => setFormTitleEs(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-[16px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 bg-stone-50/50 font-sans"
            />
          </div>

          <div>
            <label className="font-semibold text-xs text-slate-700 block mb-1 font-sans tracking-tight">
              Ubicación (Mallorca)
            </label>
            <input
              type="text"
              placeholder="Ej. Andratx, Palma, Calvià, Sóller..."
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-[16px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 bg-stone-50/50 font-sans"
            />
            {/* Chips rápidos de municipios de Mallorca */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {['Mallorca', 'Andratx', 'Palma', 'Calvià', 'Sóller', 'Santanyí'].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setFormLocation(city)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all font-sans ${
                    formLocation === city
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Versión Multilingüe Inteligente (Inglés y Alemán) */}
          <div className="bg-stone-50 rounded-2xl border border-stone-200/80 p-3 sm:p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#B38E46]" />
                <span className="text-xs font-semibold text-slate-800 font-sans tracking-tight">
                  Versión Multilingüe (Web Internacional)
                </span>
              </div>
              <button
                type="button"
                onClick={handleAutoTranslate}
                disabled={isTranslating}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-[#C5A059] text-slate-950 font-bold text-[11px] shadow-xs hover:brightness-105 active:scale-95 transition-all disabled:opacity-50 font-sans"
                title="Autotraduce automáticamente a inglés y alemán"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Traduciendo...</span>
                  </>
                ) : translatedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                    <span>¡Traducido!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>Autotraducir</span>
                  </>
                )}
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">
                Title (English)
              </label>
              <input
                type="text"
                placeholder="Se genera automático si se deja en blanco"
                value={formTitleEn}
                onChange={(e) => setFormTitleEn(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3.5 py-2 text-[16px] sm:text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">
                Titel (Deutsch - Web Alemán)
              </label>
              <input
                type="text"
                placeholder="Wird automatisch generiert..."
                value={formTitleDe}
                onChange={(e) => setFormTitleDe(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3.5 py-2 text-[16px] sm:text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40"
              />
            </div>
          </div>

          {/* Visibilidad en la Web */}
          <div className="pt-1">
            <Switch
              checked={formActive}
              onChange={setFormActive}
              label="Visible en la Web"
              description="Si se desmarca, se guardará en el panel pero no saldrá a los visitantes."
            />
          </div>
        </form>
      </Modal>

      {/* 5. Modal Dedicado de Bandeja de Presupuestos (CRM Leads de ecuaplac.com — Estilo Executive Luxury) */}
      <Modal
        isOpen={isLeadsModalOpen}
        onClose={() => setIsLeadsModalOpen(false)}
        theme="light"
        maxWidth="3xl"
        title={panelLang === 'es' ? 'Bandeja de Presupuestos' : 'Inquiries & Quotes Inbox'}
        subtitle={
          panelLang === 'es'
            ? 'Solicitudes desde ecuaplac.com'
            : 'Leads from ecuaplac.com'
        }
        headerExtra={
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {panelLang === 'es' ? 'Web Oficial Live' : 'Official Web Live'}
            </span>
            <button
              type="button"
              onClick={handleRefreshLeads}
              disabled={isSyncingLeads}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#08090C] hover:bg-stone-800 text-white border border-[#C5A059]/40 text-xs font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-60 shadow-xs"
              title={panelLang === 'es' ? 'Sincronizar con Supabase' : 'Sync with Supabase'}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#F0CF85] ${isSyncingLeads ? 'animate-spin' : ''}`} />
              <span className="inline">
                {isSyncingLeads
                  ? (panelLang === 'es' ? 'Sincronizando...' : 'Syncing...')
                  : (panelLang === 'es' ? 'Sincronizar' : 'Sync')}
              </span>
            </button>
          </div>
        }
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {leads.length === 0 && (
                <button
                  type="button"
                  onClick={handleRestoreDefaultLeads}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 border border-stone-200 text-xs font-bold transition-all active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{panelLang === 'es' ? 'Restaurar Ejemplos' : 'Restore Demo Leads'}</span>
                </button>
              )}
              {copiedField && (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>{copiedField} copiado</span>
                </span>
              )}
            </div>
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setIsLeadsModalOpen(false)}
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200"
            >
              {panelLang === 'es' ? 'Cerrar' : 'Close'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Barra de Búsqueda Ejecutiva */}
          <div className="relative">
            <div className="flex items-center bg-stone-50 border border-stone-200/90 focus-within:bg-white focus-within:border-[#C5A059] focus-within:ring-2 focus-within:ring-[#C5A059]/15 rounded-2xl px-3.5 py-2.5 transition-all shadow-2xs">
              <Search className="w-4 h-4 text-stone-400 shrink-0 mr-2.5" />
              <input
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoCapitalize="none"
                autoCorrect="off"
                value={leadSearchQuery}
                onChange={(e) => setLeadSearchQuery(e.target.value)}
                placeholder={
                  panelLang === 'es'
                    ? 'Buscar por cliente, teléfono, email o descripción...'
                    : 'Search by client, phone, email or work description...'
                }
                className="w-full bg-transparent text-base sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
              />
              {leadSearchQuery && (
                <button
                  type="button"
                  onClick={() => setLeadSearchQuery('')}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filtros rápidos con Conteo Dinámico */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setLeadFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                leadFilter === 'all'
                  ? 'bg-[#0F172A] text-white shadow-xs font-extrabold'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/70 border border-stone-200/70'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>{panelLang === 'es' ? 'Todos' : 'All'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${leadFilter === 'all' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'}`}>
                {leads.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setLeadFilter('new')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                leadFilter === 'new'
                  ? 'bg-rose-600 text-white shadow-xs font-extrabold'
                  : 'bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100/70'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${leadFilter === 'new' ? 'bg-white' : 'bg-rose-500 animate-pulse'}`} />
              <span>{panelLang === 'es' ? 'No contestados' : 'Unanswered'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${leadFilter === 'new' ? 'bg-white/20 text-white' : 'bg-rose-200/70 text-rose-800'}`}>
                {leads.filter((l) => l.status === 'new').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setLeadFilter('contacted')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                leadFilter === 'contacted'
                  ? 'bg-amber-600 text-white shadow-xs font-extrabold'
                  : 'bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100/70'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${leadFilter === 'contacted' ? 'bg-white' : 'bg-amber-500'}`} />
              <span>{panelLang === 'es' ? 'En contacto' : 'Contacted'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${leadFilter === 'contacted' ? 'bg-white/20 text-white' : 'bg-amber-200/70 text-amber-900'}`}>
                {leads.filter((l) => l.status === 'contacted').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setLeadFilter('approved')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                leadFilter === 'approved'
                  ? 'bg-emerald-700 text-white shadow-xs font-extrabold'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100/70'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${leadFilter === 'approved' ? 'bg-white' : 'bg-emerald-500'}`} />
              <span>{panelLang === 'es' ? 'Aprobados' : 'Accepted'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${leadFilter === 'approved' ? 'bg-white/20 text-white' : 'bg-emerald-200/70 text-emerald-900'}`}>
                {leads.filter((l) => l.status === 'approved').length}
              </span>
            </button>
          </div>

          {/* Lista de Solicitudes / Leads */}
          <div className="space-y-3.5 max-h-[62vh] overflow-y-auto pr-1">
            {filteredLeads.length === 0 ? (
              <div className="py-12 px-4 text-center rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#C5A059] flex items-center justify-center mx-auto shadow-2xs border border-stone-200/60">
                  <Inbox className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-stone-800">
                  {panelLang === 'es' ? 'No hay presupuestos en esta sección' : 'No inquiries found'}
                </h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {leadSearchQuery
                    ? panelLang === 'es'
                      ? `No hay resultados para "${leadSearchQuery}". Prueba con otro término.`
                      : `No results for "${leadSearchQuery}".`
                    : panelLang === 'es'
                    ? 'Cuando un cliente solicite un presupuesto en ecuaplac.com, aparecerá aquí automáticamente.'
                    : 'When a customer requests a quote on ecuaplac.com, it will appear here.'}
                </p>
                {leads.length === 0 && (
                  <button
                    type="button"
                    onClick={handleRestoreDefaultLeads}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold border border-stone-200 shadow-2xs transition-all active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{panelLang === 'es' ? 'Cargar ejemplos visuales' : 'Load visual examples'}</span>
                  </button>
                )}
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const initials = lead.name
                  .split(' ')
                  .map((n) => n[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                const isSelected = selectedLeadId === lead.id;

                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLeadId((prev) => (prev === lead.id ? null : lead.id))}
                    className={`group relative rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer w-full max-w-full min-w-0 overflow-hidden break-words [overflow-wrap:anywhere] bg-white border-2 ${
                      isSelected
                        ? 'border-[#08090C] shadow-lg ring-2 ring-[#08090C]/20'
                        : 'border-[#08090C] hover:border-black shadow-xs hover:shadow-md'
                    } flex flex-col gap-3.5`}
                  >
                    {/* Fila Cabecera: Monograma, Nombre y Estado */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Avatar Iniciales */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-[#C5A059] border border-stone-200/40 flex items-center justify-center font-bold text-sm tracking-wider shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                          {initials || 'EC'}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm sm:text-base text-stone-900 tracking-tight truncate">
                              {lead.name}
                            </h4>
                            <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">
                              #{String(lead.id || '').slice(0, 8)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                            <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                            <span>{lead.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Badge de Estado */}
                      <div className="shrink-0">
                        {lead.status === 'new' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            {panelLang === 'es' ? 'No Contestado' : 'Unanswered'}
                          </span>
                        ) : lead.status === 'contacted' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {panelLang === 'es' ? 'En Contacto' : 'Contacted'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {panelLang === 'es' ? 'Aprobado' : 'Accepted'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Fila de Metadatos Ejecutivos: Servicio, Municipio, m², Canal */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {/* Servicio principal */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-900 text-xs font-bold font-sans">
                        <Briefcase className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>{lead.service || lead.work_type || 'Reforma'}</span>
                      </span>

                      {/* Ubicación / Municipio */}
                      {lead.location && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold font-sans">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{lead.location}</span>
                        </span>
                      )}

                      {/* Metros cuadrados (m²) */}
                      {lead.sqm && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200/80 text-sky-800 text-xs font-bold font-mono">
                          <span>📐 {lead.sqm}</span>
                        </span>
                      )}

                      {/* Origen del formulario */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 text-[10px] font-medium font-sans">
                        {lead.source_channel === 'tally' ? '⚡ Tally' : lead.source_channel === 'gmail' ? '✉️ Gmail' : '🌐 Web'}
                      </span>
                    </div>

                    {/* Mensaje / Tipo de Obra */}
                    {(lead.client_message || lead.work_type) && (
                      <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-stone-200/80 border-l-[3px] border-l-[#C5A059] shadow-2xs w-full max-w-full overflow-hidden">
                        <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <MessageSquare className="w-3 h-3 text-[#C5A059]" />
                          <span>{panelLang === 'es' ? 'Mensaje o detalles:' : 'Client message:'}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium break-words [overflow-wrap:anywhere]">
                          «{lead.client_message || lead.work_type}»
                        </p>
                      </div>
                    )}

                    {/* Botón interactivo para ver foto o plano si fue adjuntado */}
                    {lead.photo_url && (
                      <div className="w-full">
                        <a
                          href={lead.photo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center justify-between w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-50/80 via-stone-50 to-amber-50/40 border border-[#C5A059]/40 hover:border-[#C5A059] text-stone-900 text-xs font-bold transition-all shadow-2xs hover:shadow-xs group/photo cursor-pointer"
                          title="Abrir foto o plano adjunto por el cliente"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-[#08090C] text-[#F0CF85] flex items-center justify-center shrink-0 shadow-xs">
                              <Camera className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate">Foto o plano adjunto por el cliente</span>
                          </div>
                          <div className="flex items-center gap-1 text-[#C5A059] text-xs shrink-0 font-semibold">
                            <span className="hidden sm:inline">Ver archivo</span>
                            <ExternalLink className="w-3.5 h-3.5 group-hover/photo:translate-x-0.5 transition-transform" />
                          </div>
                        </a>
                      </div>
                    )}

                    {/* Fila de Datos: Presupuesto, Teléfono, Email */}
                    <div className="flex flex-wrap items-center gap-2">
                      {lead.budget_estimate && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-bold shadow-2xs">
                          <span className="text-[10px] text-amber-700/80 uppercase tracking-wider font-semibold">
                            {panelLang === 'es' ? 'Presupuesto:' : 'Budget:'}
                          </span>
                          <span className="font-mono font-extrabold">{lead.budget_estimate}</span>
                        </div>
                      )}

                      {lead.phone && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLeadInfo(lead.phone, 'Teléfono');
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 hover:text-stone-900 hover:border-stone-300 text-xs font-mono transition-colors shadow-2xs active:scale-95"
                          title="Clic para copiar teléfono"
                        >
                          <Phone className="w-3 h-3 text-[#C5A059]" />
                          <span>{lead.phone}</span>
                          <Copy className="w-2.5 h-2.5 text-stone-400 ml-0.5" />
                        </button>
                      )}

                      {lead.email && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLeadInfo(lead.email, 'Email');
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 hover:text-stone-900 hover:border-stone-300 text-xs font-mono transition-colors shadow-2xs truncate max-w-[220px] active:scale-95"
                          title="Clic para copiar correo"
                        >
                          <Mail className="w-3 h-3 text-stone-400" />
                          <span className="truncate">{lead.email}</span>
                          <Copy className="w-2.5 h-2.5 text-stone-400 ml-0.5 shrink-0" />
                        </button>
                      )}
                    </div>

                    {/* Nota interna con icono sobrio de documento (Sin estrellas/sparkles AI) */}
                    {lead.notes && (
                      <div className="flex items-start gap-2 bg-stone-100/90 border border-stone-200/90 rounded-xl p-2.5 text-xs text-stone-700">
                        <FileText className="w-3.5 h-3.5 text-[#C5A059] shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-stone-900 font-bold">{panelLang === 'es' ? 'Nota:' : 'Note:'}</strong> {lead.notes}
                        </span>
                      </div>
                    )}

                    {/* Barra de Acciones Ejecutivas: 2 Filas Claras y Cómodas */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="pt-3 border-t border-stone-200/80 flex flex-col gap-2.5"
                    >
                      {/* Fila 1: Contacto Inmediato WhatsApp y Llamada */}
                      {lead.phone && (
                        <div className="grid grid-cols-2 gap-2">
                          <a
                            href={`https://wa.me/${cleanPhoneForWhatsApp(lead.phone)}?text=${encodeURIComponent(
                              `Hola ${lead.name}, te contacto de Ecuaplac sobre tu solicitud de presupuesto${
                                lead.service ? ` para ${lead.service}` : lead.work_type ? ` para ${lead.work_type}` : ''
                              }${lead.location ? ` en ${lead.location}` : ''}${lead.sqm ? ` (${lead.sqm})` : ''}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              addAuditLog(`Contacto vía WhatsApp con «${lead.name}» (${lead.phone})`, 'Ecuaplac Leads', 'success', 'contact');
                            }}
                            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[42px] rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs shadow-xs transition-all active:scale-98"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>WhatsApp</span>
                          </a>
                          <a
                            href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                            onClick={() => {
                              addAuditLog(`Llamada telefónica a «${lead.name}» (${lead.phone})`, 'Ecuaplac Leads', 'info', 'contact');
                            }}
                            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[42px] rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all active:scale-98"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                            <span>{panelLang === 'es' ? 'Llamar' : 'Call'}</span>
                          </a>
                        </div>
                      )}

                      {/* Fila 2: Segmented Control de Estados (1-Click) + Botón Eliminar */}
                      <div className="flex items-center gap-2">
                        {/* Selector de estado segmentado */}
                        <div className="flex-1 grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200/80">
                          <button
                            type="button"
                            onClick={() => handleUpdateLeadStatus(lead.id, 'new')}
                            className={`py-1.5 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all text-center leading-none ${
                              lead.status === 'new'
                                ? 'bg-white text-rose-700 shadow-2xs border border-rose-200/80 font-extrabold'
                                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                            }`}
                          >
                            {panelLang === 'es' ? 'Pendiente' : 'Pending'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateLeadStatus(lead.id, 'contacted')}
                            className={`py-1.5 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all text-center leading-none ${
                              lead.status === 'contacted'
                                ? 'bg-white text-amber-800 shadow-2xs border border-amber-200/80 font-extrabold'
                                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                            }`}
                          >
                            {panelLang === 'es' ? 'En contacto' : 'Contacted'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateLeadStatus(lead.id, 'approved')}
                            className={`py-1.5 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all text-center leading-none ${
                              lead.status === 'approved'
                                ? 'bg-white text-emerald-800 shadow-2xs border border-emerald-200/80 font-extrabold'
                                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                            }`}
                          >
                            {panelLang === 'es' ? 'Aprobado' : 'Accepted'}
                          </button>
                        </div>

                        {/* Botón de Borrar Lead (Quitar de la bandeja sin tocar Supabase) */}
                        <button
                          type="button"
                          onClick={() => handleDeleteLead(lead.id, lead.name)}
                          className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl text-stone-400 hover:text-rose-600 bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-200 shadow-2xs transition-all active:scale-95 shrink-0 cursor-pointer"
                          title={panelLang === 'es' ? 'Quitar de la bandeja (se mantiene seguro en Supabase)' : 'Dismiss from inbox (kept in Supabase)'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* 6. Modal de Gestionar Perfil */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title={panelLang === 'es' ? 'Gestionar Perfil' : 'Manage Profile'}
        subtitle={
          panelLang === 'es'
            ? 'Nombre del gestor y avatar visible en el portal de Ecuaplac'
            : 'Manager name and visible avatar on the Ecuaplac portal'
        }
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
            >
              {panelLang === 'es' ? 'Cerrar' : 'Close'}
            </Button>
            <Button
              variant="primary"
              size="md"
              type="button"
              onClick={() => {
                handleSaveName();
                setIsProfileModalOpen(false);
              }}
            >
              {panelLang === 'es' ? 'Guardar Cambios' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 pt-1">
          <div className="flex flex-col items-center gap-3">
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="relative group cursor-pointer"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden bg-[#0B1523] border-2 border-stone-200 group-hover:border-[#C5A059] transition-colors flex items-center justify-center shadow-md relative">
                {adminAvatar ? (
                  <img
                    src={adminAvatar}
                    alt="Avatar Administrador"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <span className="text-2xl font-black text-white">JR</span>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="block text-center text-xs text-stone-500 font-bold mt-2 group-hover:text-[#C5A059] transition-colors">
                {panelLang === 'es' ? 'Toca para cambiar fotografía' : 'Tap to change photo'}
              </span>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelect}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {panelLang === 'es' ? 'Nombre en el Panel' : 'Display Name'}
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={panelLang === 'es' ? 'Ej. José Rivadeneira' : 'e.g. José Rivadeneira'}
              className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-slate-900 text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {panelLang === 'es' ? 'Correo Electrónico' : 'Email Address'}
            </label>
            <input
              type="email"
              disabled
              value="ecuaplacbyjyg@gmail.com"
              className="w-full px-4 py-3 rounded-2xl bg-stone-100 border border-stone-200 text-stone-500 text-sm cursor-not-allowed font-mono"
            />
          </div>

          {/* Atributos del Administrador & Dominio Oficial */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <span className="block text-[10.5px] font-bold text-amber-900/70 uppercase tracking-wider">
                {panelLang === 'es' ? 'Rol en el Sistema' : 'System Role'}
              </span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-extrabold text-slate-900">
                  {panelLang === 'es' ? 'Administrador' : 'Administrator'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-100/80 border border-stone-200/80">
              <span className="block text-[10.5px] font-bold text-stone-500 uppercase tracking-wider">
                {panelLang === 'es' ? 'Sitio Web Oficial' : 'Official Website'}
              </span>
              <a
                href="https://ecuaplac.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-sky-700 hover:text-sky-900 hover:underline mt-1.5"
              >
                <Globe className="w-3.5 h-3.5 text-sky-600" />
                <span>ecuaplac.com</span>
              </a>
            </div>
          </div>
        </div>
      </Modal>

      {/* 7. Modal de Seguridad y Clave */}
      <Modal
        isOpen={isSecurityModalOpen}
        onClose={() => {
          setIsSecurityModalOpen(false);
          setPasswordFeedback(null);
        }}
        title={panelLang === 'es' ? 'Seguridad y Clave de Acceso' : 'Security & Access Password'}
        subtitle={
          panelLang === 'es'
            ? 'Actualiza la contraseña del administrador para ecuaplacbyjyg@gmail.com'
            : 'Update administrator password for ecuaplacbyjyg@gmail.com'
        }
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => {
                setIsSecurityModalOpen(false);
                setPasswordFeedback(null);
              }}
            >
              {panelLang === 'es' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              form="ecuaplac-security-form"
            >
              {panelLang === 'es' ? 'Guardar Contraseña' : 'Save Password'}
            </Button>
          </>
        }
      >
        <form
          id="ecuaplac-security-form"
          onSubmit={handleSavePassword}
          className="flex flex-col gap-3.5 pt-1"
        >
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {panelLang === 'es' ? 'Contraseña Actual *' : 'Current Password *'}
            </label>
            <input
              type="password"
              required
              value={currPass}
              onChange={(e) => setCurrPass(e.target.value)}
              placeholder={
                panelLang === 'es'
                  ? 'Introduce la contraseña actual (ej. admin)'
                  : 'Enter current password (e.g. admin)'
              }
              className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-slate-900 text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {panelLang === 'es' ? 'Nueva Contraseña *' : 'New Password *'}
            </label>
            <input
              type="password"
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder={
                panelLang === 'es' ? 'Mínimo 4 caracteres' : 'Minimum 4 characters'
              }
              className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-slate-900 text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {panelLang === 'es' ? 'Confirmar Nueva Contraseña *' : 'Confirm New Password *'}
            </label>
            <input
              type="password"
              required
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder={
                panelLang === 'es' ? 'Repite la nueva contraseña' : 'Repeat the new password'
              }
              className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-slate-900 text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all"
            />
          </div>

          {passwordFeedback && (
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                passwordFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {passwordFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span>{passwordFeedback.msg}</span>
            </div>
          )}
        </form>
      </Modal>

      {/* 8. Modal de Últimos Movimientos */}
      <Modal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        title={panelLang === 'es' ? 'Últimos Movimientos' : 'Recent Activity'}
        subtitle={
          panelLang === 'es'
            ? 'Registro de cambios, subidas de fotografías y actividad en la web'
            : 'Log of changes, photo uploads, and web activity'
        }
        footer={
          <Button
            variant="secondary"
            size="md"
            type="button"
            onClick={() => setIsLogsModalOpen(false)}
          >
            {panelLang === 'es' ? 'Cerrar' : 'Close'}
          </Button>
        }
      >
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">
              {panelLang === 'es'
                ? `Actividad en tiempo real (${logs.length})`
                : `Real-time activity (${logs.length})`}
            </span>
            <button
              type="button"
              onClick={handleRefreshLogs}
              className="text-xs font-bold text-slate-900 hover:text-[#C5A059] flex items-center gap-1.5 bg-stone-100 active:scale-95 px-3 py-1.5 rounded-xl border border-stone-200 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#C5A059] ${isRefreshingLogs ? 'animate-spin' : ''}`} />
              <span>{panelLang === 'es' ? 'Refrescar' : 'Refresh'}</span>
            </button>
          </div>

          <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-2xl bg-stone-50 border border-stone-200/60">
                <Activity className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-stone-600">
                  {panelLang === 'es'
                    ? 'No hay movimientos registrados en el servidor todavía'
                    : 'No activity recorded on server yet'}
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {panelLang === 'es'
                    ? 'Cualquier cambio, subida de foto o lead que gestiones aparecerá aquí en tiempo real.'
                    : 'Any changes, uploads or leads managed will show up here in real time.'}
                </p>
              </div>
            ) : (
              logs.map((log) => {
                const isDelete = log.entity === 'delete' || log.entity === 'delete_doc';
                const isUpload = log.entity === 'upload' || log.entity === 'upload_doc';
                const isContact = log.entity === 'contact';
                const isStatus = log.entity === 'status';
                const isProfile = log.entity === 'profile' || log.entity === 'security';

                const dotColor = isDelete
                  ? 'bg-rose-500'
                  : isUpload
                  ? 'bg-emerald-500'
                  : isContact
                  ? 'bg-green-600'
                  : isStatus
                  ? 'bg-amber-500'
                  : isProfile
                  ? 'bg-purple-500'
                  : 'bg-blue-500';

                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/80 hover:bg-stone-100/80 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0 shadow-2xs`} />
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {log.action}
                      </span>
                    </div>
                    <span className="text-[10.5px] text-stone-500 font-semibold whitespace-nowrap shrink-0 font-mono">
                      {log.time}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* 9. Modal de Feedback y Soporte a Musa */}
      <Modal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        title={panelLang === 'es' ? 'Enviar Feedback o Problema' : 'Feedback & Support Box'}
        subtitle={
          panelLang === 'es'
            ? 'Envía una consulta, reporte de error o idea de mejora directamente a Musa'
            : 'Send an inquiry, bug report, or feature request directly to Musa'
        }
        footer={
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-2.5">
            <span className="text-[11px] text-stone-500 font-mono text-center sm:text-left">
              v{installedVersion} • Ecuaplac Reformas
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="secondary"
                size="md"
                type="button"
                onClick={() => setIsFeedbackModalOpen(false)}
                className="w-full sm:w-auto"
              >
                {panelLang === 'es' ? 'Cerrar' : 'Close'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          {/* Selector de Categoría (Tarjetas Táctiles Profesionales con Lucide) */}
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-2.5 font-display tracking-tight flex items-center justify-between">
              <span>{panelLang === 'es' ? 'Tipo de mensaje' : 'Message type'}</span>
              <span className="text-[11px] font-normal text-stone-500">
                {panelLang === 'es' ? 'Selecciona una categoría' : 'Select category'}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* 1. Incidencia / Problema */}
              <button
                type="button"
                onClick={() => setFeedbackCategory('bug')}
                className={`relative p-3 rounded-2xl text-xs font-bold transition-all duration-150 border text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] ${
                  feedbackCategory === 'bug'
                    ? 'bg-rose-500/10 border-rose-300 text-rose-900 shadow-[0_4px_14px_-2px_rgba(244,63,94,0.18)] ring-1 ring-rose-400/40'
                    : 'bg-white/80 border-stone-200/90 text-stone-600 hover:bg-stone-50 hover:border-stone-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform ${
                  feedbackCategory === 'bug' ? 'bg-rose-600 text-white scale-105 shadow-sm' : 'bg-rose-50 text-rose-600'
                }`}>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <span className="leading-tight text-[11px] font-sans">
                  {panelLang === 'es' ? 'Problema' : 'Issue / Bug'}
                </span>
              </button>

              {/* 2. Sugerencia / Idea */}
              <button
                type="button"
                onClick={() => setFeedbackCategory('idea')}
                className={`relative p-3 rounded-2xl text-xs font-bold transition-all duration-150 border text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] ${
                  feedbackCategory === 'idea'
                    ? 'bg-amber-500/10 border-amber-300 text-amber-950 shadow-[0_4px_14px_-2px_rgba(245,158,11,0.18)] ring-1 ring-amber-400/40'
                    : 'bg-white/80 border-stone-200/90 text-stone-600 hover:bg-stone-50 hover:border-stone-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform ${
                  feedbackCategory === 'idea' ? 'bg-[#C5A059] text-white scale-105 shadow-sm' : 'bg-amber-50 text-amber-700'
                }`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="leading-tight text-[11px] font-sans">
                  {panelLang === 'es' ? 'Sugerencia' : 'Feature Idea'}
                </span>
              </button>

              {/* 3. Duda Técnica */}
              <button
                type="button"
                onClick={() => setFeedbackCategory('question')}
                className={`relative p-3 rounded-2xl text-xs font-bold transition-all duration-150 border text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] ${
                  feedbackCategory === 'question'
                    ? 'bg-blue-500/10 border-blue-300 text-blue-950 shadow-[0_4px_14px_-2px_rgba(59,130,246,0.18)] ring-1 ring-blue-400/40'
                    : 'bg-white/80 border-stone-200/90 text-stone-600 hover:bg-stone-50 hover:border-stone-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform ${
                  feedbackCategory === 'question' ? 'bg-blue-600 text-white scale-105 shadow-sm' : 'bg-blue-50 text-blue-600'
                }`}>
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="leading-tight text-[11px] font-sans">
                  {panelLang === 'es' ? 'Consulta' : 'Question'}
                </span>
              </button>
            </div>
          </div>

          {/* Asunto Breve */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5 font-display tracking-tight">
              {panelLang === 'es' ? 'Título o Asunto' : 'Subject'}
            </label>
            <input
              type="text"
              value={feedbackSubject}
              onChange={(e) => setFeedbackSubject(e.target.value)}
              placeholder={
                feedbackCategory === 'bug'
                  ? (panelLang === 'es' ? 'Ej: No carga una foto en Galería 2' : 'e.g. Cannot upload photo in Gallery 2')
                  : feedbackCategory === 'idea'
                  ? (panelLang === 'es' ? 'Ej: Me gustaría un botón para descargar presupuestos' : 'e.g. Would love a button to export leads')
                  : (panelLang === 'es' ? 'Ej: ¿Cómo cambio el número de teléfono de la web?' : 'e.g. How do I change phone number?')
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200/90 text-slate-900 text-xs placeholder:text-stone-400 focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 transition-all font-medium font-sans shadow-xs"
            />
          </div>

          {/* Mensaje Detallado */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5 font-display tracking-tight">
              {panelLang === 'es' ? 'Mensaje o Explicación' : 'Message Details'}
            </label>
            <textarea
              rows={4}
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder={
                panelLang === 'es'
                  ? 'Explica aquí con claridad qué ha sucedido o qué te gustaría añadir a la app...'
                  : 'Write here what went wrong or what you would like to improve...'
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200/90 text-slate-900 text-xs placeholder:text-stone-400 focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 transition-all resize-none font-medium leading-relaxed font-sans shadow-xs"
            />
          </div>

          {/* Contexto de Soporte Seguro (Zero Raw Email Exposure) */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#FAF7F0] to-white border border-[#E6DECD] flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#08090C] flex items-center justify-center text-[#F0CF85] shrink-0 shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-950 font-sans leading-snug truncate">
                  {panelLang === 'es' ? 'Línea de Soporte Ecuaplac' : 'Ecuaplac Support Channel'}
                </p>
                <p className="text-[11px] text-stone-500 font-sans truncate">
                  {panelLang === 'es' ? 'Canal directo preferente · Respuesta en < 24h' : 'Direct priority channel · Response < 24h'}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 text-[10px] font-black shrink-0 font-mono tracking-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>{panelLang === 'es' ? 'En Línea' : 'Online'}</span>
            </span>
          </div>

          {/* Botones de Envío: WhatsApp Directo + Email Sin Fugas + Guardar en Sistema */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              disabled={isSendingFeedback || !feedbackMessage.trim()}
              onClick={() => handleSendFeedback('whatsapp')}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:from-[#20BD5A] hover:to-[#1AA34F] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs shadow-[0_6px_20px_-4px_rgba(37,211,102,0.45)] ring-1 ring-white/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer font-sans"
            >
              <MessageSquare className="w-4 h-4 fill-white/20 text-white" />
              <span>{panelLang === 'es' ? 'Enviar por WhatsApp a Musa' : 'Send via WhatsApp to Musa'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isSendingFeedback || !feedbackMessage.trim()}
                onClick={() => handleSendFeedback('email')}
                className="py-3 px-3 rounded-2xl bg-[#08090C] hover:bg-slate-900 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-[0_4px_12px_-2px_rgba(8,9,12,0.25)] ring-1 ring-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <Mail className="w-4 h-4 text-[#F0CF85]" />
                <span>{panelLang === 'es' ? 'Enviar por Correo' : 'Send by Email'}</span>
              </button>

              <button
                type="button"
                disabled={isSendingFeedback || !feedbackMessage.trim()}
                onClick={() => handleSendFeedback('system')}
                className="py-3 px-3 rounded-2xl bg-stone-100/90 hover:bg-stone-200/90 active:scale-[0.99] border border-stone-200/90 disabled:opacity-50 disabled:cursor-not-allowed text-stone-800 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <Save className="w-4 h-4 text-stone-600" />
                <span>{panelLang === 'es' ? 'Guardar en Sistema' : 'Log in System'}</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Visor de Factura Real (PDF) */}
      <Modal
        isOpen={isInvoiceViewerOpen}
        onClose={() => {
          setIsInvoiceViewerOpen(false);
          setSelectedInvoiceForView(null);
        }}
        title={selectedInvoiceForView?.number ? `${selectedInvoiceForView.number} • ${selectedInvoiceForView.name}` : selectedInvoiceForView?.name || (panelLang === 'es' ? 'Factura Oficial' : 'Official Invoice')}
        subtitle={panelLang === 'es' ? 'Documento tributario oficial emitido por Ecuaplac J&G S.L.' : 'Official tax document issued by Ecuaplac J&G S.L.'}
        maxWidth="2xl"
        footer={
          <div className="flex flex-row items-center justify-between w-full gap-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-stone-600 font-sans font-medium">
                {panelLang === 'es' ? 'Estado:' : 'Status:'}{' '}
                <span className="font-bold text-emerald-700 capitalize">
                  {selectedInvoiceForView?.status || (panelLang === 'es' ? 'Oficial' : 'Official')}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="md"
                type="button"
                onClick={() => {
                  setIsInvoiceViewerOpen(false);
                  setSelectedInvoiceForView(null);
                }}
                className="cursor-pointer"
              >
                {panelLang === 'es' ? '← Volver atrás' : '← Go back'}
              </Button>
              <button
                type="button"
                onClick={() => handleOpenFullscreenInvoice(selectedInvoiceForView?.fileUrl, selectedInvoiceForView?.name)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all font-sans cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{panelLang === 'es' ? 'Descargar' : 'Download'}</span>
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          {/* Ficha Universal de Documento PDF Oficial (Siempre limpia y nítida en móvil y escritorio) */}
          <div className="rounded-3xl border border-stone-200 bg-stone-50/80 p-5 sm:p-7 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0B111E] border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] shadow-md">
              <FileText className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider mb-2">
                ✓ {panelLang === 'es' ? 'Documento Oficial Contabilizado' : 'Official Accounting Document'}
              </span>
              <h4 className="text-base sm:text-lg font-black text-slate-900 font-display tracking-tight break-all">
                {selectedInvoiceForView?.name || 'Factura_Ecuaplac.pdf'}
              </h4>
              <p className="text-xs text-stone-500 font-mono mt-1">
                {selectedInvoiceForView?.number || 'FAC-2026-001'} · {selectedInvoiceForView?.fileSize || '320 KB'}
              </p>
            </div>

            {/* Ficha Resumida Sin Datos Falsos */}
            <div className="grid grid-cols-2 gap-2.5 max-w-sm mx-auto text-left text-xs bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  {panelLang === 'es' ? 'Emisor / Tipo' : 'Issuer / Type'}
                </span>
                <span className="font-extrabold text-slate-800 block text-xs mt-0.5 truncate">
                  {selectedInvoiceForView?.isCustomUpload
                    ? (panelLang === 'es' ? 'Documento adjunto' : 'Attached document')
                    : (selectedInvoiceForView?.clientName || 'ECUAPLAC J&G S.L.')}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  {panelLang === 'es' ? 'Fecha' : 'Date'}
                </span>
                <span className="font-semibold text-slate-700 block text-xs mt-0.5">
                  {selectedInvoiceForView?.issueDate || selectedInvoiceForView?.uploadDate || 'Hoy'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  {panelLang === 'es' ? 'Identificador' : 'Identifier'}
                </span>
                <span className="font-mono font-bold text-slate-900 block text-xs mt-0.5 truncate">
                  {selectedInvoiceForView?.number || 'FAC-PDF'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  {panelLang === 'es' ? 'Importe' : 'Amount'}
                </span>
                <span className="font-mono font-black text-[#9E782F] block text-xs mt-0.5">
                  {selectedInvoiceForView?.totalAmount && selectedInvoiceForView.totalAmount > 0
                    ? `${selectedInvoiceForView.totalAmount.toFixed(2)} €`
                    : (panelLang === 'es' ? 'Ver en el PDF' : 'See in PDF')}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              {panelLang === 'es'
                ? 'Puedes abrir la factura directamente en pantalla completa para revisarla al detalle con zoom táctil o descargarla en tu dispositivo.'
                : 'You can open the invoice in full screen to inspect details with pinch-to-zoom or download it to your device.'}
            </p>

            {/* Acciones de Visualización y Descarga */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => handleViewInvoicePdf(selectedInvoiceForView?.fileUrl, selectedInvoiceForView?.name)}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#0B111E] hover:bg-[#162E4D] text-white text-xs sm:text-sm font-bold shadow-md transition-all border border-[#C5A059]/40 active:scale-98 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-[#C5A059]" />
                <span>{panelLang === 'es' ? 'Abrir Factura Completa' : 'Open Full Invoice'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenFullscreenInvoice(selectedInvoiceForView?.fileUrl, selectedInvoiceForView?.name)}
                className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs sm:text-sm font-bold transition-all border border-stone-200 active:scale-98 cursor-pointer"
              >
                <Download className="w-4 h-4 text-stone-600" />
                <span>{panelLang === 'es' ? 'Descargar' : 'Download'}</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmación Táctil de Borrado (Sin diálogos feos de window.confirm) */}
      <Modal
        isOpen={!!deleteConfirmItem}
        onClose={() => {
          if (!isDeletingWork) setDeleteConfirmItem(null);
        }}
        maxWidth="sm"
        theme="light"
        title={panelLang === 'es' ? '¿Eliminar de la Web?' : 'Delete from Website?'}
        subtitle={
          panelLang === 'es'
            ? 'Esta acción retirará la obra de ecuaplac.com'
            : 'This will remove the project from ecuaplac.com'
        }
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="secondary"
              size="md"
              type="button"
              disabled={isDeletingWork}
              onClick={() => setDeleteConfirmItem(null)}
              className="flex-1 sm:flex-none min-h-[44px]"
            >
              {panelLang === 'es' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              size="md"
              type="button"
              disabled={isDeletingWork}
              onClick={handleConfirmDelete}
              icon={
                isDeletingWork ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 text-white" />
                )
              }
              className="flex-1 sm:flex-none min-h-[44px] bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {isDeletingWork
                ? (panelLang === 'es' ? 'Eliminando...' : 'Deleting...')
                : (panelLang === 'es' ? 'Eliminar Definitivamente' : 'Delete Permanently')}
            </Button>
          </div>
        }
      >
        <div className="py-2 text-center space-y-3">
          {deleteConfirmItem?.image_url && (
            <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden border border-stone-200 shadow-md">
              <img
                src={deleteConfirmItem.image_url}
                alt={deleteConfirmItem.title_es}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <p className="text-sm font-extrabold text-slate-900 leading-snug">
            «{deleteConfirmItem?.title_es}»
          </p>
          <p className="text-xs text-stone-500 leading-relaxed">
            {panelLang === 'es'
              ? 'Se eliminará de tu galería y dejará de ser visible para los clientes que visiten la web.'
              : 'It will be removed from your gallery and will no longer be visible to web visitors.'}
          </p>
        </div>
      </Modal>

      {/* 9. Barra de Navegación Completa Responsive (Full-Width Native Bar en Móvil / Floating Island Dock en Desktop) */}
      <div className={`fixed bottom-0 md:bottom-6 inset-x-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 w-full md:w-auto z-40 pointer-events-none transition-all duration-200 ${
        isModalOpen || isLeadsModalOpen || isProfileModalOpen || isSecurityModalOpen || isLogsModalOpen || isInvoiceViewerOpen || !!deleteConfirmItem
          ? 'hidden opacity-0 pointer-events-none'
          : ''
      }`}>
        <div className="pointer-events-auto w-full md:w-auto bg-[#08090C] md:bg-[#08090C]/96 md:backdrop-blur-xl border-t md:border border-white/[0.08] shadow-md md:shadow-[0_20px_50px_rgba(0,0,0,0.5)] md:rounded-full md:px-3">
          <nav className="max-w-md sm:max-w-lg md:w-[480px] mx-auto px-4 md:px-2 pt-2 md:pt-1.5 pb-[max(12px,env(safe-area-inset-bottom))] md:pb-1.5 flex items-center justify-between relative">
            {/* Tab 1: Inicio */}
            <button
              type="button"
              onClick={() => setActiveTab('inicio')}
              className={`flex-1 flex flex-col items-center gap-1.5 py-1 transition-all select-none active:scale-95 cursor-pointer group ${
                activeTab === 'inicio' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <NavHomeIcon active={activeTab === 'inicio'} />
              <span
                className={`text-[10.5px] font-sans tracking-wide leading-none transition-colors ${
                  activeTab === 'inicio' ? 'font-bold text-white' : 'font-medium text-slate-400 group-hover:text-slate-300'
                }`}
              >
                {panelLang === 'es' ? 'Inicio' : 'Home'}
              </span>
              {activeTab === 'inicio' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#F0CF85] shadow-[0_0_8px_#F0CF85] -mb-1 animate-pulse" />
              )}
            </button>

            {/* Tab 2: Galería 1 (Carrusel Portada) */}
            <button
              type="button"
              onClick={() => setActiveTab('obras')}
              className={`flex-1 flex flex-col items-center gap-1.5 py-1 transition-all select-none active:scale-95 cursor-pointer group ${
                activeTab === 'obras' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <NavGallery1Icon active={activeTab === 'obras'} />
              <span
                className={`text-[10.5px] font-sans tracking-wide leading-none transition-colors ${
                  activeTab === 'obras' ? 'font-bold text-white' : 'font-medium text-slate-400 group-hover:text-slate-300'
                }`}
              >
                {panelLang === 'es' ? 'Galería 1' : 'Gallery 1'}
              </span>
              {activeTab === 'obras' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#F0CF85] shadow-[0_0_8px_#F0CF85] -mb-1 animate-pulse" />
              )}
            </button>

            {/* CENTER FAB: Botón Circular Elevado para Subir Foto WebP con CameraIcon animado */}
            <div className="relative -top-5 px-1 shrink-0 flex items-center justify-center">
              <button
                type="button"
                onClick={handleOpenAdd}
                style={{
                  background: 'linear-gradient(135deg, #9E782F 0%, #D4AF37 50%, #F5DE98 100%)',
                  boxShadow: '0 8px 24px -2px rgba(212,175,55,0.45)',
                }}
                className="w-14 h-14 rounded-full text-slate-950 flex items-center justify-center ring-4 ring-[#08090C] active:scale-90 transition-all hover:brightness-110 hover:shadow-[0_12px_28px_-2px_rgba(212,175,55,0.6)] group cursor-pointer"
                title={panelLang === 'es' ? 'Añadir nueva fotografía / obra' : 'Add new project photo'}
              >
                <CameraIcon size={26} className="text-slate-950 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>

            {/* Tab 3: Galería 2 (Catálogo / Más Reformas con Icono Distintivo) */}
            <button
              type="button"
              onClick={() => setActiveTab('more_projects')}
              className={`flex-1 flex flex-col items-center gap-1.5 py-1 transition-all select-none active:scale-95 cursor-pointer group ${
                activeTab === 'more_projects' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <NavGallery2Icon active={activeTab === 'more_projects'} />
              <span
                className={`text-[10.5px] font-sans tracking-wide leading-none transition-colors ${
                  activeTab === 'more_projects' ? 'font-bold text-white' : 'font-medium text-slate-400 group-hover:text-slate-300'
                }`}
              >
                {panelLang === 'es' ? 'Galería 2' : 'Gallery 2'}
              </span>
              {activeTab === 'more_projects' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#F0CF85] shadow-[0_0_8px_#F0CF85] -mb-1 animate-pulse" />
              )}
            </button>

            {/* Tab 4: Ajustes */}
            <button
              type="button"
              onClick={() => setActiveTab('ajustes')}
              className={`flex-1 flex flex-col items-center gap-1.5 py-1 relative transition-all select-none active:scale-95 cursor-pointer group ${
                activeTab === 'ajustes' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <NavSettingsIcon active={activeTab === 'ajustes'} />
              <span
                className={`text-[10.5px] font-sans tracking-wide leading-none transition-colors ${
                  activeTab === 'ajustes' ? 'font-bold text-white' : 'font-medium text-slate-400 group-hover:text-slate-300'
                }`}
              >
                {panelLang === 'es' ? 'Ajustes' : 'Settings'}
              </span>
              {activeTab === 'ajustes' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#F0CF85] shadow-[0_0_8px_#F0CF85] -mb-1 animate-pulse" />
              )}
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default EcuaplacPortal;

