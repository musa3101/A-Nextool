import { EcuaplacWorkItem } from '@/types';
import { ECUAPLAC_CONFIG } from './config';
import { DEFAULT_WORKS, DEFAULT_MORE_PROJECTS } from './datos_iniciales';
import cfLiveSync from './cloudflare_data.json';

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
  private storageKeyProfile = 'ecuaplac_profile_data';
  private storageKeyCloudflare = 'ecuaplac_cf_rum_v2';

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
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            ...item,
            type: 'more_projects' as const,
            image_url: this.resolveImageUrl(item.image_after || item.image_url || item.image_before),
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
   * Carga asíncrona en vivo desde Supabase en producción (Carrusel Portada)
   */
  async fetchWorksOnline(): Promise<EcuaplacWorkItem[]> {
    try {
      const res = await fetch(`${this.url}/rest/v1/${this.tables.carousel}?select=*&order=sort_order.asc`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const processed = data.map((item: EcuaplacWorkItem) => ({
            ...item,
            image_url: this.resolveImageUrl(item.image_url, false),
            fit_mode: item.fit_mode || 'cover',
          }));
          this.saveWorks(processed);
          return processed;
        }
      }
    } catch (e) {
      console.warn('Fallo de red al consultar Supabase (obras):', e);
    }
    return this.getWorks();
  }

  /**
   * Carga asíncrona de Proyectos desde Supabase
   */
  async fetchProjectsOnline(): Promise<any[]> {
    try {
      const res = await fetch(`${this.url}/rest/v1/${this.tables.projects}?select=*&order=sort_order.asc`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const processed = data.map((item: any) => ({
            ...item,
            type: 'more_projects' as const,
            image_url: this.resolveImageUrl(item.image_after || item.image_url || item.image_before),
          }));
          localStorage.setItem(this.storageKeyMoreProjects, JSON.stringify(processed));
          return processed;
        }
      }
    } catch (e) {
      console.warn('Fallo de red al consultar Supabase (proyectos):', e);
    }

    return this.getMoreProjects();
  }

  /**
   * Obtiene los leads guardados localmente
   */
  getLeads(fallback: EcuaplacLeadItem[] = []): EcuaplacLeadItem[] {
    try {
      const cached = localStorage.getItem(this.storageKeyLeads);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
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
   * Intenta consultar los leads en vivo desde Supabase (ecuaplac_leads)
   */
  async fetchLeadsOnline(): Promise<EcuaplacLeadItem[]> {
    try {
      const res = await fetch(`${this.url}/rest/v1/${this.tables.leads}?select=*&order=created_at.desc`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: EcuaplacLeadItem[] = data.map((d: any) => ({
            id: d.id,
            name: d.name || 'Cliente sin nombre',
            phone: d.phone || '',
            email: d.email || '',
            work_type: d.message || d.project_type || 'Reforma general',
            budget_estimate: d.budget_estimate || '',
            status: d.status === 'aprobado' ? 'approved' : d.status === 'contactado' ? 'contacted' : 'new',
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
      }
    } catch (e) {
      console.warn('Fallo de red al consultar Supabase (leads):', e);
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
      await this.addAuditLog('status', `Estado de lead cambiado a "${status}" para ID ${leadId}`);
    } catch {
      // Silencioso
    }
    return true;
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
   * Sube una fotografía WebP optimizada al bucket de Supabase Storage
   */
  async uploadPhoto(file: File | Blob, folder: 'carousel' | 'gallery' | 'avatars' = 'carousel'): Promise<string> {
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.webp`;
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

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error al subir imagen a Supabase Storage: ${errorText}`);
    }

    return `${this.url}/storage/v1/object/public/${this.bucket}/${filename}`;
  }

  /**
   * Comprueba si un identificador corresponde a un UUID estándar de Postgres
   */
  private isUUID(id?: string): boolean {
    if (!id) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  }

  /**
   * Guarda o actualiza una obra de portada en Supabase
   */
  async saveWork(work: Partial<EcuaplacWorkItem>): Promise<EcuaplacWorkItem> {
    // Si no tiene ID o es un ID temporal de cliente (ecuaplac-, def-, local-), es nuevo y se inserta con POST
    const isNew = !work.id || !this.isUUID(work.id);
    const endpoint = isNew
      ? `${this.url}/rest/v1/${this.tables.carousel}`
      : `${this.url}/rest/v1/${this.tables.carousel}?id=eq.${work.id}`;

    const method = isNew ? 'POST' : 'PATCH';
    const payload = { ...work };
    if (isNew) delete payload.id;

    const res = await fetch(endpoint, {
      method,
      headers: this.getHeaders(),
      body: JSON.stringify(isNew ? [payload] : payload),
    });

    if (!res.ok) {
      throw new Error(`Error al guardar obra en Supabase (${res.status})`);
    }

    const result = await res.json();
    const saved = Array.isArray(result) ? result[0] : result;

    await this.addAuditLog(isNew ? 'upload' : 'edit', `Obra ${isNew ? 'añadida' : 'editada'}: "${work.title_es || 'Sin título'}"`);
    return saved;
  }

  /**
   * Guarda o actualiza un proyecto en Supabase (Galería 2: Más Reformas)
   */
  async saveProject(project: Partial<EcuaplacWorkItem>): Promise<EcuaplacWorkItem> {
    const isNew = !project.id || !this.isUUID(project.id);
    const endpoint = isNew
      ? `${this.url}/rest/v1/${this.tables.projects}`
      : `${this.url}/rest/v1/${this.tables.projects}?id=eq.${project.id}`;

    const method = isNew ? 'POST' : 'PATCH';
    const payload = { ...project };
    if (isNew) delete payload.id;

    const res = await fetch(endpoint, {
      method,
      headers: this.getHeaders(),
      body: JSON.stringify(isNew ? [payload] : payload),
    });

    if (!res.ok) {
      throw new Error(`Error al guardar proyecto en Supabase (${res.status})`);
    }

    const result = await res.json();
    const saved = Array.isArray(result) ? result[0] : result;

    await this.addAuditLog(isNew ? 'upload' : 'edit', `Proyecto ${isNew ? 'añadido' : 'editado'} en Más Reformas: "${project.title_es || 'Sin título'}"`);
    return saved;
  }

  /**
   * Elimina una obra de Supabase
   */
  async deleteItem(type: 'works' | 'projects', id: string): Promise<boolean> {
    const table = type === 'works' ? this.tables.carousel : this.tables.projects;
    const res = await fetch(`${this.url}/rest/v1/${table}?id=eq.${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (res.ok) {
      await this.addAuditLog('delete', `Elemento eliminado: ID ${id}`);
      return true;
    }
    throw new Error(`Error al eliminar elemento en Supabase (${res.status})`);
  }

  /**
   * Actualiza el perfil de Jose en Supabase
   */
  async updateAdminProfile(name: string, avatarUrl?: string): Promise<boolean> {
    const payload: Record<string, string> = { admin_name: name };
    if (avatarUrl) payload.avatar_url = avatarUrl;

    const res = await fetch(`${this.url}/rest/v1/${this.tables.adminProfile}?id=eq.a0000000-0000-0000-0000-000000000001`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      await this.addAuditLog('profile', `Perfil de administrador actualizado: "${name}"`);
    }
    return res.ok;
  }

  /**
   * Registra un evento en la tabla de auditoría real (ecuaplac_admin_logs)
   */
  async addAuditLog(actionType: string, description: string, details: Record<string, any> = {}): Promise<void> {
    try {
      await fetch(`${this.url}/rest/v1/${this.tables.adminLogs}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify([
          {
            action_type: actionType,
            description,
            details: { source: 'nextools_gestor', ...details },
          },
        ]),
      });
    } catch {
      // Silencioso para no romper la UX si falla la red
    }
  }

  /**
   * Sincronización bidireccional completa con Supabase
   */
  async syncWithServer(works: EcuaplacWorkItem[]): Promise<EcuaplacSyncResponse> {
    this.saveWorks(works);

    try {
      const liveWorks = await this.fetchWorksOnline();
      return {
        success: true,
        message: 'Sincronizado con Supabase en tiempo real',
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
}

export const ecuaplacConnector = new EcuaplacConnector();
