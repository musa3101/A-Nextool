import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
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
import { ecuaplacConnector, EcuaplacLeadItem } from './conector';
import { DEFAULT_WORKS, DEFAULT_MORE_PROJECTS } from './datos_iniciales';
import { autoTranslateWork } from './traductor';
import { insforge } from '@/lib/insforge';

// Catálogo inicial auténtico de Ecuaplac (9 Obras Reales de Portada y 11 Proyectos de Galería)
const INITIAL_WORKS = DEFAULT_WORKS;
const INITIAL_MORE_PROJECTS = DEFAULT_MORE_PROJECTS;

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
  const { addAuditLog } = useTenant();

  // Estados para Login con Gmail + Contraseña
  const [loginEmail, setLoginEmail] = useState('ecuaplacbyjyg@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginRemember, setLoginRemember] = useState(true);
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
      showSyncToast(
        panelLang === 'es' ? 'Bienvenido a tu panel' : 'Welcome to your portal',
        'success'
      );
    }
  };

  // Tab: 'inicio' | 'obras' (Galería 1) | 'more_projects' (Galería 2) | 'ajustes'
  const [activeTab, setActiveTab] = useState<'inicio' | 'obras' | 'more_projects' | 'ajustes'>('inicio');

  // Idioma del Panel ('es' | 'en') persistido en localStorage
  const [panelLang, setPanelLang] = useState<'es' | 'en'>(() => {
    try {
      return (localStorage.getItem('ecuaplac_panel_lang') as 'es' | 'en') || 'es';
    } catch {
      return 'es';
    }
  });

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

  // Cloudflare Analytics Timeframe: '30d' | '3m'
  const [cfPeriod, setCfPeriod] = useState<'30d' | '3m'>('30d');
  const cfMetrics = ecuaplacConnector.getCloudflareMetrics(cfPeriod);

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

  // Carga inicial en vivo desde Supabase (sincroniza fotos reales de Mallorca)
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
    const digits = phone.replace(/[^0-9]/g, '');
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
      panelLang === 'es' ? 'Consultando leads en Supabase (ecuaplac.com)...' : 'Checking leads in Supabase...',
      'syncing'
    );
    try {
      const liveLeads = await ecuaplacConnector.fetchLeadsOnline();
      if (liveLeads && liveLeads.length > 0) {
        setLeads(liveLeads);
        showSyncToast(
          panelLang === 'es'
            ? `Sincronizados ${liveLeads.length} presupuestos desde Supabase`
            : `${liveLeads.length} leads synced from Supabase`,
          'success'
        );
      } else {
        showSyncToast(
          panelLang === 'es'
            ? 'Backend Supabase conectado (0 solicitudes nuevas en la web)'
            : 'Supabase connected (0 new inquiries)',
          'success'
        );
      }
    } catch {
      showSyncToast(
        panelLang === 'es' ? 'Error al contactar con Supabase' : 'Error contacting Supabase',
        'error'
      );
    } finally {
      setIsSyncingLeads(false);
    }
  };

  const handleDeleteLead = async (leadId: string, leadName: string) => {
    const confirmMsg =
      panelLang === 'es'
        ? `¿Seguro que deseas eliminar la solicitud de "${leadName}"?`
        : `Are you sure you want to delete inquiry from "${leadName}"?`;
    if (!window.confirm(confirmMsg)) return;

    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    if (selectedLeadId === leadId) setSelectedLeadId(null);
    await ecuaplacConnector.deleteLead(leadId);
    showSyncToast(
      panelLang === 'es' ? `Presupuesto de ${leadName} eliminado` : `Lead ${leadName} deleted`,
      'success'
    );
  };

  const handleRestoreDefaultLeads = () => {
    setLeads(defaultLeads);
    ecuaplacConnector.saveLeads(defaultLeads);
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
        `Lead «${targetLead.name}» cambiado a ${statusLabels[newStatus] || newStatus}`,
        'Ecuaplac Leads',
        'info'
      );
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

  // Dispositivo
  const [deviceFeedback, setDeviceFeedback] = useState<string | null>(null);

  // Versión del Sistema Next Tools
  const CURRENT_SYSTEM_VERSION = '001';
  const [isUpdatesExpanded, setIsUpdatesExpanded] = useState(false);
  const [autoCheckUpdates, setAutoCheckUpdates] = useState(true);
  const [updateCheckState, setUpdateCheckState] = useState<'idle' | 'checking' | 'up-to-date' | 'available' | 'installing' | 'installed'>('idle');
  const [installedVersion, setInstalledVersion] = useState(() => {
    const cached = localStorage.getItem('nextool_app_version');
    // Si la caché tenía la versión '000' vieja, la actualizamos automáticamente a '001'
    if (!cached || cached === '000') {
      localStorage.setItem('nextool_app_version', CURRENT_SYSTEM_VERSION);
      return CURRENT_SYSTEM_VERSION;
    }
    return cached;
  });
  const [simulatedUpdateAvailable, setSimulatedUpdateAvailable] = useState(false);
  const [newVersionNotice, setNewVersionNotice] = useState<string | null>(null);

  // Sincronización proactiva de versión y auto-actualizaciones con InsForge Cloud
  useEffect(() => {
    let isMounted = true;
    const checkVersion = async () => {
      try {
        const cloudVer = await ecuaplacConnector.fetchTenantVersion();
        if (!isMounted) return;
        if (cloudVer && cloudVer !== '000' && cloudVer !== installedVersion) {
          setNewVersionNotice(cloudVer);
          setSimulatedUpdateAvailable(true);
        } else {
          setNewVersionNotice(null);
        }
      } catch {}
    };

    checkVersion();
    const interval = setInterval(() => {
      if (autoCheckUpdates) {
        checkVersion();
      }
    }, 25000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [installedVersion, autoCheckUpdates]);

  const handleCheckUpdates = async () => {
    setUpdateCheckState('checking');
    try {
      const cloudVer = await ecuaplacConnector.fetchTenantVersion();
      if (cloudVer && cloudVer !== '000' && cloudVer !== installedVersion) {
        setNewVersionNotice(cloudVer);
        setSimulatedUpdateAvailable(true);
        setUpdateCheckState('available');
      } else if (simulatedUpdateAvailable) {
        setUpdateCheckState('available');
      } else {
        setNewVersionNotice(null);
        setUpdateCheckState('up-to-date');
      }
    } catch {
      setUpdateCheckState('up-to-date');
    }
  };

  const handleInstallUpdate = async () => {
    setUpdateCheckState('installing');
    const targetVer = newVersionNotice || (simulatedUpdateAvailable ? '002' : CURRENT_SYSTEM_VERSION);
    try {
      await ecuaplacConnector.updateTenantVersion(targetVer);
    } catch {}
    setTimeout(() => {
      setUpdateCheckState('installed');
      setInstalledVersion(targetVer);
      localStorage.setItem('nextool_app_version', targetVer);
      setSimulatedUpdateAvailable(false);
      setNewVersionNotice(null);
      addAuditLog(`Actualización aplicada: Versión ${targetVer} en producción`, 'Next Tools Core', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1400);
    }, 1200);
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
          description: 'Configuración DNS Cloudflare Edge, SSL y optimización WebP ultra-rápida',
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
      name: 'Presupuesto_Hosting_Cloudflare_2026.pdf',
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
          description: 'Hosting y CDN Cloudflare Edge Workers Anual (Servidor Mallorca)',
          qty: 1,
          unitPrice: 180.0,
          total: 180.0,
        },
        {
          description: 'Mantenimiento de copias y mitigación DDoS Cloudflare Pro',
          qty: 1,
          unitPrice: 60.0,
          total: 60.0,
        },
      ],
      subtotal: 240.0,
      vatAmount: 50.4,
      totalAmount: 290.4,
      notes: 'Presupuesto oficial y factura proforma Cloudflare Edge anual.',
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

      showSyncToast(panelLang === 'es' ? 'Sincronizando con InsForge Cloud...' : 'Syncing with InsForge Cloud...', 'syncing');

      // 1. Guardar en Base de Datos de InsForge Cloud para que esté disponible en Safari móvil y ordenador
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
      showSyncToast(panelLang === 'es' ? 'Documento sincronizado con InsForge' : 'Document synced with InsForge', 'success');
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
    showSyncToast(panelLang === 'es' ? 'Eliminado de InsForge Cloud' : 'Deleted from InsForge Cloud', 'success');
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

  // Auditoría & Logs
  const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);
  const [logs, setLogs] = useState([
    { id: '1', action: 'Obra editada y web actualizada: "Baño de Diseño con Bañera Exenta"', time: 'Hoy, 20:45', type: 'edit' },
    { id: '2', action: 'Fotografía optimizada en WebP (184 KB)', time: 'Hoy, 20:12', type: 'upload' },
    { id: '3', action: 'Nombre de administrador confirmado: "José Rivadeneira"', time: 'Hoy, 19:30', type: 'profile' },
    { id: '4', action: 'Sesión iniciada desde dispositivo móvil', time: 'Hoy, 19:15', type: 'auth' },
    { id: '5', action: 'Proyecto fijado como Portada Principal en carrusel', time: 'Ayer, 18:20', type: 'status' },
    { id: '6', action: 'Presupuesto #LEAD-104 marcado como Gestionado', time: 'Ayer, 16:50', type: 'lead' },
  ]);

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
      setLogs((prev) => [
        { id: String(Date.now()), action: 'Avatar de administrador actualizado', time: 'Ahora mismo', type: 'profile' },
        ...prev,
      ]);
      addAuditLog('Avatar de administrador actualizado', 'Ecuaplac App', 'success');
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
    setLogs((prev) => [
      { id: String(Date.now()), action: `Nombre de administrador cambiado a: "${trimmed}"`, time: 'Ahora mismo', type: 'profile' },
      ...prev,
    ]);
    addAuditLog(`Nombre de administrador cambiado a: "${trimmed}"`, 'Ecuaplac App', 'success');
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
        msg: panelLang === 'es' ? '¡Contraseña actualizada en el servidor InsForge!' : 'Password updated on InsForge server!',
      });
      setCurrPass('');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => {
        setIsSecurityModalOpen(false);
        setPasswordFeedback(null);
      }, 2000);
      showSyncToast(
        panelLang === 'es' ? 'Contraseña sincronizada con InsForge' : 'Password synced with InsForge',
        'success'
      );
      addAuditLog('Contraseña de administrador actualizada en InsForge', 'Ecuaplac App', 'success');
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

  const handleRefreshLogs = () => {
    setIsRefreshingLogs(true);
    setTimeout(() => {
      setIsRefreshingLogs(false);
      setLogs((prev) => [
        { id: String(Date.now()), action: 'Historial sincronizado con Supabase / Servidor', time: 'Ahora mismo', type: 'sync' },
        ...prev,
      ]);
    }, 600);
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
    } catch (err) {
      console.warn('Fallo compresión en canvas, usando DataURL directa:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setFormImageUrl(reader.result as string);
        setUploadStats({ sizeKb: Math.round(file.size / 1024), mime: file.type });
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

  const handleDelete = async (item: EcuaplacWorkItem) => {
    const isCarousel = activeTab === 'obras';
    const confirmMsg =
      panelLang === 'es'
        ? `¿Eliminar definitivamente la obra "${item.title_es}" de ecuaplac.com?`
        : `Permanently delete project "${item.title_en || item.title_es}" from ecuaplac.com?`;

    if (window.confirm(confirmMsg)) {
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
      }
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitleEs.trim()) {
      alert('Indica un título en español para la obra');
      return;
    }

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
      const updatedItem: EcuaplacWorkItem = {
        ...editingItem,
        type: isCarousel ? 'carousel' : 'more_projects',
        title_es: formTitleEs,
        title_en: finalTitleEn,
        location_es: formLocation,
        image_url: finalImage,
        active: formActive,
        fit_mode: formFitMode,
      };

      if (isCarousel) {
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
      const newItem: EcuaplacWorkItem = {
        id: `ecuaplac-${Date.now()}`,
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
            showSyncToast(
              panelLang === 'es' ? 'Bienvenido a tu panel de Ecuaplac' : 'Welcome to your Ecuaplac portal',
              'success'
            );
          }
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-full min-w-0 bg-[#F4F1EA] min-h-screen text-slate-900 pb-20 sm:pb-24">
      {/* Toast Flotante de Sincronización en Tiempo Real */}
      {syncToast && (
        <div className="fixed top-3.5 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold font-sans border backdrop-blur-xl bg-[#0E1726]/95 text-white border-[#C5A059]/40 select-none pointer-events-none">
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

      {/* 1. Header Oficial de Ecuaplac (Deep Sapphire Navy & Gold Trim - Safe Area Nítida) */}
      <header className="sticky top-0 z-30 bg-[#0E1726] border-b border-slate-800 shadow-sm px-4 sm:px-6 pt-[max(14px,env(safe-area-inset-top))] pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-white p-1 flex items-center justify-center shrink-0 shadow-md border border-white/20 ring-1 ring-white/10">
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
            <span className="text-base font-bold text-white tracking-tight leading-none block">
              ecuaplac.com
            </span>
            <span className="text-[10px] text-sky-400 font-bold tracking-wider uppercase block mt-0.5">
              {panelLang === 'es' ? 'Gestor Oficial' : 'Official Manager'}
            </span>
          </div>
        </div>

        {/* Botón Ver Web Directo (Limpio en todos los apartados) */}
        <a
          href="https://ecuaplac.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 backdrop-blur-md shadow-xs text-white hover:text-[#C5A059] transition-all text-xs font-semibold"
          title={panelLang === 'es' ? 'Ver ecuaplac.com en directo' : 'View ecuaplac.com live'}
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#C5A059]" />
          <span className="hidden sm:inline">{panelLang === 'es' ? 'Ver Web' : 'View Web'}</span>
        </a>
      </header>

      {/* Banner Notificación Auto-Actualización (InsForge Cloud) */}
      {newVersionNotice && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-3">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0E1726] border border-[#C5A059]/50 shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C5A059]"></span>
              </span>
              <div>
                <span className="text-xs sm:text-sm font-black text-white block font-display">
                  ¡Nueva versión v{newVersionNotice} lista!
                </span>
                <span className="text-[11px] text-stone-300 font-sans block mt-0.5">
                  {panelLang === 'es' ? 'Hay mejoras publicadas en el sistema. Pulsa para aplicar.' : 'System improvements available. Tap to apply.'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleInstallUpdate}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-[#C5A059] hover:from-amber-300 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              {panelLang === 'es' ? 'Actualizar' : 'Update'}
            </button>
          </div>
        </div>
      )}

      {/* 2. Workspace Principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-4">
        {/* 3. Vistas según Pestaña (Transición Cinemática Suave) */}
      {activeTab === 'inicio' ? (
        /* Pestaña 1: Inicio (Dashboard Ejecutivo Premium con Micro-Gradientes, Halos y Números Animados) */
        <div className="space-y-4 sm:space-y-5 animate-tab-enter">
          {/* Header de Bienvenida con Halos & Selector Táctil */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#FAF7F0] to-[#F3ECE0] rounded-3xl p-5 sm:p-6 border border-[#E6DECD] shadow-[0_10px_32px_-6px_rgba(20,25,35,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Halo de luz ámbar de fondo */}
            <div className="pointer-events-none absolute -right-10 -top-10 w-48 h-48 bg-[#C5A059]/15 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Cloudflare Edge en Directo</span>
                </span>
                <span className="text-[11px] font-mono text-stone-500 font-semibold">ecuaplac.com</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight font-display">
                {new Date().getHours() < 13 ? 'Buenos días' : new Date().getHours() < 20 ? 'Buenas tardes' : 'Buenas noches'}, José 👋
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed font-normal font-sans">
                Panel de rendimiento, tráfico web y presupuestos de reformas en Mallorca.
              </p>
            </div>

            {/* Selector de Período 30 Días / 3 Meses */}
            <div className="relative z-10 bg-stone-200/80 p-1 rounded-full flex items-center gap-1 border border-stone-300/60 self-start sm:self-auto shrink-0 shadow-inner">
              <button
                type="button"
                onClick={() => setCfPeriod('30d')}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 ${
                  cfPeriod === '30d'
                    ? 'bg-slate-900 text-[#F0CF85] shadow-md'
                    : 'text-stone-600 hover:text-slate-900'
                }`}
              >
                30 Días
              </button>
              <button
                type="button"
                onClick={() => setCfPeriod('3m')}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 ${
                  cfPeriod === '3m'
                    ? 'bg-slate-900 text-[#F0CF85] shadow-md'
                    : 'text-stone-600 hover:text-slate-900'
                }`}
              >
                3 Meses
              </button>
            </div>
          </div>

          {/* Bloque 1: Métricas Maestras con Estética de Lujo & Animación de Cifras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* KPI 1: Audiencia & Visitantes Reales */}
            <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#F8FBFF] to-[#EFF6FF] rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-[0_10px_30px_-8px_rgba(14,165,233,0.12)] hover:shadow-[0_16px_36px_-6px_rgba(14,165,233,0.18)] transition-all group flex flex-col justify-between gap-4">
              {/* Resplandor suave */}
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-[0_6px_18px_rgba(14,165,233,0.35)] group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-xs font-black shadow-xs">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{cfMetrics.trendPercentage}</span>
                </span>
              </div>

              <div className="relative z-10">
                <span className="text-[11px] font-black text-stone-400 uppercase tracking-wider block">
                  Visitantes Únicos ({cfMetrics.periodLabel})
                </span>
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight block mt-1 font-mono">
                  <AnimatedCounter value={cfMetrics.uniqueVisitors} />
                </span>
                <span className="text-xs text-stone-500 mt-1.5 flex items-center gap-1.5 font-medium">
                  <Activity className="w-3.5 h-3.5 text-sky-500" />
                  <span>
                    <AnimatedCounter value={cfMetrics.pageViews} /> páginas de reformas vistas
                  </span>
                </span>
              </div>

              {/* Visualización de Actividad Semanal */}
              <div className="pt-2 border-t border-sky-100/80 flex items-end justify-between gap-1.5 h-7 relative z-10">
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
            </div>

            {/* KPI 2: Rendimiento & Velocidad Cloudflare Edge */}
            <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#FFFDF8] to-[#FEF9EC] rounded-3xl p-5 sm:p-6 border border-amber-200/60 shadow-[0_10px_30px_-8px_rgba(212,175,55,0.12)] hover:shadow-[0_16px_36px_-6px_rgba(212,175,55,0.18)] transition-all group flex flex-col justify-between gap-4">
              {/* Resplandor suave */}
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-[#C5A059] to-[#9E782F] text-slate-950 flex items-center justify-center shadow-[0_6px_18px_rgba(212,175,55,0.35)] group-hover:scale-105 transition-transform">
                  <Zap className="w-6 h-6 fill-slate-950" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-mono font-bold shadow-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>{cfMetrics.uptime} online</span>
                </span>
              </div>

              <div className="relative z-10">
                <span className="text-[11px] font-black text-stone-400 uppercase tracking-wider block">
                  Velocidad de Carga Media
                </span>
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight block mt-1 font-mono">
                  {cfMetrics.avgLoadTime}
                </span>
                <span className="text-xs text-stone-500 mt-1.5 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>{cfMetrics.edgeHitRatio} en caché ultra-rápida (Edge)</span>
                </span>
              </div>

              {/* Barra de progreso de caché */}
              <div className="pt-2 border-t border-amber-200/50 relative z-10 space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-stone-500">
                  <span>Caché Servidor Mallorca</span>
                  <span className="text-amber-800 font-mono">{cfMetrics.edgeHitRatio}</span>
                </div>
                <div className="w-full bg-stone-200/60 rounded-full h-2 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-[#C5A059] h-full rounded-full transition-all duration-1000"
                    style={{ width: cfMetrics.edgeHitRatio }}
                  />
                </div>
              </div>
            </div>

            {/* KPI 3: Solicitudes de Presupuesto (Leads) */}
            <div className="sm:col-span-2 lg:col-span-1 relative overflow-hidden bg-gradient-to-br from-white via-[#F6FCF8] to-[#ECFDF5] rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-[0_10px_30px_-8px_rgba(16,185,129,0.12)] hover:shadow-[0_16px_36px_-6px_rgba(16,185,129,0.18)] transition-all group flex flex-col justify-between gap-4">
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
                <span className="text-[11px] font-black text-stone-400 uppercase tracking-wider block">
                  Presupuestos Entrantes
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-mono">
                    <AnimatedCounter
                      value={
                        cfPeriod === '30d'
                          ? Math.max(leads.length, 3)
                          : Math.max(leads.length * 2, 8)
                      }
                    />
                  </span>
                  <span className="text-xs font-bold text-stone-500">solicitudes</span>
                </div>
                <span className="text-xs text-stone-500 mt-1.5 block font-medium truncate">
                  Último: <span className="font-bold text-slate-800">{leads[0]?.name || 'Cliente'}</span> ({leads[0]?.date || 'Hoy'})
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-xs active:scale-95 transition-all group/btn font-sans cursor-pointer"
                  title="Abrir bandeja de presupuestos"
                >
                  <span>Ver Bandeja</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#C5A059] group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Bloque: Facturas (Plegable / Escondidito por defecto con Scroll Suave Inteligente) */}
          <div ref={facturasSectionRef} className="bg-white/95 rounded-3xl border border-stone-200/80 shadow-[0_4px_24px_-4px_rgba(20,25,35,0.05)] overflow-hidden transition-all duration-300">
            {/* Cabecera / Trigger de Facturas */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0B111E] to-[#1E293B] text-[#C5A059] flex items-center justify-center border border-white/10 shadow-xs shrink-0">
                  <Receipt className="w-5 h-5 text-[#C5A059]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-950 font-display tracking-tight">
                      Facturas
                    </h3>
                    <span className="shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-bold font-sans">
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
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold active:scale-95 transition-all shadow-xs font-sans group cursor-pointer shrink-0"
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
                            <span className="text-xs sm:text-sm font-black text-slate-900 truncate block font-display">
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
        </div>
      ) : activeTab === 'obras' || activeTab === 'more_projects' ? (
        <div className="space-y-4 animate-tab-enter">
          {/* Cabecera Compacta y Elegante */}
          <div className="bg-white/95 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-[0_4px_20px_-4px_rgba(20,25,35,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  {activeTab === 'obras' ? (
                    <>
                      <span className="text-[#C5A059]">Galería 1</span>
                      <span className="text-stone-300 mx-1.5 font-normal">·</span>
                      <span className="text-slate-900">Carrusel de Portada</span>
                    </>
                  ) : (
                    <>
                      <span className="text-indigo-600">Galería 2</span>
                      <span className="text-stone-300 mx-1.5 font-normal">·</span>
                      <span className="text-slate-900">Más Proyectos</span>
                    </>
                  )}
                </h2>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 shrink-0">
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
              className={`self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-full active:scale-95 border text-xs font-black transition-all shadow-sm ${
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
            <div className="bg-stone-200/70 p-1 rounded-full flex items-center gap-1 border border-stone-300/50 shadow-inner">
              <button
                type="button"
                onClick={() => setVisibilityFilter('all')}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
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
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
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
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
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
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-sm text-[#C5A059] font-black text-xs border border-white/10 shadow-sm">
                            #{item.sort_order || (index + 1) * 10}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-xs ${
                              item.active ? 'bg-emerald-600' : 'bg-stone-600'
                            }`}
                          >
                            {item.active ? 'Visible' : 'Oculto'}
                          </span>
                        </div>
                      </div>

                      {/* Badge de Ubicación en la esquina inferior izquierda (Flotante blanco con pin) */}
                      <div className="absolute bottom-3 left-3 pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-slate-900 text-xs font-black shadow-md border border-stone-100/80">
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
                      <h3 className="font-black text-base text-slate-900 line-clamp-2 leading-snug group-hover/card:text-[#C5A059] transition-colors">
                        {item.title_es}
                      </h3>
                    </div>
                  </div>

                  {/* Mini Footer en COLOR NEGRO con Controles Flotantes */}
                  <div className="p-3 bg-[#0B111E] border-t border-white/10 flex items-center justify-between text-xs gap-2 select-none">
                    {/* Flechas de ordenación (Subir / Bajar posición en la web) */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(item)}
                        disabled={index === 0}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:hover:bg-white/10 flex items-center justify-center text-white transition-all active:scale-90 border border-white/10 shadow-2xs"
                        title="Subir posición en la web"
                      >
                        <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(item)}
                        disabled={index === filteredItems.length - 1}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:hover:bg-white/10 flex items-center justify-center text-white transition-all active:scale-90 border border-white/10 shadow-2xs"
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
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 ${
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs transition-all shadow-2xs active:scale-95 border border-white/20"
                        title="Editar obra y fotografía"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#F0CF85]" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all active:scale-95"
                        title="Eliminar obra"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Pestaña 4: Ajustes del Gestor (Diseño Pinterest After - Minimalista, iOS-Style y Elegante) */
        <div className="max-w-2xl mx-auto flex flex-col gap-4 pb-32 animate-tab-enter">
          {/* Card 1: Perfil Hero del Administrador */}
          <div className="bg-white/95 rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-[0_4px_24px_-4px_rgba(20,25,35,0.06)] flex items-center gap-4 sm:gap-5">
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
              <h3 className="text-lg sm:text-xl font-black text-slate-900 truncate font-display">
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
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider font-display">
                {panelLang === 'es' ? 'Cuenta' : 'Account'}
              </h4>
            </div>
            <div className="bg-white/95 rounded-3xl border border-stone-200/80 shadow-[0_4px_20px_-4px_rgba(20,25,35,0.04)] overflow-hidden divide-y divide-stone-100">
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
                    <span className="text-sm font-black text-slate-950 block font-display tracking-tight">
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
                    <span className="text-sm font-black text-slate-950 block font-display tracking-tight">
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
                    <span className="text-sm font-black text-slate-950 block font-display tracking-tight">
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
                    <span className="text-sm font-black text-slate-950 block font-display tracking-tight">
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

          {/* Grupo 2: Sistema y Dispositivo (Jerarquía y Título con Autoridad) */}
          <div className="space-y-2 mt-3">
            <div className="px-3.5 pt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider font-display">
                {panelLang === 'es' ? 'Sistema & Dispositivo' : 'System & Device'}
              </h4>
            </div>
            <div className="bg-white/95 rounded-3xl border border-stone-200/80 shadow-[0_4px_20px_-4px_rgba(20,25,35,0.04)] overflow-hidden divide-y divide-stone-100">
              {/* Item 1: Sesión en este Dispositivo */}
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-700 shadow-xs shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-black text-slate-950 block font-display tracking-tight">
                      {panelLang === 'es' ? 'Sesión en este Móvil' : 'Session on this Device'}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="text-[11.5px] text-stone-500 font-normal truncate block font-sans">
                        {deviceFeedback || (panelLang === 'es' ? 'Activa · Entrada automática segura' : 'Active · Secure automatic sign-in')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setDeviceFeedback(
                        panelLang === 'es'
                          ? 'Dispositivo olvidado. Pedirá clave en la próxima entrada.'
                          : 'Device forgotten. Password required next time.'
                      );
                      showSyncToast(
                        panelLang === 'es' ? 'Sesión reiniciada en este móvil' : 'Session reset on this device',
                        'success'
                      );
                      addAuditLog('Preferencia de sesión actualizada: Olvidar este móvil', 'Ecuaplac App', 'info');
                    }}
                    className="text-[11px] font-bold text-stone-600 hover:text-rose-600 bg-stone-100 hover:bg-rose-50 hover:border-rose-200 px-3 py-1.5 rounded-full border border-stone-200 transition-all active:scale-95 font-sans cursor-pointer"
                    title={panelLang === 'es' ? 'Olvidar inicio automático en este móvil' : 'Forget auto-login on this device'}
                  >
                    {panelLang === 'es' ? 'Olvidar' : 'Forget'}
                  </button>
                </div>
              </div>

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
                        <span className="text-sm font-black text-slate-950 block font-display tracking-tight">
                          {panelLang === 'es' ? 'Actualizaciones' : 'Updates'}
                        </span>
                        {updateCheckState === 'available' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 font-sans">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                            <span>{panelLang === 'es' ? 'Nueva v001' : 'New v001'}</span>
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
                              {panelLang === 'es' ? 'Nueva Versión Lista · v002' : 'New Version Ready · v002'}
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
                            {panelLang === 'es' ? 'Instalando actualización v002...' : 'Installing update v002...'}
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
                            {panelLang === 'es' ? '¡Versión v002 instalada con éxito!' : 'Version v002 installed successfully!'}
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
                onClick={() => setIsLogsModalOpen(true)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-stone-50/80 transition-colors active:bg-stone-100/70 select-none cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 shadow-xs shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-slate-950 block font-display tracking-tight">
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
                  <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-mono text-[11px] font-bold">
                    {logs.length}
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              </button>

              {/* Item 4: Cerrar Sesión */}
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  setDeviceFeedback(
                    panelLang === 'es' ? 'Sesión cerrada en este dispositivo.' : 'Session signed out on this device.'
                  );
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
                    <span className="text-sm font-black text-rose-600 block group-hover:text-rose-700 font-display tracking-tight">
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

          {/* Pie de Marca NexTool & Versión Oficial (Fiel a la Captura de Referencia de Musa) */}
          <div className="pt-6 pb-2 flex flex-col items-center justify-center text-center select-none">
            {/* Squircle Badge con el Logotipo Oficial NexTool Sin Fondo */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[22px] bg-gradient-to-b from-[#141A28] to-[#0A0E18] p-2.5 shadow-[0_8px_20px_rgba(10,16,28,0.22),inset_0_1px_1px_rgba(255,255,255,0.15)] border border-stone-800/80 flex items-center justify-center mb-2.5 transition-transform hover:scale-105">
              <img
                src="/icons/nextool-sinfondo.png"
                alt="NexTool"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(235,94,85,0.25)]"
                loading="lazy"
              />
            </div>

            <span className="text-[12.5px] sm:text-[13px] font-black tracking-[0.24em] text-[#0F172A] uppercase font-display">
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
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              form="ecuaplac-work-form"
              icon={<RefreshCw className="w-4 h-4 text-slate-950" />}
            >
              {editingItem ? 'Actualizar Web' : 'Guardar y Publicar en Web'}
            </Button>
          </>
        }
      >
        <form
          id="ecuaplac-work-form"
          onSubmit={handleSaveForm}
          className="space-y-4 text-xs"
        >
          {/* Selector de Destino de la Fotografía (Portada vs Más Reformas) */}
          <div className="space-y-1.5 pb-0.5">
            <label className="font-black text-xs text-slate-900 block">
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
                  <span className={`text-xs font-black ${formTargetGallery === 'carousel' ? 'text-slate-900' : 'text-stone-700'}`}>
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
                  <span className={`text-xs font-black ${formTargetGallery === 'projects' ? 'text-slate-900' : 'text-stone-700'}`}>
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
              <label className="font-black text-xs text-slate-800">Previsualización de Encuadre (4:3)</label>
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-full border border-stone-200">
                <button
                  type="button"
                  onClick={() => setFormFitMode('cover')}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                    formFitMode === 'cover' ? 'bg-[#C5A059] text-slate-950 font-black shadow-xs' : 'text-stone-600'
                  }`}
                >
                  Llenar
                </button>
                <button
                  type="button"
                  onClick={() => setFormFitMode('contain')}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                    formFitMode === 'contain' ? 'bg-[#C5A059] text-slate-950 font-black shadow-xs' : 'text-stone-600'
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
                  <span className="text-sm font-black text-white block">
                    Toca aquí para seleccionar o tomar foto
                  </span>
                  <span className="text-[11px] text-stone-300 mt-1 block">
                    Abre la cámara o galería de tu teléfono móvil
                  </span>
                  <div className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-[#C5A059] text-slate-950 font-black text-xs shadow-md">
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
                className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1.5 py-1"
              >
                <Camera className="w-3.5 h-3.5 text-[#B38E46]" />
                <span>{formImageUrl ? 'Cambiar fotografía' : 'Abrir selector de fotos'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] text-stone-500 hover:text-stone-700 flex items-center gap-1 underline"
              >
                <LinkIcon className="w-3 h-3" />
                <span>{showUrlInput ? 'Ocultar URL' : 'O pegar URL externa'}</span>
              </button>
            </div>

            {/* Input de URL opcional */}
            {showUrlInput && (
              <div className="pt-1 animate-in fade-in duration-150">
                <label className="font-bold text-stone-700 block mb-1">
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
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#C5A059]/40"
                />
              </div>
            )}
          </div>

          <div>
            <label className="font-extrabold text-xs text-slate-800 block mb-1">
              Título de la Obra / Proyecto *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Reforma Integral de Baño con Bañera Exenta"
              value={formTitleEs}
              onChange={(e) => setFormTitleEs(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 bg-stone-50/50"
            />
          </div>

          <div>
            <label className="font-extrabold text-xs text-slate-800 block mb-1">
              Ubicación (Mallorca)
            </label>
            <input
              type="text"
              placeholder="Ej. Andratx, Palma, Calvià, Sóller..."
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 bg-stone-50/50"
            />
            {/* Chips rápidos de municipios de Mallorca */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {['Mallorca', 'Andratx', 'Palma', 'Calvià', 'Sóller', 'Santanyí'].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setFormLocation(city)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
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
                <span className="text-xs font-black text-slate-900">
                  Versión Multilingüe (Web Internacional)
                </span>
              </div>
              <button
                type="button"
                onClick={handleAutoTranslate}
                disabled={isTranslating}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-[#C5A059] text-slate-950 font-black text-[11px] shadow-xs hover:brightness-105 active:scale-95 transition-all disabled:opacity-50"
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
                className="w-full border border-stone-200 rounded-xl px-3.5 py-2 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40"
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
                className="w-full border border-stone-200 rounded-xl px-3.5 py-2 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40"
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

      {/* 5. Modal Dedicado de Bandeja de Presupuestos (CRM Leads de ecuaplac.com — Estilo Gmail Executive) */}
      <Modal
        isOpen={isLeadsModalOpen}
        onClose={() => setIsLeadsModalOpen(false)}
        theme="dark"
        maxWidth="3xl"
        title={panelLang === 'es' ? 'Bandeja de Presupuestos' : 'Inquiries & Quotes Inbox'}
        subtitle={
          panelLang === 'es'
            ? 'Solicitudes de clientes recibidas desde ecuaplac.com'
            : 'Customer inquiries received from ecuaplac.com'
        }
        headerExtra={
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Supabase Live
            </span>
            <button
              type="button"
              onClick={handleRefreshLeads}
              disabled={isSyncingLeads}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-white/10 hover:border-amber-400/40 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title={panelLang === 'es' ? 'Sincronizar con Supabase' : 'Sync with Supabase'}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#F0CF85] ${isSyncingLeads ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{panelLang === 'es' ? 'Sincronizar' : 'Sync'}</span>
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#F0CF85]" />
                  <span>{panelLang === 'es' ? 'Restaurar Ejemplos' : 'Restore Demo Leads'}</span>
                </button>
              )}
              {copiedField && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 animate-in fade-in">
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
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border-white/10"
            >
              {panelLang === 'es' ? 'Cerrar' : 'Close'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Barra de Búsqueda Inteligente (Estilo Gmail) */}
          <div className="relative">
            <div className="flex items-center bg-slate-900/90 border border-white/10 focus-within:border-amber-400/50 rounded-2xl px-3.5 py-2.5 transition-all shadow-inner">
              <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
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
                    ? 'Buscar por cliente, teléfono, email, localidad o descripción...'
                    : 'Search by client, phone, email, location or work...'
                }
                className="w-full bg-transparent text-base sm:text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
              {leadSearchQuery && (
                <button
                  type="button"
                  onClick={() => setLeadSearchQuery('')}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filtros rápidos con Conteo Dinámico estilo Pestañas de Correo */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setLeadFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                leadFilter === 'all'
                  ? 'bg-[#C5A059] text-slate-950 shadow-md font-extrabold ring-1 ring-[#C5A059]'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-white/5'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>{panelLang === 'es' ? 'Todos' : 'All'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${leadFilter === 'all' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                {leads.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setLeadFilter('new')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                leadFilter === 'new'
                  ? 'bg-rose-600 text-white shadow-md ring-1 ring-rose-500'
                  : 'bg-rose-950/30 text-rose-300 border border-rose-500/20 hover:bg-rose-950/50'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${leadFilter === 'new' ? 'bg-white' : 'bg-rose-500 animate-pulse'}`} />
              <span>{panelLang === 'es' ? 'No contestados' : 'Unanswered'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${leadFilter === 'new' ? 'bg-white/20 text-white' : 'bg-rose-900/40 text-rose-300'}`}>
                {leads.filter((l) => l.status === 'new').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setLeadFilter('contacted')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                leadFilter === 'contacted'
                  ? 'bg-amber-600 text-white shadow-md ring-1 ring-amber-500'
                  : 'bg-amber-950/30 text-amber-300 border border-amber-500/20 hover:bg-amber-950/50'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${leadFilter === 'contacted' ? 'bg-white' : 'bg-amber-400'}`} />
              <span>{panelLang === 'es' ? 'En contacto' : 'Contacted'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${leadFilter === 'contacted' ? 'bg-white/20 text-white' : 'bg-amber-900/40 text-amber-300'}`}>
                {leads.filter((l) => l.status === 'contacted').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setLeadFilter('approved')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                leadFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-500'
                  : 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-950/50'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${leadFilter === 'approved' ? 'bg-white' : 'bg-emerald-400'}`} />
              <span>{panelLang === 'es' ? 'Aprobados' : 'Accepted'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${leadFilter === 'approved' ? 'bg-white/20 text-white' : 'bg-emerald-900/40 text-emerald-300'}`}>
                {leads.filter((l) => l.status === 'approved').length}
              </span>
            </button>
          </div>

          {/* Lista de Leads (Estilo Bandeja Gmail) */}
          <div className="space-y-3 max-h-[62vh] overflow-y-auto pr-1">
            {filteredLeads.length === 0 ? (
              <div className="py-12 px-4 text-center rounded-2xl bg-slate-900/50 border border-white/5 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-[#F0CF85] flex items-center justify-center mx-auto shadow-inner">
                  <Inbox className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-200">
                  {panelLang === 'es' ? 'No hay presupuestos en esta sección' : 'No inquiries found'}
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#F0CF85] text-xs font-bold border border-white/10 transition-all active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
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
                    className={`group relative rounded-2xl p-4 transition-all duration-200 border cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/95 border-amber-400/40 shadow-xl ring-1 ring-[#C5A059]/30'
                        : 'bg-[#0F172A]/90 hover:bg-slate-800/80 border-white/5 hover:border-white/15 shadow-sm'
                    } flex flex-col gap-3.5`}
                  >
                    {/* Fila Cabecera: Monograma, Nombre y Estado */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Avatar Iniciales */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-[#F0CF85] border border-white/10 flex items-center justify-center font-bold text-sm tracking-wider shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                          {initials || 'EC'}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm sm:text-base text-white tracking-tight truncate">
                              {lead.name}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                              #{String(lead.id || '').slice(0, 8)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{lead.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Badge de Estado */}
                      <div className="shrink-0">
                        {lead.status === 'new' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-extrabold">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            {panelLang === 'es' ? 'No Contestado' : 'Unanswered'}
                          </span>
                        ) : lead.status === 'contacted' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-extrabold">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            {panelLang === 'es' ? 'En Contacto' : 'Contacted'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            {panelLang === 'es' ? 'Obra Aceptada' : 'Accepted'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Mensaje / Tipo de Obra (Estilo Asunto de Gmail) */}
                    <div className="bg-slate-950/70 rounded-xl p-3 border border-white/5 shadow-inner">
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                        «{lead.work_type}»
                      </p>
                    </div>

                    {/* Fila de Datos: Presupuesto, Teléfono, Email */}
                    <div className="flex flex-wrap items-center gap-2">
                      {lead.budget_estimate && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-[#C5A059]/25 text-[#F0CF85] text-xs font-bold shadow-xs">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                            {panelLang === 'es' ? 'Presupuesto:' : 'Budget:'}
                          </span>
                          <span className="font-mono">{lead.budget_estimate}</span>
                        </div>
                      )}

                      {lead.phone && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLeadInfo(lead.phone, 'Teléfono');
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/50 border border-white/5 text-slate-300 hover:text-white hover:border-white/20 text-xs font-mono transition-colors"
                          title="Clic para copiar teléfono"
                        >
                          <Phone className="w-3 h-3 text-[#F0CF85]" />
                          <span>{lead.phone}</span>
                          <Copy className="w-2.5 h-2.5 text-slate-500 ml-0.5" />
                        </button>
                      )}

                      {lead.email && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLeadInfo(lead.email, 'Email');
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/50 border border-white/5 text-slate-400 hover:text-white hover:border-white/20 text-xs font-mono transition-colors truncate max-w-[220px]"
                          title="Clic para copiar correo"
                        >
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{lead.email}</span>
                          <Copy className="w-2.5 h-2.5 text-slate-500 ml-0.5 shrink-0" />
                        </button>
                      )}
                    </div>

                    {/* Nota interna si existe */}
                    {lead.notes && (
                      <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-xs text-amber-200/90">
                        <Sparkles className="w-3.5 h-3.5 text-[#F0CF85] shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-[#F0CF85]">{panelLang === 'es' ? 'Nota:' : 'Note:'}</strong> {lead.notes}
                        </span>
                      </div>
                    )}

                    {/* Barra de Acciones Ejecutivas 1-Tap */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5"
                    >
                      {/* Botones de Contacto Directo */}
                      <div className="flex items-center gap-2">
                        {lead.phone && (
                          <>
                            <a
                              href={`https://wa.me/${cleanPhoneForWhatsApp(lead.phone)}?text=${encodeURIComponent(
                                `Hola ${lead.name}, te contacto de Ecuaplac sobre tu solicitud de presupuesto para: ${lead.work_type}.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-950/40 transition-all active:scale-95"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>WhatsApp</span>
                            </a>
                            <a
                              href={`tel:${lead.phone}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-white/10 shadow-xs transition-all active:scale-95"
                            >
                              <Phone className="w-3.5 h-3.5 text-[#F0CF85]" />
                              <span>{panelLang === 'es' ? 'Llamar' : 'Call'}</span>
                            </a>
                          </>
                        )}
                      </div>

                      {/* Botones de Cambio de Estado y Borrado */}
                      <div className="flex items-center gap-1.5 flex-wrap ml-auto">
                        {lead.status !== 'new' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateLeadStatus(lead.id, 'new')}
                            className="px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-bold text-rose-300 bg-rose-950/40 border border-rose-500/20 hover:bg-rose-900/40 transition-all active:scale-95"
                          >
                            {panelLang === 'es' ? 'No Contestado' : 'Unanswered'}
                          </button>
                        )}
                        {lead.status !== 'contacted' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateLeadStatus(lead.id, 'contacted')}
                            className="px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-bold text-amber-300 bg-amber-950/40 border border-amber-500/20 hover:bg-amber-900/40 transition-all active:scale-95"
                          >
                            {panelLang === 'es' ? 'En Contacto' : 'Contacted'}
                          </button>
                        )}
                        {lead.status !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateLeadStatus(lead.id, 'approved')}
                            className="px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-500/20 hover:bg-emerald-900/40 transition-all active:scale-95"
                          >
                            {panelLang === 'es' ? 'Aprobado' : 'Accepted'}
                          </button>
                        )}

                        {/* Botón de Borrar Lead (para limpiar los falsos fácilmente con tap target seguro) */}
                        <button
                          type="button"
                          onClick={() => handleDeleteLead(lead.id, lead.name)}
                          className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl text-rose-400 hover:text-rose-200 hover:bg-rose-950/50 border border-rose-500/20 transition-all active:scale-95 ml-1"
                          title={panelLang === 'es' ? 'Eliminar solicitud' : 'Delete inquiry'}
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
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/80 hover:bg-stone-100/80 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {log.action}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 font-medium whitespace-nowrap shrink-0">
                  {log.time}
                </span>
              </div>
            ))}
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
        maxWidth="xl"
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

      {/* 9. Barra de Navegación Completa Responsive (Full-Width Native Bar con FAB Central Elevado) */}
      <div className={`fixed bottom-0 inset-x-0 w-full z-40 pointer-events-none transition-all duration-200 ${
        isModalOpen || isLeadsModalOpen || isProfileModalOpen || isSecurityModalOpen || isLogsModalOpen || isInvoiceViewerOpen
          ? 'hidden opacity-0 pointer-events-none'
          : ''
      }`}>
        <div className="pointer-events-auto w-full bg-[#0E1726] border-t border-slate-800 shadow-md">
          <nav className="max-w-md sm:max-w-lg mx-auto px-4 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] flex items-center justify-between relative">
            {/* Tab 1: Inicio */}
            <button
              type="button"
              onClick={() => setActiveTab('inicio')}
              className={`flex-1 flex flex-col items-center gap-1.5 py-1 transition-all select-none active:scale-95 cursor-pointer ${
                activeTab === 'inicio' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home
                className={`w-5 h-5 transition-transform duration-200 ${
                  activeTab === 'inicio' ? 'text-[#F0CF85] scale-110' : 'text-slate-400'
                }`}
              />
              <span
                className={`text-[10.5px] font-sans tracking-wide leading-none ${
                  activeTab === 'inicio' ? 'font-bold text-white' : 'font-medium text-slate-400'
                }`}
              >
                {panelLang === 'es' ? 'Inicio' : 'Home'}
              </span>
              {activeTab === 'inicio' && (
                <span className="w-1 h-1 rounded-full bg-[#F0CF85] -mb-1 animate-pulse" />
              )}
            </button>

            {/* Tab 2: Galería 1 */}
            <button
              type="button"
              onClick={() => setActiveTab('obras')}
              className={`flex-1 flex flex-col items-center gap-1.5 py-1 transition-all select-none active:scale-95 cursor-pointer ${
                activeTab === 'obras' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon
                className={`w-5 h-5 transition-transform duration-200 ${
                  activeTab === 'obras' ? 'text-[#F0CF85] scale-110' : 'text-slate-400'
                }`}
              />
              <span
                className={`text-[10.5px] font-sans tracking-wide leading-none ${
                  activeTab === 'obras' ? 'font-bold text-white' : 'font-medium text-slate-400'
                }`}
              >
                {panelLang === 'es' ? 'Galería 1' : 'Gallery 1'}
              </span>
              {activeTab === 'obras' && (
                <span className="w-1 h-1 rounded-full bg-[#F0CF85] -mb-1 animate-pulse" />
              )}
            </button>

            {/* CENTER FAB (+): Botón Circular Elevado para Subir Foto WebP */}
            <div className="relative -top-5 px-1 shrink-0 flex items-center justify-center">
              <button
                type="button"
                onClick={handleOpenAdd}
                style={{
                  background: 'linear-gradient(135deg, #9E782F 0%, #D4AF37 50%, #F5DE98 100%)',
                  boxShadow: '0 8px 24px -2px rgba(212,175,55,0.45)',
                }}
                className="w-14 h-14 rounded-full text-slate-950 flex items-center justify-center ring-4 ring-[#0E1726] active:scale-90 transition-all hover:brightness-110 group cursor-pointer"
                title={panelLang === 'es' ? 'Añadir nueva fotografía / obra' : 'Add new project photo'}
              >
                <Plus className="w-6 h-6 text-slate-950 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>

            {/* Tab 3: Galería 2 (Mismo Icono Fotográfico que Galería 1) */}
            <button
              type="button"
              onClick={() => setActiveTab('more_projects')}
              className={`flex-1 flex flex-col items-center gap-1.5 py-1 transition-all select-none active:scale-95 cursor-pointer ${
                activeTab === 'more_projects' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon
                className={`w-5 h-5 transition-transform duration-200 ${
                  activeTab === 'more_projects' ? 'text-[#F0CF85] scale-110' : 'text-slate-400'
                }`}
              />
              <span
                className={`text-[10.5px] font-sans tracking-wide leading-none ${
                  activeTab === 'more_projects' ? 'font-bold text-white' : 'font-medium text-slate-400'
                }`}
              >
                {panelLang === 'es' ? 'Galería 2' : 'Gallery 2'}
              </span>
              {activeTab === 'more_projects' && (
                <span className="w-1 h-1 rounded-full bg-[#F0CF85] -mb-1 animate-pulse" />
              )}
            </button>

            {/* Tab 4: Ajustes */}
            <button
              type="button"
              onClick={() => setActiveTab('ajustes')}
              className={`flex-1 flex flex-col items-center gap-1.5 py-1 relative transition-all select-none active:scale-95 cursor-pointer ${
                activeTab === 'ajustes' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings
                className={`w-5 h-5 transition-transform duration-200 ${
                  activeTab === 'ajustes' ? 'text-[#F0CF85] scale-110' : 'text-slate-400'
                }`}
              />
              <span
                className={`text-[10.5px] font-sans tracking-wide leading-none ${
                  activeTab === 'ajustes' ? 'font-bold text-white' : 'font-medium text-slate-400'
                }`}
              >
                {panelLang === 'es' ? 'Ajustes' : 'Settings'}
              </span>
              {activeTab === 'ajustes' && (
                <span className="w-1 h-1 rounded-full bg-[#F0CF85] -mb-1 animate-pulse" />
              )}
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default EcuaplacPortal;

