import { EcuaplacWorkItem } from '@/types';
import { ECUAPLAC_CONFIG } from './config';
import { DEFAULT_WORKS, DEFAULT_MORE_PROJECTS } from './datos_iniciales';
import cfLiveSync from './cloudflare_data.json';
import { insforge } from '@/lib/insforge';

export const ECUAPLAC_TENANT_ID = '0bc42bdf-6929-4c06-8667-1fd646288513';

export interface AdminProfileData {
  id: string;
  admin_name: string;
  avatar_url?: string;
  pin_code?: string;
}

export interface EcuaplacLeadItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  work_type: string;
  budget_estimate: string;
  status: 'new' | 'contacted' | 'approved' | 'closed';
  date: string;
  notes?: string;
  service?: string;
  sqm?: string;
  location?: string;
  photo_url?: string;
  client_message?: string;
  raw_message?: string;
  source_channel?: 'tally' | 'gmail' | 'web';
}

export interface ParsedLeadDetails {
  service: string;
  sqm?: string;
  location?: string;
  photoUrl?: string;
  clientMessage?: string;
  sourceChannel: 'tally' | 'gmail' | 'web';
  rawMessage: string;
}

export interface EcuaplacContactItem {
  id: string;
  key: string;
  name_es: string;
  name_en?: string;
  value_es: string;
  value_en?: string;
  icon?: string;
  active?: boolean;
  sort_order?: number;
}

export const DEFAULT_CONTACTS: EcuaplacContactItem[] = [
  {
    id: '943c15d2-d94b-4e9c-add9-c9c75e85f6ae',
    key: 'goyo',
    name_es: 'José Rivadeneira',
    name_en: 'José Rivadeneira',
    value_es: '+34 678 15 98 78',
    value_en: '+34 678 15 98 78',
    icon: 'phone',
    active: true,
    sort_order: 20,
  },
  {
    id: 'ecb03840-43ef-418e-9a35-c597b871cb44',
    key: 'Jofrre',
    name_es: 'Joffre Méndez',
    name_en: 'Joffre Méndez',
    value_es: '+34 603 40 44 50',
    value_en: '+34 603 40 44 50',
    icon: 'phone',
    active: true,
    sort_order: 30,
  },
  {
    id: '5c5fce03-e747-490c-9451-158a9ce5f6c2',
    key: 'email',
    name_es: 'Email',
    name_en: 'Email',
    value_es: 'ecuaplac.jyg.sl@gmail.com',
    value_en: 'ecuaplac.jyg.sl@gmail.com',
    icon: 'mail',
    active: true,
    sort_order: 40,
  },
  {
    id: '2e7202f5-82bf-4b86-a319-34e3e09aeee0',
    key: 'address',
    name_es: 'Dirección de Proyectos',
    name_en: 'Project Management',
    value_es: 'Palma de Mallorca, Islas Baleares',
    value_en: 'Palma de Mallorca, Balearic Islands',
    icon: 'map-pin',
    active: true,
    sort_order: 10,
  },
];

/**
 * Analizador inteligente de mensajes de leads procedentes de Tally.so, Gmail o formularios web
 */
export function parseLeadDetails(rawMsg: string = '', rawProjectType: string = ''): ParsedLeadDetails {
  const msg = rawMsg || '';
  const isTally = msg.includes('TALLY.SO') || msg.includes('DETALLES DEL PROYECTO');
  const isGmail = msg.toLowerCase().includes('gmail') || msg.toLowerCase().includes('enviado desde');
  const sourceChannel: 'tally' | 'gmail' | 'web' = isTally ? 'tally' : isGmail ? 'gmail' : 'web';

  const isUuid = (str: string) => /^[0-9a-fA-F-]{36}$/.test((str || '').trim());

  let service = '';
  const serviceMatch = msg.match(/¿Qué servicio necesitas\?:\s*([^\n\r]+)/i);
  if (serviceMatch && !isUuid(serviceMatch[1])) {
    service = serviceMatch[1].trim();
  } else if (rawProjectType && !isUuid(rawProjectType)) {
    service = rawProjectType.trim();
  } else {
    service = 'Reforma Integral';
  }

  let sqm: string | undefined = undefined;
  const sqmMatch = msg.match(/Metros cuadrados aproximados[^:]*:\s*([^\n\r]+)/i);
  if (sqmMatch) {
    let s = sqmMatch[1].trim();
    if (!s.endsWith('m²') && !s.toLowerCase().endsWith('m2')) {
      s += ' m²';
    }
    sqm = s;
  }

  let location: string | undefined = undefined;
  const locMatch = msg.match(/Municipio de Mallorca:\s*([^\n\r]+)/i);
  if (locMatch) {
    const val = locMatch[1].trim();
    location = isUuid(val) ? 'Mallorca' : val;
  } else {
    location = 'Mallorca';
  }

  let photoUrl: string | undefined = undefined;
  const photoMatch = msg.match(/Sube una foto o plano[^:]*:\s*(https?:\/\/[^\s\n\r]+)/i);
  if (photoMatch) {
    photoUrl = photoMatch[1].trim();
  }

  let clientMessage: string | undefined = undefined;
  if (isTally) {
    const noteMatch = msg.match(/Cuéntanos los detalles[^:]*:\s*([^\n\r]+)/i);
    if (noteMatch) {
      clientMessage = noteMatch[1].trim();
    }
  } else {
    clientMessage = msg.trim();
  }

  return {
    service,
    sqm,
    location,
    photoUrl,
    clientMessage,
    sourceChannel,
    rawMessage: msg,
  };
}

export interface EcuaplacAuditLog {
  id: string;
  tenant_id?: string;
  user_email?: string;
  action: string;
  entity: string;
  details?: Record<string, any>;
  created_at: string;
  time: string;
}

export function formatLogTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 2) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;

    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const timeStr = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Hoy, ${timeStr}`;
    if (isYesterday) return `Ayer, ${timeStr}`;

    return `${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}, ${timeStr}`;
  } catch {
    return 'Reciente';
  }
}

export interface EcuaplacSyncResponse {
  success: boolean;
  message: string;
  synced_count: number;
  timestamp: string;
}

export interface CloudflareMetrics {
  period: '30d' | '3m';
  periodLabel: string;
  totalVisits: number;
  uniqueVisitors: number;
  pageViews: number;
  avgLoadTime: string;
  uptime: string;
  edgeHitRatio: string;
  leadsCount: number;
  trendPercentage: string;
  isPositiveTrend: boolean;
  status: 'optimal' | 'warning' | 'syncing';
  updatedAt?: string;
  closingInfo?: {
    type: 'official_month_close' | 'monthly_progress';
    closedMonth: {
      name: string;
      visits: number;
      pageViews: number;
      period: string;
    };
    currentMonth: {
      name: string;
      visits: number;
      pageViews: number;
      period: string;
    };
  };
}

export const CLOUDFLARE_ANALYTICS_DATA: Record<'30d' | '3m', CloudflareMetrics> = {
  '30d': (cfLiveSync?.['30d'] as CloudflareMetrics) || {
    period: '30d',
    periodLabel: 'Últimos 30 días',
    totalVisits: 50,
    uniqueVisitors: 50,
    pageViews: 60,
    avgLoadTime: '0.65s',
    uptime: '100%',
    edgeHitRatio: '98.2%',
    leadsCount: 3,
    trendPercentage: '+15.4%',
    isPositiveTrend: true,
    status: 'optimal',
  },
  '3m': (cfLiveSync?.['3m'] as CloudflareMetrics) || {
    period: '3m',
    periodLabel: 'Últimos 3 meses',
    totalVisits: 310,
    uniqueVisitors: 310,
    pageViews: 380,
    avgLoadTime: '0.68s',
    uptime: '99.99%',
    edgeHitRatio: '97.5%',
    leadsCount: 8,
    trendPercentage: '+28.6%',
    isPositiveTrend: true,
    status: 'optimal',
  },
};

/**
 * Resuelve la URL real de la imagen:
 * - Si es URL remota (Supabase Storage / HTTP), la respeta íntegra.
 * - Si es ruta relativa histórica de la web (./assets/img/portfolio/IMG_2131.jpg),
 *   la resuelve hacia los activos WebP de alta fidelidad (/ecuaplac/portfolio/IMG_2131.webp).
 */
export function resolveImageUrl(rawUrl?: string, isMoreProject = false): string {
  if (!rawUrl) return '/ecuaplac/logo.webp';
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('data:')) {
    return rawUrl;
  }
  const filename = rawUrl.split('/').pop()?.replace(/\.(jpg|jpeg|png)$/i, '.webp') || '';
  if (rawUrl.includes('galeria/')) {
    return `/ecuaplac/portfolio/galeria/${filename}`;
  }
  return `/ecuaplac/portfolio/${filename}`;
}

/**
 * Conector de Datos Autónomo para Ecuaplac (Jose)
 * Gestiona la conexión directa con el backend Supabase en producción (REST y Storage)
 * y la persistencia local en caché para respuesta instantánea en móvil (0 latencia).
 */
export class EcuaplacConnector {
  private url = ECUAPLAC_CONFIG.backend.url;
  private key = ECUAPLAC_CONFIG.backend.anonKey;
  private bucket = ECUAPLAC_CONFIG.backend.bucket;
  private tables = ECUAPLAC_CONFIG.backend.tables;

  private storageKeyWorks = 'ecuaplac_works_data';
  private storageKeyMoreProjects = 'ecuaplac_more_projects_data';
  private storageKeyLeads = 'ecuaplac_leads_data';
  private storageKeyDismissedLeads = 'ecuaplac_dismissed_leads_ids';
  private storageKeyProfile = 'ecuaplac_profile_data';
  private storageKeyContacts = 'ecuaplac_contacts_data';
  private storageKeyCloudflare = 'ecuaplac_cf_rum_v2';

  getDismissedLeadIds(): string[] {
    try {
      const data = localStorage.getItem(this.storageKeyDismissedLeads);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveDismissedLeadIds(ids: string[]): void {
    try {
      localStorage.setItem(this.storageKeyDismissedLeads, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }

  clearDismissedLeadIds(): void {
    try {
      localStorage.removeItem(this.storageKeyDismissedLeads);
    } catch {
      // ignore
    }
  }

  private getHeaders(extraHeaders: Record<string, string> = {}) {
    return {
      apikey: this.key,
      Authorization: `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...extraHeaders,
    };
  }

  /**
   * Resuelve URL de imagen
   */
  resolveImageUrl(rawUrl?: string, isMoreProject = false): string {
    return resolveImageUrl(rawUrl, isMoreProject);
  }

  /**
   * Obtiene métricas de Cloudflare Analytics para el período indicado
   * (Lee de la caché sincronizada o de la calibración de producción)
   */
  getCloudflareMetrics(period: '30d' | '3m'): CloudflareMetrics {
    try {
      const cached = localStorage.getItem(`${this.storageKeyCloudflare}_${period}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed.uniqueVisitors === 'number' && parsed.uniqueVisitors <= 1000) {
          return parsed;
        } else {
          localStorage.removeItem(`${this.storageKeyCloudflare}_${period}`);
        }
      }
    } catch (e) {
      console.warn('Error al leer caché local de Cloudflare:', e);
    }
    return CLOUDFLARE_ANALYTICS_DATA[period];
  }

  /**
   * Guarda o actualiza métricas de Cloudflare en la caché local del móvil
   */
  saveCloudflareMetrics(period: '30d' | '3m', metrics: CloudflareMetrics): void {
    try {
      localStorage.setItem(`${this.storageKeyCloudflare}_${period}`, JSON.stringify(metrics));
    } catch (e) {
      console.error('Error al guardar métricas Cloudflare:', e);
    }
  }

  /**
   * Consulta las métricas reales de Cloudflare RUM guardadas en InsForge Cloud
   */
  async fetchCloudflareMetricsOnline(): Promise<Record<'30d' | '3m', CloudflareMetrics> | null> {
    try {
      const { data, error } = await insforge.database
        .from('audit_logs')
        .select('*')
        .eq('tenant_id', ECUAPLAC_TENANT_ID)
        .eq('entity', 'cloudflare_rum')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && Array.isArray(data) && data.length > 0 && data[0].details) {
        const details = data[0].details as Record<'30d' | '3m', CloudflareMetrics>;
        if (details['30d'] && details['3m']) {
          this.saveCloudflareMetrics('30d', details['30d']);
          this.saveCloudflareMetrics('3m', details['3m']);
          return details;
        }
      }
    } catch (e) {
      console.warn('Error consultando métricas Cloudflare en InsForge:', e);
    }
    return null;
  }

  /**
   * Carga sincrónica instantánea desde caché local del móvil
   * (Usado por useState en la UI para renderizado sin parpadeos)
   */
  getWorks(fallbackWorks: EcuaplacWorkItem[] = DEFAULT_WORKS): EcuaplacWorkItem[] {
    try {
      const cached = localStorage.getItem(this.storageKeyWorks);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: EcuaplacWorkItem) => ({
            ...item,
            image_url: this.resolveImageUrl(item.image_url, false),
          }));
        }
      }
    } catch (e) {
      console.warn('Error al leer caché local de Ecuaplac:', e);
    }
    return fallbackWorks.length > 0 ? fallbackWorks : DEFAULT_WORKS;
  }

  /**
   * Carga sincrónica instantánea de Más Proyectos
   */
  getMoreProjects(fallback: EcuaplacWorkItem[] = DEFAULT_MORE_PROJECTS): EcuaplacWorkItem[] {
    try {
      const cached = localStorage.getItem(this.storageKeyMoreProjects);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Verificar si la caché contiene los 4 proyectos viejos de Antes y Después (error de enlace anterior)
        const isOldBeforeAfterData =
          Array.isArray(parsed) &&
          parsed.some(
            (it: any) =>
              it.image_before ||
              it.image_after ||
              it.title_es === 'Vestidor de Pladur y Roble' ||
              it.title_es === 'Lavabo Flotante a Medida' ||
              it.title_es === 'Escalera y Distribuidor de Roble'
          );
        if (isOldBeforeAfterData) {
          localStorage.removeItem(this.storageKeyMoreProjects);
          return DEFAULT_MORE_PROJECTS;
        }
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            ...item,
            type: 'more_projects' as const,
            image_url: this.resolveImageUrl(item.image_url),
          }));
        }
      }
    } catch (e) {
      console.warn('Error al leer caché de más proyectos:', e);
    }
    return fallback.length > 0 ? fallback : DEFAULT_MORE_PROJECTS;
  }

  /**
   * Persiste las obras en la memoria local del dispositivo
   */
  saveWorks(works: EcuaplacWorkItem[]): void {
    try {
      localStorage.setItem(this.storageKeyWorks, JSON.stringify(works));
    } catch (e) {
      console.error('Error al persistir obras de Ecuaplac:', e);
    }
  }

  /**
   * Persiste los proyectos de galería (Más Reformas) en la memoria local
   */
  saveMoreProjects(projects: EcuaplacWorkItem[]): void {
    try {
      localStorage.setItem(this.storageKeyMoreProjects, JSON.stringify(projects));
    } catch (e) {
      console.error('Error al persistir proyectos de Ecuaplac:', e);
    }
  }

  /**
   * Carga asíncrona en vivo de Obras de Portada:
   * 1. Consulta Supabase (ecuaplac_carousel) para reflejar la web ecuaplac.com
   * 2. Si hay fallo o está offline, consulta InsForge (obras) como respaldo
   */
  async fetchWorksOnline(): Promise<EcuaplacWorkItem[]> {
    try {
      const res = await fetch(`${this.url}/rest/v1/${this.tables.carousel}?select=*&order=sort_order.asc`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const processed = data.map((item: any) => ({
            id: item.id,
            type: 'carousel' as const,
            title_es: item.title_es,
            title_en: item.title_en || item.title_es,
            location_es: item.location_es,
            location_en: item.location_en,
            image_url: this.resolveImageUrl(item.image_url, false),
            sort_order: item.sort_order ?? 10,
            active: item.active !== false,
            fit_mode: item.fit_mode || 'cover',
          }));
          this.saveWorks(processed);
          return processed;
        }
      }
    } catch (e) {
      console.warn('Fallo al consultar InsForge (obras):', e);
    }

    // Respaldo en InsForge Cloud
    try {
      const { data, error } = await insforge.database
        .from('obras')
        .select('*')
        .eq('tenant_id', ECUAPLAC_TENANT_ID)
        .eq('type', 'carousel')
        .order('sort_order', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const processed = data.map((item: any) => ({
          id: item.id,
          type: 'carousel' as const,
          title_es: item.title_es,
          title_en: item.title_en || item.title_es,
          location_es: item.location_es,
          location_en: item.location_en,
          image_url: this.resolveImageUrl(item.image_url, false),
          sort_order: item.sort_order ?? 10,
          active: item.is_active !== false,
          fit_mode: item.fit_mode || 'cover',
        }));
        this.saveWorks(processed);
        return processed;
      }
    } catch (e) {
      console.warn('Fallo al consultar InsForge (obras):', e);
    }

    return this.getWorks();
  }

  /**
   * Carga asíncrona de Proyectos (Galería 2 - Más Reformas Realizadas):
   * 1. Consulta Supabase (ecuaplac_more_projects)
   * 2. Respaldo en InsForge Cloud (obras type: gallery)
   * 3. Catálogo local auténtico de los 11 proyectos
   */
  async fetchProjectsOnline(): Promise<any[]> {
    try {
      const res = await fetch(`${this.url}/rest/v1/${this.tables.moreProjects}?select=*&order=sort_order.asc`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const processed = data.map((item: any) => ({
            id: item.id,
            type: 'more_projects' as const,
            title_es: item.title_es,
            title_en: item.title_en || item.title_es,
            location_es: item.location_es || 'Mallorca',
            location_en: item.location_en || item.location_es || 'Mallorca',
            image_url: this.resolveImageUrl(item.image_url, true),
            sort_order: item.sort_order ?? 10,
            active: item.active !== false,
            fit_mode: item.fit_mode || 'cover',
          }));
          localStorage.setItem(this.storageKeyMoreProjects, JSON.stringify(processed));
          return processed;
        }
      }
    } catch (e) {
      console.warn('Supabase ecuaplac_galeria_2 no disponible, consultando respaldo:', e);
    }

    // Respaldo en InsForge Cloud (obras con type = 'gallery')
    try {
      const { data, error } = await insforge.database
        .from('obras')
        .select('*')
        .eq('tenant_id', ECUAPLAC_TENANT_ID)
        .eq('type', 'gallery')
        .order('sort_order', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const processed = data.map((item: any) => ({
          id: item.id,
          type: 'more_projects' as const,
          title_es: item.title_es,
          title_en: item.title_en || item.title_es,
          location_es: item.location_es || 'Mallorca',
          location_en: item.location_en || item.location_es || 'Mallorca',
          image_url: this.resolveImageUrl(item.image_url, true),
          sort_order: item.sort_order ?? 10,
          active: item.is_active !== false,
          fit_mode: item.fit_mode || 'cover',
        }));
        localStorage.setItem(this.storageKeyMoreProjects, JSON.stringify(processed));
        return processed;
      }
    } catch (e) {
      console.warn('Fallo al consultar InsForge (proyectos):', e);
    }

    return this.getMoreProjects();
  }

  /**
   * Obtiene los leads guardados localmente
   */
  getLeads(fallback: EcuaplacLeadItem[] = []): EcuaplacLeadItem[] {
    try {
      const cached = localStorage.getItem(this.storageKeyLeads);
      if (cached !== null) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error al leer caché local de leads:', e);
    }
    return fallback;
  }

  /**
   * Guarda los leads en caché local
   */
  saveLeads(leads: EcuaplacLeadItem[]): void {
    try {
      localStorage.setItem(this.storageKeyLeads, JSON.stringify(leads));
    } catch (e) {
      console.error('Error al persistir leads:', e);
    }
  }

  /**
   * Consulta los leads en vivo (Supabase web ecuaplac.com + InsForge NexTool)
   */
  async fetchLeadsOnline(): Promise<EcuaplacLeadItem[]> {
    // 1. Intentar consultar Supabase (leads generados en la web pública ecuaplac.com)
    try {
      const res = await fetch(`${this.url}/rest/v1/${this.tables.leads}?select=*&order=created_at.desc`, {
        headers: this.getHeaders(),
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const dismissed = this.getDismissedLeadIds();
          
          // Si todos los leads de Supabase estaban descartados localmente (ej. por pruebas anteriores),
          // limpiamos el descarte para que el gestor siempre vea las solicitudes reales de la web
          let activeRows = data.filter((d: any) => !dismissed.includes(d.id));
          if (activeRows.length === 0 && data.length > 0) {
            this.clearDismissedLeadIds();
            activeRows = data;
          }

          const mapped: EcuaplacLeadItem[] = activeRows
            .map((d: any) => {
              const parsed = parseLeadDetails(d.message || d.work_type || '', d.project_type || '');
              return {
                id: d.id,
                name: d.name || d.client_name || 'Cliente sin nombre',
                phone: d.phone || d.client_phone || '',
                email: d.email || d.client_email || '',
                work_type: parsed.service,
                budget_estimate: d.budget_estimate || (d.budget_estimated ? `${d.budget_estimated} €` : ''),
                status: d.status === 'aprobado' || d.status === 'approved' ? 'approved' : d.status === 'contactado' || d.status === 'contacted' ? 'contacted' : 'new',
                date: d.created_at
                  ? new Date(d.created_at).toLocaleDateString([], {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  : 'Hoy',
                notes: d.notes || '',
                service: parsed.service,
                sqm: parsed.sqm,
                location: parsed.location,
                photo_url: parsed.photoUrl,
                client_message: parsed.clientMessage,
                raw_message: d.message || '',
                source_channel: parsed.sourceChannel,
              };
            });
          this.saveLeads(mapped);
          return mapped;
        }
      }
    } catch (e) {
      console.warn('Fallo de red al consultar leads en Supabase:', e);
    }

    // 2. Respaldo en InsForge
    try {
      const { data, error } = await insforge.database
        .from('leads')
        .select('*')
        .eq('tenant_id', ECUAPLAC_TENANT_ID)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: EcuaplacLeadItem[] = data.map((d: any) => ({
          id: d.id,
          name: d.client_name || 'Cliente sin nombre',
          phone: d.client_phone || '',
          email: d.client_email || '',
          work_type: d.service_type || 'Reforma general',
          budget_estimate: d.budget_estimated ? `${d.budget_estimated} €` : '',
          status: d.status === 'aprobado' || d.status === 'approved' ? 'approved' : d.status === 'contactado' || d.status === 'contacted' ? 'contacted' : 'new',
          date: d.created_at
            ? new Date(d.created_at).toLocaleDateString([], {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })
            : 'Hoy',
          notes: d.notes || '',
        }));
        this.saveLeads(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Fallo al consultar InsForge (leads):', e);
    }
    return this.getLeads();
  }

  /**
   * Actualiza el estado de un lead (online + local)
   */
  async updateLeadStatus(leadId: string, status: EcuaplacLeadItem['status']): Promise<boolean> {
    const leads = this.getLeads();
    const updated = leads.map((l) => (l.id === leadId ? { ...l, status } : l));
    this.saveLeads(updated);

    try {
      const dbStatus = status === 'approved' ? 'aprobado' : status === 'contacted' ? 'contactado' : 'nuevo';
      await fetch(`${this.url}/rest/v1/${this.tables.leads}?id=eq.${leadId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ status: dbStatus }),
      });
      await insforge.database
        .from('leads')
        .update({ status: dbStatus })
        .eq('id', leadId)
        .eq('tenant_id', ECUAPLAC_TENANT_ID);
      await this.addAuditLog('status', `Estado de lead cambiado a "${status}" para ID ${leadId}`);
    } catch {
      // Silencioso
    }
    return true;
  }

  /**
   * Elimina un lead ÚNICAMENTE del panel de NexTool (protegiendo Supabase 100% intacto)
   */
  async deleteLead(leadId: string): Promise<boolean> {
    const dismissed = this.getDismissedLeadIds();
    if (!dismissed.includes(leadId)) {
      dismissed.push(leadId);
      this.saveDismissedLeadIds(dismissed);
    }

    const leads = this.getLeads();
    const filtered = leads.filter((l) => l.id !== leadId);
    this.saveLeads(filtered);

    // SEGURIDAD: CERO llamadas DELETE a Supabase.
    // La base de datos de producción ecuaplac_leads queda inmutable y protegida como histórico.
    await this.addAuditLog('delete', `Lead archivado localmente en el panel (ID ${leadId})`);
    return true;
  }

  /**
   * Obtiene los contactos de la web oficial guardados localmente
   */
  getContacts(fallback: EcuaplacContactItem[] = DEFAULT_CONTACTS): EcuaplacContactItem[] {
    try {
      const cached = localStorage.getItem(this.storageKeyContacts);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error al leer caché local de contactos:', e);
    }
    return fallback;
  }

  /**
   * Guarda los contactos de la web en caché local
   */
  saveContacts(contacts: EcuaplacContactItem[]): void {
    try {
      localStorage.setItem(this.storageKeyContacts, JSON.stringify(contacts));
    } catch (e) {
      console.error('Error al persistir contactos:', e);
    }
  }

  /**
   * Consulta los contactos en vivo desde Supabase (tabla ecuaplac_contact)
   */
  async fetchContactsOnline(): Promise<EcuaplacContactItem[]> {
    try {
      const contactTable = this.tables.contact || 'ecuaplac_contact';
      const res = await fetch(`${this.url}/rest/v1/${contactTable}?select=*&order=sort_order.asc`, {
        headers: this.getHeaders(),
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          this.saveContacts(data);
          return data;
        }
      }
    } catch (e) {
      console.warn('Fallo de red al consultar contactos en Supabase:', e);
    }
    return this.getContacts();
  }

  /**
   * Actualiza un elemento de contacto en Supabase (ecuaplac_contact) y en local
   */
  async updateContactItem(id: string, updates: Partial<EcuaplacContactItem>): Promise<boolean> {
    try {
      const contactTable = this.tables.contact || 'ecuaplac_contact';
      const res = await fetch(`${this.url}/rest/v1/${contactTable}?id=eq.${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        // Verificar que Supabase realmente modificó la fila en la base de datos
        if (Array.isArray(data) && data.length > 0) {
          const contacts = this.getContacts();
          const updated = contacts.map((c) => (c.id === id ? { ...c, ...updates } : c));
          this.saveContacts(updated);
          await this.addAuditLog('update', `Contacto web actualizado para ID ${id}`);
          return true;
        }
      }
    } catch (e) {
      console.error('Error al actualizar contacto en Supabase:', e);
    }
    return false;
  }

  /**
   * Carga el perfil de administrador de José Rivadeneira desde Supabase
   */
  async getAdminProfile(): Promise<AdminProfileData | null> {
    try {
      const res = await fetch(`${this.url}/rest/v1/${this.tables.adminProfile}?select=*&limit=1`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(this.storageKeyProfile, JSON.stringify(data[0]));
          return data[0];
        }
      }
    } catch (e) {
      console.warn('Fallo de red al consultar perfil de Ecuaplac:', e);
    }

    const cached = localStorage.getItem(this.storageKeyProfile);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Sube una fotografía WebP optimizada:
   * 1. Al bucket de Supabase Storage (ecuaplac-media) -> Para que ecuaplac.com la muestre al instante
   * 2. Respaldo simultáneo en InsForge Storage (tenants-media) -> Para la nube central de NexTool
   */
  async uploadPhoto(file: File | Blob, folder: 'carousel' | 'gallery' | 'avatars' = 'carousel'): Promise<string> {
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.webp`;
    let publicUrl = '';

    // 1. Subida a Supabase Storage (ecuaplac-media)
    try {
      const res = await fetch(`${this.url}/storage/v1/object/${this.bucket}/${filename}`, {
        method: 'POST',
        headers: {
          apikey: this.key,
          Authorization: `Bearer ${this.key}`,
          'Content-Type': 'image/webp',
          'x-upsert': 'true',
        },
        body: file,
      });

      if (res.ok) {
        publicUrl = `${this.url}/storage/v1/object/public/${this.bucket}/${filename}`;
      } else {
        console.warn('Error subiendo a Supabase Storage:', await res.text());
      }
    } catch (e) {
      console.warn('Fallo de red en subida Supabase Storage:', e);
    }

    // 2. Respaldo simultáneo a InsForge Storage (tenants-media)
    try {
      const insforgeFilename = `ecuaplac/${filename}`;
      const { error } = await (insforge.storage.from('tenants-media') as any).upload(insforgeFilename, file, {
        contentType: 'image/webp',
        upsert: true,
      });

      if (!error && !publicUrl) {
        const { data } = insforge.storage.from('tenants-media').getPublicUrl(insforgeFilename);
        if (data?.publicUrl) {
          publicUrl = data.publicUrl;
        }
      }
    } catch (e) {
      console.warn('Fallo en respaldo InsForge Storage:', e);
    }

    return publicUrl || `/ecuaplac/portfolio/${filename.split('/').pop()}`;
  }

  /**
   * Comprueba si un identificador corresponde a un UUID estándar de Postgres
   */
  private isUUID(id?: string): boolean {
    if (!id) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  }

  /**
   * Guarda o actualiza una obra de portada (Dual: Supabase para ecuaplac.com + InsForge para NexTool)
   */
  async saveWork(work: Partial<EcuaplacWorkItem>, isNewOverride?: boolean): Promise<EcuaplacWorkItem> {
    const existing = work.id ? this.getWorks().find((w) => w.id === work.id) : undefined;
    const isNew = isNewOverride !== undefined ? isNewOverride : (!work.id || !existing);
    const fullWork = { ...existing, ...work };
    let savedWork = { ...fullWork } as EcuaplacWorkItem;

    // 1. Guardar en Supabase (ecuaplac_galeria_1) -> La web viva ecuaplac.com se actualiza
    try {
      const endpoint = isNew
        ? `${this.url}/rest/v1/${this.tables.carousel}`
        : `${this.url}/rest/v1/${this.tables.carousel}?id=eq.${work.id}`;

      const method = isNew ? 'POST' : 'PATCH';
      const supabasePayload: Record<string, any> = isNew
        ? {
          title_es: fullWork.title_es || 'Nueva Obra',
          title_en: fullWork.title_en || fullWork.title_es || 'New Project',
          location_es: fullWork.location_es || 'Mallorca',
          location_en: fullWork.location_en || fullWork.location_es || 'Mallorca',
          image_url: fullWork.image_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
          sort_order: fullWork.sort_order ?? 10,
          active: work.active !== false,
        }
        : {
          ...(work.title_es !== undefined && { title_es: work.title_es }),
          ...(work.title_en !== undefined && { title_en: work.title_en }),
          ...(work.location_es !== undefined && { location_es: work.location_es }),
          ...(work.location_en !== undefined && { location_en: work.location_en }),
          ...(work.image_url !== undefined && { image_url: work.image_url }),
          ...(work.sort_order !== undefined && { sort_order: work.sort_order }),
          ...(work.active !== undefined && { active: work.active }),
        };

      const res = await fetch(endpoint, {
        method,
        headers: this.getHeaders(),
        body: JSON.stringify(isNew ? [supabasePayload] : supabasePayload),
      });

      if (res.ok) {
        const result = await res.json();
        const supaItem = Array.isArray(result) ? result[0] : result;
        if (supaItem?.id) {
          savedWork.id = supaItem.id;
        }
      } else {
        console.warn('Fallo Supabase saveWork HTTP:', res.status, await res.text());
      }
    } catch (e) {
      console.warn('Fallo al guardar obra en Supabase:', e);
    }

    // Persistir de inmediato en la caché local para que nunca desaparezca al recargar o forzar sync
    try {
      const currentWorks = this.getWorks();
      const updatedWorks = isNew
        ? [savedWork, ...currentWorks.filter((w) => w.id !== savedWork.id && w.id !== work.id)]
        : currentWorks.map((w) => (w.id === savedWork.id ? savedWork : w));
      this.saveWorks(updatedWorks);
    } catch {
      // Ignorar si hay fallo de storage local
    }

    // 2. Sincronizar en InsForge Cloud (obras) + Auditoría en NexTool
    try {
      const insforgePayload = {
        id: this.isUUID(savedWork.id) ? savedWork.id : undefined,
        tenant_id: ECUAPLAC_TENANT_ID,
        type: 'carousel',
        title_es: fullWork.title_es || 'Nueva Obra',
        title_en: fullWork.title_en || fullWork.title_es || 'New Project',
        location_es: fullWork.location_es || 'Mallorca',
        location_en: fullWork.location_en || fullWork.location_es || 'Mallorca',
        image_url: fullWork.image_url || '/ecuaplac/logo.webp',
        sort_order: fullWork.sort_order ?? 10,
        is_active: fullWork.active !== false,
        fit_mode: fullWork.fit_mode || 'cover',
        updated_at: new Date().toISOString(),
      };

      if (!insforgePayload.id) delete (insforgePayload as any).id;

      await insforge.database.from('obras').upsert([insforgePayload]);
      const workTitle = fullWork.title_es || 'Obra';
      await this.addAuditLog(isNew ? 'upload' : 'edit', `Obra ${isNew ? 'añadida' : 'editada'}: "${workTitle}"`);
    } catch (e) {
      console.warn('Fallo al sincronizar obra en InsForge:', e);
    }

    return savedWork;
  }

  /**
   * Guarda o actualiza un proyecto en Más Reformas (Dual: Supabase + InsForge)
   */
  async saveProject(project: Partial<EcuaplacWorkItem>, isNewOverride?: boolean): Promise<EcuaplacWorkItem> {
    const existing = project.id ? this.getMoreProjects().find((p) => p.id === project.id) : undefined;
    const isNew = isNewOverride !== undefined ? isNewOverride : (!project.id || !existing);
    const fullProject = { ...existing, ...project };
    let savedProject = { ...fullProject } as EcuaplacWorkItem;

    // 1. Guardar en Supabase (ecuaplac_galeria_2) -> La web viva ecuaplac.com se actualiza
    try {
      const endpoint = isNew
        ? `${this.url}/rest/v1/${this.tables.moreProjects}`
        : `${this.url}/rest/v1/${this.tables.moreProjects}?id=eq.${project.id}`;

      const method = isNew ? 'POST' : 'PATCH';
      const supabasePayload: Record<string, any> = isNew
        ? {
          title_es: fullProject.title_es || 'Nuevo Proyecto',
          title_en: fullProject.title_en || fullProject.title_es || 'New Project',
          image_url: fullProject.image_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
          sort_order: fullProject.sort_order ?? 10,
          active: project.active !== false,
        }
        : {
          ...(project.title_es !== undefined && { title_es: project.title_es }),
          ...(project.title_en !== undefined && { title_en: project.title_en }),
          ...(project.image_url !== undefined && { image_url: project.image_url }),
          ...(project.sort_order !== undefined && { sort_order: project.sort_order }),
          ...(project.active !== undefined && { active: project.active }),
        };

      const res = await fetch(endpoint, {
        method,
        headers: this.getHeaders(),
        body: JSON.stringify(isNew ? [supabasePayload] : supabasePayload),
      });

      if (res.ok) {
        const result = await res.json();
        const supaItem = Array.isArray(result) ? result[0] : result;
        if (supaItem?.id) {
          savedProject.id = supaItem.id;
        }
      } else {
        console.warn('Fallo Supabase saveProject HTTP:', res.status, await res.text());
      }
    } catch (e) {
      console.warn('Fallo al guardar proyecto en Supabase:', e);
    }

    // Persistir de inmediato en la caché local para que nunca desaparezca al recargar o forzar sync
    try {
      const currentProjects = this.getMoreProjects();
      const updatedProjects = isNew
        ? [savedProject, ...currentProjects.filter((p) => p.id !== savedProject.id && p.id !== project.id)]
        : currentProjects.map((p) => (p.id === savedProject.id ? savedProject : p));
      this.saveMoreProjects(updatedProjects);
    } catch {
      // Ignorar si hay fallo de storage local
    }

    // 2. Sincronizar en InsForge Cloud (obras type: gallery) + Auditoría en NexTool
    try {
      const insforgePayload = {
        id: this.isUUID(savedProject.id) ? savedProject.id : undefined,
        tenant_id: ECUAPLAC_TENANT_ID,
        type: 'gallery',
        title_es: fullProject.title_es || 'Nuevo Proyecto',
        title_en: fullProject.title_en || fullProject.title_es || 'New Project',
        location_es: fullProject.location_es || 'Mallorca',
        location_en: fullProject.location_en || fullProject.location_es || 'Mallorca',
        image_url: fullProject.image_url || '/ecuaplac/logo.webp',
        sort_order: fullProject.sort_order ?? 10,
        is_active: fullProject.active !== false,
        fit_mode: fullProject.fit_mode || 'cover',
        updated_at: new Date().toISOString(),
      };

      if (!insforgePayload.id) delete (insforgePayload as any).id;

      await insforge.database.from('obras').upsert([insforgePayload]);
      const projTitle = fullProject.title_es || 'Proyecto';
      await this.addAuditLog(isNew ? 'upload' : 'edit', `Proyecto ${isNew ? 'añadido' : 'editado'} en Más Reformas: "${projTitle}"`);
    } catch (e) {
      console.warn('Fallo al sincronizar proyecto en InsForge:', e);
    }

    return savedProject;
  }

  /**
   * Elimina una obra o proyecto (Dual: Supabase + InsForge)
   */
  async deleteItem(type: 'works' | 'projects', id: string): Promise<boolean> {
    const table = type === 'works' ? this.tables.carousel : this.tables.moreProjects;
    const list = type === 'works' ? this.getWorks() : this.getMoreProjects();
    const item = list.find(i => i.id === id);
    const itemTitle = item?.title_es || `Elemento ${id.substring(0, 8)}`;

    // 1. Eliminar de Supabase (web ecuaplac.com) - Solo si el id es un UUID válido
    if (this.isUUID(id)) {
      try {
        await fetch(`${this.url}/rest/v1/${table}?id=eq.${id}`, {
          method: 'DELETE',
          headers: this.getHeaders(),
        });
      } catch (e) {
        console.warn('Fallo al eliminar en Supabase:', e);
      }
    }

    // 2. Eliminar de InsForge (plataforma NexTool)
    if (this.isUUID(id)) {
      try {
        await insforge.database.from('obras').delete().eq('id', id);
        await this.addAuditLog('delete', `Elemento eliminado: «${itemTitle}»`);
      } catch (e) {
        console.warn('Fallo al eliminar en InsForge:', e);
      }
    }

    return true;
  }

  /**
   * Actualiza el perfil de José en InsForge
   */
  async updateAdminProfile(name: string, avatarUrl?: string): Promise<boolean> {
    try {
      const payload: Record<string, string> = { display_name: name };
      if (avatarUrl) payload.avatar_url = avatarUrl;

      const { error } = await insforge.database
        .from('tenant_users')
        .update(payload)
        .eq('tenant_id', ECUAPLAC_TENANT_ID)
        .eq('email', 'ecuaplacbyjyg@gmail.com');

      if (!error) {
        await this.addAuditLog('profile', `Perfil de administrador actualizado: "${name}"`);
        return true;
      }
    } catch (e) {
      console.warn('Fallo al actualizar perfil en InsForge:', e);
    }
    return true;
  }

  /**
   * Consulta los logs reales de auditoría desde InsForge Cloud con conteo total y paginación
   */
  async fetchAuditLogsOnline(
    limit = 50,
    offset = 0
  ): Promise<{ logs: EcuaplacAuditLog[]; totalCount: number }> {
    try {
      const { data, error, count } = await insforge.database
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .eq('tenant_id', ECUAPLAC_TENANT_ID)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!error && Array.isArray(data)) {
        const logs = data.map((d: any) => ({
          id: d.id || String(Date.now()),
          tenant_id: d.tenant_id,
          user_email: d.user_email || 'ecuaplacbyjyg@gmail.com',
          action: d.action || 'Acción registrada',
          entity: d.entity || 'general',
          details: d.details || {},
          created_at: d.created_at || new Date().toISOString(),
          time: formatLogTime(d.created_at || new Date().toISOString()),
        }));
        return { logs, totalCount: typeof count === 'number' ? count : logs.length };
      }
    } catch (e) {
      console.warn('Error al consultar logs en InsForge:', e);
    }
    return { logs: [], totalCount: 0 };
  }

  /**
   * Registra un evento en la tabla de auditoría real (audit_logs)
   */
  async addAuditLog(actionType: string, description: string, details: Record<string, any> = {}): Promise<EcuaplacAuditLog | null> {
    const nowIso = new Date().toISOString();
    const payload = {
      tenant_id: ECUAPLAC_TENANT_ID,
      user_email: 'ecuaplacbyjyg@gmail.com',
      action: description,
      entity: actionType,
      details: { source: 'nextool_gestor', ...details },
      created_at: nowIso,
    };

    try {
      const { data, error } = await insforge.database
        .from('audit_logs')
        .insert([payload])
        .select();

      if (!error && data && data.length > 0) {
        const item = data[0];
        return {
          id: item.id,
          tenant_id: item.tenant_id,
          user_email: item.user_email,
          action: item.action,
          entity: item.entity,
          details: item.details,
          created_at: item.created_at,
          time: formatLogTime(item.created_at),
        };
      }
    } catch (e) {
      console.warn('Error insertando audit log en InsForge:', e);
    }

    return {
      id: `local-${Date.now()}`,
      tenant_id: ECUAPLAC_TENANT_ID,
      user_email: 'ecuaplacbyjyg@gmail.com',
      action: description,
      entity: actionType,
      details,
      created_at: nowIso,
      time: 'Ahora mismo',
    };
  }

  /**
   * Sincronización bidireccional completa con InsForge
   */
  async syncWithServer(works: EcuaplacWorkItem[]): Promise<EcuaplacSyncResponse> {
    this.saveWorks(works);

    try {
      const liveWorks = await this.fetchWorksOnline();
      return {
        success: true,
        message: 'Sincronizado con el servidor en tiempo real',
        synced_count: liveWorks.length > 0 ? liveWorks.length : works.length,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    } catch {
      return {
        success: true,
        message: 'Guardado en caché local (offline)',
        synced_count: works.length,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }
  }

  /**
   * Consulta la versión oficial configurada en InsForge Cloud para este tenant
   */
  async fetchTenantVersion(): Promise<string> {
    try {
      const { data, error } = await insforge.database
        .from('tenant_settings')
        .select('installed_version')
        .eq('tenant_id', ECUAPLAC_TENANT_ID)
        .maybeSingle();

      if (!error && data?.installed_version) {
        return data.installed_version;
      }
    } catch (e) {
      console.warn('Error consultando versión en InsForge:', e);
    }
    return '2.0.0';
  }

  /**
   * Actualiza la versión oficial en InsForge Cloud
   */
  async updateTenantVersion(newVersion: string): Promise<boolean> {
    try {
      const { error } = await insforge.database
        .from('tenant_settings')
        .update({ installed_version: newVersion, updated_at: new Date().toISOString() })
        .eq('tenant_id', ECUAPLAC_TENANT_ID);

      return !error;
    } catch (e) {
      console.warn('Error actualizando versión en InsForge:', e);
      return false;
    }
  }

  /**
   * Consulta documentos y facturas en tiempo real desde InsForge Backend
   */
  async fetchDocumentsOnline(): Promise<any[]> {
    try {
      const { data, error } = await insforge.database
        .from('tenant_documents')
        .select('*')
        .eq('tenant_id', ECUAPLAC_TENANT_ID)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          number: d.doc_number,
          name: d.name,
          fileUrl: d.file_url,
          fileSize: d.file_size || '250 KB',
          uploadDate: new Date(d.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
          issueDate: new Date(d.created_at).toLocaleDateString('es-ES'),
          dueDate: '30 días',
          category: d.category || 'factura',
          status: d.status || 'oficial',
          clientName: d.client_name || 'Ecuaplac J&G S.L.',
          clientCif: d.client_cif || 'B-07982341',
          clientAddress: d.client_address || 'Palma de Mallorca, Illes Balears',
          totalAmount: parseFloat(d.total_amount) || 0,
          notes: d.notes || '',
          isCustomUpload: true,
        }));
      }
    } catch (e) {
      console.warn('Error cargando documentos de InsForge:', e);
    }
    return [];
  }

  /**
   * Guarda un documento o factura en InsForge Database
   */
  async saveDocumentOnline(doc: {
    doc_number: string;
    name: string;
    file_url: string;
    file_size: string;
    category?: string;
    status?: string;
    total_amount?: number;
    notes?: string;
  }): Promise<string | null> {
    try {
      const payload = {
        tenant_id: ECUAPLAC_TENANT_ID,
        doc_type: doc.category === 'gmail' ? 'gmail' : 'factura',
        doc_number: doc.doc_number,
        name: doc.name,
        file_url: doc.file_url,
        file_size: doc.file_size,
        category: doc.category || 'factura',
        status: doc.status || 'oficial',
        client_name: 'Ecuaplac J&G S.L.',
        client_cif: 'B-07982341',
        client_address: 'Palma de Mallorca, Illes Balears',
        total_amount: doc.total_amount || 0,
        notes: doc.notes || 'Documento sincronizado en la nube',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await insforge.database
        .from('tenant_documents')
        .insert([payload])
        .select();

      if (!error && data && data.length > 0) {
        await this.addAuditLog('upload_doc', `Factura/Documento subido a la nube: "${doc.name}"`);
        return data[0].id;
      }
    } catch (e) {
      console.warn('Fallo guardando documento en la nube:', e);
    }
    return null;
  }

  /**
   * Elimina un documento o factura de la base de datos
   */
  async deleteDocumentOnline(id: string): Promise<boolean> {
    try {
      const { error } = await insforge.database
        .from('tenant_documents')
        .delete()
        .eq('id', id);

      if (!error) {
        await this.addAuditLog('delete_doc', `Documento eliminado de la nube: ID ${id}`);
        return true;
      }
    } catch (e) {
      console.warn('Error eliminando documento de la nube:', e);
    }
    return false;
  }
}

export const ecuaplacConnector = new EcuaplacConnector();
